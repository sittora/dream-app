import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

export function loadPrivateKey() {
  const p = process.env.NUMINOS_PRIVATE_KEY_PATH || path.join(process.cwd(), 'numinos-service', 'keys', 'private.pem');
  if (!fs.existsSync(p)) throw new Error('private key not found: ' + p);
  return fs.readFileSync(p, 'utf-8');
}

export function loadPublicKey() {
  const p = process.env.NUMINOS_PUBLIC_KEY_PATH || path.join(process.cwd(), 'numinos-service', 'keys', 'public.pem');
  if (!fs.existsSync(p)) throw new Error('public key not found: ' + p);
  return fs.readFileSync(p, 'utf-8');
}

export function mintToken({ userId, orgId, issuer = process.env.NUMINOS_ISS || 'my-app', scopes = ['analyze'] } : { userId: string, orgId?: string, issuer?: string, scopes?: string[] }) {
  const privateKey = loadPrivateKey();
  const payload = { sub: userId, orgId, scope: scopes } as any;
  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '5m', audience: 'numinos', issuer });
  return token;
}

export function verifyToken(token: string) {
  const pub = loadPublicKey();
  const decoded = jwt.verify(token, pub, { algorithms: ['RS256'], audience: 'numinos', issuer: process.env.NUMINOS_ISS || 'my-app' });
  return decoded as any;
}
