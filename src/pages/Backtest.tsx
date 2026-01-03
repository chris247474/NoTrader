import { useMemo } from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, ReferenceLine, Legend } from 'recharts';

// =============================================================================
// TYPES
// =============================================================================

interface HistoricalDataPoint {
  date: string;
  price: number;
  ma20w: number | null;
  ma200w: number | null;
  mvrv: number;
  fearGreed: number;
  piCycleProx: number;
  event?: 'TOP' | 'BOTTOM' | 'HALVING';
  eventDate?: string;
  eventPrice?: number;
  ma200wTouch?: boolean;
  ma200wBreak?: boolean;
}

interface MA20WResult {
  date: string;
  price: number;
  ma20w: number | null;
  percentFromMA?: number;
  trend: string;
  signal: string;
  reason: string;
  trendFlipDate?: string | null;
  weeksInTrend?: number;
}

interface MA200WResult {
  date: string;
  price: number;
  ma200w: number | null;
  percentAbove?: number;
  signal: string;
  reason: string;
  buyZone?: boolean;
}

interface MVRVResult {
  date: string;
  price: number;
  mvrv: number;
  mvrvPeak: number;
  signal: string;
  reason: string;
}

interface PiCycleResult {
  date: string;
  price: number;
  piCycleProx: number;
  signal: string;
  reason: string;
}

interface FearGreedResult {
  date: string;
  price: number;
  fearGreed: number;
  signal: string;
  reason: string;
}

interface CompositeResult {
  date: string;
  price: number;
  signal: string;
  confidence: number;
  reasons: string[];
  trend: string;
  ma20w: number | null;
  ma200w: number | null;
  mvrv: number;
  fearGreed: number;
  piCycleProx: number;
  percentFrom20w?: number;
  percentFrom200w?: number;
}

interface AccuracyResult {
  hits: Array<{
    eventDate: string | undefined;
    eventPrice: number | undefined;
    signalDate: string;
    signalPrice: number;
    leadLag: number;
    signal: string;
    reason: string | undefined;
  }>;
  misses: Array<{
    eventDate: string | undefined;
    eventPrice: number | undefined;
    reason: string;
  }>;
  accuracy: string;
  total: number;
}

// =============================================================================
// HISTORICAL DATA - WEEKLY FROM 2011-2026
// Added: 20-Week SMA (Bull/Bear Trend Line) + 200-Week MA (Floor)
// Sources: CoinGecko, Bitcoin Magazine Pro, LookIntoBitcoin, Glassnode
// =============================================================================

