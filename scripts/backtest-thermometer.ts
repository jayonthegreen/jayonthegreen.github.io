import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

// ==================== Types ====================

interface FREDObservation {
  date: string;
  value: string;
}

interface BacktestResult {
  date: string;
  sp500: number;
  sp500_ma200: number;
  trend: 'bullish' | 'bearish';
  ffr: number | null;
  cpiYoY: number | null;
  realRate: number | null;
  m2YoY: number | null;
  consumerSentiment: number | null;
  macroScore: number;
  valuationScore: number;
  sentimentScore: number;
  totalScore: number;
  riskLevel: string;
  cashPercent: number;
}

// ==================== FRED API ====================

async function fetchFREDHistorical(
  seriesId: string,
  apiKey: string,
  startDate: string,
  endDate: string
): Promise<FREDObservation[]> {
  return new Promise((resolve, reject) => {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&observation_start=${startDate}&observation_end=${endDate}&sort_order=asc`;

    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`FRED API error: ${res.statusCode}`));
          return;
        }
        try {
          const json = JSON.parse(data);
          resolve(json.observations || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// ==================== Yahoo Finance ====================

interface SPData {
  date: string;
  close: number;
}

async function fetchSP500Historical(startDate: string, endDate: string): Promise<SPData[]> {
  const start = Math.floor(new Date(startDate).getTime() / 1000);
  const end = Math.floor(new Date(endDate).getTime() / 1000);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?period1=${start}&period2=${end}&interval=1d`;

  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const result = json.chart.result[0];
          const timestamps = result.timestamp;
          const closes = result.indicators.quote[0].close;

          const prices: SPData[] = timestamps
            .map((ts: number, i: number) => ({
              date: new Date(ts * 1000).toISOString().split('T')[0],
              close: closes[i]
            }))
            .filter((p: SPData) => p.close !== null);

          resolve(prices);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// ==================== Scoring Logic ====================

function scoreRealRate(rr: number | null): number {
  if (rr === null) return 0;
  if (rr > 2.0) return -1.0;
  if (rr >= 0) return 0.0;
  return 1.0;
}

function scoreM2(m2: number | null): number {
  if (m2 === null) return 0;
  return m2 > 0 ? 0.8 : -0.8;
}

function scoreSentiment(s: number | null): number {
  if (s === null) return 0;
  if (s >= 85) return 0.5;
  if (s < 70) return -0.5;
  return 0;
}

function scoreTrend(trend: 'bullish' | 'bearish'): number {
  return trend === 'bullish' ? 0.5 : -0.5;
}

function getRiskLevel(score: number): { level: string; cash: number } {
  if (score >= 0.6) return { level: 'Opportunity', cash: 5 };
  if (score >= 0.2) return { level: 'Growth', cash: 20 };
  if (score >= -0.2) return { level: 'Neutral', cash: 40 };
  if (score >= -0.6) return { level: 'Caution', cash: 60 };
  return { level: 'Danger', cash: 85 };
}

// ==================== Main Backtest ====================

async function backtestDate(targetDate: string, apiKey: string, spData: SPData[], fredData: any): Promise<BacktestResult | null> {
  // Find S&P 500 price for target date (or closest prior trading day)
  let spIndex = -1;
  for (let i = 0; i < spData.length; i++) {
    if (spData[i].date <= targetDate) {
      spIndex = i;
    } else {
      break;
    }
  }

  if (spIndex < 0 || spIndex < 200) {
    return null; // Not enough data for 200-day MA
  }

  const sp500 = spData[spIndex].close;
  const actualDate = spData[spIndex].date;

  // Calculate 200-day MA
  const ma200Data = spData.slice(Math.max(0, spIndex - 199), spIndex + 1);
  const sp500_ma200 = ma200Data.reduce((sum, d) => sum + d.close, 0) / ma200Data.length;
  const trend: 'bullish' | 'bearish' = sp500 > sp500_ma200 ? 'bullish' : 'bearish';

  // Get FRED data for target month
  const targetMonth = targetDate.substring(0, 7); // YYYY-MM

  // FFR
  const ffrObs = fredData.ffr.filter((o: FREDObservation) => o.date.startsWith(targetMonth) && o.value !== '.');
  const ffr = ffrObs.length > 0 ? parseFloat(ffrObs[ffrObs.length - 1].value) : null;

  // CPI YoY - need current month and 12 months ago
  const cpiCurrent = fredData.cpi.find((o: FREDObservation) => o.date.startsWith(targetMonth) && o.value !== '.');
  const yearAgoMonth = `${parseInt(targetMonth.split('-')[0]) - 1}-${targetMonth.split('-')[1]}`;
  const cpiYearAgo = fredData.cpi.find((o: FREDObservation) => o.date.startsWith(yearAgoMonth) && o.value !== '.');

  let cpiYoY: number | null = null;
  if (cpiCurrent && cpiYearAgo) {
    cpiYoY = (parseFloat(cpiCurrent.value) - parseFloat(cpiYearAgo.value)) / parseFloat(cpiYearAgo.value) * 100;
  }

  const realRate = (ffr !== null && cpiYoY !== null) ? ffr - cpiYoY : null;

  // M2 YoY
  const m2Current = fredData.m2.find((o: FREDObservation) => o.date.startsWith(targetMonth) && o.value !== '.');
  const m2YearAgo = fredData.m2.find((o: FREDObservation) => o.date.startsWith(yearAgoMonth) && o.value !== '.');

  let m2YoY: number | null = null;
  if (m2Current && m2YearAgo) {
    m2YoY = (parseFloat(m2Current.value) - parseFloat(m2YearAgo.value)) / parseFloat(m2YearAgo.value) * 100;
  }

  // Consumer Sentiment
  const sentObs = fredData.sentiment.filter((o: FREDObservation) => o.date.startsWith(targetMonth) && o.value !== '.');
  const consumerSentiment = sentObs.length > 0 ? parseFloat(sentObs[sentObs.length - 1].value) : null;

  // Calculate scores
  const macroScore =
    scoreRealRate(realRate) * 0.40 +
    scoreM2(m2YoY) * 0.35 +
    scoreSentiment(consumerSentiment) * 0.25;

  // Valuation - no historical P/E or MVRV available easily
  const valuationScore = 0;

  // Sentiment
  const sentimentScore =
    0 * 0.60 +  // No historical Fear & Greed
    scoreTrend(trend) * 0.40;

  const totalScore = macroScore * 0.40 + valuationScore * 0.30 + sentimentScore * 0.30;
  const { level, cash } = getRiskLevel(totalScore);

  return {
    date: actualDate,
    sp500,
    sp500_ma200,
    trend,
    ffr,
    cpiYoY,
    realRate,
    m2YoY,
    consumerSentiment,
    macroScore,
    valuationScore,
    sentimentScore,
    totalScore,
    riskLevel: level,
    cashPercent: cash
  };
}

async function main() {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    console.error('FRED_API_KEY required');
    process.exit(1);
  }

  console.log('📊 Fetching historical data for 2025 backtest...\n');

  // Fetch all required data
  const [spData, ffrData, cpiData, m2Data, sentData] = await Promise.all([
    fetchSP500Historical('2023-01-01', '2026-01-03'),
    fetchFREDHistorical('FEDFUNDS', apiKey, '2024-01-01', '2025-12-31'),
    fetchFREDHistorical('CPIAUCSL', apiKey, '2023-01-01', '2025-12-31'),
    fetchFREDHistorical('M2SL', apiKey, '2023-01-01', '2025-12-31'),
    fetchFREDHistorical('UMCSENT', apiKey, '2024-01-01', '2025-12-31')
  ]);

  console.log(`✅ S&P 500: ${spData.length} days`);
  console.log(`✅ FFR: ${ffrData.length} observations`);
  console.log(`✅ CPI: ${cpiData.length} observations`);
  console.log(`✅ M2: ${m2Data.length} observations`);
  console.log(`✅ Sentiment: ${sentData.length} observations\n`);

  const fredData = {
    ffr: ffrData,
    cpi: cpiData,
    m2: m2Data,
    sentiment: sentData
  };

  // Test dates: First trading day of each month in 2025
  const testDates = [
    '2025-01-02', '2025-02-03', '2025-03-03', '2025-04-01',
    '2025-05-01', '2025-06-02', '2025-07-01', '2025-08-01',
    '2025-09-02', '2025-10-01', '2025-11-03', '2025-12-01'
  ];

  const results: BacktestResult[] = [];

  for (const date of testDates) {
    const result = await backtestDate(date, apiKey, spData, fredData);
    if (result) {
      results.push(result);
    }
  }

  // Print results table
  console.log('═'.repeat(120));
  console.log('2025 Market Thermometer Backtest');
  console.log('═'.repeat(120));
  console.log(
    'Date'.padEnd(12) +
    'S&P500'.padStart(10) +
    '200MA'.padStart(10) +
    'Trend'.padStart(10) +
    'RealRate'.padStart(10) +
    'M2 YoY'.padStart(10) +
    'Sentiment'.padStart(10) +
    'Score'.padStart(8) +
    'Level'.padStart(12) +
    'Cash%'.padStart(8)
  );
  console.log('─'.repeat(120));

  let prevSP500 = results[0]?.sp500 || 0;

  for (const r of results) {
    const change = prevSP500 ? ((r.sp500 - prevSP500) / prevSP500 * 100) : 0;
    console.log(
      r.date.padEnd(12) +
      r.sp500.toFixed(0).padStart(10) +
      r.sp500_ma200.toFixed(0).padStart(10) +
      r.trend.padStart(10) +
      (r.realRate !== null ? r.realRate.toFixed(1) + '%' : 'N/A').padStart(10) +
      (r.m2YoY !== null ? r.m2YoY.toFixed(1) + '%' : 'N/A').padStart(10) +
      (r.consumerSentiment !== null ? r.consumerSentiment.toFixed(0) : 'N/A').padStart(10) +
      (r.totalScore >= 0 ? '+' : '') + r.totalScore.toFixed(2).padStart(7) +
      r.riskLevel.padStart(12) +
      (r.cashPercent + '%').padStart(8)
    );
    prevSP500 = r.sp500;
  }

  console.log('═'.repeat(120));

  // Summary statistics
  if (results.length >= 2) {
    const firstSP = results[0].sp500;
    const lastSP = results[results.length - 1].sp500;
    const totalReturn = (lastSP - firstSP) / firstSP * 100;

    console.log(`\n📈 S&P 500 Performance: ${firstSP.toFixed(0)} → ${lastSP.toFixed(0)} (${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(1)}%)`);

    const avgScore = results.reduce((sum, r) => sum + r.totalScore, 0) / results.length;
    console.log(`📊 Average Risk Score: ${avgScore >= 0 ? '+' : ''}${avgScore.toFixed(2)}`);

    // Count risk levels
    const levelCounts: Record<string, number> = {};
    for (const r of results) {
      levelCounts[r.riskLevel] = (levelCounts[r.riskLevel] || 0) + 1;
    }
    console.log(`📋 Risk Level Distribution: ${Object.entries(levelCounts).map(([k, v]) => `${k}(${v})`).join(', ')}`);
  }
}

main().catch(console.error);
