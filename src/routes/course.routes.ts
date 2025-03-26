import { Router } from 'express';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, adminOnly, isCourseInstructor } from '../middlewares/auth.middleware';
import { uploadCourseThumbnail, handleMulterError } from '../middlewares/upload.middleware';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  getModulesByCourse,
  addInstructorToCourse,
  removeInstructorFromCourse,
  uploadCourseThumbnailHandler
} from '../controllers/course.controller';
import {
  getCoursesQuerySchema,
  createCourseSchema,
  updateCourseSchema,
  courseIdParamsSchema,
  publishCourseSchema,
  addInstructorSchema,
  removeInstructorSchema
} from '../types/course.types';

const router = Router();

/**
 * @route GET /api/v1/courses
 * @desc Get all courses
 * @access Public
 */
router.get('/', validate(getCoursesQuerySchema), getCourses);

/**
 * @route GET /api/v1/courses/:id
 * @desc Get course by ID
 * @access Public
 */
router.get('/:id', validate(courseIdParamsSchema), getCourseById);

/**
 * @route POST /api/v1/courses
 * @desc Create a new course (admin only)
 * @access Private/Admin
 */
router.post('/', authenticate, adminOnly, validate(createCourseSchema), createCourse);

/**
 * @route PUT /api/v1/courses/:id
 * @desc Update course (admin only)
 * @access Private/Admin
 */
router.put('/:id', authenticate, adminOnly, validate(updateCourseSchema), updateCourse);

/**
 * @route DELETE /api/v1/courses/:id
 * @desc Delete course (soft delete, admin only)
 * @access Private/Admin
 */
router.delete('/:id', authenticate, adminOnly, validate(courseIdParamsSchema), deleteCourse);

/**
 * @route PATCH /api/v1/courses/:id/publish
 * @desc Publish/unpublish course (admin only)
 * @access Private/Admin
 */
router.patch('/:id/publish', authenticate, adminOnly, validate(publishCourseSchema), publishCourse);

/**
 * @route GET /api/v1/courses/:id/modules
 * @desc Get all modules for a course
 * @access Public
 */
router.get('/:id/modules', validate(courseIdParamsSchema), getModulesByCourse);

/**
 * @route POST /api/v1/courses/:id/instructors
 * @desc Add instructor to course (admin only)
 * @access Private/Admin
 */
router.post('/:id/instructors', authenticate, adminOnly, validate(addInstructorSchema), addInstructorToCourse);

/**
 * @route DELETE /api/v1/courses/:id/instructors/:userId
 * @desc Remove instructor from course (admin only)
 * @access Private/Admin
 */
router.delete('/:id/instructors/:userId', authenticate, adminOnly, validate(removeInstructorSchema), removeInstructorFromCourse);

/**
 * @route POST /api/v1/courses/:id/thumbnail
 * @desc Upload course thumbnail (admin or instructor)
 * @access Private/Admin/Instructor
 */
router.post('/:id/thumbnail', 
  authenticate, 
  isCourseInstructor, 
  uploadCourseThumbnail,
  handleMulterError,
  uploadCourseThumbnailHandler
);

export default router;