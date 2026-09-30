import { randomUUID } from 'node:crypto';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

import { env } from './config/env.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

const app = express();

app.set('trust proxy', env.TRUST_PROXY_HOPS);
app.use((req, res, next) => {
  req.requestId = randomUUID().slice(0, 8);
  res.set('X-Request-Id', req.requestId);
  next();
});

app.use(helmet());
app.use(compression());
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, false);
    let normalizedOrigin;
    try {
      normalizedOrigin = new URL(origin).origin;
    } catch {
      return callback(null, false);
    }
    return callback(null, env.CLIENT_URLS.includes(normalizedOrigin) ? normalizedOrigin : false);
  },
  credentials: true,
}));

app.use(['/api/auth', '/api/admin'], (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.use(express.json({
  limit: '1mb',
  type: (req) => req.path !== '/api/public/contact' && req.is('application/json'),
}));
app.use(cookieParser());
app.use(mongoSanitize());

if (env.NODE_ENV !== 'production') morgan.token('safe-url', (req) => req.originalUrl.split('?')[0]);
app.use(morgan(env.NODE_ENV === 'production'
  ? 'combined'
  : ':method :safe-url :status :response-time ms'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' },
});

app.use('/api', apiLimiter);

app.get('/api/health', async (req, res) => {
  const response = {
    status: 'ok',
    time: new Date().toISOString(),
    uptime: process.uptime(),
  };

  if (req.query.deep !== '1') return res.status(200).json(response);

  try {
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) throw new Error('MongoDB is disconnected');
    await mongoose.connection.db.admin().ping();
    return res.status(200).json({ ...response, db: 'up' });
  } catch {
    return res.status(503).json({ ...response, status: 'error', db: 'down' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((error, req, res, _next) => {
  const isInvalidUpload = error.name === 'MulterError' || /Only .* are allowed|required\./.test(error.message || '');
  const statusCode = error.statusCode || error.status || (isInvalidUpload ? 400 : 500);
  console.error(`[${req.requestId || 'unknown'}] ${error.name || 'RequestError'}`);
  const message = env.NODE_ENV === 'production' && statusCode >= 500
    ? 'Internal server error'
    : error.message || 'Internal server error';
  return res.status(statusCode).json({ message });
});

export default app;