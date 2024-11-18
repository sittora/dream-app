import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Trash2, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserProfile } from '../../types/user';
import { userProfileSchema } from '../../types/user';

interface ProfileFormProps {
  onSave: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onSave }) => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<UserProfile>(user?.profile || {
    username: user?.username || '',
    displayName: '',
    bio: '',
    avatarUrl: '',
    socialLinks: []
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: Implement file upload to your storage service
    try {
      setIsLoading(true);
      // const uploadedUrl = await uploadFile(file);
      // setProfile(prev => ({ ...prev, avatarUrl: uploadedUrl }));
    } catch (err) {
      setError('Failed to upload avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const validatedProfile = userProfileSchema.parse(profile);
      await updateUser({ profile: validatedProfile });
      setSuccess('Profile updated successfully');
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const addSocialLink = () => {
    setProfile(prev => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), { platform: 'twitter', url: '' }]
    }));
  };

  const removeSocialLink = (index: number) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: prev.socialLinks?.filter((_, i) => i !== index)
    }));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: prev.socialLinks?.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
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
        <div className="flex items-center gap-6">
          <div 
            className="relative w-24 h-24 rounded-full overflow-hidden bg-burgundy/10 cursor-pointer"
            onClick={handleAvatarClick}
          >
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-burgundy/50" />
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div>
            <h2 className="font-cinzel text-xl">Profile Picture</h2>
            <p className="text-sm text-gray-600">Click to upload a new profile picture</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
              className="input-field"
              placeholder="your_username"
              required
              minLength={3}
              maxLength={30}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <input
              type="text"
              value={profile.displayName || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
              className="input-field"
              placeholder="Your Name"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={profile.bio || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              className="input-field min-h-[100px]"
              placeholder="Tell us about yourself..."
              maxLength={500}
            />
          </div>
        </div>
      </div>

      <div className="dream-card space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-cinzel text-xl flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-burgundy" />
            Social Links
          </h2>
          <button
            type="button"
            onClick={addSocialLink}
            className="btn-secondary text-sm"
          >
            Add Link
          </button>
        </div>

        <div className="space-y-4">
          {profile.socialLinks?.map((link, index) => (
            <div key={index} className="flex gap-4">
              <select
                value={link.platform}
                onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                className="input-field w-1/4"
              >
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
              </select>
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                className="input-field flex-1"
                placeholder="https://"
              />
              <button
                type="button"
                onClick={() => removeSocialLink(index)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
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
            'Save Profile'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
