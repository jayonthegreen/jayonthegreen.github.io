import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { sendTelegramMessage } from '../src/utils/telegram';
import {
  fetchSP500Data,
  fetchMacroIndicators,
  fetchPERatio,
  fetchFearGreedIndex,
  calculateMovingAverage,
  MacroIndicators,
  ValuationIndicators,
  SentimentIndicators,
  SPData
} from './lib/market-data';

dotenv.config();

// ==================== Types ====================

interface IndicatorScore {
  name: string;
  value: number | string | null;
  rawScore: number;
  weight: number;
}

interface LayerScore {
  name: string;
  weight: number;
  indicators: IndicatorScore[];
  layerScore: number;
}

interface ThermometerResult {
  date: string;
  layers: LayerScore[];
  totalScore: number;
  recommendedCashPercent: number;
  riskLevel: 'Opportunity' | 'Growth' | 'Neutral' | 'Caution' | 'Danger';
  riskLevelKr: string;
}

// ==================== Scoring Functions ====================

function scoreMacroLayer(macro: MacroIndicators): LayerScore {
  const indicators: IndicatorScore[] = [];

  // 1. Real Rate (FFR - CPI) - Weight 30% within layer
  let realRateScore = 0;
  if (macro.realRate !== null) {
    if (macro.realRate > 2.0) {
      realRateScore = -1.0;
    } else if (macro.realRate >= 0) {
      realRateScore = 0.0;
    } else {
      realRateScore = +1.0;
    }
  }
  indicators.push({
    name: 'Real Rate (FFR - CPI)',
    value: macro.realRate !== null ? `${macro.realRate.toFixed(2)}%` : 'N/A',
    rawScore: realRateScore,
    weight: 0.30
  });

  // 2. M2 YoY - Weight 25% within layer
  let m2YoYScore = 0;
  if (macro.m2YoY !== null) {
    m2YoYScore = macro.m2YoY < 0 ? -0.8 : +0.8;
  }
  indicators.push({
    name: 'M2 Money Supply YoY',
    value: macro.m2YoY !== null ? `${macro.m2YoY.toFixed(2)}%` : 'N/A',
    rawScore: m2YoYScore,
    weight: 0.25
  });

  // 3. M2 MoM - Weight 25% within layer
  let m2MoMScore = 0;
  if (macro.m2MoM !== null) {
    m2MoMScore = macro.m2MoM < 0 ? -0.8 : +0.8;
  }
  indicators.push({
    name: 'M2 Money Supply MoM',
    value: macro.m2MoM !== null ? `${macro.m2MoM.toFixed(2)}%` : 'N/A',
    rawScore: m2MoMScore,
    weight: 0.25
  });

  // 4. Consumer Sentiment Index - Weight 20% within layer
  // UMCSENT typically ranges 50-110, historical avg ~85-90
  let sentimentScore = 0;
  if (macro.consumerSentiment !== null) {
    // >85 = optimistic, <70 = pessimistic
    if (macro.consumerSentiment >= 85) {
      sentimentScore = +0.5;
    } else if (macro.consumerSentiment < 70) {
      sentimentScore = -0.5;
    } else {
      sentimentScore = 0;  // Neutral range 70-85
    }
  }
  indicators.push({
    name: 'Consumer Sentiment Index',
    value: macro.consumerSentiment !== null ? macro.consumerSentiment.toFixed(1) : 'N/A',
    rawScore: sentimentScore,
    weight: 0.20
  });

  // Calculate layer score
  const layerScore = indicators.reduce((sum, ind) => sum + (ind.rawScore * ind.weight), 0);

  return {
    name: 'Macro Regime',
    weight: 0.40,
    indicators,
    layerScore
  };
}

