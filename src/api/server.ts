import express from 'express';
import cors from 'cors';
import watchlistRouter from './watchlist/router';

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: ['http://retrotoken.io:3000', 'https://lasting-longhorn-9.clerk.accounts.dev'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'clerk-frontend-api']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use(watchlistRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
