/**
 * Common types used across the application
 */

import { Request } from 'express';
import { User } from '@prisma/client';

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Sort options
 */
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Filter options
 */
export type FilterOptions = Record<string, any>;

/**
 * Request with authenticated user
 */
export interface AuthRequest extends Request {
  user: User;
}

/**
 * API Error response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: any;
}

/**
 * API Success response
 */
export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  key: string;
  url: string;
  fileSize?: number;
  mimeType?: string;
}