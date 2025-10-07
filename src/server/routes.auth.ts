import express from 'express';

import { handleLogin, handleRefreshToken } from './auth/login.js';
import { handleLogout, handleLogoutAll } from './auth/logout.js';
import { authenticateToken, optionalAuth, getCurrentUser } from './auth/middleware.js';
import { handleRegister } from './auth/register.js';
import { getAuthStatus, getAuthHealth } from './auth/status.js';
import { handleEmailVerification } from './auth/verify.js';

const router = express.Router();

// Health check (public)
router.get('/health', getAuthHealth);

// Authentication status (works with or without token)
router.get('/status', optionalAuth, getAuthStatus);

// Mount authentication routes (existing)
router.post('/register', handleRegister);
router.post('/verify', handleEmailVerification);

// Mount new login/logout routes (additive - no changes to existing functionality)
router.post('/login', handleLogin);
router.post('/logout', handleLogout);
router.post('/logout-all', authenticateToken, handleLogoutAll);
router.post('/refresh', handleRefreshToken);

// User profile routes
router.get('/me', authenticateToken, getCurrentUser);

export { router as authRouter };