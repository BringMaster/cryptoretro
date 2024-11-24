import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { verifySignature } from '../../lib/auth';

export const handleWatchlist = async (req: Request, res: Response) => {
  try {
    // Get the wallet address from the Authorization header
    const walletAddress = req.headers.authorization?.split(' ')[1];
    
    if (!walletAddress) {
      return res.status(401).json({ error: 'No wallet address provided' });
    }

    // Handle GET request
    if (req.method === 'GET') {
      const watchlist = await prisma.watchlistItem.findMany({
        where: {
          userId: walletAddress.toLowerCase(), // Store addresses in lowercase
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return res.status(200).json(watchlist);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling watchlist:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
