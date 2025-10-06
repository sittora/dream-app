import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { z } from 'zod';
import pino from 'pino';
import { dbService } from '../../services/db.js';

// Create logger instance
const logger = pino({
  name: 'auth-login-controller',
  level: process.env.LOG_LEVEL || 'info',
});

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// JWT configuration
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Handle user login
 */
export async function handleLogin(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    const { email, password, rememberMe } = validationResult.data;

    // Find user by email
    const user = await dbService.getUserByEmail(email);
    if (!user) {
      logger.warn({ email }, 'Login attempt with non-existent email');
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'The email or password you entered is incorrect',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      logger.warn({ email, userId: user.id }, 'Login attempt with invalid password');
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'The email or password you entered is incorrect',
      });
      return;
    }

    // Check if 2FA is enabled (future enhancement)
    if (user.mfaEnabled) {
      // For now, we'll proceed without 2FA verification
      // This can be enhanced when the 2FA system is integrated
      logger.info({ userId: user.id }, 'User has 2FA enabled but verification skipped');
    }

    // Generate JWT token
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: 'user',
    };

    const expiresIn = rememberMe ? JWT_REFRESH_EXPIRES_IN : JWT_EXPIRES_IN;
    const accessToken = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(expiresIn)
      .sign(JWT_SECRET);

    // Generate refresh token for longer sessions
    const refreshTokenPayload = {
      sub: user.id,
      type: 'refresh',
    };
    const refreshToken = await new SignJWT(refreshTokenPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(JWT_REFRESH_EXPIRES_IN)
      .sign(JWT_SECRET);

    // Log successful login
    logger.info({ 
      userId: user.id, 
      email: user.email,
      rememberMe,
    }, 'User logged in successfully');

    // Return tokens and user data
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          profileImage: user.profileImage,
          points: user.points,
          level: user.level,
          rank: user.rank,
          mfaEnabled: user.mfaEnabled,
        },
        expiresIn: rememberMe ? JWT_REFRESH_EXPIRES_IN : JWT_EXPIRES_IN,
      },
    });

  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Login failed');
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during login',
    });
  }
}

/**
 * Handle token refresh
 */
export async function handleRefreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        error: 'Refresh token required',
        message: 'Please provide a refresh token',
      });
      return;
    }

    // Verify refresh token
    let decoded: any;
    try {
      const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
      decoded = payload;
    } catch (error) {
      res.status(401).json({
        error: 'Invalid refresh token',
        message: 'The refresh token is invalid or expired',
      });
      return;
    }

    // Check if it's a refresh token
    if (decoded.type !== 'refresh') {
      res.status(401).json({
        error: 'Invalid token type',
        message: 'The provided token is not a refresh token',
      });
      return;
    }

    // Get user data
    const user = await dbService.getUserById(decoded.sub);
    if (!user) {
      res.status(401).json({
        error: 'User not found',
        message: 'The user associated with this token no longer exists',
      });
      return;
    }

    // Generate new access token
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: 'user',
    };

    const newAccessToken = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(JWT_EXPIRES_IN)
      .sign(JWT_SECRET);

    logger.info({ userId: user.id }, 'Token refreshed successfully');

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        expiresIn: JWT_EXPIRES_IN,
      },
    });

  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Token refresh failed');
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during token refresh',
    });
  }
}