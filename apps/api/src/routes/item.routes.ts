import { Router } from 'express';

export const itemRoutes = Router();

itemRoutes.get('/', (_req, res) => {
  // TODO: Implement get items logic
  res.json({ message: 'Get items endpoint' });
});

itemRoutes.post('/', (_req, res) => {
  // TODO: Implement create item logic
  res.json({ message: 'Create item endpoint' });
});

itemRoutes.get('/:id', (req, res) => {
  // TODO: Implement get item by id logic
  res.json({ message: `Get item ${req.params.id} endpoint` });
});
