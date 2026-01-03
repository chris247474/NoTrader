import { describe, it, expect } from 'vitest';
import { calculate20WeekSMA, evaluate20WMA } from '../lib/indicators/ma20w';
import { calculate200WeekMA, evaluate200WMA } from '../lib/indicators/ma200w';
import { evaluateMVRV } from '../lib/indicators/mvrv';
import { calculatePiCycleProximity, evaluatePiCycle } from '../lib/indicators/piCycle';
import { evaluateFearGreed } from '../lib/indicators/fearGreed';
import type { PriceData } from '../lib/data/types';

describe('20-Week SMA', () => {
  it('should calculate correct SMA with 20 weekly data points', () => {
    const prices = Array(20).fill(100);
    expect(calculate20WeekSMA(prices)).toBe(100);
  });

  it('should return null if fewer than 20 data points', () => {
    const prices = Array(19).fill(100);
    expect(calculate20WeekSMA(prices)).toBeNull();
  });

  it('should weight recent prices equally', () => {
    const prices = [...Array(19).fill(100), 200];
    expect(calculate20WeekSMA(prices)).toBe(105);
  });

  it('should use only last 20 prices when given more', () => {
    const prices = [...Array(100).fill(50), ...Array(20).fill(100)];
    expect(calculate20WeekSMA(prices)).toBe(100);
  });
});

describe('20W SMA Trend Detection', () => {
  it('should signal BULL when price above 20W SMA', () => {
    const data: PriceData[] = [
      {
        date: '2025-01-01',
        price: 50000,
        ma20w: 45000,
        ma200w: null,
        mvrv: null,
        fearGreed: null,
        piCycleProx: null,
        dma111: null,
        dma350: null,
      },
    ];
    const result = evaluate20WMA(data);
    expect(result[0].trend).toBe('BULL');
  });

  it('should signal BEAR when price below 20W SMA', () => {
    const data: PriceData[] = [
      {
        date: '2025-01-01',
        price: 40000,
        ma20w: 45000,
        ma200w: null,
        mvrv: null,
        fearGreed: null,
        piCycleProx: null,
        dma111: null,
        dma350: null,
      },
    ];
    const result = evaluate20WMA(data);
    expect(result[0].trend).toBe('BEAR');
  });

  it('should detect FLIP_TO_BEAR on crossover', () => {
    const data: PriceData[] = [
      {
        date: '2025-10-01',
        price: 120000,
        ma20w: 115000,
        ma200w: null,
        mvrv: null,
        fearGreed: null,
        piCycleProx: null,
        dma111: null,
        dma350: null,
      },
      {
        date: '2025-11-01',
        price: 95000,
        ma20w: 115000,
        ma200w: null,
        mvrv: null,
        fearGreed: null,
        piCycleProx: null,
        dma111: null,
        dma350: null,
      },
    ];
    const result = evaluate20WMA(data);
    expect(result[1].signal).toBe('FLIP_TO_BEAR');
    expect(result[1].trendFlipDate).toBe('2025-11-01');
  });

  it('should detect FLIP_TO_BULL on crossover', () => {
    const data: PriceData[] = [
      {
        date: '2022-12-01',
        price: 16000,
        ma20w: 20000,
        ma200w: null,
        mvrv: null,
        fearGreed: null,
        piCycleProx: null,
        dma111: null,
        dma350: null,
      },
      {
        date: '2023-01-01',
        price: 22000,
        ma20w: 20000,
        ma200w: null,
        mvrv: null,
        fearGreed: null,
        piCycleProx: null,
        dma111: null,
        dma350: null,
      },
    ];
    const result = evaluate20WMA(data);
    expect(result[1].signal).toBe('FLIP_TO_BULL');
  });

  it('should track weeks in trend', () => {
    const data: PriceData[] = [
      { date: '2025-01-01', price: 50000, ma20w: 45000, ma200w: null, mvrv: null, fearGreed: null, piCycleProx: null, dma111: null, dma350: null },
      { date: '2025-01-08', price: 52000, ma20w: 46000, ma200w: null, mvrv: null, fearGreed: null, piCycleProx: null, dma111: null, dma350: null },
      { date: '2025-01-15', price: 54000, ma20w: 47000, ma200w: null, mvrv: null, fearGreed: null, piCycleProx: null, dma111: null, dma350: null },
    ];
    const result = evaluate20WMA(data);
    expect(result[2].weeksInTrend).toBe(3);
  });
});

