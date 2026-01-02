export interface Auction {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  currentBid: number;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'active' | 'closed';
  winnerId?: string;
  itemId: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  timestamp: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  category: string;
}