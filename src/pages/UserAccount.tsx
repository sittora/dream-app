import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Link as LinkIcon, Edit2, UserPlus, UserMinus, Mail, Globe, Twitter, Instagram } from 'lucide-react';
import BackButton from '../components/BackButton';
import type { User as UserType } from '../types';

interface SocialLink {
  platform: string;
  url: string;
  icon: typeof Twitter;
}

const UserAccount = () => {
  const [user, setUser] = useState<UserType>({
    id: '1',
    username: 'DreamWeaver',
    email: 'dreamweaver@example.com',
    points: 250,
    level: 3,
    insightRank: 'Mystic Interpreter',
    friends: [],
    dreamAnalysisCount: 15,
    bio: 'Exploring the depths of the unconscious mind through dream analysis and Jungian psychology.',
    profileImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&auto=format&fit=crop',
    socialLinks: [
      { platform: 'Twitter', url: '', icon: Twitter },
      { platform: 'Instagram', url: '', icon: Instagram },
      { platform: 'Website', url: '', icon: Globe },
    ],
    dreamStats: {
      totalDreams: 15,
      publicDreams: 8,
      privateDreams: 7,
      totalLikes: 42,
      totalComments: 12,
      totalSaves: 5,
    },
    engagement: {
      followers: ['user2', 'user3'],
      following: ['user4', 'user5'],
      blockedUsers: [],
      notifications: [],
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      privateAccount: false,
      showEngagementStats: true,
      allowMessages: 'everyone',
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [selectedTab, setSelectedTab] = useState<'profile' | 'friends'>('profile');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedUser(prev => ({
          ...prev,
          profileImage: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setUser(editedUser);
    setIsEditing(false);
  };

  const handleRemoveFriend = (friendId: string) => {
    setUser(prev => ({
      ...prev,
      friends: prev.friends.filter(id => id !== friendId)
    }));
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
                    <div>
                      <label className="block text-sm font-medium mb-1">Bio</label>
                      <textarea
                        value={editedUser.bio}
                        onChange={(e) => setEditedUser(prev => ({ ...prev, bio: e.target.value }))}
                        className="input-field min-h-[100px]"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Social Links</label>
                      <div className="space-y-3">
                        {editedUser.socialLinks?.map((link, index) => (
                          <div key={link.platform} className="flex items-center gap-2">
                            <link.icon className="w-4 h-4 text-burgundy" />
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => {
                                const newLinks = [...(editedUser.socialLinks || [])];
                                newLinks[index] = { ...link, url: e.target.value };
                                setEditedUser(prev => ({ ...prev, socialLinks: newLinks }));
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