import { Router } from 'express';
import { auctionService } from '../services/auction.service';

export const auctionRoutes = Router();

auctionRoutes.get('/', async (req, res) => {
  try {
    const auctions = await auctionService.getActiveAuctions();
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

auctionRoutes.get('/:id', async (req, res) => {
  try {
    const auction = await auctionService.getAuctionById(req.params.id);
    res.json(auction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch auction' });
  }
});

auctionRoutes.post('/:id/bid', async (req, res) => {
  try {
    const { amount, userId } = req.body;
    const result = await auctionService.placeBid(req.params.id, userId, amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to place bid' });
  }
});