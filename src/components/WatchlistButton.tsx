import { useState, useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

interface WatchlistButtonProps {
  assetId: string;
}

const WatchlistButton: React.FC<WatchlistButtonProps> = ({ assetId }) => {
  const { address } = useAccount();
  const { open } = useWeb3Modal();
  const [isLoading, setIsLoading] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);

  useEffect(() => {
    if (address) {
      const watchlist = JSON.parse(localStorage.getItem(`watchlist_${address}`) || '[]');
      setIsWatched(watchlist.includes(assetId));
      setShowConnectDialog(false);
    } else {
      setIsWatched(false);
    }
  }, [address, assetId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    
    if (!address) {
      setShowConnectDialog(true);
      return;
    }
    
    setIsLoading(true);
    try {
      const watchlist = JSON.parse(localStorage.getItem(`watchlist_${address}`) || '[]');
      let newWatchlist;
      
      if (isWatched) {
        newWatchlist = watchlist.filter((id: string) => id !== assetId);
      } else {
        newWatchlist = [...watchlist, assetId];
      }
      
      localStorage.setItem(`watchlist_${address}`, JSON.stringify(newWatchlist));
      setIsWatched(!isWatched);
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`p-2 rounded-full transition-colors duration-200 ${
          !address 
            ? 'hover:bg-gray-700/50' 
            : isWatched 
              ? 'text-green-500 hover:bg-green-500/20' 
              : 'hover:bg-gray-700/50'
        }`}
        title={!address ? 'Connect wallet to add to watchlist' : isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Star
            className={`w-5 h-5 ${isWatched ? 'fill-current' : ''}`}
          />
        )}
      </button>

      {showConnectDialog && !address && (
        <div className="absolute z-50 mt-2 p-4 bg-[#1E1E1E] rounded-lg shadow-lg border border-gray-700 w-64 right-0">
          <h3 className="text-sm font-medium mb-2">Connect Wallet</h3>
          <p className="text-sm text-gray-400 mb-3">Connect your wallet to add assets to your watchlist</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            className="w-full mt-2 px-4 py-2 bg-gray-400 hover:bg-gray-500/20 hover:text-gray-200 text-white rounded-lg text-sm font-medium transition-colors rounded-lg text-sm font-medium"
          >
            Connect Wallet
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConnectDialog(false);
            }}
            className="w-full mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-500/20 hover:text-gray-200 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default WatchlistButton;
