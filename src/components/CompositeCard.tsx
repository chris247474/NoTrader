import { getSignalDisplayProps } from '../lib/indicators';
import { formatDecimal } from '../lib/utils';
import type { CompositeSignal } from '../lib/data/types';

interface CompositeCardProps {
  signal: CompositeSignal;
  mvrv: number | null;
  fearGreed: number | null;
  piCycleProx: number | null;
  reasons: string[];
}

export function CompositeCard({
  signal,
  mvrv,
  fearGreed,
  piCycleProx,
  reasons,
}: CompositeCardProps) {
  const signalProps = getSignalDisplayProps(signal);

  return (
    <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
      <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
        Composite Signal
      </h2>

      {/* Main Signal Badge */}
      <div
        className={`inline-flex items-center px-3 py-1.5 rounded-lg ${signalProps.bgColor} ${signalProps.color} font-bold text-sm mb-4`}
      >
        {signalProps.icon} {signalProps.label}
      </div>

      {/* Quick Stats */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">MVRV</span>
          <span className="font-mono font-medium text-slate-300">
            {formatDecimal(mvrv)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">F&G</span>
          <span
            className={`font-mono font-medium ${
              fearGreed !== null && fearGreed <= 25
                ? 'text-red-400'
                : fearGreed !== null && fearGreed >= 75
                ? 'text-emerald-400'
                : 'text-slate-300'
            }`}
          >
            {fearGreed ?? 'N/A'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">Pi Cycle</span>
          <span
            className={`font-mono font-medium ${
              piCycleProx !== null && piCycleProx >= 90
                ? 'text-red-400'
                : 'text-slate-300'
            }`}
          >
            {piCycleProx !== null ? `${piCycleProx.toFixed(0)}%` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Reasons */}
      {reasons.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-700">
          <div className="text-xs text-slate-500 mb-2">Signals:</div>
          <ul className="space-y-1">
            {reasons.map((reason, i) => (
              <li key={i} className="text-xs text-slate-400">
                • {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
