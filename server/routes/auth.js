const express = require('express');
const router = express.Router();
const AuthService = require('../auth');
const User = require('../models/user');
const { authLimiter } = require('../middleware/auth');
const passport = require('passport');

const authService = new AuthService(User);

// Apply rate limiting to all auth routes
router.use(authLimiter);

// Register
router.post('/register', async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const result = await authService.resetPasswordRequest(req.body.email);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = authService.generateToken(req.user);
    res.redirect(`/auth-callback?token=${token}`);
  }
);

// Facebook OAuth
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    const token = authService.generateToken(req.user);
    res.redirect(`/auth-callback?token=${token}`);
  }
);

// Twitter OAuth
router.get('/twitter',
  passport.authenticate('twitter')
);

router.get('/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  (req, res) => {
    const token = authService.generateToken(req.user);
    res.redirect(`/auth-callback?token=${token}`);
  }
);

// Verify token
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = authService.verifyToken(token);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({ valid: true, user });
  } catch (error) {
    res.status(401).json({ valid: false, message: error.message });
  }
});

module.exports = router;
