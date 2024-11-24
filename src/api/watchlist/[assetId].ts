import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export const handleAssetWatchlist = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // The user is already authenticated by Clerk middleware
    const userId = req.auth?.userId;
    console.log('Auth info:', req.auth);
    console.log('User ID:', userId);
    
    if (!userId) {
      console.error('No user ID found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { assetId } = req.query;

    // Handle DELETE request
    if (req.method === 'DELETE') {
      await prisma.watchlistItem.deleteMany({
        where: {
          userId,
          assetId,
        },
      });
      return res.status(200).json({ message: 'Asset removed from watchlist' });
    }

    // Handle POST request
    const watchlistItem = await prisma.watchlistItem.create({
      data: {
        userId,
        assetId,
      },
    });

    return res.status(201).json(watchlistItem);
  } catch (error) {
    console.error('Error handling watchlist:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
