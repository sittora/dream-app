import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SignInForm from '../../components/auth/SignInForm/SignInForm';

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

const SignInPage = () => {
  const location = useLocation();
  const message = location.state?.message;

  return (
    <motion.div
      className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-cinzel text-gray-100 mb-8">
          Welcome Back
        </h1>
        {message && (
          <div className="mb-4 p-4 bg-purple-900/30 rounded-md">
            <p className="text-center text-sm text-gray-300">{message}</p>
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800/50 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 backdrop-blur-sm">
          <SignInForm />
        </div>
      </div>
    </motion.div>
  );
};

export default SignInPage;
