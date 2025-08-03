import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Eye, Calendar, Hash } from 'lucide-react';
import type { Dream } from '../types';

interface DreamCardProps {
  dream: Dream;
  onLike: (dreamId: number) => void;
  onComment: (dreamId: number) => void;
  onShare: (dreamId: number) => void;
  onView: (dreamId: number) => void;
  onSymbolClick?: (symbol: string) => void;
}

const DreamCard = ({ dream, onLike, onComment, onShare, onView, onSymbolClick }: DreamCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleLike = () => {
    onLike(dream.id);
  };

  const handleComment = () => {
    onComment(dream.id);
  };

  const handleShare = () => {
    onShare(dream.id);
  };

  const handleView = () => {
    onView(dream.id);
  };

  const handleSymbolClick = (symbol: string) => {
    if (onSymbolClick) {
      onSymbolClick(symbol);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass-panel p-6 group cursor-pointer"
      onClick={handleView}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-cinzel text-xl text-slate-100 mb-2 group-hover:text-gradient transition-colors">
            {dream.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>{new Date(dream.date).toLocaleDateString()}</span>
            {dream.visibility === 'public' && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span className="text-xs">Public</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Mood indicator */}
        {dream.mood && (
          <div className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-emerald-500/20 rounded-full border border-purple-500/30">
            <span className="text-xs text-purple-300 font-medium">{dream.mood}</span>
          </div>
        )}
      </div>

      <p className="text-slate-300 mb-4 line-clamp-3 leading-relaxed">{dream.content}</p>

      {/* Clickable Symbols */}
      {dream.symbols.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-slate-400 font-medium">Symbols</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {dream.symbols.slice(0, 5).map((symbol, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSymbolClick(symbol);
                }}
                className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 text-xs rounded-full border border-purple-500/30 hover:from-purple-500/30 hover:to-purple-600/30 hover:border-purple-400/50 transition-all duration-200 hover:scale-105"
              >
                #{symbol}
              </button>
            ))}
            {dream.symbols.length > 5 && (
              <span className="px-3 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-full border border-slate-600/50">
                +{dream.symbols.length - 5}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Interpretation preview */}
      {dream.interpretation && (
        <div className="mb-4 p-3 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-lg border border-emerald-500/20">
          <h4 className="text-sm font-medium text-emerald-300 mb-1">Interpretation</h4>
          <p className="text-slate-300 text-sm line-clamp-2">{dream.interpretation}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            className={`flex items-center gap-1 text-sm transition-all duration-200 ${
              dream.liked 
                ? 'text-red-400 hover:text-red-300' 
                : 'text-slate-400 hover:text-red-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${dream.liked ? 'fill-current' : ''}`} />
            <span>{dream.likes}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleComment();
            }}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-purple-400 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{dream.comments.length}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>{dream.shares}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <span>View Details</span>
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: 3 }}
            className="text-purple-400"
          >
            →
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default DreamCard;