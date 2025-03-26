import { z } from 'zod';
import { UserRole, UserStatus } from '@prisma/client';

/**
 * Update user profile schema
 */
export const updateUserProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    bio: z.string().max(500).optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
  }),
});

/**
 * Update user profile request type
 */
export type UpdateUserProfileRequest = z.infer<typeof updateUserProfileSchema>['body'];

/**
 * User update schema (admin)
 */
export const adminUpdateUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(UserStatus).optional(),
    bio: z.string().max(500).optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    isVerified: z.boolean().optional(),
  }),
});

/**
 * Admin update user request type
 */
export type AdminUpdateUserRequest = z.infer<typeof adminUpdateUserSchema>['body'];

/**
 * Update user status schema
 */
export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(UserStatus),
  }),
});

/**
 * Update user status request type
 */
export type UpdateUserStatusRequest = z.infer<typeof updateUserStatusSchema>['body'];

/**
 * Get users query schema
 */
export const getUsersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(UserStatus).optional(),
    search: z.string().optional(),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

/**
 * Get users query type
 */
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>['query'];

/**
 * User response object
 */
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  profileImage?: string | null;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
  isVerified: boolean;
  lastLogin?: Date | null;
  createdAt: Date;
}

/**
 * User profile response object
 */
export interface UserProfileResponse extends UserResponse {
  enrollments?: {
    id: string;
    courseId: string;
    courseName: string;
    enrollmentDate: Date;
    expiryDate: Date;
    isActive: boolean;
  }[];
  certificates?: {
    id: string;
    title: string;
    issuedAt: Date;
    courseId: string;
    moduleName?: string;
  }[];
}

/**
 * Block user schema
 */
export const blockUserSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Block user request params
 */
export type BlockUserParams = z.infer<typeof blockUserSchema>['params'];