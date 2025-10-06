import argon2 from 'argon2';
import crypto from 'crypto';

/**
 * Hash a password using Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password against its hash using Argon2id
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
}

/**
 * Generate a secure random token for email verification
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a JWT-like token for email verification (simple implementation)
 * In production, use proper JWT libraries
 */
export function createEmailVerificationToken(email: string, userId: string): string {
  const payload = {
    email,
    userId,
    exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    type: 'email_verification'
  };
  
  const token = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'fallback-secret')
    .update(token)
    .digest('base64url');
  
  return `${token}.${signature}`;
}

/**
 * Verify an email verification token
 */
export function verifyEmailVerificationToken(token: string): { email: string; userId: string } | null {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'fallback-secret')
      .update(payload)
      .digest('base64url');
    
    if (signature !== expectedSignature) return null;
    
    // Parse payload
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    
    // Check expiration
    if (Date.now() > data.exp) return null;
    
    // Check type
    if (data.type !== 'email_verification') return null;
    
    return { email: data.email, userId: data.userId };
  } catch (error) {
    return null;
  }
}