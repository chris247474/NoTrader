import { useState, useMemo } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatPrice } from '../lib/utils';
import type { PriceData } from '../lib/data/types';

// Time range options
type TimeRange = 'ALL' | '10Y' | '5Y' | '3Y' | '2Y' | '1Y' | '6M';

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: '10Y', label: '10Y' },
  { value: '5Y', label: '5Y' },
  { value: '3Y', label: '3Y' },
  { value: '2Y', label: '2Y' },
  { value: '1Y', label: '1Y' },
  { value: '6M', label: '6M' },
];

function filterDataByTimeRange<T extends { date: string }>(data: T[], range: TimeRange): T[] {
  if (range === 'ALL' || data.length === 0) return data;

  // Get the most recent date from the data
  const dates = data.map(d => d.date).sort();
  const latestDate = new Date(dates[dates.length - 1]);
  let cutoffDate: Date;

  switch (range) {
    case '10Y':
      cutoffDate = new Date(latestDate.getFullYear() - 10, latestDate.getMonth(), latestDate.getDate());
      break;
    case '5Y':
      cutoffDate = new Date(latestDate.getFullYear() - 5, latestDate.getMonth(), latestDate.getDate());
      break;
    case '3Y':
      cutoffDate = new Date(latestDate.getFullYear() - 3, latestDate.getMonth(), latestDate.getDate());
      break;
    case '2Y':
      cutoffDate = new Date(latestDate.getFullYear() - 2, latestDate.getMonth(), latestDate.getDate());
      break;
    case '1Y':
      cutoffDate = new Date(latestDate.getFullYear() - 1, latestDate.getMonth(), latestDate.getDate());
      break;
    case '6M':
      cutoffDate = new Date(latestDate.getFullYear(), latestDate.getMonth() - 6, latestDate.getDate());
      break;
    default:
      return data;
  }

  const cutoffStr = cutoffDate.toISOString().slice(0, 10);
  return data.filter(d => d.date >= cutoffStr);
}

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {timeRangeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
            value === option.value
              ? 'bg-amber-500 text-slate-900'
              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-slate-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface PriceChartProps {
  data: PriceData[];
}

export function PriceChart({ data }: PriceChartProps) {
  // Time range state for each chart
  const [linearTimeRange, setLinearTimeRange] = useState<TimeRange>('1Y');
  const [logTimeRange, setLogTimeRange] = useState<TimeRange>('ALL');

  // Transform and filter data for charts
  const allChartData = useMemo(() => data.map((d) => ({
    date: d.date,
    price: d.price,
    ma20w: d.ma20w,
    ma200w: d.ma200w,
    isBull: d.ma20w !== null && d.price >= d.ma20w,
  })), [data]);

  const linearChartData = useMemo(
    () => filterDataByTimeRange(allChartData, linearTimeRange),
    [allChartData, linearTimeRange]
  );

  const logChartData = useMemo(
    () => filterDataByTimeRange(allChartData, logTimeRange),
    [allChartData, logTimeRange]
  );

  // Calculate Y-axis domains for each chart
  const linearYDomain = useMemo(() => {
    const prices = linearChartData.map((d) => d.price).filter((p) => p > 0);
    if (prices.length === 0) return [0, 100000];
    const minPrice = Math.min(...prices) * 0.9;
    const maxPrice = Math.max(...prices) * 1.1;
    return [minPrice, maxPrice];
  }, [linearChartData]);

  const logYDomain = useMemo(() => {
    const prices = logChartData.map((d) => d.price).filter((p) => p > 0);
    if (prices.length === 0) return [1, 100000];
    const minPrice = Math.min(...prices) * 0.8;
    const maxPrice = Math.max(...prices) * 1.2;
    return [minPrice, maxPrice];
  }, [logChartData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof allChartData[0] }> }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <div className="text-slate-400 text-xs mb-1">{d.date}</div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-amber-400">Price:</span>
              <span className="text-amber-400 font-mono">{formatPrice(d.price)}</span>
            </div>
            {d.ma20w && (
              <div className="flex justify-between gap-4">
                <span className="text-yellow-400">20W MA:</span>
                <span className="text-yellow-400 font-mono">{formatPrice(d.ma20w)}</span>
              </div>
            )}
            {d.ma200w && (
              <div className="flex justify-between gap-4">
                <span className="text-orange-500">200W MA:</span>
                <span className="text-orange-500 font-mono">{formatPrice(d.ma200w)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Linear Scale Chart */}
      <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Price Chart (Weekly, Linear Scale)
          </h2>
          <TimeRangeSelector value={linearTimeRange} onChange={setLinearTimeRange} />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-slate-400">BTC Price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-yellow-400" />
            <span className="text-slate-400">20W SMA (Trend)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-orange-500 border-dashed border-b-2 border-orange-500" />
            <span className="text-slate-400">200W MA (Floor)</span>
          </div>
        </div>

        <div className="h-80 md:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={linearChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="bullGradientLinear" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="bearGradientLinear" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={{ stroke: '#334155' }}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
                }}
                minTickGap={50}
              />

              <YAxis
                domain={linearYDomain}
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={{ stroke: '#334155' }}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                width={50}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* 200W MA Floor Line (dashed) */}
              <Line
                type="monotone"
                dataKey="ma200w"
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                connectNulls
              />

              {/* 20W SMA Trend Line */}
              <Line
                type="monotone"
                dataKey="ma20w"
                stroke="#facc15"
                strokeWidth={2}
                dot={false}
                connectNulls
              />

              {/* Price Line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 text-xs text-slate-500 text-right">
          {linearChartData.length} data points ({linearChartData[0]?.date} to {linearChartData[linearChartData.length - 1]?.date})
        </div>
      </div>

      {/* Log Scale Chart */}
      <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Price Chart (Weekly, Log Scale)
          </h2>
          <TimeRangeSelector value={logTimeRange} onChange={setLogTimeRange} />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-slate-400">BTC Price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-yellow-400" />
            <span className="text-slate-400">20W SMA (Trend)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-orange-500 border-dashed border-b-2 border-orange-500" />
            <span className="text-slate-400">200W MA (Floor)</span>
          </div>
        </div>

        <div className="h-80 md:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={logChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              {/* Background areas for bull/bear */}
              <defs>
                <linearGradient id="bullGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="bearGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={{ stroke: '#334155' }}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
                }}
                minTickGap={50}
              />

              <YAxis
                scale="log"
                domain={logYDomain}
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={{ stroke: '#334155' }}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                width={50}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* 200W MA Floor Line (dashed) */}
              <Line
                type="monotone"
                dataKey="ma200w"
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                connectNulls
              />

              {/* 20W SMA Trend Line */}
              <Line
                type="monotone"
                dataKey="ma20w"
                stroke="#facc15"
                strokeWidth={2}
                dot={false}
                connectNulls
              />

              {/* Price Line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 text-xs text-slate-500 text-right">
          {logChartData.length} data points ({logChartData[0]?.date} to {logChartData[logChartData.length - 1]?.date})
        </div>
      </div>
    </div>
  );
}
