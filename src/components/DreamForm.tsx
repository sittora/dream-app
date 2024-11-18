import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Loader, Eye, EyeOff } from 'lucide-react';
import { analyzeDream } from '../services/dreamAnalysis';
import type { Dream } from '../types';

interface DreamFormProps {
  onClose: () => void;
  onSave: (dream: Omit<Dream, 'id'>) => void;
}

const DreamForm = ({ onClose, onSave }: DreamFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: '',
    symbols: '',
    visibility: 'private' as const,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    const dreamData = {
      ...formData,
      date: new Date().toISOString().split('T')[0],
      symbols: formData.symbols.split(',').map(s => s.trim()),
      likes: 0,
      saves: 0,
      comments: [],
    };

    try {
      const analysis = await analyzeDream(dreamData as Dream);
      
      onSave({
        ...dreamData,
        interpretation: analysis.interpretation,
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to analyze dream:', error);
      setError('Failed to analyze dream. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <div className="bg-mystic-900 rounded-lg p-6 w-full max-w-2xl border border-burgundy/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-cinzel text-2xl text-burgundy">Record New Dream</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-burgundy/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Dream Title</label>
            <input
              type="text"
              className="input-field"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Dream Description</label>
            <textarea
              className="input-field min-h-[150px]"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mood</label>
            <input
              type="text"
              className="input-field"
              value={formData.mood}
              onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
              placeholder="e.g., mysterious, anxious, peaceful"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Symbols (comma-separated)</label>
            <input
              type="text"
              className="input-field"
              value={formData.symbols}
              onChange={(e) => setFormData({ ...formData, symbols: e.target.value })}
              placeholder="e.g., water, snake, moon"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                visibility: prev.visibility === 'public' ? 'private' : 'public'
              }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                formData.visibility === 'public'
                  ? 'bg-burgundy/20 text-burgundy'
                  : 'bg-mystic-900/50 text-gray-400'
              }`}
            >
              {formData.visibility === 'public' ? (
                <>
                  <Eye className="w-4 h-4" />
                  Public Dream
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  Private Dream
                </>
              )}
            </button>
            {formData.visibility === 'public' && (
              <span className="text-sm text-gray-400">
                This dream will be visible on Dream Web
              </span>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="btn-primary flex items-center gap-2"
            >
              {isAnalyzing ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isAnalyzing ? 'Analyzing Dream...' : 'Save Dream'}
            </button>
          </div>
          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
        </form>
      </div>
    </motion.div>
  );
};

export default DreamForm;