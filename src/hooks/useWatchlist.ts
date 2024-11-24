import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export const useWatchlist = () => {
  const { address } = useAccount();
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    if (address) {
      const storedWatchlist = JSON.parse(localStorage.getItem(`watchlist_${address}`) || '[]');
      setWatchlist(storedWatchlist);
    } else {
      setWatchlist([]);
    }
  }, [address]);

  const isInWatchlist = (assetId: string) => {
    return watchlist.includes(assetId);
  };

  const addToWatchlist = async (assetId: string) => {
    if (!address) return;
    
    const newWatchlist = [...watchlist, assetId];
    localStorage.setItem(`watchlist_${address}`, JSON.stringify(newWatchlist));
    setWatchlist(newWatchlist);
  };

  const removeFromWatchlist = async (assetId: string) => {
    if (!address) return;
    
    const newWatchlist = watchlist.filter(id => id !== assetId);
    localStorage.setItem(`watchlist_${address}`, JSON.stringify(newWatchlist));
    setWatchlist(newWatchlist);
  };

  return {
    watchlist,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isSignedIn: !!address,
  };
};
