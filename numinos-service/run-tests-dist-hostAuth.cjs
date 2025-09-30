#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { generateKeyPairSync } = require('crypto');
const jwt = require('jsonwebtoken');

(async function(){
  try {
    const keyDir = path.join(__dirname, 'test-keys');
    if (!fs.existsSync(keyDir)) fs.mkdirSync(keyDir, { recursive: true });
    const priv = path.join(keyDir, 'host_private.pem');
    const pub = path.join(keyDir, 'host_public.pem');
    if (!fs.existsSync(priv)) {
      const { privateKey, publicKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
      });
      fs.writeFileSync(priv, privateKey);
      fs.writeFileSync(pub, publicKey);
    }
    const privateKey = fs.readFileSync(priv, 'utf8');
    const publicKey = fs.readFileSync(pub, 'utf8');

    // Ensure env var is set before importing the ESM module (it reads on import)
    process.env.NUMINOS_HOST_PUBLIC_KEY = publicKey;

    // Dynamically import the compiled ESM module
    const hostAuthPath = path.join(__dirname, 'dist', 'hostAuth.js');
    const hostAuth = await import('file://' + hostAuthPath);

    const now = Math.floor(Date.now()/1000);
    const payload = { iss: 'test-host', aud: 'numinos-sidecar', iat: now, exp: now + 5, jti: 'test-jti-1' };
    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

    // First verification should pass
    try {
      const decoded = await hostAuth.verifyHostAssertion(token, { audience: 'numinos-sidecar', issuer: 'test-host' });
      console.log('verify passed', decoded.jti);
    } catch (e) {
      console.error('verify failed', e && e.message ? e.message : e);
      process.exit(1);
    }

    // Second call should fail (replay)
    try {
      await hostAuth.verifyHostAssertion(token, { audience: 'numinos-sidecar', issuer: 'test-host' });
      console.error('replay did not fail');
      process.exit(1);
    } catch (e) {
      console.log('replay protection passed');
    }

    console.log('hostAuth tests completed');
    process.exit(0);
  } catch (err) {
    console.error('test runner error', err);
    process.exit(2);
  }
})();
