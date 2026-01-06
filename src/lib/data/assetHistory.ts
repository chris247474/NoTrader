/**
 * Historical Asset Data Fetching Module
 * Fetches historical price data for crypto, stocks, and commodities
 */

import { calculate20WeekSMA } from '../indicators/ma20w';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const CORS_PROXY = 'https://corsproxy.io/?';
const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

// Cache for API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: Map<string, CacheEntry<unknown>> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache for historical data

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Mapping from our asset IDs to Yahoo Finance symbols
const STOCK_SYMBOL_MAP: Record<string, string> = {
  spy: 'SPY',
  qqq: 'QQQ',
  dia: 'DIA',
  aapl: 'AAPL',
  msft: 'MSFT',
  googl: 'GOOGL',
  amzn: 'AMZN',
  nvda: 'NVDA',
  tsla: 'TSLA',
  meta: 'META',
  mstr: 'MSTR',
  coin: 'COIN',
};

// Mapping from our asset IDs to Yahoo Finance commodity symbols
const COMMODITY_SYMBOL_MAP: Record<string, string> = {
  gold: 'GC=F',
  silver: 'SI=F',
  platinum: 'PL=F',
  palladium: 'PA=F',
  copper: 'HG=F',
  oil: 'BZ=F',
  natgas: 'NG=F',
};

export type AssetCategory = 'crypto' | 'stocks' | 'commodities';

export interface AssetPricePoint {
  date: string;
  price: number;
  ma20w: number | null;
}

export interface TrendFlip {
  date: string;
  price: number;
  type: 'BULL' | 'BEAR';
}

export interface AssetHistoryData {
  symbol: string;
  name: string;
  category: AssetCategory;
  priceData: AssetPricePoint[];
  trendFlips: TrendFlip[];
  currentTrend: 'BULL' | 'BEAR' | 'NO_DATA';
  lastFlipDate: string | null;
}

/**
 * Convert daily prices to weekly closes (Sunday close)
 */
