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

interface PriceChartProps {
  data: PriceData[];
}

export function PriceChart({ data }: PriceChartProps) {
  // Transform data for the chart
  const chartData = data.map((d) => ({
    date: d.date,
    price: d.price,
    ma20w: d.ma20w,
    ma200w: d.ma200w,
    isBull: d.ma20w !== null && d.price >= d.ma20w,
  }));

  // Get min/max for Y axis (log scale)
  const prices = data.map((d) => d.price).filter((p) => p > 0);
  const minPrice = Math.min(...prices) * 0.8;
  const maxPrice = Math.max(...prices) * 1.2;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
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
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
          Price Chart (Weekly, Linear Scale)
        </h2>

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
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
                domain={[minPrice, maxPrice]}
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
      </div>

      {/* Log Scale Chart */}
      <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
          Price Chart (Weekly, Log Scale)
        </h2>

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
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
                domain={[minPrice, maxPrice]}
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
      </div>
    </div>
  );
}
