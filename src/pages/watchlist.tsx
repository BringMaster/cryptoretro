import { useUser } from '@clerk/clerk-react';
import { useEffect, useState, useCallback } from 'react';
import { getAssets } from '@/lib/api';
import Spinner from '@/components/Spinner';
import { formatPrice, formatPercentage } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useWatchlist } from '@/hooks/useWatchlist';
import { X } from 'lucide-react';

interface WatchlistAsset {
  id: string;
  assetId: string;
  asset: {
    id: string;
    name: string;
    symbol: string;
    priceUsd: string;
    changePercent24Hr: string;
  };
}

export default function WatchlistPage() {
  const { user } = useUser();
  const { watchlist, removeFromWatchlist, fetchWatchlist } = useWatchlist();
  const [watchlistAssets, setWatchlistAssets] = useState<WatchlistAsset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssetDetails = useCallback(async () => {
    if (!watchlist?.length) {
      setWatchlistAssets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch all assets once instead of making multiple API calls
      const assetsResponse = await getAssets();
      
      // Filter and map the assets that are in the watchlist
      const assets = watchlist
        .map(assetId => {
          const asset = assetsResponse.find(a => a.id === assetId);
          return asset ? {
            id: assetId,
            assetId,
            asset,
          } : null;
        })
        .filter(Boolean) as WatchlistAsset[];
      
      setWatchlistAssets(assets);
    } catch (error) {
      console.error('Error fetching watchlist assets:', error);
    } finally {
      setLoading(false);
    }
  }, [watchlist]);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
  }, [user, fetchWatchlist]);

  useEffect(() => {
    fetchAssetDetails();
  }, [fetchAssetDetails]);

  const handleRemove = async (assetId: string) => {
    try {
      await removeFromWatchlist(assetId);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Access Required</h2>
          <p className="text-gray-400 mb-4">Please sign in to view your watchlist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-white">Your Watchlist</h1>
      
      {watchlistAssets.length === 0 ? (
        <div className="text-center bg-[#1E1E1E] rounded-lg p-8">
          <h2 className="text-xl font-semibold text-white mb-2">Your watchlist is empty</h2>
          <p className="text-gray-400 mb-4">Start adding cryptocurrencies to track their performance</p>
          <Link 
            to="/" 
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Browse Markets
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {watchlistAssets.map((item) => (
            <div 
              key={item.id} 
              className="bg-[#1E1E1E] rounded-lg p-4 shadow-lg hover:bg-[#222222] transition-colors relative group"
            >
              <Link to={`/asset/${item.assetId}`} className="block">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={`https://assets.coincap.io/assets/icons/${item.asset.symbol.toLowerCase()}@2x.png`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `/cryptocurrencies/${item.asset.symbol.toLowerCase()}.png`;
                    }}
                    alt={`${item.asset.name} logo`}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-medium text-white">{item.asset.name}</h3>
                    <p className="text-sm text-gray-400">{item.asset.symbol}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white font-mono text-lg">
                    {formatPrice(item.asset.priceUsd)}
                  </span>
                  <span className={`font-medium ${
                    parseFloat(item.asset.changePercent24Hr) >= 0 
                      ? 'text-green-500' 
                      : 'text-red-500'
                  }`}>
                    {formatPercentage(item.asset.changePercent24Hr)}
                  </span>
                </div>
              </Link>
              <button
                onClick={() => handleRemove(item.assetId)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove from watchlist"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
