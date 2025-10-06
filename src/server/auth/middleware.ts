import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import pino from 'pino';
import { isTokenBlacklisted } from './logout.js';

// Create logger instance
const logger = pino({
  name: 'auth-middleware',
  level: process.env.LOG_LEVEL || 'info',
});

// JWT configuration
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');

/**
 * Middleware to authenticate user tokens
 */
export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!token) {
    res.status(401).json({
      error: 'Access denied',
      message: 'No token provided',
    });
    return;
  }

  // Check if token is blacklisted
  if (isTokenBlacklisted(token)) {
    res.status(401).json({
      error: 'Token invalid',
      message: 'This token has been revoked',
    });
    return;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Add user information to request
    req.user = {
      id: payload.sub as string,
      email: payload.email as string,
      username: payload.username as string,
      role: (payload.role as string) || 'user',
    };

    next();
  } catch (error) {
    if (error instanceof Error && error.message.includes('expired')) {
      res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please log in again.',
      });
    } else {
      res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid',
      });
    }
  }
}

/**
 * Optional authentication middleware - doesn't require token but will set user if valid token provided
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!token) {
    // No token provided, continue without user
    next();
    return;
  }

  // Check if token is blacklisted
  if (isTokenBlacklisted(token)) {
    // Invalid token, continue without user
    next();
    return;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Add user information to request
    req.user = {
      id: payload.sub as string,
      email: payload.email as string,
      username: payload.username as string,
      role: (payload.role as string) || 'user',
    };

    next();
  } catch (error) {
    // Invalid token, continue without user
    next();
  }
}

/**
 * Middleware to check if user is admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      error: 'Access forbidden',
      message: 'Admin privileges required',
    });
    return;
  }

  next();
}

/**
 * Get current user information from token
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access your profile',
      });
      return;
    }

    // In a real application, you might want to fetch fresh user data from database
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });

  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Get current user failed');
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user information',
    });
  }
}