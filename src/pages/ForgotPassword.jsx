import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { requestPasswordReset, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      await requestPasswordReset(email);
      setMessage('Password reset instructions have been sent to your email.');
    } catch (error) {
      console.error('Password reset request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-midnight to-purple-900"
    >
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-cinzel text-dream-gold mb-2">Reset Password</h2>
          <p className="text-dream-silver font-cormorant">We'll help you recover your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-midnight/50 p-8 rounded-lg backdrop-blur-sm">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-2 rounded">
              {message}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-dream-silver mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-midnight border border-dream-gold/30 text-dream-silver focus:border-dream-gold focus:ring-1 focus:ring-dream-gold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-dream-gold text-midnight font-medium rounded hover:bg-dream-gold/90 focus:outline-none focus:ring-2 focus:ring-dream-gold focus:ring-opacity-50 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Sending instructions...' : 'Send reset instructions'}
          </button>

          <div className="mt-6 text-center text-dream-silver">
            Remember your password?{' '}
            <Link to="/login" className="text-dream-gold hover:text-dream-gold/80 transition-colors">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
