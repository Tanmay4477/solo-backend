import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

// Import configuration
import config from '@/config';

// Initialize Prisma client
export const prisma = new PrismaClient();

// Create Express app
const app = express();

// Apply middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(morgan('dev')); // HTTP request logger

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// API routes (to be implemented)
app.use(`/api/${config.apiVersion}`, (req: Request, res: Response) => {
  res.status(200).json({ message: 'SoloPreneur API is running' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`Error: ${err.message}`);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Route not found handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(config.port, () => {
  console.log(`Server running in ${config.env} mode on port ${config.port}`);
  console.log(`API available at: http://localhost:${config.port}/api/${config.apiVersion}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error: Error) => {
  console.error(`Unhandled Rejection: ${error.message}`);
  
  // Close the Prisma client and server gracefully
  prisma.$disconnect()
    .then(() => {
      process.exit(1);
    })
    .catch(() => {
      process.exit(1);
    });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  prisma.$disconnect()
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
});