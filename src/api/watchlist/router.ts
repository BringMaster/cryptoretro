import express from 'express';
import { handleAssetWatchlist } from './[assetId]';

const router = express.Router();

// Route for managing watchlist items
router.delete('/api/watchlist/:assetId', handleAssetWatchlist);

export default router;
