import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { ApiError } from './error.middleware';
import { verifyToken, TokenType } from '../utils/token';
import { UserRole } from '@prisma/client';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Authentication middleware
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Authentication required', 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = verifyToken(token);
    
    if (decoded.type !== TokenType.ACCESS) {
      throw new ApiError('Invalid token type', 401);
    }
    
    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub }
    });
    
    if (!user || user.status !== 'ACTIVE') {
      throw new ApiError('User not found or inactive', 401);
    }
    
    // Attach user to request object
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError('Invalid token', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

/**
 * Authorization middleware for specific roles
 */
export const authorize = (roles: UserRole[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError('Authentication required', 401));
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return next(new ApiError('Not authorized to access this resource', 403));
    }
    
    next();
  };
};

/**
 * Admin-only middleware
 */
export const adminOnly = authorize([UserRole.ADMIN]);

/**
 * Moderator and admin middleware
 */
export const moderatorAndAbove = authorize([UserRole.ADMIN, UserRole.MODERATOR]);

/**
 * Course instructor middleware
 * Checks if the user is an instructor of the course
 */
export const isCourseInstructor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError('Authentication required', 401));
    }

    const courseId = req.params.courseId || req.params.id;
    
    if (!courseId) {
      return next(new ApiError('Course ID is required', 400));
    }

    // If user is admin, allow access
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    // Check if user is an instructor of the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructors: {
          where: { id: req.user.id },
          select: { id: true }
        }
      }
    });

    if (!course) {
      return next(new ApiError('Course not found', 404));
    }

    if (course.instructors.length === 0) {
      return next(new ApiError('Not authorized to access this resource', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Content owner middleware
 * Checks if the user is the owner of the content (post, comment, service, etc.)
 */
export const isContentOwner = (modelName: string, idParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ApiError('Authentication required', 401));
      }

      const contentId = req.params[idParam];
      
      if (!contentId) {
        return next(new ApiError(`${modelName} ID is required`, 400));
      }

      // If user is admin, allow access
      if (req.user.role === UserRole.ADMIN) {
        return next();
      }

      // Check if user is the owner of the content
      const content = await (prisma as any)[modelName].findUnique({
        where: { id: contentId }
      });

      if (!content) {
        return next(new ApiError(`${modelName} not found`, 404));
      }

      if (content.userId !== req.user.id) {
        return next(new ApiError('Not authorized to access this resource', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Service provider middleware
 * Checks if the user is the provider of the service
 */
export const isServiceProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError('Authentication required', 401));
    }

    const serviceId = req.params.serviceId || req.params.id;
    
    if (!serviceId) {
      return next(new ApiError('Service ID is required', 400));
    }

    // If user is admin, allow access
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    // Check if user is the provider of the service
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return next(new ApiError('Service not found', 404));
    }

    if (service.userId !== req.user.id) {
      return next(new ApiError('Not authorized to access this resource', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Service order participant middleware
 * Checks if the user is a participant in the service order (buyer or provider)
 */
export const isOrderParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError('Authentication required', 401));
    }

    const orderId = req.params.id;
    
    if (!orderId) {
      return next(new ApiError('Order ID is required', 400));
    }

    // If user is admin, allow access
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    // Check if user is a participant in the order
    const order = await prisma.serviceOrder.findUnique({
      where: { id: orderId },
      include: {
        service: true
      }
    });

    if (!order) {
      return next(new ApiError('Order not found', 404));
    }

    // Check if user is buyer or service provider
    if (order.buyerId !== req.user.id && order.service.userId !== req.user.id) {
      return next(new ApiError('Not authorized to access this resource', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};