import https from 'https';

// ==================== Types ====================

export interface SPData {
  date: string;
  close: number;
}

export interface FREDSeriesData {
  date: string;
  value: number;
}

export interface MacroIndicators {
  federalFundsRate: number | null;
  cpiYoY: number | null;
  realRate: number | null;
  m2YoY: number | null;
  m2MoM: number | null;
  consumerSentiment: number | null;
}

export interface ValuationIndicators {
  spForwardPE: number | null;
}

export interface SentimentIndicators {
  fearGreedIndex: number | null;
  fearGreedClassification: string | null;
  sp500Price: number;
  sp500MA200: number;
  trendSignal: 'bullish' | 'bearish';
}

export interface BitcoinMetrics {
  marketCap: number;
  realizedCap: number;
  mvrvZScore: number;
  date: string;
}

export interface FearGreedData {
  value: number;
  classification: string;
}

// ==================== Yahoo Finance API ====================

export async function fetchYahooFinanceData(symbol: string, days: number = 550): Promise<SPData[]> {
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

          console.log(`✅ Fetched ${prices.length} data points for ${symbol}`);
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

export async function fetchSP500Data(): Promise<SPData[]> {
  return fetchYahooFinanceData('^GSPC', 550);
}

// ==================== FRED API ====================

export async function fetchFREDSeries(
  seriesId: string,
  apiKey: string,
  limit: number = 13
): Promise<FREDSeriesData[]> {
  return new Promise((resolve, reject) => {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=${limit}`;

    console.log(`📊 Fetching FRED series: ${seriesId}...`);

    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`FRED API returned status ${res.statusCode}`));
          return;
        }

        try {
          const jsonData = JSON.parse(data);

          if (!jsonData.observations || jsonData.observations.length === 0) {
            console.warn(`⚠️  No data for FRED series ${seriesId}`);
            resolve([]);
            return;
          }

          const results: FREDSeriesData[] = jsonData.observations
            .filter((obs: any) => obs.value !== '.')
            .map((obs: any) => ({
              date: obs.date,
              value: parseFloat(obs.value)
            }));

          console.log(`✅ Fetched ${results.length} observations for ${seriesId}`);
          resolve(results);
        } catch (err) {
          reject(new Error(`Failed to parse FRED response: ${err}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

export async function fetchMacroIndicators(apiKey: string): Promise<MacroIndicators> {
  if (!apiKey) {
    console.warn('⚠️  FRED_API_KEY not found, skipping macro indicators');
    return {
      federalFundsRate: null,
      cpiYoY: null,
      realRate: null,
      m2YoY: null,
      m2MoM: null,
      consumerSentiment: null
    };
  }

  try {
    // UMCSENT = University of Michigan Consumer Sentiment (proxy for economic sentiment)
    const [ffrData, cpiData, m2Data, sentimentData] = await Promise.all([
      fetchFREDSeries('FEDFUNDS', apiKey, 1).catch(() => []),
      fetchFREDSeries('CPIAUCSL', apiKey, 13).catch(() => []),
      fetchFREDSeries('M2SL', apiKey, 13).catch(() => []),
      fetchFREDSeries('UMCSENT', apiKey, 1).catch(() => [])  // Consumer Sentiment Index
    ]);

    // Current FFR
    const federalFundsRate = ffrData.length > 0 ? ffrData[0].value : null;

    // CPI YoY calculation (need 13 data points: current + 12 months ago)
    let cpiYoY: number | null = null;
    if (cpiData.length >= 13) {
      const currentCPI = cpiData[0].value;
      const yearAgoCPI = cpiData[12].value;
      cpiYoY = ((currentCPI - yearAgoCPI) / yearAgoCPI) * 100;
    } else if (cpiData.length >= 2) {
      // Fallback: use available data
      const currentCPI = cpiData[0].value;
      const oldestCPI = cpiData[cpiData.length - 1].value;
      const monthsAgo = cpiData.length - 1;
      cpiYoY = ((currentCPI - oldestCPI) / oldestCPI) * 100 * (12 / monthsAgo);
    }

    // Real Rate
    const realRate = (federalFundsRate !== null && cpiYoY !== null)
      ? federalFundsRate - cpiYoY
      : null;

    // M2 YoY calculation (need 13 data points: current + 12 months ago)
    let m2YoY: number | null = null;
    if (m2Data.length >= 13) {
      const currentM2 = m2Data[0].value;
      const yearAgoM2 = m2Data[12].value;
      m2YoY = ((currentM2 - yearAgoM2) / yearAgoM2) * 100;
    } else if (m2Data.length >= 2) {
      const currentM2 = m2Data[0].value;
      const oldestM2 = m2Data[m2Data.length - 1].value;
      const monthsAgo = m2Data.length - 1;
      m2YoY = ((currentM2 - oldestM2) / oldestM2) * 100 * (12 / monthsAgo);
    }

    // M2 MoM calculation (need at least 2 data points)
    let m2MoM: number | null = null;
    if (m2Data.length >= 2) {
      const currentM2 = m2Data[0].value;
      const lastMonthM2 = m2Data[1].value;
      m2MoM = ((currentM2 - lastMonthM2) / lastMonthM2) * 100;
    }

    // Consumer Sentiment Index (UMCSENT) - typically ranges from 50-110
    // Historical average is around 85-90, below 70 indicates pessimism
    const consumerSentiment = sentimentData.length > 0 ? sentimentData[0].value : null;

    console.log(`📈 Macro Indicators Summary:`);
    console.log(`   FFR: ${federalFundsRate?.toFixed(2) ?? 'N/A'}%`);
    console.log(`   CPI YoY: ${cpiYoY?.toFixed(2) ?? 'N/A'}%`);
    console.log(`   Real Rate: ${realRate?.toFixed(2) ?? 'N/A'}%`);
    console.log(`   M2 YoY: ${m2YoY?.toFixed(2) ?? 'N/A'}%`);
    console.log(`   M2 MoM: ${m2MoM?.toFixed(2) ?? 'N/A'}%`);
    console.log(`   Consumer Sentiment: ${consumerSentiment?.toFixed(1) ?? 'N/A'}`);

    return {
      federalFundsRate,
      cpiYoY,
      realRate,
      m2YoY,
      m2MoM,
      consumerSentiment
    };
  } catch (error) {
    console.warn(`⚠️  Failed to fetch macro indicators: ${error}`);
    return {
      federalFundsRate: null,
      cpiYoY: null,
      realRate: null,
      m2YoY: null,
      m2MoM: null,
      consumerSentiment: null
    };
  }
}

// ==================== P/E Ratio (multpl.com) ====================

export async function fetchPERatio(): Promise<number | null> {
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

// ==================== Bitcoin MVRV (CoinMetrics) ====================

export async function fetchBitcoinMVRVData(): Promise<BitcoinMetrics | null> {
  return new Promise((resolve) => {
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

          const allData = jsonData.data;
          const latestData = allData[allData.length - 1];

          const marketCap = parseFloat(latestData.CapMrktCurUSD);
          const realizedCap = parseFloat(latestData.CapRealUSD);

          if (isNaN(marketCap) || isNaN(realizedCap)) {
            console.warn('⚠️  Invalid Bitcoin market data');
            resolve(null);
            return;
          }

          // Calculate standard deviation for Z-Score
          const marketCaps = allData.map((d: any) => parseFloat(d.CapMrktCurUSD)).filter((v: number) => !isNaN(v));
          const mean = marketCaps.reduce((sum: number, val: number) => sum + val, 0) / marketCaps.length;
          const variance = marketCaps.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / marketCaps.length;
          const stdDev = Math.sqrt(variance);

          const mvrvZScore = (marketCap - realizedCap) / stdDev;

          console.log(`✅ Bitcoin MVRV Z-Score: ${mvrvZScore.toFixed(2)}`);

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

// ==================== Fear & Greed Index (alternative.me) ====================

export async function fetchFearGreedIndex(): Promise<FearGreedData | null> {
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

// ==================== Utility Functions ====================

export function calculateMovingAverage(data: SPData[], days: number): number {
  const slice = data.slice(-days);
  const sum = slice.reduce((acc, item) => acc + item.close, 0);
  return sum / slice.length;
}
