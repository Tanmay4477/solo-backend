import { Router } from 'express';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, authorize, adminOnly } from '../middlewares/auth.middleware';
import { uploadProfileImage, handleMulterError } from '../middlewares/upload.middleware';
import {
  getUsers,
  getUserById,
  updateUserProfile,
  updateUserStatus,
  deleteUser,
  blockUser,
  unblockUser,
  uploadProfilePicture
} from '../controllers/user.controller';
import {
  getUsersQuerySchema,
  updateUserProfileSchema,
  updateUserStatusSchema,
  adminUpdateUserSchema
} from '../types/user.types';

const router = Router();

/**
 * @route GET /api/v1/users
 * @desc Get all users (admin only)
 * @access Private/Admin
 */
router.get('/', authenticate, adminOnly, validate(getUsersQuerySchema), getUsers);

/**
 * @route GET /api/v1/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get('/:id', authenticate, getUserById);

/**
 * @route PUT /api/v1/users/:id
 * @desc Update user profile
 * @access Private
 */
router.put('/:id', authenticate, validate(updateUserProfileSchema), updateUserProfile);

/**
 * @route DELETE /api/v1/users/:id
 * @desc Delete user (soft delete)
 * @access Private/Admin
 */
router.delete('/:id', authenticate, adminOnly, deleteUser);

/**
 * @route PATCH /api/v1/users/:id/status
 * @desc Update user status (admin only)
 * @access Private/Admin
 */
router.patch('/:id/status', authenticate, adminOnly, validate(updateUserStatusSchema), updateUserStatus);

/**
 * @route POST /api/v1/users/block/:id
 * @desc Block a user
 * @access Private
 */
router.post('/block/:id', authenticate, blockUser);

/**
 * @route DELETE /api/v1/users/block/:id
 * @desc Unblock a user
 * @access Private
 */
router.delete('/block/:id', authenticate, unblockUser);

/**
 * @route POST /api/v1/users/profile-picture
 * @desc Upload profile picture
 * @access Private
 */
router.post('/profile-picture', authenticate, uploadProfileImage, handleMulterError, uploadProfilePicture);

/**
 * @route PATCH /api/v1/users/:id/admin
 * @desc Update user profile (admin)
 * @access Private/Admin
 */
router.patch('/:id/admin', authenticate, adminOnly, validate(adminUpdateUserSchema), updateUserProfile);

export default router;