import { redis } from '../config/redis';
import { AppError } from '../utils';

interface BidJobData {
  auctionId: string;
  userId: string;
  amount: number;
  timestamp: number;
}

interface AuctionCloseJobData {
  auctionId: string;
}

class QueueService {
  async addBidPersistJob(jobData: BidJobData) {
    try {
      await redis.rpush('queue:bid_persist', JSON.stringify(jobData));
      console.log(`Added bid persist job for auction ${jobData.auctionId}`);
    } catch (error) {
      console.error('Error adding bid persist job:', error);
      throw new AppError('Failed to add bid persist job', 500);
    }
  }

  async addAuctionCloseJob(jobData: AuctionCloseJobData, delay?: number) {
    try {
      if (delay) {
        // Schedule job for later execution using Redis sorted set
        const executeAt = Date.now() + delay;
        await redis.zadd('queue:auction_close_scheduled', executeAt, JSON.stringify(jobData));
        console.log(`Scheduled auction close job for auction ${jobData.auctionId} in ${delay}ms`);
      } else {
        // Execute immediately
        await redis.rpush('queue:auction_close', JSON.stringify(jobData));
        console.log(`Added auction close job for auction ${jobData.auctionId}`);
      }
    } catch (error) {
      console.error('Error adding auction close job:', error);
      throw new AppError('Failed to add auction close job', 500);
    }
  }

  async getQueueLength(queueName: string): Promise<number> {
    try {
      return await redis.llen(`queue:${queueName}`);
    } catch (error) {
      console.error(`Error getting queue length for ${queueName}:`, error);
      throw new AppError(`Failed to get queue length for ${queueName}`, 500);
    }
  }

  async clearQueue(queueName: string) {
    try {
      await redis.del(`queue:${queueName}`);
      console.log(`Cleared queue: ${queueName}`);
    } catch (error) {
      console.error(`Error clearing queue ${queueName}:`, error);
      throw new AppError(`Failed to clear queue ${queueName}`, 500);
    }
  }
}

export const queueService = new QueueService();
