import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
// import { authenticate, adminOnly } from '../middlewares/auth.middleware';
import {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  getContentsForModule
} from '../controllers/module.controller';

import {
  getModulesQuerySchema,
  createModuleSchema,
  updateModuleSchema,
  moduleIdParamsSchema,
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
router.post('/', validate(createModuleSchema), createModule);

/**
 * @route PUT /api/v1/modules/:id
 * @desc Update module (admin only)
 * @access Private/Admin
 */
router.put('/:id', validate(updateModuleSchema), updateModule);

/**
 * @route DELETE /api/v1/modules/:id
 * @desc Delete module (soft delete, admin only)
 * @access Private/Admin
 */
router.delete('/:id', validate(moduleIdParamsSchema), deleteModule);

/**
 * @route PATCH /api/v1/modules/:id/status
 * @desc Update module status (admin only)
 * @access Private/Admin
 */



/**
 * @route GET /api/v1/modules/:id/contents
 * @desc Get all contents for a module
 * @access Public
 */
router.get('/:id/contents', validate(moduleIdParamsSchema), getContentsForModule);

export default router;