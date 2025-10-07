import request from 'supertest';
import { describe, it, expect } from 'vitest';

import { app } from '../src/server/app';

describe('API health & version', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('GET /version returns metadata with short sha or unknown', async () => {
    const res = await request(app).get('/version');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('service');
    expect(res.body).toHaveProperty('gitSha');
    const val: string = res.body.gitSha;
    expect(typeof val).toBe('string');
    if (val !== 'unknown') {
      expect(val.length).toBe(7);
    }
  });
});
