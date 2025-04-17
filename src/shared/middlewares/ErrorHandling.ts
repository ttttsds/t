// src/shared/middlewares/errorHandling.ts
import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error values
  let statusCode = 500;
  let message = 'Something went wrong';
  let stack = undefined;
  
  // Handle custom ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  
  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    stack = err.stack;
  }
  
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(stack && { stack })
  });
};