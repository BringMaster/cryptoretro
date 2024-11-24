import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssets } from '@/lib/api';
import { formatPrice, formatMarketCap, formatPercentage } from '@/lib/utils';
import ErrorBoundary from '@/components/ErrorBoundary';
import Spinner from '@/components/Spinner';
import { getCoinImageUrl } from '@/lib/api';
import { memo } from 'react';

// Lazy load components
const MiniChart = lazy(() => import('@/components/MiniChart'));
const FilterBar = lazy(() => import('@/components/FilterBar'));
const Pagination = lazy(() => import('@/components/Pagination'));
const WatchlistButton = lazy(() => import('@/components/WatchlistButton'));

// Component loading fallbacks
const ChartLoader = () => (
  <div className="h-[50px] w-[120px] flex items-center justify-center">
    <Spinner size="sm" />
  </div>
);

const FilterLoader = () => (
  <div className="h-[60px] flex items-center justify-center">
    <Spinner size="md" />
  </div>
);

interface Asset {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  priceUsd: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  changePercent24Hr: string;
}

interface FilterOptions {
  search: string;
  sortBy: 'rank' | 'priceUsd' | 'marketCapUsd' | 'volumeUsd24Hr' | 'changePercent24Hr';
  sortDirection: 'asc' | 'desc';
  minPrice: string;
  maxPrice: string;
  minMarketCap: string;
  maxMarketCap: string;
  pageSize: number;
}

const defaultFilters: FilterOptions = {
  search: '',
  sortBy: 'rank',
  sortDirection: 'asc',
  minPrice: '',
  maxPrice: '',
  minMarketCap: '',
  maxMarketCap: '',
  pageSize: 25
};

// Memoize child components to prevent unnecessary re-renders
const MemoizedMiniChart = memo(({ assetId, changePercent24Hr }: { assetId: string, changePercent24Hr: string }) => (
  <Suspense fallback={<ChartLoader />}>
    <MiniChart assetId={assetId} changePercent24Hr={parseFloat(changePercent24Hr)} />
  </Suspense>
));

const MemoizedWatchlistButton = memo(({ assetId }: { assetId: string }) => (
  <Suspense fallback={<Spinner size="sm" />}>
    <WatchlistButton assetId={assetId} />
  </Suspense>
));

const Index = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const data = await getAssets();
        setAssets(data);
        setFilteredAssets(data);
      } catch (error) {
        console.error('Error fetching assets:', error);
        setError('Failed to load cryptocurrency data');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchAssets();

    // Set up periodic updates every 30 seconds
    const updateInterval = setInterval(async () => {
      try {
        const data = await getAssets();
        setAssets(data);
        setFilteredAssets(prevFiltered => {
          // Preserve current filtering while updating data
          const updatedAssets = [...data];
          return applyFilters(updatedAssets, filters);
        });
      } catch (error) {
        console.error('Error updating assets:', error);
      }
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(updateInterval);
  }, []);

  // Optimize asset filtering with useCallback
  const applyFilters = useCallback((assets: Asset[], filters: FilterOptions) => {
    let result = [...assets];
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(asset => 
        asset.name.toLowerCase().includes(searchTerm) || 
        asset.symbol.toLowerCase().includes(searchTerm)
      );
    }

    // Apply price filters
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      result = result.filter(asset => parseFloat(asset.priceUsd) >= minPrice);
    }
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      result = result.filter(asset => parseFloat(asset.priceUsd) <= maxPrice);
    }

    // Apply market cap filters
    if (filters.minMarketCap) {
      const minMarketCap = parseFloat(filters.minMarketCap);
      result = result.filter(asset => parseFloat(asset.marketCapUsd) >= minMarketCap);
    }
    if (filters.maxMarketCap) {
      const maxMarketCap = parseFloat(filters.maxMarketCap);
      result = result.filter(asset => parseFloat(asset.marketCapUsd) <= maxMarketCap);
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = parseFloat(a[filters.sortBy]);
      const bValue = parseFloat(b[filters.sortBy]);
      return filters.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return result;
  }, []);

  useEffect(() => {
    setFilteredAssets(applyFilters(assets, filters));
  }, [assets, filters, applyFilters]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleFilterReset = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredAssets.length / filters.pageSize);
  const startIndex = (currentPage - 1) * filters.pageSize;
  const endIndex = startIndex + filters.pageSize;
  const currentAssets = filteredAssets.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-8">
        <Spinner size="lg" className="mb-4" />
        <p className="text-purple-500 text-lg font-medium">Loading asset data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-8">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <ErrorBoundary>
          <Suspense fallback={<FilterLoader />}>
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleFilterReset}
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      <div className="overflow-x-auto bg-[#1E1E1E] rounded-lg shadow-lg mb-8">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">24h %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Market Cap</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Volume (24h)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Chart</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {currentAssets.map((asset) => (
              <tr
                key={asset.id}
                className="hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                onClick={() => navigate(`/asset/${asset.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-300">{asset.rank}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={getCoinImageUrl(asset.symbol)[0]}
                      alt={`${asset.name} logo`}
                      className="w-8 h-8 rounded-full mr-3"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const urls = getCoinImageUrl(asset.symbol);
                        const currentIndex = urls.indexOf(target.src);
                        if (currentIndex < urls.length - 1) {
                          target.src = urls[currentIndex + 1];
                        } else {
                          // If all URLs fail, use a default placeholder
                          target.src = '/assets/placeholder-coin.png';
                          target.onerror = null; // Prevent infinite loop
                        }
                      }}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-100">{asset.name}</div>
                      <div className="text-sm text-gray-400">{asset.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text text-gray-100 font-mono">{formatPrice(asset.priceUsd)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                <span
                      className={`px-2 py-1 rounded ${
                        parseFloat(asset.changePercent24Hr) >= 0
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {formatPercentage(asset.changePercent24Hr)}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-100">{formatMarketCap(asset.marketCapUsd)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-100">{formatMarketCap(asset.volumeUsd24Hr)}</div>
                </td>
                <td className="py-4 px-6">
                  <MemoizedMiniChart assetId={asset.id} changePercent24Hr={asset.changePercent24Hr} />
                </td>
                <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                  <MemoizedWatchlistButton assetId={asset.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Suspense fallback={<Spinner size="md" />}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
};

export default Index;