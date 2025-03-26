import { z } from 'zod';

/**
 * Create tag schema
 */
export const createTagSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, {
      message: 'Slug must contain only lowercase letters, numbers, and hyphens',
    }),
    description: z.string().optional(),
    isSuper: z.boolean().default(false),
    parentTagId: z.string().uuid().optional().nullable(),
    order: z.number().int().nonnegative().default(0),
  }),
});

/**
 * Create tag request type
 */
export type CreateTagRequest = z.infer<typeof createTagSchema>['body'];

/**
 * Update tag schema
 */
export const updateTagSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, {
      message: 'Slug must contain only lowercase letters, numbers, and hyphens',
    }).optional(),
    description: z.string().optional(),
    isSuper: z.boolean().optional(),
    parentTagId: z.string().uuid().optional().nullable(),
    order: z.number().int().nonnegative().optional(),
  }),
});

/**
 * Update tag request type
 */
export type UpdateTagParams = z.infer<typeof updateTagSchema>['params'];
export type UpdateTagRequest = z.infer<typeof updateTagSchema>['body'];

/**
 * Tag ID params schema
 */
export const tagIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Tag ID params type
 */
export type TagIdParams = z.infer<typeof tagIdParamsSchema>['params'];

/**
 * Get tags query schema
 */
export const getTagsQuerySchema = z.object({
  query: z.object({
    isSuper: z.string().optional().transform(val => val === 'true'),
    parentTagId: z.string().uuid().optional(),
    search: z.string().optional(),
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
    sortBy: z.string().optional().default('order'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

/**
 * Get tags query type
 */
export type GetTagsQuery = z.infer<typeof getTagsQuerySchema>['query'];

/**
 * Create post schema
 */
export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(255),
    content: z.string().min(10),
    tagIds: z.array(z.string().uuid()).min(1, { message: 'At least one tag is required' }),
    attachments: z
      .array(
        z.object({
          type: z.enum(['image', 'video', 'link']),
          url: z.string().url(),
          key: z.string().optional(),
          previewUrl: z.string().url().optional(),
        })
      )
      .optional(),
  }),
});

/**
 * Create post request type
 */
export type CreatePostRequest = z.infer<typeof createPostSchema>['body'];

/**
 * Update post schema
 */
export const updatePostSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(3).max(255).optional(),
    content: z.string().min(10).optional(),
    tagIds: z.array(z.string().uuid()).min(1).optional(),
    attachments: z
      .array(
        z.object({
          type: z.enum(['image', 'video', 'link']),
          url: z.string().url(),
          key: z.string().optional(),
          previewUrl: z.string().url().optional(),
        })
      )
      .optional(),
  }),
});

/**
 * Update post request type
 */
export type UpdatePostParams = z.infer<typeof updatePostSchema>['params'];
export type UpdatePostRequest = z.infer<typeof updatePostSchema>['body'];

/**
 * Post ID params schema
 */
export const postIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Post ID params type
 */
export type PostIdParams = z.infer<typeof postIdParamsSchema>['params'];

/**
 * Pin post schema
 */
export const pinPostSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    isPinned: z.boolean(),
  }),
});

/**
 * Pin post request type
 */
export type PinPostParams = z.infer<typeof pinPostSchema>['params'];
export type PinPostRequest = z.infer<typeof pinPostSchema>['body'];

/**
 * Report post schema
 */
export const reportPostSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    reason: z.string().min(3),
  }),
});

/**
 * Report post request type
 */
export type ReportPostParams = z.infer<typeof reportPostSchema>['params'];
export type ReportPostRequest = z.infer<typeof reportPostSchema>['body'];

/**
 * Get posts query schema
 */
export const getPostsQuerySchema = z.object({
  query: z.object({
    tagId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    isPinned: z.string().optional().transform(val => val === 'true'),
    isReported: z.string().optional().transform(val => val === 'true'),
    search: z.string().optional(),
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

/**
 * Get posts query type
 */
export type GetPostsQuery = z.infer<typeof getPostsQuerySchema>['query'];

/**
 * Create comment schema
 */
export const createCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid(), // Post ID
  }),
  body: z.object({
    content: z.string().min(1, { message: 'Comment cannot be empty' }),
    parentCommentId: z.string().uuid().optional(),
  }),
});

/**
 * Create comment request type
 */
export type CreateCommentParams = z.infer<typeof createCommentSchema>['params'];
export type CreateCommentRequest = z.infer<typeof createCommentSchema>['body'];

/**
 * Update comment schema
 */
export const updateCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid(), // Comment ID
  }),
  body: z.object({
    content: z.string().min(1, { message: 'Comment cannot be empty' }),
  }),
});

/**
 * Update comment request type
 */
export type UpdateCommentParams = z.infer<typeof updateCommentSchema>['params'];
export type UpdateCommentRequest = z.infer<typeof updateCommentSchema>['body'];

/**
 * Comment ID params schema
 */
export const commentIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Comment ID params type
 */
export type CommentIdParams = z.infer<typeof commentIdParamsSchema>['params'];

/**
 * Report comment schema
 */
export const reportCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    reason: z.string().min(3),
  }),
});

/**
 * Report comment request type
 */
export type ReportCommentParams = z.infer<typeof reportCommentSchema>['params'];
export type ReportCommentRequest = z.infer<typeof reportCommentSchema>['body'];

/**
 * Get comments query schema
 */
export const getCommentsQuerySchema = z.object({
  params: z.object({
    id: z.string().uuid(), // Post ID
  }),
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

/**
 * Get comments query type
 */
export type GetCommentsParams = z.infer<typeof getCommentsQuerySchema>['params'];
export type GetCommentsQuery = z.infer<typeof getCommentsQuerySchema>['query'];

/**
 * Tag response object
 */
export interface TagResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSuper: boolean;
  parentTagId: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  parentTag?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count?: {
    childTags: number;
    posts: number;
  };
}

/**
 * Post response object
 */
export interface PostResponse {
  id: string;
  userId: string;
  title: string;
  content: string;
  isPinned: boolean;
  views: number;
  isReported: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
  tags: {
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  attachments: {
    id: string;
    type: string;
    url: string;
    previewUrl: string | null;
  }[];
  _count?: {
    comments: number;
    likes: number;
  };
}

/**
 * Detailed post response object
 */
export interface DetailedPostResponse extends PostResponse {
  comments?: CommentResponse[];
}

/**
 * Comment response object
 */
export interface CommentResponse {
  id: string;
  userId: string;
  postId: string;
  parentCommentId: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
  _count?: {
    replies: number;
    likes: number;
  };
}