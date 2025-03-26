import { Router } from 'express';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, adminOnly } from '../middlewares/auth.middleware';
import {
  createEnrollment,
  getEnrollments,
  getEnrollmentById,
  getEnrollmentsByUser,
  getEnrollmentsByCourse,
  updateEnrollmentStatus
} from '../controllers/enrollment.controller';
import {
  createEnrollmentSchema,
  updateEnrollmentStatusSchema,
  enrollmentIdParamsSchema,
  userIdParamsSchema,
  courseIdParamsSchema
} from '../types/payment.types';

const router = Router();

/**
 * @route POST /api/v1/enrollments
 * @desc Create a new enrollment
 * @access Private
 */
router.post('/', authenticate, validate(createEnrollmentSchema), createEnrollment);

/**
 * @route GET /api/v1/enrollments
 * @desc Get all enrollments (admin only)
 * @access Private/Admin
 */
router.get('/', authenticate, adminOnly, getEnrollments);

/**
 * @route GET /api/v1/enrollments/:id
 * @desc Get enrollment by ID
 * @access Private
 */
router.get('/:id', authenticate, validate(enrollmentIdParamsSchema), getEnrollmentById);

/**
 * @route GET /api/v1/enrollments/user/:userId
 * @desc Get all enrollments for a user
 * @access Private
 */
router.get('/user/:userId', authenticate, validate(userIdParamsSchema), getEnrollmentsByUser);

/**
 * @route GET /api/v1/enrollments/course/:courseId
 * @desc Get all enrollments for a course (admin only)
 * @access Private/Admin
 */
router.get('/course/:courseId', authenticate, adminOnly, validate(courseIdParamsSchema), getEnrollmentsByCourse);

/**
 * @route PATCH /api/v1/enrollments/:id/status
 * @desc Update enrollment status (admin only)
 * @access Private/Admin
 */
router.patch(
  '/:id/status',
  authenticate,
  adminOnly,
  validate(updateEnrollmentStatusSchema),
  updateEnrollmentStatus
);

export default router;