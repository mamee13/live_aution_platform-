import { Queue } from 'bullmq';
import {
  QUEUE_NAMES,
  JobTypes,
  PersistBidJobData,
  StartAuctionJobData,
  EndAuctionJobData,
  getRedisConnection,
  defaultJobOptions,
} from '@auction/shared';

class QueueService {
  private bidPersistQueue: Queue<PersistBidJobData>;
  private auctionLifecycleQueue: Queue<StartAuctionJobData | EndAuctionJobData>;

  constructor() {
    const connection = getRedisConnection();

    this.bidPersistQueue = new Queue(QUEUE_NAMES.BID_PERSIST, {
      connection,
      defaultJobOptions,
    });

    this.auctionLifecycleQueue = new Queue(QUEUE_NAMES.AUCTION_LIFECYCLE, {
      connection,
      defaultJobOptions,
    });
  }

  async enqueueBidPersist(data: PersistBidJobData): Promise<void> {
    await this.bidPersistQueue.add(JobTypes.PERSIST_BID, data, {
      // High priority for bid persistence
      priority: 10,
      // Ensure idempotency by using bidId as job ID
      jobId: `bid-${data.bidId}`,
    });
  }

  async scheduleAuctionStart(data: StartAuctionJobData): Promise<void> {
    const delay = data.startTime.getTime() - Date.now();

    await this.auctionLifecycleQueue.add(JobTypes.START_AUCTION, data, {
      delay: Math.max(0, delay),
      jobId: `start-${data.auctionId}`,
    });
  }

  async scheduleAuctionEnd(data: EndAuctionJobData): Promise<void> {
    const delay = data.endTime.getTime() - Date.now();

    await this.auctionLifecycleQueue.add(JobTypes.END_AUCTION, data, {
      delay: Math.max(0, delay),
      jobId: `end-${data.auctionId}`,
    });
  }

  async close(): Promise<void> {
    await Promise.all([this.bidPersistQueue.close(), this.auctionLifecycleQueue.close()]);
  }
}

export const queueService = new QueueService();
