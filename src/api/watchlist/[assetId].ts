import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';

export const handleAssetWatchlist = async (req: Request, res: Response) => {
  try {
    // The user is already authenticated by Clerk middleware
    const userId = req.auth?.userId;
    console.log('Auth info:', req.auth);
    console.log('User ID:', userId);
    
    if (!userId) {
      console.error('No user ID found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { assetId } = req.params;

    // Handle DELETE request
    if (req.method === 'DELETE') {
      await prisma.watchlistItem.deleteMany({
        where: {
          userId,
          assetId,
        },
      });
      return res.status(200).json({ message: 'Watchlist item removed' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling watchlist item:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined })
    });
  }
};
