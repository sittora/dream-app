import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

import { logger } from '../lib/logger.server.js';

function isRouteStrict(path: string): boolean {
  const csv = process.env.VALIDATION_STRICT_ROUTES;
  if (!csv) return false;
  const set = new Set(csv.split(',').map(p => p.trim()).filter(Boolean));
  return set.has(path);
}

export function getValidationMode(path: string, isResponse = false): 'shadow' | 'strict' {
  const globalFlag = isResponse ? process.env.ENABLE_RESPONSE_VALIDATION === 'true' : process.env.ENABLE_API_VALIDATION === 'true';
  if (globalFlag) return 'strict';
  if (isRouteStrict(path)) return 'strict';
  return 'shadow';
}

// Shadow validation middleware: warns by default, enforces only when ENABLE_API_VALIDATION=true
export function validateBody(schema: z.ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (result.success) {
      (req as any).validatedBody = result.data;
      return next();
    }
    const issues = result.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }));
    if (getValidationMode(req.path) === 'strict') {
      return res.status(400).json({ error: 'Validation failed', details: issues });
    }
    logger.warn({ issues, route: req.path }, 'Shadow validation failed (non-blocking)');
    return next();
  };
}

// Optional shadow response validation (auth only right now)
export function validateResponse(schema: z.ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      const result = schema.safeParse(body);
      if (!result.success) {
        const issues = result.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }));
        if (getValidationMode(req.path, true) === 'strict') {
          // Prefer new RESPONSE_VALIDATION_STATUS; fall back to legacy RESPONSE_VALIDATION_STRICT_STATUS; default 500
          const statusEnv = process.env.RESPONSE_VALIDATION_STATUS || process.env.RESPONSE_VALIDATION_STRICT_STATUS;
          const status = Number(statusEnv || 500);
          res.status(status);
          return originalJson({ error: 'Response validation failed', details: issues });
        }
        logger.warn({ issues, route: req.path }, 'Shadow response validation failed (non-blocking)');
      }
      return originalJson(body);
    };
    next();
  };
}
