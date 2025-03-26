import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { ApiError } from '../middlewares/error.middleware';
import ApiResponse from '../utils/apiResponse';
import { hashPassword, comparePassword } from '../utils/password';
import { TokenType, generateToken, verifyToken, generateAuthTokens } from '../utils/token';
import { 
  RegisterRequest, 
  LoginRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ChangePasswordRequest,
  AuthResponse 
} from '../types/auth.types';
import { generateRandomString } from '../utils/validators';
import { welcomeEmail, passwordResetEmail } from '../utils/email-templates';
import logger from '../utils/logger';
import config from '../config';

/**
 * Register a new user
 * @route POST /api/v1/auth/register
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, firstName, lastName, phone, location }: RegisterRequest = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new ApiError('User with this email already exists', 400);
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Generate verification token
    const verificationToken = generateRandomString(32);
    
    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        location,
        verificationToken,
      },
    });
    
    // Generate tokens
    const tokens = generateAuthTokens(user);
    
    // Create verification URL
    const verificationUrl = `${config.clientUrl}/verify-email?token=${verificationToken}`;
    
    // Send welcome email with verification link
    // Note: In a real implementation, you would call an email service here
    const emailContent = welcomeEmail(firstName, verificationUrl);
    logger.info(`Would send welcome email to ${email} with verification link: ${verificationUrl}`);
    
    // Return user data and tokens
    const responseData: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImage: user.profileImage || null,
      },
      tokens,
    };
    
    return ApiResponse.success(
      res,
      responseData,
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Log in a user
 * @route POST /api/v1/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password }: LoginRequest = req.body;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      throw new ApiError('Invalid email or password', 401);
    }
    
    // Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new ApiError('Your account is not active', 401);
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new ApiError('Invalid email or password', 401);
    }
    
    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });
    
    // Generate tokens
    const tokens = generateAuthTokens(user);
    
    // Return user data and tokens
    const responseData: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImage: user.profileImage || null,
      },
      tokens,
    };
    
    return ApiResponse.success(
      res,
      responseData,
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token using refresh token
 * @route POST /api/v1/auth/refresh-token
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken }: RefreshTokenRequest = req.body;
    
    if (!refreshToken) {
      throw new ApiError('Refresh token is required', 400);
    }
    
    // Verify refresh token
    let decoded;
    try {
      decoded = verifyToken(refreshToken);
    } catch (error) {
      throw new ApiError('Invalid or expired refresh token', 401);
    }
    
    if (decoded.type !== TokenType.REFRESH) {
      throw new ApiError('Invalid token type', 401);
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub }
    });
    
    if (!user || user.status !== 'ACTIVE') {
      throw new ApiError('User not found or inactive', 401);
    }
    
    // Generate new tokens
    const tokens = generateAuthTokens(user);
    
    return ApiResponse.success(
      res,
      { tokens },
      'Tokens refreshed successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 * @route POST /api/v1/auth/forgot-password
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email }: ForgotPasswordRequest = req.body;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    // Don't reveal if user exists or not for security
    if (!user) {
      return ApiResponse.success(
        res,
        null,
        'If a user with that email exists, a password reset link has been sent'
      );
    }
    
    // Generate reset token
    const resetToken = generateToken(user.id, TokenType.RESET_PASSWORD);
    
    // Store the token hash in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpire: new Date(Date.now() + 3600000) // 1 hour
      }
    });
    
    // Create reset URL
    const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;
    
    // Send email with reset link
    // Note: In a real implementation, you would call an email service here
    const emailContent = passwordResetEmail(user.firstName, resetUrl);
    logger.info(`Would send password reset email to ${email} with reset link: ${resetUrl}`);
    
    return ApiResponse.success(
      res,
      null,
      'If a user with that email exists, a password reset link has been sent'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with token
 * @route POST /api/v1/auth/reset-password
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password }: ResetPasswordRequest = req.body;
    
    if (!token || !password) {
      throw new ApiError('Token and password are required', 400);
    }
    
    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      throw new ApiError('Invalid or expired token', 401);
    }
    
    if (decoded.type !== TokenType.RESET_PASSWORD) {
      throw new ApiError('Invalid token type', 401);
    }
    
    // Find user with matching token
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.sub,
        resetPasswordToken: token,
        resetPasswordExpire: {
          gt: new Date()
        }
      }
    });
    
    if (!user) {
      throw new ApiError('Invalid or expired token', 401);
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(password);
    
    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null
      }
    });
    
    return ApiResponse.success(
      res,
      null,
      'Password reset successful'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email with token
 * @route POST /api/v1/auth/verify-email
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token }: VerifyEmailRequest = req.body;
    
    if (!token) {
      throw new ApiError('Token is required', 400);
    }
    
    // Find user with matching verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token
      }
    });
    
    if (!user) {
      throw new ApiError('Invalid verification token', 401);
    }
    
    // Update user verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null
      }
    });
    
    return ApiResponse.success(
      res,
      null,
      'Email verified successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * @route GET /api/v1/auth/me
 */
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    // Remove sensitive information
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileImage: user.profileImage,
      bio: user.bio,
      phone: user.phone,
      location: user.location,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };
    
    return ApiResponse.success(
      res,
      userData,
      'User profile retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 * @route POST /api/v1/auth/change-password
 */
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword }: ChangePasswordRequest = req.body;
    const user = req.user;
    
    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    
    if (!isPasswordValid) {
      throw new ApiError('Current password is incorrect', 401);
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword
      }
    });
    
    return ApiResponse.success(
      res,
      null,
      'Password changed successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Log out a user
 * @route POST /api/v1/auth/logout
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // In a stateless JWT authentication system, logout is handled client-side
    // by removing the tokens from storage
    
    // If you're tracking sessions, you could invalidate the session here
    
    return ApiResponse.success(
      res,
      null,
      'Logged out successfully'
    );
  } catch (error) {
    next(error);
  }
};