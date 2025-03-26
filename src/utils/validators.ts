/**
 * Custom validation utilities
 */

/**
 * Check if string is a valid UUID v4
 * @param {string} str - String to check
 * @returns {boolean} True if valid UUID
 */
export const isUuid = (str: string): boolean => {
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Regex.test(str);
  };
  
  /**
   * Check if string is a valid email
   * @param {string} email - Email to check
   * @returns {boolean} True if valid email
   */
  export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Check if password meets strength requirements
   * @param {string} password - Password to check
   * @returns {{ isValid: boolean, message: string }} Validation result
   */
  export const isStrongPassword = (
    password: string
  ): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return {
        isValid: false,
        message: 'Password must be at least 8 characters long',
      };
    }
  
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
  
    if (!hasUppercase || !hasLowercase || !hasDigit) {
      return {
        isValid: false,
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      };
    }
  
    return { isValid: true, message: '' };
  };
  
  /**
   * Normalize string for search (removes diacritics, lowercases, etc.)
   * @param {string} str - String to normalize
   * @returns {string} Normalized string
   */
  export const normalizeString = (str: string): string => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  };
  
  /**
   * Generate a random string
   * @param {number} length - Length of the random string
   * @returns {string} Random string
   */
  export const generateRandomString = (length = 10): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  /**
   * Extract YouTube video ID from URL
   * @param {string} url - YouTube URL
   * @returns {string|null} YouTube video ID or null if not found
   */
  export const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
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
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid URL
   */
  export const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Extract file extension from filename
   * @param {string} filename - Filename to extract extension from
   * @returns {string} File extension (e.g., "pdf")
   */
  export const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };
  
  /**
   * Check if file is an image
   * @param {string} mimeType - File MIME type
   * @returns {boolean} True if file is an image
   */
  export const isImageFile = (mimeType: string): boolean => {
    return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType);
  };
  
  /**
   * Check if file is a video
   * @param {string} mimeType - File MIME type
   * @returns {boolean} True if file is a video
   */
  export const isVideoFile = (mimeType: string): boolean => {
    return ['video/mp4', 'video/webm', 'video/ogg'].includes(mimeType);
  };
  
  /**
   * Check if file is a document
   * @param {string} mimeType - File MIME type
   * @returns {boolean} True if file is a document
   */
  export const isDocumentFile = (mimeType: string): boolean => {
    return [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ].includes(mimeType);
  };