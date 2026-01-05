# Error Handling Utilities

This directory contains utilities for consistent error handling across the API.

## AppError Class

A custom error class that extends the native Error class with additional properties:

```typescript
import { AppError } from '../utils';

// Create a new error
throw new AppError('User not found', 404);
```

Properties:

- `message`: Error message
- `statusCode`: HTTP status code
- `isOperational`: Always true (distinguishes operational errors from programming errors)

## catchAsync Function

A wrapper function that eliminates the need for try-catch blocks in async route handlers:

```typescript
import { catchAsync } from '../utils';

// Instead of this:
router.get('/users', async (req, res, next) => {
  try {
    const users = await getUsersFromDB();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Use this:
router.get(
  '/users',
  catchAsync(async (req, res, next) => {
    const users = await getUsersFromDB();
    res.json(users);
  })
);
```

## Global Error Handler

Automatically handles all errors and sends consistent error responses:

```typescript
// Errors are automatically caught and formatted as:
{
  "success": false,
  "error": {
    "message": "Error message here"
  }
}
```

## Usage Example

```typescript
import { Router } from 'express';
import { catchAsync, AppError } from '../utils';

const router = Router();

router.post(
  '/users',
  catchAsync(async (req, res, next) => {
    const { email, name } = req.body;

    if (!email || !name) {
      return next(new AppError('Email and name are required', 400));
    }

    const user = await createUser({ email, name });

    res.status(201).json({
      success: true,
      data: user,
    });
  })
);
```
