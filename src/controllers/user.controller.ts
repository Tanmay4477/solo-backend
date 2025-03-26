import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { ApiError } from '../middlewares/error.middleware';
import ApiResponse from '../utils/apiResponse';
import { 
  UpdateUserProfileRequest, 
  UpdateUserStatusRequest, 
  AdminUpdateUserRequest, 
  GetUsersQuery,
  UserResponse,
  BlockUserParams
} from '../types/user.types';
import { createPaginatedResponse, normalizePaginationOptions, getPrismaSkipTake } from '../utils/pagination';
import { UserRole, UserStatus } from '@prisma/client';
import logger from '../utils/logger';
import { AwsService } from '../services/aws.service';
import { UserService } from '../services/user.service';
import { NotificationService } from '../services/notification.service';

/**
 * Get all users (admin only)
 * @route GET /api/v1/users
 */
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      page, 
      limit, 
      role, 
      status, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    }: GetUsersQuery = req.query;
    
    // Prepare pagination options
    const paginationOptions = normalizePaginationOptions({ page, limit });
    const { skip, take } = getPrismaSkipTake(paginationOptions);
    
    // Build query filters
    const where: any = {
      isDeleted: false
    };
    
    // Add role filter if provided
    if (role) {
      where.role = role;
    }
    
    // Add status filter if provided
    if (status) {
      where.status = status;
    }
    
    // Add search filter if provided
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Count total users matching the filter
    const total = await prisma.user.count({ where });
    
    // Get users with pagination and sorting
    const users = await prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        profileImage: true,
        bio: true,
        phone: true,
        location: true,
        isVerified: true,
        lastLogin: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            certificates: true
          }
        }
      }
    });
    
    // Create paginated response
    const paginatedUsers = createPaginatedResponse(
      users,
      total,
      paginationOptions
    );
    
    return ApiResponse.success(
      res,
      paginatedUsers,
      'Users retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * @route GET /api/v1/users/:id
 */
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await UserService.getUserById(id);
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    // Check if requester is admin or the user themselves
    const requester = req.user;
    const isAuthorized = requester.role === UserRole.ADMIN || requester.id === id;
    
    // Return detailed or basic profile based on authorization
    if (isAuthorized) {
      // Get user enrollments and certificates for detailed profile
      const enrollments = await prisma.userCourseEnrollment.findMany({
        where: { userId: id, isActive: true },
        select: {
          id: true,
          courseId: true,
          enrollmentDate: true,
          expiryDate: true,
          isActive: true,
          course: {
            select: {
              title: true
            }
          }
        }
      });
      
      const certificates = await prisma.certificate.findMany({
        where: { userId: id },
        select: {
          id: true,
          title: true,
          issuedAt: true,
          courseId: true,
          module: {
            select: {
              title: true
            }
          }
        },
        orderBy: { issuedAt: 'desc' }
      });
      
      const userProfile: UserResponse = {
        ...user,
        enrollments: enrollments.map(e => ({
          id: e.id,
          courseId: e.courseId,
          courseName: e.course.title,
          enrollmentDate: e.enrollmentDate,
          expiryDate: e.expiryDate,
          isActive: e.isActive
        })),
        certificates: certificates.map(c => ({
          id: c.id,
          title: c.title,
          issuedAt: c.issuedAt,
          courseId: c.courseId,
          moduleName: c.module?.title
        }))
      };
      
      return ApiResponse.success(
        res,
        userProfile,
        'User profile retrieved successfully'
      );
    } else {
      // Return public profile
      const publicProfile = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        bio: user.bio
      };
      
      return ApiResponse.success(
        res,
        publicProfile,
        'User profile retrieved successfully'
      );
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @route PUT /api/v1/users/:id
 */
export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updateData: UpdateUserProfileRequest = req.body;
    const requester = req.user;
    
    // Check if user exists
    const user = await UserService.getUserById(id);
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    // Check if requester is admin or the user themselves
    const isAuthorized = requester.role === UserRole.ADMIN || requester.id === id;
    
    if (!isAuthorized) {
      throw new ApiError('Not authorized to update this user', 403);
    }
    
    // If admin is making the update, check for admin-specific fields
    if (requester.role === UserRole.ADMIN && req.path.includes('/admin')) {
      // Handle admin update with AdminUpdateUserRequest
      const adminUpdateData = req.body as AdminUpdateUserRequest;
      
      // Update user with admin fields
      const updatedUser = await prisma.user.update({
        where: { id },
        data: adminUpdateData
      });
      
      return ApiResponse.success(
        res,
        updatedUser,
        'User profile updated successfully by admin'
      );
    }
    
    // Regular profile update for user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });
    
    // Remove sensitive information
    const userData = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      profileImage: updatedUser.profileImage,
      bio: updatedUser.bio,
      phone: updatedUser.phone,
      location: updatedUser.location,
      updatedAt: updatedUser.updatedAt
    };
    
    return ApiResponse.success(
      res,
      userData,
      'User profile updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (soft delete)
 * @route DELETE /api/v1/users/:id
 */
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const requester = req.user;
    
    // Check if user exists
    const user = await UserService.getUserById(id);
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    // Check if requester is admin
    if (requester.role !== UserRole.ADMIN) {
      throw new ApiError('Not authorized to delete users', 403);
    }
    
    // Soft delete the user
    await prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.INACTIVE
      }
    });
    
    return ApiResponse.success(
      res,
      null,
      'User deleted successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update user status (admin only)
 * @route PATCH /api/v1/users/:id/status
 */
export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status }: UpdateUserStatusRequest = req.body;
    
    // Check if user exists
    const user = await UserService.getUserById(id);
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status }
    });
    
    // If suspending the user, notify them
    if (status === UserStatus.SUSPENDED) {
      await NotificationService.sendNotification({
        userId: id,
        type: 'ADMIN_ANNOUNCEMENT',
        title: 'Account Suspended',
        message: 'Your account has been suspended. Please contact support for more information.'
      });
    }
    
    // If reactivating the user, notify them
    if (status === UserStatus.ACTIVE && user.status !== UserStatus.ACTIVE) {
      await NotificationService.sendNotification({
        userId: id,
        type: 'ADMIN_ANNOUNCEMENT',
        title: 'Account Reactivated',
        message: 'Your account has been reactivated.'
      });
    }
    
    return ApiResponse.success(
      res,
      {
        id: updatedUser.id,
        status: updatedUser.status
      },
      'User status updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Block a user
 * @route POST /api/v1/users/block/:id
 */
export const blockUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id }: BlockUserParams = req.params;
    const blockingUserId = req.user.id;
    
    // Ensure user is not blocking themselves
    if (id === blockingUserId) {
      throw new ApiError('You cannot block yourself', 400);
    }
    
    // Check if target user exists
    const targetUser = await UserService.getUserById(id);
    
    if (!targetUser) {
      throw new ApiError('User to block not found', 404);
    }
    
    // Check if already blocked
    const existingBlock = await prisma.blockedUser.findUnique({
      where: {
        blockingUserId_blockedUserId: {
          blockingUserId,
          blockedUserId: id
        }
      }
    });
    
    if (existingBlock) {
      throw new ApiError('User is already blocked', 400);
    }
    
    // Create block record
    await prisma.blockedUser.create({
      data: {
        blockingUserId,
        blockedUserId: id
      }
    });
    
    return ApiResponse.success(
      res,
      null,
      'User blocked successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Unblock a user
 * @route DELETE /api/v1/users/block/:id
 */
export const unblockUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id }: BlockUserParams = req.params;
    const blockingUserId = req.user.id;
    
    // Delete block record if exists
    const result = await prisma.blockedUser.deleteMany({
      where: {
        blockingUserId,
        blockedUserId: id
      }
    });
    
    if (result.count === 0) {
      throw new ApiError('User was not blocked', 404);
    }
    
    return ApiResponse.success(
      res,
      null,
      'User unblocked successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Upload profile picture
 * @route POST /api/v1/users/profile-picture
 */
export const uploadProfilePicture = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new ApiError('No file uploaded', 400);
    }
    
    const userId = req.user.id;
    const file = req.file;
    
    // Upload to S3 using AWS service
    const uploadResult = await AwsService.uploadFile(
      file.buffer,
      file.originalname,
      'profile-images',
      file.mimetype
    );
    
    // Update user's profile image URL
    await prisma.user.update({
      where: { id: userId },
      data: { profileImage: uploadResult.url }
    });
    
    return ApiResponse.success(
      res,
      { imageUrl: uploadResult.url },
      'Profile picture uploaded successfully'
    );
  } catch (error) {
    next(error);
  }
};