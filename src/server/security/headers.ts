import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * Security headers and Content Security Policy configuration
 * Implements defense-in-depth with strict security headers
 */

/**
 * Get Content Security Policy configuration
 */
function getCSPConfig() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  return {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        ...(isDevelopment ? ["'unsafe-eval'", "'unsafe-inline'"] : []),
        // Allow scripts from trusted CDNs
        'https://cdn.jsdelivr.net',
        'https://unpkg.com',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for styled-components and CSS-in-JS
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net',
      ],
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com',
        'https://cdn.jsdelivr.net',
        'data:',
      ],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https:',
        // Allow QR code data URLs for 2FA
        'data:image/*',
      ],
      connectSrc: [
        "'self'",
        baseUrl,
        ...(isDevelopment ? ['ws:', 'wss:'] : []),
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      manifestSrc: ["'self'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'", 'blob:'],
    },
  };
}

/**
 * Configure helmet with security best practices
 */
export function configureHelmet() {
  return helmet({
    // Content Security Policy
    contentSecurityPolicy: getCSPConfig(),
    
    // HTTP Strict Transport Security
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    
    // X-Frame-Options
    frameguard: {
      action: 'deny',
    },
    
    // X-Content-Type-Options
    noSniff: true,
    
    // X-XSS-Protection (legacy but still useful)
    xssFilter: true,
    
    // Referrer-Policy
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    
    // X-DNS-Prefetch-Control
    dnsPrefetchControl: {
      allow: false,
    },
    
    // X-Download-Options
    ieNoOpen: true,
    
    // X-Permitted-Cross-Domain-Policies
    permittedCrossDomainPolicies: false,
    
    // Hide X-Powered-By header
    hidePoweredBy: true,
  });
}

/**
 * Additional security headers middleware
 */
export function additionalSecurityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Permissions Policy (Feature Policy successor)
  res.setHeader('Permissions-Policy', [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', '));
  
  // Cross-Origin Embedder Policy
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  
  // Cross-Origin Opener Policy
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  
  // Cross-Origin Resource Policy
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  
  // Expect-CT (Certificate Transparency)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Expect-CT', 'max-age=86400, enforce');
  }
  
  next();
}

/**
 * HTTPS enforcement middleware (for production behind proxy)
 */
export function enforceHTTPS(req: Request, res: Response, next: NextFunction): void {
  // Skip in development
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }
  
  // Check if request is secure (accounting for proxy forwarding)
  const isSecure = req.secure || 
                   req.headers['x-forwarded-proto'] === 'https' ||
                   req.headers['x-forwarded-ssl'] === 'on';
  
  if (!isSecure) {
    const httpsUrl = `https://${req.get('host')}${req.originalUrl}`;
    return res.redirect(301, httpsUrl);
  }
  
  next();
}

/**
 * CORS configuration with strict allowlist
 */
export function configureCORS() {
  const allowedOrigins = [
    process.env.BASE_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:5173', // Vite dev server
  ].filter(Boolean);
  
  return {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-CSRF-Token',
    ],
    exposedHeaders: ['X-CSRF-Token'],
    optionsSuccessStatus: 200,
  };
}