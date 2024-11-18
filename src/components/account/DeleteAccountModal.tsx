import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, AlertCircle } from 'lucide-react';
import logger from '../logger'; // assuming logger is defined in a separate file

interface DeleteAccountModalProps {
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const DeleteAccountModal = ({ onClose, onConfirm }: DeleteAccountModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (confirmation !== 'DELETE') return;
    
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      setError('Failed to delete account. Please try again later.');
      logger.error('Failed to delete account:', { error });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-mystic-900 rounded-lg p-6 w-full max-w-md border border-burgundy/30"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="font-cinzel text-xl">Delete Account</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-burgundy/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          <p className="text-gray-300">
            This action cannot be undone. All your data, including dreams, interpretations, and preferences will be permanently deleted.
          </p>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">
              Type DELETE to confirm
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="input-field"
              placeholder="DELETE"
            />
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
              type="button"
              onClick={handleConfirm}
              disabled={confirmation !== 'DELETE' || isLoading}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
              ) : (
                'Delete Account'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DeleteAccountModal;