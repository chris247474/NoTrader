import { describe, it, expect, beforeEach } from 'vitest';
import { fetchAssetHistory, clearHistoryCache } from '../lib/data/assetHistory';

/**
 * Integration tests that make real API calls
 * These tests verify the actual behavior against live APIs
 * Skip in CI/sandbox environments without network access
 */
describe.skip('fetchAssetHistory Integration', () => {
  beforeEach(() => {
    clearHistoryCache();
  });

  describe('Crypto Assets - Real API Calls', () => {
    it('should fetch Bitcoin history from CoinGecko', async () => {
      // This test makes a real API call
      const result = await fetchAssetHistory('bitcoin', 'crypto');

      // This is the test that should fail if crypto loading is broken
      expect(result).not.toBeNull();
      expect(result?.category).toBe('crypto');
      expect(result?.symbol).toBeDefined();
      expect(result?.name).toBeDefined();
      expect(result?.priceData.length).toBeGreaterThan(0);
    }, 30000); // 30 second timeout for API call

    it('should fetch Ethereum history from CoinGecko', async () => {
      const result = await fetchAssetHistory('ethereum', 'crypto');

      expect(result).not.toBeNull();
      expect(result?.category).toBe('crypto');
      expect(result?.priceData.length).toBeGreaterThan(0);
    }, 30000);

    it('should fetch Solana history from CoinGecko', async () => {
      const result = await fetchAssetHistory('solana', 'crypto');

      expect(result).not.toBeNull();
      expect(result?.category).toBe('crypto');
    }, 30000);

    it('should handle hyphenated coin IDs like shiba-inu', async () => {
      const result = await fetchAssetHistory('shiba-inu', 'crypto');

      expect(result).not.toBeNull();
      expect(result?.category).toBe('crypto');
    }, 30000);

    it('should return proper structure with priceData and trendFlips', async () => {
      const result = await fetchAssetHistory('bitcoin', 'crypto');

      expect(result).not.toBeNull();
      if (result) {
        // Verify structure
        expect(result).toHaveProperty('symbol');
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('category', 'crypto');
        expect(result).toHaveProperty('priceData');
        expect(result).toHaveProperty('trendFlips');
        expect(result).toHaveProperty('currentTrend');
        expect(result).toHaveProperty('lastFlipDate');

        // Verify priceData structure
        expect(result.priceData.length).toBeGreaterThan(20); // Should have enough data for 20W SMA
        const lastPoint = result.priceData[result.priceData.length - 1];
        expect(lastPoint).toHaveProperty('date');
        expect(lastPoint).toHaveProperty('price');
        expect(typeof lastPoint.price).toBe('number');
        expect(lastPoint.price).toBeGreaterThan(0);

        // After 20 weeks, ma20w should be calculated
        if (result.priceData.length >= 20) {
          expect(result.priceData[19].ma20w).not.toBeNull();
        }
      }
    }, 30000);
  });
});
