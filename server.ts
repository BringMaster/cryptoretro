import express from 'express';
import cors from 'cors';
import { handleWatchlist } from './src/api/watchlist';
import { handleAssetWatchlist } from './src/api/watchlist/[assetId]';
import dotenv from 'dotenv';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// Load environment variables
dotenv.config();

// Validate Clerk configuration
if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY is required');
}

if (!process.env.VITE_CLERK_PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is required');
}

// Configure Clerk
process.env.CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY;

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : ['https://cryptoretro.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

// Protected routes with Clerk authentication
app.use('/api/watchlist', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    await handleWatchlist(req, res);
  } catch (error) {
    console.error('Error in watchlist route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use('/api/watchlist/:assetId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    await handleAssetWatchlist(req, res);
  } catch (error) {
    console.error('Error in asset watchlist route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
