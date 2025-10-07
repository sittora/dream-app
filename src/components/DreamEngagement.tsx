import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Share2, BarChart2, Flag } from 'lucide-react';
import React, { useState } from 'react';

import type { Dream, User } from '../types';

interface DreamEngagementProps {
  dream: Dream;
  currentUser: User;
  onLike: (dreamId: number) => void;
  onComment: (dreamId: number) => void;
  onSave: (dreamId: number) => void;
  onShare: (dreamId: number) => void;
  onReport: (dreamId: number) => void;
}

const DreamEngagement = ({
  dream,
  currentUser,
  onLike,
  onComment,
  onSave,
  onShare,
  onReport
}: DreamEngagementProps) => {
  const [showStats, setShowStats] = useState(false);

  const engagementActions = [
    {
      icon: Heart,
      label: 'Like',
      count: dream.likes,
      active: dream.liked,
      onClick: () => onLike(dream.id),
      activeClass: 'text-burgundy fill-burgundy'
    },
    {
      icon: MessageCircle,
      label: 'Comment',
      count: dream.comments.length,
      onClick: () => onComment(dream.id)
    },
    {
      icon: Bookmark,
      label: 'Save',
      count: dream.saves,
      active: dream.saved,
      onClick: () => onSave(dream.id),
      activeClass: 'text-burgundy fill-burgundy'
    },
    {
      icon: Share2,
      label: 'Share',
      count: dream.shares,
      onClick: () => onShare(dream.id)
    }
  ];

  return (
    <div className="border-t border-burgundy/20 mt-4 pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {engagementActions.map(({ icon: Icon, label, count, active, onClick, activeClass }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClick}
              className={`flex items-center gap-2 text-gray-400 hover:text-burgundy transition-colors ${
                active ? activeClass : ''
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'fill-current' : ''}`} />
              <span className="text-sm">{count}</span>
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setShowStats(!showStats)}
            className="text-gray-400 hover:text-burgundy transition-colors"
          >
            <BarChart2 className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => onReport(dream.id)}
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <Flag className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-mystic-900/50 rounded-lg"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-cinzel text-burgundy">
                  {((dream.likes / dream.views) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">Engagement Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-cinzel text-burgundy">
                  {dream.views}
                </div>
                <div className="text-sm text-gray-400">Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-cinzel text-burgundy">
                  {dream.shares}
                </div>
                <div className="text-sm text-gray-400">Shares</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-cinzel text-burgundy">
                  {dream.saves}
                </div>
                <div className="text-sm text-gray-400">Saves</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DreamEngagement;