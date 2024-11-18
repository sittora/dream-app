import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tag, Heart, MessageCircle, Bookmark, Eye, EyeOff } from 'lucide-react';
import { Dream } from '../types';

interface DreamCardProps {
  dream: Dream;
  onLike?: (dreamId: number) => void;
  onSave?: (dreamId: number) => void;
  onComment?: (dreamId: number) => void;
}

const DreamCard = ({ dream, onLike, onSave, onComment }: DreamCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="gothic-card scroll-decoration mb-8"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-cinzel text-xl text-burgundy mb-2">{dream.title}</h3>
          <div className="flex items-center gap-3 text-sm text-parchment/70">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {dream.date}
            </span>
            {dream.visibility === 'private' ? (
              <span className="flex items-center gap-1">
                <EyeOff className="w-3 h-3" />
                Private
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Public
              </span>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-parchment/90 mb-6 leading-relaxed">{dream.content}</p>
      
      <div className="flex flex-wrap gap-3 mb-6">
        {dream.symbols.map((symbol, index) => (
          <motion.span
            key={index}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1 text-sm px-4 py-1 bg-burgundy/20 text-burgundy border border-burgundy/30"
          >
            <Tag className="w-3 h-3" />
            {symbol}
          </motion.span>
        ))}
      </div>

      {dream.visibility === 'public' && (
        <div className="flex gap-6 text-parchment/70 mb-6 ornate-border py-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => onLike?.(dream.id)}
            className={`flex items-center gap-2 hover:text-burgundy transition-colors ${
              dream.liked ? 'text-burgundy' : ''
            }`}
          >
            <Heart className={`w-4 h-4 ${dream.liked ? 'fill-burgundy' : ''}`} />
            {dream.likes || 0}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => onComment?.(dream.id)}
            className="flex items-center gap-2 hover:text-burgundy transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {dream.comments?.length || 0}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => onSave?.(dream.id)}
            className={`flex items-center gap-2 hover:text-burgundy transition-colors ${
              dream.saved ? 'text-burgundy' : ''
            }`}
          >
            <Bookmark className={`w-4 h-4 ${dream.saved ? 'fill-burgundy' : ''}`} />
            {dream.saves || 0}
          </motion.button>
        </div>
      )}
      
      <div className="p-6 bg-mystic-900/50 border border-burgundy/20">
        <p className="text-parchment/80 italic font-cormorant leading-relaxed">
          {dream.interpretation}
        </p>
      </div>
    </motion.div>
  );
};

export default DreamCard;