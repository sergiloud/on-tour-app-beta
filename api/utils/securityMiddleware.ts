/**
 * Security Middleware Configuration
 * 
 * Implements security best practices for the API:
 * - Helmet.js for security headers
 * - Rate limiting to prevent abuse
 * - CORS configuration
 * - CSRF protection
 * 
 * Usage:
 * - Import and apply in API route handlers
 * - Configure rate limits per endpoint
 * - Customize CORS origins
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';

// Extend Express Request interface for rate limiting and session
declare module 'express' {
  interface Request {
    rateLimit?: {
      limit: number;
      current: number;
      remaining: number;
      resetTime: Date;
    };
    session?: {
      id: string;
      userId?: string;
      [key: string]: any;
    };
  }
}

// ==========================================
// Helmet.js - Security Headers
// ==========================================

/**
 * Helmet configuration for security headers
 * 
 * Sets various HTTP headers to help protect against:
 * - Cross-Site Scripting (XSS)
 * - Clickjacking
 * - MIME type sniffing
 * - And more...
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://firestore.googleapis.com", "https://*.firebaseio.com"],
      frameSrc: ["'self'", "https://www.google.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for some third-party integrations
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny', // Prevent clickjacking
  },
  noSniff: true, // Prevent MIME type sniffing
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  xssFilter: true, // Enable XSS filter
});

// ==========================================
// Rate Limiting
// ==========================================

/**
 * General API rate limiter
 * Applies to all API endpoints
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: req.rateLimit?.resetTime ? 
        Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000) : 
        900, // 15 minutes in seconds
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'You have exceeded the maximum number of login attempts. Please try again in 15 minutes.',
      retryAfter: req.rateLimit?.resetTime ? 
        Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000) : 
        900,
    });
  },
});

/**
 * API write operations rate limiter
 * Prevents spam and abuse of POST/PUT/DELETE endpoints
 */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 write requests per minute
  message: 'Too many write operations, please slow down.',
  skip: (req: Request) => {
    // Skip rate limiting for GET requests
    return req.method === 'GET';
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many write operations',
      message: 'You are performing write operations too quickly. Please slow down.',
      retryAfter: req.rateLimit?.resetTime ? 
        Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000) : 
        60,
    });
  },
});

// ==========================================
// CORS Configuration
// ==========================================

/**
 * CORS configuration
 * Allows cross-origin requests from trusted domains
 */
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:4173', // Vite preview
  'https://on-tour-app.vercel.app', // Production
  'https://on-tour-app-beta.vercel.app', // Beta
  process.env.VITE_APP_URL, // Environment-specific URL
].filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Number', 'X-Page-Size'],
  maxAge: 86400, // 24 hours
});

// ==========================================
// CSRF Protection
// ==========================================

/**
 * Simple CSRF token validation middleware
 * 
 * Usage:
 * 1. Client gets token from GET /api/csrf-token
 * 2. Client includes token in X-CSRF-Token header for mutations
 * 3. Server validates token
 */
export function generateCSRFToken(): string {
  return Array.from({ length: 32 }, () => 
    Math.random().toString(36)[2]
  ).join('');
}

/**
 * CSRF validation middleware
 * Apply to all non-GET requests
 */
export function validateCSRFToken(req: Request, res: Response, next: NextFunction): void {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session?.csrfToken as string;

  if (!token || !sessionToken || token !== sessionToken) {
    res.status(403).json({
      error: 'Invalid CSRF token',
      message: 'CSRF token validation failed. Please refresh the page.',
    });
    return;
  }

  next();
}

// ==========================================
// Request Validation
// ==========================================

/**
 * Validate request body size
 * Prevents large payload attacks
 */
export function validateBodySize(maxSize: number = 1024 * 1024) { // 1MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      res.status(413).json({
        error: 'Payload too large',
        message: `Request body size exceeds maximum allowed size of ${maxSize} bytes.`,
      });
      return;
    }
    
    next();
  };
}

/**
 * Sanitize request parameters
 * Prevents XSS and injection attacks
 */
export function sanitizeRequest(req: Request, res: Response, next: NextFunction): void {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string)
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .trim();
      }
    });
  }

  // Sanitize body parameters
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .trim();
      }
    });
  }

  next();
}

// ==========================================
// Combined Security Middleware
// ==========================================

/**
 * Apply all security middleware in correct order
 */
export function applySecurityMiddleware(app: any): void {
  // 1. Helmet (security headers)
  app.use(helmetMiddleware);
  
  // 2. CORS
  app.use(corsMiddleware);
  
  // 3. General rate limiter
  app.use('/api', generalLimiter);
  
  // 4. Auth-specific rate limiter
  app.use('/api/auth', authLimiter);
  
  // 5. Write operations rate limiter
  app.use('/api', writeLimiter);
  
  // 6. Body size validation
  app.use('/api', validateBodySize());
  
  // 7. Request sanitization
  app.use('/api', sanitizeRequest);
  
  // 8. CSRF token endpoint
  app.get('/api/csrf-token', (req: Request, res: Response) => {
    const token = generateCSRFToken();
    if (req.session) {
      req.session.csrfToken = token;
    }
    res.json({ csrfToken: token });
  });
  
  // 9. CSRF validation for mutations
  app.use('/api', validateCSRFToken);
}

export default {
  helmet: helmetMiddleware,
  cors: corsMiddleware,
  generalLimiter,
  authLimiter,
  writeLimiter,
  validateCSRFToken,
  generateCSRFToken,
  validateBodySize,
  sanitizeRequest,
  applySecurityMiddleware,
};
