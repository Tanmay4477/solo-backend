import { z } from 'zod';
import { ModuleStatus } from '@prisma/client';

/**
 * Create module schema
 */
export const createModuleSchema = z.object({
  body: z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters long' }).max(255),
    description: z.string().optional(),
    courseId: z.string().uuid(),
    durationInDays: z.number().int().positive(),
    order: z.number().int().nonnegative(),
    isStandaloneCourse: z.boolean().optional().default(false),
    price: z.number().optional().nullable(),
    status: z.nativeEnum(ModuleStatus).optional().default(ModuleStatus.DRAFT),
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
    status: z.nativeEnum(ModuleStatus).optional(),
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
 * Update module status schema
 */
export const updateModuleStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.nativeEnum(ModuleStatus),
  }),
});

/**
 * Update module status request type
 */
export type UpdateModuleStatusParams = z.infer<typeof updateModuleStatusSchema>['params'];
export type UpdateModuleStatusRequest = z.infer<typeof updateModuleStatusSchema>['body'];

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
    status: z.nativeEnum(ModuleStatus).optional(),
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
  status: ModuleStatus;
  order: number;
  isStandaloneCourse: boolean;
  price: number | null;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
  course?: {
    id: string;
    title: string;
  };
  _count?: {
    contents: number;
    quizzes: number;
  };
}

/**
 * Detailed module response object
 */
export interface DetailedModuleResponse extends ModuleResponse {
  contents: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    order: number;
    fileUrl: string;
    duration: number | null;
    pages: number | null;
  }[];
  quizzes: {
    id: string;
    title: string;
    description: string | null;
    passingScore: number;
    timeLimit: number | null;
    _count: {
      questions: number;
    };
  }[];
}