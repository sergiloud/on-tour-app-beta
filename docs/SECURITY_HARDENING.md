# Security Implementation Guide

## Overview

This document describes the security hardening measures implemented in On Tour App 2.0.

## Security Layers

### 1. Helmet.js - HTTP Security Headers

**Implementation:** `api/utils/securityMiddleware.ts`

Helmet.js sets various HTTP headers to protect against common web vulnerabilities:

- **Content Security Policy (CSP)**: Prevents XSS attacks by restricting resource origins
- **HSTS**: Forces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Referrer-Policy**: Controls referrer information
- **XSS Filter**: Enables browser XSS protection

**Configuration:**
```typescript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
    // ... other directives
  }
}
```

### 2. Rate Limiting

**Implementation:** `api/utils/securityMiddleware.ts`

Three rate limiters protect different endpoint types:

#### General API Limiter
- **Window:** 15 minutes
- **Max Requests:** 100 per IP
- **Applies To:** All `/api/*` endpoints

#### Authentication Limiter
- **Window:** 15 minutes
- **Max Requests:** 5 per IP
- **Applies To:** `/api/auth/*` endpoints
- **Special:** Skips successful requests (only counts failures)

**Purpose:** Prevents brute force attacks on login/signup

#### Write Operations Limiter
- **Window:** 1 minute
- **Max Requests:** 30 per IP
- **Applies To:** POST/PUT/DELETE/PATCH requests
- **Skips:** GET requests

**Purpose:** Prevents spam and abuse

**Response Format:**
```json
{
  "error": "Too many requests",
  "message": "You have exceeded the rate limit...",
  "retryAfter": 900
}
```

### 3. CORS Protection

**Implementation:** `api/utils/securityMiddleware.ts`

Configures Cross-Origin Resource Sharing to only allow trusted domains:

**Allowed Origins:**
- `http://localhost:5173` - Vite dev server
- `http://localhost:4173` - Vite preview
- `https://on-tour-app.vercel.app` - Production
- `https://on-tour-app-beta.vercel.app` - Beta
- Environment-specific URL from `VITE_APP_URL`

**Configuration:**
```typescript
cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  // ...
})
```

### 4. CSRF Protection

**Implementation:** `api/utils/securityMiddleware.ts`

Prevents Cross-Site Request Forgery attacks:

**Flow:**
1. Client requests token: `GET /api/csrf-token`
2. Server generates and stores token in session
3. Client includes token in header: `X-CSRF-Token: <token>`
4. Server validates token on mutations (POST/PUT/DELETE/PATCH)

**Skips:** GET, HEAD, OPTIONS requests

**Validation:**
```typescript
const token = req.headers['x-csrf-token'];
const sessionToken = req.session?.csrfToken;

if (!token || token !== sessionToken) {
  // 403 Forbidden
}
```

### 5. Request Validation

#### Body Size Limit
**Default:** 1MB
**Purpose:** Prevents large payload attacks

```typescript
validateBodySize(1024 * 1024) // 1MB
```

#### Request Sanitization
**Purpose:** Prevents XSS and injection attacks

Sanitizes:
- Query parameters
- Request body
- Removes `<script>` tags
- Trims whitespace

```typescript
sanitizeRequest(req, res, next)
```

## Integration

### Vercel Serverless Functions

Apply security middleware to Vercel API routes:

```typescript
// api/your-endpoint.ts
import { applySecurityMiddleware } from './utils/securityMiddleware';

const app = express();
applySecurityMiddleware(app);

export default app;
```

### Individual Middleware

Apply specific middleware to routes:

```typescript
import { authLimiter, validateCSRFToken } from './utils/securityMiddleware';

app.post('/api/auth/login', authLimiter, async (req, res) => {
  // Login logic
});

app.post('/api/shows', validateCSRFToken, async (req, res) => {
  // Create show logic
});
```

## Security Headers Reference

Headers set by Helmet.js:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Rate Limit Response

When rate limit is exceeded:

```
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1640995200

{
  "error": "Too many requests",
  "message": "You have exceeded the rate limit. Please try again later.",
  "retryAfter": 900
}
```

## Testing Security

### Test Rate Limiting

```bash
# Rapid requests to trigger rate limit
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login
done
```

### Test CSRF Protection

```bash
# Without CSRF token (should fail)
curl -X POST http://localhost:3000/api/shows \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Show"}'

# With CSRF token (should succeed)
curl -X GET http://localhost:3000/api/csrf-token
curl -X POST http://localhost:3000/api/shows \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <token>" \
  -d '{"name": "Test Show"}'
```

### Test Body Size Limit

```bash
# Large payload (should fail)
curl -X POST http://localhost:3000/api/shows \
  -H "Content-Type: application/json" \
  -d @large-file.json
```

## Best Practices

1. **Always validate input** - Never trust client data
2. **Use HTTPS** - HSTS headers force secure connections
3. **Sanitize output** - Prevent XSS when rendering user content
4. **Audit dependencies** - Run `npm audit` regularly
5. **Monitor logs** - Track failed auth attempts and rate limit violations
6. **Update regularly** - Keep security packages up to date

## Maintenance

### Update Security Packages

```bash
npm update helmet express-rate-limit cors
```

### Audit Dependencies

```bash
npm audit
npm audit fix
```

### Review Logs

Monitor Vercel logs for:
- Rate limit violations (429 responses)
- CSRF failures (403 responses)
- CORS violations
- Large payload rejections (413 responses)

## Future Enhancements

- [ ] Implement session-based authentication
- [ ] Add IP whitelisting for admin endpoints
- [ ] Implement request signing for API clients
- [ ] Add honeypot fields to forms
- [ ] Implement account lockout after failed attempts
- [ ] Add security event logging to Firestore
- [ ] Implement Content Security Policy reporting
- [ ] Add Subresource Integrity (SRI) for CDN resources

## References

- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security)
