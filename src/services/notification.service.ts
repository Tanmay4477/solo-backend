import { prisma } from '../index';
import { NotificationType } from '@prisma/client';
import { ApiError } from '../middlewares/error.middleware';

/**
 * Notification service for handling user notifications
 */
export class NotificationService {
  /**
   * Send a notification to a user
   * @param {object} data - Notification data
   * @returns {Promise<object>} Created notification
   */
  static async sendNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    linkUrl?: string;
  }) {
    try {
      // Validate notification type
      if (!Object.values(NotificationType).includes(data.type as NotificationType)) {
        throw new ApiError(`Invalid notification type: ${data.type}`, 400);
      }
      
      // Create notification
      return prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type as NotificationType,
          title: data.title,
          message: data.message,
          linkUrl: data.linkUrl,
          isRead: false,
        }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to create notification: ${error.message}`, 500);
    }
  }
  
  /**
   * Get all notifications for a user
   * @param {string} userId - User ID
   * @param {boolean} unreadOnly - Get only unread notifications
   * @param {number} limit - Maximum number of notifications to return
   * @returns {Promise<Array>} User notifications
   */
  static async getUserNotifications(userId: string, unreadOnly: boolean = false, limit: number = 50) {
    try {
      return prisma.notification.findMany({
        where: {
          userId,
          ...(unreadOnly ? { isRead: false } : {})
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });
    } catch (error) {
      throw new ApiError(`Failed to get notifications: ${error.message}`, 500);
    }
  }
  
  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} Updated notification
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      // Find notification
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId
        }
      });
      
      if (!notification) {
        throw new ApiError('Notification not found', 404);
      }
      
      // Mark as read
      return prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to mark notification as read: ${error.message}`, 500);
    }
  }
  
  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of notifications marked as read
   */
  static async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });
      
      return result.count;
    } catch (error) {
      throw new ApiError(`Failed to mark all notifications as read: ${error.message}`, 500);
    }
  }
  
  /**
   * Get unread notification count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Unread notification count
   */
  static async getUnreadCount(userId: string) {
    try {
      return prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      });
    } catch (error) {
      throw new ApiError(`Failed to get unread notification count: ${error.message}`, 500);
    }
  }
  
  /**
   * Delete old notifications
   * @param {number} olderThanDays - Delete notifications older than this many days
   * @returns {Promise<number>} Number of notifications deleted
   */
  static async deleteOldNotifications(olderThanDays: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          },
          isRead: true
        }
      });
      
      return result.count;
    } catch (error) {
      throw new ApiError(`Failed to delete old notifications: ${error.message}`, 500);
    }
  }
  
  /**
   * Send a notification to all users
   * @param {object} data - Notification data
   * @returns {Promise<number>} Number of notifications created
   */
  static async sendNotificationToAllUsers(data: {
    type: string;
    title: string;
    message: string;
    linkUrl?: string;
    exceptUserIds?: string[];
  }) {
    try {
      // Validate notification type
      if (!Object.values(NotificationType).includes(data.type as NotificationType)) {
        throw new ApiError(`Invalid notification type: ${data.type}`, 400);
      }
      
      // Get all active users
      const users = await prisma.user.findMany({
        where: {
          status: 'ACTIVE',
          isDeleted: false,
          ...(data.exceptUserIds && data.exceptUserIds.length > 0
            ? { id: { notIn: data.exceptUserIds } }
            : {})
        },
        select: { id: true }
      });
      
      // Create notifications in batches
      const batchSize = 100;
      let createdCount = 0;
      
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        
        const notifications = batch.map(user => ({
          userId: user.id,
          type: data.type as NotificationType,
          title: data.title,
          message: data.message,
          linkUrl: data.linkUrl,
          isRead: false,
        }));
        
        const result = await prisma.notification.createMany({
          data: notifications
        });
        
        createdCount += result.count;
      }
      
      return createdCount;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to send notifications to all users: ${error.message}`, 500);
    }
  }
  
  /**
   * Send module unlock notification
   * @param {string} userId - User ID
   * @param {object} moduleData - Module data
   * @returns {Promise<object>} Created notification
   */
  static async sendModuleUnlockNotification(
    userId: string,
    moduleData: {
      moduleId: string;
      moduleTitle: string;
      courseId: string;
      courseTitle: string;
    }
  ) {
    return this.sendNotification({
      userId,
      type: 'CONTENT_UNLOCK',
      title: 'New Module Unlocked',
      message: `The module "${moduleData.moduleTitle}" in course "${moduleData.courseTitle}" is now available.`,
      linkUrl: `/courses/${moduleData.courseId}/modules/${moduleData.moduleId}`
    });
  }
  
  /**
   * Send certificate issued notification
   * @param {string} userId - User ID
   * @param {object} certificateData - Certificate data
   * @returns {Promise<object>} Created notification
   */
  static async sendCertificateNotification(
    userId: string,
    certificateData: {
      certificateId: string;
      certificateTitle: string;
      courseTitle: string;
    }
  ) {
    return this.sendNotification({
      userId,
      type: 'CERTIFICATE_ISSUED',
      title: 'Certificate Issued',
      message: `Congratulations! You have earned the "${certificateData.certificateTitle}" certificate for completing "${certificateData.courseTitle}".`,
      linkUrl: `/certificates/${certificateData.certificateId}`
    });
  }
  
  /**
   * Send payment reminder notification
   * @param {string} userId - User ID
   * @param {object} paymentData - Payment data
   * @returns {Promise<object>} Created notification
   */
  static async sendPaymentReminderNotification(
    userId: string,
    paymentData: {
      enrollmentId: string;
      courseTitle: string;
      dueDate: Date;
      amount: number;
      currency: string;
    }
  ) {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: paymentData.currency
    }).format(paymentData.amount);
    
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(paymentData.dueDate);
    
    return this.sendNotification({
      userId,
      type: 'PAYMENT_REMINDER',
      title: 'Payment Reminder',
      message: `Your payment of ${formattedAmount} for "${paymentData.courseTitle}" is due on ${formattedDate}.`,
      linkUrl: `/payments/enrollment/${paymentData.enrollmentId}`
    });
  }
}