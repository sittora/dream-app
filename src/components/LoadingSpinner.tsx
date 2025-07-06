import React from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner = ({ message = 'Loading...', size = 'md' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} text-burgundy`}
      >
        <Loader className="w-full h-full" />
      </motion.div>
      <p className="text-gray-400 mt-4 font-cinzel">{message}</p>
    </div>
  );
};

export default LoadingSpinner; 