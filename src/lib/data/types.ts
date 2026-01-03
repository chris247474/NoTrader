// Core price data structure
export interface PriceData {
  date: string;
  price: number;
  ma20w: number | null;
  ma200w: number | null;
  mvrv: number | null;
  fearGreed: number | null;
  piCycleProx: number | null;
  dma111: number | null;
  dma350: number | null;
}

// Trend states
export type TrendState = 'BULL' | 'BEAR' | 'NO_DATA';

// Signal types
export type TrendSignal = 'FLIP_TO_BULL' | 'FLIP_TO_BEAR' | 'NEUTRAL';
export type BuySignal = 'ABSOLUTE_BUY' | 'STRONG_BUY' | 'BUY_ZONE' | 'NEUTRAL' | 'NO_DATA';
export type TopSignal = 'TOP_SIGNAL' | 'NEUTRAL';
export type BottomSignal = 'BOTTOM_SIGNAL' | 'NEUTRAL';
export type CompositeSignal =
  | 'ABSOLUTE_BUY'
  | 'STRONG_BUY'
  | 'BUY_ZONE'
  | 'TREND_FLIP_BULL'
  | 'TREND_FLIP_BEAR'
  | 'TOP_SIGNAL'
  | 'NEUTRAL';

// 20W SMA Trend Result
export interface TrendResult {
  date: string;
  price: number;
  ma20w: number | null;
  percentFromMA: number | null;
  trend: TrendState;
  signal: TrendSignal;
  trendFlipDate: string | null;
  weeksInTrend: number;
}

// 200W MA Floor Result
export interface FloorResult {
  date: string;
  price: number;
  ma200w: number | null;
  percentAbove: number | null;
  signal: BuySignal;
  buyZone: boolean;
  reason: string;
}

// MVRV Result
export interface MVRVResult {
  date: string;
  price: number;
  mvrv: number | null;
  mvrvPeak: number;
  signal: TopSignal | BottomSignal | 'NEUTRAL';
  reason: string;
}

// Pi Cycle Result
export interface PiCycleResult {
  date: string;
  price: number;
  piCycleProx: number | null;
  dma111: number | null;
  dma350: number | null;
  signal: TopSignal;
  reason: string;
}

// Fear & Greed Result
export interface FearGreedResult {
  date: string;
  price: number;
  fearGreed: number | null;
  signal: TopSignal | BottomSignal | 'NEUTRAL';
  reason: string;
}

// Composite Strategy Result
export interface CompositeResult {
  date: string;
  price: number;
  trend: TrendState;
  signal: CompositeSignal;
  confidence: number;
  reasons: string[];
  // All indicator values
  ma20w: number | null;
  ma200w: number | null;
  percentFrom20w: number | null;
  percentFrom200w: number | null;
  mvrv: number | null;
  fearGreed: number | null;
  piCycleProx: number | null;
  // Additional tracking
  trendFlipDate: string | null;
  weeksInTrend: number;
  buyZone: boolean;
}

// Historical reference data for backtesting
export interface CycleEvent {
  date: string;
  price: number;
  mvrv: number;
  fearGreed: number;
  piCycleProx?: number;
  type: 'TOP' | 'BOTTOM';
  notes?: string;
}

// API Response types
export interface CoinGeckoPriceResponse {
  bitcoin: {
    usd: number;
  };
}

export interface CoinGeckoHistoryResponse {
  prices: [number, number][]; // [timestamp, price]
}

export interface FearGreedResponse {
  data: {
    value: string;
    value_classification: string;
    timestamp: string;
  }[];
}

// Dashboard state
export interface DashboardState {
  currentPrice: number;
  lastUpdated: string;
  trend: TrendState;
  trendFlipDate: string | null;
  weeksInTrend: number;
  ma20w: number | null;
  ma200w: number | null;
  percentFrom20w: number | null;
  percentFrom200w: number | null;
  mvrv: number | null;
  fearGreed: number | null;
  piCycleProx: number | null;
  currentSignal: CompositeSignal;
  signalReasons: string[];
  buyZone: boolean;
  isLoading: boolean;
  error: string | null;
}

// Signal history entry
export interface SignalHistoryEntry {
  date: string;
  signal: CompositeSignal;
  reason: string;
  price: number;
}
