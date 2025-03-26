import { Router } from 'express';
import { validate } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authRateLimiter, passwordResetRateLimiter } from '../middlewares/rate-limit.middleware';
import {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser,
  changePassword,
  logout
} from '../controllers/auth.controller';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema
} from '../types/auth.types';

const router = Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authRateLimiter, validate(registerSchema), register);

/**
 * @route POST /api/v1/auth/login
 * @desc Log in a user
 * @access Public
 */
router.post('/login', authRateLimiter, validate(loginSchema), login);

/**
 * @route POST /api/v1/auth/refresh-token
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', passwordResetRateLimiter, validate(forgotPasswordSchema), forgotPassword);

/**
 * @route POST /api/v1/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

/**
 * @route POST /api/v1/auth/verify-email
 * @desc Verify email with token
 * @access Public
 */
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);

/**
 * @route GET /api/v1/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @route POST /api/v1/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

/**
 * @route POST /api/v1/auth/logout
 * @desc Log out a user
 * @access Private
 */
router.post('/logout', authenticate, logout);

export default router;