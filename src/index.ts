import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import config from '@/config';
import routes from "@/routes"

export const prisma = new PrismaClient();

const app = express();
const allowedOrigins = [config.corsOriginUser, config.corsOriginAdmin, 'http://localhost:3000', 'http://localhost:8081'];

app.use(helmet());

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(morgan('dev')); 

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
    return;
});

app.use('/api/v1/', routes);

app.listen(config.port, () => {
    console.log(`Server running in ${config.env} mode on port ${config.port}`);
    console.log(`API available at: http://localhost:${config.port}/api/v1/}`);
});

process.on('unhandledRejection', (error: Error) => {
    console.error(`Unhandled Rejection: ${error?.message}`);
    
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