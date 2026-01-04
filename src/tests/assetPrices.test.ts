import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchCryptoPrices, fetchCommodityPrices, clearPriceCache } from '../lib/data/assetPrices';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

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
        it('should fetch and return commodity prices from Yahoo Finance', async () => {
            // Mock Yahoo Finance response for gold
            const mockYahooResponse = {
                chart: {
                    result: [{
                        meta: { regularMarketPrice: 2650.50 }
                    }]
                }
            };

            // Mock will be called for each commodity symbol
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockYahooResponse),
            });

            const prices = await fetchCommodityPrices();

            expect(mockFetch).toHaveBeenCalled();
            // All commodities should have the mocked price
            expect(prices.gold).toBe(2650.50);
        });

        it('should handle Yahoo Finance API failures gracefully', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 429,
            });

            const prices = await fetchCommodityPrices();

            // Should return empty object on failure, not throw
            expect(prices).toEqual({});
        });
    });
});
