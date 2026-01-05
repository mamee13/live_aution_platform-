# BullMQ Integration Migration Guide

## Overview

This project has been successfully migrated from a simple Redis-based job queue to BullMQ for better reliability, monitoring, and scalability.

## What Changed

### Architecture

- **API App**: Now only enqueues jobs, never processes them
- **Worker App**: Owns all job processors using BullMQ Workers
- **Shared Package**: Contains BullMQ configuration and job data types

### Queue Structure

- `bid_persist`: Handles bid persistence jobs
- `auction_lifecycle`: Handles auction start/end jobs

### Key Features Added

- **Retries**: Exponential backoff with 3 attempts
- **Idempotency**: Jobs use unique IDs to prevent duplicates
- **Graceful Shutdown**: Both API and Worker handle SIGINT/SIGTERM
- **Job Monitoring**: Built-in job completion/failure tracking
- **Concurrency Control**: Configurable concurrent job processing

## Installation

```bash
# Install dependencies
npm install

# Build shared package
cd packages/shared && npm run build

# Install BullMQ in API and Worker
cd apps/api && npm install
cd apps/worker && npm install
```

## Environment Variables

Add to your `.env` file:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Usage Examples

### Enqueueing Jobs (API)

```typescript
import { queueService } from './services/queueService';

// Persist a bid
await queueService.enqueueBidPersist({
  auctionId: 'auction-123',
  userId: 'user-456',
  amount: 100,
  timestamp: new Date(),
  bidId: 'bid-789',
});

// Schedule auction start
await queueService.scheduleAuctionStart({
  auctionId: 'auction-123',
  startTime: new Date('2024-01-01T10:00:00Z'),
});

// Schedule auction end
await queueService.scheduleAuctionEnd({
  auctionId: 'auction-123',
  endTime: new Date('2024-01-01T18:00:00Z'),
});
```

### Processing Jobs (Worker)

Jobs are automatically processed by the BullMQ workers. The worker app handles:

- **Bid Persistence**: Saves bids to PostgreSQL with idempotency
- **Auction Start**: Updates auction status to 'active'
- **Auction End**: Closes auctions and determines winners

## Monitoring

BullMQ provides excellent monitoring capabilities:

- Job completion/failure rates
- Queue lengths and processing times
- Failed job inspection and retry
- Worker health monitoring

Consider adding BullMQ Dashboard for visual monitoring:

```bash
npm install @bull-board/api @bull-board/express
```

## Migration Notes

### Removed

- Simple Redis polling mechanism
- Manual job scheduling with sorted sets
- Basic retry logic

### Added

- BullMQ Workers with proper error handling
- Job idempotency using unique IDs
- Exponential backoff retry strategy
- Graceful shutdown handling
- TypeScript-safe job data types

## Production Considerations

1. **Redis Configuration**: Ensure Redis persistence is enabled
2. **Worker Scaling**: Run multiple worker instances for high availability
3. **Monitoring**: Set up alerts for failed jobs and queue backlogs
4. **Resource Limits**: Configure appropriate concurrency limits
5. **Job Retention**: Adjust `removeOnComplete` and `removeOnFail` settings

## Rollback Plan

If needed, the old job processing logic is preserved in:

- `apps/worker/src/jobs/persistBid.job.ts`
- `apps/worker/src/jobs/closeAuction.job.ts`

These can be reactivated by reverting the worker's `index.ts` file.
