import { Router } from 'express';

export const itemRoutes = Router();

itemRoutes.get('/', (req, res) => {
  // TODO: Implement get items logic
  res.json({ message: 'Get items endpoint' });
});

itemRoutes.post('/', (req, res) => {
  // TODO: Implement create item logic
  res.json({ message: 'Create item endpoint' });
});

itemRoutes.get('/:id', (req, res) => {
  // TODO: Implement get item by id logic
  res.json({ message: `Get item ${req.params.id} endpoint` });
});