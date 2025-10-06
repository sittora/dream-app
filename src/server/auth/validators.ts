import { z } from 'zod';

// Configuration for password validation
export const PASSWORD_CONFIG = {
  minLength: 8,
  requireLetter: true,
  requireNumber: true,
  requireSpecialChar: false, // configurable
} as const;

// Email validation schema
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .transform((email) => email.trim().toLowerCase())
  .refine((email) => email.length > 0, 'Email is required');

// Password validation schema
export const passwordSchema = z
  .string()
  .min(PASSWORD_CONFIG.minLength, `Password must be at least ${PASSWORD_CONFIG.minLength} characters`)
  .refine((password) => {
    if (!PASSWORD_CONFIG.requireLetter) return true;
    return /[a-zA-Z]/.test(password);
  }, 'Password must contain at least one letter')
  .refine((password) => {
    if (!PASSWORD_CONFIG.requireNumber) return true;
    return /\d/.test(password);
  }, 'Password must contain at least one number')
  .refine((password) => {
    if (!PASSWORD_CONFIG.requireSpecialChar) return true;
    return /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }, 'Password must contain at least one special character');

// Display name validation schema
export const displayNameSchema = z
  .string()
  .trim()
  .min(1, 'Display name must be at least 1 character')
  .max(64, 'Display name must be no more than 64 characters')
  .optional();

// Registration request schema
export const registrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
});

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;