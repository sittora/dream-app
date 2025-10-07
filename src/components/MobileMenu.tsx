import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn, UserPlus, LogOut } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { navItems } from '../config/navigation';
import { useAuth } from '../hooks/useAuth';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-burgundy/20 rounded-lg transition-colors"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-mystic-900/95 backdrop-blur-lg border-t border-burgundy/20"
          >
            <nav className="container mx-auto py-4 px-6">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${
                    location.pathname === path
                      ? 'bg-burgundy/20 text-burgundy'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
              
              {/* Authentication Section */}
              {!isLoading && (
                <>
                  <div className="border-t border-burgundy/20 my-4"></div>
                  {user ? (
                    /* Logged in state */
                    <>
                      {/* Profile link removed to avoid duplicate account buttons; use the navbar account link instead */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 py-3 px-4 rounded-lg transition-colors text-gray-400 hover:text-red-400 w-full text-left"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </>
                  ) : (
                    /* Logged out state */
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${
                          location.pathname === '/login'
                            ? 'bg-burgundy/20 text-burgundy'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <LogIn className="w-5 h-5" />
                        <span className="font-medium">Login</span>
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${
                          location.pathname === '/register'
                            ? 'bg-burgundy/20 text-burgundy'
                            : 'bg-burgundy/10 text-burgundy hover:bg-burgundy/20'
                        }`}
                      >
                        <UserPlus className="w-5 h-5" />
                        <span className="font-medium">Sign Up</span>
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileMenu;