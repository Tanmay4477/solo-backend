import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  // Server configuration
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  apiVersion: process.env.API_VERSION || 'v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/solopreneur?schema=public',
  },
  
  // Authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    accessExpirationMinutes: process.env.ACCESS_EXPIRATION_MINUTES || '5',
    refreshExpirationDays: process.env.REFRESH_EXPIRATION_MINUTES || '15',
    resetPasswordExpirationMinutes: process.env.RESET_PASSWORD_EXPIRATION_MINUTES || '5',
    verifyEmailExpirationMinutes: process.env.VERIFY_EMAIL_EXPIRATION_MINUTES || '5'
  },
  
  // AWS configuration
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || 'solopreneur-content',
    cloudfrontDomain: process.env.AWS_CLOUDFRONT_DOMAIN || '',
  },
  
  // Content security
  content: {
    watermarkKey: process.env.CONTENT_WATERMARK_KEY || 'default_watermark_key',
  },
  
  // Logging
  logs: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;