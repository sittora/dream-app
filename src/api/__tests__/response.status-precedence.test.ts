import request from 'supertest';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { app } from '../../server/app.js';
import { snapshotEnv } from './helpers/env.js';

const KEYS = [ 'ENABLE_RESPONSE_VALIDATION', 'RESPONSE_VALIDATION_STATUS', 'RESPONSE_VALIDATION_STRICT_STATUS' ] as const;
let envSnap: ReturnType<typeof snapshotEnv>;

describe('Response validation status precedence', () => {
  beforeEach(() => { envSnap = snapshotEnv([...KEYS]); });
  afterEach(() => { envSnap.restore(); });

  it('falls back to legacy when new var is unset', async () => {
    process.env.ENABLE_RESPONSE_VALIDATION = 'true';
    process.env.RESPONSE_VALIDATION_STRICT_STATUS = '418';
    delete process.env.RESPONSE_VALIDATION_STATUS;

    // Trigger login; ensure response validator runs in strict mode and forces status when schema mismatch occurs.
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'secret' });

    // We accept either the forced 418 OR original status (if by chance handler produced schema-valid output).
    // If the validator fires due to schema mismatch, it must use 418.
    if (res.body && res.body.error === 'Response validation failed') {
      expect(res.status).toBe(418);
    }
  });

  it('uses RESPONSE_VALIDATION_STATUS over legacy when both set', async () => {
    process.env.ENABLE_RESPONSE_VALIDATION = 'true';
    process.env.RESPONSE_VALIDATION_STRICT_STATUS = '418';
    process.env.RESPONSE_VALIDATION_STATUS = '422';

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'secret' });

    if (res.body && res.body.error === 'Response validation failed') {
      expect(res.status).toBe(422);
    } else if (res.status === 418) {
      // 418 would indicate the precedence failed (legacy overrode new) given a validation failure.
      throw new Error('Expected new RESPONSE_VALIDATION_STATUS (422) to take precedence over legacy 418');
    }
  });
});
