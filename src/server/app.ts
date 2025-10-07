import express, { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import pino from 'pino';
import pinoHttp from 'pino-http';

import { TTLCache } from '../lib/cache.js';
import { findJungBooks, QuerySchema, type QueryParams } from '../lib/jung.js';
import { logger as baseLogger } from '../lib/logger.server.js';

// Use full auth router (replaces simple placeholder)
import { authRouter as fullAuthRouter } from './routes.auth.js';
import { validateBody, validateResponse } from '../api/validate.js';
import { loginRequestSchema, registerRequestSchema, refreshRequestSchema, loginResponseSchema, registerResponseSchema, refreshResponseSchema } from '../api/schemas/auth.js';

export const app = express();

// Existing route-level logger (retained; naming preserved)
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: { target: 'pino-pretty', options: { colorize: true } }
});

const searchCache = new TTLCache<any>(60_000, 200);

app.use(express.json());
// Correlation / request id (added before logging)
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).id = (req as any).id || nanoid(10); // short but collision-resistant for ephemeral tracing
  next();
});
// Request logging (additive, non-breaking) with correlation id + redaction via baseLogger.
// Disabled under test (NODE_ENV=test) or when Vitest worker env vars are present to avoid noisy unit test output.
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST && !process.env.VITEST_WORKER_ID) {
  app.use(pinoHttp({
    logger: baseLogger as any,
    genReqId: (req) => (req as any).id,
    customProps: (req) => ({ requestId: (req as any).id }),
    customLogLevel: (_req: Request, res: Response, err: Error | undefined) => {
      if (err) return 'error';
      if (res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    }
  }));
}

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

// Version metadata (additive, no existing contract changes)
app.get('/version', (_req, res) => {
  const full = process.env.GIT_SHA || 'unknown';
  const short = full === 'unknown' ? full : full.slice(0, 7);
  res.status(200).json({
    service: 'dream-app',
    gitSha: short,
    env: process.env.NODE_ENV || 'development'
  });
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

// Decorate full auth router with request validation on key POST routes (additive, shadow by default)
const authMount = express.Router();
authMount.post('/login', validateBody(loginRequestSchema), validateResponse(loginResponseSchema), (req, res, next) => (fullAuthRouter as any).handle({ ...req, url: '/login', originalUrl: req.originalUrl }, res, next));
authMount.post('/register', validateBody(registerRequestSchema), validateResponse(registerResponseSchema), (req, res, next) => (fullAuthRouter as any).handle({ ...req, url: '/register', originalUrl: req.originalUrl }, res, next));
authMount.post('/refresh', validateBody(refreshRequestSchema), validateResponse(refreshResponseSchema), (req, res, next) => (fullAuthRouter as any).handle({ ...req, url: '/refresh', originalUrl: req.originalUrl }, res, next));
// Delegate all other auth routes untouched
authMount.use((req, res, next) => (fullAuthRouter as any).handle(req, res, next));
app.use('/api/auth', authMount);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error({ error: error.message, stack: error.stack }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error', message: process.env.NODE_ENV === 'development' ? error.message : undefined });
});
