import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { generateTOTP, verifyTOTP } from './mfa';
import { rateLimit } from './rateLimit';
import { logger } from './logger';
import { env } from '../config';
import { uploadService } from './upload';
import { fileValidation, validateResourceCleanup } from '../utils/validation';
import { feedbackManager } from '../utils/feedback';
import { handleAPIError } from '../utils/api-error';
import type { User } from '../types/auth';

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
  user?: User;
}

interface SocialAuthData {
  provider: 'google' | 'facebook' | 'twitter';
  token: string;
}

interface EmailVerificationData {
  email: string;
  token: string;
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
      
      // Mock user for demo - replace with actual DB lookup
      const user: User = {
        id: '1',
        email,
        username: 'user',
        role: 'user',
        mfaEnabled: true,
        profile: {
          displayName: 'Demo User',
          bio: 'A dream explorer',
          avatarUrl: '',
          socialLinks: []
        },
        preferences: {
          language: 'en',
          timezone: 'UTC',
          theme: 'system',
          notifications: {
            email: true,
            sms: false,
            push: true,
            categories: {
              promotions: true,
              accountUpdates: true,
              securityAlerts: true,
              dreamReminders: true,
              analysisResults: true
            }
          },
          privacy: {
            profileVisibility: 'public',
            dreamSharingDefault: 'private',
            showOnlineStatus: true
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (user.mfaEnabled && !mfaCode) {
        return { requiresMfa: true } as AuthResponse;
      }

      const accessToken = await this.generateAccessToken(user.id);
      const refreshToken = await this.generateRefreshToken(user.id);

      return { accessToken, refreshToken, user };
    } catch (error) {
      logger.error('Login failed', { error });
      throw error;
    }
  }

  async refreshToken(token: string): Promise<{ accessToken: string; user?: User }> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userId = payload.sub as string;
      
      // Mock user refresh - replace with DB lookup
      const user: User = {
        id: userId,
        email: 'user@example.com',
        username: 'user',
        role: 'user',
        mfaEnabled: true,
        profile: {
          displayName: 'Demo User',
          bio: 'A dream explorer',
          avatarUrl: '',
          socialLinks: []
        },
        preferences: {
          language: 'en',
          timezone: 'UTC',
          theme: 'system',
          notifications: {
            email: true,
            sms: false,
            push: true,
            categories: {
              promotions: true,
              accountUpdates: true,
              securityAlerts: true,
              dreamReminders: true,
              analysisResults: true
            }
          },
          privacy: {
            profileVisibility: 'public',
            dreamSharingDefault: 'private',
            showOnlineStatus: true
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const accessToken = await this.generateAccessToken(userId);
      return { accessToken, user };
    } catch (error) {
      logger.error('Token refresh failed', { error });
      throw error;
    }
  }

  async logout(deviceId: string): Promise<void> {
    try {
      // In production, invalidate the refresh token
      logger.info('User logged out', { deviceId });
    } catch (error) {
      logger.error('Logout failed', { error });
      throw error;
    }
  }

  async sendVerificationEmail(email: string): Promise<void> {
    try {
      const token = await this.generateVerificationToken(email);
      // TODO: Implement email sending service
      logger.info('Verification email sent', { email });
    } catch (error) {
      logger.error('Failed to send verification email', { error });
      throw error;
    }
  }

  async verifyEmail({ email, token }: EmailVerificationData): Promise<void> {
    try {
      const isValid = await this.verifyToken(token);
      if (!isValid) {
        throw new Error('Invalid verification token');
      }
      // TODO: Update user verification status in database
      logger.info('Email verified successfully', { email });
    } catch (error) {
      logger.error('Email verification failed', { error });
      throw error;
    }
  }

  async socialLogin(data: SocialAuthData): Promise<AuthResponse> {
    try {
      await rateLimit.checkLimit(data.provider);
      
      // Verify the social token with the respective provider
      const socialUser = await this.verifySocialToken(data);
      
      // Find or create user in our database
      const user = await this.findOrCreateSocialUser(socialUser);
      
      // Generate tokens
      const accessToken = await this.generateAccessToken(user.id);
      const refreshToken = await this.generateRefreshToken(user.id);
      
      logger.info('Social login successful', { provider: data.provider });
      
      return {
        accessToken,
        refreshToken,
        user,
      };
    } catch (error) {
      logger.error('Social login failed', { error });
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

  private async generateVerificationToken(email: string): Promise<string> {
    const token = new SignJWT({ email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);
    return token;
  }

  private async verifyToken(token: string): Promise<boolean> {
    try {
      await jwtVerify(token, JWT_SECRET);
      return true;
    } catch {
      return false;
    }
  }

  private async verifySocialToken(data: SocialAuthData): Promise<any> {
    // TODO: Implement social token verification for each provider
    switch (data.provider) {
      case 'google':
        // Verify Google token
        break;
      case 'facebook':
        // Verify Facebook token
        break;
      case 'twitter':
        // Verify Twitter token
        break;
      default:
        throw new Error('Unsupported social provider');
    }
  }

  private async findOrCreateSocialUser(socialUser: any): Promise<User> {
    // TODO: Implement user creation/retrieval logic
    return {} as User;
  }

  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    try {
      // In production, update user in database
      logger.info('User updated successfully', { userId, data });
    } catch (error) {
      logger.error('User update failed', { error });
      throw error;
    }
  }

  async exportUserData(userId: string): Promise<any> {
    return feedbackManager.handleDataExport(async () => {
      const response = await fetch(`${env.API_URL}/users/${userId}/export`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }).catch(handleAPIError('fetch user data'));

      if (!response.ok) {
        throw new Error('Failed to export user data');
      }

      const data = await response.json();

      // Validate export data structure
      if (!fileValidation.export.validateExportData(data)) {
        throw new Error('Invalid export data structure');
      }

      // Log the export for compliance
      logger.info('User data exported', {
        userId,
        timestamp: new Date().toISOString(),
      });

      return {
        user: {
          profile: data.profile,
          preferences: data.preferences,
          email: data.email,
          username: data.username,
          createdAt: data.createdAt,
        },
        dreams: data.dreams,
        analyses: data.analyses,
        exportedAt: new Date().toISOString(),
      };
    });
  }

  async deleteAccount(userId: string): Promise<void> {
    return feedbackManager.handleAccountDeletion(async () => {
      await feedbackManager.trackProgress(
        async () => {
          // First, export user data for compliance
          const userData = await this.exportUserData(userId);

          // Store the export in a secure location for compliance
          await this.storeDataForCompliance(userId, userData);

          // Prepare resources for cleanup
          const resources = [
            { type: 'user', id: userId },
            ...(userData.dreams?.map(d => ({ type: 'dream', id: d.id })) || []),
            ...(userData.analyses?.map(a => ({ type: 'analysis', id: a.id })) || []),
          ];

          // Validate all resources exist before cleanup
          await validateResourceCleanup(resources, 'account-deletion');

          // Delete user's profile picture if exists
          if (userData.user.profile?.avatarUrl) {
            const key = this.getKeyFromUrl(userData.user.profile.avatarUrl);
            await uploadService.deleteFile(key);
          }

          // Delete the account
          const response = await fetch(`${env.API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }).catch(handleAPIError('delete account'));

          if (!response.ok) {
            throw new Error('Failed to delete account');
          }

          // Log the deletion for compliance
          logger.info('Account deleted', {
            userId,
            timestamp: new Date().toISOString(),
          });
        },
        {
          startMessage: 'Starting account deletion process...',
          progressCallback: (progress) => {
            // Update progress indication
          },
          completeMessage: 'Account deletion completed',
        }
      );
    });
  }

  private async storeDataForCompliance(userId: string, data: any): Promise<void> {
    try {
      const response = await fetch(`${env.API_URL}/compliance/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          userId,
          data,
          type: 'account_deletion',
          timestamp: new Date().toISOString(),
        }),
      }).catch(handleAPIError('store compliance data'));

      if (!response.ok) {
        throw new Error('Failed to store compliance data');
      }
    } catch (error) {
      logger.error('Failed to store compliance data', { error, userId });
      throw error;
    }
  }

  private getKeyFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.slice(1); // Remove leading slash
    } catch {
      return '';
    }
  }
}

export const authService = new AuthService();

// Export the register function directly for convenience
export const register = (data: RegisterData) => authService.register(data);