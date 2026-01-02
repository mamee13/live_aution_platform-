export const SocketEvents = {
  // Client to server
  JOIN_AUCTION: 'join-auction',
  LEAVE_AUCTION: 'leave-auction',
  PLACE_BID: 'place-bid',

  // Server to client
  NEW_BID: 'new-bid',
  BID_ERROR: 'bid-error',
  AUCTION_ENDED: 'auction-ended',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
} as const;

export const JobTypes = {
  PERSIST_BID: 'bid_persist',
  CLOSE_AUCTION: 'auction_close',
} as const;
