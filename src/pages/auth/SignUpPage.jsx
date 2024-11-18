import React from 'react';
import { motion } from 'framer-motion';
import SignUpForm from '../../components/auth/SignUpForm/SignUpForm';

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

const SignUpPage = () => {
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
          Create Your Account
        </h1>
        <p className="text-center text-gray-400 text-sm">
          Join our community of dream explorers and begin your journey of self-discovery.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800/50 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 backdrop-blur-sm">
          <SignUpForm />
        </div>
      </div>
    </motion.div>
  );
};

export default SignUpPage;
