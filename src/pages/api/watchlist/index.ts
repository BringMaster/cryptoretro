import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify authentication first
    const { userId } = await auth();
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Handle GET request
    if (req.method === 'GET') {
      try {
        const watchlist = await prisma.watchlistItem.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          select: {
            assetId: true,
            createdAt: true,
          },
        });
        return res.status(200).json(watchlist);
      } catch (error) {
        console.error('Database error fetching watchlist:', error);
        return res.status(500).json({ error: 'Failed to fetch watchlist from database' });
      }
    }

    // Handle POST request
    if (req.method === 'POST') {
      const { assetId } = req.body;
      
      if (!assetId) {
        return res.status(400).json({ error: 'Asset ID is required' });
      }

      try {
        // Check if asset already exists in watchlist
        const existing = await prisma.watchlistItem.findFirst({
          where: {
            userId,
            assetId,
          },
        });

        if (existing) {
          return res.status(400).json({ error: 'Asset already in watchlist' });
        }

        const watchlistItem = await prisma.watchlistItem.create({
          data: {
            userId,
            assetId,
          },
        });
        return res.status(201).json(watchlistItem);
      } catch (error) {
        console.error('Database error adding to watchlist:', error);
        return res.status(500).json({ error: 'Failed to add to watchlist in database' });
      }
    }

    // Handle unsupported methods
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Unhandled error in watchlist API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
