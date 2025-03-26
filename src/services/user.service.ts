import { prisma } from '../index';
import { ApiError } from '../middlewares/error.middleware';
import { UserRole, UserStatus } from '@prisma/client';
import { hashPassword } from '../utils/password';

/**
 * User Service - Handles business logic for user management
 */
export class UserService {
  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<User | null>} User object or null if not found
   */
  static async getUserById(id: string) {
    return prisma.user.findFirst({
      where: {
        id,
        isDeleted: false
      }
    });
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<User | null>} User object or null if not found
   */
  static async getUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email,
        isDeleted: false
      }
    });
  }

  /**
   * Create a new user
   * @param {object} userData - User data
   * @returns {Promise<User>} Created user
   */
  static async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    phone?: string;
    location?: string;
    profileImage?: string;
    bio?: string;
  }) {
    // Check if user with email already exists
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new ApiError('User with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create new user
    return prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: userData.role || UserRole.USER,
        status: UserStatus.ACTIVE
      }
    });
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {object} updateData - Data to update
   * @returns {Promise<User>} Updated user
   */
  static async updateUser(id: string, updateData: any) {
    // Check if user exists
    const user = await this.getUserById(id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // If updating email, check if it's already taken
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.getUserByEmail(updateData.email);
      if (existingUser) {
        throw new ApiError('Email is already taken', 400);
      }
    }

    // Update user
    return prisma.user.update({
      where: { id },
      data: updateData
    });
  }

  /**
   * Delete user (soft delete)
   * @param {string} id - User ID
   * @returns {Promise<User>} Deleted user
   */
  static async deleteUser(id: string) {
    // Check if user exists
    const user = await this.getUserById(id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Soft delete user
    return prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.INACTIVE
      }
    });
  }

  /**
   * Get blocked users
   * @param {string} userId - User ID
   * @returns {Promise<string[]>} Array of blocked user IDs
   */
  static async getBlockedUsers(userId: string) {
    const blockedUsers = await prisma.blockedUser.findMany({
      where: { blockingUserId: userId },
      select: { blockedUserId: true }
    });

    return blockedUsers.map(block => block.blockedUserId);
  }

  /**
   * Check if a user is blocked
   * @param {string} blockingUserId - User who might be blocking
   * @param {string} blockedUserId - User who might be blocked
   * @returns {Promise<boolean>} True if blocked
   */
  static async isUserBlocked(blockingUserId: string, blockedUserId: string) {
    const block = await prisma.blockedUser.findUnique({
      where: {
        blockingUserId_blockedUserId: {
          blockingUserId,
          blockedUserId
        }
      }
    });

    return !!block;
  }

  /**
   * Count active users
   * @returns {Promise<number>} Count of active users
   */
  static async countActiveUsers() {
    return prisma.user.count({
      where: {
        status: UserStatus.ACTIVE,
        isDeleted: false
      }
    });
  }

  /**
   * Get user statistics
   * @returns {Promise<object>} User statistics
   */
  static async getUserStats() {
    const totalUsers = await prisma.user.count({
      where: { isDeleted: false }
    });

    const activeUsers = await prisma.user.count({
      where: {
        status: UserStatus.ACTIVE,
        isDeleted: false
      }
    });

    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(1)) // First day of current month
        },
        isDeleted: false
      }
    });

    const verifiedUsers = await prisma.user.count({
      where: {
        isVerified: true,
        isDeleted: false
      }
    });

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      verifiedUsers,
      verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0
    };
  }

  /**
   * Get users with most enrollments
   * @param {number} limit - Number of users to return
   * @returns {Promise<Array>} Users with enrollment counts
   */
  static async getUsersWithMostEnrollments(limit: number = 10) {
    return prisma.user.findMany({
      where: {
        isDeleted: false,
        status: UserStatus.ACTIVE
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: {
        enrollments: {
          _count: 'desc'
        }
      },
      take: limit
    });
  }

  /**
   * Get users with completed certificates
   * @param {number} limit - Number of users to return
   * @returns {Promise<Array>} Users with certificate counts
   */
  static async getUsersWithCertificates(limit: number = 10) {
    return prisma.user.findMany({
      where: {
        isDeleted: false,
        status: UserStatus.ACTIVE,
        certificates: {
          some: {}
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        _count: {
          select: {
            certificates: true
          }
        }
      },
      orderBy: {
        certificates: {
          _count: 'desc'
        }
      },
      take: limit
    });
  }
}