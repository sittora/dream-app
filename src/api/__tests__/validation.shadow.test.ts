import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app } from '../../server/app.js';

// Helper to mutate env for a single test
function withEnv(key: string, value: string | undefined, fn: () => Promise<void>) {
  const prev = process.env[key];
  if (value === undefined) delete process.env[key]; else process.env[key] = value;
  return fn().finally(() => { if (prev === undefined) delete process.env[key]; else process.env[key] = prev; });
}

describe('Shadow validation middleware', () => {
  it('shadow mode still surfaces handler validation 400 for clearly invalid login payload', async () => {
    await withEnv('ENABLE_API_VALIDATION', undefined, async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' });
      // Internal handler schema triggers 400 even though middleware is shadow (non-breaking existing behavior)
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  it('blocks invalid payload when strict mode enabled', async () => {
    await withEnv('ENABLE_API_VALIDATION', 'true', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation failed');
      expect(Array.isArray(res.body.details)).toBe(true);
    });
  });

  it('valid payload proceeds; may 401/500 due to downstream logic but not validation error', async () => {
    await withEnv('ENABLE_API_VALIDATION', undefined, async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'user@example.com', password: 'secret' });
      // Accept success, auth failure, or internal error from placeholder DB; just ensure not a validation 400.
      expect([200, 401, 500]).toContain(res.status);
      if (res.status === 400) {
        throw new Error('Unexpected 400 validation error for valid payload');
      }
    });
  });
});
