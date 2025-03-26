import { Router } from 'express';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, adminOnly } from '../middlewares/auth.middleware';
import {
  getServiceCategories,
  getServiceCategoryById,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  getServicesByCategory
} from '../controllers/service-category.controller';
import {
  getServiceCategoriesQuerySchema,
  createServiceCategorySchema,
  updateServiceCategorySchema,
  serviceCategoryIdParamsSchema
} from '../types/marketplace.types';

const router = Router();

/**
 * @route GET /api/v1/service-categories
 * @desc Get all service categories
 * @access Public
 */
router.get('/', validate(getServiceCategoriesQuerySchema), getServiceCategories);

/**
 * @route GET /api/v1/service-categories/:id
 * @desc Get service category by ID
 * @access Public
 */
router.get('/:id', validate(serviceCategoryIdParamsSchema), getServiceCategoryById);

/**
 * @route POST /api/v1/service-categories
 * @desc Create a new service category (admin only)
 * @access Private/Admin
 */
router.post('/', authenticate, adminOnly, validate(createServiceCategorySchema), createServiceCategory);

/**
 * @route PUT /api/v1/service-categories/:id
 * @desc Update service category (admin only)
 * @access Private/Admin
 */
router.put('/:id', authenticate, adminOnly, validate(updateServiceCategorySchema), updateServiceCategory);

/**
 * @route DELETE /api/v1/service-categories/:id
 * @desc Delete service category (soft delete, admin only)
 * @access Private/Admin
 */
router.delete('/:id', authenticate, adminOnly, validate(serviceCategoryIdParamsSchema), deleteServiceCategory);

/**
 * @route GET /api/v1/service-categories/:id/services
 * @desc Get all services for a category
 * @access Public
 */
router.get('/:id/services', validate(serviceCategoryIdParamsSchema), getServicesByCategory);

export default router;