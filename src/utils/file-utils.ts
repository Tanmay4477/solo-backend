import path from 'path';
import crypto from 'crypto';
import { getFileExtension, isImageFile, isVideoFile, isDocumentFile } from './validators';

/**
 * Utility functions for file operations
 */

/**
 * Generate a unique filename for uploaded files
 * @param {string} originalFilename - Original filename
 * @returns {string} Unique filename
 */
export const generateUniqueFilename = (originalFilename: string): string => {
  const ext = path.extname(originalFilename);
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${random}${ext}`;
};

/**
 * Generate a unique key for S3 storage
 * @param {string} folder - Destination folder in S3
 * @param {string} originalFilename - Original filename
 * @returns {string} Unique S3 key
 */
export const generateS3Key = (folder: string, originalFilename: string): string => {
  const filename = generateUniqueFilename(originalFilename);
  return `${folder}/${filename}`;
};

/**
 * Determine the appropriate S3 folder based on file type
 * @param {string} mimeType - File MIME type
 * @returns {string} S3 folder path
 */
export const determineS3Folder = (mimeType: string): string => {
  if (isImageFile(mimeType)) {
    return 'images';
  } else if (isVideoFile(mimeType)) {
    return 'videos';
  } else if (isDocumentFile(mimeType)) {
    return 'documents';
  } else {
    return 'other';
  }
};

/**
 * Validate file size
 * @param {number} fileSize - File size in bytes
 * @param {string} fileType - File type (image, video, document)
 * @returns {{ valid: boolean, maxSize: number }} Validation result
 */
export const validateFileSize = (
  fileSize: number,
  fileType: 'image' | 'video' | 'document'
): { valid: boolean; maxSize: number } => {
  const MB = 1024 * 1024;
  let maxSize: number;

  switch (fileType) {
    case 'image':
      maxSize = 5 * MB; // 5MB
      break;
    case 'video':
      maxSize = 500 * MB; // 500MB
      break;
    case 'document':
      maxSize = 50 * MB; // 50MB
      break;
    default:
      maxSize = 10 * MB; // 10MB
  }

  return {
    valid: fileSize <= maxSize,
    maxSize,
  };
};

/**
 * Get file type from MIME type
 * @param {string} mimeType - File MIME type
 * @returns {string} File type (image, video, document, other)
 */
export const getFileTypeFromMimeType = (mimeType: string): string => {
  if (isImageFile(mimeType)) {
    return 'image';
  } else if (isVideoFile(mimeType)) {
    return 'video';
  } else if (isDocumentFile(mimeType)) {
    return 'document';
  } else {
    return 'other';
  }
};

/**
 * Get content type for S3 upload
 * @param {string} filename - File name
 * @returns {string} Content type
 */
export const getContentType = (filename: string): string => {
  const ext = getFileExtension(filename);
  
  const contentTypeMap: { [key: string]: string } = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  
  return contentTypeMap[ext] || 'application/octet-stream';
};

/**
 * Calculate video duration from metadata
 * @param {any} metadata - Video metadata
 * @returns {number | null} Duration in seconds or null if not found
 */
export const calculateVideoDuration = (metadata: any): number | null => {
  if (metadata && metadata.format && metadata.format.duration) {
    return Math.round(parseFloat(metadata.format.duration));
  }
  return null;
};

/**
 * Generate watermark text for files
 * @param {string} userId - User ID
 * @param {string} userName - User name
 * @returns {string} Watermark text
 */
export const generateWatermarkText = (userId: string, userName: string): string => {
  const timestamp = new Date().toISOString();
  return `SoloPreneur | ${userName} | ${userId.substring(0, 8)} | ${timestamp}`;
};

/**
 * Format file size into human-readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Check if the file has a valid extension
 * @param {string} filename - File name to check
 * @param {string[]} allowedExtensions - Array of allowed extensions (e.g., ['.jpg', '.png'])
 * @returns {boolean} True if extension is allowed
 */
export const hasValidExtension = (filename: string, allowedExtensions: string[]): boolean => {
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
};

/**
 * Extract filename without extension
 * @param {string} filename - File name
 * @returns {string} Filename without extension
 */
export const getFilenameWithoutExtension = (filename: string): string => {
  return path.basename(filename, path.extname(filename));
};

/**
 * Convert buffer to Base64 string
 * @param {Buffer} buffer - Buffer to convert
 * @returns {string} Base64 string
 */
export const bufferToBase64 = (buffer: Buffer): string => {
  return buffer.toString('base64');
};

/**
 * Get S3 public URL for a file
 * @param {string} bucket - S3 bucket name
 * @param {string} key - S3 object key
 * @param {string} region - AWS region
 * @returns {string} S3 public URL
 */
export const getS3PublicUrl = (bucket: string, key: string, region: string): string => {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};