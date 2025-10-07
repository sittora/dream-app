import { motion } from 'framer-motion';
import { Crown, Star, Shield } from 'lucide-react';
import React from 'react';

import { RANKS } from '../types/rewards';

interface RankBadgeProps {
  level: number;
  points: number;
  showProgress?: boolean;
}

const RankBadge = ({ level, points, showProgress = false }: RankBadgeProps) => {
  // Find current rank by iterating backwards through the ranks
  const currentRank = (() => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (points >= RANKS[i].minPoints) {
        return RANKS[i];
      }
    }
    return RANKS[0]; // Fallback to first rank
  })();
  
  const nextRank = RANKS.find(rank => points < rank.minPoints);

  const getIconForRank = (rankName: string) => {
    switch (rankName) {
      case 'Collective Guardian':
        return Crown;
      case 'Anima Sage':
      case 'Archetype Oracle':
        return Star;
      default:
        return Shield;
    }
  };

  const Icon = currentRank ? getIconForRank(currentRank.name) : Shield;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="inline-flex items-center gap-2 px-3 py-1 bg-burgundy/20 border border-burgundy/30 rounded-lg"
    >
      <Icon className="w-4 h-4 text-burgundy" />
      <span className="font-cinzel text-sm">{currentRank?.name}</span>
      
      {showProgress && nextRank && (
        <div className="ml-2 text-xs text-gray-400">
          {points}/{nextRank.minPoints}
        </div>
      )}
    </motion.div>
  );
};

export default RankBadge;