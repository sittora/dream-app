import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../../../contexts/AuthContext';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

export function ForgotPasswordForm({ onSuccess }) {
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setIsLoading(true);
      
      const validatedData = forgotPasswordSchema.parse({ email });
      await sendPasswordResetEmail(validatedData.email);
      setIsEmailSent(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 mx-auto bg-green-900/20 rounded-full flex items-center justify-center">
          <Send className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-xl font-semibold">Check your email</h2>
        <p className="text-gray-400">
          We've sent password reset instructions to {email}
        </p>
        <div className="pt-4">
          <Link
            to="/login"
            className="text-burgundy hover:text-burgundy/80 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">Forgot your password?</h2>
        <p className="text-gray-400">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
            autoComplete="email"
            aria-describedby="email-error"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Reset Instructions
            </>
          )}
        </button>

        <p className="text-center text-gray-400">
          Remember your password?{' '}
          <Link
            to="/login"
            className="text-burgundy hover:text-burgundy/80 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
