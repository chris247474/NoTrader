/**
 * Format a price value with proper currency formatting
 */
export function formatPrice(price: number | null): string {
  if (price === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format a price with more precision for smaller values
 */
export function formatPricePrecise(price: number | null): string {
  if (price === null) return 'N/A';
  if (price < 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(price);
  }
  if (price < 100) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }
  return formatPrice(price);
}

/**
 * Format a percentage value
 */
export function formatPercent(value: number | null, showSign: boolean = true): string {
  if (value === null) return 'N/A';
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Format a number with commas
 */
export function formatNumber(value: number | null): string {
  if (value === null) return 'N/A';
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format a number with specified decimal places
 */
export function formatDecimal(value: number | null, decimals: number = 2): string {
  if (value === null) return 'N/A';
  return value.toFixed(decimals);
}

/**
 * Compact number formatting (e.g., 1.2K, 3.5M)
 */
export function formatCompact(value: number | null): string {
  if (value === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Get color class based on percentage (positive = green, negative = red)
 */
export function getPercentColor(value: number | null): string {
  if (value === null) return 'text-slate-400';
  if (value > 0) return 'text-emerald-400';
  if (value < 0) return 'text-red-400';
  return 'text-slate-400';
}

/**
 * Get color class for MVRV values
 */
export function getMVRVColor(value: number | null): string {
  if (value === null) return 'text-slate-400';
  if (value <= 0.5) return 'text-emerald-400';
  if (value <= 2.0) return 'text-yellow-400';
  if (value <= 4.0) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get color class for Fear & Greed values
 */
export function getFearGreedColor(value: number | null): string {
  if (value === null) return 'text-slate-400';
  if (value <= 25) return 'text-red-400';
  if (value <= 45) return 'text-orange-400';
  if (value <= 55) return 'text-yellow-400';
  if (value <= 75) return 'text-green-400';
  return 'text-emerald-400';
}

/**
 * Get color class for Pi Cycle proximity
 */
export function getPiCycleColor(value: number | null): string {
  if (value === null) return 'text-slate-400';
  if (value >= 98) return 'text-red-400';
  if (value >= 90) return 'text-orange-400';
  if (value >= 80) return 'text-yellow-400';
  return 'text-slate-400';
}
