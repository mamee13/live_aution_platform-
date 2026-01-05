import { Router } from 'express';
import { auctionService } from '../services/auction.service';
import { catchAsync, AppError } from '../utils';

export const auctionRoutes = Router();

auctionRoutes.get(
  '/',
  catchAsync(async (_req, res, next) => {
    const auctions = await auctionService.getActiveAuctions();

    res.json({
      success: true,
      data: auctions,
    });
  })
);

auctionRoutes.get(
  '/:id',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      return next(new AppError('Auction ID is required', 400));
    }

    const auction = await auctionService.getAuctionById(id);

    res.json({
      success: true,
      data: auction,
    });
  })
);

auctionRoutes.post(
  '/:id/bid',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { amount, userId } = req.body;

    if (!id) {
      return next(new AppError('Auction ID is required', 400));
    }

    if (!amount || !userId) {
      return next(new AppError('Amount and userId are required', 400));
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return next(new AppError('Amount must be a positive number', 400));
    }

    const result = await auctionService.placeBid(id, userId, amount);

    res.json({
      success: true,
      data: result,
    });
  })
);
