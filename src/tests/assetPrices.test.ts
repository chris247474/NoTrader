import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchCryptoPrices, fetchCommodityPrices, clearPriceCache, type AssetPrice } from '../lib/data/assetPrices';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Asset Price Fetching', () => {
    beforeEach(() => {
        mockFetch.mockClear();
        clearPriceCache(); // Clear cache before each test to ensure isolation
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('fetchCryptoPrices', () => {
        it('should fetch and return crypto prices from CoinGecko', async () => {
            const mockResponse = {
                bitcoin: { usd: 95000.50 },
                ethereum: { usd: 3200.25 },
                binancecoin: { usd: 650.00 },
                ripple: { usd: 2.15 },
                solana: { usd: 180.00 },
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const prices = await fetchCryptoPrices();

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('api.coingecko.com/api/v3/simple/price')
            );

            expect(prices.btc).toBe(95000.50);
            expect(prices.eth).toBe(3200.25);
            expect(prices.bnb).toBe(650.00);
            expect(prices.xrp).toBe(2.15);
            expect(prices.sol).toBe(180.00);
        });

        it('should throw error when CoinGecko API fails', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 429,
            });

            await expect(fetchCryptoPrices()).rejects.toThrow('HTTP 429');
        });

        it('should throw error on network failure', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(fetchCryptoPrices()).rejects.toThrow('Network error');
        });
    });

    describe('fetchCommodityPrices', () => {
        it('should return commodity prices', async () => {
            // For now, commodities use sample data, but this test ensures the structure is correct
            const prices = await fetchCommodityPrices();

            expect(prices).toHaveProperty('gold');
            expect(prices).toHaveProperty('silver');
            expect(prices).toHaveProperty('platinum');
            expect(prices).toHaveProperty('palladium');
            expect(prices).toHaveProperty('copper');
            expect(prices).toHaveProperty('oil');
            expect(prices).toHaveProperty('natgas');

            // Verify they are numbers
            expect(typeof prices.gold).toBe('number');
            expect(typeof prices.silver).toBe('number');
            expect(prices.gold).toBeGreaterThan(0);
        });

        it('should return reasonable price ranges for commodities', async () => {
            const prices = await fetchCommodityPrices();

            // Gold typically between 1500-3500 USD/oz
            expect(prices.gold).toBeGreaterThan(1500);
            expect(prices.gold).toBeLessThan(4000);

            // Silver typically between 15-50 USD/oz
            expect(prices.silver).toBeGreaterThan(15);
            expect(prices.silver).toBeLessThan(60);
        });
    });
});
