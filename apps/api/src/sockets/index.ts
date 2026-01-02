import { Server } from 'socket.io';
import { setupAuctionSocket } from './auction.socket';

export const initializeSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    setupAuctionSocket(socket, io);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};