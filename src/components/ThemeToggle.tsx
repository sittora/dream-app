import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg transition-colors hover:bg-burgundy/20"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-burgundy" />
      ) : (
        <Moon className="w-5 h-5 text-burgundy" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;