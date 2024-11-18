import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DataManagementProps {
  onAccountDeleted: () => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ onAccountDeleted }) => {
  const { user, deleteAccount } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [error, setError] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    setError('');

    try {
      // TODO: Implement data export
      const userData = {
        profile: user?.profile,
        preferences: user?.preferences,
        dreams: [], // Fetch from your dreams database
        analyses: [], // Fetch from your analyses database
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dream-insights-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export data. Please try again later.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.email || confirmEmail !== user.email) {
      setError('Please enter your email correctly to confirm deletion');
      return;
    }

    setIsDeletingAccount(true);
    setError('');

    try {
      await deleteAccount();
      onAccountDeleted();
    } catch (err) {
      setError('Failed to delete account. Please try again later.');
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-500/10 text-red-500 rounded-lg">
          {error}
        </div>
      )}

      <div className="dream-card space-y-6">
        <h2 className="font-cinzel text-xl flex items-center gap-2">
          <Download className="w-5 h-5 text-burgundy" />
          Export Your Data
        </h2>
        
        <p className="text-gray-600">
          Download a copy of all your data, including your profile, preferences, dreams, and analyses.
          The data will be exported in JSON format.
        </p>

        <button
          onClick={handleExportData}
          disabled={isExporting}
          className="btn-secondary"
        >
          {isExporting ? (
            <div className="w-5 h-5 border-2 border-burgundy/30 border-t-burgundy rounded-full animate-spin" />
          ) : (
            'Export Data'
          )}
        </button>
      </div>

      <div className="dream-card space-y-6">
        <h2 className="font-cinzel text-xl flex items-center gap-2 text-red-500">
          <AlertTriangle className="w-5 h-5" />
          Delete Account
        </h2>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            This action cannot be undone. All your data will be permanently deleted.
            Please export your data before proceeding if you'd like to keep a copy.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger"
            >
              I want to delete my account
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <p className="font-medium text-red-500">
                Please enter your email ({user?.email}) to confirm deletion
              </p>
              
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
              />

              <div className="flex gap-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="btn-danger"
                >
                  {isDeletingAccount ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Permanently Delete Account'
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setConfirmEmail('');
                  }}
                  className="btn-secondary"
                  disabled={isDeletingAccount}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
