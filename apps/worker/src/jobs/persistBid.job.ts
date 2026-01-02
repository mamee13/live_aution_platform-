import { db } from '../config/db';

interface BidJobData {
  auctionId: string;
  userId: string;
  amount: number;
  timestamp: number;
}

export const persistBidJob = async (jobData: BidJobData) => {
  const { auctionId, userId, amount, timestamp } = jobData;

  try {
    const query = `
      INSERT INTO bids (auction_id, user_id, amount, created_at)
      VALUES ($1, $2, $3, $4)
    `;

    await db.query(query, [auctionId, userId, amount, new Date(timestamp)]);

    console.log(`Persisted bid: ${amount} for auction ${auctionId} by user ${userId}`);
  } catch (error) {
    console.error('Error persisting bid:', error);
    throw error;
  }
};