describe('200-Week MA', () => {
  it('should calculate correct MA with 200 weekly data points', () => {
    const prices = Array(200).fill(1000);
    expect(calculate200WeekMA(prices)).toBe(1000);
  });

  it('should return null if fewer than 200 data points', () => {
    const prices = Array(199).fill(1000);
    expect(calculate200WeekMA(prices)).toBeNull();
  });
});

describe('200W MA Buy Zone Detection', () => {
  it('should signal ABSOLUTE_BUY when price at or below 200W MA', () => {
    const data: PriceData[] = [
      { date: '2022-11-21', price: 15500, ma20w: null, ma200w: 21000, mvrv: null, fearGreed: null, piCycleProx: null, dma111: null, dma350: null },
    ];
    const result = evaluate200WMA(data);
    expect(result[0].signal).toBe('ABSOLUTE_BUY');
    expect(result[0].buyZone).toBe(true);
  });

  it('should signal STRONG_BUY when within 10% of 200W MA', () => {
    const data: PriceData[] = [
      { date: '2022-06-01', price: 22000, ma20w: null, ma200w: 21000, mvrv: null, fearGreed: null, piCycleProx: null, dma111: null, dma350: null },
    ];
    const result = evaluate200WMA(data);
    expect(result[0].signal).toBe('STRONG_BUY');
    expect(result[0].buyZone).toBe(true);
  });

  it('should signal BUY_ZONE when within 25% of 200W MA', () => {
    const data: PriceData[] = [
      { date: '2022-07-01', price: 25000, ma20w: null, ma200w: 21000, mvrv: null, fearGreed: null, piCycleProx: null, dma111: null, dma350: null },
    ];
    const result = evaluate200WMA(data);
    expect(result[0].signal).toBe('BUY_ZONE');
    expect(result[0].buyZone).toBe(true);
  });

  it('should signal NEUTRAL when far above 200W MA', () => {
    const data: PriceData[] = [
      { date: '2025-01-01', price: 100000, ma20w: null, ma200w: 46000, mvrv: null, fearGreed: null, piCycleProx: null, dma111: null, dma350: null },
    ];
    const result = evaluate200WMA(data);
    expect(result[0].signal).toBe('NEUTRAL');
    expect(result[0].buyZone).toBe(false);
  });
});

