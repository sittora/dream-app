import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Mail, Bell, Globe, Download, Trash2, AlertCircle } from 'lucide-react';
import BackButton from '../components/BackButton';
import { useAuth } from '../hooks/useAuth';
import { DeleteAccountModal } from '../components/account';
import { emailSchema, userPreferencesSchema } from '../types/auth';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
];

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
];

const AccountSettings = () => {
  const { user, updateUser, deleteAccount, exportData } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: user?.email || '',
    newsletter: user?.newsletter || false,
    preferences: user?.preferences || {
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        promotions: true,
        security: true,
        updates: true,
      },
      theme: 'dark' as const,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validate email
      const validEmail = emailSchema.parse(formData.email);
      
      // Validate preferences
      const validPreferences = userPreferencesSchema.parse(formData.preferences);

      await updateUser({
        email: validEmail,
        newsletter: formData.newsletter,
        preferences: validPreferences,
      });

      setSuccess('Settings updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportData();
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `account-data-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export data');
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      <BackButton />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-cinzel text-3xl text-burgundy flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Account Settings
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-900/20 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <div className="dream-card space-y-6">
            <h2 className="font-cinzel text-xl flex items-center gap-2">
              <Mail className="w-5 h-5 text-burgundy" />
              Email & Newsletter
            </h2>

            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.newsletter}
                onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
                className="form-checkbox text-burgundy rounded border-burgundy/30 bg-transparent focus:ring-burgundy"
              />
              <span>Subscribe to our newsletter</span>
            </label>
          </div>

          <div className="dream-card space-y-6">
            <h2 className="font-cinzel text-xl flex items-center gap-2">
              <Bell className="w-5 h-5 text-burgundy" />
              Notifications
            </h2>

            <div className="space-y-4">
              {Object.entries(formData.preferences.notifications).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="capitalize">{key.replace('_', ' ')}</span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        notifications: {
                          ...formData.preferences.notifications,
                          [key]: e.target.checked
                        }
                      }
                    })}
                    className="form-checkbox text-burgundy rounded border-burgundy/30 bg-transparent focus:ring-burgundy"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="dream-card space-y-6">
            <h2 className="font-cinzel text-xl flex items-center gap-2">
              <Globe className="w-5 h-5 text-burgundy" />
              Regional Settings
            </h2>

            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select
                value={formData.preferences.language}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: {
                    ...formData.preferences,
                    language: e.target.value
                  }
                })}
                className="input-field"
              >
                {LANGUAGES.map(({ code, name }) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Time Zone</label>
              <select
                value={formData.preferences.timezone}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: {
                    ...formData.preferences,
                    timezone: e.target.value
                  }
                })}
                className="input-field"
              >
                {TIMEZONES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 bg-mystic-900/50 rounded-lg hover:bg-mystic-900 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </motion.div>

      <AnimatePresence>
        {showDeleteModal && (
          <DeleteAccountModal
            onClose={() => setShowDeleteModal(false)}
            onConfirm={deleteAccount}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountSettings;