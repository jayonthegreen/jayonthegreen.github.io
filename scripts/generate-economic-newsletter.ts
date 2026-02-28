import * as fs from 'fs';
import * as path from 'path';
import https from 'https';
import dotenv from 'dotenv';
import { sendTelegramMessage } from '../src/utils/telegram';
import OpenAI from 'openai';

// Load environment variables from .env file
dotenv.config();

// HTML 엔티티 디코딩 함수
function decodeHTMLEntities(text: string): string {
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#39;': "'",
    '&apos;': "'",
    '&#x2F;': '/',
    '&#47;': '/'
  };

  return text.replace(/&[#\w]+;/g, (entity) => entities[entity] || entity);
}

interface SPData {
  date: string;
  close: number;
}

interface NewsSource {
  title: string;
  url: string;
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
  ma365: number;
  ma365Diff: number;
  ma365DiffPercent: number;
  week52High: number;
  week52Low: number;
  vix: number;
  vixChange: number;
  vixChangePercent: number;
  peRatio?: number;
  fearGreedIndex?: number;
  fearGreedClassification?: string;
  mvrvZScore?: number;
  mvrvSignal?: string;
  aiInsight?: string;
  newsSources?: NewsSource[];
}

// Yahoo Finance API를 통해 데이터 가져오기 (공통 함수)
async function fetchYahooFinanceData(symbol: string, days: number = 550): Promise<SPData[]> {
  const period1 = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
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

// S&P 500 데이터 가져오기
async function fetchSP500Data(): Promise<SPData[]> {
  return fetchYahooFinanceData('^GSPC', 550);
}

// VIX 데이터 가져오기
async function fetchVIXData(): Promise<SPData[]> {
  return fetchYahooFinanceData('^VIX', 10); // VIX는 최근 며칠만 필요
}

// S&P 500 P/E Ratio 가져오기 (multpl.com에서 스크래핑)
async function fetchPERatio(): Promise<number | null> {
  return new Promise((resolve) => {
    const url = 'https://www.multpl.com/s-p-500-pe-ratio';

    console.log('📊 Fetching S&P 500 P/E Ratio from multpl.com...');

    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let html = '';

      res.on('data', (chunk) => {
        html += chunk;
      });

      res.on('end', () => {
        try {
          // HTML에서 P/E Ratio 추출
          // <div id="current"><b>Current<span class="currentTitle">S&P 500 PE Ratio</span>:</b>30.34
          const pePattern = /<div id="current"[^>]*>[\s\S]*?:\s*<\/b>\s*([\d.]+)/;
          const match = pePattern.exec(html);

          if (match && match[1]) {
            const peRatio = parseFloat(match[1]);
            console.log(`✅ Fetched P/E Ratio: ${peRatio}`);
            resolve(peRatio);
          } else {
            console.warn('⚠️  Could not find P/E Ratio in HTML');
            resolve(null);
          }
        } catch (error) {
          console.warn(`⚠️  Failed to parse P/E Ratio: ${error}`);
          resolve(null);
        }
      });
    }).on('error', (error) => {
      console.warn(`⚠️  Failed to fetch P/E Ratio: ${error}`);
      resolve(null);
    });
  });
}

// Bitcoin MVRV Z-Score 계산을 위한 데이터 가져오기 (CoinMetrics Community API)
interface BitcoinMetrics {
  marketCap: number;
  realizedCap: number;
  mvrvZScore: number;
  date: string;
}

async function fetchBitcoinMVRVData(): Promise<BitcoinMetrics | null> {
  return new Promise((resolve) => {
    // CoinMetrics Community API - 최근 1일 데이터 가져오기
    const metrics = 'CapMrktCurUSD,CapRealUSD';
    const url = `https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=btc&metrics=${metrics}&frequency=1d&limit=365`;

    console.log('₿ Fetching Bitcoin MVRV data from CoinMetrics...');

    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);

          if (!jsonData.data || jsonData.data.length === 0) {
            console.warn('⚠️  No Bitcoin data received from CoinMetrics');
            resolve(null);
            return;
          }

          // 최근 데이터 추출 및 표준편차 계산을 위한 historical data
          const allData = jsonData.data;
          const latestData = allData[allData.length - 1];

          const marketCap = parseFloat(latestData.CapMrktCurUSD);
          const realizedCap = parseFloat(latestData.CapRealUSD);

          if (isNaN(marketCap) || isNaN(realizedCap)) {
            console.warn('⚠️  Invalid Bitcoin market data');
            resolve(null);
            return;
          }

          // 표준편차 계산 (최근 365일 데이터 사용)
          const marketCaps = allData.map((d: any) => parseFloat(d.CapMrktCurUSD)).filter((v: number) => !isNaN(v));
          const mean = marketCaps.reduce((sum: number, val: number) => sum + val, 0) / marketCaps.length;
          const variance = marketCaps.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / marketCaps.length;
          const stdDev = Math.sqrt(variance);

          // MVRV Z-Score 계산
          const mvrvZScore = (marketCap - realizedCap) / stdDev;

          console.log(`✅ Bitcoin MVRV Z-Score: ${mvrvZScore.toFixed(2)}`);
          console.log(`   Market Cap: $${(marketCap / 1e9).toFixed(2)}B`);
          console.log(`   Realized Cap: $${(realizedCap / 1e9).toFixed(2)}B`);

          resolve({
            marketCap,
            realizedCap,
            mvrvZScore,
            date: latestData.time
          });
        } catch (error) {
          console.warn(`⚠️  Failed to parse Bitcoin data: ${error}`);
          resolve(null);
        }
      });
    }).on('error', (error) => {
      console.warn(`⚠️  Failed to fetch Bitcoin data: ${error}`);
      resolve(null);
    });
  });
}

