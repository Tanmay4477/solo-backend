import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { ApiError } from './error.middleware';
import { formatFileSize } from '../utils/file-utils';

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// File size limits in bytes
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB

// Configure multer storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (allowedTypes: string[], maxSize: number) => {
  return (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
    }
    
    // Note: We can't check file.size here because it's not available yet
    // The size check will be handled by multer's limits option
    
    cb(null, true);
  };
};

// Create upload instances for different file types
export const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE)
});

export const uploadVideo = multer({
  storage,
  limits: { fileSize: MAX_VIDEO_SIZE },
  fileFilter: fileFilter(ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE)
});

export const uploadDocument = multer({
  storage,
  limits: { fileSize: MAX_DOCUMENT_SIZE },
  fileFilter: fileFilter(ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE)
});

// Create upload instances for specific use cases
export const uploadProfileImage = uploadImage.single('profileImage');
export const uploadCourseThumbnail = uploadImage.single('thumbnail');
export const uploadCourseContent = uploadDocument.single('content');
export const uploadVideoContent = uploadVideo.single('video');
export const uploadPostAttachment = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (req, file, cb) => {
    // Allow both images and videos for post attachments
    if ([...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(', ')}`));
    }
  }
}).array('attachments', 5); // Allow up to 5 attachments per post

export const uploadServicePortfolio = uploadImage.array('portfolioImages', 10); // Allow up to 10 portfolio images

// Middleware to handle multer errors
export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const sizeMap: {[key: string]: number} = {
        'profileImage': MAX_IMAGE_SIZE,
        'thumbnail': MAX_IMAGE_SIZE,
        'content': MAX_DOCUMENT_SIZE,
        'video': MAX_VIDEO_SIZE,
        'attachments': MAX_IMAGE_SIZE,
        'portfolioImages': MAX_IMAGE_SIZE
      };
      
      const maxSize = err.field && sizeMap[err.field] ? sizeMap[err.field] : MAX_IMAGE_SIZE;
      return next(new ApiError(`File too large. Maximum size: ${formatFileSize(maxSize)}`, 400));
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new ApiError(`Unexpected field: ${err.field || 'unknown'}`, 400));
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new ApiError('Too many files uploaded', 400));
    }
    
    return next(new ApiError(`Upload error: ${err.message}`, 400));
  } else if (err) {
    // Handle errors from our custom fileFilter
    return next(new ApiError(err.message || 'File upload error', 400));
  }
  
  next(err);
};

// Middleware to validate file type after upload
export const validateFileType = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new ApiError('No file provided', 400));
  }
  
  const file = req.file;
  
  // Extract file extension
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  // Map of allowed extensions for different file types
  const allowedExtensions: {[key: string]: string[]} = {
    'image': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    'video': ['.mp4', '.webm', '.ogg'],
    'document': ['.pdf', '.doc', '.docx']
  };
  
  // Check file type based on URL path
  if (req.originalUrl.includes('/uploads/image') && !allowedExtensions.image.includes(fileExtension)) {
    return next(new ApiError(`Invalid image file type. Allowed types: ${allowedExtensions.image.join(', ')}`, 400));
  } else if (req.originalUrl.includes('/uploads/video') && !allowedExtensions.video.includes(fileExtension)) {
    return next(new ApiError(`Invalid video file type. Allowed types: ${allowedExtensions.video.join(', ')}`, 400));
  } else if (req.originalUrl.includes('/uploads/document') && !allowedExtensions.document.includes(fileExtension)) {
    return next(new ApiError(`Invalid document file type. Allowed types: ${allowedExtensions.document.join(', ')}`, 400));
  }
  
  next();
};

// Middleware to check file content
export const validateFileContent = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }
  
  const file = req.file;
  
  // Basic file header checks could be implemented here
  // For example, checking the first few bytes of the file to ensure it matches the expected file type
  
  // For now, we'll just pass through as multer has already done basic validation
  next();
};