import { motion } from 'framer-motion';
import { Moon, UserPlus, LogOut, User } from 'lucide-react';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { navItems } from '../config';
import { useAuth } from '../hooks/useAuth';

import MobileMenu from './MobileMenu';
import ThemeToggle from './ThemeToggle';

// Combined Login / Sign Up button that reveals a small dropdown
const AuthCombo: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <UserPlus className="w-4 h-4" />
        <span className="hidden sm:inline text-sm font-medium leading-5 text-shimmer">Get Started</span>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="absolute right-0 mt-2 w-40 bg-mystic-900/90 border border-burgundy/20 rounded-lg shadow-lg py-2"
        >
          <motion.div whileHover={{ x: 6, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/login"
              className="block px-4 py-2 text-sm text-gray-200 hover:bg-mystic-900/60 transition-colors duration-150"
            >
              Login
            </Link>
          </motion.div>

          <motion.div whileHover={{ x: 6, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/register"
              className="block px-4 py-2 text-sm text-burgundy hover:bg-mystic-900/60 transition-colors duration-150"
            >
              Sign Up
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <motion.nav 
      className="bg-mystic-900/50 backdrop-blur-sm border-b border-burgundy/20"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div 
        className="container mx-auto px-4"
        animate={{
          boxShadow: [
            "0 0 0 rgba(185, 28, 28, 0)",
            "0 0 20px rgba(185, 28, 28, 0.1)",
            "0 0 0 rgba(185, 28, 28, 0)"
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              className="relative logo-wrapper"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              whileHover={{ 
                rotate: [0, -10, 10, -5, 0],
                scale: 1.15,
                transition: { 
                  duration: 0.6,
                  ease: "easeInOut"
                }
              }}
              whileTap={{ scale: 0.9, rotate: 180 }}
            >
              {/* Mystical glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full blur-sm opacity-0 group-hover:opacity-50"
                animate={{
                  background: [
                    "radial-gradient(circle, rgba(185, 28, 28, 0.3) 0%, transparent 70%)",
                    "radial-gradient(circle, rgba(139, 69, 19, 0.3) 0%, transparent 70%)",
                    "radial-gradient(circle, rgba(185, 28, 28, 0.3) 0%, transparent 70%)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Sparkles */}
              <span className="logo-sparkle" style={{ left: '-6px', top: '2px', animationDelay: '0s' }} />
              <span className="logo-sparkle" style={{ left: '14px', top: '-6px', animationDelay: '0.3s' }} />
              <span className="logo-sparkle" style={{ left: '26px', top: '8px', animationDelay: '0.6s' }} />
              <span className="logo-ring" aria-hidden="true" />
              <Moon className="logo-moon w-6 h-6 text-burgundy relative z-10" />
            </motion.div>
            
            <div className="title-font text-xl hidden sm:inline relative">
              {/* Stable title: kept visually distinctive but without per-letter animation */}
              <span
                className="inline-block"
                style={{
                  background: 'linear-gradient(45deg, #b91c1c, #8b4513)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  fontWeight: 600,
                  letterSpacing: '0.6px'
                }}
              >
                Anima Insights
              </span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            {navItems.map(({ path, label, icon: Icon }, index) => (
              <motion.div
                key={path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === path
                      ? 'bg-burgundy/20 text-burgundy'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium leading-5">{label}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Authentication Buttons */}
            {!isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                {user ? (
                  /* Logged in state */
                  <div className="flex items-center gap-3">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/account"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm font-medium leading-5">{user.username || user.email}</span>
                      </Link>
                    </motion.div>
                    <motion.button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm font-medium leading-5">Logout</span>
                    </motion.button>
                  </div>
                ) : (
                  /* Logged out state */
                  <AuthCombo />
                )}
              </motion.div>
            )}
            <ThemeToggle />
            <MobileMenu />
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;