import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

/**
 * CSRF protection using double-submit cookie pattern
 * Protects state-changing routes (POST/PUT/PATCH/DELETE)
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Set CSRF token in cookie and make it available to client
 */
export function setCSRFToken(req: Request, res: Response): string {
  const token = generateCSRFToken();
  
  // Set secure cookie
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Client needs to read this for AJAX requests
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  });
  
  return token;
}

/**
 * Validate CSRF token using double-submit pattern
 */
export function validateCSRFToken(req: Request): boolean {
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers?.[CSRF_HEADER_NAME] as string;
  const bodyToken = req.body?.csrfToken;
  
  if (!cookieToken) {
    return false;
  }
  
  // Accept token from header or body
  const submittedToken = headerToken || bodyToken;
  
  if (!submittedToken) {
    return false;
  }
  
  // Constant-time comparison
  return constantTimeCompare(cookieToken, submittedToken);
}

/**
 * Constant-time string comparison
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * CSRF protection middleware
 * Should be applied to state-changing routes
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const method = req.method.toUpperCase();
  
  // Only protect state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return next();
  }
  
  // Skip CSRF for API key authentication (if implemented)
  if (req.headers.authorization?.startsWith('Bearer ')) {
    // TODO: Implement API key validation
    return next();
  }
  
  // Validate CSRF token
  if (!validateCSRFToken(req)) {
    res.status(403).json({
      error: 'CSRF token validation failed',
      details: 'Invalid or missing CSRF token',
    });
    return;
  }
  
  next();
}

/**
 * Middleware to provide CSRF token to client
 */
export function provideCSRFToken(req: Request, res: Response, next: NextFunction): void {
  // Set token if not already present
  if (!req.cookies?.[CSRF_COOKIE_NAME]) {
    setCSRFToken(req, res);
  }
  
  next();
}

/**
 * Endpoint to get CSRF token for AJAX requests
 */
export function getCSRFToken(req: Request, res: Response): void {
  const token = setCSRFToken(req, res);
  
  res.json({
    csrfToken: token,
  });
}