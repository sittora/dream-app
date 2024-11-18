import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, Share2, Award, UserPlus } from 'lucide-react';
import type { Dream, User, Comment } from '../types';
import RankBadge from './RankBadge';

interface DreamWebProps {
  currentUser: User;
}

const DreamWeb = ({ currentUser }: DreamWebProps) => {
  const [selectedTab, setSelectedTab] = useState<'trending' | 'latest' | 'following'>('trending');

  return (
    <div className="dream-card">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          {['trending', 'latest', 'following'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as typeof selectedTab)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedTab === tab
                  ? 'bg-burgundy/20 text-burgundy'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Dream content will be rendered here */}
      </div>
    </div>
  );
};

export default DreamWeb;