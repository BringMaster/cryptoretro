import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { handleWatchlist } from './src/api/watchlist';
import { handleAssetWatchlist } from './src/api/watchlist/[assetId]';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

// CoinCap API proxy
app.use('/api/coincap/*', async (req, res) => {
  try {
    const coincapPath = req.path.replace('/api/coincap/', '');
    const coincapUrl = `https://api.coincap.io/v2/${coincapPath}`;
    
    console.log('Proxying request to:', coincapUrl);
    console.log('Query params:', req.query);

    const response = await axios({
      method: req.method,
      url: coincapUrl,
      params: req.query,
      headers: {
        'Authorization': `Bearer ${process.env.VITE_COINCAP_API_KEY}`
      }
    });

    res.json(response.data);
  } catch (error: any) {
    console.error('CoinCap API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

// Protected routes without Clerk authentication
app.use('/api/watchlist', async (req, res) => {
  try {
    await handleWatchlist(req, res);
  } catch (error) {
    console.error('Error in watchlist route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use('/api/watchlist/:assetId', async (req, res) => {
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
