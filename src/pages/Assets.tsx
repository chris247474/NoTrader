import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTopCoins, type CryptoCoin } from '../lib/data/cryptoCoins';
import { fetchStockPrices, fetchCommodityPrices } from '../lib/data/assetPrices';

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
// STATIC DATA - Stocks and Commodities (these don't change often)
// =============================================================================

// Magnificent Seven stock IDs
const MAG7_IDS = ['aapl', 'msft', 'googl', 'amzn', 'nvda', 'tsla', 'meta'];

const stocksData: Asset[] = [
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
];

const commoditiesData: Asset[] = [
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

// Convert CryptoCoin to Asset format
function coinToAsset(coin: CryptoCoin): Asset {
  // Simulate trend based on 24h price change (simplified)
  const trend: TrendStatus = coin.priceChangePercentage24h >= 0 ? 'BULLISH' : 'BEARISH';
  const timeSinceFlipped = coin.priceChangePercentage24h >= 0 ? '~' : '~';

  return {
    id: coin.id, // Use CoinGecko ID directly
    rank: coin.marketCapRank,
    name: coin.name,
    symbol: coin.symbol,
    icon: '🪙', // Default icon, could map specific icons
    category: 'crypto',
    price: coin.currentPrice,
    marketCap: coin.marketCap,
    trend,
    timeSinceFlipped,
    ma20w: coin.currentPrice * (trend === 'BULLISH' ? 0.9 : 1.1), // Simplified
    percentFromMA: coin.priceChangePercentage24h,
  };
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
  cryptoCount: number;
}

function CategoryTabs({ active, onChange, cryptoCount }: CategoryTabsProps) {
  const tabs: { value: AssetCategory; label: string; icon: string; count?: number }[] = [
    { value: 'crypto', label: 'Crypto', icon: '₿', count: cryptoCount },
    { value: 'stocks', label: 'Stocks', icon: '📈', count: stocksData.length },
    { value: 'commodities', label: 'Commodities', icon: '🥇', count: commoditiesData.length },
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
          {tab.count !== undefined && (
            <span className="text-xs opacity-70">({tab.count})</span>
          )}
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
  category: AssetCategory;
  mag7Filter: boolean;
  onMag7FilterChange: (enabled: boolean) => void;
}

function FilterPanel({ trendFilter, onTrendFilterChange, timeFrame, onTimeFrameChange, category, mag7Filter, onMag7FilterChange }: FilterPanelProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-4">
      <h3 className="text-white font-bold">Filter</h3>

      {/* MAG7 Filter - Only show for stocks */}
      {category === 'stocks' && (
        <div>
          <label className="text-slate-400 text-sm block mb-2">STOCK GROUP</label>
          <button
            onClick={() => onMag7FilterChange(!mag7Filter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mag7Filter
              ? 'bg-purple-500/30 text-purple-400 ring-1 ring-purple-500'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
          >
            MAG7
          </button>
          {mag7Filter && (
            <p className="text-slate-500 text-xs mt-2">
              Showing: AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA, META
            </p>
          )}
        </div>
      )}

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
  const navigate = useNavigate();
  const [category, setCategory] = useState<AssetCategory>('crypto');
  const [trendFilter, setTrendFilter] = useState<TrendStatus | 'ALL'>('ALL');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('Weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mag7Filter, setMag7Filter] = useState(false);

  // Dynamic crypto coins state
  const [cryptoCoins, setCryptoCoins] = useState<CryptoCoin[]>([]);
  const [cryptoLoading, setCryptoLoading] = useState(true);

  // Fetch crypto coins from CoinGecko
  useEffect(() => {
    async function loadCryptoCoins() {
      setCryptoLoading(true);
      try {
        const coins = await fetchTopCoins(500);
        setCryptoCoins(coins);
      } catch (error) {
        console.error('Failed to fetch crypto coins:', error);
      } finally {
        setCryptoLoading(false);
      }
    }
    loadCryptoCoins();
  }, []);

  // Fetch live prices for stocks and commodities
  const fetchPrices = useCallback(async () => {
    setIsLoading(true);
    try {
      const [stocks, commodities] = await Promise.all([
        fetchStockPrices(),
        fetchCommodityPrices(),
      ]);
      setLivePrices({ ...stocks, ...commodities });
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

  // Convert crypto coins to assets
  const cryptoAssets = useMemo(() => {
    return cryptoCoins.map(coinToAsset);
  }, [cryptoCoins]);

  // Get all assets for current category
  const allAssets = useMemo((): Asset[] => {
    switch (category) {
      case 'crypto':
        return cryptoAssets;
      case 'stocks':
        return stocksData;
      case 'commodities':
        return commoditiesData;
      default:
        return [];
    }
  }, [category, cryptoAssets]);

  // Get price for an asset (use live price if available)
  const getAssetPrice = useCallback((asset: Asset): number => {
    if (asset.category === 'crypto') {
      // Crypto prices come from the coins data directly
      return asset.price;
    }
    return livePrices[asset.id] ?? asset.price;
  }, [livePrices]);

  // Filter assets by trend, search, and MAG7
  const filteredAssets = useMemo(() => {
    return allAssets
      .filter((asset) => {
        // MAG7 filter (only applies to stocks)
        if (category === 'stocks' && mag7Filter) {
          return MAG7_IDS.includes(asset.id);
        }
        return true;
      })
      .filter((asset) => trendFilter === 'ALL' || asset.trend === trendFilter)
      .filter((asset) =>
        searchQuery === '' ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [allAssets, trendFilter, searchQuery, category, mag7Filter]);

  // Calculate stats for current category
  const stats = useMemo(() => {
    const bullish = allAssets.filter((a) => a.trend === 'BULLISH').length;
    const bearish = allAssets.filter((a) => a.trend === 'BEARISH').length;
    const total = allAssets.length;

    // Calculate total market cap for crypto
    const totalMarketCap = category === 'crypto'
      ? allAssets.reduce((sum, a) => sum + (a.marketCap || 0), 0)
      : undefined;

    return { total, bullish, bearish, totalMarketCap };
  }, [category, allAssets]);

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
              <div className={`w-2 h-2 rounded-full ${isLoading || cryptoLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="text-sm text-slate-400">
                {isLoading || cryptoLoading ? 'Updating...' : 'Live'}
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
          <CategoryTabs active={category} onChange={setCategory} cryptoCount={cryptoCoins.length} />
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.totalMarketCap !== undefined && stats.totalMarketCap > 0 && (
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
              <span className="text-slate-500 text-sm">({stats.total > 0 ? Math.round(stats.bullish / stats.total * 100) : 0}%)</span> {stats.bullish}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Bearish</div>
            <div className="text-xl font-bold text-red-400">
              <span className="text-slate-500 text-sm">({stats.total > 0 ? Math.round(stats.bearish / stats.total * 100) : 0}%)</span> {stats.bearish}
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

            {/* Loading state for crypto */}
            {category === 'crypto' && cryptoLoading && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Loading top 500 cryptocurrencies...</p>
              </div>
            )}

            {/* Table */}
            {!(category === 'crypto' && cryptoLoading) && (
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
                        <th className="text-center py-3 px-3 sm:px-4 text-slate-400 text-xs sm:text-sm font-medium hidden sm:table-cell">Since Flip</th>
                        <th className="text-center py-3 px-3 sm:px-4 text-slate-400 text-xs sm:text-sm font-medium hidden sm:table-cell">24h Change</th>
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
                          onClick={() => navigate(`/asset/${asset.category}/${asset.id}`)}
                          className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-slate-800/20' : ''
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
                          <td className="py-3 px-3 sm:px-4 text-center hidden sm:table-cell">
                            <span className="text-slate-400 text-sm">{asset.timeSinceFlipped}</span>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-center hidden sm:table-cell">
                            <span className={`text-sm ${asset.percentFromMA >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {asset.percentFromMA >= 0 ? '+' : ''}{asset.percentFromMA.toFixed(2)}%
                            </span>
                          </td>
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
            )}
          </div>

          {/* Filter Panel */}
          <div className="w-full lg:w-72">
            <FilterPanel
              trendFilter={trendFilter}
              onTrendFilterChange={setTrendFilter}
              timeFrame={timeFrame}
              onTimeFrameChange={setTimeFrame}
              category={category}
              mag7Filter={mag7Filter}
              onMag7FilterChange={setMag7Filter}
            />

            {/* Legend */}
            <div className="mt-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h4 className="text-white font-medium mb-3">About Trend Analysis</h4>
              <p className="text-slate-400 text-sm mb-3">
                Assets are marked <span className="text-emerald-400 font-bold">BULLISH</span> when price is above the 20-Week SMA,
                and <span className="text-red-400 font-bold">BEARISH</span> when below.
              </p>
              <p className="text-slate-500 text-xs">
                Click any asset to view detailed price chart with trend flip history.
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
