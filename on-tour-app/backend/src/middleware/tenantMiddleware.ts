import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractToken, JwtPayload } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

/**
 * Tenant Context - Extracted from JWT
 * Stateless, cryptographically secure tenant identification
 */
export interface TenantContext {
  userId: string;
  organizationId: string | null; // null = superadmin (cross-org access)
  role?: string;
  permissions: string[];
  isSuperAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      context?: TenantContext;
    }
  }
}

/**
 * Tenant Middleware - JWT-based tenant identification
 * 
 * SECURITY:
 * - organizationId extracted from JWT signature (cannot be spoofed)
 * - No header-based identification (headers are easily manipulated)
 * - Superadmin scope enables cross-org access (logged)
 * 
 * USAGE:
 * app.use(tenantMiddleware);
 * 
 * TENANT CONTEXT AVAILABLE IN ROUTES:
 * req.context.organizationId - The organization ID (or null if superadmin)
 * req.context.isSuperAdmin - Is this a superadmin request?
 * req.context.userId - The user ID
 * req.context.permissions - User's permissions array
 */
export function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Extract JWT from Authorization header
    const token = extractToken(req.headers.authorization);

    if (!token) {
      // No token - continue (public endpoints allowed)
      return next();
    }

    // Verify JWT signature
    const payload = verifyToken(token);

    // Determine if superadmin (scope='superadmin' = cross-org access)
    const isSuperAdmin = payload.scope === 'superadmin';

    // If superadmin: organizationId = null (no filtering)
    // If regular user: organizationId = from JWT (scoped)
    const organizationId = isSuperAdmin ? null : payload.organizationId;

    // Validate that regular users have organization assigned
    if (!isSuperAdmin && !payload.organizationId) {
      logger.warn(
        { userId: payload.userId },
        'User without organization ID attempted access'
      );
      res.status(403).json({ 
        error: 'User not assigned to organization',
        code: 'NO_ORGANIZATION'
      });
      return;
    }

    // Set request context (available in all routes via req.context)
    req.context = {
      userId: payload.userId,
      organizationId,
      role: payload.role,
      permissions: payload.permissions || [],
      isSuperAdmin
    };

    // Log authentication (especially superadmin for audit)
    if (isSuperAdmin) {
      logger.warn(
        { userId: payload.userId },
        'Superadmin access detected - cross-org scope enabled'
      );
    } else {
      logger.debug(
        { 
          userId: payload.userId, 
          organizationId: payload.organizationId,
          role: payload.role
        },
        'Tenant context established'
      );
    }

    next();
  } catch (error) {
    // Token validation failed
    if (error instanceof Error && error.message.includes('expired')) {
      logger.warn(error, 'Token expired');
      res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }

    logger.error(error, 'Tenant middleware: Token verification failed');
    res.status(401).json({ 
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
}

/**
 * Require Authentication Middleware
 * Ensures request has valid tenant context
 * Use AFTER tenantMiddleware
 */
export function requireTenant(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.context) {
    res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
    return;
  }

  next();
}

/**
 * Verify Tenant Access - Ensures user belongs to the specified organization
 * Use in routes to enforce tenant isolation
 */
export function verifyTenantAccess(requiredOrgId: string | undefined) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.context) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Superadmin always has access
    if (req.context.isSuperAdmin) {
      return next();
    }

    // Regular user must match organization
    if (!requiredOrgId || req.context.organizationId !== requiredOrgId) {
      logger.warn(
        { 
          userId: req.context.userId, 
          requestedOrg: requiredOrgId,
          userOrg: req.context.organizationId
        },
        'Tenant access verification failed'
      );
      res.status(403).json({ 
        error: 'Access denied',
        code: 'FORBIDDEN'
      });
      return;
    }

    next();
  };
}

export default tenantMiddleware;
