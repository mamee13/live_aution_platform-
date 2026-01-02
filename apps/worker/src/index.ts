import { redis } from './config/redis';
import { db } from './config/db';
import { persistBidJob } from './jobs/persistBid.job';
import { closeAuctionJob } from './jobs/closeAuction.job';

class SimpleWorker {
  private isRunning = false;
  private pollInterval = 1000; // 1 second

  async start() {
    this.isRunning = true;
    console.log('Worker started successfully');

    // Start polling for jobs
    this.pollForJobs();
  }

  async stop() {
    this.isRunning = false;
    console.log('Worker stopped');
  }

  private async pollForJobs() {
    while (this.isRunning) {
      try {
        // Process bid persistence jobs
        await this.processBidJobs();

        // Process auction close jobs
        await this.processAuctionJobs();

        // Process scheduled auction close jobs
        await this.processScheduledAuctionJobs();

        // Wait before next poll
        await this.sleep(this.pollInterval);
      } catch (error) {
        console.error('Error in job polling:', error);
        await this.sleep(this.pollInterval);
      }
    }
  }

  private async processBidJobs() {
    const jobData = await redis.lpop('queue:bid_persist');
    if (jobData) {
      try {
        const job = JSON.parse(jobData);
        await persistBidJob(job);
        console.log(`Processed bid job: ${job.auctionId}`);
      } catch (error) {
        console.error('Error processing bid job:', error);
        // Could implement retry logic here
      }
    }
  }

  private async processAuctionJobs() {
    const jobData = await redis.lpop('queue:auction_close');
    if (jobData) {
      try {
        const job = JSON.parse(jobData);
        await closeAuctionJob(job);
        console.log(`Processed auction close job: ${job.auctionId}`);
      } catch (error) {
        console.error('Error processing auction close job:', error);
        // Could implement retry logic here
      }
    }
  }

  private async processScheduledAuctionJobs() {
    const now = Date.now();
    const scheduledJobs = await redis.zrangebyscore(
      'queue:auction_close_scheduled',
      0,
      now,
      'LIMIT',
      0,
      10
    );

    for (const jobData of scheduledJobs) {
      try {
        const job = JSON.parse(jobData);
        await closeAuctionJob(job);

        // Remove the processed job from the scheduled set
        await redis.zrem('queue:auction_close_scheduled', jobData);

        console.log(`Processed scheduled auction close job: ${job.auctionId}`);
      } catch (error) {
        console.error('Error processing scheduled auction job:', error);
        // Remove failed job to prevent infinite retries
        await redis.zrem('queue:auction_close_scheduled', jobData);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Start the worker
const worker = new SimpleWorker();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await worker.stop();
  await redis.disconnect();
  await db.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await worker.stop();
  await redis.disconnect();
  await db.end();
  process.exit(0);
});

worker.start();
