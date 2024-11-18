import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import logger from '../logger'; // assuming logger is imported from another file

const APP_NAME = 'Anima Insights';

export async function generateTOTP(userEmail: string) {
  try {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(userEmail, APP_NAME, secret);
    const qrCode = await QRCode.toDataURL(otpauth);

    return { secret, qrCode };
  } catch (error) {
    console.error('Failed to generate TOTP:', error);
    throw new Error('Failed to generate MFA credentials');
  }
}

export function verifyTOTP(token: string, secret: string): boolean {
  try {
    if (!token || !secret) {
      throw new Error('Invalid TOTP parameters');
    }
    return authenticator.verify({ token, secret });
  } catch (error) {
    logger.error('Failed to verify TOTP:', { error });
    return false;
  }
}

export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    codes.push(code);
  }
  return codes;
}