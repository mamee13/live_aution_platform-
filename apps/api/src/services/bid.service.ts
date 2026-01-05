import { redis } from '../config/redis';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AppError } from '../utils';
import { queueService } from './queueService';
import { v4 as uuidv4 } from 'uuid';

class BidService {
  private placeBidScript: string;

  constructor() {
    // Load Lua script for atomic bid placement
    this.placeBidScript = readFileSync(join(__dirname, '../redis/lua/placeBid.lua'), 'utf8');
  }

  async placeBid(auctionId: string, userId: string, amount: number) {
    const keys = [
      `auction:${auctionId}:current_bid`,
      `auction:${auctionId}:highest_bidder`,
      `auction:${auctionId}:bid_count`,
    ];

    const bidId = uuidv4();
    const timestamp = new Date();
    const args = [userId, amount.toString(), timestamp.getTime().toString()];

    try {
      const result = (await redis.eval(
        this.placeBidScript,
        keys.length,
        ...keys,
        ...args
      )) as number;

      if (result === 1) {
        // Enqueue bid persistence job
        await queueService.enqueueBidPersist({
          auctionId,
          userId,
          amount,
          timestamp,
          bidId,
        });

        return { success: true, message: 'Bid placed successfully', bidId };
      } else {
        throw new AppError('Bid amount too low', 400);
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to place bid', 500);
    }
  }

  async getCurrentBid(auctionId: string) {
    try {
      const currentBid = await redis.get(`auction:${auctionId}:current_bid`);
      const highestBidder = await redis.get(`auction:${auctionId}:highest_bidder`);

      return {
        amount: currentBid ? parseFloat(currentBid) : 0,
        bidderId: highestBidder,
      };
    } catch (error) {
      console.error('Error getting current bid:', error);
      throw new AppError('Failed to get current bid', 500);
    }
  }
}

export const bidService = new BidService();
