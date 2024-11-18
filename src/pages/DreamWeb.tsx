import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, Share2, Crown, Eye, Star, Sparkles, Search } from 'lucide-react';
import type { Dream, User, Comment } from '../types';
import Messaging from '../components/Messaging';
import BackButton from '../components/BackButton';
import SearchBar from '../components/SearchBar';

const DreamWeb = () => {
  const [publicDreams, setPublicDreams] = useState<Dream[]>([]);
  const [filteredDreams, setFilteredDreams] = useState<Dream[]>([]);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'dreams' | 'users'>('dreams');

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDreams(publicDreams);
      return;
    }

    if (searchQuery.startsWith('@')) {
      setSearchType('users');
      const username = searchQuery.slice(1).toLowerCase();
      const results = publicDreams.filter(dream => 
        dream.authorId?.toLowerCase().includes(username)
      );
      setFilteredDreams(results);
    } else {
      setSearchType('dreams');
      const query = searchQuery.toLowerCase();
      const results = publicDreams.filter(dream => {
        const searchableText = `${dream.title} ${dream.content} ${dream.symbols.join(' ')}`.toLowerCase();
        return searchableText.includes(query);
      });
      setFilteredDreams(results);
    }
  }, [searchQuery, publicDreams]);

  const handleUserSelect = (username: string) => {
    setSearchQuery(username);
  };

  // Rest of the component remains the same...

  return (
    <div className="relative">
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 mt-12"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-cinzel text-3xl text-burgundy">Dream Web</h1>
            <p className="text-gray-400 mt-2">Share and interpret dreams with fellow dreamers</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMessaging(true)}
              className="btn-primary"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Messages
            </button>
          </div>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onUserSelect={handleUserSelect}
          placeholder="Search dreams or @username..."
        />

        {/* Rest of the component remains the same... */}
      </motion.div>
    </div>
  );
};

export default DreamWeb;