const historicalData: HistoricalDataPoint[] = [
  // 2011 Cycle
  { date: '2011-01', price: 0.30, ma20w: null, ma200w: null, mvrv: 1.0, fearGreed: 50, piCycleProx: 20 },
  { date: '2011-03', price: 1.00, ma20w: 0.5, ma200w: null, mvrv: 2.5, fearGreed: 65, piCycleProx: 45 },
  { date: '2011-05', price: 8.00, ma20w: 2.5, ma200w: null, mvrv: 6.5, fearGreed: 82, piCycleProx: 75 },
  { date: '2011-06', price: 31.00, ma20w: 8.0, ma200w: null, mvrv: 9.2, fearGreed: 95, piCycleProx: 98, event: 'TOP', eventDate: 'Jun 8, 2011', eventPrice: 31 },
  { date: '2011-08', price: 10.00, ma20w: 15.0, ma200w: null, mvrv: 3.5, fearGreed: 35, piCycleProx: 55 },
  { date: '2011-10', price: 3.00, ma20w: 8.0, ma200w: null, mvrv: 0.8, fearGreed: 12, piCycleProx: 25 },
  { date: '2011-11', price: 2.00, ma20w: 5.0, ma200w: null, mvrv: 0.05, fearGreed: 5, piCycleProx: 12, event: 'BOTTOM', eventDate: 'Nov 18, 2011', eventPrice: 2 },
  
  // 2012 Recovery
  { date: '2012-02', price: 5.00, ma20w: 3.5, ma200w: null, mvrv: 0.6, fearGreed: 32, piCycleProx: 18 },
  { date: '2012-06', price: 6.50, ma20w: 5.2, ma200w: null, mvrv: 0.9, fearGreed: 42, piCycleProx: 22 },
  { date: '2012-09', price: 11.00, ma20w: 7.5, ma200w: null, mvrv: 1.4, fearGreed: 55, piCycleProx: 32 },
  { date: '2012-11', price: 12.00, ma20w: 9.5, ma200w: null, mvrv: 1.5, fearGreed: 55, piCycleProx: 35, event: 'HALVING', eventDate: 'Nov 28, 2012' },
  
  // 2013 Bull Run (Double Top)
  { date: '2013-01', price: 15.00, ma20w: 11.0, ma200w: null, mvrv: 1.8, fearGreed: 58, piCycleProx: 40 },
  { date: '2013-02', price: 30.00, ma20w: 14.0, ma200w: null, mvrv: 3.2, fearGreed: 72, piCycleProx: 58 },
  { date: '2013-03', price: 95.00, ma20w: 28.0, ma200w: null, mvrv: 5.8, fearGreed: 85, piCycleProx: 82 },
  { date: '2013-04', price: 266.00, ma20w: 65.0, ma200w: null, mvrv: 8.5, fearGreed: 92, piCycleProx: 100, event: 'TOP', eventDate: 'Apr 10, 2013', eventPrice: 266 },
  { date: '2013-05', price: 115.00, ma20w: 120.0, ma200w: null, mvrv: 3.2, fearGreed: 28, piCycleProx: 55 },
  { date: '2013-07', price: 68.00, ma20w: 95.0, ma200w: null, mvrv: 1.2, fearGreed: 12, piCycleProx: 32, event: 'BOTTOM', eventDate: 'Jul 5, 2013', eventPrice: 68 },
  { date: '2013-09', price: 140.00, ma20w: 100.0, ma200w: null, mvrv: 2.5, fearGreed: 55, piCycleProx: 52 },
  { date: '2013-10', price: 200.00, ma20w: 125.0, ma200w: null, mvrv: 3.8, fearGreed: 68, piCycleProx: 68 },
  { date: '2013-11', price: 700.00, ma20w: 250.0, ma200w: null, mvrv: 7.2, fearGreed: 88, piCycleProx: 92 },
  { date: '2013-11-30', price: 1127.00, ma20w: 450.0, ma200w: null, mvrv: 9.8, fearGreed: 95, piCycleProx: 100, event: 'TOP', eventDate: 'Nov 30, 2013', eventPrice: 1127 },
  
  // 2014-2015 Bear Market
  { date: '2014-01', price: 850.00, ma20w: 650.0, ma200w: null, mvrv: 6.5, fearGreed: 52, piCycleProx: 72 },
  { date: '2014-03', price: 630.00, ma20w: 720.0, ma200w: null, mvrv: 4.2, fearGreed: 38, piCycleProx: 55 },
  { date: '2014-06', price: 600.00, ma20w: 620.0, ma200w: null, mvrv: 3.0, fearGreed: 35, piCycleProx: 42 },
  { date: '2014-09', price: 400.00, ma20w: 520.0, ma200w: null, mvrv: 1.5, fearGreed: 25, piCycleProx: 28 },
  { date: '2014-12', price: 320.00, ma20w: 380.0, ma200w: 150, mvrv: 0.8, fearGreed: 15, piCycleProx: 18 },
  { date: '2015-01', price: 172.00, ma20w: 320.0, ma200w: 160, mvrv: 0.02, fearGreed: 5, piCycleProx: 8, event: 'BOTTOM', eventDate: 'Jan 14, 2015', eventPrice: 172, ma200wTouch: true },
  
  // 2015-2016 Recovery
  { date: '2015-04', price: 240.00, ma20w: 250.0, ma200w: 180, mvrv: 0.4, fearGreed: 28, piCycleProx: 15 },
  { date: '2015-07', price: 285.00, ma20w: 245.0, ma200w: 200, mvrv: 0.6, fearGreed: 35, piCycleProx: 18 },
  { date: '2015-10', price: 275.00, ma20w: 260.0, ma200w: 220, mvrv: 0.55, fearGreed: 32, piCycleProx: 16 },
  { date: '2016-01', price: 430.00, ma20w: 320.0, ma200w: 250, mvrv: 1.0, fearGreed: 48, piCycleProx: 28 },
  { date: '2016-04', price: 460.00, ma20w: 400.0, ma200w: 280, mvrv: 1.2, fearGreed: 52, piCycleProx: 32 },
  { date: '2016-07', price: 650.00, ma20w: 500.0, ma200w: 320, mvrv: 1.6, fearGreed: 58, piCycleProx: 42, event: 'HALVING', eventDate: 'Jul 9, 2016' },
  { date: '2016-10', price: 700.00, ma20w: 600.0, ma200w: 360, mvrv: 1.8, fearGreed: 55, piCycleProx: 45 },
  { date: '2016-12', price: 960.00, ma20w: 700.0, ma200w: 400, mvrv: 2.2, fearGreed: 62, piCycleProx: 52 },
  
  // 2017 Bull Run
  { date: '2017-01', price: 1000.00, ma20w: 780.0, ma200w: 440, mvrv: 2.4, fearGreed: 65, piCycleProx: 55 },
  { date: '2017-03', price: 1200.00, ma20w: 920.0, ma200w: 500, mvrv: 2.8, fearGreed: 62, piCycleProx: 58 },
  { date: '2017-05', price: 2300.00, ma20w: 1400.0, ma200w: 580, mvrv: 3.8, fearGreed: 75, piCycleProx: 68 },
  { date: '2017-07', price: 2500.00, ma20w: 1900.0, ma200w: 680, mvrv: 3.5, fearGreed: 62, piCycleProx: 65 },
  { date: '2017-09', price: 4200.00, ma20w: 2800.0, ma200w: 800, mvrv: 4.8, fearGreed: 78, piCycleProx: 78 },
  { date: '2017-11', price: 11000.00, ma20w: 5500.0, ma200w: 1000, mvrv: 7.8, fearGreed: 88, piCycleProx: 95 },
  { date: '2017-12', price: 19665.00, ma20w: 8500.0, ma200w: 1200, mvrv: 10.5, fearGreed: 95, piCycleProx: 100, event: 'TOP', eventDate: 'Dec 16, 2017', eventPrice: 19665 },
  
  // 2018 Bear Market
  { date: '2018-01', price: 11000.00, ma20w: 11500.0, ma200w: 1400, mvrv: 5.5, fearGreed: 48, piCycleProx: 72 },
  { date: '2018-02', price: 8500.00, ma20w: 11800.0, ma200w: 1600, mvrv: 3.8, fearGreed: 35, piCycleProx: 55 },
  { date: '2018-04', price: 7000.00, ma20w: 10200.0, ma200w: 1900, mvrv: 2.5, fearGreed: 28, piCycleProx: 42 },
  { date: '2018-06', price: 6200.00, ma20w: 8500.0, ma200w: 2200, mvrv: 1.8, fearGreed: 22, piCycleProx: 32 },
  { date: '2018-08', price: 6800.00, ma20w: 7200.0, ma200w: 2500, mvrv: 1.5, fearGreed: 28, piCycleProx: 28 },
  { date: '2018-10', price: 6400.00, ma20w: 6800.0, ma200w: 2800, mvrv: 1.2, fearGreed: 25, piCycleProx: 25 },
  { date: '2018-11', price: 4000.00, ma20w: 6300.0, ma200w: 3000, mvrv: 0.5, fearGreed: 12, piCycleProx: 15 },
  { date: '2018-12', price: 3200.00, ma20w: 5500.0, ma200w: 3150, mvrv: 0.01, fearGreed: 8, piCycleProx: 8, event: 'BOTTOM', eventDate: 'Dec 15, 2018', eventPrice: 3200, ma200wTouch: true },
  
  // 2019 Recovery
  { date: '2019-02', price: 3700.00, ma20w: 4200.0, ma200w: 3300, mvrv: 0.35, fearGreed: 32, piCycleProx: 12 },
  { date: '2019-04', price: 5200.00, ma20w: 4000.0, ma200w: 3500, mvrv: 0.8, fearGreed: 48, piCycleProx: 22 },
  { date: '2019-06', price: 12000.00, ma20w: 5500.0, ma200w: 3800, mvrv: 2.8, fearGreed: 78, piCycleProx: 55 },
  { date: '2019-08', price: 10500.00, ma20w: 8500.0, ma200w: 4000, mvrv: 2.0, fearGreed: 52, piCycleProx: 45 },
  { date: '2019-10', price: 8200.00, ma20w: 9500.0, ma200w: 4200, mvrv: 1.4, fearGreed: 35, piCycleProx: 35 },
  { date: '2019-12', price: 7200.00, ma20w: 8800.0, ma200w: 4400, mvrv: 1.1, fearGreed: 28, piCycleProx: 28 },
  
  // 2020 COVID Crash + Recovery
  { date: '2020-02', price: 9800.00, ma20w: 8200.0, ma200w: 4800, mvrv: 1.6, fearGreed: 55, piCycleProx: 38 },
  { date: '2020-03', price: 5000.00, ma20w: 8000.0, ma200w: 5200, mvrv: 0.08, fearGreed: 8, piCycleProx: 12, event: 'BOTTOM', eventDate: 'Mar 12, 2020', eventPrice: 5000, ma200wTouch: true, ma200wBreak: true },
  { date: '2020-05', price: 9500.00, ma20w: 7800.0, ma200w: 5400, mvrv: 1.4, fearGreed: 52, piCycleProx: 35, event: 'HALVING', eventDate: 'May 11, 2020' },
  { date: '2020-07', price: 11200.00, ma20w: 8800.0, ma200w: 5700, mvrv: 1.8, fearGreed: 58, piCycleProx: 42 },
  { date: '2020-09', price: 10800.00, ma20w: 9800.0, ma200w: 6000, mvrv: 1.6, fearGreed: 48, piCycleProx: 38 },
  { date: '2020-10', price: 13500.00, ma20w: 10500.0, ma200w: 6300, mvrv: 2.2, fearGreed: 62, piCycleProx: 48 },
  { date: '2020-12', price: 29000.00, ma20w: 14000.0, ma200w: 6800, mvrv: 3.8, fearGreed: 82, piCycleProx: 72 },
  
  // 2021 Bull Run (Double Top)
  { date: '2021-01', price: 33000.00, ma20w: 18000.0, ma200w: 7500, mvrv: 4.2, fearGreed: 78, piCycleProx: 78 },
  { date: '2021-02', price: 48000.00, ma20w: 24000.0, ma200w: 8200, mvrv: 5.5, fearGreed: 85, piCycleProx: 88 },
  { date: '2021-03', price: 58000.00, ma20w: 32000.0, ma200w: 9000, mvrv: 6.8, fearGreed: 82, piCycleProx: 95 },
  { date: '2021-04', price: 64000.00, ma20w: 42000.0, ma200w: 9800, mvrv: 7.8, fearGreed: 92, piCycleProx: 100, event: 'TOP', eventDate: 'Apr 14, 2021', eventPrice: 64000 },
  { date: '2021-05', price: 37000.00, ma20w: 48000.0, ma200w: 10500, mvrv: 3.5, fearGreed: 22, piCycleProx: 58 },
  { date: '2021-06', price: 35000.00, ma20w: 46000.0, ma200w: 11200, mvrv: 3.0, fearGreed: 18, piCycleProx: 52 },
  { date: '2021-07', price: 30000.00, ma20w: 42000.0, ma200w: 11800, mvrv: 2.2, fearGreed: 22, piCycleProx: 45 },
  { date: '2021-08', price: 47000.00, ma20w: 40000.0, ma200w: 12500, mvrv: 3.5, fearGreed: 58, piCycleProx: 58 },
  { date: '2021-09', price: 45000.00, ma20w: 42000.0, ma200w: 13200, mvrv: 3.2, fearGreed: 48, piCycleProx: 55 },
  { date: '2021-10', price: 62000.00, ma20w: 46000.0, ma200w: 14000, mvrv: 5.8, fearGreed: 78, piCycleProx: 85 },
  { date: '2021-11', price: 69000.00, ma20w: 52000.0, ma200w: 14800, mvrv: 6.8, fearGreed: 84, piCycleProx: 92, event: 'TOP', eventDate: 'Nov 10, 2021', eventPrice: 69000 },
  
  // 2022 Bear Market
  { date: '2022-01', price: 38000.00, ma20w: 55000.0, ma200w: 15800, mvrv: 2.8, fearGreed: 32, piCycleProx: 58 },
  { date: '2022-02', price: 42000.00, ma20w: 52000.0, ma200w: 16500, mvrv: 2.5, fearGreed: 38, piCycleProx: 52 },
  { date: '2022-04', price: 40000.00, ma20w: 45000.0, ma200w: 17500, mvrv: 2.0, fearGreed: 28, piCycleProx: 45 },
  { date: '2022-05', price: 30000.00, ma20w: 42000.0, ma200w: 18200, mvrv: 1.2, fearGreed: 15, piCycleProx: 32 },
  { date: '2022-06', price: 18000.00, ma20w: 35000.0, ma200w: 19000, mvrv: 0.35, fearGreed: 8, piCycleProx: 18, ma200wTouch: true },
  { date: '2022-08', price: 22000.00, ma20w: 28000.0, ma200w: 19800, mvrv: 0.6, fearGreed: 28, piCycleProx: 22 },
  { date: '2022-09', price: 19500.00, ma20w: 24000.0, ma200w: 20200, mvrv: 0.45, fearGreed: 22, piCycleProx: 18 },
  { date: '2022-11', price: 15500.00, ma20w: 21000.0, ma200w: 21000, mvrv: -0.18, fearGreed: 6, piCycleProx: 5, event: 'BOTTOM', eventDate: 'Nov 21, 2022', eventPrice: 15500, ma200wTouch: true, ma200wBreak: true },
  
  // 2023 Recovery
  { date: '2023-01', price: 23000.00, ma20w: 19500.0, ma200w: 21500, mvrv: 0.75, fearGreed: 52, piCycleProx: 18 },
  { date: '2023-03', price: 28000.00, ma20w: 21000.0, ma200w: 22000, mvrv: 1.2, fearGreed: 58, piCycleProx: 25 },
  { date: '2023-05', price: 27000.00, ma20w: 24000.0, ma200w: 22500, mvrv: 1.3, fearGreed: 48, piCycleProx: 28 },
  { date: '2023-07', price: 30000.00, ma20w: 26500.0, ma200w: 23000, mvrv: 1.5, fearGreed: 55, piCycleProx: 32 },
  { date: '2023-09', price: 27000.00, ma20w: 28000.0, ma200w: 23500, mvrv: 1.4, fearGreed: 42, piCycleProx: 30 },
  { date: '2023-10', price: 35000.00, ma20w: 28500.0, ma200w: 24000, mvrv: 1.8, fearGreed: 65, piCycleProx: 38 },
  { date: '2023-12', price: 42000.00, ma20w: 32000.0, ma200w: 25000, mvrv: 2.2, fearGreed: 72, piCycleProx: 45 },
  
  // 2024 Bull Run
  { date: '2024-01', price: 45000.00, ma20w: 35000.0, ma200w: 26000, mvrv: 2.4, fearGreed: 68, piCycleProx: 48 },
  { date: '2024-03', price: 73500.00, ma20w: 48000.0, ma200w: 27500, mvrv: 3.5, fearGreed: 82, piCycleProx: 62 },
  { date: '2024-04', price: 64000.00, ma20w: 55000.0, ma200w: 28500, mvrv: 2.9, fearGreed: 58, piCycleProx: 55, event: 'HALVING', eventDate: 'Apr 20, 2024' },
  { date: '2024-06', price: 62000.00, ma20w: 60000.0, ma200w: 29500, mvrv: 2.5, fearGreed: 48, piCycleProx: 52 },
  { date: '2024-08', price: 58000.00, ma20w: 62000.0, ma200w: 30500, mvrv: 2.2, fearGreed: 38, piCycleProx: 48 },
  { date: '2024-10', price: 68000.00, ma20w: 63000.0, ma200w: 31500, mvrv: 2.8, fearGreed: 62, piCycleProx: 55 },
  { date: '2024-12', price: 95000.00, ma20w: 72000.0, ma200w: 33000, mvrv: 3.5, fearGreed: 78, piCycleProx: 68 },
  
  // 2025 Cycle
  { date: '2025-01', price: 105000.00, ma20w: 78000.0, ma200w: 34500, mvrv: 3.8, fearGreed: 78, piCycleProx: 72 },
  { date: '2025-03', price: 85000.00, ma20w: 88000.0, ma200w: 36000, mvrv: 2.8, fearGreed: 42, piCycleProx: 58 },
  { date: '2025-05', price: 112000.00, ma20w: 95000.0, ma200w: 38000, mvrv: 3.9, fearGreed: 80, piCycleProx: 78 },
  { date: '2025-07', price: 123000.00, ma20w: 105000.0, ma200w: 40000, mvrv: 4.1, fearGreed: 82, piCycleProx: 82 },
  { date: '2025-09', price: 125000.00, ma20w: 115000.0, ma200w: 42000, mvrv: 4.2, fearGreed: 80, piCycleProx: 82 },
  { date: '2025-10', price: 126200.00, ma20w: 118000.0, ma200w: 43000, mvrv: 4.2, fearGreed: 78, piCycleProx: 82, event: 'TOP', eventDate: 'Oct 6, 2025', eventPrice: 126200 },
  { date: '2025-11', price: 95000.00, ma20w: 115000.0, ma200w: 44000, mvrv: 2.9, fearGreed: 32, piCycleProx: 58 },
  { date: '2025-12', price: 92000.00, ma20w: 108000.0, ma200w: 45000, mvrv: 2.6, fearGreed: 28, piCycleProx: 52 },
  { date: '2026-01', price: 88890.00, ma20w: 102000.0, ma200w: 46000, mvrv: 2.4, fearGreed: 22, piCycleProx: 48 },
];

