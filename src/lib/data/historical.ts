import type { PriceData, CycleEvent } from './types';

/**
 * Historical cycle tops for backtesting validation
 */
export const CYCLE_TOPS: CycleEvent[] = [
  {
    date: '2011-06-08',
    price: 31,
    mvrv: 9.2,
    fearGreed: 95,
    piCycleProx: 98,
    type: 'TOP',
    notes: 'First major bubble',
  },
  {
    date: '2013-04-10',
    price: 266,
    mvrv: 8.5,
    fearGreed: 92,
    piCycleProx: 100,
    type: 'TOP',
    notes: 'First 2013 top',
  },
  {
    date: '2013-11-30',
    price: 1127,
    mvrv: 9.8,
    fearGreed: 95,
    piCycleProx: 100,
    type: 'TOP',
    notes: 'Second 2013 top',
  },
  {
    date: '2017-12-16',
    price: 19665,
    mvrv: 10.5,
    fearGreed: 95,
    piCycleProx: 100,
    type: 'TOP',
    notes: '2017 bull run peak',
  },
  {
    date: '2021-04-14',
    price: 64000,
    mvrv: 7.8,
    fearGreed: 92,
    piCycleProx: 100,
    type: 'TOP',
    notes: '2021 first top',
  },
  {
    date: '2021-11-10',
    price: 69000,
    mvrv: 6.8,
    fearGreed: 84,
    piCycleProx: 92,
    type: 'TOP',
    notes: '2021 ATH',
  },
  {
    date: '2025-10-06',
    price: 126200,
    mvrv: 4.2,
    fearGreed: 78,
    piCycleProx: 82,
    type: 'TOP',
    notes: '2025 cycle top',
  },
];

/**
 * Historical cycle bottoms for backtesting validation
 */
export const CYCLE_BOTTOMS: CycleEvent[] = [
  {
    date: '2011-11-18',
    price: 2,
    mvrv: 0.05,
    fearGreed: 5,
    type: 'BOTTOM',
    notes: 'Post first bubble',
  },
  {
    date: '2013-07-05',
    price: 68,
    mvrv: 1.2,
    fearGreed: 12,
    type: 'BOTTOM',
    notes: 'Mid-2013 correction',
  },
  {
    date: '2015-01-14',
    price: 172,
    mvrv: 0.02,
    fearGreed: 5,
    type: 'BOTTOM',
    notes: 'Post-2013 bear - touched 200W MA',
  },
  {
    date: '2018-12-15',
    price: 3200,
    mvrv: 0.01,
    fearGreed: 8,
    type: 'BOTTOM',
    notes: 'Post-2017 bear - touched 200W MA',
  },
  {
    date: '2020-03-12',
    price: 5000,
    mvrv: 0.08,
    fearGreed: 8,
    type: 'BOTTOM',
    notes: 'COVID crash - broke 200W MA',
  },
  {
    date: '2022-11-21',
    price: 15500,
    mvrv: -0.18,
    fearGreed: 6,
    type: 'BOTTOM',
    notes: 'FTX collapse - broke 200W MA',
  },
];

/**
 * 200W MA touch events and their 12-month returns
 */
export const MA200W_TOUCHES = [
  { date: '2015-01-14', price: 172, return12m: 150 },
  { date: '2018-12-15', price: 3200, return12m: 125 },
  { date: '2020-03-12', price: 5000, return12m: 560 },
  { date: '2022-06-18', price: 18000, return12m: 50 },
  { date: '2022-11-21', price: 15500, return12m: 170 },
];

/**
 * Sample historical data for development/testing
 * In production, this would be loaded from CSV or API
 */
