import { Router } from 'express';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, adminOnly } from '../middlewares/auth.middleware';
import {
  createPayment,
  getPayments,
  getPaymentById,
  getPaymentsByUser,
  updatePaymentStatus,
  getDuePayments
} from '../controllers/payment.controller';
import {
  createPaymentSchema,
  updatePaymentStatusSchema,
  paymentIdParamsSchema,
  userIdParamsSchema,
  getPaymentsQuerySchema,
  getDuePaymentsQuerySchema
} from '../types/payment.types';

const router = Router();

/**
 * @route POST /api/v1/payments
 * @desc Create a new payment
 * @access Private
 */
router.post('/', authenticate, validate(createPaymentSchema), createPayment);

/**
 * @route GET /api/v1/payments
 * @desc Get all payments (admin only)
 * @access Private/Admin
 */
router.get('/', authenticate, adminOnly, validate(getPaymentsQuerySchema), getPayments);

/**
 * @route GET /api/v1/payments/:id
 * @desc Get payment by ID
 * @access Private
 */
router.get('/:id', authenticate, validate(paymentIdParamsSchema), getPaymentById);

/**
 * @route GET /api/v1/payments/user/:userId
 * @desc Get all payments for a user
 * @access Private
 */
router.get('/user/:userId', authenticate, validate(userIdParamsSchema), getPaymentsByUser);

/**
 * @route PATCH /api/v1/payments/:id/status
 * @desc Update payment status (admin only)
 * @access Private/Admin
 */
router.patch(
  '/:id/status',
  authenticate,
  adminOnly,
  validate(updatePaymentStatusSchema),
  updatePaymentStatus
);

/**
 * @route GET /api/v1/payments/due
 * @desc Get upcoming due payments (admin only)
 * @access Private/Admin
 */
router.get('/due', authenticate, adminOnly, validate(getDuePaymentsQuerySchema), getDuePayments);

export default router;