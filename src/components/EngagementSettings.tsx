import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, Eye, Lock, MessageCircle, Heart, UserPlus } from 'lucide-react';
import type { User, NotificationSetting } from '../types';

interface EngagementSettingsProps {
  user: User;
  onUpdate: (settings: Partial<User['preferences']>) => void;
}

const EngagementSettings = ({ user, onUpdate }: EngagementSettingsProps) => {
  return (
    <div className="dream-card">
      <h3 className="font-cinzel text-xl mb-6">Engagement Settings</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-4">Notifications</h4>
          <div className="space-y-4">
            {user.engagement.notifications.map((setting) => (
              <div key={setting.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-burgundy" />
                  <span>{setting.type.charAt(0).toUpperCase() + setting.type.slice(1)}</span>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={setting.email}
                      onChange={(e) => {
                        const updatedNotifications = user.engagement.notifications.map((n) =>
                          n.type === setting.type ? { ...n, email: e.target.checked } : n
                        );
                        onUpdate({
                          emailNotifications: updatedNotifications.some((n) => n.email),
                        });
                      }}
                      className="form-checkbox text-burgundy"
                    />
                    <Mail className="w-4 h-4" />
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={setting.push}
                      onChange={(e) => {
                        const updatedNotifications = user.engagement.notifications.map((n) =>
                          n.type === setting.type ? { ...n, push: e.target.checked } : n
                        );
                        onUpdate({
                          pushNotifications: updatedNotifications.some((n) => n.push),
                        });
                      }}
                      className="form-checkbox text-burgundy"
                    />
                    <Bell className="w-4 h-4" />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4">Privacy</h4>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-burgundy" />
                <span>Private Account</span>
              </div>
              <input
                type="checkbox"
                checked={user.preferences.privateAccount}
                onChange={(e) =>
                  onUpdate({ privateAccount: e.target.checked })
                }
                className="form-checkbox text-burgundy"
              />
            </label>
            <label className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-burgundy" />
                <span>Show Engagement Stats</span>
              </div>
              <input
                type="checkbox"
                checked={user.preferences.showEngagementStats}
                onChange={(e) =>
                  onUpdate({ showEngagementStats: e.target.checked })
                }
                className="form-checkbox text-burgundy"
              />
            </label>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4">Messaging</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-burgundy" />
                <span>Allow Messages From</span>
              </div>
              <select
                value={user.preferences.allowMessages}
                onChange={(e) =>
                  onUpdate({
                    allowMessages: e.target.value as User['preferences']['allowMessages'],
                  })
                }
                className="input-field w-auto"
              >
                <option value="everyone">Everyone</option>
                <option value="followers">Followers Only</option>
                <option value="none">No One</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementSettings;