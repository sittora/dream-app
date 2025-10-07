// Renamed from app.ts to express-app.ts to avoid case-insensitive filesystem casing conflict with App.tsx.
// Original header comments retained.
import express, { Request, Response, NextFunction } from 'express';
import pino from 'pino';

import { TTLCache } from './lib/cache.js';
import { findJungBooks, QuerySchema, type QueryParams } from './lib/jung.js';
import { authRouter } from './server/routes.auth.simple.js';

export const app = express();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: { target: 'pino-pretty', options: { colorize: true } }
});

const searchCache = new TTLCache<any>(60_000, 200);
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'dream-app' });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), cache_size: searchCache.size() });
});

app.get('/api/jung-books', async (req: Request, res: Response) => {
  try {
    const validationResult = QuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid query parameters', details: validationResult.error.issues });
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
    res.status(500).json({ error: 'Internal server error', message: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

app.use('/api/auth', authRouter);
app.use((_req: Request, res: Response) => { res.status(404).json({ error: 'Not Found' }); });
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error({ error: error.message, stack: error.stack }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error', message: process.env.NODE_ENV === 'development' ? error.message : undefined });
});
