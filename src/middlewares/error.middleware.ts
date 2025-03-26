import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import ApiResponse from '../utils/apiResponse';
import logger from '../utils/logger';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  errors: any;

  constructor(message: string, statusCode: number = 500, errors: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found middleware
 * Handles 404 errors for routes that don't exist
 */
export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Error handling middleware
 * Handles all errors in the application
 */
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return ApiResponse.error(
        res,
        'Duplicate value for a unique field',
        409,
        { field: err.meta?.target }
      );
    }
    if (err.code === 'P2025') {
      return ApiResponse.error(res, 'Record not found', 404);
    }
    if (err.code === 'P2003') {
      return ApiResponse.error(res, 'Foreign key constraint failed', 400);
    }
    if (err.code === 'P2016') {
      return ApiResponse.error(res, 'Record not found or no permissions', 404);
    }
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return ApiResponse.error(res, 'Validation error', 400, err);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Token expired', 401);
  }

  // Log unexpected errors
  logger.error(`Unhandled error: ${err.message}`);
  logger.error(err.stack);

  // Default error response
  return ApiResponse.error(
    res,
    process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    500
  );
};