describe('MVRV Z-Score', () => {
  it('should signal BOTTOM when MVRV <= 0.1', () => {
    const data: PriceData[] = [
      { date: '2022-11-21', price: 15500, ma20w: null, ma200w: null, mvrv: 0.05, fearGreed: null, piCycleProx: null, dma111: null, dma350: null },
    ];
    const result = evaluateMVRV(data);
    expect(result[0].signal).toBe('BOTTOM_SIGNAL');
  });

  it('should detect dynamic top when MVRV drops 25% from peak above 4.0', () => {
    const data: PriceData[] = [
      { date: '2025-09-01', price: 120000, ma20w: null, ma200w: null, mvrv: 4.5, fearGreed: null, piCycleProx: null, dma111: null, dma350: null },
      { date: '2025-10-01', price: 100000, ma20w: null, ma200w: null, mvrv: 3.2, fearGreed: null, piCycleProx: null, dma111: null, dma350: null },
    ];
    const result = evaluateMVRV(data);
    expect(result[1].signal).toBe('TOP_SIGNAL');
    expect(result[1].mvrvPeak).toBe(4.5);
  });

  it('should not signal top if peak was below 4.0', () => {
    const data: PriceData[] = [
      { date: '2024-01-01', price: 50000, ma20w: null, ma200w: null, mvrv: 3.5, fearGreed: null, piCycleProx: null, dma111: null, dma350: null },
      { date: '2024-02-01', price: 45000, ma20w: null, ma200w: null, mvrv: 2.5, fearGreed: null, piCycleProx: null, dma111: null, dma350: null },
    ];
    const result = evaluateMVRV(data);
    expect(result[1].signal).toBe('NEUTRAL');
  });

  it('should reset peak after bottom signal', () => {
    const data: PriceData[] = [
      { date: '2022-09-01', price: 20000, ma20w: null, ma200w: null, mvrv: 4.5, fearGreed: null, piCycleProx: null, dma111: null, dma350: null },
      { date: '2022-10-01', price: 18000, ma20w: null, ma200w: null, mvrv: 3.0, fearGreed: null, piCycleProx: null, dma111: null, dma350: null },
      { date: '2022-11-01', price: 15500, ma20w: null, ma200w: null, mvrv: 0.05, fearGreed: null, piCycleProx: null, dma111: null, dma350: null },
      { date: '2023-01-01', price: 20000, ma20w: null, ma200w: null, mvrv: 1.5, fearGreed: null, piCycleProx: null, dma111: null, dma350: null },
    ];
    const result = evaluateMVRV(data);
    expect(result[2].signal).toBe('BOTTOM_SIGNAL');
    expect(result[3].mvrvPeak).toBe(1.5); // Reset and tracking new peak
  });
});

describe('Pi Cycle', () => {
  it('should calculate proximity correctly', () => {
    // 111 DMA at 100k, 350 DMA at 55k -> target = 110k -> proximity = 90.9%
    const proximity = calculatePiCycleProximity(100000, 55000);
    expect(proximity).toBeCloseTo(90.9, 1);
  });

  it('should cap proximity at 100%', () => {
    const proximity = calculatePiCycleProximity(120000, 50000);
    expect(proximity).toBe(100);
  });

  it('should signal TOP when proximity >= 98%', () => {
    const data: PriceData[] = [
      { date: '2021-04-14', price: 64000, ma20w: null, ma200w: null, mvrv: null, fearGreed: null, piCycleProx: 100, dma111: 60000, dma350: 30000 },
    ];
    const result = evaluatePiCycle(data);
    expect(result[0].signal).toBe('TOP_SIGNAL');
  });

  it('should be NEUTRAL when proximity < 98%', () => {
    const data: PriceData[] = [
      { date: '2025-12-01', price: 90000, ma20w: null, ma200w: null, mvrv: null, fearGreed: null, piCycleProx: 48, dma111: 88000, dma350: 85000 },
    ];
    const result = evaluatePiCycle(data);
    expect(result[0].signal).toBe('NEUTRAL');
  });
});

describe('Fear & Greed', () => {
  it('should signal TOP when F&G >= 90', () => {
    const data: PriceData[] = [
      { date: '2021-11-10', price: 69000, ma20w: null, ma200w: null, mvrv: null, fearGreed: 92, piCycleProx: null, dma111: null, dma350: null },
    ];
    const result = evaluateFearGreed(data);
    expect(result[0].signal).toBe('TOP_SIGNAL');
  });

  it('should signal BOTTOM when F&G <= 10', () => {
    const data: PriceData[] = [
      { date: '2022-11-21', price: 15500, ma20w: null, ma200w: null, mvrv: null, fearGreed: 6, piCycleProx: null, dma111: null, dma350: null },
    ];
    const result = evaluateFearGreed(data);
    expect(result[0].signal).toBe('BOTTOM_SIGNAL');
  });

  it('should be NEUTRAL in normal range', () => {
    const data: PriceData[] = [
      { date: '2025-01-01', price: 90000, ma20w: null, ma200w: null, mvrv: null, fearGreed: 50, piCycleProx: null, dma111: null, dma350: null },
    ];
    const result = evaluateFearGreed(data);
    expect(result[0].signal).toBe('NEUTRAL');
  });
});