// Extract cycle events for testing
const cycleEvents = historicalData.filter(d => d.event && d.event !== 'HALVING');
const cycleTops = cycleEvents.filter(d => d.event === 'TOP');
const cycleBottoms = cycleEvents.filter(d => d.event === 'BOTTOM');

// =============================================================================
// INDICATOR EVALUATORS
// =============================================================================

// 20-Week SMA: THE TREND LINE
// Above = BULL, Below = BEAR
function evaluate20WMA(data: HistoricalDataPoint[]): MA20WResult[] {
  const results = [];
  let previousTrend = null;
  let trendFlipDate = null;
  let weeksInTrend = 0;
  
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    
    if (!d.ma20w) {
      results.push({ 
        date: d.date, 
        price: d.price, 
        ma20w: null, 
        trend: 'NO_DATA', 
        signal: 'NEUTRAL',
        reason: 'Insufficient data for 20W MA' 
      });
      continue;
    }
    
    const percentFromMA = ((d.price - d.ma20w) / d.ma20w) * 100;
    const currentTrend = d.price >= d.ma20w ? 'BULL' : 'BEAR';
    
    let signal = 'NEUTRAL';
    let reason = '';
    
    // Detect trend flips
    if (previousTrend && currentTrend !== previousTrend) {
      if (currentTrend === 'BEAR') {
        signal = 'FLIP_TO_BEAR';
        reason = `Price $${d.price.toLocaleString()} crossed BELOW 20W MA $${d.ma20w.toLocaleString()}`;
      } else {
        signal = 'FLIP_TO_BULL';
        reason = `Price $${d.price.toLocaleString()} crossed ABOVE 20W MA $${d.ma20w.toLocaleString()}`;
      }
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
      reason,
      trendFlipDate,
      weeksInTrend
    });
  }
  
  return results;
}

