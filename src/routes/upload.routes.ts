import { Router } from 'express';
import { authenticate, adminOnly } from '../middlewares/auth.middleware';
import { 
  uploadImage, 
  uploadVideo, 
  uploadDocument, 
  handleMulterError, 
  validateFileType, 
  validateFileContent 
} from '../middlewares/upload.middleware';
import { uploadRateLimiter } from '../middlewares/rate-limit.middleware';
import {
  uploadImageHandler,
  uploadVideoHandler,
  uploadDocumentHandler,
  deleteUploadedFile,
  getSignedUrl
} from '../controllers/upload.controller';

const router = Router();

/**
 * @route POST /api/v1/uploads/image
 * @desc Upload an image
 * @access Private
 */
router.post(
  '/image',
  authenticate,
  uploadRateLimiter,
  uploadImage.single('image'),
  handleMulterError,
  validateFileType,
  validateFileContent,
  uploadImageHandler
);

/**
 * @route POST /api/v1/uploads/video
 * @desc Upload a video
 * @access Private
 */
router.post(
  '/video',
  authenticate,
  uploadRateLimiter,
  uploadVideo.single('video'),
  handleMulterError,
  validateFileType,
  validateFileContent,
  uploadVideoHandler
);

/**
 * @route POST /api/v1/uploads/document
 * @desc Upload a document
 * @access Private
 */
router.post(
  '/document',
  authenticate,
  uploadRateLimiter,
  uploadDocument.single('document'),
  handleMulterError,
  validateFileType,
  validateFileContent,
  uploadDocumentHandler
);

/**
 * @route DELETE /api/v1/uploads/:key
 * @desc Delete uploaded file (admin only)
 * @access Private/Admin
 */
router.delete('/:key', authenticate, adminOnly, deleteUploadedFile);

/**
 * @route GET /api/v1/uploads/signed-url/:key
 * @desc Get a signed URL for file access
 * @access Private
 */
router.get('/signed-url/:key', authenticate, getSignedUrl);

export default router;