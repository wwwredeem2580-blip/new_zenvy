import dotenv from 'dotenv';
dotenv.config();

import { validateEnv } from './utils/env';
validateEnv();

import express from 'express';
import router from './router';
import helmet from 'helmet';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from "cookie-parser";
import compression from 'compression';
import { authLimiter, uploadLimiter, generalLimiter } from './middlewares/rateLimiter';

export function createServer() {
  const app = express();

  // MongoDB with optimized connection pooling for production
  mongoose.connect(process.env.MONGO_URI!, {
    maxPoolSize: 200,      // Handle 200 concurrent connections
    minPoolSize: 20,       // Keep 20 connections warm
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxIdleTimeMS: 30000,
  });

  // Trust proxy for production (rate limiting, IP detection)
  app.set('trust proxy', 1);

  // Compression middleware (before routes)
  app.use(compression({
    filter: (req: any, res: any) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6 // Balance between speed and compression
  }));

  // Request size limits (prevent payload attacks)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CLIENT_URL supports comma-separated values for multiple origins:
  // e.g. CLIENT_URL=https://smartcaf.tech,https://www.smartcaf.tech
  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin '${origin}' is not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }));

  app.use(helmet());
  app.use(cookieParser());
  
  // Rate limiting
  app.use('/auth', authLimiter);
  app.use('/media', uploadLimiter);
  app.use(generalLimiter);

  app.use(router);

  app.get("/", (req, res) => {
    res.json({ message: "Server is Running!" });
  });

  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof SyntaxError) {
      return res.status(400).json({ error: 'Malformed JSON' })
    }
    next(err)
  })

  return app;
}

// Export default for backward compatibility
export default createServer();

