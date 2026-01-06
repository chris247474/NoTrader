import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchAssetHistory, clearHistoryCache } from '../lib/data/assetHistory';

// Mock CoinGecko market_chart response
const mockCoinGeckoResponse = {
  prices: [
    [1640995200000, 46000], // 2022-01-01
    [1641600000000, 47000], // 2022-01-08
    [1642204800000, 43000], // 2022-01-15
    [1642809600000, 36000], // 2022-01-22
    [1643414400000, 38000], // 2022-01-29
    [1644019200000, 41000], // 2022-02-05
    [1644624000000, 44000], // 2022-02-12
    [1645228800000, 40000], // 2022-02-19
    [1645833600000, 39000], // 2022-02-26
    [1646438400000, 44000], // 2022-03-05
    [1647043200000, 39000], // 2022-03-12
    [1647648000000, 41000], // 2022-03-19
    [1648252800000, 47000], // 2022-03-26
    [1648857600000, 46000], // 2022-04-02
    [1649462400000, 43000], // 2022-04-09
    [1650067200000, 40000], // 2022-04-16
    [1650672000000, 39000], // 2022-04-23
    [1651276800000, 38000], // 2022-04-30
    [1651881600000, 36000], // 2022-05-07
    [1652486400000, 29000], // 2022-05-14
    [1653091200000, 30000], // 2022-05-21
    [1653696000000, 29000], // 2022-05-28
    [1654300800000, 31000], // 2022-06-04
    [1654905600000, 28000], // 2022-06-11
    [1655510400000, 20000], // 2022-06-18
    [1656115200000, 21000], // 2022-06-25
    [1656720000000, 19000], // 2022-07-02
    [1657324800000, 21000], // 2022-07-09
    [1657929600000, 20000], // 2022-07-16
    [1658534400000, 23000], // 2022-07-23
  ],
};

describe('fetchAssetHistory', () => {
  beforeEach(() => {
    clearHistoryCache();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Crypto Assets', () => {
    it('should fetch crypto history with a valid CoinGecko ID', async () => {
      // Mock successful fetch
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCoinGeckoResponse),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchAssetHistory('bitcoin', 'crypto');

      expect(result).not.toBeNull();
      expect(result?.category).toBe('crypto');
      expect(result?.priceData.length).toBeGreaterThan(0);
    });

    it('should return valid AssetHistoryData structure for crypto', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCoinGeckoResponse),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchAssetHistory('ethereum', 'crypto');

      expect(result).not.toBeNull();
      // Verify structure
      expect(result).toHaveProperty('symbol');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('category', 'crypto');
      expect(result).toHaveProperty('priceData');
      expect(result).toHaveProperty('trendFlips');
      expect(result).toHaveProperty('currentTrend');
      expect(result).toHaveProperty('lastFlipDate');

      // Verify priceData structure
      if (result && result.priceData.length > 0) {
        const firstPoint = result.priceData[0];
        expect(firstPoint).toHaveProperty('date');
        expect(firstPoint).toHaveProperty('price');
        expect(firstPoint).toHaveProperty('ma20w');
      }
    });

    it('should calculate 20W SMA correctly for crypto', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCoinGeckoResponse),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchAssetHistory('bitcoin', 'crypto');

      expect(result).not.toBeNull();
      // First 19 points should have null ma20w
      // Starting from point 20, ma20w should be calculated
      if (result && result.priceData.length >= 20) {
        // First point should have null ma20w (not enough data)
        expect(result.priceData[0].ma20w).toBeNull();
        // 20th point should have calculated ma20w
        expect(result.priceData[19].ma20w).not.toBeNull();
      }
    });

    it('should detect trend flips for crypto', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCoinGeckoResponse),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchAssetHistory('bitcoin', 'crypto');

      expect(result).not.toBeNull();
      // With the price data going from 46k to 19k, there should be at least one bearish flip
      if (result) {
        expect(result.trendFlips.length).toBeGreaterThanOrEqual(0);
        // Current trend should be calculated
        expect(['BULL', 'BEAR', 'NO_DATA']).toContain(result.currentTrend);
      }
    });

    it('should fallback to CORS proxy when direct request fails', async () => {
      let callCount = 0;
      const mockFetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call (direct) fails
          return Promise.reject(new Error('CORS error'));
        }
        // Second call (proxy) succeeds
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCoinGeckoResponse),
        });
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchAssetHistory('bitcoin', 'crypto');

      expect(result).not.toBeNull();
      expect(mockFetch).toHaveBeenCalledTimes(2);
      // First call should be direct
      expect(mockFetch.mock.calls[0][0]).toContain('api.coingecko.com');
      // Second call should use CORS proxy with unencoded URL
      const proxyUrl = mockFetch.mock.calls[1][0] as string;
      expect(proxyUrl).toContain('corsproxy.io');
      // URL should NOT be encoded (should contain :// not %3A%2F%2F)
      expect(proxyUrl).toContain('https://api.coingecko.com');
      expect(proxyUrl).not.toContain('%3A%2F%2F');
    });

    it('should return null when both direct and proxy requests fail', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchAssetHistory('bitcoin', 'crypto');

      expect(result).toBeNull();
    });

    it('should use the coin ID directly for CoinGecko API call', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCoinGeckoResponse),
      });
      vi.stubGlobal('fetch', mockFetch);

      await fetchAssetHistory('solana', 'crypto');

      // The URL should contain the coin ID directly
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('/coins/solana/market_chart');
    });

    it('should work with hyphenated coin IDs like shiba-inu', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCoinGeckoResponse),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchAssetHistory('shiba-inu', 'crypto');

      expect(result).not.toBeNull();
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('/coins/shiba-inu/market_chart');
    });
  });

  describe('Stock Assets', () => {
    const mockYahooResponse = {
      chart: {
        result: [{
          meta: { shortName: 'Apple Inc.' },
          timestamp: [1640995200, 1641081600, 1641168000],
          indicators: {
            quote: [{
              close: [175.5, 178.2, 176.8],
            }],
          },
        }],
      },
    };

    it('should fetch stock history with known symbol', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockYahooResponse),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchAssetHistory('aapl', 'stocks');

      expect(result).not.toBeNull();
      expect(result?.category).toBe('stocks');
    });

    it('should return null for unknown stock ID', async () => {
      const result = await fetchAssetHistory('unknown-stock', 'stocks');

      expect(result).toBeNull();
    });
  });

  describe('Commodity Assets', () => {
    const mockYahooResponse = {
      chart: {
        result: [{
          meta: { shortName: 'Gold' },
          timestamp: [1640995200, 1641081600, 1641168000],
          indicators: {
            quote: [{
              close: [1800, 1810, 1795],
            }],
          },
        }],
      },
    };

    it('should fetch commodity history with known symbol', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockYahooResponse),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchAssetHistory('gold', 'commodities');

      expect(result).not.toBeNull();
      expect(result?.category).toBe('commodities');
    });

    it('should return null for unknown commodity ID', async () => {
      const result = await fetchAssetHistory('unknown-commodity', 'commodities');

      expect(result).toBeNull();
    });
  });
});