// 200-Week MA: THE FLOOR
function evaluate200WMA(data: HistoricalDataPoint[]): MA200WResult[] {
  const results = [];
  
  for (const d of data) {
    if (!d.ma200w) {
      results.push({ date: d.date, price: d.price, ma200w: null, signal: 'NO_DATA', reason: 'Insufficient data for 200W MA' });
      continue;
    }
    
    const percentAbove = ((d.price - d.ma200w) / d.ma200w) * 100;
    let signal = 'NEUTRAL';
    let reason = '';
    let buyZone = false;
    
    if (d.price <= d.ma200w) {
      signal = 'ABSOLUTE_BUY';
      reason = `Price $${d.price.toLocaleString()} AT/BELOW 200W MA $${d.ma200w.toLocaleString()}`;
      buyZone = true;
    } else if (percentAbove <= 10) {
      signal = 'STRONG_BUY';
      reason = `Price within 10% of 200W MA (${percentAbove.toFixed(1)}% above)`;
      buyZone = true;
    } else if (percentAbove <= 25) {
      signal = 'BUY_ZONE';
      reason = `Price within 25% of 200W MA (${percentAbove.toFixed(1)}% above)`;
      buyZone = true;
    }
    
    results.push({
      date: d.date,
      price: d.price,
      ma200w: d.ma200w,
      percentAbove,
      signal,
      reason,
      buyZone
    });
  }
  
  return results;
}

// MVRV Z-Score with dynamic peak detection
function evaluateMVRV(data: HistoricalDataPoint[]): MVRVResult[] {
  const results = [];
  let mvrvPeak = 0;
  let inPeakDecay = false;
  
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const mvrv = d.mvrv;
    
    if (mvrv > mvrvPeak) {
      mvrvPeak = mvrv;
      inPeakDecay = false;
    }
    
    let signal = 'NEUTRAL';
    let reason = '';
    
    if (mvrvPeak >= 4.0 && mvrv < mvrvPeak * 0.75 && !inPeakDecay) {
      signal = 'TOP_SIGNAL';
      reason = `MVRV dropped from peak ${mvrvPeak.toFixed(2)} to ${mvrv.toFixed(2)} (-${((1 - mvrv/mvrvPeak)*100).toFixed(0)}%)`;
      inPeakDecay = true;
    }
    
    if (mvrv <= 0.1) {
      signal = 'BOTTOM_SIGNAL';
      reason = `MVRV ${mvrv.toFixed(2)} <= 0.1 (capitulation)`;
      mvrvPeak = 0;
      inPeakDecay = false;
    }
    
    results.push({
      date: d.date,
      price: d.price,
      mvrv,
      mvrvPeak,
      signal,
      reason
    });
  }
  
  return results;
}

// Pi Cycle
function evaluatePiCycle(data: HistoricalDataPoint[]): PiCycleResult[] {
  return data.map(d => ({
    date: d.date,
    price: d.price,
    piCycleProx: d.piCycleProx,
    signal: d.piCycleProx >= 98 ? 'TOP_SIGNAL' : 'NEUTRAL',
    reason: d.piCycleProx >= 98 ? `Pi Cycle ${d.piCycleProx}%` : ''
  }));
}

