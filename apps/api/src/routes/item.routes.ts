import { Router } from 'express';
import { catchAsync, AppError } from '../utils';

export const itemRoutes = Router();

itemRoutes.get(
  '/',
  catchAsync(async (_req, res, next) => {
    // TODO: Implement get items logic
    res.json({
      success: true,
      message: 'Get items endpoint',
      data: [],
    });
  })
);

itemRoutes.post(
  '/',
  catchAsync(async (req, res, next) => {
    const { name, description, startingPrice } = req.body;

    if (!name || !description || !startingPrice) {
      return next(new AppError('Name, description, and starting price are required', 400));
    }

    if (typeof startingPrice !== 'number' || startingPrice <= 0) {
      return next(new AppError('Starting price must be a positive number', 400));
    }

    // TODO: Implement create item logic
    res.status(201).json({
      success: true,
      message: 'Create item endpoint',
      data: { name, description, startingPrice },
    });
  })
);

itemRoutes.get(
  '/:id',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      return next(new AppError('Item ID is required', 400));
    }

    // TODO: Implement get item by id logic
    res.json({
      success: true,
      message: `Get item ${id} endpoint`,
      data: { id },
    });
  })
);
