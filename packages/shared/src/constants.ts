export const AUCTION_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CLOSED: 'closed'
} as const;

export const BID_INCREMENT = 1; // Minimum bid increment

export const REDIS_TTL = {
  SESSION: 24 * 60 * 60, // 24 hours
  BID_HISTORY: 7 * 24 * 60 * 60 // 7 days
} as const;

export const QUEUE_NAMES = {
  BID_PERSIST: 'bid-persist',
  AUCTION_CLOSE: 'auction-close'
} as const;