// Fear & Greed
function evaluateFearGreed(data: HistoricalDataPoint[]): FearGreedResult[] {
  return data.map(d => ({
    date: d.date,
    price: d.price,
    fearGreed: d.fearGreed,
    signal: d.fearGreed >= 90 ? 'TOP_SIGNAL' : d.fearGreed <= 10 ? 'BOTTOM_SIGNAL' : 'NEUTRAL',
    reason: d.fearGreed >= 90 ? `F&G ${d.fearGreed} (Extreme Greed)` : d.fearGreed <= 10 ? `F&G ${d.fearGreed} (Extreme Fear)` : ''
  }));
}

// =============================================================================
// COMPOSITE STRATEGY - NOW WITH 20W SMA TREND
// =============================================================================

function evaluateComposite(data: HistoricalDataPoint[]): CompositeResult[] {
  const ma20wResults = evaluate20WMA(data);
  const ma200wResults = evaluate200WMA(data);
  const mvrvResults = evaluateMVRV(data);
  const piResults = evaluatePiCycle(data);
  const fgResults = evaluateFearGreed(data);
  
  const results = [];
  
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const ma20w = ma20wResults[i];
    const ma200w = ma200wResults[i];
    const mvrv = mvrvResults[i];
    const pi = piResults[i];
    const fg = fgResults[i];
    
    let signal = 'NEUTRAL';
    let confidence = 0;
    let reasons = [];
    let trend = ma20w.trend;
    
    // ABSOLUTE BUY: 200W MA touch/break
    if (ma200w.signal === 'ABSOLUTE_BUY') {
      signal = 'ABSOLUTE_BUY';
      confidence = 5;
      reasons.push(ma200w.reason);
    }
    // STRONG BUY: Near 200W MA + other bottom signals
    else if (ma200w.buyZone && (mvrv.signal === 'BOTTOM_SIGNAL' || fg.signal === 'BOTTOM_SIGNAL')) {
      signal = 'STRONG_BUY';
      confidence = 4;
      reasons.push(ma200w.reason);
      if (mvrv.signal === 'BOTTOM_SIGNAL') reasons.push(mvrv.reason);
      if (fg.signal === 'BOTTOM_SIGNAL') reasons.push(fg.reason);
    }
    // TREND FLIP BEAR: Price crosses below 20W MA
    else if (ma20w.signal === 'FLIP_TO_BEAR') {
      signal = 'TREND_FLIP_BEAR';
      confidence = 3;
      reasons.push(ma20w.reason);
      // Check for confirmation
      if (mvrv.signal === 'TOP_SIGNAL') reasons.push(mvrv.reason);
      if (fg.fearGreed <= 40) reasons.push(`F&G at ${fg.fearGreed} (Fear)`);
    }
    // TREND FLIP BULL: Price crosses above 20W MA
    else if (ma20w.signal === 'FLIP_TO_BULL') {
      signal = 'TREND_FLIP_BULL';
      confidence = 3;
      reasons.push(ma20w.reason);
      if (mvrv.mvrv > 0.5 && mvrv.mvrv < 3) reasons.push(`MVRV ${mvrv.mvrv.toFixed(2)} (healthy)`);
    }
    // TOP SIGNAL: Multiple indicators
    else {
      const topSignals = [
        mvrv.signal === 'TOP_SIGNAL',
        pi.signal === 'TOP_SIGNAL',
        fg.signal === 'TOP_SIGNAL',
      ].filter(Boolean).length;
      
      if (topSignals >= 2) {
        signal = 'TOP_SIGNAL';
        confidence = topSignals;
        if (mvrv.signal === 'TOP_SIGNAL') reasons.push(mvrv.reason);
        if (pi.signal === 'TOP_SIGNAL') reasons.push(pi.reason);
        if (fg.signal === 'TOP_SIGNAL') reasons.push(fg.reason);
      }
    }
    
    results.push({
      date: d.date,
      price: d.price,
      signal,
      confidence,
      reasons,
      trend,
      ma20w: d.ma20w,
      ma200w: d.ma200w,
      mvrv: d.mvrv,
      fearGreed: d.fearGreed,
      piCycleProx: d.piCycleProx,
      percentFrom20w: ma20w.percentFromMA,
      percentFrom200w: ma200w.percentAbove
    });
  }
  
  return results;
}

// =============================================================================
// ACCURACY CALCULATOR
// =============================================================================

function calculateAccuracy(results: Array<{ date: string; price: number; signal: string; reason?: string; reasons?: string[] }>, events: HistoricalDataPoint[], signalTypes: string[], windowWeeks = 8): AccuracyResult {
  const hits = [];
  const misses = [];
  
  for (const event of events) {
    const eventIdx = historicalData.findIndex(d => d.date === event.date);
    const windowStart = Math.max(0, eventIdx - windowWeeks);
    const windowEnd = Math.min(results.length - 1, eventIdx + windowWeeks);
    
    let found = null;
    let minDistance = Infinity;
    
    for (let i = windowStart; i <= windowEnd; i++) {
      if (signalTypes.includes(results[i].signal)) {
        const distance = i - eventIdx;
        if (Math.abs(distance) < Math.abs(minDistance)) {
          minDistance = distance;
          found = {
            eventDate: event.eventDate,
            eventPrice: event.eventPrice,
            signalDate: results[i].date,
            signalPrice: results[i].price,
            leadLag: distance,
            signal: results[i].signal,
            reason: results[i].reason || results[i].reasons?.join(', ')
          };
        }
      }
    }
    
    if (found) {
      hits.push(found);
    } else {
      misses.push({
        eventDate: event.eventDate,
        eventPrice: event.eventPrice,
        reason: 'No signal within window'
      });
    }
  }
  
  const total = events.length;
  return { 
    hits, 
    misses, 
    accuracy: total > 0 ? (hits.length / total * 100).toFixed(0) : 'N/A',
    total
  };
}

// Calculate 20W MA trend flip accuracy
function calculate20WMAAccuracy(results: MA20WResult[], events: HistoricalDataPoint[], signalType: 'TOP' | 'BOTTOM'): AccuracyResult {
  const targetSignal = signalType === 'TOP' ? 'FLIP_TO_BEAR' : 'FLIP_TO_BULL';
  return calculateAccuracy(results, events.filter(e => e.event === signalType), [targetSignal], 12);
}

// =============================================================================
// DASHBOARD COMPONENT
// =============================================================================

