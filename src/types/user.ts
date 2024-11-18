import { z } from 'zod';

export const notificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  sms: z.boolean().default(false),
  push: z.boolean().default(true),
  categories: z.object({
    promotions: z.boolean().default(true),
    accountUpdates: z.boolean().default(true),
    securityAlerts: z.boolean().default(true),
    dreamReminders: z.boolean().default(true),
    analysisResults: z.boolean().default(true)
  })
});

export const userPreferencesSchema = z.object({
  language: z.enum(['en', 'es', 'fr', 'de']).default('en'),
  timezone: z.string().default('UTC'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  notifications: notificationPreferencesSchema,
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private', 'friends']).default('public'),
    dreamSharingDefault: z.enum(['public', 'private']).default('private'),
    showOnlineStatus: z.boolean().default(true)
  })
});

export const userProfileSchema = z.object({
  username: z.string().min(3).max(30),
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  socialLinks: z.array(
    z.object({
      platform: z.enum(['twitter', 'instagram', 'facebook', 'linkedin']),
      url: z.string().url()
    })
  ).optional()
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  profile: userProfileSchema,
  preferences: userPreferencesSchema,
  mfaEnabled: z.boolean().default(false),
  lastLogin: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type User = z.infer<typeof userSchema>;