export const SAMPLE_HISTORICAL_DATA: PriceData[] = [
  // Recent data points (late 2025 - early 2026)
  {
    date: '2025-09-28',
    price: 118000,
    ma20w: 108000,
    ma200w: 44000,
    mvrv: 3.8,
    fearGreed: 72,
    piCycleProx: 78,
    dma111: 112000,
    dma350: 72000,
  },
  {
    date: '2025-10-05',
    price: 126200,
    ma20w: 110000,
    ma200w: 44500,
    mvrv: 4.2,
    fearGreed: 78,
    piCycleProx: 82,
    dma111: 118000,
    dma350: 73000,
  },
  {
    date: '2025-10-12',
    price: 115000,
    ma20w: 111000,
    ma200w: 45000,
    mvrv: 3.5,
    fearGreed: 58,
    piCycleProx: 76,
    dma111: 116000,
    dma350: 74000,
  },
  {
    date: '2025-10-19',
    price: 108000,
    ma20w: 111500,
    ma200w: 45200,
    mvrv: 3.1,
    fearGreed: 45,
    piCycleProx: 72,
    dma111: 113000,
    dma350: 75000,
  },
  {
    date: '2025-10-26',
    price: 102000,
    ma20w: 111000,
    ma200w: 45500,
    mvrv: 2.9,
    fearGreed: 38,
    piCycleProx: 68,
    dma111: 109000,
    dma350: 76000,
  },
  {
    date: '2025-11-02',
    price: 98000,
    ma20w: 110000,
    ma200w: 45800,
    mvrv: 2.7,
    fearGreed: 32,
    piCycleProx: 64,
    dma111: 105000,
    dma350: 77000,
  },
  {
    date: '2025-11-09',
    price: 95000,
    ma20w: 108500,
    ma200w: 46000,
    mvrv: 2.6,
    fearGreed: 28,
    piCycleProx: 60,
    dma111: 101000,
    dma350: 78000,
  },
  {
    date: '2025-11-16',
    price: 92000,
    ma20w: 106500,
    ma200w: 46200,
    mvrv: 2.5,
    fearGreed: 25,
    piCycleProx: 56,
    dma111: 97000,
    dma350: 79000,
  },
  {
    date: '2025-11-23',
    price: 94000,
    ma20w: 105000,
    ma200w: 46500,
    mvrv: 2.5,
    fearGreed: 30,
    piCycleProx: 54,
    dma111: 95000,
    dma350: 80000,
  },
  {
    date: '2025-11-30',
    price: 90000,
    ma20w: 103500,
    ma200w: 46800,
    mvrv: 2.4,
    fearGreed: 24,
    piCycleProx: 52,
    dma111: 93000,
    dma350: 81000,
  },
  {
    date: '2025-12-07',
    price: 88000,
    ma20w: 102500,
    ma200w: 47000,
    mvrv: 2.3,
    fearGreed: 22,
    piCycleProx: 50,
    dma111: 91000,
    dma350: 82000,
  },
  {
    date: '2025-12-14',
    price: 86500,
    ma20w: 102000,
    ma200w: 47200,
    mvrv: 2.3,
    fearGreed: 20,
    piCycleProx: 49,
    dma111: 89000,
    dma350: 83000,
  },
  {
    date: '2025-12-21',
    price: 89000,
    ma20w: 101500,
    ma200w: 47500,
    mvrv: 2.4,
    fearGreed: 25,
    piCycleProx: 48,
    dma111: 88500,
    dma350: 84000,
  },
  {
    date: '2025-12-28',
    price: 87500,
    ma20w: 101000,
    ma200w: 47800,
    mvrv: 2.3,
    fearGreed: 22,
    piCycleProx: 47,
    dma111: 88000,
    dma350: 85000,
  },
  {
    date: '2026-01-04',
    price: 88890,
    ma20w: 102000,
    ma200w: 46000,
    mvrv: 2.4,
    fearGreed: 22,
    piCycleProx: 48,
    dma111: 88500,
    dma350: 85500,
  },
];

/**
 * Get the most recent data point from sample data
 */
export function getLatestSampleData(): PriceData | null {
  if (SAMPLE_HISTORICAL_DATA.length === 0) return null;
  return SAMPLE_HISTORICAL_DATA[SAMPLE_HISTORICAL_DATA.length - 1];
}

/**
 * Parse CSV data to PriceData array
 * Expected format: date,price,ma20w,ma200w,mvrv,fearGreed,piCycleProx,dma111,dma350
 */
export function parseCSV(csvContent: string): PriceData[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  // Skip header row
  return lines.slice(1).map((line) => {
    const [date, price, ma20w, ma200w, mvrv, fearGreed, piCycleProx, dma111, dma350] =
      line.split(',');

    return {
      date,
      price: parseFloat(price),
      ma20w: ma20w ? parseFloat(ma20w) : null,
      ma200w: ma200w ? parseFloat(ma200w) : null,
      mvrv: mvrv ? parseFloat(mvrv) : null,
      fearGreed: fearGreed ? parseFloat(fearGreed) : null,
      piCycleProx: piCycleProx ? parseFloat(piCycleProx) : null,
      dma111: dma111 ? parseFloat(dma111) : null,
      dma350: dma350 ? parseFloat(dma350) : null,
    };
  });
}
