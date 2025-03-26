import { Router } from 'express';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, adminOnly, isContentOwner } from '../middlewares/auth.middleware';
import { uploadPostAttachment, handleMulterError } from '../middlewares/upload.middleware';
import { postCreationRateLimiter } from '../middlewares/rate-limit.middleware';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  pinPost,
  likePost,
  unlikePost,
  reportPost,
  getPostComments,
  addCommentToPost,
  getPostsByTag,
  getPostsByUser
} from '../controllers/post.controller';
import {
  getPostsQuerySchema,
  createPostSchema,
  updatePostSchema,
  postIdParamsSchema,
  pinPostSchema,
  reportPostSchema,
  createCommentSchema,
  getCommentsQuerySchema
} from '../types/community.types';

const router = Router();

/**
 * @route GET /api/v1/posts
 * @desc Get all posts
 * @access Public
 */
router.get('/', validate(getPostsQuerySchema), getPosts);

/**
 * @route GET /api/v1/posts/:id
 * @desc Get post by ID
 * @access Public
 */
router.get('/:id', validate(postIdParamsSchema), getPostById);

/**
 * @route POST /api/v1/posts
 * @desc Create a new post
 * @access Private
 */
router.post(
  '/',
  authenticate,
  postCreationRateLimiter,
  uploadPostAttachment,
  handleMulterError,
  validate(createPostSchema),
  createPost
);

/**
 * @route PUT /api/v1/posts/:id
 * @desc Update post (owner or admin only)
 * @access Private
 */
router.put(
  '/:id',
  authenticate,
  isContentOwner('Post'),
  validate(updatePostSchema),
  updatePost
);

/**
 * @route DELETE /api/v1/posts/:id
 * @desc Delete post (soft delete, owner or admin only)
 * @access Private
 */
router.delete(
  '/:id',
  authenticate,
  isContentOwner('Post'),
  validate(postIdParamsSchema),
  deletePost
);

/**
 * @route PATCH /api/v1/posts/:id/pin
 * @desc Pin/unpin post (admin only)
 * @access Private/Admin
 */
router.patch(
  '/:id/pin',
  authenticate,
  adminOnly,
  validate(pinPostSchema),
  pinPost
);

/**
 * @route POST /api/v1/posts/:id/like
 * @desc Like a post
 * @access Private
 */
router.post(
  '/:id/like',
  authenticate,
  validate(postIdParamsSchema),
  likePost
);

/**
 * @route DELETE /api/v1/posts/:id/like
 * @desc Unlike a post
 * @access Private
 */
router.delete(
  '/:id/like',
  authenticate,
  validate(postIdParamsSchema),
  unlikePost
);

/**
 * @route POST /api/v1/posts/:id/report
 * @desc Report a post
 * @access Private
 */
router.post(
  '/:id/report',
  authenticate,
  validate(reportPostSchema),
  reportPost
);

/**
 * @route GET /api/v1/posts/:id/comments
 * @desc Get all comments for a post
 * @access Public
 */
router.get(
  '/:id/comments',
  validate(getCommentsQuerySchema),
  getPostComments
);

/**
 * @route POST /api/v1/posts/:id/comments
 * @desc Add comment to a post
 * @access Private
 */
router.post(
  '/:id/comments',
  authenticate,
  validate(createCommentSchema),
  addCommentToPost
);

/**
 * @route GET /api/v1/posts/tag/:tagId
 * @desc Get all posts for a tag
 * @access Public
 */
router.get(
  '/tag/:tagId',
  validate(postIdParamsSchema),
  getPostsByTag
);

/**
 * @route GET /api/v1/posts/user/:userId
 * @desc Get all posts for a user
 * @access Public
 */
router.get(
  '/user/:userId',
  getPostsByUser
);

export default router;