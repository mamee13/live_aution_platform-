import { redis } from '../config/redis';
import { readFileSync } from 'fs';
import { join } from 'path';

class BidService {
  private placeBidScript: string;

  constructor() {
    // Load Lua script for atomic bid placement
    this.placeBidScript = readFileSync(
      join(__dirname, '../redis/lua/placeBid.lua'),
      'utf8'
    );
  }

  async placeBid(auctionId: string, userId: string, amount: number) {
    const keys = [
      `auction:${auctionId}:current_bid`,
      `auction:${auctionId}:highest_bidder`,
      `auction:${auctionId}:bid_count`
    ];

    const args = [userId, amount.toString(), Date.now().toString()];

    try {
      const result = await redis.eval(this.placeBidScript, keys.length, ...keys, ...args) as number;

      if (result === 1) {
        return { success: true, message: 'Bid placed successfully' };
      } else {
        return { success: false, error: 'Bid amount too low' };
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      return { success: false, error: 'Failed to place bid' };
    }
  }

  async getCurrentBid(auctionId: string) {
    const currentBid = await redis.get(`auction:${auctionId}:current_bid`);
    const highestBidder = await redis.get(`auction:${auctionId}:highest_bidder`);
    
    return {
      amount: currentBid ? parseFloat(currentBid) : 0,
      bidderId: highestBidder
    };
  }
}

export const bidService = new BidService();