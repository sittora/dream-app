import { type NextFunction, type Request, type Response } from 'express';
import { jwtVerify } from 'jose';
import { logger } from '../services/logger';
import { rateLimit } from '../services/rateLimit';
import { env } from '../config';

// Extend the Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: any;
}

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No token provided');
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    logger.error('Authentication failed', { error });
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export async function rateLimiter(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.ip || 'unknown';
    await rateLimit.checkLimit(key);
    next();
  } catch (error) {
    res.status(429).json({ error: 'Too many requests' });
  }
}