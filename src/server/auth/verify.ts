import { Request, Response } from 'express';
import pino from 'pino';

import { createEmailVerificationToken, verifyEmailVerificationToken } from './hash.js';
import { emailVerificationSchema } from './validators.js';

// Create logger instance
const logger = pino({
  name: 'auth-verify',
  level: process.env.LOG_LEVEL || 'info',
});

// Email verification feature flag
const ENABLE_EMAIL_VERIFY = process.env.ENABLE_EMAIL_VERIFY === 'true';

/**
 * Send verification email (placeholder implementation)
 * TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
 */
export async function sendVerificationEmail(email: string, userId: string): Promise<void> {
  if (!ENABLE_EMAIL_VERIFY) {
    return;
  }

  try {
    const token = createEmailVerificationToken(email, userId);
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/verify-email?token=${token}`;

    // TODO: Replace with actual email service integration
    logger.info({
      email,
      userId,
      verificationLink,
    }, 'Email verification link generated (placeholder - not actually sent)');

  logger.info({ email, verificationLink }, 'Dev email verification link (not actually sent)');

    // TODO: Implement actual email sending:
    // await emailService.send({
    //   to: email,
    //   subject: 'Verify your email address',
    //   template: 'email-verification',
    //   data: { verificationLink, userId }
    // });

  } catch (error) {
    logger.error({ error, email, userId }, 'Failed to send verification email');
    throw new Error('Failed to send verification email');
  }
}

/**
 * Handle email verification
 */
export async function handleEmailVerification(req: Request, res: Response): Promise<void> {
  if (!ENABLE_EMAIL_VERIFY) {
    res.status(404).json({
      error: 'Email verification is not enabled',
    });
    return;
  }

  try {
    // Validate request body
    const validationResult = emailVerificationSchema.safeParse(req.body);
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

    const { token } = validationResult.data;

    // Verify token
    const tokenData = verifyEmailVerificationToken(token);
    if (!tokenData) {
      res.status(401).json({
        error: 'Invalid or expired verification token',
      });
      return;
    }

    // TODO: Update user's email_verified status in database
    // await userDb.updateEmailVerified(tokenData.userId, true);
    logger.warn('TODO: Implement updateEmailVerified with existing database layer');

    logger.info({
      userId: tokenData.userId,
      email: tokenData.email,
    }, 'Email verified successfully');

    res.status(200).json({
      message: 'Email verified successfully',
    });

  } catch (error) {
    logger.error({ error }, 'Email verification failed');
    res.status(500).json({
      error: 'Internal server error',
      details: 'Email verification failed. Please try again later.',
    });
  }
}