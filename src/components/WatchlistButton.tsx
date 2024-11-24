import React from 'react';
import { Star, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface WatchlistButtonProps {
  assetId: string;
}

export function WatchlistButton({ assetId }: WatchlistButtonProps) {
  const { open } = useWeb3Modal();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  // Query to check if asset is in watchlist
  const { data: isWatched = false, isLoading: isChecking } = useQuery({
    queryKey: ['watchlist', assetId, address],
    queryFn: async () => {
      if (!address) return false;
      
      const response = await fetch(`/api/watchlist/${assetId}`, {
        headers: {
          'Authorization': `Bearer ${address}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check watchlist status');
      }

      const data = await response.json();
      return data.isWatched;
    },
    enabled: !!address,
  });

  // Mutation to toggle watchlist status
  const { mutate: toggleWatchlist, isLoading: isUpdating } = useMutation<void, Error>({
    mutationFn: async () => {
      const response = await fetch(`/api/watchlist/${assetId}`, {
        method: isWatched ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${address}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update watchlist');
      }

      // For DELETE requests with 204 status, return without trying to parse JSON
      if (response.status === 204) {
        return null;
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate both the individual asset status and the full watchlist queries
      queryClient.invalidateQueries({ queryKey: ['watchlist', assetId, address] });
      queryClient.invalidateQueries({ queryKey: ['watchlist', address] });
    },
    onError: (error) => {
      console.error('Error toggling watchlist:', error);
    }
  });

  const handleClick = () => {
    if (!address) {
      open();
      return;
    }
    
    toggleWatchlist();
  };

  const isLoading = isChecking || isUpdating;

  return (
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
  );
}

export default WatchlistButton;
