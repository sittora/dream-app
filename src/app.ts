// Application core (extracted from previous server.ts)
// NOTE: This file consolidates the existing Express app setup so that server.ts only handles listening.
// Existing API behavior (/api/health, /api/jung-books, /api/auth/*) is preserved. Added new root /health route.

import express, { Request, Response, NextFunction } from 'express';
import pino from 'pino';

import { TTLCache } from './lib/cache.js';
import { findJungBooks, QuerySchema, type QueryParams } from './lib/jung.js';
import { authRouter } from './server/routes.auth.simple.js';

export const app = express();

// Local logger for route-level logging (server.ts has its own instance for lifecycle events)
// Using pino pretty transport for dev readability without changing existing behavior.
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

// General in-memory TTL cache (carried over from original implementation)
const searchCache = new TTLCache<any>(60_000, 200);

// Middleware
app.use(express.json());

// CORS (dev-friendly; unchanged)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// New root health endpoint (NON-breaking addition) as per spec.
app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'dream-app' });
});

// Existing health endpoint (unchanged)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cache_size: searchCache.size()
  });
});

// Jung books search endpoint (unchanged logic)
app.get('/api/jung-books', async (req: Request, res: Response) => {
  try {
    const validationResult = QuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: validationResult.error.issues
      });
    }
    const { q, year, lang } = validationResult.data as QueryParams;
    const cacheKey = `${q}|${year || ''}|${lang || ''}`;
    const cached = searchCache.get(cacheKey);
    if (cached) {
      logger.info({ query: q, year, lang, cached: true }, 'Returning cached results');
      return res.json(cached);
    }
    logger.info({ query: q, year, lang }, 'Searching for Jung books');
    const results = await findJungBooks(q, year, lang);
    searchCache.set(cacheKey, results);
    logger.info({ query: q, year, lang, resultCount: results.length, cached: false }, 'Search completed');
    res.json(results);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error({ error: error.message, stack: error.stack }, 'Search error');
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Auth routes (unchanged)
app.use('/api/auth', authRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error({ error: error.message, stack: error.stack }, 'Unhandled error');
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// NOTE: No app.listen here — server.ts handles lifecycle & readiness logging.
