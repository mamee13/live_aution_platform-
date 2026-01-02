import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes';
import { auctionRoutes } from './routes/auction.routes';
import { itemRoutes } from './routes/item.routes';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/auctions', auctionRoutes);
  app.use('/api/items', itemRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
};