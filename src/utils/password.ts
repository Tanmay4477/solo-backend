import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Hash a password
 * @param {string} password - The plain password to hash
 * @returns {Promise<string>} The hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a plain password with a hashed password
 * @param {string} password - The plain password
 * @param {string} hashedPassword - The hashed password
 * @returns {Promise<boolean>} Whether the password matches
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate a random password
 * @param {number} length - The length of the password
 * @returns {string} A random password
 */
export const generateRandomPassword = (length: number = 12): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  
  // Ensure password has at least one character from each category
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  
  // Fill the rest of the password with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

/**
 * Generate a secure token
 * @param {number} length - The length of the token in bytes
 * @returns {string} A random hexadecimal token
 */
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {object} Validation result with score and feedback
 */
export const validatePasswordStrength = (password: string): {
  score: number;
  isStrong: boolean;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else {
    score += 1;
  }
  
  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push('Password should contain at least one uppercase letter');
  } else {
    score += 1;
  }
  
  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push('Password should contain at least one lowercase letter');
  } else {
    score += 1;
  }
  
  // Number check
  if (!/\d/.test(password)) {
    feedback.push('Password should contain at least one number');
  } else {
    score += 1;
  }
  
  // Special character check
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    feedback.push('Password should contain at least one special character');
  } else {
    score += 1;
  }
  
  return {
    score,
    isStrong: score >= 4,
    feedback: feedback.length > 0 ? feedback : ['Password is strong']
  };
};