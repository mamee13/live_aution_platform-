export const RedisKeys = {
  // Auction keys
  auctionCurrentBid: (auctionId: string) => `auction:${auctionId}:current_bid`,
  auctionHighestBidder: (auctionId: string) => `auction:${auctionId}:highest_bidder`,
  auctionBidCount: (auctionId: string) => `auction:${auctionId}:bid_count`,
  auctionBidHistory: (auctionId: string) => `auction:${auctionId}:bid_history`,
  
  // User keys
  userActiveBids: (userId: string) => `user:${userId}:active_bids`,
  
  // Session keys
  userSession: (sessionId: string) => `session:${sessionId}`,
  
  // Job queues
  bidPersistQueue: 'queue:bid_persist',
  auctionCloseQueue: 'queue:auction_close'
};