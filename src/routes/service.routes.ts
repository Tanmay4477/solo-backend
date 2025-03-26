import { Router } from 'express';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, adminOnly, isServiceProvider } from '../middlewares/auth.middleware';
import { uploadServicePortfolio, handleMulterError } from '../middlewares/upload.middleware';
import { serviceCreationRateLimiter } from '../middlewares/rate-limit.middleware';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  updateServiceStatus,
  verifyService,
  addPortfolioItem,
  deletePortfolioItem,
  getUserServices
} from '../controllers/service.controller';
import {
  getServicesQuerySchema,
  createServiceSchema,
  updateServiceSchema,
  serviceIdParamsSchema,
  updateServiceStatusSchema,
  verifyServiceSchema,
  createPortfolioItemSchema,
  portfolioItemIdParamsSchema
} from '../types/marketplace.types';

const router = Router();

/**
 * @route GET /api/v1/services
 * @desc Get all services
 * @access Public
 */
router.get('/', validate(getServicesQuerySchema), getServices);

/**
 * @route GET /api/v1/services/:id
 * @desc Get service by ID
 * @access Public
 */
router.get('/:id', validate(serviceIdParamsSchema), getServiceById);

/**
 * @route POST /api/v1/services
 * @desc Create a new service
 * @access Private
 */
router.post(
  '/', 
  authenticate, 
  serviceCreationRateLimiter,
  validate(createServiceSchema), 
  createService
);

/**
 * @route PUT /api/v1/services/:id
 * @desc Update service (owner only)
 * @access Private
 */
router.put(
  '/:id', 
  authenticate, 
  isServiceProvider, 
  validate(updateServiceSchema), 
  updateService
);

/**
 * @route DELETE /api/v1/services/:id
 * @desc Delete service (soft delete, owner only)
 * @access Private
 */
router.delete(
  '/:id', 
  authenticate, 
  isServiceProvider, 
  validate(serviceIdParamsSchema), 
  deleteService
);

/**
 * @route PATCH /api/v1/services/:id/status
 * @desc Update service status (owner only)
 * @access Private
 */
router.patch(
  '/:id/status', 
  authenticate, 
  isServiceProvider, 
  validate(updateServiceStatusSchema), 
  updateServiceStatus
);

/**
 * @route PATCH /api/v1/services/:id/verify
 * @desc Verify/unverify service (admin only)
 * @access Private/Admin
 */
router.patch(
  '/:id/verify', 
  authenticate, 
  adminOnly, 
  validate(verifyServiceSchema), 
  verifyService
);

/**
 * @route POST /api/v1/services/:id/portfolio
 * @desc Add portfolio item to service
 * @access Private
 */
router.post(
  '/:id/portfolio', 
  authenticate, 
  isServiceProvider, 
  uploadServicePortfolio,
  handleMulterError,
  validate(createPortfolioItemSchema), 
  addPortfolioItem
);

/**
 * @route DELETE /api/v1/services/portfolio/:id
 * @desc Delete portfolio item
 * @access Private
 */
router.delete(
  '/portfolio/:id', 
  authenticate, 
  validate(portfolioItemIdParamsSchema), 
  deletePortfolioItem
);

/**
 * @route GET /api/v1/services/user/:userId
 * @desc Get all services for a user
 * @access Public
 */
router.get('/user/:userId', getUserServices);

export default router;