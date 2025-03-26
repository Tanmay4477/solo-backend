import { PaginationOptions, PaginatedResponse } from '../types/common.types';

/**
 * Default pagination options
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

/**
 * Normalize pagination options
 * @param {object} options - Pagination options from request
 * @returns {PaginationOptions} Normalized pagination options
 */
export const normalizePaginationOptions = (options: {
  page?: number;
  limit?: number;
}): PaginationOptions => {
  const page = options.page && options.page > 0 ? Math.floor(options.page) : DEFAULT_PAGE;
  let limit = options.limit && options.limit > 0 ? Math.floor(options.limit) : DEFAULT_LIMIT;
  
  // Cap the limit to avoid performance issues
  limit = Math.min(limit, MAX_LIMIT);
  
  return { page, limit };
};

/**
 * Calculate pagination values for Prisma
 * @param {PaginationOptions} options - Pagination options
 * @returns {object} Prisma pagination values (skip and take)
 */
export const getPrismaSkipTake = (options: PaginationOptions): {
  skip: number;
  take: number;
} => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;
  return { skip, take: limit };
};

/**
 * Create a paginated response
 * @param {T[]} data - Array of data items
 * @param {number} total - Total count of items (without pagination)
 * @param {PaginationOptions} options - Pagination options used
 * @returns {PaginatedResponse<T>} Paginated response object
 */
export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  options: PaginationOptions
): PaginatedResponse<T> => {
  const { page, limit } = options;
  const pages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages,
    },
  };
};