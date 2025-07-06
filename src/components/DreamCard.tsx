import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Eye, Calendar } from 'lucide-react';
import type { Dream } from '../types';

interface DreamCardProps {
  dream: Dream;
  onLike: (dreamId: number) => void;
  onComment: (dreamId: number) => void;
  onShare: (dreamId: number) => void;
  onView: (dreamId: number) => void;
}

const DreamCard = ({ dream, onLike, onComment, onShare, onView }: DreamCardProps) => {
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

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-mystic-800 rounded-lg p-6 border border-burgundy/20 hover:border-burgundy/40 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-cinzel text-xl text-burgundy mb-2">{dream.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{new Date(dream.date).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dream.visibility === 'public' && (
            <Eye className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      <p className="text-gray-300 mb-4 line-clamp-3">{dream.content}</p>

      {dream.symbols.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {dream.symbols.slice(0, 3).map((symbol, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-burgundy/20 text-burgundy text-xs rounded-full"
              >
                {symbol}
              </span>
            ))}
            {dream.symbols.length > 3 && (
              <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">
                +{dream.symbols.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-sm transition-colors ${
              dream.liked ? 'text-burgundy' : 'text-gray-400 hover:text-burgundy'
            }`}
          >
            <Heart className={`w-4 h-4 ${dream.liked ? 'fill-current' : ''}`} />
            <span>{dream.likes}</span>
          </button>

          <button
            onClick={handleComment}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-burgundy transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{dream.comments.length}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-burgundy transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>{dream.shares}</span>
          </button>
        </div>

        <button
          onClick={handleView}
          className="text-sm text-burgundy hover:text-burgundy/80 transition-colors"
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
};

export default DreamCard;