import { useState, useMemo, useEffect, useCallback } from 'react';
import { fetchCryptoPrices, fetchCommodityPrices, fetchStockPrices } from '../lib/data/assetPrices';

// =============================================================================
// TYPES
// =============================================================================

type AssetCategory = 'crypto' | 'stocks' | 'commodities';
type TrendStatus = 'BULLISH' | 'BEARISH';
type TimeFrame = '4H' | 'Daily' | 'Weekly' | 'Monthly';

interface Asset {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  icon: string;
  category: AssetCategory;
  price: number;
  marketCap?: number;
  trend: TrendStatus;
  timeSinceFlipped: string;
  ma20w: number;
  percentFromMA: number;
}

// =============================================================================
// SAMPLE DATA - Top Cryptocurrencies, Stocks, and Commodities
// =============================================================================

const assetsData: Asset[] = [
  // Top 20 Cryptocurrencies
  { id: 'btc', rank: 1, name: 'Bitcoin', symbol: 'BTC', icon: '₿', category: 'crypto', price: 88890.36, marketCap: 1.78e12, trend: 'BEARISH', timeSinceFlipped: '1M 3W 2D', ma20w: 102000, percentFromMA: -12.9 },
  { id: 'eth', rank: 2, name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', category: 'crypto', price: 3017.75, marketCap: 364.83e9, trend: 'BEARISH', timeSinceFlipped: '1M 3W 2D', ma20w: 3500, percentFromMA: -13.8 },
  { id: 'bnb', rank: 3, name: 'BNB', symbol: 'BNB', icon: '🔶', category: 'crypto', price: 685.80, marketCap: 119.12e9, trend: 'BEARISH', timeSinceFlipped: '1M 3W 2D', ma20w: 720, percentFromMA: -4.7 },
  { id: 'xrp', rank: 4, name: 'XRP', symbol: 'XRP', icon: '✕', category: 'crypto', price: 2.17, marketCap: 114.53e9, trend: 'BULLISH', timeSinceFlipped: '2M 1W', ma20w: 1.85, percentFromMA: 17.3 },
  { id: 'sol', rank: 5, name: 'Solana', symbol: 'SOL', icon: '◎', category: 'crypto', price: 187.22, marketCap: 71.82e9, trend: 'BEARISH', timeSinceFlipped: '1M 4W 2D', ma20w: 210, percentFromMA: -10.8 },
  { id: 'ada', rank: 6, name: 'Cardano', symbol: 'ADA', icon: '₳', category: 'crypto', price: 0.89, marketCap: 31.2e9, trend: 'BEARISH', timeSinceFlipped: '3W 4D', ma20w: 1.05, percentFromMA: -15.2 },
  { id: 'doge', rank: 7, name: 'Dogecoin', symbol: 'DOGE', icon: '🐕', category: 'crypto', price: 0.32, marketCap: 47.1e9, trend: 'BEARISH', timeSinceFlipped: '1M 3W 2D', ma20w: 0.38, percentFromMA: -15.8 },
  { id: 'trx', rank: 8, name: 'TRON', symbol: 'TRX', icon: '⟁', category: 'crypto', price: 0.29, marketCap: 27.08e9, trend: 'BEARISH', timeSinceFlipped: '2M 1W 6D', ma20w: 0.32, percentFromMA: -9.4 },
  { id: 'avax', rank: 9, name: 'Avalanche', symbol: 'AVAX', icon: '🔺', category: 'crypto', price: 35.42, marketCap: 14.5e9, trend: 'BEARISH', timeSinceFlipped: '1M 2W', ma20w: 42, percentFromMA: -15.7 },
  { id: 'link', rank: 10, name: 'Chainlink', symbol: 'LINK', icon: '⬡', category: 'crypto', price: 22.15, marketCap: 14.1e9, trend: 'BULLISH', timeSinceFlipped: '3W 2D', ma20w: 19.50, percentFromMA: 13.6 },
  { id: 'dot', rank: 11, name: 'Polkadot', symbol: 'DOT', icon: '●', category: 'crypto', price: 6.98, marketCap: 10.8e9, trend: 'BULLISH', timeSinceFlipped: '1D 10H', ma20w: 6.20, percentFromMA: 12.6 },
  { id: 'matic', rank: 12, name: 'Polygon', symbol: 'MATIC', icon: '⬡', category: 'crypto', price: 0.48, marketCap: 4.7e9, trend: 'BEARISH', timeSinceFlipped: '2M 3W', ma20w: 0.65, percentFromMA: -26.2 },
  { id: 'shib', rank: 13, name: 'Shiba Inu', symbol: 'SHIB', icon: '🐕', category: 'crypto', price: 0.000021, marketCap: 12.4e9, trend: 'BEARISH', timeSinceFlipped: '1M 1W', ma20w: 0.000028, percentFromMA: -25.0 },
  { id: 'ltc', rank: 14, name: 'Litecoin', symbol: 'LTC', icon: 'Ł', category: 'crypto', price: 102.50, marketCap: 7.7e9, trend: 'BULLISH', timeSinceFlipped: '2W 3D', ma20w: 95, percentFromMA: 7.9 },
  { id: 'uni', rank: 15, name: 'Uniswap', symbol: 'UNI', icon: '🦄', category: 'crypto', price: 13.25, marketCap: 8.0e9, trend: 'BULLISH', timeSinceFlipped: '1W 5D', ma20w: 11.80, percentFromMA: 12.3 },
  { id: 'atom', rank: 16, name: 'Cosmos', symbol: 'ATOM', icon: '⚛', category: 'crypto', price: 6.42, marketCap: 2.5e9, trend: 'BEARISH', timeSinceFlipped: '3W 1D', ma20w: 8.20, percentFromMA: -21.7 },
  { id: 'xlm', rank: 17, name: 'Stellar', symbol: 'XLM', icon: '✦', category: 'crypto', price: 0.42, marketCap: 12.8e9, trend: 'BULLISH', timeSinceFlipped: '1M 2W', ma20w: 0.35, percentFromMA: 20.0 },
  { id: 'apt', rank: 18, name: 'Aptos', symbol: 'APT', icon: '🔷', category: 'crypto', price: 8.84, marketCap: 4.4e9, trend: 'BULLISH', timeSinceFlipped: '1D 10H', ma20w: 7.50, percentFromMA: 17.9 },
  { id: 'pepe', rank: 19, name: 'Pepe', symbol: 'PEPE', icon: '🐸', category: 'crypto', price: 0.000018, marketCap: 7.6e9, trend: 'BULLISH', timeSinceFlipped: '1D 10H', ma20w: 0.000015, percentFromMA: 20.0 },
  { id: 'fil', rank: 20, name: 'Filecoin', symbol: 'FIL', icon: '📁', category: 'crypto', price: 5.45, marketCap: 3.1e9, trend: 'BULLISH', timeSinceFlipped: '1D 10H', ma20w: 4.80, percentFromMA: 13.5 },

  // Popular Stocks & Indices
  { id: 'spy', rank: 1, name: 'S&P 500', symbol: 'SPY', icon: '📊', category: 'stocks', price: 598.42, trend: 'BULLISH', timeSinceFlipped: '3M 2W', ma20w: 545, percentFromMA: 9.8 },
  { id: 'qqq', rank: 2, name: 'NASDAQ 100', symbol: 'QQQ', icon: '📈', category: 'stocks', price: 518.75, trend: 'BULLISH', timeSinceFlipped: '2M 3W', ma20w: 480, percentFromMA: 8.1 },
  { id: 'dia', rank: 3, name: 'Dow Jones', symbol: 'DIA', icon: '🏛️', category: 'stocks', price: 428.30, trend: 'BULLISH', timeSinceFlipped: '4M 1W', ma20w: 405, percentFromMA: 5.8 },
  { id: 'aapl', rank: 4, name: 'Apple', symbol: 'AAPL', icon: '🍎', category: 'stocks', price: 248.52, trend: 'BULLISH', timeSinceFlipped: '2M 1W', ma20w: 225, percentFromMA: 10.5 },
  { id: 'msft', rank: 5, name: 'Microsoft', symbol: 'MSFT', icon: '🪟', category: 'stocks', price: 438.12, trend: 'BULLISH', timeSinceFlipped: '3M 2D', ma20w: 410, percentFromMA: 6.9 },
  { id: 'googl', rank: 6, name: 'Google', symbol: 'GOOGL', icon: '🔍', category: 'stocks', price: 192.45, trend: 'BULLISH', timeSinceFlipped: '1M 3W', ma20w: 175, percentFromMA: 10.0 },
  { id: 'amzn', rank: 7, name: 'Amazon', symbol: 'AMZN', icon: '📦', category: 'stocks', price: 225.80, trend: 'BULLISH', timeSinceFlipped: '2M 2W', ma20w: 198, percentFromMA: 14.0 },
  { id: 'nvda', rank: 8, name: 'NVIDIA', symbol: 'NVDA', icon: '🎮', category: 'stocks', price: 142.65, trend: 'BEARISH', timeSinceFlipped: '2W 4D', ma20w: 155, percentFromMA: -8.0 },
  { id: 'tsla', rank: 9, name: 'Tesla', symbol: 'TSLA', icon: '🚗', category: 'stocks', price: 412.35, trend: 'BULLISH', timeSinceFlipped: '1M 1W', ma20w: 350, percentFromMA: 17.8 },
  { id: 'meta', rank: 10, name: 'Meta', symbol: 'META', icon: '👤', category: 'stocks', price: 612.20, trend: 'BULLISH', timeSinceFlipped: '4M 3W', ma20w: 520, percentFromMA: 17.7 },
  { id: 'mstr', rank: 11, name: 'MicroStrategy', symbol: 'MSTR', icon: '🏢', category: 'stocks', price: 358.40, trend: 'BEARISH', timeSinceFlipped: '3W 2D', ma20w: 420, percentFromMA: -14.7 },
  { id: 'coin', rank: 12, name: 'Coinbase', symbol: 'COIN', icon: '🪙', category: 'stocks', price: 268.90, trend: 'BEARISH', timeSinceFlipped: '1M 2W', ma20w: 310, percentFromMA: -13.3 },

  // Commodities (Metals)
  { id: 'gold', rank: 1, name: 'Gold', symbol: 'GOLD', icon: '🥇', category: 'commodities', price: 2683.74, trend: 'BULLISH', timeSinceFlipped: '11M 1W', ma20w: 2450, percentFromMA: 9.5 },
  { id: 'silver', rank: 2, name: 'Silver', symbol: 'SILVER', icon: '🥈', category: 'commodities', price: 31.11, trend: 'BULLISH', timeSinceFlipped: '7M 10H', ma20w: 28.50, percentFromMA: 9.2 },
  { id: 'platinum', rank: 3, name: 'Platinum', symbol: 'PLATINUM', icon: '⚪', category: 'commodities', price: 985.34, trend: 'BULLISH', timeSinceFlipped: '7M 2W', ma20w: 920, percentFromMA: 7.1 },
  { id: 'palladium', rank: 4, name: 'Palladium', symbol: 'PALLADIUM', icon: '🔘', category: 'commodities', price: 962.70, trend: 'BULLISH', timeSinceFlipped: '7M 10H', ma20w: 880, percentFromMA: 9.4 },
  { id: 'copper', rank: 5, name: 'Copper', symbol: 'COPPER', icon: '🟤', category: 'commodities', price: 4.15, trend: 'BULLISH', timeSinceFlipped: '1M 1W 2D', ma20w: 3.95, percentFromMA: 5.1 },
  { id: 'oil', rank: 6, name: 'Oil (Brent)', symbol: 'BRENT', icon: '🛢️', category: 'commodities', price: 74.11, trend: 'BEARISH', timeSinceFlipped: '2M 3W 6D', ma20w: 82, percentFromMA: -9.6 },
  { id: 'natgas', rank: 7, name: 'Natural Gas', symbol: 'NATGAS', icon: '🔥', category: 'commodities', price: 3.47, trend: 'BEARISH', timeSinceFlipped: '3W 4D', ma20w: 4.20, percentFromMA: -17.4 },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

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

function formatMarketCap(cap: number | undefined): string {
  if (!cap) return '-';
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
  return `$${cap.toLocaleString()}`;
}

// =============================================================================
// COMPONENTS
// =============================================================================

interface TrendBadgeProps {
  trend: TrendStatus;
}

function TrendBadge({ trend }: TrendBadgeProps) {
  const isBullish = trend === 'BULLISH';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${isBullish
      ? 'bg-emerald-500/20 text-emerald-400'
      : 'bg-red-500/20 text-red-400'
      }`}>
      <span>{isBullish ? '↑' : '↓'}</span>
      {trend}
    </span>
  );
}

interface CategoryTabsProps {
  active: AssetCategory;
  onChange: (cat: AssetCategory) => void;
}

function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  const tabs: { value: AssetCategory; label: string; icon: string }[] = [
    { value: 'crypto', label: 'Crypto', icon: '₿' },
    { value: 'stocks', label: 'Stocks', icon: '📈' },
    { value: 'commodities', label: 'Commodities', icon: '🥇' },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-sm sm:text-base ${active === tab.value
            ? 'bg-amber-500 text-slate-900'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
        >
          <span>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface FilterPanelProps {
  trendFilter: TrendStatus | 'ALL';
  onTrendFilterChange: (filter: TrendStatus | 'ALL') => void;
  timeFrame: TimeFrame;
  onTimeFrameChange: (tf: TimeFrame) => void;
}

function FilterPanel({ trendFilter, onTrendFilterChange, timeFrame, onTimeFrameChange }: FilterPanelProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-4">
      <h3 className="text-white font-bold">Filter</h3>

      {/* Trend Filter */}
      <div>
        <label className="text-slate-400 text-sm block mb-2">TREND</label>
        <div className="flex gap-2">
          <button
            onClick={() => onTrendFilterChange(trendFilter === 'BULLISH' ? 'ALL' : 'BULLISH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${trendFilter === 'BULLISH'
              ? 'bg-emerald-500/30 text-emerald-400 ring-1 ring-emerald-500'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
          >
            ↑ BULLISH
          </button>
          <button
            onClick={() => onTrendFilterChange(trendFilter === 'BEARISH' ? 'ALL' : 'BEARISH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${trendFilter === 'BEARISH'
              ? 'bg-red-500/30 text-red-400 ring-1 ring-red-500'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
          >
            ↓ BEARISH
          </button>
        </div>
      </div>

      {/* Timeframe */}
      <div>
        <label className="text-slate-400 text-sm block mb-2">TIMEFRAME</label>
        <div className="flex flex-wrap gap-1">
          {(['4H', 'Daily', 'Weekly', 'Monthly'] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeFrameChange(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${timeFrame === tf
                ? 'bg-amber-500 text-slate-900'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function Assets() {
  const [category, setCategory] = useState<AssetCategory>('crypto');
  const [trendFilter, setTrendFilter] = useState<TrendStatus | 'ALL'>('ALL');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('Weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch live prices
  const fetchPrices = useCallback(async () => {
    setIsLoading(true);
    try {
      const [crypto, stocks, commodities] = await Promise.all([
        fetchCryptoPrices().catch(() => ({})),
        fetchStockPrices(),
        fetchCommodityPrices(),
      ]);
      setLivePrices({ ...crypto, ...stocks, ...commodities });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch prices:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch prices on mount and every 60 seconds
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  // Get price for an asset (use live price if available, otherwise default)
  const getAssetPrice = useCallback((asset: Asset): number => {
    return livePrices[asset.id] ?? asset.price;
  }, [livePrices]);

  // Filter assets by category, trend, and search
  const filteredAssets = useMemo(() => {
    return assetsData
      .filter((asset) => asset.category === category)
      .filter((asset) => trendFilter === 'ALL' || asset.trend === trendFilter)
      .filter((asset) =>
        searchQuery === '' ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.rank - b.rank);
  }, [category, trendFilter, searchQuery]);

  // Calculate stats for current category
  const stats = useMemo(() => {
    const categoryAssets = assetsData.filter((a) => a.category === category);
    const bullish = categoryAssets.filter((a) => a.trend === 'BULLISH').length;
    const bearish = categoryAssets.filter((a) => a.trend === 'BEARISH').length;
    const total = categoryAssets.length;

    // Calculate total market cap for crypto
    const totalMarketCap = category === 'crypto'
      ? categoryAssets.reduce((sum, a) => sum + (a.marketCap || 0), 0)
      : undefined;

    return { total, bullish, bearish, totalMarketCap };
  }, [category]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Asset Trends</h1>
            <p className="text-slate-400">20-Week SMA trend analysis across Crypto, Stocks & Commodities</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Loading indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="text-sm text-slate-400">
                {isLoading ? 'Updating...' : 'Live'}
              </span>
            </div>
            {/* Last updated */}
            {lastUpdated && (
              <span className="text-sm text-slate-500">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6">
          <CategoryTabs active={category} onChange={setCategory} />
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.totalMarketCap && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Market Cap</div>
              <div className="text-xl font-bold text-white">{formatMarketCap(stats.totalMarketCap)}</div>
            </div>
          )}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total {category === 'crypto' ? 'Coins' : category === 'stocks' ? 'Stocks' : 'Commodities'}</div>
            <div className="text-xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Bullish</div>
            <div className="text-xl font-bold text-emerald-400">
              <span className="text-slate-500 text-sm">({Math.round(stats.bullish / stats.total * 100)}%)</span> {stats.bullish}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Bearish</div>
            <div className="text-xl font-bold text-red-400">
              <span className="text-slate-500 text-sm">({Math.round(stats.bearish / stats.total * 100)}%)</span> {stats.bearish}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Table */}
          <div className="flex-1">
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search name, symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-3 sm:px-4 text-slate-400 text-xs sm:text-sm font-medium">#</th>
                      <th className="text-left py-3 px-3 sm:px-4 text-slate-400 text-xs sm:text-sm font-medium">
                        {category === 'crypto' ? 'Token' : category === 'stocks' ? 'Stock' : 'Commodity'}
                      </th>
                      <th className="text-center py-3 px-3 sm:px-4 text-slate-400 text-xs sm:text-sm font-medium">Trend</th>
                      <th className="text-center py-3 px-3 sm:px-4 text-slate-400 text-xs sm:text-sm font-medium hidden sm:table-cell">Time Flipped</th>
                      <th className="text-right py-3 px-3 sm:px-4 text-slate-400 text-xs sm:text-sm font-medium">Price</th>
                      {category === 'crypto' && (
                        <th className="text-right py-3 px-3 sm:px-4 text-slate-400 text-xs sm:text-sm font-medium hidden md:table-cell">Market Cap</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map((asset, index) => (
                      <tr
                        key={asset.id}
                        className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${index % 2 === 0 ? 'bg-slate-800/20' : ''
                          }`}
                      >
                        <td className="py-3 px-3 sm:px-4 text-slate-500 text-sm">{asset.rank}</td>
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-xl sm:text-2xl">{asset.icon}</span>
                            <div>
                              <div className="font-medium text-white text-sm sm:text-base">{asset.name}</div>
                              <div className="text-slate-500 text-xs sm:text-sm">{asset.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-center">
                          <TrendBadge trend={asset.trend} />
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-center text-slate-300 text-sm hidden sm:table-cell">{asset.timeSinceFlipped}</td>
                        <td className="py-3 px-3 sm:px-4 text-right font-mono text-white text-sm">{formatPrice(getAssetPrice(asset))}</td>
                        {category === 'crypto' && (
                          <td className="py-3 px-3 sm:px-4 text-right text-slate-300 text-sm hidden md:table-cell">{formatMarketCap(asset.marketCap)}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAssets.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  No assets found matching your criteria
                </div>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          <div className="w-full lg:w-72">
            <FilterPanel
              trendFilter={trendFilter}
              onTrendFilterChange={setTrendFilter}
              timeFrame={timeFrame}
              onTimeFrameChange={setTimeFrame}
            />

            {/* Legend */}
            <div className="mt-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h4 className="text-white font-medium mb-3">About Trend Analysis</h4>
              <p className="text-slate-400 text-sm mb-3">
                Assets are marked <span className="text-emerald-400 font-bold">BULLISH</span> when price is above the 20-Week SMA,
                and <span className="text-red-400 font-bold">BEARISH</span> when below.
              </p>
              <p className="text-slate-500 text-xs">
                Time Since Flipped shows how long since the last trend change.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-8">
          Data updated: {new Date().toLocaleString()} | Timeframe: {timeFrame} | Not financial advice
        </p>
      </div>
    </div>
  );
}
