import { z } from 'zod';
import { PaymentPlan, PaymentStatus } from '@prisma/client';

/**
 * Create payment schema
 */
export const createPaymentSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    enrollmentId: z.string().uuid(),
    amount: z.number().positive(),
    currency: z.string().default('USD'),
    paymentMethod: z.string(),
    transactionId: z.string().optional(),
    paymentDate: z.coerce.date(),
    nextPaymentDate: z.coerce.date().optional(),
    status: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  }),
});

/**
 * Create payment request type
 */
export type CreatePaymentRequest = z.infer<typeof createPaymentSchema>['body'];

/**
 * Update payment status schema
 */
export const updatePaymentStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.nativeEnum(PaymentStatus),
    transactionId: z.string().optional(),
  }),
});

/**
 * Update payment status request type
 */
export type UpdatePaymentStatusParams = z.infer<typeof updatePaymentStatusSchema>['params'];
export type UpdatePaymentStatusRequest = z.infer<typeof updatePaymentStatusSchema>['body'];

/**
 * Payment ID params schema
 */
export const paymentIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Payment ID params type
 */
export type PaymentIdParams = z.infer<typeof paymentIdParamsSchema>['params'];

/**
 * User ID params schema
 */
export const userIdParamsSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
});

/**
 * User ID params type
 */
export type UserIdParams = z.infer<typeof userIdParamsSchema>['params'];

/**
 * Get payments query schema
 */
export const getPaymentsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    userId: z.string().uuid().optional(),
    enrollmentId: z.string().uuid().optional(),
    status: z.nativeEnum(PaymentStatus).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    sortBy: z.string().optional().default('paymentDate'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

/**
 * Get payments query type
 */
export type GetPaymentsQuery = z.infer<typeof getPaymentsQuerySchema>['query'];

/**
 * Create enrollment schema
 */
export const createEnrollmentSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    courseId: z.string().uuid(),
    paymentPlan: z.nativeEnum(PaymentPlan),
    expiryDate: z.coerce.date(),
    isActive: z.boolean().default(true),
    paymentDetails: z.object({
      amount: z.number().positive(),
      currency: z.string().default('USD'),
      paymentMethod: z.string(),
      transactionId: z.string().optional(),
    }),
  }),
});

/**
 * Create enrollment request type
 */
export type CreateEnrollmentRequest = z.infer<typeof createEnrollmentSchema>['body'];

/**
 * Update enrollment status schema
 */
export const updateEnrollmentStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    isActive: z.boolean(),
    expiryDate: z.coerce.date().optional(),
  }),
});

/**
 * Update enrollment status request type
 */
export type UpdateEnrollmentStatusParams = z.infer<typeof updateEnrollmentStatusSchema>['params'];
export type UpdateEnrollmentStatusRequest = z.infer<typeof updateEnrollmentStatusSchema>['body'];

/**
 * Enrollment ID params schema
 */
export const enrollmentIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Enrollment ID params type
 */
export type EnrollmentIdParams = z.infer<typeof enrollmentIdParamsSchema>['params'];

/**
 * Get due payments query schema
 */
export const getDuePaymentsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    daysAhead: z.string().optional().transform(val => val ? parseInt(val, 10) : 7),
  }),
});

/**
 * Get due payments query type
 */
export type GetDuePaymentsQuery = z.infer<typeof getDuePaymentsQuerySchema>['query'];

/**
 * Payment response object
 */
export interface PaymentResponse {
  id: string;
  userId: string;
  enrollmentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId: string | null;
  paymentDate: Date;
  nextPaymentDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  enrollment?: {
    id: string;
    courseId: string;
    course: {
      id: string;
      title: string;
    };
    paymentPlan: PaymentPlan;
  };
}

/**
 * Enrollment response object
 */
export interface EnrollmentResponse {
  id: string;
  userId: string;
  courseId: string;
  enrollmentDate: Date;
  expiryDate: Date;
  isActive: boolean;
  paymentPlan: PaymentPlan;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
  };
  payments?: PaymentResponse[];
}

/**
 * Due payment response
 */
export interface DuePaymentResponse {
  enrollment: {
    id: string;
    userId: string;
    courseId: string;
    paymentPlan: PaymentPlan;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    course: {
      id: string;
      title: string;
    };
  };
  lastPayment: {
    id: string;
    amount: number;
    currency: string;
    paymentDate: Date;
    nextPaymentDate: Date;
  };
  daysUntilDue: number;
}