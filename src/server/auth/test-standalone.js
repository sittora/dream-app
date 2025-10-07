#!/usr/bin/env node

/**
 * Standalone test script for auth endpoints
 * Run with: node src/server/auth/test-standalone.js
 */

import express from 'express';

import { logger } from '../../lib/logger.server.js';
import { authRouter } from '../routes.auth.js';

const app = express();
const PORT = process.env.PORT || 8787;

// Middleware
app.use(express.json());

// CORS for testing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount auth routes
app.use('/api/auth', authRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error({ err }, 'Standalone auth error');
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Auth API server running');
  logger.info({ port: PORT }, 'Test registration: POST /api/auth/register { email,password,displayName }');
  
  // Run a self-test after a short delay
  setTimeout(async () => {
    try {
      const response = await fetch(`http://localhost:${PORT}/api/health`);
      const data = await response.json();
      logger.info({ data }, 'Health check passed');
    } catch (error) {
      logger.error({ err: error }, 'Health check failed');
    }
  }, 1000);
});

export default app;