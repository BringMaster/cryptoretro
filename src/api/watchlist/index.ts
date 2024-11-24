import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export const handleWatchlist = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // The user is already authenticated by Clerk middleware
    const userId = req.auth?.userId;
    console.log('Auth info:', req.auth);
    console.log('User ID:', userId);
    
    if (!userId) {
      console.error('No user ID found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Handle GET request
    if (req.method === 'GET') {
      console.log('Fetching watchlist for user:', userId);
      try {
        const watchlist = await prisma.watchlistItem.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        console.log('Watchlist fetched successfully:', watchlist);
        return res.status(200).json(watchlist);
      } catch (dbError) {
        console.error('Database error fetching watchlist:', dbError);
        throw dbError;
      }
    }

    // Handle POST request
    if (req.method === 'POST') {
      const { assetId } = req.body;
      console.log('Adding asset to watchlist:', { userId, assetId });
      
      if (!assetId) {
        console.error('No asset ID provided');
        return res.status(400).json({ error: 'Asset ID is required' });
      }

      // Check if asset already exists in watchlist
      try {
        const existing = await prisma.watchlistItem.findFirst({
          where: {
            userId,
            assetId,
          },
        });

        if (existing) {
          console.log('Asset already in watchlist:', existing);
          return res.status(400).json({ error: 'Asset already in watchlist' });
        }

        const watchlistItem = await prisma.watchlistItem.create({
          data: {
            userId,
            assetId,
          },
        });
        console.log('Asset added to watchlist:', watchlistItem);
        return res.status(201).json(watchlistItem);
      } catch (dbError) {
        console.error('Database error handling watchlist:', dbError);
        throw dbError;
      }
    }

    console.error('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling watchlist:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined })
    });
  }
};
