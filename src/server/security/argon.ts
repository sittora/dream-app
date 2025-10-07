import crypto from 'crypto';

import argon2 from 'argon2';

/**
 * Enhanced password hashing with Argon2id and server-side pepper
 * Security parameters: memory ≥ 256MB, time cost ≥ 3, parallelism ≥ 1
 */

// Get pepper from environment
const AUTH_PEPPER = process.env.AUTH_PEPPER || 'default-pepper-change-me-in-production';

// Argon2id parameters (production-grade)
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 18, // 256 MB
  timeCost: 3,
  parallelism: 1,
  hashLength: 32,
} as const;

/**
 * Hash password with pepper and Argon2id
 */
export async function hashPasswordSecure(password: string): Promise<string> {
  try {
    // Combine password with server-side pepper
    const pepperedPassword = password + AUTH_PEPPER;
    
    return await argon2.hash(pepperedPassword, ARGON2_OPTIONS);
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify password against hash with pepper
 */
export async function verifyPasswordSecure(hash: string, password: string): Promise<boolean> {
  try {
    // Combine password with server-side pepper
    const pepperedPassword = password + AUTH_PEPPER;
    
    return await argon2.verify(hash, pepperedPassword);
  } catch (error) {
    return false;
  }
}

/**
 * Generate secure random salt for various purposes
 */
export function generateSecureSalt(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate cryptographically secure random string
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Hash data with HMAC for secure comparison
 */
export function hmacHash(data: string, secret: string = AUTH_PEPPER): string {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
}

/**
 * Create privacy-safe hash of IP address for logging
 */
export function hashIpForLogging(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'ip-logging-salt';
  return hmacHash(ip, salt).substring(0, 8);
}