import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
} from 'recharts';
import {
  fetchAssetHistory,
  type AssetHistoryData,
  type AssetCategory,
  type TrendFlip,
} from '../lib/data/assetHistory';

// Time range options
type TimeRange = 'ALL' | '2Y' | '1Y' | '6M' | '3M';

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: '2Y', label: '2Y' },
  { value: '1Y', label: '1Y' },
  { value: '6M', label: '6M' },
  { value: '3M', label: '3M' },
];

function filterDataByTimeRange<T extends { date: string }>(data: T[], range: TimeRange): T[] {
  if (range === 'ALL' || data.length === 0) return data;

  const dates = data.map(d => d.date).sort();
  const latestDate = new Date(dates[dates.length - 1]);
  let cutoffDate: Date;

  switch (range) {
    case '2Y':
      cutoffDate = new Date(latestDate.getFullYear() - 2, latestDate.getMonth(), latestDate.getDate());
      break;
    case '1Y':
      cutoffDate = new Date(latestDate.getFullYear() - 1, latestDate.getMonth(), latestDate.getDate());
      break;
    case '6M':
      cutoffDate = new Date(latestDate.getFullYear(), latestDate.getMonth() - 6, latestDate.getDate());
      break;
    case '3M':
      cutoffDate = new Date(latestDate.getFullYear(), latestDate.getMonth() - 3, latestDate.getDate());
      break;
    default:
      return data;
  }

  const cutoffStr = cutoffDate.toISOString().slice(0, 10);
  return data.filter(d => d.date >= cutoffStr);
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (price >= 1) {
    return `$${price.toFixed(2)}`;
  } else if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toFixed(8)}`;
  }
}

function formatYAxisPrice(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  } else if (value >= 1) {
    return `$${value.toFixed(0)}`;
  } else {
    return `$${value.toFixed(4)}`;
  }
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
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${value === option.value
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

interface ChartDataPoint {
  date: string;
  price: number;
  ma20w: number | null;
  isBull: boolean;
}

export default function AssetDetail() {
  const { category, assetId } = useParams<{ category: string; assetId: string }>();
  const navigate = useNavigate();

  const [historyData, setHistoryData] = useState<AssetHistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
  const [showFlipMarkers, setShowFlipMarkers] = useState(true);

  // Validate category
  const validCategory = useMemo((): AssetCategory | null => {
    if (category === 'crypto' || category === 'stocks' || category === 'commodities') {
      return category;
    }
    return null;
  }, [category]);

  // Fetch historical data
  useEffect(() => {
    async function loadData() {
      if (!validCategory || !assetId) {
        setError('Invalid asset');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchAssetHistory(assetId, validCategory);
        if (data) {
          setHistoryData(data);
        } else {
          setError('Unable to fetch historical data for this asset');
        }
      } catch (err) {
        console.error('Failed to load asset history:', err);
        setError('Failed to load asset data');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [assetId, validCategory]);

  // Transform data for chart
  const chartData = useMemo((): ChartDataPoint[] => {
    if (!historyData) return [];
    return historyData.priceData.map((d) => ({
      date: d.date,
      price: d.price,
      ma20w: d.ma20w,
      isBull: d.ma20w !== null && d.price >= d.ma20w,
    }));
  }, [historyData]);

  // Filter by time range
  const filteredChartData = useMemo(
    () => filterDataByTimeRange(chartData, timeRange),
    [chartData, timeRange]
  );

  // Filter trend flips by time range
  const filteredTrendFlips = useMemo((): TrendFlip[] => {
    if (!historyData) return [];
    return filterDataByTimeRange(historyData.trendFlips, timeRange);
  }, [historyData, timeRange]);

  // Calculate Y-axis domain
  const yDomain = useMemo(() => {
    const prices = filteredChartData.map((d) => d.price).filter((p) => p > 0);
    const mas = filteredChartData.map((d) => d.ma20w).filter((m): m is number => m !== null && m > 0);
    const allValues = [...prices, ...mas];
    if (allValues.length === 0) return [0, 100];
    const minPrice = Math.min(...allValues) * 0.95;
    const maxPrice = Math.max(...allValues) * 1.05;
    return [minPrice, maxPrice];
  }, [filteredChartData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataPoint }> }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const trendFlip = historyData?.trendFlips.find(f => f.date === d.date);
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
                <span className="text-yellow-400">20W SMA:</span>
                <span className="text-yellow-400 font-mono">{formatPrice(d.ma20w)}</span>
              </div>
            )}
            {trendFlip && (
              <div className={`mt-2 pt-2 border-t border-slate-600 text-xs font-bold ${trendFlip.type === 'BULL' ? 'text-emerald-400' : 'text-red-400'}`}>
                Trend Flip: {trendFlip.type === 'BULL' ? 'BULLISH' : 'BEARISH'}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading asset data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !historyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <span>&larr;</span>
            <span>Back to Assets</span>
          </button>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">!</div>
            <h2 className="text-xl font-bold text-red-400 mb-2">Unable to Load Asset</h2>
            <p className="text-slate-400 mb-4">{error || 'Asset data not available'}</p>
            <Link
              to="/"
              className="inline-block px-4 py-2 bg-amber-500 text-slate-900 rounded-lg font-medium hover:bg-amber-400 transition-colors"
            >
              Return to Assets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const latestPrice = filteredChartData.length > 0 ? filteredChartData[filteredChartData.length - 1].price : 0;
  const latestMA = filteredChartData.length > 0 ? filteredChartData[filteredChartData.length - 1].ma20w : null;
  const percentFromMA = latestMA ? ((latestPrice - latestMA) / latestMA) * 100 : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <span>&larr;</span>
            <span>Back to Assets</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <span>{historyData.name}</span>
                <span className="text-slate-500 text-lg">({historyData.symbol})</span>
              </h1>
              <p className="text-slate-400 capitalize">{historyData.category}</p>
            </div>

            {/* Current Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Current Price</div>
                <div className="text-xl font-bold text-white font-mono">{formatPrice(latestPrice)}</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Trend</div>
                <div className={`text-xl font-bold ${historyData.currentTrend === 'BULL' ? 'text-emerald-400' : historyData.currentTrend === 'BEAR' ? 'text-red-400' : 'text-slate-500'}`}>
                  {historyData.currentTrend === 'BULL' ? 'BULLISH' : historyData.currentTrend === 'BEAR' ? 'BEARISH' : 'N/A'}
                </div>
              </div>
              {percentFromMA !== null && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">From 20W SMA</div>
                  <div className={`text-xl font-bold ${percentFromMA >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {percentFromMA >= 0 ? '+' : ''}{percentFromMA.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trend Flip Info */}
        {historyData.lastFlipDate && (
          <div className="mb-6 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-slate-400">Last trend flip: </span>
                <span className={`font-bold ${historyData.currentTrend === 'BULL' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {historyData.currentTrend === 'BULL' ? 'Flipped BULLISH' : 'Flipped BEARISH'}
                </span>
                <span className="text-slate-400"> on </span>
                <span className="text-white font-medium">{historyData.lastFlipDate}</span>
              </div>
              <div className="text-slate-500 text-sm">
                Total flips in view: {filteredTrendFlips.length}
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="rounded-xl bg-slate-800 p-4 md:p-6 border border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                Price Chart (Weekly)
              </h2>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showFlipMarkers}
                  onChange={(e) => setShowFlipMarkers(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                />
                <span className="text-slate-400">Show Trend Flips</span>
              </label>
            </div>
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-slate-400">Price</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-yellow-400" />
              <span className="text-slate-400">20W SMA (Trend)</span>
            </div>
            {showFlipMarkers && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                  <span className="text-slate-400">Bull Flip</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
                  <span className="text-slate-400">Bear Flip</span>
                </div>
              </>
            )}
          </div>

          <div className="h-80 md:h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredChartData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.05} />
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
                  domain={yDomain}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={{ stroke: '#334155' }}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={formatYAxisPrice}
                  width={60}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Trend flip vertical lines */}
                {showFlipMarkers && filteredTrendFlips.map((flip, index) => (
                  <ReferenceLine
                    key={`line-${index}`}
                    x={flip.date}
                    stroke={flip.type === 'BULL' ? '#10b981' : '#ef4444'}
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    strokeOpacity={0.5}
                  />
                ))}

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

                {/* Trend flip markers */}
                {showFlipMarkers && filteredTrendFlips.map((flip, index) => (
                  <ReferenceDot
                    key={`dot-${index}`}
                    x={flip.date}
                    y={flip.price}
                    r={8}
                    fill={flip.type === 'BULL' ? '#10b981' : '#ef4444'}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-xs text-slate-500 text-right">
            {filteredChartData.length} data points ({filteredChartData[0]?.date} to {filteredChartData[filteredChartData.length - 1]?.date})
          </div>
        </div>

        {/* Trend Flip History */}
        {filteredTrendFlips.length > 0 && (
          <div className="mt-6 rounded-xl bg-slate-800 p-4 md:p-6 border border-slate-700">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
              Trend Flip History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-4 text-slate-400 text-xs font-medium">Date</th>
                    <th className="text-center py-2 px-4 text-slate-400 text-xs font-medium">Trend</th>
                    <th className="text-right py-2 px-4 text-slate-400 text-xs font-medium">Price at Flip</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredTrendFlips].reverse().map((flip, index) => (
                    <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-2 px-4 text-white text-sm">{flip.date}</td>
                      <td className="py-2 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${flip.type === 'BULL'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                          }`}>
                          {flip.type === 'BULL' ? '^ BULLISH' : 'v BEARISH'}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-white text-sm">{formatPrice(flip.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
