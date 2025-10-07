import { describe, it, expect } from 'vitest';

import { hashPassword, verifyPassword, createEmailVerificationToken, verifyEmailVerificationToken } from './hash.js';

describe('Hash Functions', () => {
  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'TestPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(hash, password);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123';
      const wrongPassword = 'WrongPassword123';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(hash, wrongPassword);
      expect(isValid).toBe(false);
    });

    it('should handle invalid hash gracefully', async () => {
      const invalidHash = 'invalid-hash';
      const password = 'TestPassword123';
      
      const isValid = await verifyPassword(invalidHash, password);
      expect(isValid).toBe(false);
    });
  });

  describe('Email Verification Tokens', () => {
    it('should create and verify valid token', () => {
      const email = 'test@example.com';
      const userId = 'user-123';
      
      const token = createEmailVerificationToken(email, userId);
      const decoded = verifyEmailVerificationToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded?.email).toBe(email);
      expect(decoded?.userId).toBe(userId);
    });

    it('should reject tampered token', () => {
      const email = 'test@example.com';
      const userId = 'user-123';
      
      const token = createEmailVerificationToken(email, userId);
      const tamperedToken = token.slice(0, -5) + 'XXXXX';
      
      const decoded = verifyEmailVerificationToken(tamperedToken);
      expect(decoded).toBeNull();
    });

    it('should reject malformed token', () => {
      const malformedToken = 'not-a-valid-token';
      const decoded = verifyEmailVerificationToken(malformedToken);
      expect(decoded).toBeNull();
    });
  });
});