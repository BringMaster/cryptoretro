import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = await auth();
  const { assetId } = req.query;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.watchlistItem.deleteMany({
        where: {
          userId,
          assetId: assetId as string,
        },
      });
      return res.status(200).json({ message: 'Watchlist item removed' });
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
