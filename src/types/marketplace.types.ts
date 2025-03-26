import { z } from 'zod';
import { ServiceOrderStatus, DisputeStatus } from '@prisma/client';

/**
 * Create service category schema
 */
export const createServiceCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, {
      message: 'Slug must contain only lowercase letters, numbers, and hyphens',
    }),
    description: z.string().optional(),
    icon: z.string().optional(),
    parentCategoryId: z.string().uuid().optional().nullable(),
    order: z.number().int().nonnegative().default(0),
  }),
});

/**
 * Create service category request type
 */
export type CreateServiceCategoryRequest = z.infer<typeof createServiceCategorySchema>['body'];

/**
 * Update service category schema
 */
export const updateServiceCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, {
      message: 'Slug must contain only lowercase letters, numbers, and hyphens',
    }).optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    parentCategoryId: z.string().uuid().optional().nullable(),
    order: z.number().int().nonnegative().optional(),
  }),
});

/**
 * Update service category request type
 */
export type UpdateServiceCategoryParams = z.infer<typeof updateServiceCategorySchema>['params'];
export type UpdateServiceCategoryRequest = z.infer<typeof updateServiceCategorySchema>['body'];

/**
 * Service category ID params schema
 */
export const serviceCategoryIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Service category ID params type
 */
export type ServiceCategoryIdParams = z.infer<typeof serviceCategoryIdParamsSchema>['params'];

/**
 * Get service categories query schema
 */
export const getServiceCategoriesQuerySchema = z.object({
  query: z.object({
    parentCategoryId: z.string().uuid().optional(),
    search: z.string().optional(),
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
    sortBy: z.string().optional().default('order'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

/**
 * Get service categories query type
 */
export type GetServiceCategoriesQuery = z.infer<typeof getServiceCategoriesQuerySchema>['query'];

/**
 * Create service schema
 */
export const createServiceSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid(),
    title: z.string().min(5).max(100),
    description: z.string().min(20),
    price: z.number().positive(),
    location: z.string().optional(),
    portfolioItems: z
      .array(
        z.object({
          title: z.string().min(3).max(100),
          description: z.string().optional(),
          imageUrl: z.string().url(),
          imageKey: z.string().optional(),
        })
      )
      .optional(),
  }),
});

/**
 * Create service request type
 */
export type CreateServiceRequest = z.infer<typeof createServiceSchema>['body'];

/**
 * Update service schema
 */
export const updateServiceSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    categoryId: z.string().uuid().optional(),
    title: z.string().min(5).max(100).optional(),
    description: z.string().min(20).optional(),
    price: z.number().positive().optional(),
    location: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

/**
 * Update service request type
 */
export type UpdateServiceParams = z.infer<typeof updateServiceSchema>['params'];
export type UpdateServiceRequest = z.infer<typeof updateServiceSchema>['body'];

/**
 * Service ID params schema
 */
export const serviceIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Service ID params type
 */
export type ServiceIdParams = z.infer<typeof serviceIdParamsSchema>['params'];

/**
 * Update service status schema
 */
export const updateServiceStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
});

/**
 * Update service status request type
 */
export type UpdateServiceStatusParams = z.infer<typeof updateServiceStatusSchema>['params'];
export type UpdateServiceStatusRequest = z.infer<typeof updateServiceStatusSchema>['body'];

/**
 * Verify service schema
 */
export const verifyServiceSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    isVerified: z.boolean(),
  }),
});

/**
 * Verify service request type
 */
export type VerifyServiceParams = z.infer<typeof verifyServiceSchema>['params'];
export type VerifyServiceRequest = z.infer<typeof verifyServiceSchema>['body'];

/**
 * Create portfolio item schema
 */
export const createPortfolioItemSchema = z.object({
  params: z.object({
    id: z.string().uuid(), // Service ID
  }),
  body: z.object({
    title: z.string().min(3).max(100),
    description: z.string().optional(),
    imageUrl: z.string().url(),
    imageKey: z.string().optional(),
  }),
});

/**
 * Create portfolio item request type
 */
export type CreatePortfolioItemParams = z.infer<typeof createPortfolioItemSchema>['params'];
export type CreatePortfolioItemRequest = z.infer<typeof createPortfolioItemSchema>['body'];

/**
 * Portfolio item ID params schema
 */
export const portfolioItemIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Portfolio item ID params type
 */
export type PortfolioItemIdParams = z.infer<typeof portfolioItemIdParamsSchema>['params'];

/**
 * Get services query schema
 */
export const getServicesQuerySchema = z.object({
  query: z.object({
    categoryId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    isVerified: z.string().optional().transform(val => val === 'true'),
    isActive: z.string().optional().transform(val => val === 'true'),
    minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    location: z.string().optional(),
    search: z.string().optional(),
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

/**
 * Get services query type
 */
export type GetServicesQuery = z.infer<typeof getServicesQuerySchema>['query'];

/**
 * Create service order schema
 */
export const createServiceOrderSchema = z.object({
  body: z.object({
    serviceId: z.string().uuid(),
    description: z.string().optional(),
    deliveryDate: z.coerce.date().optional(),
  }),
});

/**
 * Create service order request type
 */
export type CreateServiceOrderRequest = z.infer<typeof createServiceOrderSchema>['body'];

/**
 * Update service order status schema
 */
export const updateServiceOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.nativeEnum(ServiceOrderStatus),
    completedDate: z.coerce.date().optional(),
  }),
});