function scoreValuationLayer(valuation: ValuationIndicators): LayerScore {
  const indicators: IndicatorScore[] = [];

  // S&P 500 P/E Ratio - Weight 100% within layer
  let peScore = 0;
  if (valuation.spForwardPE !== null) {
    if (valuation.spForwardPE > 20) {
      peScore = -1.0;
    } else if (valuation.spForwardPE >= 16) {
      peScore = 0.0;
    } else {
      peScore = +1.0;
    }
  }
  indicators.push({
    name: 'S&P 500 P/E Ratio',
    value: valuation.spForwardPE !== null ? valuation.spForwardPE.toFixed(2) : 'N/A',
    rawScore: peScore,
    weight: 1.0
  });

  const layerScore = indicators.reduce((sum, ind) => sum + (ind.rawScore * ind.weight), 0);

  return {
    name: 'Valuation',
    weight: 0.30,
    indicators,
    layerScore
  };
}

function scoreSentimentLayer(sentiment: SentimentIndicators): LayerScore {
  const indicators: IndicatorScore[] = [];

  // 1. Fear & Greed Index - Weight 60% within layer (contrarian indicator)
  let fgScore = 0;
  if (sentiment.fearGreedIndex !== null) {
    const fgi = sentiment.fearGreedIndex;
    if (fgi > 80) {
      fgScore = -0.8;  // Extreme Greed - time to be cautious
    } else if (fgi > 60) {
      fgScore = -0.3;  // Greed
    } else if (fgi >= 40) {
      fgScore = +0.2;  // Neutral - trend continuation
    } else if (fgi >= 20) {
      fgScore = +0.5;  // Fear
    } else {
      fgScore = +1.0;  // Extreme Fear - buying opportunity
    }
  }
  indicators.push({
    name: 'Fear & Greed Index',
    value: sentiment.fearGreedIndex !== null
      ? `${sentiment.fearGreedIndex} (${sentiment.fearGreedClassification})`
      : 'N/A',
    rawScore: fgScore,
    weight: 0.60
  });

  // 2. Trend Signal (200-day MA) - Weight 40% within layer
  const trendScore = sentiment.trendSignal === 'bullish' ? +0.5 : -0.5;
  const maComparison = sentiment.sp500Price > sentiment.sp500MA200 ? '>' : '<';
  indicators.push({
    name: 'Trend Signal (200-day MA)',
    value: `${sentiment.sp500Price.toFixed(0)} ${maComparison} ${sentiment.sp500MA200.toFixed(0)}`,
    rawScore: trendScore,
    weight: 0.40
  });

  const layerScore = indicators.reduce((sum, ind) => sum + (ind.rawScore * ind.weight), 0);

  return {
    name: 'Sentiment',
    weight: 0.30,
    indicators,
    layerScore
  };
}

function calculateThermometer(
  macro: MacroIndicators,
  valuation: ValuationIndicators,
  sentiment: SentimentIndicators
): ThermometerResult {
  const macroLayer = scoreMacroLayer(macro);
  const valuationLayer = scoreValuationLayer(valuation);
  const sentimentLayer = scoreSentimentLayer(sentiment);

  const layers = [macroLayer, valuationLayer, sentimentLayer];

  // Total score = weighted sum of layer scores
  const totalScore = layers.reduce((sum, layer) => sum + (layer.layerScore * layer.weight), 0);

  // Clamp to [-1, 1]
  const clampedScore = Math.max(-1, Math.min(1, totalScore));

  // Map score to cash allocation and risk level
  // Cash allocation range: 5% ~ 30% (max)
  let recommendedCashPercent: number;
  let riskLevel: ThermometerResult['riskLevel'];
  let riskLevelKr: string;

  if (clampedScore <= -0.6) {
    recommendedCashPercent = 30;
    riskLevel = 'Danger';
    riskLevelKr = '위험';
  } else if (clampedScore <= -0.2) {
    recommendedCashPercent = 25;
    riskLevel = 'Caution';
    riskLevelKr = '경계';
  } else if (clampedScore <= 0.2) {
    recommendedCashPercent = 20;
    riskLevel = 'Neutral';
    riskLevelKr = '중립';
  } else if (clampedScore <= 0.6) {
    recommendedCashPercent = 10;
    riskLevel = 'Growth';
    riskLevelKr = '성장';
  } else {
    recommendedCashPercent = 5;
    riskLevel = 'Opportunity';
    riskLevelKr = '기회';
  }

  return {
    date: new Date().toISOString().split('T')[0],
    layers,
    totalScore: clampedScore,
    recommendedCashPercent,
    riskLevel,
    riskLevelKr
  };
}

