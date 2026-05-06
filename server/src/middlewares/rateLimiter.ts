import rateLimit from 'express-rate-limit';

const message = {
  success: false,
  message: 'Too many attempts, please try again later.'
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // TESTING: 1000. PROD: set back to 10
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    // If user is directly navigating (e.g. Google OAuth login), redirect them to frontend with error
    if (req.path.includes('/google') || req.path.includes('/discord') || req.accepts('html')) {
      const clientUrl = process.env.CLIENT_URL || 'https://smartcaf.tech';
      return res.redirect(`${clientUrl}/login?error=Too many login attempts. Please try again later.`);
    }
    // Otherwise return JSON for API calls
    res.status(429).json(message);
  }
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // TESTING: 1000. PROD: set back to 20
  message,
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // TESTING: 1000. PROD: set back to 100
  message,
  standardHeaders: true,
  legacyHeaders: false,
});
