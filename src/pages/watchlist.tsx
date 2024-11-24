import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssets, getCoinImageUrl } from '@/lib/api';
import { formatPrice, formatMarketCap, formatPercentage } from '@/lib/utils';
import Spinner from '@/components/Spinner';
import MiniChart from '@/components/MiniChart';
import WatchlistButton from '@/components/WatchlistButton';
import { useAccount } from 'wagmi';

const WatchlistPage = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatchlistAssets = async () => {
      if (!address) {
        setAssets([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get watchlist from local storage
        const watchlist = JSON.parse(localStorage.getItem(`watchlist_${address}`) || '[]');
        
        // Fetch all assets
        const allAssets = await getAssets();
        
        // Filter assets that are in the watchlist
        const watchlistAssets = allAssets.filter((asset: any) => 
          watchlist.includes(asset.id)
        );
        
        setAssets(watchlistAssets);
      } catch (error) {
        console.error('Error fetching watchlist assets:', error);
        setError('Failed to load watchlist data');
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlistAssets();

    // Set up periodic updates
    const updateInterval = setInterval(fetchWatchlistAssets, 30000);
    return () => clearInterval(updateInterval);
  }, [address]);

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Please connect your wallet to view and manage your watchlist.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
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
          {error}
        </div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Your Watchlist is Empty</h2>
          <p className="text-gray-400 mb-8">
            Start building your watchlist by adding some assets from the market.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Browse Market
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
                        const urls = getCoinImageUrl(asset.symbol);
                        const currentIndex = urls.indexOf(target.src);
                        if (currentIndex < urls.length - 1) {
                          target.src = urls[currentIndex + 1];
                        } else {
                          target.src = '/placeholder-coin.png';
                        }
                      }}
                    />
                    <div className="ml-4">
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-sm text-gray-400">{asset.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono">{formatPrice(asset.priceUsd)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm px-2 py-1 rounded inline-block ${
                    parseFloat(asset.changePercent24Hr) >= 0
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
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
                  <div className="w-32 h-16">
                    <MiniChart assetId={asset.id} changePercent24Hr={parseFloat(asset.changePercent24Hr)} />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left" onClick={(e) => e.stopPropagation()}>
                  <WatchlistButton assetId={asset.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WatchlistPage;