// ==================== Output Generation ====================

function getRiskEmoji(riskLevel: ThermometerResult['riskLevel']): string {
  const emojis: Record<ThermometerResult['riskLevel'], string> = {
    'Opportunity': '🟢',
    'Growth': '🟢',
    'Neutral': '🟡',
    'Caution': '🟠',
    'Danger': '🔴'
  };
  return emojis[riskLevel];
}

function getScoreEmoji(score: number): string {
  if (score >= 0.2) return '📈';
  if (score <= -0.2) return '📉';
  return '➡️';
}

function generateTelegramMessage(result: ThermometerResult): string {
  const riskEmoji = getRiskEmoji(result.riskLevel);
  const scoreEmoji = getScoreEmoji(result.totalScore);

  let message = `🌡️ <b>Market Thermometer</b>\n`;
  message += `📅 ${result.date}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `${scoreEmoji} <b>Risk Score:</b> ${result.totalScore >= 0 ? '+' : ''}${result.totalScore.toFixed(2)}\n`;
  message += `${riskEmoji} <b>Risk Level:</b> ${result.riskLevel} (${result.riskLevelKr})\n`;
  message += `💰 <b>Recommended Cash:</b> ${result.recommendedCashPercent}%\n\n`;

  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `📊 <b>Layer Breakdown</b>\n\n`;

  for (const layer of result.layers) {
    const layerEmoji = layer.layerScore >= 0 ? '🟢' : '🔴';
    message += `<b>${layer.name}</b> (${(layer.weight * 100).toFixed(0)}%): ${layerEmoji} ${layer.layerScore >= 0 ? '+' : ''}${layer.layerScore.toFixed(2)}\n`;

    for (const ind of layer.indicators) {
      const indEmoji = ind.rawScore > 0 ? '▲' : ind.rawScore < 0 ? '▼' : '•';
      message += `  ${indEmoji} ${ind.name}: ${ind.value}\n`;
    }
    message += `\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `📖 <b>해석 가이드</b>\n`;
  message += `• +0.6 ~ +1.0: 기회 (현금 5%)\n`;
  message += `• +0.2 ~ +0.6: 성장 (현금 10%)\n`;
  message += `• -0.2 ~ +0.2: 중립 (현금 20%)\n`;
  message += `• -0.6 ~ -0.2: 경계 (현금 25%)\n`;
  message += `• -1.0 ~ -0.6: 위험 (현금 30%)`;

  return message;
}

