import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pino from 'pino';
import { backupGenerateSchema } from './validators.js';
import { encryptSensitiveData, decryptSensitiveData } from '../security/crypto.js';

// Create logger instance
const logger = pino({
  name: 'backup-controller',
  level: process.env.LOG_LEVEL || 'info',
});

// Backup code configuration
const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_LENGTH = 12;
const BCRYPT_ROUNDS = 12;

// TODO: Replace with actual database implementation
interface BackupCodeRecord {
  id: string;
  userId: string;
  codeHash: string;
  usedAt?: Date;
  createdAt: Date;
}

class BackupCodeDatabase {
  async findByUserId(userId: string): Promise<BackupCodeRecord[]> {
    // TODO: Implement with existing database layer
    logger.warn('TODO: Implement findByUserId with existing database layer');
    return [];
  }

  async create(record: Omit<BackupCodeRecord, 'id' | 'createdAt'>): Promise<BackupCodeRecord> {
    // TODO: Implement with existing database layer
    logger.warn('TODO: Implement create with existing database layer');
    return {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
  }

  async markUsed(codeId: string): Promise<void> {
    // TODO: Implement with existing database layer
    logger.warn('TODO: Implement markUsed with existing database layer');
  }

  async deleteAllForUser(userId: string): Promise<void> {
    // TODO: Implement with existing database layer
    logger.warn('TODO: Implement deleteAllForUser with existing database layer');
  }

  async findUnusedByUserId(userId: string): Promise<BackupCodeRecord[]> {
    // TODO: Implement with existing database layer - filter where usedAt is null
    logger.warn('TODO: Implement findUnusedByUserId with existing database layer');
    return [];
  }
}

const backupCodeDb = new BackupCodeDatabase();

/**
 * Generate a secure backup code
 */
function generateBackupCode(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < BACKUP_CODE_LENGTH; i++) {
    const randomIndex = crypto.randomInt(charset.length);
    code += charset[randomIndex];
  }
  
  // Add hyphens for readability (XXXX-XXXX-XXXX)
  return code.replace(/(.{4})/g, '$1-').slice(0, -1);
}

/**
 * Hash backup code for secure storage
 */
async function hashBackupCode(code: string): Promise<string> {
  // Remove hyphens and convert to uppercase for consistent hashing
  const normalizedCode = code.replace(/-/g, '').toUpperCase();
  return await bcrypt.hash(normalizedCode, BCRYPT_ROUNDS);
}

/**
 * Verify backup code against hash
 */
async function verifyBackupCodeHash(code: string, hash: string): Promise<boolean> {
  try {
    // Remove hyphens and convert to uppercase for consistent verification
    const normalizedCode = code.replace(/-/g, '').toUpperCase();
    return await bcrypt.compare(normalizedCode, hash);
  } catch (error) {
    return false;
  }
}

/**
 * Generate new backup codes for user
 */
export async function generateBackupCodes(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Validate request
    const validationResult = backupGenerateSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
      return;
    }

    const { currentPassword } = validationResult.data;

    // TODO: Verify current password
    // if (!await verifyCurrentPassword(userId, currentPassword)) {
    //   res.status(400).json({ error: 'Invalid password' });
    //   return;
    // }

    // TODO: Verify 2FA is enabled
    // const twoFactorRecord = await twoFactorDb.findByUserId(userId);
    // if (!twoFactorRecord?.isActivated) {
    //   res.status(400).json({
    //     error: '2FA not enabled',
    //     details: 'Two-factor authentication must be enabled to generate backup codes',
    //   });
    //   return;
    // }

    // Delete existing backup codes
    await backupCodeDb.deleteAllForUser(userId);

    // Generate new backup codes
    const backupCodes: string[] = [];
    const codePromises: Promise<BackupCodeRecord>[] = [];

    for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
      const code = generateBackupCode();
      backupCodes.push(code);

      // Hash and store the code
      const hashPromise = hashBackupCode(code).then(async (hash) => {
        return await backupCodeDb.create({
          userId,
          codeHash: hash,
        });
      });

      codePromises.push(hashPromise);
    }

    // Wait for all codes to be stored
    await Promise.all(codePromises);

    logger.info({ userId, codeCount: BACKUP_CODE_COUNT }, 'Backup codes generated');

    // Return codes in response (this is the ONLY time they're shown in plaintext)
    res.status(201).json({
      backupCodes,
      message: 'Save these backup codes in a secure location. They will not be shown again.',
      warning: 'Each backup code can only be used once.',
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'Backup code generation failed');
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to generate backup codes',
    });
  }
}

/**
 * Verify and consume a backup code
 */
export async function verifyBackupCode(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({
        error: 'Backup code required',
        details: 'A valid backup code must be provided',
      });
      return;
    }

    // Get unused backup codes for user
    const backupCodes = await backupCodeDb.findUnusedByUserId(userId);
    
    if (backupCodes.length === 0) {
      res.status(404).json({
        error: 'No backup codes available',
        details: 'No unused backup codes found for this account',
      });
      return;
    }

    // Try to verify against each unused code
    let matchedCode: BackupCodeRecord | null = null;
    
    for (const codeRecord of backupCodes) {
      const isValid = await verifyBackupCodeHash(code, codeRecord.codeHash);
      if (isValid) {
        matchedCode = codeRecord;
        break;
      }
    }

    if (!matchedCode) {
      logger.warn({ userId }, 'Invalid backup code attempt');
      res.status(400).json({
        error: 'Invalid backup code',
        details: 'The provided backup code is invalid or has already been used',
      });
      return;
    }

    // Mark code as used (atomic operation)
    await backupCodeDb.markUsed(matchedCode.id);

    // Get remaining unused codes count
    const remainingCodes = await backupCodeDb.findUnusedByUserId(userId);
    
    logger.info({ 
      userId, 
      codeId: matchedCode.id, 
      remainingCount: remainingCodes.length 
    }, 'Backup code used successfully');

    res.status(200).json({
      success: true,
      message: 'Backup code verified successfully',
      remainingCodes: remainingCodes.length,
      warning: remainingCodes.length <= 2 ? 'You are running low on backup codes. Consider generating new ones.' : undefined,
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'Backup code verification failed');
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to verify backup code',
    });
  }
}

/**
 * Get backup codes status (count only, no codes shown)
 */
export async function getBackupCodeStatus(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const unusedCodes = await backupCodeDb.findUnusedByUserId(userId);
    const allCodes = await backupCodeDb.findByUserId(userId);
    
    res.json({
      totalCodes: allCodes.length,
      unusedCodes: unusedCodes.length,
      usedCodes: allCodes.length - unusedCodes.length,
      lastGenerated: allCodes.length > 0 ? allCodes[0].createdAt : null,
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'Failed to get backup code status');
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to get backup code status',
    });
  }
}

/**
 * Internal function to verify backup code (used by other auth flows)
 */
export async function internalVerifyBackupCode(userId: string, code: string): Promise<boolean> {
  try {
    const backupCodes = await backupCodeDb.findUnusedByUserId(userId);
    
    for (const codeRecord of backupCodes) {
      const isValid = await verifyBackupCodeHash(code, codeRecord.codeHash);
      if (isValid) {
        // Mark as used
        await backupCodeDb.markUsed(codeRecord.id);
        logger.info({ userId, codeId: codeRecord.id }, 'Backup code used in auth flow');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    logger.error({ error, userId }, 'Internal backup code verification failed');
    return false;
  }
}