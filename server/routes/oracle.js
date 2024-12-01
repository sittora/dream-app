const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// Create a limiter that allows 10 requests per hour per IP
const oracleLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Rate limit exceeded. Please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiter to all routes in this router
router.use(oracleLimiter);

// Oracle endpoint
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // In production, this would call an AI model API
    // For now, we'll return a simple response
    const responses = [
      'Your dream reveals deep archetypal patterns. The symbols suggest a transformation in your unconscious mind.',
      'I sense a strong connection to the collective unconscious in your dream. The imagery speaks to universal human experiences.',
      'The elements in your dream point to a process of individuation, as described by Jung. You are on a journey of self-discovery.',
      'Your dream contains powerful symbolic content. The unconscious is communicating important messages about your psychological development.',
    ];

    const response = {
      message: responses[Math.floor(Math.random() * responses.length)],
    };

    res.json(response);
  } catch (error) {
    console.error('Oracle API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
