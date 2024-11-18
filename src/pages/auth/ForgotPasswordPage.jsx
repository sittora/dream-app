import React from 'react';
import { motion } from 'framer-motion';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm/ForgotPasswordForm';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

const ForgotPasswordPage = () => {
  return (
    <motion.div
      className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-cinzel text-gray-100 mb-4">
          Forgot Your Password?
        </h1>
        <p className="text-center text-gray-400 text-sm">
          Don't worry, we'll help you get back to exploring your dreams.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800/50 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 backdrop-blur-sm">
          <ForgotPasswordForm />
        </div>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordPage;
