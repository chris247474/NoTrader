import { getTrendDisplayProps } from '../lib/indicators';
import { formatPrice, formatPercent } from '../lib/utils';
import { formatDate, getRelativeTime } from '../lib/utils';
import type { TrendState } from '../lib/data/types';

interface TrendCardProps {
  trend: TrendState;
  price: number | null;
  ma20w: number | null;
  percentFromMA: number | null;
  trendFlipDate: string | null;
  weeksInTrend: number;
}

export function TrendCard({
  trend,
  price,
  ma20w,
  percentFromMA,
  trendFlipDate,
  weeksInTrend,
}: TrendCardProps) {
  const trendProps = getTrendDisplayProps(trend);

  return (
    <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
      <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
        20W SMA Trend
      </h2>

      {/* Main Trend Badge */}
      <div
        className={`inline-flex items-center px-4 py-2 rounded-lg ${trendProps.bgColor} ${trendProps.color} font-bold text-lg mb-4`}
      >
        {trend === 'BULL' ? '🟢' : trend === 'BEAR' ? '🔴' : '⚪'} {trendProps.label}
      </div>

      {/* Price Info */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Price</span>
          <span className="text-amber-400 font-mono font-medium">
            {formatPrice(price)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">20W MA</span>
          <span className="text-yellow-400 font-mono font-medium">
            {formatPrice(ma20w)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">Difference</span>
          <span
            className={`font-mono font-medium ${
              percentFromMA !== null && percentFromMA >= 0
                ? 'text-emerald-400'
                : 'text-red-400'
            }`}
          >
            {formatPercent(percentFromMA)}
          </span>
        </div>

        <div className="border-t border-slate-700 pt-3 mt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400">Flipped</span>
            <span className="text-slate-300 font-mono">
              {trendFlipDate ? formatDate(trendFlipDate) : 'N/A'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Time in trend</span>
            <span className="text-slate-300 font-mono">
              {weeksInTrend > 0 ? `${weeksInTrend}w` : 'N/A'}
            </span>
          </div>

          {trendFlipDate && (
            <div className="text-xs text-slate-500 mt-2">
              {getRelativeTime(trendFlipDate)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
