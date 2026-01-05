import { redis } from './config/redis';
import { db } from './config/db';
import { BullMQWorker } from './worker';

class WorkerApp {
  private bullMQWorker: BullMQWorker;

  constructor() {
    this.bullMQWorker = new BullMQWorker();
  }

  async start() {
    await this.bullMQWorker.start();
    console.log('Worker application started successfully');
  }

  async stop() {
    console.log('Shutting down worker application...');
    await this.bullMQWorker.stop();
    await redis.disconnect();
    await db.end();
    console.log('Worker application stopped');
  }
}

// Start the worker
const workerApp = new WorkerApp();

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  try {
    await workerApp.stop();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('unhandledRejection');
});

workerApp.start().catch(error => {
  console.error('Failed to start worker application:', error);
  process.exit(1);
});