function generateMarkdownReport(result: ThermometerResult): string {
  let md = `---\n`;
  md += `title: "Market Thermometer - ${result.date}"\n`;
  md += `date: ${result.date}\n`;
  md += `riskScore: ${result.totalScore.toFixed(2)}\n`;
  md += `riskLevel: ${result.riskLevel}\n`;
  md += `cashPercent: ${result.recommendedCashPercent}\n`;
  md += `---\n\n`;

  md += `# Market Thermometer Report\n\n`;
  md += `**Date:** ${result.date}\n\n`;

  md += `## Summary\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Risk Score | ${result.totalScore >= 0 ? '+' : ''}${result.totalScore.toFixed(2)} |\n`;
  md += `| Risk Level | ${result.riskLevel} (${result.riskLevelKr}) |\n`;
  md += `| Recommended Cash | ${result.recommendedCashPercent}% |\n\n`;

  md += `## Layer Breakdown\n\n`;

  for (const layer of result.layers) {
    md += `### ${layer.name} (Weight: ${(layer.weight * 100).toFixed(0)}%)\n\n`;
    md += `**Layer Score:** ${layer.layerScore >= 0 ? '+' : ''}${layer.layerScore.toFixed(2)}\n\n`;
    md += `| Indicator | Value | Score |\n`;
    md += `|-----------|-------|-------|\n`;

    for (const ind of layer.indicators) {
      md += `| ${ind.name} | ${ind.value} | ${ind.rawScore >= 0 ? '+' : ''}${ind.rawScore.toFixed(1)} |\n`;
    }
    md += `\n`;
  }

  md += `## Scoring Reference\n\n`;
  md += `| Score Range | Risk Level | Cash Allocation |\n`;
  md += `|-------------|------------|------------------|\n`;
  md += `| +0.6 to +1.0 | Opportunity | 5% |\n`;
  md += `| +0.2 to +0.6 | Growth | 10% |\n`;
  md += `| -0.2 to +0.2 | Neutral | 20% |\n`;
  md += `| -0.6 to -0.2 | Caution | 25% |\n`;
  md += `| -1.0 to -0.6 | Danger | 30% |\n\n`;

  md += `---\n\n`;
  md += `*Generated automatically on ${new Date().toISOString()}*\n`;

  return md;
}

// ==================== Main Function ====================

async function main() {
  console.log('🌡️  Market Thermometer - Starting data collection...\n');

  const fredApiKey = process.env.FRED_API_KEY || '';

  try {
    // Fetch all data in parallel
    const [sp500Data, macroData, peRatio, fgData] = await Promise.all([
      fetchSP500Data(),
      fetchMacroIndicators(fredApiKey),
      fetchPERatio(),
      fetchFearGreedIndex()
    ]);

    // Prepare indicators
    const currentPrice = sp500Data[sp500Data.length - 1].close;
    const ma200 = calculateMovingAverage(sp500Data, 200);

    const macro: MacroIndicators = macroData;

    const valuation: ValuationIndicators = {
      spForwardPE: peRatio
    };

    const sentiment: SentimentIndicators = {
      fearGreedIndex: fgData?.value ?? null,
      fearGreedClassification: fgData?.classification ?? null,
      sp500Price: currentPrice,
      sp500MA200: ma200,
      trendSignal: currentPrice > ma200 ? 'bullish' : 'bearish'
    };

    // Calculate thermometer
    console.log('\n🧮 Calculating Market Thermometer...\n');
    const result = calculateThermometer(macro, valuation, sentiment);

    // Display results
    console.log('═══════════════════════════════════════');
    console.log(`  Risk Score: ${result.totalScore >= 0 ? '+' : ''}${result.totalScore.toFixed(2)}`);
    console.log(`  Risk Level: ${result.riskLevel} (${result.riskLevelKr})`);
    console.log(`  Recommended Cash: ${result.recommendedCashPercent}%`);
    console.log('═══════════════════════════════════════\n');

    // Save markdown report to src/pages/report/ (unlisted but accessible via URL)
    const reportDir = path.join(__dirname, '..', 'src', 'pages', 'report');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const filename = `thermometer-${result.date}.md`;
    const filepath = path.join(reportDir, filename);
    const markdownContent = generateMarkdownReport(result);
    fs.writeFileSync(filepath, markdownContent);
    console.log(`📄 Report saved to: ${filepath}`);
    console.log(`🔗 URL: /report/thermometer-${result.date}/`);

    // Send Telegram message
    const telegramMessage = generateTelegramMessage(result);
    await sendTelegramMessage({
      text: telegramMessage,
      parseMode: 'HTML'
    });

    console.log('\n✅ Market Thermometer completed successfully!');

  } catch (error) {
    console.error('❌ Error generating Market Thermometer:', error);
    process.exit(1);
  }
}

main();
