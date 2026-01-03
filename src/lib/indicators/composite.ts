import type { PriceData, CompositeResult, CompositeSignal, TrendState } from '../data/types';
import { evaluate20WMA } from './ma20w';
import { evaluate200WMA } from './ma200w';
import { evaluateMVRV } from './mvrv';
import { evaluatePiCycle } from './piCycle';
import { evaluateFearGreed } from './fearGreed';

/**
 * Evaluate composite strategy combining all indicators
 *
 * Signal Priority (highest to lowest):
 * 1. ABSOLUTE_BUY: Price touches/breaks 200W MA
 * 2. STRONG_BUY: Near floor + on-chain capitulation
 * 3. TREND_FLIP_BEAR: Price crosses below 20W SMA
 * 4. TREND_FLIP_BULL: Price crosses above 20W SMA
 * 5. TOP_SIGNAL: Multiple indicators signal top
 * 6. BUY_ZONE: Within 25% of 200W MA
 * 7. NEUTRAL: No significant signals
 */
export function evaluateComposite(data: PriceData[]): CompositeResult[] {
  const ma20wResults = evaluate20WMA(data);
  const ma200wResults = evaluate200WMA(data);
  const mvrvResults = evaluateMVRV(data);
  const piResults = evaluatePiCycle(data);
  const fgResults = evaluateFearGreed(data);

  return data.map((d, i) => {
    const ma20w = ma20wResults[i];
    const ma200w = ma200wResults[i];
    const mvrv = mvrvResults[i];
    const pi = piResults[i];
    const fg = fgResults[i];

    let signal: CompositeSignal = 'NEUTRAL';
    let confidence = 0;
    const reasons: string[] = [];

    // Priority 1: ABSOLUTE BUY (200W MA touch/break)
    if (ma200w.signal === 'ABSOLUTE_BUY') {
      signal = 'ABSOLUTE_BUY';
      confidence = 5;
      if (ma200w.reason) reasons.push(ma200w.reason);
    }
    // Priority 2: STRONG BUY (near floor + capitulation signals)
    else if (
      ma200w.buyZone &&
      (mvrv.signal === 'BOTTOM_SIGNAL' || fg.signal === 'BOTTOM_SIGNAL')
    ) {
      signal = 'STRONG_BUY';
      confidence = 4;
      if (ma200w.reason) reasons.push(ma200w.reason);
      if (mvrv.signal === 'BOTTOM_SIGNAL' && mvrv.reason) reasons.push(mvrv.reason);
      if (fg.signal === 'BOTTOM_SIGNAL' && fg.reason) reasons.push(fg.reason);
    }
    // Priority 3: TREND FLIP BEAR
    else if (ma20w.signal === 'FLIP_TO_BEAR') {
      signal = 'TREND_FLIP_BEAR';
      confidence = 3;
      reasons.push(`Price crossed below 20W SMA on ${ma20w.date}`);
    }
    // Priority 4: TREND FLIP BULL
    else if (ma20w.signal === 'FLIP_TO_BULL') {
      signal = 'TREND_FLIP_BULL';
      confidence = 3;
      reasons.push(`Price crossed above 20W SMA on ${ma20w.date}`);
    }
    // Priority 5: TOP SIGNAL (multiple indicators)
    else {
      const topSignals = [
        mvrv.signal === 'TOP_SIGNAL',
        pi.signal === 'TOP_SIGNAL',
        fg.signal === 'TOP_SIGNAL',
      ].filter(Boolean).length;

      if (topSignals >= 2) {
        signal = 'TOP_SIGNAL';
        confidence = topSignals;
        if (mvrv.signal === 'TOP_SIGNAL' && mvrv.reason) reasons.push(mvrv.reason);
        if (pi.signal === 'TOP_SIGNAL' && pi.reason) reasons.push(pi.reason);
        if (fg.signal === 'TOP_SIGNAL' && fg.reason) reasons.push(fg.reason);
      }
      // Priority 6: BUY ZONE
      else if (ma200w.signal === 'STRONG_BUY' || ma200w.signal === 'BUY_ZONE') {
        signal = ma200w.signal;
        confidence = ma200w.signal === 'STRONG_BUY' ? 2 : 1;
        if (ma200w.reason) reasons.push(ma200w.reason);
      }
    }

    return {
      date: d.date,
      price: d.price,
      trend: ma20w.trend,
      signal,
      confidence,
      reasons,
      ma20w: d.ma20w,
      ma200w: d.ma200w,
      percentFrom20w: ma20w.percentFromMA,
      percentFrom200w: ma200w.percentAbove,
      mvrv: d.mvrv,
      fearGreed: d.fearGreed,
      piCycleProx: d.piCycleProx,
      trendFlipDate: ma20w.trendFlipDate,
      weeksInTrend: ma20w.weeksInTrend,
      buyZone: ma200w.buyZone,
    };
  });
}

/**
 * Get the current composite status from the most recent data point
 */
export function getCurrentCompositeStatus(data: PriceData[]): CompositeResult | null {
  if (data.length === 0) return null;
  const results = evaluateComposite(data);
  return results[results.length - 1];
}

/**
 * Extract signal history from composite results
 * Returns only entries where a non-NEUTRAL signal occurred
 */
export function extractSignalHistory(
  results: CompositeResult[],
  limit: number = 10
): CompositeResult[] {
  return results
    .filter((r) => r.signal !== 'NEUTRAL')
    .slice(-limit)
    .reverse();
}

/**
 * Get signal display properties
 */
export function getSignalDisplayProps(signal: CompositeSignal): {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
} {
  switch (signal) {
    case 'ABSOLUTE_BUY':
      return {
        label: 'ABSOLUTE BUY',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-400/20',
        icon: '🟢',
      };
    case 'STRONG_BUY':
      return {
        label: 'STRONG BUY',
        color: 'text-emerald-300',
        bgColor: 'bg-emerald-300/20',
        icon: '🟢',
      };
    case 'BUY_ZONE':
      return {
        label: 'BUY ZONE',
        color: 'text-green-400',
        bgColor: 'bg-green-400/20',
        icon: '🟢',
      };
    case 'TREND_FLIP_BULL':
      return {
        label: 'TREND FLIP BULL',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-400/20',
        icon: '📈',
      };
    case 'TREND_FLIP_BEAR':
      return {
        label: 'TREND FLIP BEAR',
        color: 'text-red-400',
        bgColor: 'bg-red-400/20',
        icon: '📉',
      };
    case 'TOP_SIGNAL':
      return {
        label: 'TOP SIGNAL',
        color: 'text-red-400',
        bgColor: 'bg-red-400/20',
        icon: '🔴',
      };
    default:
      return {
        label: 'NEUTRAL',
        color: 'text-slate-400',
        bgColor: 'bg-slate-400/20',
        icon: '⚪',
      };
  }
}

/**
 * Get trend display properties
 */
export function getTrendDisplayProps(trend: TrendState): {
  label: string;
  color: string;
  bgColor: string;
} {
  switch (trend) {
    case 'BULL':
      return {
        label: 'BULLISH',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-400/20',
      };
    case 'BEAR':
      return {
        label: 'BEARISH',
        color: 'text-red-400',
        bgColor: 'bg-red-400/20',
      };
    default:
      return {
        label: 'NO DATA',
        color: 'text-slate-400',
        bgColor: 'bg-slate-400/20',
      };
  }
}
