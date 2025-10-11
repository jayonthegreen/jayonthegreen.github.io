import * as fs from 'fs';
import * as path from 'path';
import https from 'https';
import dotenv from 'dotenv';
import { sendTelegramMessage } from '../src/utils/telegram';

// Load environment variables from .env file
dotenv.config();

interface SPData {
  date: string;
  close: number;
}

interface NewsletterData {
  currentPrice: number;
  currentDate: string;
  dayOverDay: number;
  dayOverDayPercent: number;
  weekOverWeek: number;
  weekOverWeekPercent: number;
  yearOverYear: number;
  yearOverYearPercent: number;
  ma90: number;
  ma90Diff: number;
  ma90DiffPercent: number;
  week52High: number;
  week52Low: number;
}

// Yahoo Finance API를 통해 S&P 500 데이터 가져오기
async function fetchSP500Data(): Promise<SPData[]> {
  const symbol = '^GSPC'; // S&P 500 symbol
  const period1 = Math.floor(Date.now() / 1000) - (550 * 24 * 60 * 60); // 550일 전 (365일 + 여유)
  const period2 = Math.floor(Date.now() / 1000); // 현재

  // Yahoo Finance v8 API 사용 (더 안정적)
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

          console.log(`✅ Successfully fetched ${prices.length} data points`);
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

// 이동평균 계산
function calculateMovingAverage(data: SPData[], days: number): number {
  const slice = data.slice(-days);
  const sum = slice.reduce((acc, item) => acc + item.close, 0);
  return sum / slice.length;
}

// 특정 기간 전 데이터 찾기 (실제 날짜 기준)
function findPriceNDaysAgo(data: SPData[], n: number): number | null {
  if (data.length === 0) return null;

  const latestDate = new Date(data[data.length - 1].date);
  const targetDate = new Date(latestDate);
  targetDate.setDate(targetDate.getDate() - n);

  // 정확한 날짜를 찾거나, 그 전에 가장 가까운 거래일 찾기
  for (let i = data.length - 1; i >= 0; i--) {
    const itemDate = new Date(data[i].date);
    if (itemDate <= targetDate) {
      return data[i].close;
    }
  }

  return null;
}

// 뉴스레터 데이터 계산
async function calculateNewsletterData(): Promise<NewsletterData> {
  const data = await fetchSP500Data();

  if (!data || data.length === 0) {
    throw new Error('No data received from Yahoo Finance');
  }

  console.log(`📈 Fetched ${data.length} days of data`);

  const current = data[data.length - 1];
  if (!current || !current.close) {
    throw new Error('Invalid data format: missing close price');
  }

  const currentPrice = current.close;
  const currentDate = current.date;

  // Day over Day (1일 전)
  const oneDayAgo = findPriceNDaysAgo(data, 1);
  const dayOverDay = oneDayAgo ? currentPrice - oneDayAgo : 0;
  const dayOverDayPercent = oneDayAgo ? (dayOverDay / oneDayAgo) * 100 : 0;

  // Week over Week (7일 전)
  const oneWeekAgo = findPriceNDaysAgo(data, 7);
  const weekOverWeek = oneWeekAgo ? currentPrice - oneWeekAgo : 0;
  const weekOverWeekPercent = oneWeekAgo ? (weekOverWeek / oneWeekAgo) * 100 : 0;

  // Year over Year (365일 전)
  const oneYearAgo = findPriceNDaysAgo(data, 365);
  const yearOverYear = oneYearAgo ? currentPrice - oneYearAgo : 0;
  const yearOverYearPercent = oneYearAgo ? (yearOverYear / oneYearAgo) * 100 : 0;

  // 90일 이동평균
  const ma90 = calculateMovingAverage(data, 90);
  const ma90Diff = currentPrice - ma90;
  const ma90DiffPercent = (ma90Diff / ma90) * 100;

  // 52주 최고/최저 (약 365일 데이터에서)
  const week52Data = data.slice(-365);
  const week52High = Math.max(...week52Data.map(d => d.close));
  const week52Low = Math.min(...week52Data.map(d => d.close));

  return {
    currentPrice,
    currentDate,
    dayOverDay,
    dayOverDayPercent,
    weekOverWeek,
    weekOverWeekPercent,
    yearOverYear,
    yearOverYearPercent,
    ma90,
    ma90Diff,
    ma90DiffPercent,
    week52High,
    week52Low
  };
}

// 마크다운 뉴스레터 생성
function generateMarkdown(data: NewsletterData): string {
  const formatNumber = (num: number) => num.toFixed(2);
  const formatPercent = (num: number) => `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  const formatChange = (value: number, percent: number) =>
    `${value >= 0 ? '+' : ''}${formatNumber(value)} (${formatPercent(percent)})`;

  // 템플릿 파일 읽기
  const templatePath = path.join(process.cwd(), 'templates', 'sp500-newsletter.md');
  let template = fs.readFileSync(templatePath, 'utf-8');

  // 템플릿 변수 치환
  const replacements: Record<string, string> = {
    currentDate: data.currentDate,
    currentPrice: formatNumber(data.currentPrice),
    dayOverDay: formatChange(data.dayOverDay, data.dayOverDayPercent).split(' (')[0],
    dayOverDayPercent: formatPercent(data.dayOverDayPercent),
    weekOverWeek: formatChange(data.weekOverWeek, data.weekOverWeekPercent).split(' (')[0],
    weekOverWeekPercent: formatPercent(data.weekOverWeekPercent),
    yearOverYear: formatChange(data.yearOverYear, data.yearOverYearPercent).split(' (')[0],
    yearOverYearPercent: formatPercent(data.yearOverYearPercent),
    ma90: formatNumber(data.ma90),
    ma90Diff: formatChange(data.ma90Diff, data.ma90DiffPercent).split(' (')[0],
    ma90DiffPercent: formatPercent(data.ma90DiffPercent),
    week52High: formatNumber(data.week52High),
    week52Low: formatNumber(data.week52Low),
    fromHigh: formatNumber(data.currentPrice - data.week52High),
    fromHighPercent: formatPercent((data.currentPrice - data.week52High) / data.week52High * 100),
    fromLow: formatNumber(data.currentPrice - data.week52Low),
    fromLowPercent: formatPercent((data.currentPrice - data.week52Low) / data.week52Low * 100),
    timestamp: new Date().toISOString()
  };

  // 모든 플레이스홀더 치환
  Object.entries(replacements).forEach(([key, value]) => {
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  return template;
}

// 텔레그램 메시지용 텍스트 생성
function generateTelegramMessage(data: NewsletterData): string {
  const formatNumber = (num: number) => num.toFixed(2);
  const formatPercent = (num: number) => `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  const formatChange = (value: number, percent: number) =>
    `${value >= 0 ? '📈' : '📉'} ${value >= 0 ? '+' : ''}${formatNumber(value)} (${formatPercent(percent)})`;

  return `📊 S&P 500 Daily Report

📅 ${data.currentDate}
💰 Current Price: ${formatNumber(data.currentPrice)}

📈 Performance:
  • DoD: ${formatChange(data.dayOverDay, data.dayOverDayPercent)}
  • WoW: ${formatChange(data.weekOverWeek, data.weekOverWeekPercent)}
  • YoY: ${formatChange(data.yearOverYear, data.yearOverYearPercent)}

📊 90-Day MA: ${formatNumber(data.ma90)}
    vs MA90: ${formatChange(data.ma90Diff, data.ma90DiffPercent)}

📏 52-Week Range:
    High: ${formatNumber(data.week52High)} (${formatNumber((data.currentPrice - data.week52High) / data.week52High * 100)}% from high)
    Low: ${formatNumber(data.week52Low)} (${formatNumber((data.currentPrice - data.week52Low) / data.week52Low * 100)}% from low)`;
}


// 메인 함수
async function main() {
  try {
    console.log('📊 Fetching S&P 500 data...');
    const data = await calculateNewsletterData();

    // 마크다운 파일 생성
    console.log('📝 Generating newsletter...');
    const markdown = generateMarkdown(data);
    const newsletterDir = path.join(process.cwd(), 'newsletters');

    if (!fs.existsSync(newsletterDir)) {
      fs.mkdirSync(newsletterDir, { recursive: true });
    }

    const filename = `sp500-${data.currentDate}.md`;
    const filepath = path.join(newsletterDir, filename);
    fs.writeFileSync(filepath, markdown);
    console.log(`✅ Newsletter saved to ${filepath}`);

    // 텔레그램 메시지 전송
    console.log('📱 Sending Telegram message...');
    const telegramMessage = generateTelegramMessage(data);
    await sendTelegramMessage(telegramMessage);

    console.log('🎉 Newsletter generation completed!');
  } catch (error) {
    console.error('❌ Error generating newsletter:', error);
    process.exit(1);
  }
}

main();
