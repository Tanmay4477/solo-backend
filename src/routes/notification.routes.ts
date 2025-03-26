import { Router } from 'express';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, adminOnly } from '../middlewares/auth.middleware';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createAdminAnnouncement
} from '../controllers/notification.controller';

const router = Router();

/**
 * @route GET /api/v1/notifications
 * @desc Get all notifications for current user
 * @access Private
 */
router.get('/', authenticate, getUserNotifications);

/**
 * @route PATCH /api/v1/notifications/:id/read
 * @desc Mark notification as read
 * @access Private
 */
router.patch('/:id/read', authenticate, markNotificationAsRead);

/**
 * @route PATCH /api/v1/notifications/read-all
 * @desc Mark all notifications as read
 * @access Private
 */
router.patch('/read-all', authenticate, markAllNotificationsAsRead);

/**
 * @route POST /api/v1/notifications/admin
 * @desc Create admin announcement (admin only)
 * @access Private/Admin
 */
router.post('/admin', authenticate, adminOnly, createAdminAnnouncement);

export default router;