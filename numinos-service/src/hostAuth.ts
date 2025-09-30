import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import IORedis from 'ioredis';

type HostAssertion = { iss?: string; aud?: string; exp?: number; iat?: number; jti?: string } & Record<string, any>;

// Load host public key from env (either raw PEM in NUMINOS_HOST_PUBLIC_KEY or path in NUMINOS_HOST_PUBLIC_KEY_PATH)
function loadHostPublicKey(): string | null {
  if (process.env.NUMINOS_HOST_PUBLIC_KEY) return process.env.NUMINOS_HOST_PUBLIC_KEY;
  const p = process.env.NUMINOS_HOST_PUBLIC_KEY_PATH || path.join(process.cwd(), 'numinos-service', 'keys', 'host_public.pem');
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf-8');
  return null;
}

const hostPublicKey = loadHostPublicKey();

// Redis-backed or in-memory replay guard
let redis: IORedis.Redis | null = null;
if (process.env.REDIS_URL) {
  const IORedisLib: any = (IORedis as any).default || IORedis;
  redis = new IORedisLib(process.env.REDIS_URL);
}

async function storeJti(jti: string, expSec: number) {
  if (redis) {
    const ttl = Math.max(1, expSec - Math.floor(Date.now() / 1000));
    await redis.set(`numinos:host:jti:${jti}`, '1', 'EX', ttl);
    return;
  }
  // fallback: in-memory map with TTL
  (storeJti as any)._map = (storeJti as any)._map || new Map<string, number>();
  (storeJti as any)._map.set(jti, expSec);
}

async function hasJti(jti: string) {
  if (redis) {
    const v = await redis.get(`numinos:host:jti:${jti}`);
    return !!v;
  }
  const m: Map<string, number> = (storeJti as any)._map || new Map();
  const exp = m.get(jti);
  if (!exp) return false;
  if (exp < Math.floor(Date.now() / 1000)) { m.delete(jti); return false; }
  return true;
}

export async function verifyHostAssertion(token: string, opts?: { audience?: string, issuer?: string }): Promise<HostAssertion> {
  if (!hostPublicKey) throw new Error('NUMINOS_HOST_PUBLIC_KEY not configured');
  const audience = opts?.audience || 'numinos-sidecar';
  const issuer = opts?.issuer;
  const decoded = jwt.verify(token, hostPublicKey, { algorithms: ['RS256'], audience, issuer }) as HostAssertion;
  if (!decoded.jti) throw new Error('missing jti in assertion');
  const exp = decoded.exp || 0;
  if (await hasJti(decoded.jti)) throw new Error('replayed assertion');
  await storeJti(decoded.jti, exp);
  return decoded;
}

// Express middleware to require host assertion in Authorization: Bearer <token>
export async function requireHostAssertion(req: any, res: any, next: any) {
  const auth = req.headers['authorization'] || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing host assertion' });
  const token = auth.slice('Bearer '.length);
  try {
    const decoded = await verifyHostAssertion(token, { audience: process.env.NUMINOS_HOST_AUD || 'numinos-sidecar', issuer: process.env.NUMINOS_HOST_ID });
    req.hostAssertion = decoded;
    next();
  } catch (e:any) {
    return res.status(401).json({ message: 'Invalid host assertion', reason: String(e.message || e) });
  }
}
