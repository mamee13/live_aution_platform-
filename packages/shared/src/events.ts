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
  PERSIST_BID: 'persist_bid',
  START_AUCTION: 'start_auction',
  END_AUCTION: 'end_auction',
} as const;
