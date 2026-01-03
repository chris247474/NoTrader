import { describe, it, expect } from 'vitest';
import { evaluateComposite } from '../lib/indicators/composite';
import type { PriceData } from '../lib/data/types';

describe('Composite Strategy', () => {
  it('should prioritize ABSOLUTE_BUY when price at 200W MA', () => {
    const data: PriceData[] = [
      {
        date: '2022-11-21',
        price: 15500,
        ma20w: 20000,
        ma200w: 21000,
        mvrv: 0.05,
        fearGreed: 6,
        piCycleProx: 30,
        dma111: null,
        dma350: null,
      },
    ];
    const result = evaluateComposite(data);
    expect(result[0].signal).toBe('ABSOLUTE_BUY');
    expect(result[0].confidence).toBe(5);
  });

  it('should signal STRONG_BUY with buy zone + MVRV bottom', () => {
    const data: PriceData[] = [
      {
        date: '2022-11-01',
        price: 22000,
        ma20w: 25000,
        ma200w: 21000,
        mvrv: 0.05,
        fearGreed: 15,
        piCycleProx: 35,
        dma111: null,
        dma350: null,
      },
    ];
    const result = evaluateComposite(data);
    expect(result[0].signal).toBe('STRONG_BUY');
    expect(result[0].confidence).toBe(4);
  });

  it('should signal TREND_FLIP_BEAR on crossover', () => {
    const data: PriceData[] = [
      {
        date: '2025-10-01',
        price: 120000,
        ma20w: 115000,
        ma200w: 45000,
        mvrv: 3.8,
        fearGreed: 72,
        piCycleProx: 78,
        dma111: null,
        dma350: null,
      },
      {
        date: '2025-11-01',
        price: 95000,
        ma20w: 115000,
        ma200w: 45500,
        mvrv: 2.5,
        fearGreed: 28,
        piCycleProx: 60,
        dma111: null,
        dma350: null,
      },
    ];
    const result = evaluateComposite(data);
    expect(result[1].signal).toBe('TREND_FLIP_BEAR');
    expect(result[1].trend).toBe('BEAR');
  });

  it('should signal TREND_FLIP_BULL on crossover (when not in buy zone)', () => {
    const data: PriceData[] = [
      {
        date: '2023-01-01',
        price: 16000,
        ma20w: 20000,
        ma200w: 10000, // Far below to not trigger buy zone
        mvrv: 1.5,
        fearGreed: 30,
        piCycleProx: 30,
        dma111: null,
        dma350: null,
      },
      {
        date: '2023-02-01',
        price: 22000,
        ma20w: 20000,
        ma200w: 10500, // Still far from price
        mvrv: 2.0,
        fearGreed: 45,
        piCycleProx: 35,
        dma111: null,
        dma350: null,
      },
    ];
    const result = evaluateComposite(data);
    expect(result[1].signal).toBe('TREND_FLIP_BULL');
    expect(result[1].trend).toBe('BULL');
  });

  it('should prioritize buy signals over TREND_FLIP_BULL', () => {
    // When TREND_FLIP_BULL happens in a buy zone, ABSOLUTE_BUY takes priority
    const data: PriceData[] = [
      {
        date: '2022-12-01',
        price: 16000,
        ma20w: 20000,
        ma200w: 25000,
        mvrv: 0.5,
        fearGreed: 20,
        piCycleProx: 30,
        dma111: null,
        dma350: null,
      },
      {
        date: '2023-01-01',
        price: 22000,
        ma20w: 20000,
        ma200w: 24000, // Price below 200W MA = ABSOLUTE_BUY
        mvrv: 1.0,
        fearGreed: 40,
        piCycleProx: 35,
        dma111: null,
        dma350: null,
      },
    ];
    const result = evaluateComposite(data);
    // ABSOLUTE_BUY has higher priority than TREND_FLIP_BULL
    expect(result[1].signal).toBe('ABSOLUTE_BUY');
    expect(result[1].trend).toBe('BULL');
  });

  it('should signal TOP when multiple top indicators fire', () => {
    // F&G >= 90 and Pi Cycle >= 98 both trigger TOP_SIGNAL
    // Need at least 2 top signals for composite TOP_SIGNAL
    // Note: dma111 and dma350 must be non-null for Pi Cycle to work
    const data: PriceData[] = [
      {
        date: '2021-04-14',
        price: 64000,
        ma20w: 50000,
        ma200w: 20000,
        mvrv: 4.5,
        fearGreed: 92,  // TOP_SIGNAL (>= 90)
        piCycleProx: 100, // TOP_SIGNAL (>= 98)
        dma111: 60000,  // Required for Pi Cycle evaluation
        dma350: 30000,  // Required for Pi Cycle evaluation
      },
    ];
    const result = evaluateComposite(data);
    // F&G and Pi Cycle both signal TOP -> composite TOP_SIGNAL
    expect(result[0].signal).toBe('TOP_SIGNAL');
    expect(result[0].confidence).toBeGreaterThanOrEqual(2);
  });

  it('should provide BUY_ZONE when in zone but no other signals', () => {
    const data: PriceData[] = [
      {
        date: '2022-08-01',
        price: 25000,
        ma20w: 30000,
        ma200w: 21000,
        mvrv: 1.5,
        fearGreed: 35,
        piCycleProx: 40,
        dma111: null,
        dma350: null,
      },
    ];
    const result = evaluateComposite(data);
    expect(result[0].signal).toBe('BUY_ZONE');
    expect(result[0].buyZone).toBe(true);
  });

  it('should track trend flip date correctly', () => {
    const data: PriceData[] = [
      { date: '2025-10-01', price: 120000, ma20w: 115000, ma200w: 45000, mvrv: 3.8, fearGreed: 72, piCycleProx: 78, dma111: null, dma350: null },
      { date: '2025-11-01', price: 95000, ma20w: 115000, ma200w: 45500, mvrv: 2.5, fearGreed: 28, piCycleProx: 60, dma111: null, dma350: null },
      { date: '2025-12-01', price: 90000, ma20w: 105000, ma200w: 46000, mvrv: 2.3, fearGreed: 22, piCycleProx: 50, dma111: null, dma350: null },
    ];
    const result = evaluateComposite(data);
    expect(result[2].trendFlipDate).toBe('2025-11-01');
    expect(result[2].weeksInTrend).toBe(2);
  });

  it('should correctly identify current bearish state (Jan 2026)', () => {
    const data: PriceData[] = [
      { date: '2025-11-01', price: 95000, ma20w: 115000, ma200w: 45500, mvrv: 2.5, fearGreed: 28, piCycleProx: 60, dma111: null, dma350: null },
      { date: '2026-01-01', price: 88890, ma20w: 102000, ma200w: 46000, mvrv: 2.4, fearGreed: 22, piCycleProx: 48, dma111: null, dma350: null },
    ];
    const result = evaluateComposite(data);
    const current = result[result.length - 1];

    expect(current.trend).toBe('BEAR');
    expect(current.buyZone).toBe(false);
    expect(current.percentFrom200w).toBeCloseTo(93.2, 0);
  });
});
