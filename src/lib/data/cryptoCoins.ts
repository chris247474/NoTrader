/**
 * Crypto Coins Module
 * Fetches top cryptocurrencies from CoinGecko API
 */

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Cache for coin list
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let coinsCache: CacheEntry<CryptoCoin[]> | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

export interface CryptoCoin {
  id: string;           // CoinGecko ID (e.g., "bitcoin")
  symbol: string;       // Symbol (e.g., "btc")
  name: string;         // Name (e.g., "Bitcoin")
  image: string;        // Image URL
  currentPrice: number;
  marketCap: number;
  marketCapRank: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
}

/**
 * Fetch top cryptocurrencies by market cap from CoinGecko
 * Fetches in batches of 250 (CoinGecko's max per page)
 */
export async function fetchTopCoins(limit: number = 500): Promise<CryptoCoin[]> {
  // Check cache
  if (coinsCache && Date.now() - coinsCache.timestamp < CACHE_TTL) {
    return coinsCache.data.slice(0, limit);
  }

  const coins: CryptoCoin[] = [];
  const perPage = 250; // CoinGecko max
  const pages = Math.ceil(limit / perPage);

  try {
    for (let page = 1; page <= pages; page++) {
      const url = `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('CoinGecko rate limited, using cached data if available');
          if (coinsCache) return coinsCache.data.slice(0, limit);
          throw new Error('Rate limited and no cache available');
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      for (const coin of data) {
        coins.push({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          image: coin.image,
          currentPrice: coin.current_price || 0,
          marketCap: coin.market_cap || 0,
          marketCapRank: coin.market_cap_rank || coins.length + 1,
          priceChange24h: coin.price_change_24h || 0,
          priceChangePercentage24h: coin.price_change_percentage_24h || 0,
        });
      }

      // Small delay between requests to avoid rate limiting
      if (page < pages) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // Update cache
    coinsCache = { data: coins, timestamp: Date.now() };
    return coins.slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch top coins:', error);
    // Return cached data if available
    if (coinsCache) {
      console.log('Returning cached coin data');
      return coinsCache.data.slice(0, limit);
    }
    throw error;
  }
}

/**
 * Get a single coin by its CoinGecko ID
 */
export async function getCoinById(coinId: string): Promise<CryptoCoin | null> {
  const coins = await fetchTopCoins(500);
  return coins.find(c => c.id === coinId) || null;
}

/**
 * Get a coin by symbol (e.g., "BTC")
 */
export async function getCoinBySymbol(symbol: string): Promise<CryptoCoin | null> {
  const coins = await fetchTopCoins(500);
  return coins.find(c => c.symbol.toUpperCase() === symbol.toUpperCase()) || null;
}

/**
 * Clear the coins cache
 */
export function clearCoinsCache(): void {
  coinsCache = null;
}
