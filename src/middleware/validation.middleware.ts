import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from './error.middleware';

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