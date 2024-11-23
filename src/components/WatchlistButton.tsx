import { useState } from 'react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { SignInButton } from '@clerk/clerk-react';
import { Star } from 'lucide-react';

interface WatchlistButtonProps {
  assetId: string;
}

const WatchlistButton: React.FC<WatchlistButtonProps> = ({ assetId }) => {
  const { isSignedIn, isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [isLoading, setIsLoading] = useState(false);

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
          <Star className="w-4 h-4" />
          <span>Sign in to Watch</span>
        </button>
      </SignInButton>
    );
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isInWatchlist(assetId)) {
        await removeFromWatchlist(assetId);
      } else {
        await addToWatchlist(assetId);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isWatched = isInWatchlist(assetId);

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all ${
        isWatched
          ? 'bg-gray-700 hover:bg-gray-600 text-white'
          : 'bg-purple-600 hover:bg-purple-700 text-white'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Star className={`w-4 h-4 ${isWatched ? 'fill-current' : ''}`} />
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <span>{isWatched ? 'Watching' : 'Watch'}</span>
      )}
    </button>
  );
};

export default WatchlistButton;
