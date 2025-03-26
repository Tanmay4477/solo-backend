import winston from 'winston';
import config from '@/config';

// Define transports with a flexible type
const transports: winston.transport[] = [
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  new winston.transports.File({ filename: 'logs/combined.log' }),
];

// Add console transport in non-production environments
if (config.env !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Logger configuration
const loggerConfig: winston.LoggerOptions = {
  level: config.logs.level,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'solopreneur-backend' },
  transports, // Use the properly typed transports array
};

// Create the logger instance
const logger = winston.createLogger(loggerConfig);

export default logger;
