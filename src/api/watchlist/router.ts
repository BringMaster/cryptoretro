import express from 'express';
import { handleWatchlistItem } from './[assetId]';

const router = express.Router();

// Route for managing watchlist items
router.delete('/api/watchlist/:assetId', handleWatchlistItem);

export default router;
