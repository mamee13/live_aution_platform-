import { Job } from 'bullmq';
import { PersistBidJobData } from '@auction/shared';
import { db } from '../config/db';

export const processPersistBid = async (job: Job<PersistBidJobData>) => {
  const { auctionId, userId, amount, timestamp, bidId } = job.data;

  try {
    // Use bidId for idempotency - check if already processed
    const existingBid = await db.query('SELECT id FROM bids WHERE id = $1', [bidId]);

    if (existingBid.rows.length > 0) {
      console.log(`Bid ${bidId} already processed, skipping`);
      return;
    }

    const query = `
      INSERT INTO bids (id, auction_id, user_id, amount, created_at)
      VALUES ($1, $2, $3, $4, $5)
    `;

    await db.query(query, [bidId, auctionId, userId, amount, timestamp]);

    console.log(`Persisted bid: ${amount} for auction ${auctionId} by user ${userId}`);
  } catch (error) {
    console.error('Error persisting bid:', error);
    throw error;
  }
};
