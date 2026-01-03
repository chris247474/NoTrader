import type {
  CoinGeckoPriceResponse,
  CoinGeckoHistoryResponse,
  FearGreedResponse,
  PriceData,
} from './types';
import { calculate20WeekSMA } from '../indicators/ma20w';
import { calculate200WeekMA } from '../indicators/ma200w';
import { calculatePiCycleProximity } from '../indicators/piCycle';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const FEAR_GREED_API = 'https://api.alternative.me/fng';

// Cache for API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: Map<string, CacheEntry<unknown>> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

/**
 * Fetch current Bitcoin price from CoinGecko
 */
export async function fetchCurrentPrice(): Promise<number> {
  const cacheKey = 'btc_price';
  const cached = getCached<number>(cacheKey);
  if (cached !== null) return cached;

  try {
    const response = await fetch(
      `${COINGECKO_BASE}/simple/price?ids=bitcoin&vs_currencies=usd`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: CoinGeckoPriceResponse = await response.json();
    const price = data.bitcoin.usd;
    setCache(cacheKey, price);
    return price;
  } catch (error) {
    console.error('Failed to fetch current price:', error);
    throw error;
  }
}

/**
 * Fetch historical Bitcoin prices from CoinGecko
 * Returns daily prices for the specified number of days
 */
export async function fetchHistoricalPrices(days: number = 1400): Promise<[number, number][]> {
  const cacheKey = `btc_history_${days}`;
  const cached = getCached<[number, number][]>(cacheKey);
  if (cached !== null) return cached;

  try {
    const response = await fetch(
      `${COINGECKO_BASE}/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: CoinGeckoHistoryResponse = await response.json();
    setCache(cacheKey, data.prices);
    return data.prices;
  } catch (error) {
    console.error('Failed to fetch historical prices:', error);
    throw error;
  }
}

/**
 * Fetch Fear & Greed Index
 * Returns array of { value, date } objects
 */
export async function fetchFearGreedIndex(limit: number = 30): Promise<{ value: number; date: string }[]> {
  const cacheKey = `fng_${limit}`;
  const cached = getCached<{ value: number; date: string }[]>(cacheKey);
  if (cached !== null) return cached;

  try {
    const response = await fetch(`${FEAR_GREED_API}/?limit=${limit}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: FearGreedResponse = await response.json();
    const result = data.data.map((d) => ({
      value: parseInt(d.value, 10),
      date: new Date(parseInt(d.timestamp, 10) * 1000).toISOString().split('T')[0],
    }));
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Failed to fetch Fear & Greed:', error);
    throw error;
  }
}

/**
 * Calculate Simple Moving Average from price array
 */
function calculateSMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/**
 * Convert daily prices to weekly closes (Sunday close)
 */
function toWeeklyCloses(dailyPrices: [number, number][]): { date: string; price: number }[] {
  const weeklyMap = new Map<string, { date: string; price: number }>();

  for (const [timestamp, price] of dailyPrices) {
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
 * Build PriceData array from live API data
 * Note: MVRV data is not available from free APIs, so it will be null
 */
export async function buildLivePriceData(): Promise<PriceData[]> {
  try {
    // Fetch historical prices (enough for 200W MA calculation)
    const dailyPrices = await fetchHistoricalPrices(1500);
    const weeklyCloses = toWeeklyCloses(dailyPrices);

    // Fetch Fear & Greed data
    let fgData: Map<string, number> = new Map();
    try {
      const fgArray = await fetchFearGreedIndex(365);
      fgData = new Map(fgArray.map((d) => [d.date, d.value]));
    } catch (e) {
      console.warn('Fear & Greed data unavailable:', e);
    }

    // Calculate indicators for each weekly close
    const priceData: PriceData[] = [];
    const prices = weeklyCloses.map((w) => w.price);

    for (let i = 0; i < weeklyCloses.length; i++) {
      const weekly = weeklyCloses[i];
      const pricesUpToNow = prices.slice(0, i + 1);

      // Calculate MAs
      const ma20w = calculate20WeekSMA(pricesUpToNow);
      const ma200w = calculate200WeekMA(pricesUpToNow);

      // Calculate DMAs for Pi Cycle (need daily data)
      // Using weekly as approximation (not as accurate)
      const dma111 = calculateSMA(pricesUpToNow, Math.min(16, pricesUpToNow.length)); // ~111 days in weeks
      const dma350 = calculateSMA(pricesUpToNow, Math.min(50, pricesUpToNow.length)); // ~350 days in weeks

      // Pi Cycle proximity
      let piCycleProx: number | null = null;
      if (dma111 !== null && dma350 !== null && dma350 > 0) {
        piCycleProx = calculatePiCycleProximity(dma111, dma350);
      }

      priceData.push({
        date: weekly.date,
        price: weekly.price,
        ma20w,
        ma200w,
        mvrv: null, // Not available from free APIs
        fearGreed: fgData.get(weekly.date) ?? null,
        piCycleProx,
        dma111,
        dma350,
      });
    }

    return priceData;
  } catch (error) {
    console.error('Failed to build live price data:', error);
    throw error;
  }
}

/**
 * Fetch latest data point with all available indicators
 */
export async function fetchLatestData(): Promise<PriceData | null> {
  try {
    const priceData = await buildLivePriceData();
    if (priceData.length === 0) return null;

    // Get the most recent data point
    const latest = priceData[priceData.length - 1];

    // Try to get current price for more accuracy
    try {
      const currentPrice = await fetchCurrentPrice();
      latest.price = currentPrice;
    } catch (e) {
      console.warn('Could not fetch current price:', e);
    }

    // Try to get latest Fear & Greed
    try {
      const fgData = await fetchFearGreedIndex(1);
      if (fgData.length > 0) {
        latest.fearGreed = fgData[0].value;
      }
    } catch (e) {
      console.warn('Could not fetch Fear & Greed:', e);
    }

    return latest;
  } catch (error) {
    console.error('Failed to fetch latest data:', error);
    throw error;
  }
}

/**
 * Clear the cache (useful for forcing a refresh)
 */
export function clearCache(): void {
  cache.clear();
}
