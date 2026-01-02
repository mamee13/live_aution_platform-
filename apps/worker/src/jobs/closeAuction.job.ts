import { db } from '../config/db';
import { redis } from '../config/redis';

interface CloseAuctionJobData {
  auctionId: string;
}

export const closeAuctionJob = async (jobData: CloseAuctionJobData) => {
  const { auctionId } = jobData;

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
      WHERE id = $3
    `;

    await db.query(updateQuery, [finalBid ? parseFloat(finalBid) : null, winnerId, auctionId]);

    // Clean up Redis keys
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
