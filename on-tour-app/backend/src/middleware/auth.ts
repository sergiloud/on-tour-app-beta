import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractToken, JwtPayload } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

/**
 * Enhanced context with organization and permission info
 */
export interface RequestContext {
  userId: string;
  organizationId: string | null; // null for superadmin (cross-org access)
  role?: string;
  permissions: string[];
  isSuperAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      organizationId?: string;
      context?: RequestContext; // ← NEW: Enhanced context
    }
  }
}

/**
 * Main authentication middleware
 * Extracts JWT, verifies signature, sets request context
 * Handles superadmin scope for cross-tenant access
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      res.status(401).json({ error: 'Missing authorization token' });
      return;
    }

    const payload = verifyToken(token);
    req.user = payload;
    req.organizationId = payload.organizationId;

    // NEW: Enhanced context with security info
    req.context = {
      userId: payload.userId,
      organizationId: payload.scope === 'superadmin' ? null : payload.organizationId,
      role: payload.role,
      permissions: payload.permissions || [],
      isSuperAdmin: payload.scope === 'superadmin'
    };

    logger.debug(
      { 
        userId: payload.userId, 
        organizationId: payload.organizationId,
        isSuperAdmin: req.context.isSuperAdmin
      }, 
      'User authenticated'
    );
    
    next();
  } catch (error) {
    logger.error(error, 'Authentication failed');
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional authentication middleware
 * Allows unauthenticated requests to proceed
 */
export function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req.headers.authorization);

    if (token) {
      const payload = verifyToken(token);
      req.user = payload;
      req.organizationId = payload.organizationId;
      
      // NEW: Enhanced context
      req.context = {
        userId: payload.userId,
        organizationId: payload.scope === 'superadmin' ? null : payload.organizationId,
        role: payload.role,
        permissions: payload.permissions || [],
        isSuperAdmin: payload.scope === 'superadmin'
      };
    }

    next();
  } catch (error) {
    logger.warn(error, 'Optional authentication failed, continuing without auth');
    next();
  }
}
