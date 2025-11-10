import { Request, Response, NextFunction } from 'express';
import { rolePermissionService } from '../services/RolePermissionService.js';
import { logger } from '../utils/logger.js';

/**
 * Permission Middleware
 *
 * Enforces permission-based access control on routes
 * Requires tenant context to be established (from tenantMiddleware)
 *
 * USAGE:
 * app.post('/api/reports', permissionMiddleware.requirePermission('reports:create'), handler);
 * app.delete('/api/users/:id', permissionMiddleware.requireAllPermissions('users:delete', 'admin:access'), handler);
 */

/**
 * Require single permission
 *
 * @param requiredPermission - Permission code (e.g., "orgs:read")
 * @returns Middleware function
 *
 * USAGE:
 * permissionMiddleware.requirePermission('orgs:read')
 */
export function requirePermission(requiredPermission: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Verify context exists
      if (!req.context) {
        logger.warn({}, 'Permission check: No tenant context');
        res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
        return;
      }

      // Superadmin always has permission
      if (req.context.isSuperAdmin) {
        return next();
      }

      // Get user's role (stored in JWT)
      const role = req.user?.role || 'user';

      // Check permission
      const hasPermission = await rolePermissionService.roleHasPermission(
        role,
        requiredPermission
      );

      if (!hasPermission) {
        logger.warn(
          {
            userId: req.context.userId,
            role,
            requiredPermission,
          },
          'Permission denied: Insufficient permissions'
        );

        res.status(403).json({
          error: 'Insufficient permissions',
          code: 'PERMISSION_DENIED',
          required: requiredPermission,
        });
        return;
      }

      next();
    } catch (error) {
      logger.error(error, 'Permission middleware error');
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  };
}

/**
 * Require ANY of the specified permissions
 *
 * @param permissionCodes - Array of permission codes
 * @returns Middleware function
 *
 * USAGE:
 * permissionMiddleware.requireAnyPermission(['reports:update', 'admin:access'])
 */
export function requireAnyPermission(...permissionCodes: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Verify context exists
      if (!req.context) {
        logger.warn({}, 'Permission check: No tenant context');
        res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
        return;
      }

      // Superadmin always has permission
      if (req.context.isSuperAdmin) {
        return next();
      }

      // Get user's role
      const role = req.user?.role || 'user';

      // Check if user has ANY permission
      const hasPermission = await rolePermissionService.roleHasAnyPermission(
        role,
        permissionCodes
      );

      if (!hasPermission) {
        logger.warn(
          {
            userId: req.context.userId,
            role,
            requiredPermissions: permissionCodes,
          },
          'Permission denied: Insufficient permissions (requires any)'
        );

        res.status(403).json({
          error: 'Insufficient permissions',
          code: 'PERMISSION_DENIED',
          required: permissionCodes,
        });
        return;
      }

      next();
    } catch (error) {
      logger.error(error, 'Permission middleware error');
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  };
}

/**
 * Require ALL of the specified permissions
 *
 * @param permissionCodes - Array of permission codes
 * @returns Middleware function
 *
 * USAGE:
 * permissionMiddleware.requireAllPermissions(['users:delete', 'admin:access'])
 */
export function requireAllPermissions(...permissionCodes: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Verify context exists
      if (!req.context) {
        logger.warn({}, 'Permission check: No tenant context');
        res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
        return;
      }

      // Superadmin always has all permissions
      if (req.context.isSuperAdmin) {
        return next();
      }

      // Get user's role
      const role = req.user?.role || 'user';

      // Check if user has ALL permissions
      const hasPermission = await rolePermissionService.roleHasAllPermissions(
        role,
        permissionCodes
      );

      if (!hasPermission) {
        logger.warn(
          {
            userId: req.context.userId,
            role,
            requiredPermissions: permissionCodes,
          },
          'Permission denied: Insufficient permissions (requires all)'
        );

        res.status(403).json({
          error: 'Insufficient permissions',
          code: 'PERMISSION_DENIED',
          required: permissionCodes,
        });
        return;
      }

      next();
    } catch (error) {
      logger.error(error, 'Permission middleware error');
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  };
}

export default {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
};
