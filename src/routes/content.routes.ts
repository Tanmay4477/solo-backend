import { Router } from 'express';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, adminOnly, isContentOwner } from '../middlewares/auth.middleware';
import { uploadVideoContent, uploadDocument, handleMulterError } from '../middlewares/upload.middleware';
import { uploadRateLimiter } from '../middlewares/rate-limit.middleware';
import {
  getContents,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  updateContentOrder,
  addVideoComment,
  getVideoComments,
  deleteVideoComment,
  uploadContentFile
} from '../controllers/content.controller';
import {
  getContentsQuerySchema,
  createContentSchema,
  updateContentSchema,
  contentIdParamsSchema,
  updateContentOrderSchema,
  addVideoCommentSchema,
  getVideoCommentsSchema,
  deleteVideoCommentSchema
} from '../types/content.types';

const router = Router();

/**
 * @route GET /api/v1/contents
 * @desc Get all contents
 * @access Public
 */
router.get('/', validate(getContentsQuerySchema), getContents);

/**
 * @route GET /api/v1/contents/:id
 * @desc Get content by ID
 * @access Public
 */
router.get('/:id', validate(contentIdParamsSchema), getContentById);

/**
 * @route POST /api/v1/contents
 * @desc Create new content (admin only)
 * @access Private/Admin
 */
router.post('/', authenticate, adminOnly, validate(createContentSchema), createContent);

/**
 * @route PUT /api/v1/contents/:id
 * @desc Update content (admin only)
 * @access Private/Admin
 */
router.put('/:id', authenticate, adminOnly, validate(updateContentSchema), updateContent);

/**
 * @route DELETE /api/v1/contents/:id
 * @desc Delete content (soft delete, admin only)
 * @access Private/Admin
 */
router.delete('/:id', authenticate, adminOnly, validate(contentIdParamsSchema), deleteContent);

/**
 * @route PATCH /api/v1/contents/:id/order
 * @desc Update content order (admin only)
 * @access Private/Admin
 */
router.patch(
  '/:id/order',
  authenticate,
  adminOnly,
  validate(updateContentOrderSchema),
  updateContentOrder
);

/**
 * @route POST /api/v1/contents/:id/comments
 * @desc Add comment to video content
 * @access Private
 */
router.post(
  '/:id/comments',
  authenticate,
  validate(addVideoCommentSchema),
  addVideoComment
);

/**
 * @route GET /api/v1/contents/:id/comments
 * @desc Get all comments for video content
 * @access Public
 */
router.get(
  '/:id/comments',
  validate(getVideoCommentsSchema),
  getVideoComments
);

/**
 * @route DELETE /api/v1/contents/comments/:id
 * @desc Delete a video comment
 * @access Private
 */
router.delete(
  '/comments/:id',
  authenticate,
  validate(deleteVideoCommentSchema),
  isContentOwner('VideoComment'),
  deleteVideoComment
);

/**
 * @route POST /api/v1/contents/upload/video
 * @desc Upload video content
 * @access Private/Admin
 */
router.post(
  '/upload/video',
  authenticate,
  adminOnly,
  uploadRateLimiter,
  uploadVideoContent,
  handleMulterError,
  uploadContentFile
);

/**
 * @route POST /api/v1/contents/upload/document
 * @desc Upload document content
 * @access Private/Admin
 */
router.post(
  '/upload/document',
  authenticate,
  adminOnly,
  uploadRateLimiter,
  uploadDocument,
  handleMulterError,
  uploadContentFile
);

export default router;