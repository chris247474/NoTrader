import { getSignalDisplayProps } from '../lib/indicators';
import { formatDate, formatPrice } from '../lib/utils';
import type { CompositeResult } from '../lib/data/types';

interface SignalHistoryProps {
  signals: CompositeResult[];
}

export function SignalHistory({ signals }: SignalHistoryProps) {
  return (
    <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
      <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
        Signal History (Last 10 Signals)
      </h2>

      {signals.length === 0 ? (
        <div className="text-slate-500 text-center py-4">No signals recorded</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-700">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Signal</th>
                <th className="pb-2 font-medium">Reason</th>
                <th className="pb-2 font-medium text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {signals.map((signal, i) => {
                const props = getSignalDisplayProps(signal.signal);
                return (
                  <tr
                    key={i}
                    className="border-b border-slate-700/50 last:border-0"
                  >
                    <td className="py-3 text-slate-300 font-mono">
                      {formatDate(signal.date)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${props.bgColor} ${props.color}`}
                      >
                        {props.icon} {props.label}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 max-w-xs truncate">
                      {signal.reasons[0] || '-'}
                    </td>
                    <td className="py-3 text-right text-amber-400 font-mono">
                      {formatPrice(signal.price)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
