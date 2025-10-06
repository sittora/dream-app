import sodium from 'libsodium-wrappers';

/**
 * Field-level encryption using libsodium (XChaCha20-Poly1305)
 * For encrypting sensitive data at rest (TOTP secrets, recovery info)
 */

// Initialize sodium
let sodiumReady = false;
const initSodium = async () => {
  if (!sodiumReady) {
    await sodium.ready;
    sodiumReady = true;
  }
};

// Get encryption keys from environment
const getEncryptionKey = (): Uint8Array => {
  const keyBase64 = process.env.DATA_ENC_KEY;
  if (!keyBase64) {
    throw new Error('DATA_ENC_KEY environment variable not set');
  }
  
  try {
    const keyBuffer = Buffer.from(keyBase64, 'base64');
    if (keyBuffer.length !== 32) {
      throw new Error('DATA_ENC_KEY must be 32 bytes (base64 encoded)');
    }
    return new Uint8Array(keyBuffer);
  } catch (error) {
    throw new Error('Invalid DATA_ENC_KEY format - must be valid base64');
  }
};

const getPreviousEncryptionKey = (): Uint8Array | null => {
  const keyBase64 = process.env.DATA_ENC_KEY_PREV;
  if (!keyBase64) return null;
  
  try {
    const keyBuffer = Buffer.from(keyBase64, 'base64');
    if (keyBuffer.length !== 32) return null;
    return new Uint8Array(keyBuffer);
  } catch (error) {
    return null;
  }
};

/**
 * Encrypt sensitive data using XChaCha20-Poly1305
 */
export async function encryptSensitiveData(plaintext: string): Promise<string> {
  await initSodium();
  
  const key = getEncryptionKey();
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
  
  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    plaintext,
    null, // no additional data
    null, // no secret nonce
    nonce,
    key
  );
  
  // Combine nonce + ciphertext and encode as base64
  const combined = new Uint8Array(nonce.length + ciphertext.length);
  combined.set(nonce);
  combined.set(ciphertext, nonce.length);
  
  return Buffer.from(combined).toString('base64');
}

/**
 * Decrypt sensitive data, supporting key rotation
 */
export async function decryptSensitiveData(encryptedData: string): Promise<string> {
  await initSodium();
  
  try {
    const combined = new Uint8Array(Buffer.from(encryptedData, 'base64'));
    const nonceSize = sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES;
    
    if (combined.length < nonceSize) {
      throw new Error('Invalid encrypted data format');
    }
    
    const nonce = combined.slice(0, nonceSize);
    const ciphertext = combined.slice(nonceSize);
    
    // Try current key first
    try {
      const key = getEncryptionKey();
      const decrypted = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null, // no secret nonce
        ciphertext,
        null, // no additional data
        nonce,
        key
      );
      return sodium.to_string(decrypted);
    } catch (error) {
      // Try previous key for rotation support
      const prevKey = getPreviousEncryptionKey();
      if (!prevKey) {
        throw error;
      }
      
      const decrypted = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        ciphertext,
        null,
        nonce,
        prevKey
      );
      return sodium.to_string(decrypted);
    }
  } catch (error) {
    throw new Error('Failed to decrypt sensitive data');
  }
}

/**
 * Generate a new 32-byte encryption key (for initial setup)
 */
export async function generateEncryptionKey(): Promise<string> {
  await initSodium();
  
  const key = sodium.randombytes_buf(32);
  return Buffer.from(key).toString('base64');
}

/**
 * Securely wipe sensitive data from memory (best effort)
 */
export function wipeSensitiveData(data: string | Buffer | Uint8Array): void {
  if (typeof data === 'string') {
    // JavaScript strings are immutable, so we can't actually wipe them
    // This is more of a documentation/intent signal
    return;
  }
  
  if (data instanceof Buffer) {
    data.fill(0);
  } else if (data instanceof Uint8Array) {
    data.fill(0);
  }
}