// MVRV Z-Score 계산 함수
function calculateMVRVZScore(marketCap: number, realizedCap: number, stdDev: number): number {
  return (marketCap - realizedCap) / stdDev;
}

// MVRV Z-Score 신호 판단
function getMVRVSignal(zScore: number): string {
  if (zScore < 0) {
    return '🟢 Buy Signal (Undervalued)';
  } else if (zScore > 6) {
    return '🔴 Sell Signal (Overvalued)';
  } else {
    return '⚪ Neutral (Hold)';
  }
}

// Fear and Greed Index 가져오기
interface FearGreedData {
  value: number;
  classification: string;
}

async function fetchFearGreedIndex(): Promise<FearGreedData | null> {
  return new Promise((resolve) => {
    const url = 'https://api.alternative.me/fng/';

    console.log('😨 Fetching Fear and Greed Index...');

    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);

          if (!jsonData.data || jsonData.data.length === 0) {
            console.warn('⚠️  No Fear and Greed data received');
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
          console.warn(`⚠️  Failed to parse Fear and Greed data: ${error}`);
          resolve(null);
        }
      });
    }).on('error', (error) => {
      console.warn(`⚠️  Failed to fetch Fear and Greed data: ${error}`);
      resolve(null);
    });
  });
}

// CNBC 공식 RSS 피드에서 최근 시장 뉴스 가져오기
async function fetchCNBCNews(): Promise<NewsSource[]> {
  return new Promise((resolve) => {
    const url = 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114';

    console.log('📰 Fetching CNBC RSS feed...');

    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let xml = '';

      res.on('data', (chunk) => {
        xml += chunk;
      });

      res.on('end', () => {
        try {
          // XML에서 item 추출
          const itemPattern = /<item>([\s\S]*?)<\/item>/g;
          const titlePattern = /<title>(.*?)<\/title>/;
          const linkPattern = /<link>(.*?)<\/link>/;

          const sources: NewsSource[] = [];
          const seenUrls = new Set<string>();

          let match: RegExpExecArray | null;
          let count = 0;

          while ((match = itemPattern.exec(xml)) !== null && count < 10) {
            const itemContent = match[1];
            const titleMatch = titlePattern.exec(itemContent);
            const linkMatch = linkPattern.exec(itemContent);

            if (titleMatch && linkMatch) {
              const rawTitle = titleMatch[1].trim();
              const title = decodeHTMLEntities(rawTitle);
              const url = linkMatch[1].trim();

              // 중복 제거 및 관련 키워드 필터링
              if (!seenUrls.has(url) && title.length > 10) {
                const relevantKeywords = ['stock', 'market', 'S&P', 'Fed', 'inflation', 'rate', 'dow', 'nasdaq', 'wall street', 'economy', 'earnings', 'trading', 'investor', 'treasury', 'bond'];
                const isRelevant = relevantKeywords.some(keyword =>
                  title.toLowerCase().includes(keyword) || url.toLowerCase().includes(keyword)
                );

                if (isRelevant) {
                  sources.push({ title, url });
                  seenUrls.add(url);
                  count++;
                }
              }
            }
          }

          console.log(`✅ Fetched ${sources.length} CNBC news articles from RSS`);
          resolve(sources.slice(0, 3)); // 최대 3개만 반환
        } catch (error) {
          console.warn(`⚠️  Failed to parse CNBC RSS: ${error}`);
          resolve([]);
        }
      });
    }).on('error', (error) => {
      console.warn(`⚠️  Failed to fetch CNBC RSS: ${error}`);
      resolve([]);
    });
  });
}

