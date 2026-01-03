import type { PriceData, MVRVResult } from '../data/types';

/**
 * Evaluate MVRV Z-Score with dynamic peak tracking
 *
 * MVRV (Market Value to Realized Value) Z-Score measures how much Bitcoin
 * is overvalued or undervalued relative to its historical mean.
 *
 * Dynamic top detection: When MVRV peaks above 4.0 and then drops 25%+,
 * it signals a cycle top.
 *
 * Bottom signal: MVRV <= 0.1 indicates capitulation/generational buying opportunity
 */
export function evaluateMVRV(data: PriceData[]): MVRVResult[] {
  const results: MVRVResult[] = [];
  let mvrvPeak = 0;
  let inPeakDecay = false;

  for (const d of data) {
    // Handle missing MVRV data
    if (d.mvrv === null) {
      results.push({
        date: d.date,
        price: d.price,
        mvrv: null,
        mvrvPeak,
        signal: 'NEUTRAL',
        reason: '',
      });
      continue;
    }

    const mvrv = d.mvrv;

    // Track the cycle peak
    if (mvrv > mvrvPeak) {
      mvrvPeak = mvrv;
      inPeakDecay = false;
    }

    let signal: 'TOP_SIGNAL' | 'BOTTOM_SIGNAL' | 'NEUTRAL' = 'NEUTRAL';
    let reason = '';

    // Dynamic top detection: MVRV drops 25%+ from peak that was above 4.0
    if (mvrvPeak >= 4.0 && mvrv < mvrvPeak * 0.75 && !inPeakDecay) {
      signal = 'TOP_SIGNAL';
      reason = `MVRV dropped ${((1 - mvrv / mvrvPeak) * 100).toFixed(0)}% from peak ${mvrvPeak.toFixed(2)} to ${mvrv.toFixed(2)}`;
      inPeakDecay = true;
    }

    // Fixed bottom threshold: MVRV <= 0.1 is capitulation
    if (mvrv <= 0.1) {
      signal = 'BOTTOM_SIGNAL';
      reason = `MVRV ${mvrv.toFixed(2)} <= 0.1 (CAPITULATION)`;
      // Reset peak for next cycle
      mvrvPeak = 0;
      inPeakDecay = false;
    }

    results.push({
      date: d.date,
      price: d.price,
      mvrv,
      mvrvPeak,
      signal,
      reason,
    });
  }

  return results;
}

/**
 * Get MVRV interpretation for display
 */
export function getMVRVInterpretation(mvrv: number | null): string {
  if (mvrv === null) return 'No Data';
  if (mvrv <= 0.1) return 'Extreme Undervalued (Capitulation)';
  if (mvrv <= 0.5) return 'Undervalued';
  if (mvrv <= 1.0) return 'Below Fair Value';
  if (mvrv <= 2.0) return 'Fair Value';
  if (mvrv <= 3.0) return 'Elevated';
  if (mvrv <= 4.0) return 'High';
  if (mvrv <= 6.0) return 'Very High (Caution)';
  return 'Extreme (Top Territory)';
}

/**
 * Get the current MVRV status from the most recent data point
 */
export function getCurrentMVRVStatus(data: PriceData[]): MVRVResult | null {
  if (data.length === 0) return null;
  const results = evaluateMVRV(data);
  return results[results.length - 1];
}
