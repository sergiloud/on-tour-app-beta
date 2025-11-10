import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/AuditService.js';
import type { RequestContext } from './auth.js';

/**
 * Audit Middleware
 *
 * Captures and logs all HTTP requests for audit trail.
 * Tracks:
 * - Request details (method, path, user, org)
 * - Response status
 * - Performance metrics
 * - Errors
 */

interface AuditRequest extends Request {
  startTime?: number;
  context?: RequestContext;
}

/**
 * Main audit middleware
 *
 * Logs all requests with response status and performance data
 */
export const auditMiddleware = () => {
  return async (
    req: AuditRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Capture start time
    req.startTime = Date.now();

    // Capture original send
    const originalSend = res.send;

    // Override res.send to log after response
    res.send = function (data: any) {
      // Calculate duration
      const duration = Date.now() - (req.startTime || 0);

      // Extract audit info
      const userId = req.context?.userId || 'system';
      const organizationId = req.context?.organizationId || 'unknown';
      const method = req.method;
      const path = req.path;
      const statusCode = res.statusCode;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      // Determine action based on method
      let action = 'request';
      if (method === 'POST') action = 'create';
      else if (method === 'PUT' || method === 'PATCH') action = 'update';
      else if (method === 'DELETE') action = 'delete';
      else if (method === 'GET') action = 'read';

      // Determine resource type from path
      const pathSegments = path.split('/').filter((s: string) => s);
      const resourceType = pathSegments[2] || 'unknown';

      // Determine status
      let status: 'success' | 'error' | 'partial' = 'success';
      if (statusCode >= 400 && statusCode < 500) {
        status = 'error';
      } else if (statusCode >= 500) {
        status = 'error';
      } else if (statusCode >= 300 && statusCode < 400) {
        status = 'partial';
      }

      // Determine severity
      let severity: 'info' | 'warning' | 'critical' = 'info';
      if (statusCode >= 500) {
        severity = 'critical';
      } else if (statusCode >= 400) {
        severity = 'warning';
      }

      // Extract error message if present
      let errorMessage: string | undefined;
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        if (parsed?.error) {
          errorMessage = parsed.error;
        } else if (parsed?.message) {
          errorMessage = parsed.message;
        }
      } catch (e) {
        // Not JSON, ignore
      }

      // Log to audit service
      auditService.log({
        userId,
        organizationId,
        action,
        resourceType,
        ipAddress,
        userAgent,
        status,
        errorMessage,
        duration,
        metadata: {
          method,
          path,
          statusCode,
        },
        description: `${method} ${path} - ${statusCode}`,
        severity,
        isSystemOperation: false,
      }).catch((err) => {
        console.error('Failed to log audit:', err);
      });

      // Call original send
      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Manual audit logging for specific operations
 */
export const logAuditEvent = async (params: {
  userId: string;
  organizationId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  changes?: Record<string, any>;
  description?: string;
  ipAddress?: string;
}): Promise<void> => {
  try {
    await auditService.log({
      userId: params.userId,
      organizationId: params.organizationId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      changes: params.changes,
      description: params.description,
      ipAddress: params.ipAddress,
      status: 'success',
      severity: 'info',
    });
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
};

/**
 * Log error event
 */
export const logAuditError = async (params: {
  userId: string;
  organizationId: string;
  action: string;
  resourceType: string;
  error: Error;
  resourceId?: string;
  ipAddress?: string;
}): Promise<void> => {
  try {
    await auditService.log({
      userId: params.userId,
      organizationId: params.organizationId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      ipAddress: params.ipAddress,
      status: 'error',
      severity: 'warning',
      errorMessage: params.error.message,
      description: `Error during ${params.action}: ${params.error.message}`,
    });
  } catch (err) {
    console.error('Failed to log audit error:', err);
  }
};

/**
 * Log permission-related event
 */
export const logPermissionChange = async (params: {
  userId: string;
  organizationId: string;
  roleId: string;
  permissionCode: string;
  action: 'assign' | 'remove';
  ipAddress?: string;
}): Promise<void> => {
  try {
    await auditService.log({
      userId: params.userId,
      organizationId: params.organizationId,
      action: `permission_${params.action}`,
      resourceType: 'permission',
      resourceId: params.permissionCode,
      ipAddress: params.ipAddress,
      status: 'success',
      severity: 'info',
      changes: {
        roleId: params.roleId,
        permission: params.permissionCode,
      },
      description: `${params.action === 'assign' ? 'Assigned' : 'Removed'} permission ${params.permissionCode} to role ${params.roleId}`,
    });
  } catch (err) {
    console.error('Failed to log permission change:', err);
  }
};

/**
 * Log user authentication
 */
export const logAuthEvent = async (params: {
  userId: string;
  organizationId: string;
  action: 'login' | 'logout' | 'token_refresh';
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> => {
  try {
    await auditService.log({
      userId: params.userId,
      organizationId: params.organizationId,
      action: params.action,
      resourceType: 'authentication',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      status: params.success ? 'success' : 'error',
      severity: 'info',
      description: `User ${params.action}`,
    });
  } catch (err) {
    console.error('Failed to log auth event:', err);
  }
};
