#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

function loadPrivate() {
  if (process.env.NUMINOS_HOST_PRIVATE_KEY) return process.env.NUMINOS_HOST_PRIVATE_KEY;
  const p = process.env.NUMINOS_HOST_PRIVATE_KEY_PATH || path.join(process.cwd(), 'numinos-service', 'keys', 'host_private.pem');
  if (fs.existsSync(p)) return fs.readFileSync(p,'utf-8');
  throw new Error('no private key configured');
}

async function main(){
  const privateKey = loadPrivate();
  const now = Math.floor(Date.now()/1000);
  const payload = { iss: process.env.NUMINOS_HOST_ID || 'host-1', aud: process.env.NUMINOS_HOST_AUD || 'numinos-sidecar', iat: now, exp: now + 60, jti: Math.random().toString(36).slice(2) };
  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  const sidecar = process.env.SIDECAR_URL || 'http://localhost:5789';
  const userId = process.argv[2] || 'user123';
  const orgId = process.argv[3] || 'org1';
  const resp = await fetch(sidecar + '/token', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, orgId }) });
  const data = await resp.json();
  console.log('status', resp.status, data);
}

main().catch(err=>{ console.error(err); process.exit(1) });
