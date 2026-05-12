import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config/env';
import { logger } from './utils/logger';
import { globalErrorHandler } from './utils/errors';
import authRoutes from './routes/authRoutes';
import urlRoutes from './routes/urlRoutes';

const app = express();

// Security headers
app.set('trust proxy', 1);
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.nodeEnv === 'production' ? process.env.FRONTEND_URL : '*',
    credentials: true,
  })
);

// Compression & parsing
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging
if (config.nodeEnv !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/', urlRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use(globalErrorHandler);

export default app;
