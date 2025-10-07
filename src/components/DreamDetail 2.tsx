import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Share2, Calendar, Hash, Eye, Clock } from 'lucide-react';
import React from 'react';

import type { Dream } from '../types';

interface DreamDetailProps {
  dream: Dream | null;
  onClose: () => void;
  onLike: (dreamId: number) => void;
  onComment: (dreamId: number) => void;
  onShare: (dreamId: number) => void;
  onSymbolClick?: (symbol: string) => void;
}

const DreamDetail = ({ dream, onClose, onLike, onComment, onShare, onSymbolClick }: DreamDetailProps) => {
  if (!dream) return null;

  const handleSymbolClick = (symbol: string) => {
    if (onSymbolClick) {
      onSymbolClick(symbol);
      onClose(); // Close modal and navigate to symbol search
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-start p-6 border-b border-slate-700/50">
            <div className="flex-1">
              <h2 className="font-cinzel text-3xl text-slate-100 mb-2">{dream.title}</h2>
              <div className="flex items-center gap-4 text-slate-400 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(dream.date), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(dream.createdAt), 'h:mm a')}</span>
                </div>
                {dream.visibility === 'public' && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>Public</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Dream Content */}
            <div>
              <h3 className="font-cinzel text-xl text-slate-100 mb-3">Dream Description</h3>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{dream.content}</p>
              </div>
            </div>

            {/* Mood */}
            {dream.mood && (
              <div>
                <h3 className="font-cinzel text-xl text-slate-100 mb-3">Mood</h3>
                <div className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-emerald-500/20 rounded-lg border border-purple-500/30 inline-block">
                  <span className="text-purple-300 font-medium">{dream.mood}</span>
                </div>
              </div>
            )}

            {/* Symbols */}
            {dream.symbols.length > 0 && (
              <div>
                <h3 className="font-cinzel text-xl text-slate-100 mb-3 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-purple-400" />
                  Symbols
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dream.symbols.map((symbol, index) => (
                    <button
                      key={index}
                      onClick={() => handleSymbolClick(symbol)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 text-sm rounded-lg border border-purple-500/30 hover:from-purple-500/30 hover:to-purple-600/30 hover:border-purple-400/50 transition-all duration-200 hover:scale-105"
                    >
                      #{symbol}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Interpretation */}
            {dream.interpretation && (
              <div>
                <h3 className="font-cinzel text-xl text-slate-100 mb-3">Interpretation</h3>
                <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-lg p-4 border border-emerald-500/20">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{dream.interpretation}</p>
                </div>
              </div>
            )}

            {/* Engagement Stats */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-700/50">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => onLike(dream.id)}
                  className={`flex items-center gap-2 transition-all duration-200 ${
                    dream.liked 
                      ? 'text-red-400 hover:text-red-300' 
                      : 'text-slate-400 hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${dream.liked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{dream.likes} likes</span>
                </button>

                <button
                  onClick={() => onComment(dream.id)}
                  className="flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">{dream.comments.length} comments</span>
                </button>

                <button
                  onClick={() => onShare(dream.id)}
                  className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">{dream.shares} shares</span>
                </button>
              </div>

              <div className="text-slate-400 text-sm">
                <span>{dream.views} views</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DreamDetail; 