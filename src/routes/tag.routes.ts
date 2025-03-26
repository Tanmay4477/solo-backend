import { Router } from 'express';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, adminOnly } from '../middlewares/auth.middleware';
import {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  getSuperTags,
  getSubTags
} from '../controllers/tag.controller';
import {
  getTagsQuerySchema,
  createTagSchema,
  updateTagSchema,
  tagIdParamsSchema
} from '../types/community.types';

const router = Router();

/**
 * @route GET /api/v1/tags
 * @desc Get all tags
 * @access Public
 */
router.get('/', validate(getTagsQuerySchema), getTags);

/**
 * @route GET /api/v1/tags/:id
 * @desc Get tag by ID
 * @access Public
 */
router.get('/:id', validate(tagIdParamsSchema), getTagById);

/**
 * @route POST /api/v1/tags
 * @desc Create a new tag (admin only)
 * @access Private/Admin
 */
router.post('/', authenticate, adminOnly, validate(createTagSchema), createTag);

/**
 * @route PUT /api/v1/tags/:id
 * @desc Update tag (admin only)
 * @access Private/Admin
 */
router.put('/:id', authenticate, adminOnly, validate(updateTagSchema), updateTag);

/**
 * @route DELETE /api/v1/tags/:id
 * @desc Delete tag (soft delete, admin only)
 * @access Private/Admin
 */
router.delete('/:id', authenticate, adminOnly, validate(tagIdParamsSchema), deleteTag);

/**
 * @route GET /api/v1/tags/super
 * @desc Get all super tags
 * @access Public
 */
router.get('/super', getSuperTags);

/**
 * @route GET /api/v1/tags/:id/sub
 * @desc Get all sub-tags for a super tag
 * @access Public
 */
router.get('/:id/sub', validate(tagIdParamsSchema), getSubTags);

export default router;