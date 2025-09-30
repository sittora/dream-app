import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

async function main(){
  const privateKeyPath = process.env.NUMINOS_HOST_PRIVATE_KEY_PATH || path.join(process.cwd(), 'numinos-service', 'keys', 'host_private.pem');
  const privateKey = fs.readFileSync(privateKeyPath, 'utf-8');
  const now = Math.floor(Date.now()/1000);
  const payload = { iss: process.env.NUMINOS_HOST_ID || 'host-1', aud: process.env.NUMINOS_HOST_AUD || 'numinos-sidecar', iat: now, exp: now + 60, jti: Math.random().toString(36).slice(2) };
  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  const sidecar = process.env.SIDECAR_URL || 'http://localhost:5789';
  const userId = process.argv[2] || 'user123';
  const orgId = process.argv[3] || 'org1';
  const res = await fetch(sidecar + '/token', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, orgId }) });
  console.log('status', res.status, await res.json());
}

main().catch(e=>{ console.error(e); process.exit(1) });
