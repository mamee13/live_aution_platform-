import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp } from './app';
import { initializeSocket } from './sockets';
import { queueService } from './services/queueService';
import { env } from './config/env';

const app = createApp();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

initializeSocket(io);

const PORT = env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully...`);

  try {
    // Close server
    server.close(() => {
      console.log('HTTP server closed');
    });

    // Close Socket.io
    io.close(() => {
      console.log('Socket.io server closed');
    });

    // Close queue connections
    await queueService.close();
    console.log('Queue connections closed');

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
