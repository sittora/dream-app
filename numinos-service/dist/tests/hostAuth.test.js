import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
// Unit tests here are simple and synchronous where possible
(async () => {
    // Load or generate a keypair for testing
    const keyDir = path.join(process.cwd(), 'tests', 'keys');
    if (!fs.existsSync(keyDir))
        fs.mkdirSync(keyDir, { recursive: true });
    const priv = path.join(keyDir, 'host_private.pem');
    const pub = path.join(keyDir, 'host_public.pem');
    if (!fs.existsSync(priv)) {
        const cp = await import('child_process');
        const execSync = cp.execSync;
        execSync(`openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out ${priv}`);
        execSync(`openssl rsa -pubout -in ${priv} -out ${pub}`);
    }
    const privateKey = fs.readFileSync(priv, 'utf-8');
    const publicKey = fs.readFileSync(pub, 'utf-8');
    // temporarily set env var for host public key BEFORE importing hostAuth
    process.env.NUMINOS_HOST_PUBLIC_KEY = publicKey;
    // import hostAuth after env is set so module-level load picks up the key
    const { verifyHostAssertion } = await import('../src/hostAuth.js');
    const now = Math.floor(Date.now() / 1000);
    const payload = { iss: 'test-host', aud: 'numinos-sidecar', iat: now, exp: now + 5, jti: 'test-jti-1' };
    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    try {
        const decoded = await verifyHostAssertion(token, { audience: 'numinos-sidecar', issuer: 'test-host' });
        console.log('verify passed', decoded.jti);
    }
    catch (e) {
        console.error('verify failed', e.message);
        process.exit(1);
    }
    // replay should fail
    try {
        await verifyHostAssertion(token, { audience: 'numinos-sidecar', issuer: 'test-host' });
        console.error('replay did not fail');
        process.exit(1);
    }
    catch (e) {
        console.log('replay protection passed');
    }
    // missing jti should fail
    const payloadNoJti = { iss: 'test-host', aud: 'numinos-sidecar', iat: now, exp: now + 5 };
    const tokenNoJti = jwt.sign(payloadNoJti, privateKey, { algorithm: 'RS256' });
    try {
        await verifyHostAssertion(tokenNoJti, { audience: 'numinos-sidecar', issuer: 'test-host' });
        console.error('missing jti did not fail');
        process.exit(1);
    }
    catch (e) {
        if (!/missing jti/.test(String(e.message))) {
            console.error('unexpected error for missing jti', e.message);
            process.exit(1);
        }
        console.log('missing jti check passed');
    }
    // expired token should fail
    const expiredPayload = { iss: 'test-host', aud: 'numinos-sidecar', iat: now - 20, exp: now - 10, jti: 'expired-jti' };
    const expiredToken = jwt.sign(expiredPayload, privateKey, { algorithm: 'RS256' });
    try {
        await verifyHostAssertion(expiredToken, { audience: 'numinos-sidecar', issuer: 'test-host' });
        console.error('expired token did not fail');
        process.exit(1);
    }
    catch (e) {
        if (!/jwt expired/.test(String(e.message)) && !/expired/.test(String(e.message))) {
            console.error('unexpected error for expired token', e.message);
            process.exit(1);
        }
        console.log('expired token check passed');
    }
    console.log('hostAuth tests completed');
})();
