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
  const [data, vixData, peRatio] = await Promise.all([
    fetchSP500Data(),
    fetchVIXData(),
    fetchPERatio()
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
    peRatio: peRatio || undefined
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
  const templatePath = path.join(process.cwd(), 'templates', 'sp500-newsletter.md');
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
    ? `\n💹 P/E Ratio: ${formatNumber(data.peRatio)}`
    : '';

  return `📊 S&P 500 Daily Report

📅 ${data.currentDate}
💰 Current: ${formatNumber(data.currentPrice)}

📈 Performance:
  • DoD: ${formatChange(data.dayOverDay, data.dayOverDayPercent)}
  • WoW: ${formatChange(data.weekOverWeek, data.weekOverWeekPercent)}
  • YoY: ${formatChange(data.yearOverYear, data.yearOverYearPercent)}

📊 Moving Averages:
  • 90-Day MA: ${formatNumber(data.ma90)}
    vs MA90: ${formatChange(data.ma90Diff, data.ma90DiffPercent)}
  • 365-Day MA: ${formatNumber(data.ma365)}
    vs MA365: ${formatChange(data.ma365Diff, data.ma365DiffPercent)}

📏 52-Week Range:
  • High: ${formatNumber(data.week52High)} (${formatNumber((data.currentPrice - data.week52High) / data.week52High * 100)}% from high)
  • Low: ${formatNumber(data.week52Low)} (${formatNumber((data.currentPrice - data.week52Low) / data.week52Low * 100)}% from low)


😱 VIX (Fear Index): ${formatNumber(data.vix)}
    Daily Change: ${formatChange(data.vixChange, data.vixChangePercent)}${peSection}${aiInsightSection}`;
}


// 메인 함수
async function main() {
  try {
    console.log('📊 Fetching S&P 500 data...');
    const data = await calculateNewsletterData();

    // 1. 먼저 마크다운 파일 생성 (AI 인사이트 및 뉴스 포함)
    console.log('📝 Generating newsletter markdown...');
    const markdown = generateMarkdown(data);
    const newsletterDir = path.join(process.cwd(), 'newsletters');

    if (!fs.existsSync(newsletterDir)) {
      fs.mkdirSync(newsletterDir, { recursive: true });
    }

    // 실행 날짜를 기준으로 파일명 생성 (데이터 날짜가 아닌 실제 실행 날짜)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const filename = `sp500-${year}-${month}-${day}.md`;
    const filepath = path.join(newsletterDir, filename);
    fs.writeFileSync(filepath, markdown);
    console.log(`✅ Newsletter saved to ${filepath}`);

    // 2. 그 다음 텔레그램 메시지 전송 (HTML 모드)
    console.log('📱 Sending Telegram message...');
    const telegramMessage = generateTelegramMessage(data);
    await sendTelegramMessage({
      text: telegramMessage,
      parseMode: 'HTML'
    });

    console.log('🎉 Newsletter generation completed!');
  } catch (error) {
    console.error('❌ Error generating newsletter:', error);
    process.exit(1);
  }
}

main();
