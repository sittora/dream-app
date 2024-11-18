import { z } from 'zod';

export interface User {
  id: string;
  email: string;
  username: string;
  profile?: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    socialLinks?: Array<{
      platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin';
      url: string;
    }>;
  };
  role: 'user' | 'admin';
  mfaEnabled: boolean;
  preferences: {
    language: 'en' | 'es' | 'fr' | 'de';
    timezone: string;
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      categories: {
        promotions: boolean;
        accountUpdates: boolean;
        securityAlerts: boolean;
        dreamReminders: boolean;
        analysisResults: boolean;
      };
    };
    privacy: {
      profileVisibility: 'public' | 'private' | 'friends';
      dreamSharingDefault: 'public' | 'private';
      showOnlineStatus: boolean;
    };
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string, mfaCode?: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (data: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  exportData: () => Promise<Blob>;
}

export const emailSchema = z.string().email('Invalid email format');

export const userProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  socialLinks: z.array(
    z.object({
      platform: z.enum(['twitter', 'instagram', 'facebook', 'linkedin']),
      url: z.string().url(),
    })
  ).optional(),
});

export const notificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  sms: z.boolean().default(false),
  push: z.boolean().default(true),
  categories: z.object({
    promotions: z.boolean().default(true),
    accountUpdates: z.boolean().default(true),
    securityAlerts: z.boolean().default(true),
    dreamReminders: z.boolean().default(true),
    analysisResults: z.boolean().default(true),
  }),
});

export const privacyPreferencesSchema = z.object({
  profileVisibility: z.enum(['public', 'private', 'friends']).default('public'),
  dreamSharingDefault: z.enum(['public', 'private']).default('private'),
  showOnlineStatus: z.boolean().default(true),
});

export const userPreferencesSchema = z.object({
  language: z.enum(['en', 'es', 'fr', 'de']).default('en'),
  timezone: z.string().default('UTC'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  notifications: notificationPreferencesSchema,
  privacy: privacyPreferencesSchema,
});