import { useNavigate } from 'react-router-dom';
import { getAssets, getCoinImageUrl } from '@/lib/api';
import { formatPrice, formatMarketCap, formatPercentage } from '@/lib/utils';
import Spinner from '@/components/Spinner';
import MiniChart from '@/components/MiniChart';
import WatchlistButton from '@/components/WatchlistButton';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useQuery } from '@tanstack/react-query';

export function WatchlistPage() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { open } = useWeb3Modal();

  // Query for watchlist assets
  const { 
    data: assets = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['watchlist', address],
    queryFn: async () => {
      if (!address) return [];

      // Get watchlist items from API
      const watchlistResponse = await fetch('/api/watchlist', {
        headers: {
          'Authorization': `Bearer ${address}`
        }
      });

      if (!watchlistResponse.ok) {
        throw new Error('Failed to fetch watchlist');
      }

      const watchlistItems = await watchlistResponse.json();
      const watchlistIds = watchlistItems.map((item: any) => item.assetId);
      
      // Fetch all assets
      const allAssets = await getAssets();
      
      // Filter assets that are in the watchlist
      return allAssets.filter((asset: any) => watchlistIds.includes(asset.id));
    },
    enabled: !!address,
    // Refresh every 30 seconds
    refetchInterval: 30000,
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to view and manage your watchlist.
          </p>
          <button
            onClick={() => open()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Spinner size="lg" className="mb-4" />
          <p className="text-purple-500 text-lg font-medium">Loading watchlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-400 text-center py-8">
          {error instanceof Error ? error.message : 'Failed to load watchlist data'}
        </div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Your Watchlist is Empty</h2>
          <p className="text-gray-400 mb-6">
            Start adding cryptocurrencies to your watchlist to track their performance.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Browse Assets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Watchlist</h1>
      <div className="overflow-x-auto bg-[#1E1E1E] rounded-lg shadow-lg">
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
            {assets.map((asset) => (
              <tr
                key={asset.id}
                className="hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                onClick={() => navigate(`/asset/${asset.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">{asset.rank}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={getCoinImageUrl(asset.symbol)[0]}
                      alt={asset.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getCoinImageUrl(asset.symbol)[1];
                      }}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium">{asset.name}</div>
                      <div className="text-sm text-gray-400">{asset.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">{formatPrice(asset.priceUsd)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${
                    parseFloat(asset.changePercent24Hr) >= 0 
                      ? 'text-green-500' 
                      : 'text-red-500'
                  }`}>
                    {formatPercentage(asset.changePercent24Hr)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">{formatMarketCap(asset.marketCapUsd)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">{formatMarketCap(asset.volumeUsd24Hr)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <MiniChart assetId={asset.id} changePercent24Hr={parseFloat(asset.changePercent24Hr)} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <WatchlistButton assetId={asset.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WatchlistPage;
