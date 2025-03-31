import { z } from 'zod';

/**
 * Create module schema
 */
export const createModuleSchema = z.object({
  body: z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters long' }).max(255),
    description: z.string().optional(),
    durationInDays: z.number().int().positive(),
    thumbnail: z.string(),
    tags: z.string(),
    isStandaloneCourse: z.boolean().optional().default(false),
    price: z.number().optional().nullable(),
  }),
});

/**
 * Create module request type
 */
export type CreateModuleRequest = z.infer<typeof createModuleSchema>['body'];

/**
 * Update module schema
 */
export const updateModuleSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(3).max(255).optional(),
    description: z.string().optional(),
    durationInDays: z.number().int().positive().optional(),
    order: z.number().int().nonnegative().optional(),
    isStandaloneCourse: z.boolean().optional(),
    price: z.number().optional().nullable(),
  }),
});

/**
 * Update module request type
 */
export type UpdateModuleRequest = z.infer<typeof updateModuleSchema>['body'];
export type UpdateModuleParams = z.infer<typeof updateModuleSchema>['params'];

/**
 * Module ID params schema
 */
export const moduleIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Module ID params type
 */
export type ModuleIdParams = z.infer<typeof moduleIdParamsSchema>['params'];


/**
 * Toggle standalone course schema
 */
export const toggleStandaloneCourseSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    isStandaloneCourse: z.boolean(),
    price: z.number().optional().nullable(),
  }),
});

/**
 * Toggle standalone course request type
 */
export type ToggleStandaloneCourseParams = z.infer<typeof toggleStandaloneCourseSchema>['params'];
export type ToggleStandaloneCourseRequest = z.infer<typeof toggleStandaloneCourseSchema>['body'];

/**
 * Update module order schema
 */
export const updateModuleOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    order: z.number().int().nonnegative(),
  }),
});

/**
 * Update module order request type
 */
export type UpdateModuleOrderParams = z.infer<typeof updateModuleOrderSchema>['params'];
export type UpdateModuleOrderRequest = z.infer<typeof updateModuleOrderSchema>['body'];

/**
 * Get modules query schema
 */
export const getModulesQuerySchema = z.object({
  query: z.object({
    courseId: z.string().uuid().optional(),
    isStandaloneCourse: z.string().optional().transform(val => val === 'true'),
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    search: z.string().optional(),
    sortBy: z.string().optional().default('order'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

/**
 * Get modules query type
 */
export type GetModulesQuery = z.infer<typeof getModulesQuerySchema>['query'];

/**
 * Module response object
 */
export interface ModuleResponse {
  id: string;
  title: string;
  description: string | null;
  durationInDays: number;
  thumbnail: string;
  isStandaloneCourse: boolean;
  price: number | null;
  createdAt: Date;
  updatedAt: Date;
}

