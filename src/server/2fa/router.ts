import { Router } from 'express';
import pino from 'pino';

import { createRateLimitMiddleware } from '../security/rateLimit.js';

import {
  generateBackupCodes,
  verifyBackupCode,
  getBackupCodeStatus,
} from './backup.controller.js';
import { 
  enrollTOTP,
  verifyTOTP,
  disableTOTP,
  getTOTPStatus,
} from './totp.controller.js';
import {
  generateWebAuthnRegistrationOptions,
  verifyWebAuthnRegistration,
  generateWebAuthnAuthenticationOptions,
  verifyWebAuthnAuthentication,
  listWebAuthnCredentials,
  deleteWebAuthnCredential,
} from './webauthn.controller.js';


// Create logger instance
const logger = pino({
  name: '2fa-router',
  level: process.env.LOG_LEVEL || 'info',
});

const router = Router();

// TODO: Apply authentication middleware to all 2FA routes
// router.use(authenticateUser);
// This will be added when the auth middleware is implemented

// Apply rate limiting to sensitive 2FA operations
const sensitiveRateLimit = createRateLimitMiddleware('2fa');

// TOTP Routes
router.post('/totp/enroll', sensitiveRateLimit, enrollTOTP);
router.post('/totp/verify', sensitiveRateLimit, verifyTOTP);
router.delete('/totp/disable', sensitiveRateLimit, disableTOTP);
router.get('/totp/status', getTOTPStatus);

// Backup Codes Routes
router.post('/backup/generate', sensitiveRateLimit, generateBackupCodes);
router.post('/backup/verify', sensitiveRateLimit, verifyBackupCode);
router.get('/backup/status', getBackupCodeStatus);

// WebAuthn Routes (feature-flagged)
if (process.env.ENABLE_WEBAUTHN === 'true') {
  router.post('/webauthn/register/options', sensitiveRateLimit, generateWebAuthnRegistrationOptions);
  router.post('/webauthn/register/verify', sensitiveRateLimit, verifyWebAuthnRegistration);
  router.post('/webauthn/login/options', sensitiveRateLimit, generateWebAuthnAuthenticationOptions);
  router.post('/webauthn/login/verify', sensitiveRateLimit, verifyWebAuthnAuthentication);
  router.get('/webauthn/credentials', listWebAuthnCredentials);
  router.delete('/webauthn/credentials/:credentialId', sensitiveRateLimit, deleteWebAuthnCredential);
  
  logger.info('WebAuthn routes enabled');
} else {
  logger.info('WebAuthn routes disabled (set ENABLE_WEBAUTHN=true to enable)');
}

// Combined 2FA status endpoint
router.get('/status', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // TODO: Implement comprehensive 2FA status check
    // This should check TOTP, backup codes, and WebAuthn status
    
    const status = {
      totp: {
        enabled: false,
        verified: false,
      },
      backupCodes: {
        generated: false,
        remaining: 0,
      },
      webauthn: {
        enabled: process.env.ENABLE_WEBAUTHN === 'true',
        credentials: 0,
      },
      twoFactorEnabled: false,
    };

    res.json(status);

  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'Failed to get 2FA status');
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to retrieve 2FA status',
    });
  }
});

// Emergency 2FA disable endpoint (requires additional verification)
router.post('/emergency-disable', sensitiveRateLimit, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // TODO: Implement emergency 2FA disable
    // This should require:
    // 1. Recent password verification
    // 2. Email confirmation
    // 3. Audit logging
    // 4. Admin notification for security review

    logger.warn({ userId }, 'Emergency 2FA disable requested - not implemented');
    
    res.status(501).json({
      error: 'Not implemented',
      details: 'Emergency 2FA disable requires additional security measures',
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'Emergency 2FA disable failed');
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to process emergency disable request',
    });
  }
});

export default router;