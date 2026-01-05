import { db } from '../config/db';
import { redis } from '../config/redis';
import { bidService } from './bid.service';
import { queueService } from './queueService';
import { AppError } from '../utils';

class AuctionService {
  async getActiveAuctions() {
    const query = `
      SELECT * FROM auctions 
      WHERE status = 'active' AND end_time > NOW()
      ORDER BY created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  async getAuctionById(auctionId: string) {
    const query = 'SELECT * FROM auctions WHERE id = $1';
    const result = await db.query(query, [auctionId]);

    if (result.rows.length === 0) {
      throw new AppError('Auction not found', 404);
    }

    const auction = result.rows[0];
    const currentBid = await redis.get(`auction:${auctionId}:current_bid`);

    return {
      ...auction,
      currentBid: currentBid ? parseFloat(currentBid) : auction.starting_price,
    };
  }

  async createAuction(auctionData: {
    title: string;
    description: string;
    startingPrice: number;
    startTime: Date;
    endTime: Date;
    itemId: string;
  }) {
    const query = `
      INSERT INTO auctions (title, description, starting_price, start_time, end_time, item_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
    `;

    const result = await db.query(query, [
      auctionData.title,
      auctionData.description,
      auctionData.startingPrice,
      auctionData.startTime,
      auctionData.endTime,
      auctionData.itemId,
    ]);

    const auction = result.rows[0];

    // Schedule auction start and end jobs
    await queueService.scheduleAuctionStart({
      auctionId: auction.id,
      startTime: auctionData.startTime,
    });

    await queueService.scheduleAuctionEnd({
      auctionId: auction.id,
      endTime: auctionData.endTime,
    });

    return auction;
  }

  async placeBid(auctionId: string, userId: string, amount: number) {
    // First check if auction exists and is active
    const auction = await this.getAuctionById(auctionId);

    if (auction.status !== 'active') {
      throw new AppError('Auction is not active', 400);
    }

    if (new Date(auction.end_time) <= new Date()) {
      throw new AppError('Auction has ended', 400);
    }

    if (amount <= auction.currentBid) {
      throw new AppError('Bid amount must be higher than current bid', 400);
    }

    return await bidService.placeBid(auctionId, userId, amount);
  }
}

export const auctionService = new AuctionService();