// 최근 시장 뉴스 분석 및 요약
async function fetchMarketNews(): Promise<{ summary: string; sources: NewsSource[] }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { summary: '', sources: [] };
  }

  try {
    // CNBC에서 뉴스 가져오기
    const cnbcNews = await fetchCNBCNews();

    if (cnbcNews.length === 0) {
      console.warn('⚠️  No CNBC news found');
      return { summary: '', sources: [] };
    }

    const openai = new OpenAI({ apiKey });

    // 뉴스 제목들을 AI에게 전달하여 요약 생성
    const newsText = cnbcNews.map((news, i) => `${i + 1}. ${news.title}`).join('\n');

    console.log('🤖 Analyzing CNBC news...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 금융 뉴스를 분석하는 전문가입니다. CNBC 뉴스 헤드라인을 읽고 시장 상황을 간결하게 요약합니다.'
        },
        {
          role: 'user',
          content: `다음은 CNBC에서 가져온 최근 시장 뉴스 헤드라인입니다:\n\n${newsText}\n\n이 뉴스들을 바탕으로 현재 시장 상황과 주요 이슈를 150자 이내로 요약해주세요.`
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const summary = response.choices[0]?.message?.content?.trim() || '';
    console.log(`✅ News summary generated: ${summary.length} characters`);

    return {
      summary,
      sources: cnbcNews
    };
  } catch (error) {
    console.warn(`⚠️  Failed to fetch market news: ${error}`);
    return { summary: '', sources: [] };
  }
}

// OpenAI를 사용해 시장 인사이트 생성
async function generateAIInsight(data: Omit<NewsletterData, 'aiInsight' | 'newsSources'>): Promise<{ insight: string; sources: NewsSource[] }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('⚠️  OPENAI_API_KEY not found, skipping AI insight');
    return { insight: '', sources: [] };
  }

  try {
    const openai = new OpenAI({ apiKey });

    // 최근 시장 뉴스 가져오기
    const { summary: marketNews, sources } = await fetchMarketNews();

    const newsContext = marketNews
      ? `\n\n최근 시장 뉴스:\n${marketNews}\n`
      : '';

    const prompt = `다음은 오늘의 S&P 500 시장 데이터입니다:

날짜: ${data.currentDate}
현재가: ${data.currentPrice.toFixed(2)}
일일 변화: ${data.dayOverDayPercent.toFixed(2)}%
주간 변화: ${data.weekOverWeekPercent.toFixed(2)}%
연간 변화: ${data.yearOverYearPercent.toFixed(2)}%
90일 이평선 대비: ${data.ma90DiffPercent.toFixed(2)}%
365일 이평선 대비: ${data.ma365DiffPercent.toFixed(2)}%
52주 최고가: ${data.week52High.toFixed(2)} (현재 ${((data.currentPrice - data.week52High) / data.week52High * 100).toFixed(2)}%)
52주 최저가: ${data.week52Low.toFixed(2)} (현재 ${((data.currentPrice - data.week52Low) / data.week52Low * 100).toFixed(2)}%)
VIX: ${data.vix.toFixed(2)} (변화: ${data.vixChangePercent.toFixed(2)}%)${newsContext}

위의 시장 데이터와 최근 뉴스를 종합하여, 오늘 시장 변동의 원인이나 배경을 포함한 인사이트를 200자 이내로 한국어로 작성해주세요. 단순히 숫자를 반복하지 말고, 시장 상황의 맥락과 의미를 설명해주세요. 투자 조언이 아닌 객관적인 분석만 제공하세요.`;

    console.log('🤖 Generating AI insight...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 금융 시장 데이터와 뉴스를 분석하는 전문가입니다. 시장 변동의 원인과 배경을 설명하며, 객관적이고 맥락있게 시장 상황을 서술합니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const insight = response.choices[0]?.message?.content?.trim() || '';
    console.log(`✅ AI insight generated: ${insight.length} characters`);
    return { insight, sources };
  } catch (error) {
    console.warn(`⚠️  Failed to generate AI insight: ${error}`);
    return { insight: '', sources: [] };
  }
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
  const [data, vixData, peRatio, fearGreedData] = await Promise.all([
    fetchSP500Data(),
    fetchVIXData(),
    fetchPERatio(),
    fetchFearGreedIndex()
  ]);

  if (!data || data.length === 0) {
    throw new Error('No S&P 500 data received from Yahoo Finance');
  }

  if (!vixData || vixData.length === 0) {
    throw new Error('No VIX data received from Yahoo Finance');
  }

  console.log(`📈 Fetched ${data.length} days of S&P 500 data`);
  console.log(`📈 Fetched ${vixData.length} days of VIX data`);

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

  // 365일 이동평균
  const ma365 = calculateMovingAverage(data, 365);
  const ma365Diff = currentPrice - ma365;
  const ma365DiffPercent = (ma365Diff / ma365) * 100;

  // 52주 최고/최저 (약 365일 데이터에서)
  const week52Data = data.slice(-365);
  const week52High = Math.max(...week52Data.map(d => d.close));
  const week52Low = Math.min(...week52Data.map(d => d.close));

  // VIX 데이터
  const currentVIX = vixData[vixData.length - 1];
  const vix = currentVIX.close;
  const previousVIX = vixData.length > 1 ? vixData[vixData.length - 2].close : vix;
  const vixChange = vix - previousVIX;
  const vixChangePercent = previousVIX !== 0 ? (vixChange / previousVIX) * 100 : 0;

  const newsletterData: Omit<NewsletterData, 'aiInsight' | 'newsSources'> = {
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
    ma365,
    ma365Diff,
    ma365DiffPercent,
    week52High,
    week52Low,
    vix,
    vixChange,
    vixChangePercent,
    peRatio: peRatio || undefined,
    fearGreedIndex: fearGreedData?.value,
    fearGreedClassification: fearGreedData?.classification
  };

  // AI 인사이트 생성
  const { insight: aiInsight, sources: newsSources } = await generateAIInsight(newsletterData);

  return {
    ...newsletterData,
    aiInsight,
    newsSources
  };
}

