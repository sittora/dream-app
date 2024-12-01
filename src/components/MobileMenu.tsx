import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu as MenuIcon, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { routes } from '../config/routes';
import { useAuth } from '../contexts/AuthContext';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-burgundy/20 rounded-lg transition-colors"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MenuIcon className="w-6 h-6" />
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
              {!isAuthenticated && (
                <div className="flex gap-2 mb-4">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2 text-center text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2 text-center bg-burgundy/90 hover:bg-burgundy text-white rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {routes.protected.map(({ path, name, icon: Icon, children }) => {
                if (!isAuthenticated && path !== '/resources') {
                  return null;
                }

                return (
                  <React.Fragment key={path}>
                    <Link
                      to={path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${
                        location.pathname === path
                          ? 'bg-burgundy/20 text-burgundy'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{name}</span>
                    </Link>

                    {children?.map(child => (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 py-3 pl-12 pr-4 rounded-lg transition-colors ${
                          location.pathname === child.path
                            ? 'bg-burgundy/20 text-burgundy'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <child.icon className="w-5 h-5" />
                        <span className="font-medium">{child.name}</span>
                      </Link>
                    ))}
                  </React.Fragment>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileMenu;