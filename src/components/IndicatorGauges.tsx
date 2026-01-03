import { getMVRVInterpretation } from '../lib/indicators';
import { getFearGreedClassification } from '../lib/indicators';
import { getPiCycleInterpretation } from '../lib/indicators';

interface GaugeProps {
  label: string;
  value: number | null;
  displayValue: string;
  interpretation: string;
  color: string;
  min?: number;
  max?: number;
}

function Gauge({
  label,
  value,
  displayValue,
  interpretation,
  color,
  min = 0,
  max = 100,
}: GaugeProps) {
  const percentage =
    value !== null ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;

  return (
    <div className="text-center">
      <div className="text-sm font-medium text-slate-400 mb-2">{label}</div>

      {/* Value */}
      <div className={`text-2xl font-bold font-mono ${color}`}>{displayValue}</div>

      {/* Gauge Bar */}
      <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            color.includes('red')
              ? 'bg-red-500'
              : color.includes('emerald') || color.includes('green')
              ? 'bg-emerald-500'
              : color.includes('orange')
              ? 'bg-orange-500'
              : color.includes('yellow')
              ? 'bg-yellow-500'
              : 'bg-slate-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Interpretation */}
      <div className="text-xs text-slate-500 mt-1">{interpretation}</div>
    </div>
  );
}

interface IndicatorGaugesProps {
  mvrv: number | null;
  fearGreed: number | null;
  piCycleProx: number | null;
  percentFrom200w: number | null;
}

export function IndicatorGauges({
  mvrv,
  fearGreed,
  piCycleProx,
  percentFrom200w,
}: IndicatorGaugesProps) {
  // Determine colors based on values
  const mvrvColor =
    mvrv === null
      ? 'text-slate-400'
      : mvrv <= 0.5
      ? 'text-emerald-400'
      : mvrv <= 2
      ? 'text-yellow-400'
      : mvrv <= 4
      ? 'text-orange-400'
      : 'text-red-400';

  const fgColor =
    fearGreed === null
      ? 'text-slate-400'
      : fearGreed <= 25
      ? 'text-red-400'
      : fearGreed <= 45
      ? 'text-orange-400'
      : fearGreed <= 55
      ? 'text-yellow-400'
      : fearGreed <= 75
      ? 'text-green-400'
      : 'text-emerald-400';

  const piColor =
    piCycleProx === null
      ? 'text-slate-400'
      : piCycleProx >= 98
      ? 'text-red-400'
      : piCycleProx >= 90
      ? 'text-orange-400'
      : piCycleProx >= 80
      ? 'text-yellow-400'
      : 'text-slate-300';

  const distColor =
    percentFrom200w === null
      ? 'text-slate-400'
      : percentFrom200w <= 10
      ? 'text-emerald-400'
      : percentFrom200w <= 25
      ? 'text-green-400'
      : percentFrom200w <= 50
      ? 'text-yellow-400'
      : 'text-slate-300';

  return (
    <div className="rounded-xl bg-slate-800 p-6 border border-slate-700">
      <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">
        Indicator Panels
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Gauge
          label="MVRV Z-Score"
          value={mvrv}
          displayValue={mvrv !== null ? mvrv.toFixed(1) : 'N/A'}
          interpretation={getMVRVInterpretation(mvrv)}
          color={mvrvColor}
          min={-0.5}
          max={10}
        />

        <Gauge
          label="Fear & Greed"
          value={fearGreed}
          displayValue={fearGreed !== null ? fearGreed.toString() : 'N/A'}
          interpretation={getFearGreedClassification(fearGreed)}
          color={fgColor}
          min={0}
          max={100}
        />

        <Gauge
          label="Pi Cycle"
          value={piCycleProx}
          displayValue={piCycleProx !== null ? `${piCycleProx.toFixed(0)}%` : 'N/A'}
          interpretation={getPiCycleInterpretation(piCycleProx)}
          color={piColor}
          min={0}
          max={100}
        />

        <Gauge
          label="200W Distance"
          value={percentFrom200w}
          displayValue={
            percentFrom200w !== null ? `+${percentFrom200w.toFixed(0)}%` : 'N/A'
          }
          interpretation={
            percentFrom200w === null
              ? 'No Data'
              : percentFrom200w <= 0
              ? 'At/Below Floor'
              : percentFrom200w <= 25
              ? 'Buy Zone'
              : 'Above Zone'
          }
          color={distColor}
          min={0}
          max={200}
        />
      </div>
    </div>
  );
}
