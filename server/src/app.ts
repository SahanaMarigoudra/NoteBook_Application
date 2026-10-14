import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { generalRateLimit } from './middleware/rate-limit.js';
import { getDatabaseStatus } from './config/database.js';

// Route modules
import authRoutes from './modules/auth/auth.routes.js';
import notesRoutes from './modules/notes/notes.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import tagsRoutes from './modules/tags/tags.routes.js';
import trashRoutes from './modules/trash/trash.routes.js';
import searchRoutes from './modules/search/search.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import usersRoutes from './modules/users/users.routes.js';

export function createApp() {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — explicit allowlist only
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // HTTP request logging
  app.use(pinoHttp({ logger }));

  // Body parsers
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: false, limit: '2mb' }));

  // Cookie parser (for refresh token HttpOnly cookie)
  app.use(cookieParser());

  // General rate limit
  app.use('/api', generalRateLimit);

  // Health endpoint
  app.get('/api/v1/health', (_req, res) => {
    const db = getDatabaseStatus();
    const status = db.connected ? 'ok' : 'degraded';
    res.status(db.connected ? 200 : 503).json({
      status,
      db: { connected: db.connected, readyState: db.readyState },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // API routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/notes', notesRoutes);
  app.use('/api/v1/categories', categoriesRoutes);
  app.use('/api/v1/tags', tagsRoutes);
  app.use('/api/v1/trash', trashRoutes);
  app.use('/api/v1/search', searchRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/users', usersRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
  });

  // Central error handler
  app.use(errorHandler);

  return app;
}
