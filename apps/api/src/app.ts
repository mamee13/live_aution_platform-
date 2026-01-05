import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes';
import { auctionRoutes } from './routes/auction.routes';
import { itemRoutes } from './routes/item.routes';
import { globalErrorHandler, AppError, catchAsync } from './utils';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/auctions', auctionRoutes);
  app.use('/api/items', itemRoutes);

  app.get(
    '/health',
    catchAsync(async (_req, res, next) => {
      res.json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
      });
    })
  );

  // Handle undefined routes
  app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  });

  // Global error handler
  app.use(globalErrorHandler);

  return app;
};
