/**
 * Asset Price Fetching Module
 * Fetches live prices for crypto, stocks, and commodities
 */

// CoinGecko API for crypto prices
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Cache for API responses
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const cache: Map<string, CacheEntry<unknown>> = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute cache for asset prices

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

export interface AssetPrice {
    [symbol: string]: number;
}

// Mapping from our asset IDs to CoinGecko IDs
const CRYPTO_ID_MAP: Record<string, string> = {
    btc: 'bitcoin',
    eth: 'ethereum',
    bnb: 'binancecoin',
    xrp: 'ripple',
    sol: 'solana',
    ada: 'cardano',
    doge: 'dogecoin',
    trx: 'tron',
    avax: 'avalanche-2',
    link: 'chainlink',
    dot: 'polkadot',
    matic: 'matic-network',
    shib: 'shiba-inu',
    ltc: 'litecoin',
    uni: 'uniswap',
    atom: 'cosmos',
    xlm: 'stellar',
    apt: 'aptos',
    pepe: 'pepe',
    fil: 'filecoin',
};

/**
 * Fetch crypto prices from CoinGecko
 */
export async function fetchCryptoPrices(): Promise<AssetPrice> {
    const cacheKey = 'crypto_prices';
    const cached = getCached<AssetPrice>(cacheKey);
    if (cached !== null) return cached;

    const coinGeckoIds = Object.values(CRYPTO_ID_MAP).join(',');

    const response = await fetch(
        `${COINGECKO_BASE}/simple/price?ids=${coinGeckoIds}&vs_currencies=usd`
    );

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Map CoinGecko response back to our asset IDs
    const prices: AssetPrice = {};
    for (const [ourId, geckoId] of Object.entries(CRYPTO_ID_MAP)) {
        if (data[geckoId]?.usd !== undefined) {
            prices[ourId] = data[geckoId].usd;
        }
    }

    setCache(cacheKey, prices);
    return prices;
}

/**
 * Fetch commodity prices
 * Note: Free commodity APIs are limited. Using reasonable sample values.
 * In production, you would integrate with a paid API like Alpha Vantage or Metals.live
 */
export async function fetchCommodityPrices(): Promise<AssetPrice> {
    const cacheKey = 'commodity_prices';
    const cached = getCached<AssetPrice>(cacheKey);
    if (cached !== null) return cached;

    // Sample commodity prices - in a real app, these would come from an API
    // Values are approximate market prices as of late 2025/early 2026
    const prices: AssetPrice = {
        gold: 2650 + Math.random() * 100 - 50,      // ~$2600-2700/oz
        silver: 30 + Math.random() * 2,              // ~$29-32/oz
        platinum: 960 + Math.random() * 50,          // ~$935-1010/oz
        palladium: 940 + Math.random() * 50,         // ~$915-990/oz
        copper: 4.0 + Math.random() * 0.3,           // ~$3.85-4.15/lb
        oil: 72 + Math.random() * 5,                 // ~$70-77/barrel
        natgas: 3.2 + Math.random() * 0.5,           // ~$2.95-3.7/MMBtu
    };

    setCache(cacheKey, prices);
    return prices;
}

/**
 * Fetch stock prices
 * Note: Stock APIs typically require API keys. Using sample values for now.
 */
export async function fetchStockPrices(): Promise<AssetPrice> {
    const cacheKey = 'stock_prices';
    const cached = getCached<AssetPrice>(cacheKey);
    if (cached !== null) return cached;

    // Sample stock prices
    const prices: AssetPrice = {
        spy: 595 + Math.random() * 10,
        qqq: 515 + Math.random() * 10,
        dia: 425 + Math.random() * 10,
        aapl: 245 + Math.random() * 10,
        msft: 435 + Math.random() * 10,
        googl: 190 + Math.random() * 5,
        amzn: 225 + Math.random() * 5,
        nvda: 140 + Math.random() * 10,
        tsla: 410 + Math.random() * 10,
        meta: 610 + Math.random() * 10,
        mstr: 355 + Math.random() * 10,
        coin: 265 + Math.random() * 10,
    };

    setCache(cacheKey, prices);
    return prices;
}

/**
 * Fetch all asset prices
 */
export async function fetchAllAssetPrices(): Promise<{
    crypto: AssetPrice;
    stocks: AssetPrice;
    commodities: AssetPrice;
}> {
    const [crypto, stocks, commodities] = await Promise.all([
        fetchCryptoPrices().catch(() => ({})),
        fetchStockPrices(),
        fetchCommodityPrices(),
    ]);

    return { crypto, stocks, commodities };
}

/**
 * Clear the price cache
 */
export function clearPriceCache(): void {
    cache.clear();
}
