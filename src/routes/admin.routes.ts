import { Router } from 'express';
import { authenticate, adminOnly } from '../middlewares/auth.middleware';
import {
  getOverviewStats,
  getUserStats,
  getCourseStats,
  getPaymentStats,
  getCommunityStats,
  getMarketplaceStats,
  getReportedContent,
  markReportedContentAsReviewed
} from '../controllers/admin.controller';

const router = Router();

/**
 * @route GET /api/v1/admin/stats/overview
 * @desc Get overview statistics
 * @access Private/Admin
 */
router.get('/stats/overview', authenticate, adminOnly, getOverviewStats);

/**
 * @route GET /api/v1/admin/stats/users
 * @desc Get user statistics
 * @access Private/Admin
 */
router.get('/stats/users', authenticate, adminOnly, getUserStats);

/**
 * @route GET /api/v1/admin/stats/courses
 * @desc Get course statistics
 * @access Private/Admin
 */
router.get('/stats/courses', authenticate, adminOnly, getCourseStats);

/**
 * @route GET /api/v1/admin/stats/payments
 * @desc Get payment statistics
 * @access Private/Admin
 */
router.get('/stats/payments', authenticate, adminOnly, getPaymentStats);

/**
 * @route GET /api/v1/admin/stats/community
 * @desc Get community statistics
 * @access Private/Admin
 */
router.get('/stats/community', authenticate, adminOnly, getCommunityStats);

/**
 * @route GET /api/v1/admin/stats/marketplace
 * @desc Get marketplace statistics
 * @access Private/Admin
 */
router.get('/stats/marketplace', authenticate, adminOnly, getMarketplaceStats);

/**
 * @route GET /api/v1/admin/reports
 * @desc Get reported content
 * @access Private/Admin
 */
router.get('/reports', authenticate, adminOnly, getReportedContent);

/**
 * @route PATCH /api/v1/admin/reports/:id/review
 * @desc Mark reported content as reviewed
 * @access Private/Admin
 */
router.patch('/reports/:id/review', authenticate, adminOnly, markReportedContentAsReviewed);

export default router;