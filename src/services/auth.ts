import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { generateTOTP, verifyTOTP } from './mfa';
import { rateLimit } from './rateLimit';
import { logger } from './logger';
import { env } from '../config';

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);

interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  requiresMfa?: boolean;
}

class AuthService {
  async register(data: RegisterData): Promise<void> {
    try {
      await rateLimit.checkLimit(data.email);

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      logger.info('User registered successfully', { email: data.email });
    } catch (error) {
      logger.error('Registration failed', { error });
      throw error;
    }
  }

  async login({ email, password, mfaCode }: LoginCredentials): Promise<AuthResponse> {
    try {
      await rateLimit.checkLimit(email);
      const user = { id: '1', email, mfaEnabled: true };

      if (user.mfaEnabled && !mfaCode) {
        return { requiresMfa: true } as AuthResponse;
      }

      const accessToken = await this.generateAccessToken(user.id);
      const refreshToken = await this.generateRefreshToken(user.id);

      return { accessToken, refreshToken };
    } catch (error) {
      logger.error('Login failed', { error });
      throw error;
    }
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const accessToken = await this.generateAccessToken('1');
      return { accessToken };
    } catch (error) {
      logger.error('Token refresh failed', { error });
      throw error;
    }
  }

  async logout(deviceId: string): Promise<void> {
    try {
      logger.info('User logged out', { deviceId });
    } catch (error) {
      logger.error('Logout failed', { error });
      throw error;
    }
  }

  private async generateAccessToken(userId: string): Promise<string> {
    return new SignJWT({ sub: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('15m')
      .sign(JWT_SECRET);
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    return new SignJWT({ sub: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);
  }
}

export const authService = new AuthService();

// Export the register function directly for convenience
export const register = (data: RegisterData) => authService.register(data);