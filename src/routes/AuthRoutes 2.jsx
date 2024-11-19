import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import SignInPage from '../pages/auth/SignInPage';
import SignUpPage from '../pages/auth/SignUpPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import { useAuth } from '../contexts/AuthContext';

const AuthRoutes = () => {
  const { user } = useAuth();

  // Redirect to dashboard if user is already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AuthRoutes;
