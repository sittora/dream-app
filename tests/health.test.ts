import request from 'supertest';
import { describe, it, expect } from 'vitest';

import { app } from '../src/server/app';

describe('GET /health', () => {
  it('returns 200 OK with expected payload', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, service: 'dream-app' });
  });
});

describe('GET /api/health (existing)', () => {
  it('returns 200 OK with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});