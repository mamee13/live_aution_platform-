import { Socket, Server } from 'socket.io';
import { bidService } from '../services/bid.service';
import { queueService } from '../services/queue.service';

export const setupAuctionSocket = (socket: Socket, io: Server) => {
  socket.on('join-auction', (auctionId: string) => {
    socket.join(`auction-${auctionId}`);
    console.log(`User ${socket.id} joined auction ${auctionId}`);
  });

  socket.on('leave-auction', (auctionId: string) => {
    socket.leave(`auction-${auctionId}`);
    console.log(`User ${socket.id} left auction ${auctionId}`);
  });

  socket.on('place-bid', async (data: { auctionId: string; amount: number; userId: string }) => {
    try {
      const result = await bidService.placeBid(data.auctionId, data.userId, data.amount);

      if (result.success) {
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
      } else {
        socket.emit('bid-error', { message: result.error });
      }
    } catch (error) {
      socket.emit('bid-error', { message: 'Failed to place bid' });
    }
  });
};
