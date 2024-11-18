import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onUserSelect?: (username: string) => void;
  placeholder?: string;
}

interface UserSuggestion {
  id: string;
  username: string;
  insightRank: string;
}

const SearchBar = ({ value, onChange, onUserSelect, placeholder }: SearchBarProps) => {
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock user data - replace with API call in production
  const mockUsers: UserSuggestion[] = [
    { id: '1', username: 'dreamweaver', insightRank: 'Mystic Interpreter' },
    { id: '2', username: 'shadowwalker', insightRank: 'Dream Guide' },
    { id: '3', username: 'luciddreamer', insightRank: 'Novice Explorer' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowUserSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value.startsWith('@')) {
      const query = value.slice(1).toLowerCase();
      const filtered = mockUsers.filter(user => 
        user.username.toLowerCase().includes(query)
      );
      setUserSuggestions(filtered);
      setShowUserSearch(true);
    } else {
      setShowUserSearch(false);
    }
  }, [value]);

  const handleUserClick = (username: string) => {
    onUserSelect?.(`@${username}`);
    setShowUserSearch(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search dreams or users with @..."}
        className="w-full pl-12 pr-10 py-3 bg-mystic-900/50 border border-burgundy/30 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-burgundy/60 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <AnimatePresence>
        {showUserSearch && userSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-mystic-900 border border-burgundy/30 rounded-lg shadow-xl overflow-hidden"
          >
            {userSuggestions.map(user => (
              <button
                key={user.id}
                onClick={() => handleUserClick(user.username)}
                className="w-full flex items-center gap-3 p-3 hover:bg-burgundy/20 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-burgundy/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-burgundy" />
                </div>
                <div>
                  <div className="text-gray-200">@{user.username}</div>
                  <div className="text-sm text-gray-400">{user.insightRank}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;