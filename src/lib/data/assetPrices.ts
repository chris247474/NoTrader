/**
 * Asset Price Fetching Module
 * Fetches live prices for crypto, stocks, and commodities
 */

// CoinGecko API for crypto prices
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Yahoo Finance API for stocks and commodities (no API key required)
// Note: Yahoo Finance blocks CORS, so we use a proxy for browser requests
const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

// CORS proxy to bypass Yahoo Finance CORS restrictions
// Using corsproxy.io which is reliable and free for client-side requests
const CORS_PROXY = 'https://corsproxy.io/?';

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
    gold: 'GC=F',      // Gold Futures
    silver: 'SI=F',    // Silver Futures
    platinum: 'PL=F',  // Platinum Futures
    palladium: 'PA=F', // Palladium Futures
    copper: 'HG=F',    // Copper Futures
    oil: 'BZ=F',       // Brent Crude Oil Futures
    natgas: 'NG=F',    // Natural Gas Futures
};

/**
 * Fetch a single price from Yahoo Finance
 * Uses CORS proxy to bypass browser CORS restrictions
 */
async function fetchYahooPrice(symbol: string): Promise<number | null> {
    try {
        const yahooUrl = `${YAHOO_FINANCE_BASE}/${symbol}?interval=1d&range=1d`;
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(yahooUrl)}`;

        const response = await fetch(proxyUrl);

        if (!response.ok) {
            console.warn(`Yahoo Finance returned ${response.status} for ${symbol}`);
            return null;
        }

        const data = await response.json();
        const result = data?.chart?.result?.[0];

        if (!result) {
            return null;
        }

        // Get the current price from regularMarketPrice or the last close
        const price = result.meta?.regularMarketPrice ??
            result.indicators?.quote?.[0]?.close?.slice(-1)?.[0];

        return typeof price === 'number' ? price : null;
    } catch (error) {
        console.warn(`Failed to fetch Yahoo price for ${symbol}:`, error);
        return null;
    }
}

/**
 * Fetch multiple prices from Yahoo Finance in parallel
 */
async function fetchYahooPrices(symbolMap: Record<string, string>): Promise<AssetPrice> {
    const entries = Object.entries(symbolMap);
    const results = await Promise.all(
        entries.map(async ([ourId, yahooSymbol]) => {
            const price = await fetchYahooPrice(yahooSymbol);
            return [ourId, price] as [string, number | null];
        })
    );

    const prices: AssetPrice = {};
    for (const [ourId, price] of results) {
        if (price !== null) {
            prices[ourId] = price;
        }
    }

    return prices;
}

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
 * Fetch commodity prices from Yahoo Finance
 */
export async function fetchCommodityPrices(): Promise<AssetPrice> {
    const cacheKey = 'commodity_prices';
    const cached = getCached<AssetPrice>(cacheKey);
    if (cached !== null) return cached;

    const prices = await fetchYahooPrices(COMMODITY_SYMBOL_MAP);

    // Only cache if we got at least some prices
    if (Object.keys(prices).length > 0) {
        setCache(cacheKey, prices);
    }

    return prices;
}

/**
 * Fetch stock prices from Yahoo Finance
 */
export async function fetchStockPrices(): Promise<AssetPrice> {
    const cacheKey = 'stock_prices';
    const cached = getCached<AssetPrice>(cacheKey);
    if (cached !== null) return cached;

    const prices = await fetchYahooPrices(STOCK_SYMBOL_MAP);

    // Only cache if we got at least some prices
    if (Object.keys(prices).length > 0) {
        setCache(cacheKey, prices);
    }

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
        fetchStockPrices().catch(() => ({})),
        fetchCommodityPrices().catch(() => ({})),
    ]);

    return { crypto, stocks, commodities };
}

/**
 * Clear the price cache
 */
export function clearPriceCache(): void {
    cache.clear();
}
