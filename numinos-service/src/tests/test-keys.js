import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const keysDir = path.join(process.cwd(), 'numinos-service', 'keys');
if (!fs.existsSync(keysDir)) fs.mkdirSync(keysDir, { recursive: true });
const priv = path.join(keysDir, 'private.pem');
const pub = path.join(keysDir, 'public.pem');
if (!fs.existsSync(priv) || !fs.existsSync(pub)) {
  console.log('Generating test RSA keypair for numinos-service...');
  execSync(`openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out ${priv}`);
  execSync(`openssl rsa -pubout -in ${priv} -out ${pub}`);
}
export const PRIVATE_KEY_PATH = priv;
export const PUBLIC_KEY_PATH = pub;
