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
    ? ['http://retrotoken.io:3000', 'https://retrotoken.io:3000'] 
    : ['http://localhost:3000', 'http://localhost:5000', 'http://retrotoken.io:3000'],
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
const protectedRouter = express.Router();
protectedRouter.use((req, res, next) => {
  console.log('Authenticating request...');
  console.log('CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY?.slice(0, 10) + '...');
  console.log('CLERK_PUBLISHABLE_KEY:', process.env.CLERK_PUBLISHABLE_KEY?.slice(0, 10) + '...');
  ClerkExpressRequireAuth()(req, res, next);
});

// Watchlist routes (protected)
protectedRouter.get('/watchlist', handleWatchlist);
protectedRouter.post('/watchlist', handleWatchlist);
protectedRouter.get('/watchlist/:assetId', handleAssetWatchlist);
protectedRouter.delete('/watchlist/:assetId', handleAssetWatchlist);

// Mount protected routes under /api
app.use('/api', protectedRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
