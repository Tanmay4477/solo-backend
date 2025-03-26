import { Router } from 'express';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, adminOnly } from '../middlewares/auth.middleware';
import {
  getUserProgress,
  getUserCourseProgress,
  updateContentProgress,
  getModuleProgress,
  completeModule
} from '../controllers/progress.controller';

const router = Router();

/**
 * @route GET /api/v1/progress/user/:userId
 * @desc Get all progress for a user
 * @access Private
 */
router.get('/user/:userId', authenticate, getUserProgress);

/**
 * @route GET /api/v1/progress/user/:userId/course/:courseId
 * @desc Get user progress for a specific course
 * @access Private
 */
router.get('/user/:userId/course/:courseId', authenticate, getUserCourseProgress);

/**
 * @route POST /api/v1/progress/content/:contentId
 * @desc Update content progress
 * @access Private
 */
router.post('/content/:contentId', authenticate, updateContentProgress);

/**
 * @route GET /api/v1/progress/module/:moduleId
 * @desc Get module progress for current user
 * @access Private
 */
router.get('/module/:moduleId', authenticate, getModuleProgress);

/**
 * @route POST /api/v1/progress/module/:moduleId/complete
 * @desc Mark module as completed
 * @access Private
 */
router.post('/module/:moduleId/complete', authenticate, completeModule);

export default router;