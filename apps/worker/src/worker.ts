import { Worker } from 'bullmq';
import { QUEUE_NAMES, JobTypes, getRedisConnection } from '@auction/shared';
import { processPersistBid } from './processors/bidProcessor';
import { processStartAuction, processEndAuction } from './processors/auctionProcessor';

class BullMQWorker {
  private bidWorker: Worker;
  private auctionWorker: Worker;

  constructor() {
    const connection = getRedisConnection();

    // Bid persistence worker
    this.bidWorker = new Worker(
      QUEUE_NAMES.BID_PERSIST,
      async job => {
        switch (job.name) {
          case JobTypes.PERSIST_BID:
            return await processPersistBid(job);
          default:
            throw new Error(`Unknown job type: ${job.name}`);
        }
      },
      {
        connection,
        concurrency: 5, // Process up to 5 bid jobs concurrently
      }
    );

    // Auction lifecycle worker
    this.auctionWorker = new Worker(
      QUEUE_NAMES.AUCTION_LIFECYCLE,
      async job => {
        switch (job.name) {
          case JobTypes.START_AUCTION:
            return await processStartAuction(job);
          case JobTypes.END_AUCTION:
            return await processEndAuction(job);
          default:
            throw new Error(`Unknown job type: ${job.name}`);
        }
      },
      {
        connection,
        concurrency: 2, // Process auction lifecycle jobs with lower concurrency
      }
    );

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Bid worker events
    this.bidWorker.on('completed', job => {
      console.log(`Bid job ${job.id} completed successfully`);
    });

    this.bidWorker.on('failed', (job, err) => {
      console.error(`Bid job ${job?.id} failed:`, err);
    });

    this.bidWorker.on('error', err => {
      console.error('Bid worker error:', err);
    });

    // Auction worker events
    this.auctionWorker.on('completed', job => {
      console.log(`Auction job ${job.id} completed successfully`);
    });

    this.auctionWorker.on('failed', (job, err) => {
      console.error(`Auction job ${job?.id} failed:`, err);
    });

    this.auctionWorker.on('error', err => {
      console.error('Auction worker error:', err);
    });
  }

  async start() {
    console.log('BullMQ workers started successfully');
    console.log(`Bid worker concurrency: ${this.bidWorker.opts.concurrency}`);
    console.log(`Auction worker concurrency: ${this.auctionWorker.opts.concurrency}`);
  }

  async stop() {
    console.log('Shutting down BullMQ workers...');
    await Promise.all([this.bidWorker.close(), this.auctionWorker.close()]);
    console.log('BullMQ workers stopped');
  }
}

export { BullMQWorker };
