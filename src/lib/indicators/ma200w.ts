import type { PriceData, FloorResult, BuySignal } from '../data/types';

/**
 * Calculate 200-Week Simple Moving Average
 * @param weeklyCloses - Array of weekly closing prices (most recent last)
 * @returns The 200-week SMA or null if insufficient data
 */
export function calculate200WeekMA(weeklyCloses: number[]): number | null {
  if (weeklyCloses.length < 200) return null;
  const last200 = weeklyCloses.slice(-200);
  const sum = last200.reduce((a, b) => a + b, 0);
  return sum / 200;
}

/**
 * Evaluate 200W MA floor signals
 * The 200W MA acts as the "floor" - touching it is a generational buying opportunity
 */
export function evaluate200WMA(data: PriceData[]): FloorResult[] {
  return data.map((d) => {
    // If no MA data available
    if (d.ma200w === null) {
      return {
        date: d.date,
        price: d.price,
        ma200w: null,
        percentAbove: null,
        signal: 'NO_DATA' as BuySignal,
        buyZone: false,
        reason: '',
      };
    }

    const percentAbove = ((d.price - d.ma200w) / d.ma200w) * 100;
    let signal: BuySignal = 'NEUTRAL';
    let buyZone = false;
    let reason = '';

    // ABSOLUTE BUY: Price at or below 200W MA
    if (d.price <= d.ma200w) {
      signal = 'ABSOLUTE_BUY';
      buyZone = true;
      reason = `Price ${percentAbove.toFixed(1)}% below 200W MA (GENERATIONAL OPPORTUNITY)`;
    }
    // STRONG BUY: Price within 10% of 200W MA
    else if (percentAbove <= 10) {
      signal = 'STRONG_BUY';
      buyZone = true;
      reason = `Price only ${percentAbove.toFixed(1)}% above 200W MA floor`;
    }
    // BUY ZONE: Price within 25% of 200W MA
    else if (percentAbove <= 25) {
      signal = 'BUY_ZONE';
      buyZone = true;
      reason = `Price ${percentAbove.toFixed(1)}% above 200W MA - still in buy zone`;
    }

    return {
      date: d.date,
      price: d.price,
      ma200w: d.ma200w,
      percentAbove,
      signal,
      buyZone,
      reason,
    };
  });
}

/**
 * Calculate the drop needed to reach the 200W MA floor
 */
export function calculateDropToFloor(
  currentPrice: number,
  ma200w: number | null
): { dropPercent: number; floorPrice: number } | null {
  if (ma200w === null) return null;

  const dropPercent = ((currentPrice - ma200w) / currentPrice) * 100;
  return {
    dropPercent,
    floorPrice: ma200w,
  };
}

/**
 * Get the current floor status from the most recent data point
 */
export function getCurrentFloorStatus(data: PriceData[]): FloorResult | null {
  if (data.length === 0) return null;
  const results = evaluate200WMA(data);
  return results[results.length - 1];
}
