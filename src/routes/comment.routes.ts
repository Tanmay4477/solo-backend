import { Router } from 'express';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, isContentOwner } from '../middlewares/auth.middleware';
import { commentRateLimiter } from '../middlewares/rate-limit.middleware';
import {
  getCommentById,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  reportComment,
  replyToComment,
  getCommentReplies
} from '../controllers/comment.controller';
import {
  updateCommentSchema,
  commentIdParamsSchema,
  reportCommentSchema,
  createCommentSchema
} from '../types/community.types';

const router = Router();

/**
 * @route GET /api/v1/comments/:id
 * @desc Get comment by ID
 * @access Public
 */
router.get('/:id', validate(commentIdParamsSchema), getCommentById);

/**
 * @route PUT /api/v1/comments/:id
 * @desc Update comment (owner or admin only)
 * @access Private
 */
router.put(
  '/:id',
  authenticate,
  isContentOwner('Comment'),
  validate(updateCommentSchema),
  updateComment
);

/**
 * @route DELETE /api/v1/comments/:id
 * @desc Delete comment (soft delete, owner or admin only)
 * @access Private
 */
router.delete(
  '/:id',
  authenticate,
  isContentOwner('Comment'),
  validate(commentIdParamsSchema),
  deleteComment
);

/**
 * @route POST /api/v1/comments/:id/like
 * @desc Like a comment
 * @access Private
 */
router.post(
  '/:id/like',
  authenticate,
  validate(commentIdParamsSchema),
  likeComment
);

/**
 * @route DELETE /api/v1/comments/:id/like
 * @desc Unlike a comment
 * @access Private
 */
router.delete(
  '/:id/like',
  authenticate,
  validate(commentIdParamsSchema),
  unlikeComment
);

/**
 * @route POST /api/v1/comments/:id/report
 * @desc Report a comment
 * @access Private
 */
router.post(
  '/:id/report',
  authenticate,
  validate(reportCommentSchema),
  reportComment
);

/**
 * @route POST /api/v1/comments/:id/reply
 * @desc Reply to a comment
 * @access Private
 */
router.post(
  '/:id/reply',
  authenticate,
  commentRateLimiter,
  validate(createCommentSchema),
  replyToComment
);

/**
 * @route GET /api/v1/comments/:id/replies
 * @desc Get all replies for a comment
 * @access Public
 */
router.get(
  '/:id/replies',
  validate(commentIdParamsSchema),
  getCommentReplies
);

export default router;