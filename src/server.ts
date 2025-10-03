import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import pino from 'pino';
import { findJungBooks, QuerySchema, type QueryParams } from './lib/jung.js';
import { TTLCache } from './lib/cache.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

// Cache for search results (60s TTL, max 200 entries)
const searchCache = new TTLCache<any>(60_000, 200);

// Middleware
app.use(express.json());

// CORS for development
app.use((req: Request, res: Response, next: NextFunction) => {
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
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    cache_size: searchCache.size()
  });
});

// Jung books search endpoint
app.get('/api/jung-books', async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const validationResult = QuerySchema.safeParse(req.query);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: validationResult.error.issues
      });
    }
    
    const { q, year, lang } = validationResult.data as QueryParams;
    
    // Create cache key
    const cacheKey = `${q}|${year || ''}|${lang || ''}`;
    
    // Check cache first
    const cached = searchCache.get(cacheKey);
    if (cached) {
      logger.info({ query: q, year, lang, cached: true }, 'Returning cached results');
      return res.json(cached);
    }
    
    logger.info({ query: q, year, lang }, 'Searching for Jung books');
    
    // Perform search
    const results = await findJungBooks(q, year, lang);
    
    // Cache results
    searchCache.set(cacheKey, results);
    
    logger.info({ 
      query: q, 
      year, 
      lang, 
      resultCount: results.length,
      cached: false 
    }, 'Search completed');
    
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

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error({ error: error.message, stack: error.stack }, 'Unhandled error');
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Jung Books API server started');
  console.log(`🔍 Jung Books API running at http://localhost:${PORT}`);
  console.log(`📚 Try: http://localhost:${PORT}/api/jung-books?q=psychological%20types`);
});

export default app;