// 마크다운 뉴스레터 생성
function generateMarkdown(data: NewsletterData): string {
  const formatNumber = (num: number) => num.toFixed(2);
  const formatPercent = (num: number) => `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  const formatChange = (value: number, percent: number) =>
    `${value >= 0 ? '+' : ''}${formatNumber(value)} (${formatPercent(percent)})`;

  // 템플릿 파일 읽기
  const templatePath = path.join(process.cwd(), 'templates', 'economic-newsletter.md');
  let template = fs.readFileSync(templatePath, 'utf-8');

  // AI 인사이트와 뉴스 소스 포맷팅
  const aiInsight = data.aiInsight || 'No AI insight available.';

  let newsSources = '';
  if (data.newsSources && data.newsSources.length > 0) {
    newsSources = data.newsSources.map((source, index) =>
      `${index + 1}. [${source.title}](${source.url})`
    ).join('\n');
  } else {
    newsSources = 'No news sources available.';
  }

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
    ma365: formatNumber(data.ma365),
    ma365Diff: formatChange(data.ma365Diff, data.ma365DiffPercent).split(' (')[0],
    ma365DiffPercent: formatPercent(data.ma365DiffPercent),
    week52High: formatNumber(data.week52High),
    week52Low: formatNumber(data.week52Low),
    fromHigh: formatNumber(data.currentPrice - data.week52High),
    fromHighPercent: formatPercent((data.currentPrice - data.week52High) / data.week52High * 100),
    fromLow: formatNumber(data.currentPrice - data.week52Low),
    fromLowPercent: formatPercent((data.currentPrice - data.week52Low) / data.week52Low * 100),
    vix: formatNumber(data.vix),
    vixChange: formatChange(data.vixChange, data.vixChangePercent).split(' (')[0],
    vixChangePercent: formatPercent(data.vixChangePercent),
    peRatio: data.peRatio ? formatNumber(data.peRatio) : 'N/A',
    fearGreedIndex: data.fearGreedIndex?.toString() || 'N/A',
    fearGreedClassification: data.fearGreedClassification || 'N/A',
    aiInsight: aiInsight,
    newsSources: newsSources,
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
    `${value >= 0 ? '▲' : '▼'} ${value >= 0 ? '+' : ''}${formatNumber(value)} (${formatPercent(percent)})`;

  let aiInsightSection = '';
  if (data.aiInsight) {
    aiInsightSection = `\n\n🤖 AI Insight:\n${data.aiInsight}`;

    // 뉴스 출처 추가 (HTML 링크 형식)
    if (data.newsSources && data.newsSources.length > 0) {
      aiInsightSection += '\n\n📰 Sources:';
      data.newsSources.forEach((source, index) => {
        aiInsightSection += `\n${index + 1}. <a href="${source.url}">${source.title}</a>`;
      });
    }
  }

  const peSection = data.peRatio
    ? `💹 P/E Ratio: ${formatNumber(data.peRatio)}\n`
    : '';

  let fearGreedSection = '';
  if (data.fearGreedIndex !== undefined) {
    let emoji = '⚪';
    if (data.fearGreedClassification?.includes('Extreme Fear')) {
      emoji = '😱';
    } else if (data.fearGreedClassification?.includes('Fear')) {
      emoji = '😨';
    } else if (data.fearGreedClassification?.includes('Extreme Greed')) {
      emoji = '🤑';
    } else if (data.fearGreedClassification?.includes('Greed')) {
      emoji = '😃';
    }

    fearGreedSection = `

━━━━━━━━━━━━━━━━━━━━

📊 <b><a href="https://edition.cnn.com/markets/fear-and-greed">Fear &amp; Greed</a> Index</b>

${emoji} <b>${data.fearGreedIndex}</b> - ${data.fearGreedClassification}

Market sentiment indicator (0-100):
• <b>0-24</b>: 😱 Extreme Fear
• <b>25-44</b>: 😨 Fear
• <b>45-55</b>: ⚪ Neutral
• <b>56-75</b>: 😃 Greed
• <b>76-100</b>: 🤑 Extreme Greed`;
  }

  const bitcoinSection = `

━━━━━━━━━━━━━━━━━━━━

₿ <b>Bitcoin <a href="https://en.macromicro.me/series/8365/bitcoin-mvrv-zscore">MVRV</a> Z-Score</b>

Check the current Bitcoin MVRV Z-Score to identify market valuation:
• <b>&lt; 0</b>: 🟢 Undervalued (Buy zone)
• <b>&gt; 6</b>: 🔴 Overvalued (Sell zone)
• <b>0-6</b>: ⚪ Neutral zone`;

  return `📊 <b>Economic Daily Report</b>

📅 ${data.currentDate}

━━━━━━━━━━━━━━━━━━━━

📈 <b>S&P 500 Index</b>

💰 S&P 500: ${formatNumber(data.currentPrice)}

<b>Performance:</b>
  • DoD: ${formatChange(data.dayOverDay, data.dayOverDayPercent)}
  • WoW: ${formatChange(data.weekOverWeek, data.weekOverWeekPercent)}
  • YoY: ${formatChange(data.yearOverYear, data.yearOverYearPercent)}

<b>Moving Averages:</b>
  • 90-Day MA: ${formatNumber(data.ma90)}
    vs MA90: ${formatChange(data.ma90Diff, data.ma90DiffPercent)}
  • 365-Day MA: ${formatNumber(data.ma365)}
    vs MA365: ${formatChange(data.ma365Diff, data.ma365DiffPercent)}

<b>52-Week Range:</b>
  • High: ${formatNumber(data.week52High)} (${formatNumber((data.currentPrice - data.week52High) / data.week52High * 100)}% from high)
  • Low: ${formatNumber(data.week52Low)} (${formatNumber((data.currentPrice - data.week52Low) / data.week52Low * 100)}% from low)

<b>Market Indicators:</b>
😱 VIX (Fear Index): ${formatNumber(data.vix)}
    Daily Change: ${formatChange(data.vixChange, data.vixChangePercent)}
${peSection}${aiInsightSection}${fearGreedSection}${bitcoinSection}`;
}


// 메인 함수
async function main() {
  try {
    console.log('📊 Fetching S&P 500 data...');
    const data = await calculateNewsletterData();

    // 1. 먼저 마크다운 파일 생성 (AI 인사이트 및 뉴스 포함)
    console.log('📝 Generating newsletter markdown...');
    const markdown = generateMarkdown(data);
    const reportDir = path.join(process.cwd(), 'src', 'pages', 'report');

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // 실행 날짜를 기준으로 파일명 생성 (데이터 날짜가 아닌 실제 실행 날짜)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const filename = `economic-${year}-${month}-${day}.md`;
    const filepath = path.join(reportDir, filename);
    fs.writeFileSync(filepath, markdown);
    console.log(`✅ Newsletter saved to ${filepath}`);
    console.log(`🔗 URL: /report/economic-${year}-${month}-${day}/`);

    // 텔레그램 전송 비활성화 (주간 요약으로 대체)
    //     console.log('📱 Sending Telegram message...');
    //     const telegramMessage = generateTelegramMessage(data);
    //     await sendTelegramMessage({
    //   text: telegramMessage,
    //   parseMode: 'HTML'
    // });
    console.log('ℹ️  Telegram notification disabled (weekly summary enabled)');

    console.log('🎉 Newsletter generation completed!');
  } catch (error) {
    console.error('❌ Error generating newsletter:', error);
    process.exit(1);
  }
}

main();
