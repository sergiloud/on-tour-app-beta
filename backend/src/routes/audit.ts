import { Router, Request, Response } from 'express';
import { auditService } from '../services/AuditService.js';
import { requireAllPermissions } from '../middleware/permissionMiddleware.js';
import type { RequestContext } from '../middleware/auth.js';

interface AuditRequest extends Request {
  context?: RequestContext;
}

/**
 * Audit API Routes
 *
 * All endpoints require admin:access permission
 */
const router = Router();

/**
 * GET /api/audit
 * List all audit logs (admin only)
 */
router.get(
  '/',
  requireAllPermissions('admin:access'),
  async (req: AuditRequest, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const status = req.query.status as string | undefined;
      const severity = req.query.severity as string | undefined;

      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      const result = await auditService.getAuditLog({
        limit,
        offset,
        status,
        severity,
        startDate,
        endDate,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch audit logs',
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/audit/:id
 * Get single audit log
 */
router.get(
  '/:id',
  requireAllPermissions('admin:access'),
  async (req: AuditRequest, res: Response) => {
    try {
      const log = await auditService.getById(req.params.id);

      if (!log) {
        return res.status(404).json({ error: 'Audit log not found' });
      }

      res.json(log);
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch audit log',
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/audit/user/:userId
 * Get user-specific audit logs
 */
router.get(
  '/user/:userId',
  requireAllPermissions('admin:access'),
  async (req: AuditRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const organizationId = req.context?.organizationId;

      if (!organizationId) {
        return res.status(400).json({ error: 'Organization context required' });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const action = req.query.action as string | undefined;

      const result = await auditService.getUserAuditLog(userId, organizationId, {
        limit,
        offset,
        action,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch user audit logs',
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/audit/resource/:resourceId
 * Get resource-specific audit logs
 */
router.get(
  '/resource/:resourceId',
  requireAllPermissions('admin:access'),
  async (req: AuditRequest, res: Response) => {
    try {
      const { resourceId } = req.params;
      const resourceType = (req.query.resourceType as string) || 'unknown';
      const organizationId = req.context?.organizationId;

      if (!organizationId) {
        return res.status(400).json({ error: 'Organization context required' });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await auditService.getResourceAuditLog(
        resourceType,
        resourceId,
        organizationId,
        {
          limit,
          offset,
        }
      );

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch resource audit logs',
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/audit/search
 * Search audit logs
 */
router.get(
  '/search/:query',
  requireAllPermissions('admin:access'),
  async (req: AuditRequest, res: Response) => {
    try {
      const { query } = req.params;
      const organizationId = req.context?.organizationId;

      if (!organizationId) {
        return res.status(400).json({ error: 'Organization context required' });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await auditService.search(organizationId, query, {
        limit,
        offset,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to search audit logs',
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/audit/statistics
 * Get audit statistics
 */
router.get(
  '/stats',
  requireAllPermissions('admin:access'),
  async (req: AuditRequest, res: Response) => {
    try {
      const organizationId = req.context?.organizationId;

      if (!organizationId) {
        return res.status(400).json({ error: 'Organization context required' });
      }

      const stats = await auditService.getStatistics(organizationId);

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to get audit statistics',
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/audit/report
 * Generate audit report
 */
router.post(
  '/report',
  requireAllPermissions('admin:access'),
  async (req: AuditRequest, res: Response) => {
    try {
      const organizationId = req.context?.organizationId;

      if (!organizationId) {
        return res.status(400).json({ error: 'Organization context required' });
      }

      const { startDate, endDate, resourceType } = req.body;

      const report = await auditService.generateAuditReport(organizationId, {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        resourceType,
      });

      res.json(report);
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to generate audit report',
        message: error.message,
      });
    }
  }
);

/**
 * DELETE /api/audit/old
 * Clear old audit logs (retention policy)
 */
router.delete(
  '/old',
  requireAllPermissions('admin:access'),
  async (req: AuditRequest, res: Response) => {
    try {
      const organizationId = req.context?.organizationId;

      if (!organizationId) {
        return res.status(400).json({ error: 'Organization context required' });
      }

      const daysToKeep = parseInt(req.query.daysToKeep as string) || 90;
      const deletedCount = await auditService.clearOldLogs(organizationId, daysToKeep);

      res.json({
        message: `Deleted ${deletedCount} old audit logs`,
        deletedCount,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to clear old audit logs',
        message: error.message,
      });
    }
  }
);

/**
 * DELETE /api/audit/:id
 * Delete single audit log
 */
router.delete(
  '/:id',
  requireAllPermissions('admin:access'),
  async (req: AuditRequest, res: Response) => {
    try {
      const deleted = await auditService.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({ error: 'Audit log not found' });
      }

      res.json({ message: 'Audit log deleted' });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to delete audit log',
        message: error.message,
      });
    }
  }
);

export default router;
