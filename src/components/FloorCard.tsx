import { formatPrice, formatPercent } from '../lib/utils';

interface FloorCardProps {
  price: number | null;
  ma200w: number | null;
  percentAbove: number | null;
  buyZone: boolean;
  lastTouchDate?: string;
}

export function FloorCard({
  price,
  ma200w,
  percentAbove,
  buyZone,
  lastTouchDate = 'Nov 2022',
}: FloorCardProps) {
  // Calculate drop needed to reach floor
  const dropToFloor =
    price && ma200w ? ((price - ma200w) / price) * 100 : null;

  return (
    <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
      <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
        200W MA Floor
      </h2>

      {/* Floor Price */}
      <div className="text-2xl font-bold text-orange-500 mb-4 font-mono">
        {formatPrice(ma200w)}
      </div>

      {/* Distance Info */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Distance</span>
          <span className="text-emerald-400 font-mono font-medium">
            {formatPercent(percentAbove)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">Drop to floor</span>
          <span className="text-red-400 font-mono font-medium">
            {dropToFloor !== null ? `-${dropToFloor.toFixed(0)}%` : 'N/A'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">Buy Zone</span>
          <span
            className={`font-medium ${
              buyZone ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            {buyZone ? '✓ YES' : '✗ NO'}
          </span>
        </div>

        <div className="border-t border-slate-700 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Last touch</span>
            <span className="text-slate-300 font-mono">{lastTouchDate}</span>
          </div>
        </div>
      </div>

      {/* Buy Zone Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Floor (0%)</span>
          <span>Buy Zone (25%)</span>
          <span>Current</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              buyZone
                ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                : 'bg-gradient-to-r from-orange-500 to-amber-400'
            }`}
            style={{
              width: `${Math.min(100, Math.max(0, ((percentAbove ?? 0) / 100) * 100))}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
