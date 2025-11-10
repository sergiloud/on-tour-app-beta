import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { auditService } from '../services/AuditService';
import { AppDataSource } from '../database/datasource';
import { AuditLog } from '../database/entities/AuditLog';

/**
 * Audit Service Tests
 */
describe('AuditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('log', () => {
    it('should log an audit event', async () => {
      const params = {
        userId: 'user-123',
        organizationId: 'org-123',
        action: 'create',
        resourceType: 'show',
        resourceId: 'show-456',
        status: 'success' as const,
        severity: 'info' as const,
      };

      const result = await auditService.log(params);

      expect(result).toBeDefined();
      expect(result.userId).toBe(params.userId);
      expect(result.organizationId).toBe(params.organizationId);
      expect(result.action).toBe(params.action);
      expect(result.severity).toBe(params.severity);
    });

    it('should set default values for optional fields', async () => {
      const params = {
        userId: 'user-123',
        organizationId: 'org-123',
        action: 'update',
        resourceType: 'permission',
      };

      const result = await auditService.log(params);

      expect(result.status).toBe('success');
      expect(result.severity).toBe('info');
      expect(result.isSystemOperation).toBe(false);
    });
  });

  describe('getById', () => {
    it('should retrieve audit log by ID', async () => {
      const logId = 'audit-123';
      const mockLog = {
        id: logId,
        userId: 'user-123',
        organizationId: 'org-123',
        action: 'read',
      };

      vi.spyOn(auditService as any, 'auditLogRepository').mockResolvedValue({
        findOne: vi.fn().mockResolvedValue(mockLog),
      });

      const result = await auditService.getById(logId);

      expect(result).toBeDefined();
    });

    it('should return null for non-existent ID', async () => {
      const result = await auditService.getById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('getAuditLog', () => {
    it('should fetch audit logs with pagination', async () => {
      const result = await auditService.getAuditLog({
        limit: 10,
        offset: 0,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter by status', async () => {
      const result = await auditService.getAuditLog({
        status: 'success',
      });

      expect(result.data).toBeDefined();
    });

    it('should filter by severity', async () => {
      const result = await auditService.getAuditLog({
        severity: 'critical',
      });

      expect(result.data).toBeDefined();
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const result = await auditService.getAuditLog({
        startDate,
        endDate,
      });

      expect(result.data).toBeDefined();
    });
  });

  describe('getUserAuditLog', () => {
    it('should fetch user-specific audit logs', async () => {
      const userId = 'user-123';
      const orgId = 'org-123';

      const result = await auditService.getUserAuditLog(userId, orgId);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
    });

    it('should filter by action', async () => {
      const result = await auditService.getUserAuditLog('user-123', 'org-123', {
        action: 'delete',
      });

      expect(result.data).toBeDefined();
    });
  });

  describe('getResourceAuditLog', () => {
    it('should fetch resource-specific audit logs', async () => {
      const result = await auditService.getResourceAuditLog(
        'show',
        'show-456',
        'org-123'
      );

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
    });
  });

  describe('search', () => {
    it('should search audit logs by query', async () => {
      const result = await auditService.search('org-123', 'create');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
    });
  });

  describe('getStatistics', () => {
    it('should return audit statistics', async () => {
      const stats = await auditService.getStatistics('org-123');

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byAction');
      expect(stats).toHaveProperty('byStatus');
      expect(stats).toHaveProperty('byResource');
      expect(stats).toHaveProperty('avgDuration');
    });
  });

  describe('clearOldLogs', () => {
    it('should clear logs older than retention period', async () => {
      const deletedCount = await auditService.clearOldLogs('org-123', 90);

      expect(typeof deletedCount).toBe('number');
      expect(deletedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateAuditReport', () => {
    it('should generate audit report', async () => {
      const report = await auditService.generateAuditReport('org-123');

      expect(report).toHaveProperty('period');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('logs');
    });

    it('should include date range in report', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const report = await auditService.generateAuditReport('org-123', {
        startDate,
        endDate,
      });

      expect(report.period.startDate).toEqual(startDate);
      expect(report.period.endDate).toEqual(endDate);
    });
  });

  describe('count', () => {
    it('should return total count of audit logs', async () => {
      const count = await auditService.count('org-123');

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('delete', () => {
    it('should delete audit log', async () => {
      const deleted = await auditService.delete('audit-123');

      expect(typeof deleted).toBe('boolean');
    });
  });

  describe('clearAllLogs', () => {
    it('should clear all logs for organization', async () => {
      const deletedCount = await auditService.clearAllLogs('org-123');

      expect(typeof deletedCount).toBe('number');
    });
  });
});
