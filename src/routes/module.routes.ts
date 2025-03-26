import { Router } from 'express';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, adminOnly, isCourseInstructor } from '../middlewares/auth.middleware';
import {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  updateModuleStatus,
  toggleStandaloneCourse,
  updateModuleOrder,
  getContentsForModule
} from '../controllers/module.controller';
import {
  getModulesQuerySchema,
  createModuleSchema,
  updateModuleSchema,
  moduleIdParamsSchema,
  updateModuleStatusSchema,
  toggleStandaloneCourseSchema,
  updateModuleOrderSchema
} from '../types/module.types';

const router = Router();

/**
 * @route GET /api/v1/modules
 * @desc Get all modules
 * @access Public
 */
router.get('/', validate(getModulesQuerySchema), getModules);

/**
 * @route GET /api/v1/modules/:id
 * @desc Get module by ID
 * @access Public
 */
router.get('/:id', validate(moduleIdParamsSchema), getModuleById);

/**
 * @route POST /api/v1/modules
 * @desc Create a new module (admin only)
 * @access Private/Admin
 */
router.post('/', authenticate, adminOnly, validate(createModuleSchema), createModule);

/**
 * @route PUT /api/v1/modules/:id
 * @desc Update module (admin only)
 * @access Private/Admin
 */
router.put('/:id', authenticate, adminOnly, validate(updateModuleSchema), updateModule);

/**
 * @route DELETE /api/v1/modules/:id
 * @desc Delete module (soft delete, admin only)
 * @access Private/Admin
 */
router.delete('/:id', authenticate, adminOnly, validate(moduleIdParamsSchema), deleteModule);

/**
 * @route PATCH /api/v1/modules/:id/status
 * @desc Update module status (admin only)
 * @access Private/Admin
 */
router.patch(
  '/:id/status',
  authenticate,
  adminOnly,
  validate(updateModuleStatusSchema),
  updateModuleStatus
);

/**
 * @route PATCH /api/v1/modules/:id/standalone
 * @desc Toggle standalone course status (admin only)
 * @access Private/Admin
 */
router.patch(
  '/:id/standalone',
  authenticate,
  adminOnly,
  validate(toggleStandaloneCourseSchema),
  toggleStandaloneCourse
);

/**
 * @route PATCH /api/v1/modules/:id/order
 * @desc Update module order (admin only)
 * @access Private/Admin
 */
router.patch(
  '/:id/order',
  authenticate,
  adminOnly,
  validate(updateModuleOrderSchema),
  updateModuleOrder
);

/**
 * @route GET /api/v1/modules/:id/contents
 * @desc Get all contents for a module
 * @access Public
 */
router.get('/:id/contents', validate(moduleIdParamsSchema), getContentsForModule);

export default router;