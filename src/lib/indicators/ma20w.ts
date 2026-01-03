import type { PriceData, TrendResult, TrendState, TrendSignal } from '../data/types';

/**
 * Calculate 20-Week Simple Moving Average
 * @param weeklyCloses - Array of weekly closing prices (most recent last)
 * @returns The 20-week SMA or null if insufficient data
 */
export function calculate20WeekSMA(weeklyCloses: number[]): number | null {
  if (weeklyCloses.length < 20) return null;
  const last20 = weeklyCloses.slice(-20);
  const sum = last20.reduce((a, b) => a + b, 0);
  return sum / 20;
}

/**
 * Evaluate 20W SMA trend for a series of price data
 * Determines bull/bear trend and detects trend flips
 */
export function evaluate20WMA(data: PriceData[]): TrendResult[] {
  const results: TrendResult[] = [];
  let previousTrend: TrendState | null = null;
  let trendFlipDate: string | null = null;
  let weeksInTrend = 0;

  for (const d of data) {
    // If no MA data available
    if (d.ma20w === null) {
      results.push({
        date: d.date,
        price: d.price,
        ma20w: null,
        percentFromMA: null,
        trend: 'NO_DATA',
        signal: 'NEUTRAL',
        trendFlipDate: null,
        weeksInTrend: 0,
      });
      continue;
    }

    const percentFromMA = ((d.price - d.ma20w) / d.ma20w) * 100;
    const currentTrend: TrendState = d.price >= d.ma20w ? 'BULL' : 'BEAR';

    let signal: TrendSignal = 'NEUTRAL';

    // Detect trend flips
    if (previousTrend !== null && currentTrend !== previousTrend) {
      signal = currentTrend === 'BEAR' ? 'FLIP_TO_BEAR' : 'FLIP_TO_BULL';
      trendFlipDate = d.date;
      weeksInTrend = 0;
    }

    weeksInTrend++;
    previousTrend = currentTrend;

    results.push({
      date: d.date,
      price: d.price,
      ma20w: d.ma20w,
      percentFromMA,
      trend: currentTrend,
      signal,
      trendFlipDate,
      weeksInTrend,
    });
  }

  return results;
}

/**
 * Get the current trend status from the most recent data point
 */
export function getCurrentTrendStatus(data: PriceData[]): TrendResult | null {
  if (data.length === 0) return null;
  const results = evaluate20WMA(data);
  return results[results.length - 1];
}
