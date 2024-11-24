import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const handleWatchlistItem = async (req: Request, res: Response) => {
  try {
    console.log('Handling watchlist item request:', {
      method: req.method,
      assetId: req.params.assetId,
      headers: req.headers,
    });

    const { assetId } = req.params;
    const authorization = req.headers.authorization;

    if (!authorization) {
      console.log('No authorization header provided');
      return res.status(401).json({ error: 'No wallet address provided' });
    }

    const walletAddress = authorization.replace('Bearer ', '');

    if (!walletAddress) {
      console.log('No wallet address found in authorization header');
      return res.status(401).json({ error: 'Invalid authorization format' });
    }

    if (!assetId) {
      console.log('No assetId provided');
      return res.status(400).json({ error: 'Asset ID is required' });
    }

    console.log('Processing request for:', {
      assetId,
      walletAddress,
      method: req.method
    });

    // Handle GET request (check if asset is in watchlist)
    if (req.method === 'GET') {
      try {
        console.log('Checking watchlist status for:', {
          assetId,
          walletAddress: walletAddress.toLowerCase()
        });

        const watchlistItem = await prisma.watchlistItem.findFirst({
          where: {
            assetId,
            userId: walletAddress.toLowerCase(),
          },
        });
        
        const result = { isWatched: !!watchlistItem };
        console.log('Watchlist check result:', result);
        return res.status(200).json(result);
      } catch (error) {
        console.error('Database error checking watchlist status:', error);
        return res.status(500).json({ 
          error: 'Error checking watchlist status',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Handle POST request (add to watchlist)
    if (req.method === 'POST') {
      try {
        console.log('Adding asset to watchlist for:', {
          assetId,
          walletAddress: walletAddress.toLowerCase()
        });

        const existingItem = await prisma.watchlistItem.findFirst({
          where: {
            assetId,
            userId: walletAddress.toLowerCase(),
          },
        });

        if (existingItem) {
          console.log('Asset already in watchlist');
          return res.status(409).json({ error: 'Asset already in watchlist' });
        }

        const watchlistItem = await prisma.watchlistItem.create({
          data: {
            assetId,
            userId: walletAddress.toLowerCase(),
          },
        });
        console.log('Watchlist item created:', watchlistItem);
        return res.status(201).json(watchlistItem);
      } catch (error: any) {
        console.error('Database error adding to watchlist:', error);
        // Handle unique constraint violation
        if (error.code === 'P2002') {
          console.log('Asset already in watchlist');
          return res.status(409).json({ error: 'Asset already in watchlist' });
        }
        return res.status(500).json({ 
          error: 'Error adding to watchlist',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Handle DELETE request (remove from watchlist)
    if (req.method === 'DELETE') {
      try {
        console.log('Removing asset from watchlist for:', {
          assetId,
          walletAddress: walletAddress.toLowerCase()
        });

        const deleted = await prisma.watchlistItem.deleteMany({
          where: {
            assetId,
            userId: walletAddress.toLowerCase(),
          },
        });
        
        console.log('Watchlist item deleted:', deleted);
        if (deleted.count === 0) {
          console.log('Asset not found in watchlist');
          return res.status(404).json({ error: 'Asset not found in watchlist' });
        }
        
        return res.status(204).send();
      } catch (error) {
        console.error('Database error removing from watchlist:', error);
        return res.status(500).json({ 
          error: 'Error removing from watchlist',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('Unknown request method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling watchlist item:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
