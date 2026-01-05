import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';

interface MongoError extends Error {
  code?: number;
  errors?: Record<string, { message: string }>;
}

export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if ((err as MongoError).code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const mongoErr = err as MongoError;
    const message = mongoErr.errors
      ? Object.values(mongoErr.errors).map(val => val.message)
      : ['Validation error'];
    error = new AppError(message.join('. '), 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again!';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired! Please log in again.';
    error = new AppError(message, 401);
  }

  res.status((error as AppError).statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Server Error',
    },
  });
};
