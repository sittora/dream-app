import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
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
          <h2 className="text-4xl font-cinzel text-dream-gold mb-2">Welcome Back</h2>
          <p className="text-dream-silver font-cormorant">Enter your dreamscape</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-midnight/50 p-8 rounded-lg backdrop-blur-sm">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
              {error}
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

          <div>
            <label htmlFor="password" className="block text-dream-silver mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded bg-midnight border border-dream-gold/30 text-dream-silver focus:border-dream-gold focus:ring-1 focus:ring-dream-gold"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dream-silver/50 hover:text-dream-silver"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link
              to="/forgot-password"
              className="text-dream-silver hover:text-dream-gold transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-dream-gold text-midnight font-medium rounded hover:bg-dream-gold/90 focus:outline-none focus:ring-2 focus:ring-dream-gold focus:ring-opacity-50 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="mt-6 text-center text-dream-silver">
            Don't have an account?{' '}
            <Link to="/register" className="text-dream-gold hover:text-dream-gold/80 transition-colors">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