function toWeeklyCloses(dailyPrices: { timestamp: number; price: number }[]): { date: string; price: number }[] {
  const weeklyMap = new Map<string, { date: string; price: number }>();

  for (const { timestamp, price } of dailyPrices) {
    const date = new Date(timestamp);
    // Get the Sunday of this week
    const day = date.getDay();
    const sunday = new Date(date);
    sunday.setDate(date.getDate() + (7 - day) % 7);
    const weekKey = sunday.toISOString().split('T')[0];

    // Take the latest price for each week
    weeklyMap.set(weekKey, { date: weekKey, price });
  }

  return Array.from(weeklyMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * Calculate trend flips from price data
 */
function calculateTrendFlips(priceData: AssetPricePoint[]): TrendFlip[] {
  const flips: TrendFlip[] = [];
  let previousTrend: 'BULL' | 'BEAR' | null = null;

  for (const point of priceData) {
    if (point.ma20w === null) continue;

    const currentTrend: 'BULL' | 'BEAR' = point.price >= point.ma20w ? 'BULL' : 'BEAR';

    if (previousTrend !== null && currentTrend !== previousTrend) {
      flips.push({
        date: point.date,
        price: point.price,
        type: currentTrend,
      });
    }

    previousTrend = currentTrend;
  }

  return flips;
}

/**
 * Fetch historical crypto data from CoinGecko
 * @param coinId - CoinGecko coin ID (e.g., "bitcoin", "ethereum")
 * @param coinName - Display name (e.g., "Bitcoin")
 * @param coinSymbol - Symbol (e.g., "BTC")
 */
async function fetchCryptoHistory(
  coinId: string,
  coinName?: string,
  coinSymbol?: string,
  days: number = 730
): Promise<AssetHistoryData | null> {
  const cacheKey = `crypto_history_${coinId}_${days}`;
  const cached = getCached<AssetHistoryData>(cacheKey);
  if (cached !== null) return cached;

  try {
    // Try direct request first, fall back to CORS proxy if needed
    const directUrl = `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;

    let response: Response;
    try {
      response = await fetch(directUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (directError) {
      // If direct request fails, try with CORS proxy
      console.log(`Direct CoinGecko request failed, trying CORS proxy...`);
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(directUrl)}`;
      response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    }

    const data = await response.json();
    const dailyPrices = data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price,
    }));

    const weeklyCloses = toWeeklyCloses(dailyPrices);
    const prices = weeklyCloses.map(w => w.price);

    // Calculate 20W SMA for each point
    const priceData: AssetPricePoint[] = weeklyCloses.map((weekly, i) => {
      const pricesUpToNow = prices.slice(0, i + 1);
      const ma20w = calculate20WeekSMA(pricesUpToNow);
      return {
        date: weekly.date,
        price: weekly.price,
        ma20w,
      };
    });

    const trendFlips = calculateTrendFlips(priceData);
    const lastPoint = priceData[priceData.length - 1];
    const currentTrend: 'BULL' | 'BEAR' | 'NO_DATA' =
      lastPoint?.ma20w === null ? 'NO_DATA' :
        lastPoint.price >= lastPoint.ma20w ? 'BULL' : 'BEAR';

    // Use provided name/symbol or derive from coinId
    const displayName = coinName || coinId.charAt(0).toUpperCase() + coinId.slice(1).replace(/-/g, ' ');
    const displaySymbol = coinSymbol || coinId.toUpperCase();

    const result: AssetHistoryData = {
      symbol: displaySymbol,
      name: displayName,
      category: 'crypto',
      priceData,
      trendFlips,
      currentTrend,
      lastFlipDate: trendFlips.length > 0 ? trendFlips[trendFlips.length - 1].date : null,
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Failed to fetch crypto history for ${coinId}:`, error);
    return null;
  }
}

/**
 * Fetch historical stock/commodity data from Yahoo Finance
 */
async function fetchYahooHistory(
  assetId: string,
  yahooSymbol: string,
  category: AssetCategory,
  range: string = '2y'
): Promise<AssetHistoryData | null> {
  const cacheKey = `${category}_history_${assetId}_${range}`;
  const cached = getCached<AssetHistoryData>(cacheKey);
  if (cached !== null) return cached;

  try {
    const yahooUrl = `${YAHOO_FINANCE_BASE}/${yahooSymbol}?interval=1d&range=${range}`;
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(yahooUrl)}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];

    if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
      console.warn(`No data available for ${yahooSymbol}`);
      return null;
    }

    const timestamps = result.timestamp as number[];
    const closes = result.indicators.quote[0].close as (number | null)[];
    const name = result.meta?.shortName || result.meta?.symbol || yahooSymbol;

    // Convert to daily prices format
    const dailyPrices: { timestamp: number; price: number }[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      const price = closes[i];
      if (price !== null && price !== undefined) {
        dailyPrices.push({
          timestamp: timestamps[i] * 1000, // Yahoo returns seconds, convert to ms
          price,
        });
      }
    }

    if (dailyPrices.length === 0) {
      return null;
    }

    const weeklyCloses = toWeeklyCloses(dailyPrices);
    const prices = weeklyCloses.map(w => w.price);

    // Calculate 20W SMA for each point
    const priceData: AssetPricePoint[] = weeklyCloses.map((weekly, i) => {
      const pricesUpToNow = prices.slice(0, i + 1);
      const ma20w = calculate20WeekSMA(pricesUpToNow);
      return {
        date: weekly.date,
        price: weekly.price,
        ma20w,
      };
    });

    const trendFlips = calculateTrendFlips(priceData);
    const lastPoint = priceData[priceData.length - 1];
    const currentTrend: 'BULL' | 'BEAR' | 'NO_DATA' =
      lastPoint?.ma20w === null ? 'NO_DATA' :
        lastPoint.price >= lastPoint.ma20w ? 'BULL' : 'BEAR';

    const historyData: AssetHistoryData = {
      symbol: assetId.toUpperCase(),
      name,
      category,
      priceData,
      trendFlips,
      currentTrend,
      lastFlipDate: trendFlips.length > 0 ? trendFlips[trendFlips.length - 1].date : null,
    };

    setCache(cacheKey, historyData);
    return historyData;
  } catch (error) {
    console.error(`Failed to fetch Yahoo history for ${yahooSymbol}:`, error);
    return null;
  }
}

/**
 * Fetch historical data for any asset
 */
export async function fetchAssetHistory(
  assetId: string,
  category: AssetCategory
): Promise<AssetHistoryData | null> {
  switch (category) {
    case 'crypto':
      return fetchCryptoHistory(assetId);

    case 'stocks': {
      const yahooSymbol = STOCK_SYMBOL_MAP[assetId];
      if (!yahooSymbol) {
        console.warn(`Unknown stock asset ID: ${assetId}`);
        return null;
      }
      return fetchYahooHistory(assetId, yahooSymbol, 'stocks', '2y');
    }

    case 'commodities': {
      const yahooSymbol = COMMODITY_SYMBOL_MAP[assetId];
      if (!yahooSymbol) {
        console.warn(`Unknown commodity asset ID: ${assetId}`);
        return null;
      }
      return fetchYahooHistory(assetId, yahooSymbol, 'commodities', '2y');
    }

    default:
      console.warn(`Unknown category: ${category}`);
      return null;
  }
}

/**
 * Get Yahoo Finance symbol for an asset
 */
export function getYahooSymbol(assetId: string, category: AssetCategory): string | null {
  switch (category) {
    case 'stocks':
      return STOCK_SYMBOL_MAP[assetId] || null;
    case 'commodities':
      return COMMODITY_SYMBOL_MAP[assetId] || null;
    default:
      return null;
  }
}

/**
 * Clear the history cache
 */
export function clearHistoryCache(): void {
  cache.clear();
}
