import { useState, useEffect, useCallback } from 'react';
import { TrendCard } from './TrendCard';
import { FloorCard } from './FloorCard';
import { CompositeCard } from './CompositeCard';
import { PriceChart } from './PriceChart';
import { IndicatorGauges } from './IndicatorGauges';
import { SignalHistory } from './SignalHistory';
import { evaluateComposite, extractSignalHistory } from '../lib/indicators';
import { SAMPLE_HISTORICAL_DATA } from '../lib/data/historical';
import { buildLivePriceData, fetchCurrentPrice, fetchFearGreedIndex, clearCache } from '../lib/data/live';
import type { PriceData, CompositeResult } from '../lib/data/types';

export function Dashboard() {
  const [priceData, setPriceData] = useState<PriceData[]>(SAMPLE_HISTORICAL_DATA);
  const [compositeResults, setCompositeResults] = useState<CompositeResult[]>([]);
  const [currentStatus, setCurrentStatus] = useState<CompositeResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Load data and calculate indicators
  const loadData = useCallback(async (forceLive: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      let data: PriceData[];

      if (forceLive) {
        // Try to fetch live data
        try {
          data = await buildLivePriceData();
          setIsLive(true);
        } catch (e) {
          console.warn('Failed to fetch live data, using sample data:', e);
          data = SAMPLE_HISTORICAL_DATA;
          setIsLive(false);
        }
      } else {
        // Use sample data for initial load (faster)
        data = SAMPLE_HISTORICAL_DATA;
        setIsLive(false);
      }

      // Update latest data point with current values if available
      if (data.length > 0) {
        try {
          const [currentPrice, fgData] = await Promise.all([
            fetchCurrentPrice(),
            fetchFearGreedIndex(1),
          ]);

          const latest = { ...data[data.length - 1] };
          latest.price = currentPrice;
          if (fgData.length > 0) {
            latest.fearGreed = fgData[0].value;
          }
          data = [...data.slice(0, -1), latest];
        } catch (e) {
          console.warn('Could not update with live prices:', e);
        }
      }

      setPriceData(data);

      // Calculate composite results
      const results = evaluateComposite(data);
      setCompositeResults(results);

      // Get current status
      if (results.length > 0) {
        setCurrentStatus(results[results.length - 1]);
      }

      setLastUpdated(new Date());
    } catch (e) {
      console.error('Failed to load data:', e);
      setError(e instanceof Error ? e.message : 'Failed to load data');
      // Fall back to sample data
      setPriceData(SAMPLE_HISTORICAL_DATA);
      const results = evaluateComposite(SAMPLE_HISTORICAL_DATA);
      setCompositeResults(results);
      if (results.length > 0) {
        setCurrentStatus(results[results.length - 1]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadData]);

  // Manual refresh handler
  const handleRefresh = () => {
    clearCache();
    loadData(true);
  };

  // Get signal history
  const signalHistory = extractSignalHistory(compositeResults, 10);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-50">
              Macro Trend Dashboard
            </h1>
            <p className="text-sm text-slate-400">
              Bitcoin cycle analysis using MoneyLine methodology
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Live indicator */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              <span className="text-sm text-slate-400">
                {isLive ? 'Live' : 'Sample Data'}
              </span>
            </div>

            {/* Last updated */}
            {lastUpdated && (
              <span className="text-sm text-slate-500">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg transition-colors"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Error banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TrendCard
            trend={currentStatus?.trend ?? 'NO_DATA'}
            price={currentStatus?.price ?? null}
            ma20w={currentStatus?.ma20w ?? null}
            percentFromMA={currentStatus?.percentFrom20w ?? null}
            trendFlipDate={currentStatus?.trendFlipDate ?? null}
            weeksInTrend={currentStatus?.weeksInTrend ?? 0}
          />

          <FloorCard
            price={currentStatus?.price ?? null}
            ma200w={currentStatus?.ma200w ?? null}
            percentAbove={currentStatus?.percentFrom200w ?? null}
            buyZone={currentStatus?.buyZone ?? false}
          />

          <CompositeCard
            signal={currentStatus?.signal ?? 'NEUTRAL'}
            mvrv={currentStatus?.mvrv ?? null}
            fearGreed={currentStatus?.fearGreed ?? null}
            piCycleProx={currentStatus?.piCycleProx ?? null}
            reasons={currentStatus?.reasons ?? []}
          />
        </div>

        {/* Price Chart */}
        <PriceChart data={priceData} />

        {/* Indicator Gauges */}
        <IndicatorGauges
          mvrv={currentStatus?.mvrv ?? null}
          fearGreed={currentStatus?.fearGreed ?? null}
          piCycleProx={currentStatus?.piCycleProx ?? null}
          percentFrom200w={currentStatus?.percentFrom200w ?? null}
        />

        {/* Signal History */}
        <SignalHistory signals={signalHistory} />

        {/* Footer Info */}
        <div className="text-center text-slate-500 text-sm py-8">
          <p>
            Based on{' '}
            <a
              href="https://ivanontechpremium.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              Ivan on Tech's MoneyLine
            </a>{' '}
            methodology
          </p>
          <p className="mt-2">
            Primary trend: 20W SMA | Floor: 200W MA | On-chain: MVRV Z-Score
          </p>
        </div>
      </main>
    </div>
  );
}
