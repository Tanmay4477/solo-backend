import { z } from 'zod';

/**
 * Create course schema
 */
export const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters long' }).max(255),
    description: z.string().min(10, { message: 'Description must be at least 10 characters long' }),
    thumbnail: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isPublished: z.boolean().optional().default(false),
    instructorIds: z.array(z.string().uuid()).optional(),
  }),
});

/**
 * Create course request type
 */
export type CreateCourseRequest = z.infer<typeof createCourseSchema>['body'];

/**
 * Update course schema
 */
export const updateCourseSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(3).max(255).optional(),
    description: z.string().min(10).optional(),
    thumbnail: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isPublished: z.boolean().optional(),
  }),
});

/**
 * Update course request type
 */
export type UpdateCourseRequest = z.infer<typeof updateCourseSchema>['body'];
export type UpdateCourseParams = z.infer<typeof updateCourseSchema>['params'];

/**
 * Get courses query schema
 */
export const getCoursesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    search: z.string().optional(),
    isPublished: z.string().optional().transform(val => val === 'true'),
    tags: z.string().optional().transform(val => val ? val.split(',') : undefined),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

/**
 * Get courses query type
 */
export type GetCoursesQuery = z.infer<typeof getCoursesQuerySchema>['query'];

/**
 * Course ID params schema
 */
export const courseIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Course ID params type
 */
export type CourseIdParams = z.infer<typeof courseIdParamsSchema>['params'];

/**
 * Publish course schema
 */
export const publishCourseSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    isPublished: z.boolean(),
  }),
});

/**
 * Publish course request type
 */
export type PublishCourseParams = z.infer<typeof publishCourseSchema>['params'];
export type PublishCourseRequest = z.infer<typeof publishCourseSchema>['body'];

/**
 * Add instructor to course schema
 */
export const addInstructorSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    userId: z.string().uuid(),
  }),
});

/**
 * Add instructor to course request type
 */
export type AddInstructorParams = z.infer<typeof addInstructorSchema>['params'];
export type AddInstructorRequest = z.infer<typeof addInstructorSchema>['body'];

/**
 * Remove instructor from course schema
 */
export const removeInstructorSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  }),
});

/**
 * Remove instructor from course params type
 */
export type RemoveInstructorParams = z.infer<typeof removeInstructorSchema>['params'];

/**
 * Course response object
 */
export interface CourseResponse {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  tags: string[];
  createdAt: Date;
  instructors: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  }[];
  _count?: {
    modules: number;
    enrollments: number;
  };
}

/**
 * Detailed course response object
 */
export interface DetailedCourseResponse extends CourseResponse {
  modules: {
    id: string;
    title: string;
    description: string | null;
    durationInDays: number;
    status: string;
    order: number;
    isStandaloneCourse: boolean;
    price: number | null;
    _count: {
      contents: number;
      quizzes: number;
    };
  }[];
}