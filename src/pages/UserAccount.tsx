import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Link as LinkIcon, Edit2, UserPlus, UserMinus, Mail, Globe, Twitter, Instagram } from 'lucide-react';
import BackButton from '../components/BackButton';
import type { User as UserType } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface SocialLink {
  platform: string;
  url: string;
  icon: typeof Twitter;
}

const UserAccount = () => {
  const { user: authUser, isLoading } = useAuth();
  const navigate = useNavigate();

  // Initialize user state from authenticated user when available
  const [user, setUser] = useState<UserType | null>(() => {
    return authUser || null;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserType | null>(user);
  const [selectedTab, setSelectedTab] = useState<'profile' | 'friends'>('profile');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Import updateUser lazily to avoid circular deps at top-level
  const saveToServer = async (userId: string, payload: any) => {
    const mod = await import('../services/userClient');
    return mod.updateUser(userId, payload);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedUser(prev => prev ? ({
          ...prev,
          profileImage: reader.result as string
        }) : prev);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!authUser || !editedUser) return;
    // Optimistic update
    const previous = user;
    setUser(editedUser as UserType);
    setIsSaving(true);
    setStatusMessage(null);

    const payload = {
      bio: editedUser.bio,
      profileImage: editedUser.profileImage,
      socialLinks: editedUser.socialLinks?.map(s => ({ platform: s.platform, url: s.url }))
    };

    saveToServer(authUser.id, payload)
      .then(() => {
        setStatusMessage('Profile updated successfully');
      })
      .catch((err) => {
        // Rollback optimistic update
        setUser(previous as UserType);
        setEditedUser(previous as UserType);
        setStatusMessage('Failed to save changes. Please try again.');
        console.error('Failed to update user:', err);
      })
      .finally(() => {
        setIsSaving(false);
        setIsEditing(false);
      });
  };

  const handleRemoveFriend = (friendId: string) => {
    if (!user) return;
    setUser(prev => (
      prev ? { ...prev, friends: prev.friends.filter(id => id !== friendId) } : prev
    ));
  };

  // Redirect to login if not authenticated (and not in a loading state)
  useEffect(() => {
    if (!isLoading && !authUser) {
      navigate('/login');
    }
  }, [authUser, isLoading, navigate]);

  // Keep local user state in sync with authUser
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setEditedUser(authUser);
    }
  }, [authUser]);

  // Respect loading/unauthenticated states: show loader while checking auth,
  // and bail out early if unauthenticated (redirect handled in effect above).
  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative max-w-4xl mx-auto">
      <BackButton />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-cinzel text-3xl text-burgundy">Account Settings</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSelectedTab('profile')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedTab === 'profile'
                ? 'bg-burgundy/20 text-burgundy'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setSelectedTab('friends')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedTab === 'friends'
                ? 'bg-burgundy/20 text-burgundy'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            My Friends
          </button>
        </div>

        {selectedTab === 'profile' ? (
          <div className="dream-card">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center">
                <div className="relative">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.username}
                      className="w-32 h-32 rounded-full object-cover border-2 border-burgundy/30"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-burgundy/20 flex items-center justify-center">
                      <User className="w-12 h-12 text-burgundy" />
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 p-2 bg-burgundy rounded-full cursor-pointer shadow-lg">
                      <Camera className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
                <div className="text-center mt-4">
                  <h2 className="font-cinzel text-xl">{user.username}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                    <span>Level {user.level}</span>
                    <span>•</span>
                    <span>{user.points} points</span>
                  </div>
                  <div className="text-burgundy text-sm mt-1">{user.insightRank}</div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                {isEditing ? (
                  <>
                    {editedUser && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Bio</label>
                        <textarea
                          value={editedUser.bio}
                          onChange={(e) => setEditedUser(prev => prev ? ({ ...prev, bio: e.target.value }) : prev)}
                          className="input-field min-h-[100px]"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-1">Social Links</label>
                      <div className="space-y-3">
                        {editedUser?.socialLinks?.map((link, index) => (
                          <div key={link.platform} className="flex items-center gap-2">
                            <link.icon className="w-4 h-4 text-burgundy" />
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => {
                                const newLinks = [...(editedUser?.socialLinks || [])];
                                newLinks[index] = { ...link, url: e.target.value };
                                setEditedUser(prev => prev ? ({ ...prev, socialLinks: newLinks }) : prev);
                              }}
                              placeholder={`Your ${link.platform} URL`}
                              className="input-field"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="btn-primary"
                      >
                        Save Changes
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="font-medium mb-2">Bio</h3>
                      <p className="text-gray-300">{user.bio}</p>
                    </div>

                    {user.socialLinks?.some(link => link.url) && (
                      <div>
                        <h3 className="font-medium mb-2">Social Links</h3>
                        <div className="flex gap-4">
                          {user.socialLinks.map(link => link.url && (
                            <a
                              key={link.platform}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-burgundy hover:text-burgundy/80 transition-colors"
                            >
                              <link.icon className="w-5 h-5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-medium mb-2">Stats</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-mystic-900/50 rounded-lg">
                          <div className="text-2xl font-cinzel text-burgundy">
                            {user.dreamAnalysisCount}
                          </div>
                          <div className="text-sm text-gray-400">Dreams Analyzed</div>
                        </div>
                        <div className="p-4 bg-mystic-900/50 rounded-lg">
                          <div className="text-2xl font-cinzel text-burgundy">
                            {user.friends.length}
                          </div>
                          <div className="text-sm text-gray-400">Friends</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="dream-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-cinzel text-xl">My Friends</h2>
              <button className="btn-primary flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Find Friends
              </button>
            </div>

            <div className="space-y-4">
              {user.friends.length > 0 ? (
                user.friends.map(friendId => (
                  <div
                    key={friendId}
                    className="flex items-center justify-between p-4 bg-mystic-900/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-burgundy/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-burgundy" />
                      </div>
                      <div>
                        <div className="font-medium">Friend Name</div>
                        <div className="text-sm text-gray-400">Mystic Explorer</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="p-2 hover:bg-burgundy/20 rounded-lg transition-colors">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friendId)}
                        className="p-2 hover:bg-burgundy/20 rounded-lg transition-colors text-burgundy"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <UserPlus className="w-12 h-12 mx-auto mb-4 text-burgundy/50" />
                  <p>You haven't added any friends yet.</p>
                  <p className="text-sm">Connect with fellow dream explorers to share insights.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UserAccount;