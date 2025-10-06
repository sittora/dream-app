import { Request, Response } from 'express';
import pino from 'pino';
import { registrationSchema } from './validators.js';
import { hashPassword } from './hash.js';
import { registrationRateLimiter } from './rateLimit.js';
import { sendVerificationEmail } from './verify.js';

// Create logger instance
const logger = pino({
  name: 'auth-register',
  level: process.env.LOG_LEVEL || 'info',
});

// TODO: Import or create database interface compatible with existing users table
// For now, creating a minimal compatible interface
interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  passwordHash: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// TODO: Replace with actual database implementation from existing schema
// This is a placeholder that maintains compatibility with existing users table
class UserDatabase {
  async findUserByEmail(email: string): Promise<User | null> {
    // TODO: Implement with existing database layer
    // Should query the existing users table by email field
    logger.warn('TODO: Implement findUserByEmail with existing database layer');
    return null;
  }

  async createUser(userData: {
    email: string;
    passwordHash: string;
    displayName?: string;
    emailVerified?: boolean;
  }): Promise<User> {
    // TODO: Implement with existing database layer and users table schema
    // Should create user with compatible fields:
    // - id (generated)
    // - email 
    // - username (could be derived from email or displayName)
    // - passwordHash (rename to password_hash to match existing schema)
    // - emailVerified (add as email_verified column if not exists)
    // - displayName (add as display_name column if not exists)
    // - createdAt/updatedAt timestamps
    logger.warn('TODO: Implement createUser with existing database layer');
    
    // Placeholder return
    const user: User = {
      id: 'placeholder-id',
      email: userData.email,
      displayName: userData.displayName,
      passwordHash: userData.passwordHash,
      emailVerified: userData.emailVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return user;
  }

  async updateEmailVerified(userId: string, verified: boolean): Promise<void> {
    // TODO: Implement with existing database layer
    logger.warn('TODO: Implement updateEmailVerified with existing database layer');
  }
}

const userDb = new UserDatabase();

/**
 * Handle user registration
 */
export async function handleRegister(req: Request, res: Response): Promise<void> {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

  try {
    // Rate limiting check
    if (registrationRateLimiter.isRateLimited(clientIp)) {
      const resetTime = registrationRateLimiter.getResetTime(clientIp);
      res.status(429).json({
        error: 'Too many registration attempts',
        details: `Please try again in ${resetTime} seconds`,
      });
      return;
    }

    // Validate request body
    const validationResult = registrationSchema.safeParse(req.body);
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

    const { email, password, displayName } = validationResult.data;

    // Record rate limit attempt
    registrationRateLimiter.recordAttempt(clientIp);

    // Check if user already exists
    const existingUser = await userDb.findUserByEmail(email);
    if (existingUser) {
      // Constant-time response to avoid leaking account existence
      await new Promise(resolve => setTimeout(resolve, 100));
      res.status(409).json({
        error: 'Email already registered',
        details: 'An account with this email already exists',
      });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await userDb.createUser({
      email,
      passwordHash,
      displayName,
      emailVerified: false,
    });

    logger.info({ userId: newUser.id, email }, 'User registered successfully');

    // Send verification email if enabled
    if (process.env.ENABLE_EMAIL_VERIFY === 'true') {
      try {
        await sendVerificationEmail(newUser.email, newUser.id);
      } catch (error) {
        logger.error({ error, userId: newUser.id }, 'Failed to send verification email');
        // Don't fail registration if email sending fails
      }
    }

    // Return success response (minimal user data)
    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        emailVerified: newUser.emailVerified,
      },
      message: 'Account created',
    });

  } catch (error) {
    logger.error({ error, clientIp }, 'Registration failed');
    res.status(500).json({
      error: 'Internal server error',
      details: 'Registration failed. Please try again later.',
    });
  }
}