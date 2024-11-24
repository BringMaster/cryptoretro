import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { getAssets, getCoinImageUrl } from '@/lib/api';
import { formatPrice, formatMarketCap, formatPercentage } from '@/lib/utils';
import Spinner from '@/components/Spinner';
import MiniChart from '@/components/MiniChart';
import WatchlistButton from '@/components/WatchlistButton';
import { useWatchlist } from '@/hooks/useWatchlist';

// Loading states
const ButtonLoader = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <Spinner size="sm" />
  </div>
);

const WatchlistPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { watchlist } = useWatchlist();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatchlistAssets = async () => {
      if (!user || !watchlist?.length) {
        setAssets([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const allAssets = await getAssets();
        const watchlistAssets = allAssets.filter(asset => watchlist.includes(asset.id));
        setAssets(watchlistAssets);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
        setError('Failed to load watchlist');
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlistAssets();
  }, [user, watchlist]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Watchlist</h1>
          <p className="text-gray-400 mb-4">Please sign in to view your watchlist.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Spinner size="lg" className="mb-4" />
          <p className="text-purple-500 font-medium">Loading watchlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Watchlist</h1>

      {assets.length === 0 ? (
        <div className="text-center py-12 bg-[#0a0a0a] rounded-lg">
          <p className="text-gray-400 mb-4">Your watchlist is empty.</p>
          <button
            onClick={() => navigate('/')}
            className="text-purple-500 hover:text-purple-400 transition-colors"
          >
            Browse assets to add to your watchlist
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#0a0a0a] rounded-lg shadow-lg">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="py-4 px-6">#</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">24h %</th>
                <th className="py-4 px-6">Market Cap</th>
                <th className="py-4 px-6">Volume (24h)</th>
                <th className="py-4 px-6">Chart</th>
                <th className="py-4 px-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {assets.map((asset) => (
                <tr
                  key={asset.id}
                  className="hover:bg-gray-800/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/asset/${asset.id}`)}
                >
                  <td className="py-4 px-6">{asset.rank}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
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
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-gray-400">{asset.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono">
                    {formatPrice(asset.priceUsd)}
                  </td>
                  <td className="py-4 px-6">
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
                  <td className="py-4 px-6">
                    {formatMarketCap(asset.marketCapUsd)}
                  </td>
                  <td className="py-4 px-6">
                    {formatMarketCap(asset.volumeUsd24Hr)}
                  </td>
                  <td className="py-4 px-6">
                    <MiniChart 
                      assetId={asset.id} 
                      changePercent24Hr={parseFloat(asset.changePercent24Hr)} 
                    />
                  </td>
                  <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                    <WatchlistButton assetId={asset.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;
