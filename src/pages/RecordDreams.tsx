import { isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar as CalendarIcon, Search, Plus, Hash } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import BackButton from '../components/BackButton';
import DreamCalendar from '../components/DreamCalendar';
import DreamCard from '../components/DreamCard';
import DreamDetail from '../components/DreamDetail';
import DreamForm from '../components/DreamForm';
// import { dreamService } from '../services/dreamService';
import { useAuth } from '../hooks/useAuth';
import type { Dream } from '../types';

const RecordDreams = () => {
  const { user } = useAuth();
  const [showDreamForm, setShowDreamForm] = useState(false);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [symbolFilter, setSymbolFilter] = useState<string>('');
  const [isLoading, _setIsLoading] = useState(false); // _setIsLoading unused currently (placeholder for future async ops)

  // Temporarily disable database loading
  // Dev note: console kept intentionally for UX telemetry during feature buildout.
  console.log('RecordDreams component loaded');

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

      const matchesSymbol = symbolFilter
        ? dream.symbols.some(symbol => 
            symbol.toLowerCase().includes(symbolFilter.toLowerCase())
          )
        : true;

      return matchesDate && matchesSearch && matchesSymbol;
    });
  }, [dreams, selectedDate, searchQuery, symbolFilter]);

  const handleSaveDream = async (newDream: Omit<Dream, 'id'>) => {
    // Allow guest saves (useful for quick journaling without auth)
    const authorId = user?.id ?? 'guest';
    const authorUsername = user?.username ?? 'Guest';

    try {
      // Persist the new dream to local state so it appears immediately in the journal.
      // We assign a numeric id locally (Date.now()) and fill in author fields from the authenticated user.
      const nowIso = new Date().toISOString();
      const localDream: Dream = {
        ...newDream,
        id: Date.now(),
        authorId,
        authorUsername,
        authorAvatar: (user && (user.profileImage || undefined)) || undefined,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as Dream;

  // Prepend so latest appears first
  // eslint-disable-next-line no-console -- intentional dev telemetry (dream creation)
  console.log('RecordDreams: received new dream from form', localDream);
  setDreams(prev => [localDream, ...prev]);
  setShowDreamForm(false);

      // Persist to backend with client-side retry queue
  // eslint-disable-next-line no-console -- intentional dev telemetry (enqueue persistence)
  console.log('RecordDreams: enqueueing for persistence', localDream);
  enqueuePendingLocal(localDream);
    } catch (error) {
      console.error('Failed to save dream:', error);
    }
  };

  // Client-side pending queue (localStorage) for unreliable network / auth
  const PENDING_KEY = 'dream_pending_queue_v1';

  function enqueuePendingLocal(dreamObj: any) {
    try {
      const queue = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
      queue.push({ id: Date.now() + '-' + Math.random().toString(36).slice(2), dream: dreamObj, attempts: 0, createdAt: new Date().toISOString() });
      localStorage.setItem(PENDING_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to enqueue pending dream', e);
    }
  }

  async function flushPendingQueueOnce() {
    try {
      const queue = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
      if (!Array.isArray(queue) || queue.length === 0) return;
      const sidecarOrigin = (import.meta.env.VITE_SIDECAR_ORIGIN as string) || 'http://localhost:5789';
      const accessToken = localStorage.getItem('accessToken');
      const remaining: any[] = [];
      for (const item of queue) {
        try {
          const res = await fetch(sidecarOrigin + '/journal', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(accessToken ? { Authorization: 'Bearer ' + accessToken } : {}),
            },
            body: JSON.stringify(item.dream),
          });
          if (res.ok) {
            // persisted
            continue;
          } else if (res.status === 202) {
            // queued server-side; treat as persisted for client
            continue;
          } else {
            item.attempts = (item.attempts || 0) + 1;
            if (item.attempts < 5) remaining.push(item);
          }
        } catch (e) {
          item.attempts = (item.attempts || 0) + 1;
          if (item.attempts < 5) remaining.push(item);
        }
      }
      localStorage.setItem(PENDING_KEY, JSON.stringify(remaining));
    } catch (e) {
      console.warn('Failed to flush pending queue', e);
    }
  }

  // Periodically try to flush pending queue
  React.useEffect(() => {
    const id = setInterval(() => { flushPendingQueueOnce().catch(()=>{}); }, 8000);
    // Also try on mount
    flushPendingQueueOnce().catch(()=>{});
    return () => clearInterval(id);
  }, []);

  const handleDateSelect = (date: string) => {
    setSelectedDate(new Date(date));
    setShowCalendar(false);
  };

  const handleLike = async (_dreamId: number) => {
    if (!user?.id) return;

    try {
      // Temporarily disable database like functionality
  // eslint-disable-next-line no-console -- intentional placeholder for future like implementation
  console.log('Like functionality temporarily disabled');
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleComment = (_dreamId: number) => {
  // eslint-disable-next-line no-console -- placeholder for upcoming comment feature
  console.log('Comment functionality not implemented yet');
  };

  const handleShare = (_dreamId: number) => {
  // eslint-disable-next-line no-console -- placeholder for upcoming share feature
  console.log('Share functionality not implemented yet');
  };

  const handleView = (dreamId: number) => {
    const dream = dreams.find(d => d.id === dreamId);
    if (dream) {
      setSelectedDream(dream);
    }
  };

  const handleSymbolClick = (symbol: string) => {
    setSymbolFilter(symbol);
  };


  return (
    <div className="min-h-screen bg-mystic-900">
      <div className="container mx-auto px-4 py-8">
        <BackButton to="/" />
        
        <div className="mb-8">
          <h1 className="text-4xl font-cinzel text-burgundy mb-4">Dream Journal</h1>
          <p className="text-slate-300">Record and explore your dreams</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setShowDreamForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Record New Dream
          </button>

          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="btn-secondary flex items-center gap-2"
          >
            <CalendarIcon size={20} />
            Calendar
          </button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search dreams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          {symbolFilter && (
            <button
              onClick={() => setSymbolFilter('')}
              className="btn-secondary flex items-center gap-2"
            >
              <Hash size={20} />
              Clear Symbol Filter
            </button>
          )}
        </div>

        {/* Calendar */}
        <AnimatePresence>
          {showCalendar && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
                             <DreamCalendar
                 dreams={dreams}
                 onDateSelect={handleDateSelect}
               />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dreams Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : filteredDreams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDreams.map((dream) => (
              <DreamCard
                key={dream.id}
                dream={dream}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                onView={handleView}
                onSymbolClick={handleSymbolClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No dreams yet</h3>
            <p className="text-slate-400 mb-4">
              {searchQuery || symbolFilter || selectedDate
                ? 'No dreams match your current filters'
                : 'Start your dream journal by recording your first dream'}
            </p>
            <button
              onClick={() => setShowDreamForm(true)}
              className="btn-primary"
            >
              Record Your First Dream
            </button>
          </div>
        )}

        {/* Dream Form Modal */}
        <AnimatePresence>
          {showDreamForm && (
                         <DreamForm
               onClose={() => setShowDreamForm(false)}
               onSave={handleSaveDream}
             />
          )}
        </AnimatePresence>

        {/* Dream Detail Modal */}
        <AnimatePresence>
          {selectedDream && (
                         <DreamDetail
               dream={selectedDream}
               onClose={() => setSelectedDream(null)}
               onLike={handleLike}
               onComment={handleComment}
               onShare={handleShare}
               onSymbolClick={handleSymbolClick}
             />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RecordDreams;