import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import React from 'react';

import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const next = String(theme) === 'night' ? 'day' : 'night';

  return (
    <motion.button
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(next as any)}
      className="p-2 rounded-lg transition-colors hover:bg-burgundy/20"
    >
      {String(theme) === 'night' ? (
        <Sun className="w-5 h-5 text-burgundy" />
      ) : (
        <Moon className="w-5 h-5 text-burgundy" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;