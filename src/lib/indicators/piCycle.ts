import type { PriceData, PiCycleResult, TopSignal } from '../data/types';

/**
 * Calculate Pi Cycle Top Indicator proximity
 *
 * The Pi Cycle Top fires when the 111 DMA crosses above 2x the 350 DMA.
 * Historically, this has called every Bitcoin cycle top within 3 days.
 *
 * Proximity = (111 DMA / (2 × 350 DMA)) × 100
 * - 100% = Pi Cycle has fired (TOP)
 * - >= 98% = Imminent top signal
 */
export function calculatePiCycleProximity(dma111: number, dma350: number): number {
  if (dma350 === 0) return 0;
  const target = 2 * dma350;
  const proximity = (dma111 / target) * 100;
  return Math.min(proximity, 100);
}

/**
 * Evaluate Pi Cycle signals from price data
 * Only signals tops - there is no bottom signal for Pi Cycle
 */
export function evaluatePiCycle(data: PriceData[]): PiCycleResult[] {
  return data.map((d) => {
    // Handle missing data
    if (d.piCycleProx === null || d.dma111 === null || d.dma350 === null) {
      return {
        date: d.date,
        price: d.price,
        piCycleProx: null,
        dma111: null,
        dma350: null,
        signal: 'NEUTRAL' as TopSignal,
        reason: '',
      };
    }

    let signal: TopSignal = 'NEUTRAL';
    let reason = '';

    // Top signal when proximity >= 98%
    if (d.piCycleProx >= 98) {
      signal = 'TOP_SIGNAL';
      reason = `Pi Cycle at ${d.piCycleProx.toFixed(1)}% (CYCLE TOP)`;
    }

    return {
      date: d.date,
      price: d.price,
      piCycleProx: d.piCycleProx,
      dma111: d.dma111,
      dma350: d.dma350,
      signal,
      reason,
    };
  });
}

/**
 * Get Pi Cycle interpretation for display
 */
export function getPiCycleInterpretation(proximity: number | null): string {
  if (proximity === null) return 'No Data';
  if (proximity >= 100) return 'FIRED - Cycle Top';
  if (proximity >= 98) return 'Imminent Top';
  if (proximity >= 90) return 'Warning Zone';
  if (proximity >= 80) return 'Elevated';
  if (proximity >= 60) return 'Neutral';
  return 'Low Risk';
}

/**
 * Get the current Pi Cycle status from the most recent data point
 */
export function getCurrentPiCycleStatus(data: PriceData[]): PiCycleResult | null {
  if (data.length === 0) return null;
  const results = evaluatePiCycle(data);
  return results[results.length - 1];
}
