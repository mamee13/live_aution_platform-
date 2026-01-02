import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp } from './app';
import { initializeSocket } from './sockets';
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
