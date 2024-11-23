import { useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from "@clerk/clerk-react";

// Get the API URL from environment variables or use a default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useWatchlist = () => {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWatchlist = useCallback(async () => {
    if (!isSignedIn) return;

    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/watchlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      
      setWatchlist(data.map((item: any) => item.assetId));
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      setWatchlist([]);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (isSignedIn) {
      fetchWatchlist();
    } else {
      setWatchlist([]);
    }
  }, [isSignedIn, fetchWatchlist]);

  const addToWatchlist = async (assetId: string) => {
    if (!isSignedIn) {
      throw new Error('Must be signed in to add to watchlist');
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/watchlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assetId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchWatchlist();
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWatchlist = async (assetId: string) => {
    if (!isSignedIn) {
      throw new Error('Must be signed in to remove from watchlist');
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/watchlist/${assetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchWatchlist();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const isInWatchlist = useCallback((assetId: string) => {
    return watchlist.includes(assetId);
  }, [watchlist]);

  return {
    watchlist,
    isLoading,
    isSignedIn,
    addToWatchlist,
    removeFromWatchlist,
    fetchWatchlist,
    isInWatchlist,
  };
};
