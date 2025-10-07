import request from 'supertest';
import { describe, it, expect } from 'vitest';

import { app } from '../src/server/app';

describe('/version env-aware gitSha truncation', () => {
  it('returns 7-char shortened gitSha when GIT_SHA is set', async () => {
    const original = process.env.GIT_SHA;
    process.env.GIT_SHA = '0123456789abcdef';
    const res = await request(app).get('/version');
    expect(res.status).toBe(200);
    expect(res.body.gitSha).toBe('0123456');
    // restore
    if (original === undefined) delete process.env.GIT_SHA; else process.env.GIT_SHA = original;
  });
});
