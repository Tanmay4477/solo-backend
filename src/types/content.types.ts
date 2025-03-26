import { z } from 'zod';
import { ContentType } from '@prisma/client';

/**
 * Create content schema
 */
export const createContentSchema = z.object({
  body: z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters long' }).max(255),
    description: z.string().optional(),
    moduleId: z.string().uuid(),
    type: z.nativeEnum(ContentType),
    fileUrl: z.string().url(),
    fileKey: z.string(),
    fileSize: z.number().int().nonnegative().optional(),
    duration: z.number().int().nonnegative().optional(),
    pages: z.number().int().nonnegative().optional(),
    order: z.number().int().nonnegative(),
    metadata: z.record(z.any()).optional(),
  }),
});

/**
 * Create content request type
 */
export type CreateContentRequest = z.infer<typeof createContentSchema>['body'];

/**
 * Update content schema
 */
export const updateContentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(3).max(255).optional(),
    description: z.string().optional(),
    fileUrl: z.string().url().optional(),
    fileKey: z.string().optional(),
    fileSize: z.number().int().nonnegative().optional(),
    duration: z.number().int().nonnegative().optional(),
    pages: z.number().int().nonnegative().optional(),
    order: z.number().int().nonnegative().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

/**
 * Update content request type
 */
export type UpdateContentRequest = z.infer<typeof updateContentSchema>['body'];
export type UpdateContentParams = z.infer<typeof updateContentSchema>['params'];

/**
 * Content ID params schema
 */
export const contentIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Content ID params type
 */
export type ContentIdParams = z.infer<typeof contentIdParamsSchema>['params'];

/**
 * Update content order schema
 */
export const updateContentOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    order: z.number().int().nonnegative(),
  }),
});

/**
 * Update content order request type
 */
export type UpdateContentOrderParams = z.infer<typeof updateContentOrderSchema>['params'];
export type UpdateContentOrderRequest = z.infer<typeof updateContentOrderSchema>['body'];

/**
 * Get contents query schema
 */
export const getContentsQuerySchema = z.object({
  query: z.object({
    moduleId: z.string().uuid().optional(),
    type: z.nativeEnum(ContentType).optional(),
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    search: z.string().optional(),
    sortBy: z.string().optional().default('order'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

/**
 * Get contents query type
 */
export type GetContentsQuery = z.infer<typeof getContentsQuerySchema>['query'];

/**
 * Add video comment schema
 */
export const addVideoCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    comment: z.string().min(1, { message: 'Comment cannot be empty' }),
    timeInSeconds: z.number().int().nonnegative(),
  }),
});

/**
 * Add video comment request type
 */
export type AddVideoCommentParams = z.infer<typeof addVideoCommentSchema>['params'];
export type AddVideoCommentRequest = z.infer<typeof addVideoCommentSchema>['body'];

/**
 * Get video comments schema
 */
export const getVideoCommentsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
  }),
});

/**
 * Get video comments types
 */
export type GetVideoCommentsParams = z.infer<typeof getVideoCommentsSchema>['params'];
export type GetVideoCommentsQuery = z.infer<typeof getVideoCommentsSchema>['query'];

/**
 * Delete video comment schema
 */
export const deleteVideoCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Delete video comment params type
 */
export type DeleteVideoCommentParams = z.infer<typeof deleteVideoCommentSchema>['params'];

/**
 * Content response object
 */
export interface ContentResponse {
  id: string;
  title: string;
  description: string | null;
  type: ContentType;
  fileUrl: string;
  fileKey: string;
  fileSize: number | null;
  duration: number | null;
  pages: number | null;
  order: number;
  moduleId: string;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  module?: {
    id: string;
    title: string;
    courseId: string;
    course: {
      id: string;
      title: string;
    };
  };
}

/**
 * Video comment response
 */
export interface VideoCommentResponse {
  id: string;
  userId: string;
  contentId: string;
  timeInSeconds: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
}