import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

/**
 * Rate Limiter per Organization
 * 
 * PURPOSE: Prevent one organization from impacting others
 * PROBLEM: Global rate limiting = one org's spike DOS others
 * SOLUTION: Per-org rate limiting (isolated limits)
 * 
 * IMPLEMENTATION:
 * - Simple in-memory counters per organization
 * - 100 requests per minute per org (configurable)
 * - Superadmin bypass (cross-org access not rate limited)
 * - Returns 429 when limit exceeded
 * 
 * SCALABILITY NOTE:
 * For production with multiple servers:
 * - Use Redis instead of Map
 * - Share rate limit state across instances
 * - Consider: npm i rate-limiter-flexible
 * 
 * CURRENT: Simple in-memory (works for single server)
 */

/**
 * Rate limit configuration per tier
 * Future: Make user/org tier configurable
 */
const RATE_LIMIT_CONFIG = {
  free: { requests: 100, windowMs: 60 * 1000 }, // 100/min
  pro: { requests: 500, windowMs: 60 * 1000 }, // 500/min
  enterprise: { requests: 5000, windowMs: 60 * 1000 }, // 5000/min
};

const DEFAULT_TIER = "pro";

/**
 * Rate limit entry for organization
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store: organizationId -> RateLimitEntry
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Get or create rate limit entry for organization
 */
function getRateLimitEntry(
  organizationId: string,
  now: number
): RateLimitEntry {
  const config = RATE_LIMIT_CONFIG[DEFAULT_TIER as keyof typeof RATE_LIMIT_CONFIG];
  let entry = rateLimitStore.get(organizationId);

  // Create or reset if window expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(organizationId, entry);
  }

  return entry;
}

/**
 * Rate limiter middleware - per organization
 * 
 * SETUP: Register BEFORE routes
 * app.use(tenantMiddleware); // Must set req.context first
 * app.use(orgRateLimiter);    // Rate limit per org
 * app.use('/api', routes);    // Routes
 */
export function orgRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Skip rate limiting if no context (public endpoints)
    if (!req.context) {
      return next();
    }

    const organizationId = req.context.organizationId;

    // Skip if no org ID (shouldn't happen with tenantMiddleware, but safe check)
    if (!organizationId) {
      return next();
    }

    // Superadmin bypass (cross-org access not rate limited)
    if (req.context.isSuperAdmin) {
      return next();
    }

    // Get rate limit config
    const config = RATE_LIMIT_CONFIG[DEFAULT_TIER as keyof typeof RATE_LIMIT_CONFIG];
    const now = Date.now();

    // Get or create entry
    const entry = getRateLimitEntry(organizationId, now);

    // Check if limit exceeded
    if (entry.count >= config.requests) {
      const retryAfter = Math.ceil(
        (entry.resetTime - now) / 1000
      );

      logger.warn(
        {
          organizationId,
          limit: config.requests,
          window: config.windowMs / 1000,
          retryAfter,
        },
        "Rate limit exceeded"
      );

      res.status(429).json({
        error: "Rate limit exceeded",
        message: `Too many requests (${config.requests} per ${
          config.windowMs / 1000
        }s). Try again in ${retryAfter}s.`,
        retryAfter,
        limit: config.requests,
        window: config.windowMs / 1000,
      });
      return;
    }

    // Increment counter
    entry.count++;

    // Add rate limit headers
    res.setHeader("X-RateLimit-Limit", config.requests);
    res.setHeader("X-RateLimit-Remaining", config.requests - entry.count);
    res.setHeader(
      "X-RateLimit-Reset",
      Math.ceil(entry.resetTime / 1000)
    );

    logger.debug(
      {
        organizationId,
        count: entry.count,
        limit: config.requests,
      },
      "Rate limit check passed"
    );

    next();
  } catch (error) {
    logger.error(error, "Rate limiter error");
    // Don't block on error - continue
    next();
  }
}

/**
 * Reset rate limiter for organization
 * USE CASE: Upgrade plan, admin override, testing
 */
export function resetOrgRateLimiter(organizationId: string): void {
  rateLimitStore.delete(organizationId);
  logger.info({ organizationId }, "Rate limiter reset");
}

/**
 * Get current rate limit status
 * USEFUL: For debugging and metrics
 */
export function getOrgRateLimitStatus(
  organizationId: string
): { count: number; limit: number; remaining: number; resetAt: Date } | null {
  const entry = rateLimitStore.get(organizationId);
  if (!entry) {
    return null;
  }

  const config = RATE_LIMIT_CONFIG[DEFAULT_TIER as keyof typeof RATE_LIMIT_CONFIG];

  return {
    count: entry.count,
    limit: config.requests,
    remaining: Math.max(0, config.requests - entry.count),
    resetAt: new Date(entry.resetTime),
  };
}

export default orgRateLimiter;
