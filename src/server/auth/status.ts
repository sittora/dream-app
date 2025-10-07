import { Request, Response } from 'express';
import pino from 'pino';

import { dbService } from '../../services/db.js';

// Create logger instance
const logger = pino({
  name: 'auth-status-controller',
  level: process.env.LOG_LEVEL || 'info',
});

/**
 * Get authentication status and user profile
 */
export async function getAuthStatus(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.json({
        success: true,
        data: {
          authenticated: false,
          user: null,
        },
      });
      return;
    }

    // Get fresh user data from database
    const user = await dbService.getUserById(req.user.id);
    if (!user) {
      res.json({
        success: true,
        data: {
          authenticated: false,
          user: null,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          profileImage: user.profileImage,
          bio: user.bio,
          points: user.points,
          level: user.level,
          rank: user.rank,
          mfaEnabled: user.mfaEnabled,
          createdAt: user.createdAt,
          dreamStats: {
            totalDreams: 0, // TODO: Calculate from database
            publicDreams: 0, // TODO: Calculate from database
            privateDreams: 0, // TODO: Calculate from database
            totalLikes: 0, // TODO: Calculate from database
            totalComments: 0, // TODO: Calculate from database
            totalSaves: 0, // TODO: Calculate from database
          },
        },
      },
    });

  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Get auth status failed');
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get authentication status',
    });
  }
}

/**
 * Health check endpoint for authentication service
 */
export async function getAuthHealth(req: Request, res: Response): Promise<void> {
  try {
    res.json({
      success: true,
      data: {
        service: 'authentication',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        endpoints: {
          login: '/api/auth/login',
          logout: '/api/auth/logout',
          register: '/api/auth/register',
          refresh: '/api/auth/refresh',
          status: '/api/auth/status',
          profile: '/api/auth/me',
        },
        features: {
          jwt: true,
          refreshTokens: true,
          tokenBlacklist: true,
          mfa: false, // TODO: Enable when 2FA system is integrated
        },
      },
    });
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Auth health check failed');
    res.status(500).json({
      error: 'Service unhealthy',
      message: 'Authentication service is experiencing issues',
    });
  }
}