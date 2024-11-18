import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PreferencesForm from './PreferencesForm';
import ProfileForm from './ProfileForm';
import DataManagement from './DataManagement';

type SettingsTab = 'profile' | 'preferences' | 'data';

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'preferences' as const, label: 'Preferences', icon: Bell },
    { id: 'data' as const, label: 'Data & Privacy', icon: Shield },
  ];

  const handleSave = () => {
    // Refresh user data or perform any necessary updates
  };

  const handleAccountDeleted = () => {
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="font-cinzel text-3xl flex items-center gap-3">
          <Settings className="w-8 h-8 text-burgundy" />
          Account Settings
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your profile, preferences, and privacy settings
        </p>
      </div>

      <div className="flex gap-8">
        <div className="w-64 shrink-0">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-burgundy text-white'
                    : 'hover:bg-burgundy/10 text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'profile' && (
              <ProfileForm onSave={handleSave} />
            )}

            {activeTab === 'preferences' && (
              <PreferencesForm onSave={handleSave} />
            )}

            {activeTab === 'data' && (
              <DataManagement onAccountDeleted={handleAccountDeleted} />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
