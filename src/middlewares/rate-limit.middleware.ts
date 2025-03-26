import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import ApiResponse from '../utils/apiResponse';
import config from '../config';

/**
 * Default rate limit configuration
 */
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX_REQUESTS = 100; // 100 requests per window
const DEFAULT_MESSAGE = 'Too many requests, please try again later.';

/**
 * Base rate limiter factory
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} max - Maximum number of requests in the time window
 * @param {string} message - Error message
 * @returns {rateLimit.RateLimit} Rate limit middleware
 */
export const createRateLimiter = (
  windowMs: number = DEFAULT_WINDOW_MS,
  max: number = DEFAULT_MAX_REQUESTS,
  message: string = DEFAULT_MESSAGE
) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      return ApiResponse.error(res, message, 429);
    },
    skip: (req: Request) => {
      // Skip rate limiting in test environment
      return config.env === 'test';
    },
  });
};

/**
 * Auth rate limiter for login and registration
 * Stricter limits to prevent brute force attacks
 */
export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per window
  'Too many authentication attempts, please try again later.'
);

/**
 * API rate limiter for general API endpoints
 */
export const apiRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  60, // 60 requests per minute
  'Too many requests, please try again later.'
);

/**
 * Upload rate limiter for file uploads
 */
export const uploadRateLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // 10 uploads per hour
  'Too many file uploads, please try again later.'
);

/**
 * Password reset rate limiter
 */
export const passwordResetRateLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // 3 requests per hour
  'Too many password reset attempts, please try again later.'
);

/**
 * Service creation rate limiter
 */
export const serviceCreationRateLimiter = createRateLimiter(
  24 * 60 * 60 * 1000, // 24 hours
  10, // 10 services per day
  'You have reached the maximum number of services you can create today.'
);

/**
 * Post creation rate limiter
 */
export const postCreationRateLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // 10 posts per hour
  'You have reached the maximum number of posts you can create in an hour.'
);

/**
 * Comment creation rate limiter
 */
export const commentRateLimiter = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  20, // 20 comments per 5 minutes
  'You are commenting too quickly, please slow down.'
);

/**
 * IP-based rate limiter that can be used to prevent abuse from specific IPs
 */
export const ipRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  30, // 30 requests per minute per IP
  'Too many requests from this IP, please try again later.'
);