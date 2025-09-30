import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import IORedis from 'ioredis';
(async () => {
    const keyDir = path.join(process.cwd(), 'tests', 'keys');
    if (!fs.existsSync(keyDir))
        fs.mkdirSync(keyDir, { recursive: true });
    const priv = path.join(keyDir, 'host_private.pem');
    const pub = path.join(keyDir, 'host_public.pem');
    if (!fs.existsSync(priv)) {
        const cp = await import('child_process');
        cp.execSync(`openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out ${priv}`);
        cp.execSync(`openssl rsa -pubout -in ${priv} -out ${pub}`);
    }
    const privateKey = fs.readFileSync(priv, 'utf-8');
    const publicKey = fs.readFileSync(pub, 'utf-8');
    process.env.NUMINOS_HOST_PUBLIC_KEY = publicKey;
    process.env.REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    // import hostAuth after env is set
    const { verifyHostAssertion } = await import('../src/hostAuth.js');
    const now = Math.floor(Date.now() / 1000);
    const jti = `redis-test-${now}`;
    const payload = { iss: 'test-host', aud: 'numinos-sidecar', iat: now, exp: now + 10, jti };
    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    const IORedisLib = IORedis.default || IORedis;
    const redis = new IORedisLib(process.env.REDIS_URL);
    // ioredis auto-connects in many builds; attempt connect if available
    if (redis.connect) {
        try {
            await redis.connect();
        }
        catch (e) { /* ignore */ }
    }
    try {
        await verifyHostAssertion(token, { audience: 'numinos-sidecar', issuer: 'test-host' });
    }
    catch (e) {
        console.error('verify failed', e.message || e);
        process.exit(1);
    }
    // check Redis for the jti key
    const val = await redis.get(`numinos:host:jti:${jti}`);
    if (!val) {
        console.error('Redis did not store jti');
        process.exit(1);
    }
    console.log('Redis usage test passed');
    await redis.quit();
    process.exit(0);
})();
