/**
 * Two-Factor Authentication (2FA) System
 * 
 * This module provides a comprehensive 2FA implementation with:
 * - TOTP (Time-based One-Time Passwords) using authenticator apps
 * - Backup codes for account recovery
 * - WebAuthn support for security keys and biometrics (feature-flagged)
 * - Rate limiting and security hardening
 * 
 * All functionality is additive-only and requires no changes to existing UI.
 */

// Main router
export { default as twoFactorRouter } from './router.js';

// TOTP Controllers
export {
  enrollTOTP,
  verifyTOTP,
  disableTOTP,
  getTOTPStatus,
} from './totp.controller.js';

// Backup Code Controllers
export {
  generateBackupCodes,
  verifyBackupCode,
  getBackupCodeStatus,
} from './backup.controller.js';

// WebAuthn Controllers (feature-flagged)
export {
  generateWebAuthnRegistrationOptions,
  verifyWebAuthnRegistration,
  generateWebAuthnAuthenticationOptions,
  verifyWebAuthnAuthentication,
  listWebAuthnCredentials,
  deleteWebAuthnCredential,
} from './webauthn.controller.js';

// Validation Schemas
export {
  totpEnrollSchema,
  totpVerifySchema,
  totpDisableSchema,
  twoFactorLoginSchema,
  backupGenerateSchema,
  webauthnRegisterOptionsSchema,
  webauthnRegisterVerifySchema,
  webauthnLoginOptionsSchema,
  webauthnLoginVerifySchema,
  // Type exports
  type TotpEnrollInput,
  type TotpVerifyInput,
  type TotpDisableInput,
  type TwoFactorLoginInput,
  type BackupGenerateInput,
  type WebauthnRegisterOptionsInput,
} from './validators.js';

// Re-export security utilities for convenience
export {
  hashPasswordSecure,
  verifyPasswordSecure,
  generateSecureSalt,
  constantTimeCompare,
} from '../security/argon.js';

export {
  encryptSensitiveData,
  decryptSensitiveData,
} from '../security/crypto.js';

export {
  createRateLimitMiddleware,
} from '../security/rateLimit.js';

export {
  csrfProtection,
} from '../security/csrf.js';

export {
  configureHelmet,
  additionalSecurityHeaders,
} from '../security/headers.js';

/**
 * Quick setup guide:
 * 
 * 1. Install required dependencies (already done):
 *    npm install argon2 otplib qrcode libsodium-wrappers @simplewebauthn/server
 *    npm install -D @types/qrcode @types/libsodium-wrappers
 * 
 * 2. Set up environment variables (see .env.example):
 *    SERVER_PEPPER=your-server-pepper-key-here
 *    CSRF_SECRET=your-csrf-secret-here
 *    ENABLE_WEBAUTHN=true (optional)
 * 
 * 3. Add to your Express app:
 *    import { twoFactorRouter } from './src/server/2fa/index.js';
 *    app.use('/api/2fa', twoFactorRouter);
 * 
 * 4. Update database schema (see README.md for details)
 * 
 * 5. Replace TODO database implementations with actual Drizzle queries
 * 
 * The system is designed to be secure by default and follows industry best practices.
 */