import { Request, Response } from 'express';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import pino from 'pino';
import { totpEnrollSchema, totpVerifySchema, totpDisableSchema } from './validators.js';
import { encryptSensitiveData, decryptSensitiveData } from '../security/crypto.js';
import { createRateLimitMiddleware } from '../security/rateLimit.js';

// Create logger instance
const logger = pino({
  name: 'totp-controller',
  level: process.env.LOG_LEVEL || 'info',
});

// TOTP configuration
authenticator.options = {
  window: 2, // Allow 2 time steps (±60 seconds)
  step: 30,  // 30-second time steps
};

// TODO: Replace with actual database implementation
interface TwoFactorRecord {
  userId: string;
  totpSecret: string; // encrypted
  isActivated: boolean;
  activatedAt?: Date;
  lastUsedAt?: Date;
  backupCodesHash?: string; // encrypted backup codes
}

class TwoFactorDatabase {
  async findByUserId(userId: string): Promise<TwoFactorRecord | null> {
    // TODO: Implement with existing database layer
    logger.warn('TODO: Implement findByUserId with existing database layer');
    return null;
  }

  async create(record: Omit<TwoFactorRecord, 'activatedAt'>): Promise<TwoFactorRecord> {
    // TODO: Implement with existing database layer
    logger.warn('TODO: Implement create with existing database layer');
    return { ...record, activatedAt: new Date() };
  }

  async update(userId: string, updates: Partial<TwoFactorRecord>): Promise<void> {
    // TODO: Implement with existing database layer
    logger.warn('TODO: Implement update with existing database layer');
  }

  async delete(userId: string): Promise<void> {
    // TODO: Implement with existing database layer
    logger.warn('TODO: Implement delete with existing database layer');
  }
}

const twoFactorDb = new TwoFactorDatabase();

/**
 * Enroll user in TOTP 2FA
 * Generates secret and returns QR code for authenticator app
 */
export async function enrollTOTP(req: Request, res: Response): Promise<void> {
  try {
    // TODO: Get authenticated user from session/JWT
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Validate request
    const validationResult = totpEnrollSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
      return;
    }

    // Check if 2FA is already enabled
    const existing = await twoFactorDb.findByUserId(userId);
    if (existing?.isActivated) {
      res.status(409).json({
        error: '2FA already enabled',
        details: 'Two-factor authentication is already enabled for this account',
      });
      return;
    }

    // Generate new TOTP secret
    const secret = authenticator.generateSecret();
    
    // Get user email for QR code (TODO: get from user record)
    const userEmail = req.user?.email || 'user@example.com';
    const appName = process.env.VITE_APP_NAME || 'Anima Insights';
    
    // Create OTP Auth URL
    const otpauthUrl = authenticator.keyuri(userEmail, appName, secret);
    
    // Generate QR code data URL
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);
    
    // Encrypt and store secret (pending activation)
    const encryptedSecret = await encryptSensitiveData(secret);
    
    // Create or update 2FA record
    if (existing) {
      await twoFactorDb.update(userId, {
        totpSecret: encryptedSecret,
        isActivated: false,
      });
    } else {
      await twoFactorDb.create({
        userId,
        totpSecret: encryptedSecret,
        isActivated: false,
      });
    }

    logger.info({ userId }, 'TOTP enrollment initiated');

    res.status(201).json({
      otpauthUrl,
      qrDataUrl,
      message: 'Scan QR code with your authenticator app, then verify with a code',
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'TOTP enrollment failed');
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to enroll in 2FA',
    });
  }
}

/**
 * Verify TOTP code and activate 2FA
 */
export async function verifyTOTP(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Validate request
    const validationResult = totpVerifySchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
      return;
    }

    const { code } = validationResult.data;

    // Get 2FA record
    const twoFactorRecord = await twoFactorDb.findByUserId(userId);
    if (!twoFactorRecord) {
      res.status(404).json({
        error: '2FA not enrolled',
        details: 'No 2FA enrollment found for this account',
      });
      return;
    }

    // Decrypt secret
    const secret = await decryptSensitiveData(twoFactorRecord.totpSecret);

    // Verify TOTP code
    const isValid = authenticator.verify({
      token: code,
      secret,
    });

    if (!isValid) {
      logger.warn({ userId }, 'Invalid TOTP code during verification');
      res.status(400).json({
        error: 'Invalid code',
        details: 'The provided verification code is invalid',
      });
      return;
    }

    // Activate 2FA
    await twoFactorDb.update(userId, {
      isActivated: true,
      activatedAt: new Date(),
      lastUsedAt: new Date(),
    });

    logger.info({ userId }, 'TOTP 2FA activated successfully');

    res.status(200).json({
      enabled: true,
      message: 'Two-factor authentication has been enabled',
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'TOTP verification failed');
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to verify 2FA code',
    });
  }
}

/**
 * Disable 2FA (requires verification)
 */
export async function disableTOTP(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Validate request
    const validationResult = totpDisableSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
      return;
    }

    const { code, currentPassword } = validationResult.data;

    // TODO: Verify current password
    // if (!await verifyCurrentPassword(userId, currentPassword)) {
    //   res.status(400).json({ error: 'Invalid password' });
    //   return;
    // }

    // Get 2FA record
    const twoFactorRecord = await twoFactorDb.findByUserId(userId);
    if (!twoFactorRecord?.isActivated) {
      res.status(404).json({
        error: '2FA not enabled',
        details: 'Two-factor authentication is not enabled for this account',
      });
      return;
    }

    // Verify code (TOTP or backup code)
    let isValid = false;
    
    if (code.length === 6) {
      // TOTP code
      const secret = await decryptSensitiveData(twoFactorRecord.totpSecret);
      isValid = authenticator.verify({
        token: code,
        secret,
      });
    } else {
      // TODO: Verify backup code
      // isValid = await verifyBackupCode(userId, code);
    }

    if (!isValid) {
      logger.warn({ userId }, 'Invalid code during 2FA disable attempt');
      res.status(400).json({
        error: 'Invalid code',
        details: 'The provided verification code is invalid',
      });
      return;
    }

    // Disable 2FA
    await twoFactorDb.delete(userId);

    logger.info({ userId }, '2FA disabled successfully');

    res.status(200).json({
      enabled: false,
      message: 'Two-factor authentication has been disabled',
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.id }, '2FA disable failed');
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to disable 2FA',
    });
  }
}

/**
 * Get 2FA status for current user
 */
export async function getTOTPStatus(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const twoFactorRecord = await twoFactorDb.findByUserId(userId);
    
    res.json({
      enabled: twoFactorRecord?.isActivated || false,
      enrolledAt: twoFactorRecord?.activatedAt,
      lastUsedAt: twoFactorRecord?.lastUsedAt,
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'Failed to get 2FA status');
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to get 2FA status',
    });
  }
}

/**
 * Verify TOTP code during login process
 */
export async function verifyLoginTOTP(req: Request, res: Response): Promise<void> {
  try {
    // TODO: Implement 2FA login verification
    // This would be called after successful password verification
    // when 2FA is enabled for the account
    
    const { challengeId, code } = req.body;
    
    // TODO: Validate challenge ID and get associated user
    // TODO: Verify TOTP code
    // TODO: Complete login process and issue session
    
    logger.warn('TODO: Implement 2FA login verification');
    
    res.status(501).json({
      error: 'Not implemented',
      details: 'TOTP login verification not yet implemented',
    });

  } catch (error) {
    logger.error({ error }, '2FA login verification failed');
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to verify 2FA code',
    });
  }
}

// Rate limiting middleware for 2FA endpoints
export const totpRateLimit = createRateLimitMiddleware('2fa');