/**
 * Update service order status request type
 */
export type UpdateServiceOrderStatusParams = z.infer<typeof updateServiceOrderStatusSchema>['params'];
export type UpdateServiceOrderStatusRequest = z.infer<typeof updateServiceOrderStatusSchema>['body'];

/**
 * Service order ID params schema
 */
export const serviceOrderIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Service order ID params type
 */
export type ServiceOrderIdParams = z.infer<typeof serviceOrderIdParamsSchema>['params'];

/**
 * Get service orders query schema
 */
export const getServiceOrdersQuerySchema = z.object({
  query: z.object({
    serviceId: z.string().uuid().optional(),
    buyerId: z.string().uuid().optional(),
    status: z.nativeEnum(ServiceOrderStatus).optional(),
    hasDispute: z.string().optional().transform(val => val === 'true'),
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

/**
 * Get service orders query type
 */
export type GetServiceOrdersQuery = z.infer<typeof getServiceOrdersQuerySchema>['query'];

/**
 * Send service message schema
 */
export const sendServiceMessageSchema = z.object({
  params: z.object({
    id: z.string().uuid(), // Service order ID
  }),
  body: z.object({
    content: z.string().min(1, { message: 'Message cannot be empty' }),
  }),
});

/**
 * Send service message request type
 */
export type SendServiceMessageParams = z.infer<typeof sendServiceMessageSchema>['params'];
export type SendServiceMessageRequest = z.infer<typeof sendServiceMessageSchema>['body'];

/**
 * Submit service review schema
 */
export const submitServiceReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid(), // Service order ID
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5),
    content: z.string().min(5, { message: 'Review must be at least 5 characters long' }),
  }),
});

/**
 * Submit service review request type
 */
export type SubmitServiceReviewParams = z.infer<typeof submitServiceReviewSchema>['params'];
export type SubmitServiceReviewRequest = z.infer<typeof submitServiceReviewSchema>['body'];

/**
 * Create service dispute schema
 */
export const createServiceDisputeSchema = z.object({
  params: z.object({
    id: z.string().uuid(), // Service order ID
  }),
  body: z.object({
    reason: z.string().min(5, { message: 'Reason must be at least 5 characters long' }),
    description: z.string().min(20, { message: 'Description must be at least 20 characters long' }),
  }),
});

/**
 * Create service dispute request type
 */
export type CreateServiceDisputeParams = z.infer<typeof createServiceDisputeSchema>['params'];
export type CreateServiceDisputeRequest = z.infer<typeof createServiceDisputeSchema>['body'];

/**
 * Update dispute status schema
 */
export const updateDisputeStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(), // Dispute ID
  }),
  body: z.object({
    status: z.nativeEnum(DisputeStatus),
    resolution: z.string().optional(),
  }),
});

/**
 * Update dispute status request type
 */
export type UpdateDisputeStatusParams = z.infer<typeof updateDisputeStatusSchema>['params'];
export type UpdateDisputeStatusRequest = z.infer<typeof updateDisputeStatusSchema>['body'];

/**
 * Service category response object
 */
export interface ServiceCategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parentCategoryId: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  parentCategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count?: {
    childCategories: number;
    services: number;
  };
}

/**
 * Service response object
 */
export interface ServiceResponse {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  isVerified: boolean;
  isActive: boolean;
  rating: number | null;
  reviewCount: number;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  portfolioItems: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string;
  }[];
  reviews?: {
    id: string;
    rating: number;
    content: string;
    createdAt: Date;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profileImage: string | null;
    };
  }[];
}

/**
 * Service order response object
 */
export interface ServiceOrderResponse {
  id: string;
  serviceId: string;
  buyerId: string;
  status: ServiceOrderStatus;
  amount: number;
  description: string | null;
  deliveryDate: Date | null;
  completedDate: Date | null;
  hasDispute: boolean;
  createdAt: Date;
  updatedAt: Date;
  service: {
    id: string;
    title: string;
    price: number;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profileImage: string | null;
    };
  };
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
  review?: {
    id: string;
    rating: number;
    content: string;
    createdAt: Date;
  };
  dispute?: {
    id: string;
    reason: string;
    status: DisputeStatus;
    createdAt: Date;
  };
}

/**
 * Service message response object
 */
export interface ServiceMessageResponse {
  id: string;
  serviceOrderId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
}

/**
 * Service dispute response object
 */
export interface ServiceDisputeResponse {
  id: string;
  serviceOrderId: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  resolvedAt: Date | null;
  resolution: string | null;
  createdAt: Date;
  updatedAt: Date;
  serviceOrder: {
    id: string;
    serviceId: string;
    buyerId: string;
    status: ServiceOrderStatus;
    amount: number;
    service: {
      id: string;
      title: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
      };
    };
    buyer: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
}