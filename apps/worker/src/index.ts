import { Worker } from 'bullmq';
import { redis } from './config/redis';
import { persistBidJob } from './jobs/persistBid.job';
import { closeAuctionJob } from './jobs/closeAuction.job';

// Bid persistence worker
const bidWorker = new Worker('bid-persist', persistBidJob, {
  connection: redis,
  concurrency: 5
});

// Auction closing worker
const auctionWorker = new Worker('auction-close', closeAuctionJob, {
  connection: redis,
  concurrency: 2
});

bidWorker.on('completed', (job) => {
  console.log(`Bid persistence job ${job.id} completed`);
});

bidWorker.on('failed', (job, err) => {
  console.error(`Bid persistence job ${job?.id} failed:`, err);
});

auctionWorker.on('completed', (job) => {
  console.log(`Auction close job ${job.id} completed`);
});

auctionWorker.on('failed', (job, err) => {
  console.error(`Auction close job ${job?.id} failed:`, err);
});

console.log('Workers started successfully');