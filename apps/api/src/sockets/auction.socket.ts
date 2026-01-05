import { Socket, Server } from 'socket.io';
import { bidService } from '../services/bid.service';
import { queueService } from '../services/queue.service';
import { AppError } from '../utils';

export const setupAuctionSocket = (socket: Socket, io: Server) => {
  socket.on('join-auction', (auctionId: string) => {
    try {
      if (!auctionId) {
        socket.emit('error', { message: 'Auction ID is required' });
        return;
      }

      socket.join(`auction-${auctionId}`);
      console.log(`User ${socket.id} joined auction ${auctionId}`);
    } catch (error) {
      console.error('Error joining auction:', error);
      socket.emit('error', { message: 'Failed to join auction' });
    }
  });

  socket.on('leave-auction', (auctionId: string) => {
    try {
      if (!auctionId) {
        socket.emit('error', { message: 'Auction ID is required' });
        return;
      }

      socket.leave(`auction-${auctionId}`);
      console.log(`User ${socket.id} left auction ${auctionId}`);
    } catch (error) {
      console.error('Error leaving auction:', error);
      socket.emit('error', { message: 'Failed to leave auction' });
    }
  });

  socket.on('place-bid', async (data: { auctionId: string; amount: number; userId: string }) => {
    try {
      // Validate input data
      if (!data.auctionId || !data.amount || !data.userId) {
        socket.emit('bid-error', { message: 'Auction ID, amount, and user ID are required' });
        return;
      }

      if (typeof data.amount !== 'number' || data.amount <= 0) {
        socket.emit('bid-error', { message: 'Amount must be a positive number' });
        return;
      }

      const result = await bidService.placeBid(data.auctionId, data.userId, data.amount);

      // Broadcast new bid to all users in the auction room
      io.to(`auction-${data.auctionId}`).emit('new-bid', {
        auctionId: data.auctionId,
        amount: data.amount,
        userId: data.userId,
        timestamp: new Date(),
      });

      // Queue job to persist bid to database
      await queueService.addBidPersistJob({
        auctionId: data.auctionId,
        userId: data.userId,
        amount: data.amount,
        timestamp: Date.now(),
      });

      socket.emit('bid-success', { message: 'Bid placed successfully' });
    } catch (error) {
      console.error('Error placing bid:', error);

      if (error instanceof AppError) {
        socket.emit('bid-error', { message: error.message });
      } else {
        socket.emit('bid-error', { message: 'Failed to place bid' });
      }
    }
  });
};
