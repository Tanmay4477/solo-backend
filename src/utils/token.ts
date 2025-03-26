import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import config from '../config';

/**
 * JWT Token types
 */
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  RESET_PASSWORD = 'resetPassword',
  VERIFY_EMAIL = 'verifyEmail'
}

/**
 * Generate a JWT token
 * @param {string} userId - The user ID
 * @param {TokenType} type - The token type
 * @param {string} [secret] - Custom secret (optional)
 * @returns {string} The JWT token
 */
export const generateToken = (
  userId: string,
  type: TokenType,
  secret: string = config.jwt.secret
): string => {
  const payload = {
    sub: userId,
    type
  };

  const expiresIn = 
    type === TokenType.ACCESS 
      ? config.jwt.accessExpirationMinutes + 'm'
      : type === TokenType.REFRESH 
        ? config.jwt.refreshExpirationDays + 'd'
        : type === TokenType.RESET_PASSWORD 
          ? config.jwt.resetPasswordExpirationMinutes + 'm'
          : config.jwt.verifyEmailExpirationMinutes + 'm';

  return jwt.sign(payload, secret, { expiresIn: '5m' });
};

/**
 * Verify a JWT token
 * @param {string} token - The JWT token
 * @param {string} [secret] - Custom secret (optional)
 * @returns {object} The decoded token
 */
export const verifyToken = (
  token: string,
  secret: string = config.jwt.secret
): jwt.JwtPayload => {
  return jwt.verify(token, secret) as jwt.JwtPayload;
};

/**
 * Generate auth tokens for user
 * @param {User} user - The user
 * @returns {object} Access and refresh tokens
 */
export const generateAuthTokens = (user: User): { 
  access: string;
  refresh: string; 
} => {
  const accessToken = generateToken(user.id, TokenType.ACCESS);
  const refreshToken = generateToken(user.id, TokenType.REFRESH);
  
  return {
    access: accessToken,
    refresh: refreshToken
  };
};

/**
 * Generate password reset token
 * @param {string} userId - The user ID
 * @returns {string} Password reset token
 */
export const generatePasswordResetToken = (userId: string): string => {
  return generateToken(userId, TokenType.RESET_PASSWORD);
};

/**
 * Generate email verification token
 * @param {string} userId - The user ID
 * @returns {string} Email verification token
 */
export const generateEmailVerificationToken = (userId: string): string => {
  return generateToken(userId, TokenType.VERIFY_EMAIL);
};

/**
 * Extract user ID from token
 * @param {string} token - The JWT token
 * @returns {string} User ID
 */
export const extractUserIdFromToken = (token: string): string => {
  const decoded = verifyToken(token);
  return decoded.sub as string;
};

/**
 * Check if token is expired
 * @param {string} token - The JWT token
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    verifyToken(token);
    return false;
  } catch (error) {
    const err = error as Error;
    return err.name === 'TokenExpiredError';
  }
};

/**
 * Decode token without verification
 * @param {string} token - The JWT token
 * @returns {any} Decoded token
 */
export const decodeToken = (token: string): jwt.JwtPayload | null => {
  return jwt.decode(token) as jwt.JwtPayload | null;
};