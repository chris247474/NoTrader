import { describe, it, expect } from 'vitest';
import { evaluateComposite } from '../lib/indicators/composite';
import { CYCLE_TOPS, CYCLE_BOTTOMS, SAMPLE_HISTORICAL_DATA } from '../lib/data/historical';
import type { PriceData } from '../lib/data/types';


describe('Backtest: Sample Historical Data', () => {
  it('should detect Oct 2025 top signal', () => {
    const results = evaluateComposite(SAMPLE_HISTORICAL_DATA);

    // We should have a TREND_FLIP_BEAR after the peak
    const bearFlip = results.find((r) => r.signal === 'TREND_FLIP_BEAR');
    expect(bearFlip).toBeDefined();
  });

  it('should show BEARISH trend in late 2025 / early 2026', () => {
    const results = evaluateComposite(SAMPLE_HISTORICAL_DATA);
    const latest = results[results.length - 1];

    expect(latest.trend).toBe('BEAR');
    expect(latest.date).toMatch(/^2026/);
  });

  it('should calculate correct distance from 200W MA', () => {
    const results = evaluateComposite(SAMPLE_HISTORICAL_DATA);
    const latest = results[results.length - 1];

    // Price: 88890, 200W MA: 46000
    // Expected: (88890 - 46000) / 46000 * 100 = 93.24%
    expect(latest.percentFrom200w).toBeCloseTo(93.2, 0);
    expect(latest.buyZone).toBe(false);
  });

  it('should track weeks in bear trend', () => {
    const results = evaluateComposite(SAMPLE_HISTORICAL_DATA);
    const latest = results[results.length - 1];

    // Should be several weeks into bear trend
    expect(latest.weeksInTrend).toBeGreaterThan(0);
    expect(latest.trendFlipDate).toBeDefined();
  });
});

describe('Backtest: Historical Cycle Events', () => {
  it('should have accurate top data', () => {
    // Validate our reference data
    const dec2017Top = CYCLE_TOPS.find((t) => t.date === '2017-12-16');
    expect(dec2017Top).toBeDefined();
    expect(dec2017Top?.price).toBe(19665);
    expect(dec2017Top?.mvrv).toBe(10.5);
    expect(dec2017Top?.piCycleProx).toBe(100);
  });

  it('should have accurate bottom data', () => {
    const nov2022Bottom = CYCLE_BOTTOMS.find((b) => b.date === '2022-11-21');
    expect(nov2022Bottom).toBeDefined();
    expect(nov2022Bottom?.price).toBe(15500);
    expect(nov2022Bottom?.mvrv).toBe(-0.18);
    expect(nov2022Bottom?.fearGreed).toBe(6);
  });
});

describe('Backtest: Signal Logic Validation', () => {
  it('should detect 200W MA touch as ABSOLUTE_BUY', () => {
    // Simulate Nov 2022 FTX collapse
    const data: PriceData[] = [
      {
        date: '2022-11-21',
        price: 15500,
        ma20w: 22000,
        ma200w: 21000,
        mvrv: -0.18,
        fearGreed: 6,
        piCycleProx: 25,
        dma111: null,
        dma350: null,
      },
    ];
    const results = evaluateComposite(data);
    expect(results[0].signal).toBe('ABSOLUTE_BUY');
  });

  it('should detect COVID crash as ABSOLUTE_BUY', () => {
    // Simulate Mar 2020 crash
    const data: PriceData[] = [
      {
        date: '2020-03-12',
        price: 5000,
        ma20w: 8000,
        ma200w: 5200,
        mvrv: 0.08,
        fearGreed: 8,
        piCycleProx: 35,
        dma111: null,
        dma350: null,
      },
    ];
    const results = evaluateComposite(data);
    expect(results[0].signal).toBe('ABSOLUTE_BUY');
  });

  it('should detect 2017 top conditions', () => {
    // Simulate Dec 2017 top - F&G >= 90 and Pi Cycle >= 98 both trigger TOP
    // Note: dma111 and dma350 must be non-null for Pi Cycle evaluation
    const data: PriceData[] = [
      {
        date: '2017-12-16',
        price: 19665,
        ma20w: 10000,
        ma200w: 3000,
        mvrv: 10.5,
        fearGreed: 95, // TOP_SIGNAL (>= 90)
        piCycleProx: 100, // TOP_SIGNAL (>= 98)
        dma111: 18000, // Required for Pi Cycle evaluation
        dma350: 9000,  // Required for Pi Cycle evaluation
      },
    ];
    const results = evaluateComposite(data);
    // Both F&G and Pi Cycle signal top -> composite TOP_SIGNAL
    expect(results[0].signal).toBe('TOP_SIGNAL');
  });

  it('should detect trend flip after top', () => {
    // Simulate post-peak bear transition
    const data: PriceData[] = [
      {
        date: '2017-12-16',
        price: 19665,
        ma20w: 10000,
        ma200w: 3000,
        mvrv: 10.5,
        fearGreed: 95,
        piCycleProx: 100,
        dma111: null,
        dma350: null,
      },
      {
        date: '2018-01-20',
        price: 8000,
        ma20w: 12000,
        ma200w: 3200,
        mvrv: 4.0,
        fearGreed: 40,
        piCycleProx: 70,
        dma111: null,
        dma350: null,
      },
    ];
    const results = evaluateComposite(data);
    expect(results[1].signal).toBe('TREND_FLIP_BEAR');
    expect(results[1].trend).toBe('BEAR');
  });
});

describe('Backtest: Accuracy Metrics', () => {
  it('200W MA touches should always be detected (100% accuracy target)', () => {
    // Test each known 200W MA touch
    const touches = [
      { date: '2015-01-14', price: 172, ma200w: 160 },
      { date: '2018-12-15', price: 3200, ma200w: 3150 },
      { date: '2020-03-12', price: 5000, ma200w: 5200 },
      { date: '2022-11-21', price: 15500, ma200w: 21000 },
    ];

    for (const touch of touches) {
      const data: PriceData[] = [
        {
          date: touch.date,
          price: touch.price,
          ma20w: touch.price * 1.5, // Above price
          ma200w: touch.ma200w,
          mvrv: 0.1,
          fearGreed: 10,
          piCycleProx: 30,
          dma111: null,
          dma350: null,
        },
      ];
      const results = evaluateComposite(data);
      expect(
        results[0].signal === 'ABSOLUTE_BUY' || results[0].signal === 'STRONG_BUY',
        `Expected buy signal for ${touch.date}`
      ).toBe(true);
    }
  });

  it('should maintain proper signal priority order', () => {
    // ABSOLUTE_BUY should override TREND_FLIP_BEAR
    const data: PriceData[] = [
      {
        date: '2022-11-14',
        price: 17000,
        ma20w: 20000,
        ma200w: 22000,
        mvrv: 0.5,
        fearGreed: 15,
        piCycleProx: 30,
        dma111: null,
        dma350: null,
      },
      {
        date: '2022-11-21',
        price: 15500, // Below 200W MA
        ma20w: 22000, // Crossing below (would be TREND_FLIP_BEAR)
        ma200w: 21000,
        mvrv: -0.18,
        fearGreed: 6,
        piCycleProx: 25,
        dma111: null,
        dma350: null,
      },
    ];
    const results = evaluateComposite(data);
    // ABSOLUTE_BUY takes priority over TREND_FLIP_BEAR
    expect(results[1].signal).toBe('ABSOLUTE_BUY');
  });
});
