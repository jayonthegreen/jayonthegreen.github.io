import https from 'https';
import dotenv from 'dotenv';
import { sendTelegramMessage } from '../src/utils/telegram';
import OpenAI from 'openai';

dotenv.config();

interface SPData {
  date: string;
  close: number;
}

interface WeeklySummary {
  startDate: string;
  endDate: string;
  startPrice: number;
  endPrice: number;
  weeklyChange: number;
  weeklyChangePercent: number;
  weekHigh: number;
  weekLow: number;
  avgVix: number;
  peRatio?: number;
  fearGreedIndex?: number;
  fearGreedClassification?: string;
  aiSummary?: string;
}

// Yahoo Finance API를 통해 데이터 가져오기
async function fetchYahooFinanceData(symbol: string, days: number = 10): Promise<SPData[]> {
  const period1 = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
  const period2 = Math.floor(Date.now() / 1000);

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1d`;

  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Yahoo Finance API returned status ${res.statusCode}`));
          return;
        }

        try {
          const jsonData = JSON.parse(data);
          const result = jsonData.chart.result[0];
          const timestamps = result.timestamp;
          const closes = result.indicators.quote[0].close;

          if (!timestamps || !closes) {
            reject(new Error('Invalid data structure from API'));
            return;
          }

          const prices: SPData[] = timestamps
            .map((timestamp: number, index: number) => {
              const date = new Date(timestamp * 1000);
              return {
                date: date.toISOString().split('T')[0],
                close: closes[index]
              };
            })
            .filter((item: SPData) => item.close !== null && !isNaN(item.close));

          if (prices.length === 0) {
            reject(new Error('Failed to parse any valid price data'));
            return;
          }

          console.log(`✅ Successfully fetched ${prices.length} data points for ${symbol}`);
          resolve(prices);
        } catch (err) {
          reject(new Error(`Failed to parse JSON response: ${err}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// P/E Ratio 가져오기
async function fetchPERatio(): Promise<number | null> {
  return new Promise((resolve) => {
    const url = 'https://www.multpl.com/s-p-500-pe-ratio';

    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let html = '';

      res.on('data', (chunk) => {
        html += chunk;
      });

      res.on('end', () => {
        try {
          const pePattern = /<div id="current"[^>]*>[\\s\\S]*?:\\s*<\\/b>\\s*([\\d.]+)/;
          const match = pePattern.exec(html);

          if (match && match[1]) {
            const peRatio = parseFloat(match[1]);
            console.log(`✅ Fetched P/E Ratio: ${peRatio}`);
            resolve(peRatio);
          } else {
            resolve(null);
          }
        } catch (error) {
          resolve(null);
        }
      });
    }).on('error', () => {
      resolve(null);
    });
  });
}

// Fear and Greed Index 가져오기
interface FearGreedData {
  value: number;
  classification: string;
}

async function fetchFearGreedIndex(): Promise<FearGreedData | null> {
  return new Promise((resolve) => {
    const url = 'https://api.alternative.me/fng/';

    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);

          if (!jsonData.data || jsonData.data.length === 0) {
            resolve(null);
            return;
          }

          const latestData = jsonData.data[0];
          const value = parseInt(latestData.value);
          const classification = latestData.value_classification;

          console.log(`✅ Fear and Greed Index: ${value} (${classification})`);

          resolve({
            value,
            classification
          });
        } catch (error) {
          resolve(null);
        }
      });
    }).on('error', () => {
      resolve(null);
    });
  });
}

// AI로 주간 요약 생성
async function generateWeeklySummary(data: Omit<WeeklySummary, 'aiSummary'>): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return '';
  }

  try {
    const openai = new OpenAI({ apiKey });

    const prompt = `다음은 지난 주의 S&P 500 시장 데이터입니다:

기간: ${data.startDate} ~ ${data.endDate}
시작가: ${data.startPrice.toFixed(2)}
종가: ${data.endPrice.toFixed(2)}
주간 변화: ${data.weeklyChangePercent.toFixed(2)}%
주간 최고: ${data.weekHigh.toFixed(2)}
주간 최저: ${data.weekLow.toFixed(2)}
평균 VIX: ${data.avgVix.toFixed(2)}
현재 P/E Ratio: ${data.peRatio?.toFixed(2) || 'N/A'}
Fear & Greed: ${data.fearGreedIndex} (${data.fearGreedClassification})

위의 데이터를 바탕으로 지난 주 시장 동향을 300자 이내로 한국어로 요약해주세요. 
주요 변동 원인, 투자자 심리, 그리고 다음 주 주목할 점을 포함해주세요.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 금융 시장 주간 리포트를 작성하는 전문가입니다. 객관적이고 통찰력 있게 시장 상황을 분석합니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const summary = response.choices[0]?.message?.content?.trim() || '';
    console.log(`✅ AI summary generated: ${summary.length} characters`);
    return summary;
  } catch (error) {
    console.warn(`⚠️  Failed to generate AI summary: ${error}`);
    return '';
  }
}

// 주간 데이터 계산
async function calculateWeeklySummary(): Promise<WeeklySummary> {
  const [spData, vixData, peRatio, fearGreedData] = await Promise.all([
    fetchYahooFinanceData('^GSPC', 10),
    fetchYahooFinanceData('^VIX', 10),
    fetchPERatio(),
    fetchFearGreedIndex()
  ]);

  if (!spData || spData.length < 5) {
    throw new Error('Insufficient S&P 500 data');
  }

  if (!vixData || vixData.length < 5) {
    throw new Error('Insufficient VIX data');
  }

  // 최근 5 거래일 (약 1주일) 데이터 사용
  const weekData = spData.slice(-5);
  const weekVixData = vixData.slice(-5);

  const startPrice = weekData[0].close;
  const endPrice = weekData[weekData.length - 1].close;
  const weeklyChange = endPrice - startPrice;
  const weeklyChangePercent = (weeklyChange / startPrice) * 100;

  const weekHigh = Math.max(...weekData.map(d => d.close));
  const weekLow = Math.min(...weekData.map(d => d.close));

  const avgVix = weekVixData.reduce((sum, d) => sum + d.close, 0) / weekVixData.length;

  const summaryData: Omit<WeeklySummary, 'aiSummary'> = {
    startDate: weekData[0].date,
    endDate: weekData[weekData.length - 1].date,
    startPrice,
    endPrice,
    weeklyChange,
    weeklyChangePercent,
    weekHigh,
    weekLow,
    avgVix,
    peRatio: peRatio || undefined,
    fearGreedIndex: fearGreedData?.value,
    fearGreedClassification: fearGreedData?.classification
  };

  const aiSummary = await generateWeeklySummary(summaryData);

  return {
    ...summaryData,
    aiSummary
  };
}

// 텔레그램 메시지 생성
function generateTelegramMessage(data: WeeklySummary): string {
  const formatNumber = (num: number) => num.toFixed(2);
  const formatPercent = (num: number) => `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;

  let fearGreedEmoji = '⚪';
  if (data.fearGreedClassification?.includes('Extreme Fear')) {
    fearGreedEmoji = '😱';
  } else if (data.fearGreedClassification?.includes('Fear')) {
    fearGreedEmoji = '😨';
  } else if (data.fearGreedClassification?.includes('Extreme Greed')) {
    fearGreedEmoji = '🤑';
  } else if (data.fearGreedClassification?.includes('Greed')) {
    fearGreedEmoji = '😃';
  }

  const peSection = data.peRatio
    ? `💹 P/E Ratio: ${formatNumber(data.peRatio)}\\n`
    : '';

  const aiSection = data.aiSummary
    ? `\\n\\n🤖 <b>주간 분석</b>\\n${data.aiSummary}`
    : '';

  return `📊 <b>주간 경제 리포트</b>

📅 ${data.startDate} ~ ${data.endDate}

━━━━━━━━━━━━━━━━━━━━

📈 <b>S&P 500 주간 요약</b>

💰 시작가: ${formatNumber(data.startPrice)}
💰 종가: ${formatNumber(data.endPrice)}

<b>주간 성과:</b>
  • 변화: ${formatPercent(data.weeklyChangePercent)} (${data.weeklyChange >= 0 ? '▲' : '▼'} ${formatNumber(Math.abs(data.weeklyChange))})
  • 최고: ${formatNumber(data.weekHigh)}
  • 최저: ${formatNumber(data.weekLow)}

<b>시장 지표:</b>
😱 평균 VIX: ${formatNumber(data.avgVix)}
${peSection}
<b>시장 심리:</b>
${fearGreedEmoji} Fear &amp; Greed: ${data.fearGreedIndex} - ${data.fearGreedClassification}${aiSection}

━━━━━━━━━━━━━━━━━━━━

다음 주간 리포트: ${getNextSundayDate()}`;
}

// 다음 일요일 날짜 계산
function getNextSundayDate(): string {
  const today = new Date();
  const daysUntilSunday = 7 - today.getDay();
  const nextSunday = new Date(today);
  nextSunday.setDate(today.getDate() + daysUntilSunday);
  
  const year = nextSunday.getFullYear();
  const month = String(nextSunday.getMonth() + 1).padStart(2, '0');
  const day = String(nextSunday.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// 메인 함수
async function main() {
  try {
    console.log('📊 Generating weekly economic summary...');
    const data = await calculateWeeklySummary();

    console.log('📱 Sending Telegram message...');
    const telegramMessage = generateTelegramMessage(data);
    await sendTelegramMessage({
      text: telegramMessage,
      parseMode: 'HTML'
    });

    console.log('🎉 Weekly summary sent successfully!');
  } catch (error) {
    console.error('❌ Error generating weekly summary:', error);
    process.exit(1);
  }
}

main();
