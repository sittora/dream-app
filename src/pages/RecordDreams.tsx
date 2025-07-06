import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar as CalendarIcon, Search } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import DreamForm from '../components/DreamForm';
import DreamCard from '../components/DreamCard';
import DreamCalendar from '../components/DreamCalendar';
import BackButton from '../components/BackButton';
import type { Dream } from '../types';

const RecordDreams = () => {
  const [showDreamForm, setShowDreamForm] = useState(false);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDreams = useMemo(() => {
    return dreams.filter(dream => {
      const matchesDate = selectedDate
        ? isSameDay(new Date(dream.date), selectedDate)
        : true;

      const matchesSearch = searchQuery
        ? dream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dream.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dream.symbols.some(symbol => 
            symbol.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : true;

      return matchesDate && matchesSearch;
    });
  }, [dreams, selectedDate, searchQuery]);

  const handleSaveDream = (newDream: Omit<Dream, 'id'>) => {
    setDreams(prev => [...prev, { ...newDream, id: prev.length + 1 }]);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(new Date(date));
  };

  const handleLike = (dreamId: number) => {
    setDreams(prev => prev.map(dream => 
      dream.id === dreamId 
        ? { ...dream, likes: dream.likes + 1, liked: true }
        : dream
    ));
  };

  const handleComment = (dreamId: number) => {
    // Handle comment functionality
    console.log('Comment on dream:', dreamId);
  };

  const handleShare = (dreamId: number) => {
    // Handle share functionality
    console.log('Share dream:', dreamId);
  };

  const handleView = (dreamId: number) => {
    // Handle view functionality
    console.log('View dream:', dreamId);
  };

  return (
    <div className="relative">
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8 mt-12"
      >
        <h1 className="font-cinzel text-3xl text-burgundy">Dream Journal</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`btn-primary flex items-center gap-2 ${
              showCalendar ? 'bg-burgundy' : ''
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Calendar
          </button>
          <button
            onClick={() => setShowDreamForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="dream-card">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dreams by title, content, or symbols..."
                className="input-field pl-10"
              />
            </div>
          </div>

          {selectedDate && (
            <div className="flex items-center justify-between px-4 py-2 bg-burgundy/20 rounded-lg">
              <span className="text-burgundy">
                Dreams from {format(selectedDate, 'MMMM d, yyyy')}
              </span>
              <button
                onClick={() => setSelectedDate(undefined)}
                className="text-burgundy hover:text-burgundy/80 transition-colors"
              >
                Clear filter
              </button>
            </div>
          )}

          {filteredDreams.map((dream) => (
            <DreamCard 
              key={dream.id} 
              dream={dream}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onView={handleView}
            />
          ))}
          
          {filteredDreams.length === 0 && (
            <div className="dream-card text-center py-12">
              <p className="text-gray-400">
                {searchQuery || selectedDate
                  ? 'No dreams found matching your criteria.'
                  : 'Your dream journal is empty. Start recording your dreams to unlock insights.'}
              </p>
            </div>
          )}
        </div>

        {showCalendar && (
          <div className="md:col-span-1">
            <DreamCalendar
              dreams={dreams}
              onDateSelect={handleDateSelect}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDreamForm && (
          <DreamForm
            onClose={() => setShowDreamForm(false)}
            onSave={handleSaveDream}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecordDreams;