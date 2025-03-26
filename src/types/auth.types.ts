import { z } from 'zod';
import { UserRole } from '@prisma/client';

/**
 * Registration request schema
 */
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .max(100)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      }),
    confirmPassword: z.string(),
    firstName: z.string().min(1, { message: 'First name is required' }).max(100),
    lastName: z.string().min(1, { message: 'Last name is required' }).max(100),
    phone: z.string().optional(),
    location: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

/**
 * Registration request type
 */
export type RegisterRequest = z.infer<typeof registerSchema>['body'];

/**
 * Login request schema
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(1, { message: 'Password is required' }),
  }),
});

/**
 * Login request type
 */
export type LoginRequest = z.infer<typeof loginSchema>['body'];

/**
 * Refresh token request schema
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, { message: 'Refresh token is required' }),
  }),
});

/**
 * Refresh token request type
 */
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>['body'];

/**
 * Forgot password request schema
 */
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Invalid email address' }),
  }),
});

/**
 * Forgot password request type
 */
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>['body'];

/**
 * Reset password request schema
 */
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, { message: 'Token is required' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .max(100)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      }),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

/**
 * Reset password request type
 */
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>['body'];

/**
 * Verify email request schema
 */
export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, { message: 'Token is required' }),
  }),
});

/**
 * Verify email request type
 */
export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>['body'];

/**
 * Change password request schema
 */
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, { message: 'Current password is required' }),
    newPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .max(100)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      }),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

/**
 * Change password request type
 */
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>['body'];

/**
 * Authentication response
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    profileImage?: string | null;
  };
  tokens: {
    access: string;
    refresh: string;
  };
}