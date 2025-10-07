import { describe, it, expect } from 'vitest';

import { registrationSchema, emailVerificationSchema } from './validators.js';

describe('Auth Validators', () => {
  describe('registrationSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        displayName: 'Test User'
      };

      const result = registrationSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.displayName).toBe('Test User');
      }
    });

    it('should normalize email to lowercase', () => {
      const data = {
        email: 'TEST@EXAMPLE.COM',
        password: 'Password123'
      };

      const result = registrationSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });

    it('should reject invalid email format', () => {
      const data = {
        email: 'invalid-email',
        password: 'Password123'
      };

      const result = registrationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject password without letter', () => {
      const data = {
        email: 'test@example.com',
        password: '12345678'
      };

      const result = registrationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const data = {
        email: 'test@example.com',
        password: 'abcdefgh'
      };

      const result = registrationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const data = {
        email: 'test@example.com',
        password: 'Abc123'
      };

      const result = registrationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject long display name', () => {
      const data = {
        email: 'test@example.com',
        password: 'Password123',
        displayName: 'A'.repeat(65)
      };

      const result = registrationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('emailVerificationSchema', () => {
    it('should validate correct token', () => {
      const data = { token: 'valid-token-string' };
      const result = emailVerificationSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty token', () => {
      const data = { token: '' };
      const result = emailVerificationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});