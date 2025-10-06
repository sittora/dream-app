import { z } from 'zod';

/**
 * Validation schemas for 2FA endpoints
 */

// TOTP code validation (6 digits)
export const totpCodeSchema = z
  .string()
  .length(6, 'TOTP code must be exactly 6 digits')
  .regex(/^\d{6}$/, 'TOTP code must contain only digits');

// Backup code validation (12-16 characters)
export const backupCodeSchema = z
  .string()
  .min(12, 'Backup code must be at least 12 characters')
  .max(16, 'Backup code must be no more than 16 characters')
  .regex(/^[a-zA-Z0-9]+$/, 'Backup code must contain only letters and numbers');

// 2FA enrollment schema
export const totpEnrollSchema = z.object({
  // Optional: user can provide current password for extra security
  currentPassword: z.string().optional(),
});

// TOTP verification schema
export const totpVerifySchema = z.object({
  code: totpCodeSchema,
});

// 2FA disable schema
export const totpDisableSchema = z.object({
  code: totpCodeSchema.or(backupCodeSchema),
  currentPassword: z.string().min(1, 'Current password is required'),
});

// 2FA login verification schema
export const twoFactorLoginSchema = z.object({
  challengeId: z.string().min(1, 'Challenge ID is required'),
  code: totpCodeSchema.optional(),
  backupCode: backupCodeSchema.optional(),
}).refine(
  (data) => data.code || data.backupCode,
  {
    message: 'Either TOTP code or backup code is required',
    path: ['code'],
  }
);

// Backup code generation schema
export const backupGenerateSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
});

// WebAuthn registration options schema
export const webauthnRegisterOptionsSchema = z.object({
  authenticatorName: z.string().min(1).max(64).optional(),
});

// WebAuthn registration verification schema
export const webauthnRegisterVerifySchema = z.object({
  credential: z.object({
    id: z.string(),
    rawId: z.string(),
    response: z.object({
      attestationObject: z.string(),
      clientDataJSON: z.string(),
    }),
    type: z.literal('public-key'),
  }),
  authenticatorName: z.string().min(1).max(64).optional(),
});

// WebAuthn login options schema
export const webauthnLoginOptionsSchema = z.object({
  email: z.string().email().optional(),
});

// WebAuthn login verification schema
export const webauthnLoginVerifySchema = z.object({
  credential: z.object({
    id: z.string(),
    rawId: z.string(),
    response: z.object({
      authenticatorData: z.string(),
      clientDataJSON: z.string(),
      signature: z.string(),
      userHandle: z.string().optional(),
    }),
    type: z.literal('public-key'),
  }),
  challengeId: z.string().optional(),
});

export type TotpEnrollInput = z.infer<typeof totpEnrollSchema>;
export type TotpVerifyInput = z.infer<typeof totpVerifySchema>;
export type TotpDisableInput = z.infer<typeof totpDisableSchema>;
export type TwoFactorLoginInput = z.infer<typeof twoFactorLoginSchema>;
export type BackupGenerateInput = z.infer<typeof backupGenerateSchema>;
export type WebauthnRegisterOptionsInput = z.infer<typeof webauthnRegisterOptionsSchema>;
export type WebauthnRegisterVerifyInput = z.infer<typeof webauthnRegisterVerifySchema>;
export type WebauthnLoginOptionsInput = z.infer<typeof webauthnLoginOptionsSchema>;
export type WebauthnLoginVerifyInput = z.infer<typeof webauthnLoginVerifySchema>;