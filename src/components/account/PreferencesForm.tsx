import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Globe, Moon, Shield, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserPreferences } from '../../types/user';
import { userPreferencesSchema } from '../../types/user';

interface PreferencesFormProps {
  onSave: () => void;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({ onSave }) => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preferences, setPreferences] = useState<UserPreferences>(user?.preferences || {
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const validatedPreferences = userPreferencesSchema.parse(preferences);
      await updateUser({ preferences: validatedPreferences });
      setSuccess('Preferences updated successfully');
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotificationCategory = (category: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        categories: {
          ...prev.notifications.categories,
          [category]: value
        }
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-500/10 text-red-500 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-500/10 text-green-500 rounded-lg">
          {success}
        </div>
      )}

      <div className="dream-card space-y-6">
        <h2 className="font-cinzel text-xl flex items-center gap-2">
          <Globe className="w-5 h-5 text-burgundy" />
          Regional Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Language</label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value as any }))}
              className="input-field"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Time Zone</label>
            <select
              value={preferences.timezone}
              onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
              className="input-field"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="dream-card space-y-6">
        <h2 className="font-cinzel text-xl flex items-center gap-2">
          <Moon className="w-5 h-5 text-burgundy" />
          Appearance
        </h2>

        <div>
          <label className="block text-sm font-medium mb-1">Theme</label>
          <select
            value={preferences.theme}
            onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value as any }))}
            className="input-field"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      <div className="dream-card space-y-6">
        <h2 className="font-cinzel text-xl flex items-center gap-2">
          <Bell className="w-5 h-5 text-burgundy" />
          Notifications
        </h2>

        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.notifications.email}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, email: e.target.checked }
                }))}
                className="form-checkbox"
              />
              Email Notifications
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.notifications.sms}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, sms: e.target.checked }
                }))}
                className="form-checkbox"
              />
              SMS Notifications
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.notifications.push}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, push: e.target.checked }
                }))}
                className="form-checkbox"
              />
              Push Notifications
            </label>
          </div>

          <div className="border-t border-burgundy/20 pt-4">
            <h3 className="text-lg mb-3">Notification Categories</h3>
            <div className="space-y-3">
              {Object.entries(preferences.notifications.categories).map(([category, enabled]) => (
                <label key={category} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => updateNotificationCategory(category, e.target.checked)}
                    className="form-checkbox"
                  />
                  {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dream-card space-y-6">
        <h2 className="font-cinzel text-xl flex items-center gap-2">
          <Shield className="w-5 h-5 text-burgundy" />
          Privacy
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Profile Visibility</label>
            <select
              value={preferences.privacy.profileVisibility}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                privacy: { ...prev.privacy, profileVisibility: e.target.value as any }
              }))}
              className="input-field"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Default Dream Sharing</label>
            <select
              value={preferences.privacy.dreamSharingDefault}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                privacy: { ...prev.privacy, dreamSharingDefault: e.target.value as any }
              }))}
              className="input-field"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.privacy.showOnlineStatus}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                privacy: { ...prev.privacy, showOnlineStatus: e.target.checked }
              }))}
              className="form-checkbox"
            />
            Show Online Status
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>
    </form>
  );
};

export default PreferencesForm;
