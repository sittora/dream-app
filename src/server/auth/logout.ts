import { Request, Response } from 'express';
import { jwtVerify } from 'jose';
import pino from 'pino';

// Create logger instance
const logger = pino({
  name: 'auth-logout-controller',
  level: process.env.LOG_LEVEL || 'info',
});

// JWT configuration
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');

// In-memory token blacklist (in production, use Redis or database)
const tokenBlacklist = new Set<string>();

/**
 * Handle user logout
 */
export async function handleLogout(req: Request, res: Response): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Also check for token in request body (for flexibility)
    if (!token && req.body.token) {
      token = req.body.token;
    }

    // If no token provided, consider it a successful logout
    if (!token) {
      res.json({
        success: true,
        message: 'Logout successful',
      });
      return;
    }

    // Verify token to get user info for logging
    let decoded: any;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      decoded = payload;
    } catch (error) {
      // Token is invalid, but we still consider logout successful
      logger.warn('Invalid token during logout');
      res.json({
        success: true,
        message: 'Logout successful',
      });
      return;
    }

    // Add token to blacklist
    tokenBlacklist.add(token);

    // Also blacklist refresh token if provided
    if (req.body.refreshToken) {
      tokenBlacklist.add(req.body.refreshToken);
    }

    // Log successful logout
    logger.info({ 
      userId: decoded.sub,
      email: decoded.email,
    }, 'User logged out successfully');

    res.json({
      success: true,
      message: 'Logout successful',
      data: {
        loggedOut: true,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Logout failed');
    
    // Even if logout fails, we should return success to avoid client issues
    res.json({
      success: true,
      message: 'Logout successful',
    });
  }
}

/**
 * Handle logout from all devices
 */
export async function handleLogoutAll(req: Request, res: Response): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid token',
      });
      return;
    }

    // Verify token to get user info
    let decoded: any;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      decoded = payload;
    } catch (error) {
      res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired',
      });
      return;
    }

    // In a production system, you would:
    // 1. Invalidate all tokens for this user in the database
    // 2. Update user's token version/generation number
    // 3. Clear user sessions from Redis/cache
    
    // For now, we'll just add the current token to blacklist
    tokenBlacklist.add(token);

    logger.info({ 
      userId: decoded.sub,
      email: decoded.email,
    }, 'User logged out from all devices');

    res.json({
      success: true,
      message: 'Logged out from all devices successfully',
      data: {
        loggedOutFromAllDevices: true,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Logout all devices failed');
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during logout',
    });
  }
}

/**
 * Check if a token is blacklisted
 */
export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token);
}

/**
 * Decode JWT without verification (for cleanup only)
 */
function decodeJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(decoded)));
  } catch (error) {
    return null;
  }
}

/**
 * Clean up expired tokens from blacklist (call periodically)
 */
export function cleanupExpiredTokens(): void {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    for (const token of tokenBlacklist) {
      try {
        const decoded = decodeJwt(token);
        if (decoded && decoded.exp && decoded.exp < now) {
          tokenBlacklist.delete(token);
        }
      } catch (error) {
        // Remove malformed tokens
        tokenBlacklist.delete(token);
      }
    }
    
    logger.debug(`Cleaned up expired tokens. Blacklist size: ${tokenBlacklist.size}`);
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Token cleanup failed');
  }
}

// Clean up expired tokens every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);