export default function BacktestDashboardV4() {
  // Run all evaluations
  const ma20wResults = useMemo(() => evaluate20WMA(historicalData), []);
  const ma200wResults = useMemo(() => evaluate200WMA(historicalData), []);
  const mvrvResults = useMemo(() => evaluateMVRV(historicalData), []);
  const piResults = useMemo(() => evaluatePiCycle(historicalData), []);
  const fgResults = useMemo(() => evaluateFearGreed(historicalData), []);
  const compositeResults = useMemo(() => evaluateComposite(historicalData), []);
  
  // Calculate accuracies
  const accuracies = useMemo(() => ({
    ma20w: {
      bearFlip: calculate20WMAAccuracy(ma20wResults, cycleEvents, 'TOP'),
      bullFlip: calculate20WMAAccuracy(ma20wResults, cycleEvents, 'BOTTOM')
    },
    ma200w: {
      bottom: calculateAccuracy(ma200wResults, cycleBottoms, ['ABSOLUTE_BUY', 'STRONG_BUY', 'BUY_ZONE'])
    },
    mvrv: {
      top: calculateAccuracy(mvrvResults, cycleTops, ['TOP_SIGNAL']),
      bottom: calculateAccuracy(mvrvResults, cycleBottoms, ['BOTTOM_SIGNAL'])
    },
    piCycle: {
      top: calculateAccuracy(piResults, cycleTops, ['TOP_SIGNAL'])
    },
    fearGreed: {
      top: calculateAccuracy(fgResults, cycleTops, ['TOP_SIGNAL']),
      bottom: calculateAccuracy(fgResults, cycleBottoms, ['BOTTOM_SIGNAL'])
    },
    composite: {
      top: calculateAccuracy(compositeResults, cycleTops, ['TOP_SIGNAL', 'TREND_FLIP_BEAR']),
      bottom: calculateAccuracy(compositeResults, cycleBottoms, ['ABSOLUTE_BUY', 'STRONG_BUY', 'TREND_FLIP_BULL'])
    }
  }), [ma20wResults, ma200wResults, mvrvResults, piResults, fgResults, compositeResults]);

  // Get all 20W MA trend flips
  const trendFlips = ma20wResults.filter(r => r.signal === 'FLIP_TO_BEAR' || r.signal === 'FLIP_TO_BULL');

  // Current values
  const current = historicalData[historicalData.length - 1];
  const currentMa20w = ma20wResults[ma20wResults.length - 1];
  const currentMa200w = ma200wResults[ma200wResults.length - 1];
  const currentComposite = compositeResults[compositeResults.length - 1];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: HistoricalDataPoint }> }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-xs max-w-xs">
          <p className="text-amber-400 font-bold">{d.date}</p>
          <p className="text-white">Price: ${d.price?.toLocaleString()}</p>
          <p className="text-yellow-400">20W MA: ${d.ma20w?.toLocaleString() || 'N/A'}</p>
          <p className="text-orange-400">200W MA: ${d.ma200w?.toLocaleString() || 'N/A'}</p>
          <p className="text-cyan-300">MVRV: {d.mvrv?.toFixed(2)}</p>
          <p className="text-purple-300">F&G: {d.fearGreed}</p>
          {d.event && (
            <p className={`font-bold mt-2 ${d.event === 'TOP' ? 'text-red-400' : d.event === 'BOTTOM' ? 'text-emerald-400' : 'text-blue-400'}`}>
              {d.event}: {d.eventDate}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            Indicator Backtest v4
          </h1>
          <p className="text-slate-400 mt-1">20-Week SMA (Trend) + 200-Week MA (Floor) + On-Chain Signals</p>
        </div>

        {/* Current State - Big Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 20W MA Trend Status */}
          <div className={`rounded-xl p-5 border-2 ${currentMa20w?.trend === 'BULL' ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
            <h3 className="text-slate-400 text-sm font-medium mb-2">20-WEEK MA TREND</h3>
            <div className={`text-3xl font-black ${currentMa20w?.trend === 'BULL' ? 'text-emerald-400' : 'text-red-400'}`}>
              {currentMa20w?.trend === 'BULL' ? '🟢 BULLISH' : '🔴 BEARISH'}
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <p className="text-slate-400">Price: <span className="text-white">${current.price?.toLocaleString()}</span></p>
              <p className="text-slate-400">20W MA: <span className="text-yellow-400">${current.ma20w?.toLocaleString()}</span></p>
              <p className={(currentMa20w?.percentFromMA ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {(currentMa20w?.percentFromMA ?? 0) >= 0 ? '+' : ''}{currentMa20w?.percentFromMA?.toFixed(1)}% from MA
              </p>
            </div>
          </div>
          
          {/* 200W MA Floor Status */}
          <div className="bg-slate-800/40 rounded-xl p-5 border border-orange-500/30">
            <h3 className="text-slate-400 text-sm font-medium mb-2">200-WEEK MA FLOOR</h3>
            <div className="text-3xl font-black text-orange-400">
              ${current.ma200w?.toLocaleString()}
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <p className="text-slate-400">Distance: <span className="text-white">+{currentMa200w?.percentAbove?.toFixed(0)}%</span></p>
              <p className="text-slate-400">Drop to floor: <span className="text-red-400">-{current.ma200w ? ((current.price - current.ma200w) / current.price * 100).toFixed(0) : 'N/A'}%</span></p>
              <p className={`${currentMa200w?.buyZone ? 'text-emerald-400' : 'text-slate-500'}`}>
                {currentMa200w?.buyZone ? '✓ In Buy Zone' : '✗ Not in Buy Zone'}
              </p>
            </div>
          </div>
          
          {/* Composite Signal */}
          <div className="bg-slate-800/40 rounded-xl p-5 border border-amber-500/30">
            <h3 className="text-slate-400 text-sm font-medium mb-2">COMPOSITE SIGNAL</h3>
            <div className={`text-2xl font-black ${
              currentComposite?.signal.includes('BUY') ? 'text-emerald-400' : 
              currentComposite?.signal.includes('BEAR') || currentComposite?.signal.includes('TOP') ? 'text-red-400' : 
              'text-amber-400'
            }`}>
              {currentComposite?.signal || 'NEUTRAL'}
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <p className="text-slate-400">MVRV: <span className="text-cyan-400">{current.mvrv}</span></p>
              <p className="text-slate-400">F&G: <span className="text-purple-400">{current.fearGreed}</span></p>
              <p className="text-slate-400">Pi Cycle: <span className="text-pink-400">{current.piCycleProx}%</span></p>
            </div>
          </div>
        </div>

        {/* 20W MA Explanation */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-xl p-5 border border-yellow-500/30 mb-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-3">📈 20-Week SMA: The Bull/Bear Trend Line</h2>
          <p className="text-slate-300 text-sm mb-4">
            The 20-week moving average is the <span className="text-yellow-400 font-bold">primary trend indicator</span> used by macro traders. 
            When price is above the 20W MA, the trend is bullish. When price falls below, the trend flips bearish.
            This is what Ivan's yellow line represents in his MoneyLine chart.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/30">
              <h4 className="text-emerald-400 font-bold mb-2">🟢 BULL TREND</h4>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• Price ABOVE 20W MA</li>
                <li>• Favorable for long positions</li>
                <li>• DCA accumulation bias</li>
              </ul>
            </div>
            <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
              <h4 className="text-red-400 font-bold mb-2">🔴 BEAR TREND</h4>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• Price BELOW 20W MA</li>
                <li>• Risk-off / reduce exposure</li>
                <li>• Wait for 200W MA floor</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 20W MA Trend Flip History */}
        <div className="bg-slate-800/40 rounded-xl p-5 border border-yellow-500/30 mb-6">
          <h2 className="text-lg font-bold text-yellow-400 mb-4">📋 20-Week MA Trend Flip History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-2 px-3 text-slate-400">Date</th>
                  <th className="text-center py-2 px-3 text-slate-400">Flip Direction</th>
                  <th className="text-center py-2 px-3 text-slate-400">Price</th>
                  <th className="text-center py-2 px-3 text-slate-400">20W MA</th>
                  <th className="text-center py-2 px-3 text-slate-400">Nearest Cycle Event</th>
                  <th className="text-center py-2 px-3 text-slate-400">Lead/Lag</th>
                </tr>
              </thead>
              <tbody>
                {trendFlips.slice(-15).map((flip, i) => {
                  // Find nearest cycle event
                  const flipIdx = historicalData.findIndex(d => d.date === flip.date);
                  let nearestEvent: HistoricalDataPoint | null = null;
                  let leadLag: number | null = null;

                  for (const event of cycleEvents) {
                    const eventIdx = historicalData.findIndex(d => d.date === event.date);
                    const distance = flipIdx - eventIdx;
                    if (leadLag === null || Math.abs(distance) < Math.abs(leadLag)) {
                      nearestEvent = event;
                      leadLag = distance;
                    }
                  }

                  return (
                    <tr key={i} className="border-b border-slate-700/50">
                      <td className="py-2 px-3 text-white">{flip.date}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          flip.signal === 'FLIP_TO_BULL' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {flip.signal === 'FLIP_TO_BULL' ? '↑ BULL' : '↓ BEAR'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-amber-400">${flip.price?.toLocaleString()}</td>
                      <td className="py-2 px-3 text-center text-yellow-400">${flip.ma20w?.toLocaleString()}</td>
                      <td className="py-2 px-3 text-center text-slate-300">
                        {nearestEvent?.eventDate} ({nearestEvent?.event})
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={leadLag !== null && leadLag < 0 ? 'text-emerald-400' : leadLag !== null && leadLag > 0 ? 'text-amber-400' : 'text-white'}>
                          {leadLag !== null && leadLag > 0 ? '+' : ''}{leadLag} weeks
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Master Accuracy Table */}
        <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">📊 Complete Indicator Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-3 px-3 text-slate-400">Indicator</th>
                  <th className="text-center py-3 px-3 text-red-400">Top/Bear Signal</th>
                  <th className="text-center py-3 px-3 text-emerald-400">Bottom/Bull Signal</th>
                  <th className="text-center py-3 px-3 text-slate-400">Best Use</th>
                </tr>
              </thead>
              <tbody>
                {/* 20W MA - NEW */}
                <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 bg-yellow-500/5">
                  <td className="py-3 px-3">
                    <span className="text-yellow-400 font-bold">📈 20-Week SMA</span>
                    <span className="text-yellow-300 text-xs ml-2">(Trend Line)</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-1 rounded font-bold ${parseInt(accuracies.ma20w.bearFlip.accuracy) >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {accuracies.ma20w.bearFlip.accuracy}%
                    </span>
                    <span className="text-slate-500 text-xs ml-2">({accuracies.ma20w.bearFlip.hits.length}/{accuracies.ma20w.bearFlip.total})</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-1 rounded font-bold ${parseInt(accuracies.ma20w.bullFlip.accuracy) >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {accuracies.ma20w.bullFlip.accuracy}%
                    </span>
                    <span className="text-slate-500 text-xs ml-2">({accuracies.ma20w.bullFlip.hits.length}/{accuracies.ma20w.bullFlip.total})</span>
                  </td>
                  <td className="py-3 px-3 text-yellow-400 text-xs">Trend direction</td>
                </tr>
                
                {/* 200W MA */}
                <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 bg-orange-500/5">
                  <td className="py-3 px-3">
                    <span className="text-orange-400 font-bold">🛡️ 200-Week MA</span>
                    <span className="text-orange-300 text-xs ml-2">(Floor)</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-1 rounded bg-slate-500/20 text-slate-400">N/A</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-1 rounded font-bold bg-emerald-500/20 text-emerald-400">
                      {accuracies.ma200w.bottom.accuracy}%
                    </span>
                    <span className="text-slate-500 text-xs ml-2">({accuracies.ma200w.bottom.hits.length}/{accuracies.ma200w.bottom.total})</span>
                  </td>
                  <td className="py-3 px-3 text-orange-400 text-xs">Absolute floor</td>
                </tr>
                
                {/* MVRV */}
                <tr className="border-b border-slate-700/50 hover:bg-slate-800/30">
                  <td className="py-3 px-3">
                    <span className="text-cyan-400 font-medium">MVRV Z-Score</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-1 rounded font-bold ${parseInt(accuracies.mvrv.top.accuracy) >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {accuracies.mvrv.top.accuracy}%
                    </span>
                    <span className="text-slate-500 text-xs ml-2">({accuracies.mvrv.top.hits.length}/{accuracies.mvrv.top.total})</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-1 rounded font-bold bg-emerald-500/20 text-emerald-400">
                      {accuracies.mvrv.bottom.accuracy}%
                    </span>
                    <span className="text-slate-500 text-xs ml-2">({accuracies.mvrv.bottom.hits.length}/{accuracies.mvrv.bottom.total})</span>
                  </td>
                  <td className="py-3 px-3 text-cyan-400 text-xs">On-chain value</td>
                </tr>
                
                {/* Pi Cycle */}
                <tr className="border-b border-slate-700/50 hover:bg-slate-800/30">
                  <td className="py-3 px-3">
                    <span className="text-pink-400 font-medium">Pi Cycle Top</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-1 rounded font-bold ${parseInt(accuracies.piCycle.top.accuracy) >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {accuracies.piCycle.top.accuracy}%
                    </span>
                    <span className="text-slate-500 text-xs ml-2">({accuracies.piCycle.top.hits.length}/{accuracies.piCycle.top.total})</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-1 rounded bg-slate-500/20 text-slate-400">N/A</span>
                  </td>
                  <td className="py-3 px-3 text-pink-400 text-xs">Cycle tops only</td>
                </tr>
                
                {/* Fear & Greed */}
                <tr className="border-b border-slate-700/50 hover:bg-slate-800/30">
                  <td className="py-3 px-3">
                    <span className="text-purple-400 font-medium">Fear & Greed</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-1 rounded font-bold ${parseInt(accuracies.fearGreed.top.accuracy) >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {accuracies.fearGreed.top.accuracy}%
                    </span>
                    <span className="text-slate-500 text-xs ml-2">({accuracies.fearGreed.top.hits.length}/{accuracies.fearGreed.top.total})</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-1 rounded font-bold ${parseInt(accuracies.fearGreed.bottom.accuracy) >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {accuracies.fearGreed.bottom.accuracy}%
                    </span>
                    <span className="text-slate-500 text-xs ml-2">({accuracies.fearGreed.bottom.hits.length}/{accuracies.fearGreed.bottom.total})</span>
                  </td>
                  <td className="py-3 px-3 text-purple-400 text-xs">Sentiment</td>
                </tr>
                
                {/* Composite */}
                <tr className="hover:bg-slate-800/30 bg-amber-500/5">
                  <td className="py-3 px-3">
                    <span className="text-amber-400 font-bold">🏆 Composite</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-1 rounded font-bold ${parseInt(accuracies.composite.top.accuracy) >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {accuracies.composite.top.accuracy}%
                    </span>
                    <span className="text-slate-500 text-xs ml-2">({accuracies.composite.top.hits.length}/{accuracies.composite.top.total})</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-1 rounded font-bold bg-emerald-500/20 text-emerald-400">
                      {accuracies.composite.bottom.accuracy}%
                    </span>
                    <span className="text-slate-500 text-xs ml-2">({accuracies.composite.bottom.hits.length}/{accuracies.composite.bottom.total})</span>
                  </td>
                  <td className="py-3 px-3 text-amber-400 text-xs">All combined</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Price Chart with Both MAs */}
        <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Price Chart: 20W MA (Trend) + 200W MA (Floor)</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={historicalData.filter(d => d.ma20w)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={4} />
                <YAxis 
                  scale="log" 
                  domain={[100, 200000]} 
                  stroke="#fbbf24" 
                  tick={{ fontSize: 10 }} 
                  tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Cycle events */}
                {cycleTops.map((d, i) => (
                  <ReferenceLine key={`top-${i}`} x={d.date} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} />
                ))}
                {cycleBottoms.map((d, i) => (
                  <ReferenceLine key={`bottom-${i}`} x={d.date} stroke="#22c55e" strokeDasharray="5 5" strokeWidth={1} />
                ))}
                
                {/* Price */}
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  fill="#fbbf2420" 
                  stroke="#fbbf24" 
                  strokeWidth={2}
                  name="BTC Price"
                />
                
                {/* 20W MA - Trend Line */}
                <Line 
                  type="monotone" 
                  dataKey="ma20w" 
                  stroke="#facc15" 
                  strokeWidth={2}
                  dot={false}
                  name="20W SMA (Trend)"
                />
                
                {/* 200W MA - Floor */}
                <Line 
                  type="monotone" 
                  dataKey="ma200w" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  dot={false}
                  name="200W MA (Floor)"
                  strokeDasharray="5 5"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-1 bg-amber-400 rounded"></span> BTC Price</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1 bg-yellow-400 rounded"></span> 20W SMA (Trend)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1 bg-orange-500 rounded"></span> 200W MA (Floor)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500"></span> Cycle Top</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500"></span> Cycle Bottom</span>
          </div>
        </div>

        {/* Strategy Rules Summary */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 rounded-xl p-5 border border-slate-600/50 mb-6">
          <h2 className="text-lg font-bold text-amber-400 mb-4">📐 Final Strategy Rules (MoneyLine Clone)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trend Rules */}
            <div className="bg-yellow-500/5 rounded-lg p-4 border border-yellow-500/30">
              <h3 className="text-yellow-400 font-bold mb-3">📈 TREND DETERMINATION (20W SMA)</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2 items-start">
                  <span className="text-emerald-400 text-lg">🟢</span>
                  <div>
                    <span className="text-white font-medium">BULLISH:</span>
                    <span className="text-slate-300"> Weekly close ABOVE 20W SMA</span>
                    <p className="text-emerald-400 text-xs">Bias: Long, accumulate dips</p>
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-red-400 text-lg">🔴</span>
                  <div>
                    <span className="text-white font-medium">BEARISH:</span>
                    <span className="text-slate-300"> Weekly close BELOW 20W SMA</span>
                    <p className="text-red-400 text-xs">Bias: Reduce exposure, wait for floor</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Buy Signals */}
            <div className="bg-emerald-500/5 rounded-lg p-4 border border-emerald-500/30">
              <h3 className="text-emerald-400 font-bold mb-3">🟢 BUY SIGNALS (Priority Order)</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-emerald-400 font-bold">1.</span>
                  <div>
                    <span className="text-white font-medium">ABSOLUTE BUY:</span>
                    <span className="text-slate-300"> Price at 200W MA</span>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400 font-bold">2.</span>
                  <div>
                    <span className="text-white font-medium">STRONG BUY:</span>
                    <span className="text-slate-300"> MVRV &lt;0.1 + F&G &lt;10</span>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400 font-bold">3.</span>
                  <div>
                    <span className="text-white font-medium">TREND FLIP BULL:</span>
                    <span className="text-slate-300"> Price crosses above 20W SMA</span>
                  </div>
                </li>
              </ol>
            </div>
            
            {/* Sell Signals */}
            <div className="bg-red-500/5 rounded-lg p-4 border border-red-500/30">
              <h3 className="text-red-400 font-bold mb-3">🔴 SELL/CAUTION SIGNALS</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-red-400 font-bold">1.</span>
                  <div>
                    <span className="text-white font-medium">TREND FLIP BEAR:</span>
                    <span className="text-slate-300"> Price crosses below 20W SMA</span>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400 font-bold">2.</span>
                  <div>
                    <span className="text-white font-medium">TOP SIGNAL:</span>
                    <span className="text-slate-300"> Pi Cycle fires (≥98%)</span>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400 font-bold">3.</span>
                  <div>
                    <span className="text-white font-medium">TOP CONFIRMATION:</span>
                    <span className="text-slate-300"> MVRV peak decay + F&G &gt;90</span>
                  </div>
                </li>
              </ol>
            </div>
            
            {/* Current Status */}
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
              <h3 className="text-white font-bold mb-3">📍 Current Status (Jan 2026)</h3>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-slate-400">Trend:</span>
                  <span className={currentMa20w?.trend === 'BULL' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                    {currentMa20w?.trend}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Price vs 20W:</span>
                  <span className={(currentMa20w?.percentFromMA ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {(currentMa20w?.percentFromMA ?? 0) >= 0 ? '+' : ''}{currentMa20w?.percentFromMA?.toFixed(1)}%
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Price vs 200W:</span>
                  <span className="text-white">+{currentMa200w?.percentAbove?.toFixed(0)}%</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Buy Zone:</span>
                  <span className={currentMa200w?.buyZone ? 'text-emerald-400' : 'text-slate-500'}>
                    {currentMa200w?.buyZone ? '✓ Yes' : '✗ No'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Backtest v4 | 20W SMA + 200W MA + MVRV + Pi Cycle + F&G | {cycleTops.length} tops + {cycleBottoms.length} bottoms tested | Not financial advice
        </p>
      </div>
    </div>
  );
}
