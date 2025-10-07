import express from 'express';
import { validateBody } from '../api/validate.js';
import { loginRequestSchema, registerRequestSchema, refreshRequestSchema } from '../api/schemas/auth.js';

const router = express.Router();

// Health check (public)
router.get('/health', (_req, res) => {
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
router.get('/test', (_req, res) => {
  res.json({
    success: true,
    message: 'Authentication system is working!',
    timestamp: new Date().toISOString(),
  });
});

// Shadow-mode validated endpoints (handlers not yet implemented in this simple router)
// These show how validation will be attached additively; behavior unchanged unless ENABLE_API_VALIDATION=true
router.post('/login', validateBody(loginRequestSchema), (req, res) => {
  // Placeholder response to avoid breaking existing simple auth router usage
  res.json({ success: true, shadowValidated: Boolean((req as any).validatedBody), note: 'Login handler not implemented in simple router' });
});

router.post('/register', validateBody(registerRequestSchema), (req, res) => {
  res.json({ success: true, shadowValidated: Boolean((req as any).validatedBody), note: 'Register handler not implemented in simple router' });
});

router.post('/refresh', validateBody(refreshRequestSchema), (req, res) => {
  res.json({ success: true, shadowValidated: Boolean((req as any).validatedBody), note: 'Refresh handler not implemented in simple router' });
});

export { router as authRouter };