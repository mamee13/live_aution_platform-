import { Job } from 'bullmq';
import { StartAuctionJobData, EndAuctionJobData } from '@auction/shared';
import { db } from '../config/db';
import { redis } from '../config/redis';

export const processStartAuction = async (job: Job<StartAuctionJobData>) => {
  const { auctionId } = job.data;

  try {
    // Update auction status to active
    const updateQuery = `
      UPDATE auctions 
      SET status = 'active', 
          started_at = NOW()
      WHERE id = $1 AND status = 'pending'
    `;

    const result = await db.query(updateQuery, [auctionId]);

    if (result.rowCount === 0) {
      console.log(`Auction ${auctionId} was not in pending status, skipping start`);
      return;
    }

    // Initialize Redis keys for the auction
    await redis.setex(`auction:${auctionId}:bid_count`, 3600 * 24, '0');

    console.log(`Started auction ${auctionId}`);
  } catch (error) {
    console.error('Error starting auction:', error);
    throw error;
  }
};

export const processEndAuction = async (job: Job<EndAuctionJobData>) => {
  const { auctionId } = job.data;

  try {
    // Get final bid information from Redis
    const finalBid = await redis.get(`auction:${auctionId}:current_bid`);
    const winnerId = await redis.get(`auction:${auctionId}:highest_bidder`);

    // Update auction status in database
    const updateQuery = `
      UPDATE auctions 
      SET status = 'closed', 
          final_price = $1, 
          winner_id = $2,
          closed_at = NOW()
      WHERE id = $3 AND status = 'active'
    `;

    const result = await db.query(updateQuery, [
      finalBid ? parseFloat(finalBid) : null,
      winnerId,
      auctionId,
    ]);

    if (result.rowCount === 0) {
      console.log(`Auction ${auctionId} was not in active status, skipping close`);
      return;
    }

    // Clean up Redis keys (keep bid history for a while)
    await redis.del(
      `auction:${auctionId}:current_bid`,
      `auction:${auctionId}:highest_bidder`,
      `auction:${auctionId}:bid_count`
    );

    console.log(`Closed auction ${auctionId} with final bid: ${finalBid}`);
  } catch (error) {
    console.error('Error closing auction:', error);
    throw error;
  }
};
