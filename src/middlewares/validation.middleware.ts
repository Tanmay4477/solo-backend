import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from './error.middleware';

/**
 * Request validation middleware using Zod schemas
 * @param schema - The Zod schema to validate against
 */
export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message
        }));
        next(new ApiError('Validation error', 400, errors));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Clean request body middleware
 * Removes any undefined, null, or empty string values from the request body
 */
export const cleanRequestBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (req.body[key] === undefined || req.body[key] === null || req.body[key] === '') {
        delete req.body[key];
      }
    }
  }
  next();
};

/**
 * Sanitize query parameters middleware
 * Converts common query parameters to their appropriate types
 * Note: Express query parameters are always strings, we're just modifying their values
 */
export const sanitizeQueryParams = (req: Request, res: Response, next: NextFunction) => {
  // Handle pagination parameters
  if (req.query.page) {
    req.query.page = String(Math.max(1, parseInt(String(req.query.page), 10) || 1));
  }
  
  if (req.query.limit) {
    req.query.limit = String(Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 10)));
  }
  
  // Handle boolean parameters - keep as strings but normalize to 'true' or 'false'
  const booleanParams = ['isActive', 'isPublished', 'isPinned', 'isReported', 'isVerified'];
  booleanParams.forEach(param => {
    if (req.query[param] !== undefined) {
      // Convert to the string 'true' or 'false'
      req.query[param] = String(req.query[param]).toLowerCase() === 'true' ? 'true' : 'false';
    }
  });
  
  // Handle sort parameters
  if (req.query.sortOrder && !['asc', 'desc'].includes(String(req.query.sortOrder).toLowerCase())) {
    req.query.sortOrder = 'desc';
  }
  
  next();
};

/**
 * Query parameters for ID validation middleware
 * Validates that IDs in query parameters are valid UUIDs
 */
export const validateIdParam = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    if (!id) {
      return next(new ApiError(`${paramName} parameter is required`, 400));
    }
    
    // Simple UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return next(new ApiError(`Invalid ${paramName} format`, 400));
    }
    
    next();
  };
};

/**
 * Validate search query middleware
 * Ensures search queries meet minimum length requirements
 */
export const validateSearchQuery = (
  minLength: number = 3,
  queryParam: string = 'search'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const searchQuery = req.query[queryParam];
    
    if (searchQuery && typeof searchQuery === 'string' && searchQuery.length < minLength) {
      return next(
        new ApiError(
          `Search query must be at least ${minLength} characters long`,
          400
        )
      );
    }
    
    next();
  };
};

/**
 * Trim string fields middleware
 * Trims whitespace from string fields in the request body
 */
export const trimStringFields = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    }
  }
  
  next();
};

/**
 * Transform request body middleware
 * Applies transformations to request body fields
 * @param transformations - Object mapping field names to transformation functions
 */
export const transformRequestBody = (
  transformations: Record<string, (value: any) => any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
      for (const key in transformations) {
        if (req.body[key] !== undefined) {
          req.body[key] = transformations[key](req.body[key]);
        }
      }
    }
    
    next();
  };
};