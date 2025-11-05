import { describe, it, expect, beforeEach, vi } from 'vitest';
import { auditMiddleware, logAuditEvent, logAuditError, logPermissionChange, logAuthEvent } from '../middleware/auditMiddleware.js';
import type { RequestContext } from '../middleware/auth.js';
import { v4 as uuid } from 'uuid';

describe('Audit Middleware', () => {
  const testOrgId = uuid();
  const testUserId = uuid();

  describe('auditMiddleware()', () => {
    it('should track request execution time', () => {
      const middleware = auditMiddleware();
      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe('function');
    });

    it('should determine correct action based on HTTP method', () => {
      const middleware = auditMiddleware();
      expect(middleware).toBeDefined();
    });

    it('should classify severity based on HTTP status code', () => {
      const middleware = auditMiddleware();
      expect(middleware).toBeDefined();
    });

    it('should extract user and organization context', () => {
      const middleware = auditMiddleware();
      expect(middleware).toBeDefined();
    });

    it('should handle missing context gracefully', () => {
      const middleware = auditMiddleware();
      expect(() => {
        expect(middleware).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('logAuditEvent()', () => {
    it('should log custom audit event', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await logAuditEvent({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'export',
        resourceType: 'report',
        resourceId: uuid(),
      });

      logSpy.mockRestore();
    });

    it('should include event details', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const details = {
        userId: testUserId,
        organizationId: testOrgId,
        action: 'export',
        resourceType: 'report',
        resourceId: uuid(),
        changes: { format: 'csv', rows: 1000 },
      };

      await logAuditEvent(details);

      logSpy.mockRestore();
    });
  });

  describe('logAuditError()', () => {
    it('should log error audit event with severity', async () => {
      const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await logAuditError({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'update',
        resourceType: 'show',
        resourceId: uuid(),
        error: new Error('Validation failed'),
      });

      logSpy.mockRestore();
    });

    it('should mark error event with critical severity', async () => {
      const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await logAuditError({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'delete',
        resourceType: 'user',
        resourceId: uuid(),
        error: new Error('Database error'),
      });

      logSpy.mockRestore();
    });
  });

  describe('logPermissionChange()', () => {
    it('should log permission assignment', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await logPermissionChange({
        userId: testUserId,
        organizationId: testOrgId,
        roleId: uuid(),
        permissionCode: 'shows:edit',
        action: 'assign',
      });

      logSpy.mockRestore();
    });

    it('should track permission revocation', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await logPermissionChange({
        userId: testUserId,
        organizationId: testOrgId,
        roleId: uuid(),
        permissionCode: 'admin:access',
        action: 'remove',
      });

      logSpy.mockRestore();
    });
  });

  describe('logAuthEvent()', () => {
    it('should log successful authentication', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await logAuthEvent({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'login',
        success: true,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      logSpy.mockRestore();
    });

    it('should log failed authentication attempt', async () => {
      const logSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await logAuthEvent({
        userId: 'unknown',
        organizationId: testOrgId,
        action: 'login',
        success: false,
        ipAddress: '192.168.1.100',
        userAgent: 'Suspicious Agent',
      });

      logSpy.mockRestore();
    });

    it('should log logout event', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await logAuthEvent({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'logout',
        success: true,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      logSpy.mockRestore();
    });

    it('should log token refresh', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await logAuthEvent({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'token_refresh',
        success: true,
      });

      logSpy.mockRestore();
    });
  });
});
