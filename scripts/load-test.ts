import { io, Socket } from 'socket.io-client';

interface LoadTestConfig {
  serverUrl: string;
  numClients: number;
  auctionId: string;
  bidInterval: number; // ms
  testDuration: number; // ms
}

class LoadTester {
  private clients: Socket[] = [];
  private config: LoadTestConfig;
  private bidCount = 0;
  private errors = 0;

  constructor(config: LoadTestConfig) {
    this.config = config;
  }

  async start() {
    console.log(`Starting load test with ${this.config.numClients} clients`);
    
    // Create clients
    for (let i = 0; i < this.config.numClients; i++) {
      const client = io(this.config.serverUrl);
      this.clients.push(client);
      
      client.on('connect', () => {
        client.emit('join-auction', this.config.auctionId);
      });

      client.on('new-bid', () => {
        this.bidCount++;
      });

      client.on('bid-error', () => {
        this.errors++;
      });
    }

    // Start bidding
    const bidInterval = setInterval(() => {
      const randomClient = this.clients[Math.floor(Math.random() * this.clients.length)];
      const bidAmount = Math.floor(Math.random() * 1000) + 100;
      
      randomClient.emit('place-bid', {
        auctionId: this.config.auctionId,
        amount: bidAmount,
        userId: `user-${Math.floor(Math.random() * 100)}`
      });
    }, this.config.bidInterval);

    // Stop after test duration
    setTimeout(() => {
      clearInterval(bidInterval);
      this.stop();
    }, this.config.testDuration);
  }

  stop() {
    console.log(`Load test completed:`);
    console.log(`- Successful bids: ${this.bidCount}`);
    console.log(`- Errors: ${this.errors}`);
    console.log(`- Clients: ${this.clients.length}`);
    
    this.clients.forEach(client => client.disconnect());
  }
}

// Run load test
const config: LoadTestConfig = {
  serverUrl: 'http://localhost:3000',
  numClients: 50,
  auctionId: 'test-auction-id',
  bidInterval: 100, // 100ms between bids
  testDuration: 30000 // 30 seconds
};

const tester = new LoadTester(config);
tester.start();