import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { tenantMiddleware } from '../middleware/tenantMiddleware.js';
import { requirePermission, requireAllPermissions } from '../middleware/permissionMiddleware.js';
import { rolePermissionService } from '../services/RolePermissionService.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * Permission API Routes
 *
 * 5 REST endpoints for permission management
 *
 * Security:
 * - All endpoints require authentication (authMiddleware)
 * - Admin endpoints require "admin:access" permission
 * - Superadmin only for mutations
 */

/**
 * GET /api/permissions
 * List all available permissions
 *
 * Response: { success: true, data: Permission[] }
 */
router.get(
  '/',
  authMiddleware,
  tenantMiddleware,
  async (req: Request, res: Response) => {
    try {
      const permissions = await rolePermissionService.getAllPermissions();

      res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      logger.error(error, 'Failed to list permissions');
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to list permissions',
      });
    }
  }
);

/**
 * GET /api/roles/:roleId/permissions
 * Get permissions assigned to a specific role
 *
 * Response: { success: true, data: string[] (permission codes) }
 */
router.get(
  '/roles/:roleId/permissions',
  authMiddleware,
  tenantMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { roleId } = req.params;

      if (!roleId || roleId.trim() === '') {
        res.status(400).json({
          error: 'Invalid role ID',
        });
        return;
      }

      const permissions = await rolePermissionService.getPermissionsForRole(roleId);

      res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      logger.error(error, 'Failed to get role permissions');
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get role permissions',
      });
    }
  }
);

/**
 * POST /api/roles/:roleId/permissions
 * Assign permissions to a role
 *
 * Body: { permissionCodes: string[] }
 * Response: { success: true, data: RolePermission[] }
 *
 * Requires: admin:access permission (superadmin only)
 */
router.post(
  '/roles/:roleId/permissions',
  authMiddleware,
  tenantMiddleware,
  requireAllPermissions('admin:access'),
  async (req: Request, res: Response) => {
    try {
      const { roleId } = req.params;
      const { permissionCodes } = req.body;

      // Validate input
      if (!roleId || roleId.trim() === '') {
        res.status(400).json({
          error: 'Invalid role ID',
        });
        return;
      }

      if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) {
        res.status(400).json({
          error: 'Permission codes must be a non-empty array',
        });
        return;
      }

      // Assign permissions
      const assigned = await rolePermissionService.assignPermissionsToRole(
        roleId,
        permissionCodes
      );

      logger.info(
        { roleId, count: assigned.length },
        'Permissions assigned to role'
      );

      res.status(201).json({
        success: true,
        data: assigned,
      });
    } catch (error) {
      logger.error(error, 'Failed to assign permissions to role');
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to assign permissions',
      });
    }
  }
);

/**
 * DELETE /api/roles/:roleId/permissions/:permissionCode
 * Remove permission from a role
 *
 * Response: { success: true, message: "Permission removed" }
 *
 * Requires: admin:access permission (superadmin only)
 */
router.delete(
  '/roles/:roleId/permissions/:permissionCode',
  authMiddleware,
  tenantMiddleware,
  requireAllPermissions('admin:access'),
  async (req: Request, res: Response) => {
    try {
      const { roleId, permissionCode } = req.params;

      // Validate input
      if (!roleId || roleId.trim() === '') {
        res.status(400).json({
          error: 'Invalid role ID',
        });
        return;
      }

      if (!permissionCode || permissionCode.trim() === '') {
        res.status(400).json({
          error: 'Invalid permission code',
        });
        return;
      }

      // Remove permission
      await rolePermissionService.removePermissionFromRole(roleId, permissionCode);

      logger.info(
        { roleId, permissionCode },
        'Permission removed from role'
      );

      res.status(200).json({
        success: true,
        message: 'Permission removed from role',
      });
    } catch (error) {
      logger.error(error, 'Failed to remove permission from role');
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to remove permission',
      });
    }
  }
);

/**
 * POST /api/permissions/check
 * Check if user has specific permission(s)
 *
 * Body: { permissionCodes: string | string[], checkAll?: boolean }
 * Response: { success: true, data: { hasPermission: boolean } }
 */
router.post(
  '/check',
  authMiddleware,
  tenantMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { permissionCodes, checkAll = false } = req.body;

      // Validate input
      if (!permissionCodes) {
        res.status(400).json({
          error: 'Permission codes required',
        });
        return;
      }

      // Normalize to array
      const codes = Array.isArray(permissionCodes)
        ? permissionCodes
        : [permissionCodes];

      if (codes.length === 0) {
        res.status(400).json({
          error: 'At least one permission code required',
        });
        return;
      }

      const userRole = req.user?.role || 'user';

      // Check permissions
      let hasPermission: boolean;

      if (checkAll) {
        hasPermission = await rolePermissionService.roleHasAllPermissions(
          userRole,
          codes
        );
      } else {
        hasPermission = await rolePermissionService.roleHasAnyPermission(
          userRole,
          codes
        );
      }

      res.status(200).json({
        success: true,
        data: {
          hasPermission,
          permissions: codes,
          checkType: checkAll ? 'all' : 'any',
        },
      });
    } catch (error) {
      logger.error(error, 'Failed to check permissions');
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to check permissions',
      });
    }
  }
);

export default router;
