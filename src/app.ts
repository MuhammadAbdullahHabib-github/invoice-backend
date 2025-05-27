import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import dotenv from 'dotenv';

import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import invoiceRoutes from './routes/invoices';
import adminRoutes from './routes/admin';
import productRoutes from './routes/products';
import pdfTemplateSettingsRoutes from './routes/pdfTemplateSettings';
import { ErrorResponse } from './utils/error';
import { requestLogger, errorLogger } from './middlewares/logging';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'https://carlinegarage.netlify.app',
    // Add other allowed origins here if needed
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: '*',
  credentials: true
}));
app.use(express.json());

// Logging middleware
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 1000,
});
// Only use rate limiter in production
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
}

// API Documentation
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
const BASE = process.env.BASE_URL || '/api';
app.use(`${BASE}/auth`, authRoutes);
app.use(`${BASE}/customers`, customerRoutes);
app.use(`${BASE}/invoices`, invoiceRoutes);
app.use(`${BASE}/admin`, adminRoutes);
app.use(`${BASE}/products`, productRoutes);
app.use(`${BASE}/pdf-template-settings`, pdfTemplateSettingsRoutes);

// Simple test route
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello, I am working!' });
});

// Error handling
app.use(errorLogger);
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const error = err instanceof ErrorResponse ? err : new ErrorResponse('Internal Server Error');
  res.status(error.statusCode).json({ message: error.message });
});

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  try {
    console.log('Starting server...');
    console.log(`Port: ${PORT}`);
    console.log(`Base URL: ${process.env.BASE_URL || '/api'}`);
    
    await connectDB();
    const server = app.listen(Number(PORT) , '0.0.0.0' ,() => {
      console.log(`Server is running on http://0.0.0.0:${PORT}`);
      logger.info(`Server running on ${process.env.BASE_URL || `http://0.0.0.0:${PORT}/api`}`);
    });

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start the server if we're not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app; 