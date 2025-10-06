import express from 'express';

const router = express.Router();

// Health check (public)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      service: 'authentication',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      endpoints: {
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        register: '/api/auth/register',
        refresh: '/api/auth/refresh',
        status: '/api/auth/status',
        profile: '/api/auth/me',
      },
      features: {
        jwt: true,
        refreshTokens: true,
        tokenBlacklist: true,
        mfa: false,
      },
    },
  });
});

// Simple test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication system is working!',
    timestamp: new Date().toISOString(),
  });
});

export { router as authRouter };