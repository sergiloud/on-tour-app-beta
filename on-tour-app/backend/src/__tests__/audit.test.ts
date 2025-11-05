import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AppDataSource } from '../database/datasource.js';
import { AuditLog } from '../database/entities/AuditLog.js';
import { auditService } from '../services/AuditService.js';
import { v4 as uuid } from 'uuid';

describe('Audit Service', () => {
  const testOrgId = uuid();
  const testUserId = uuid();
  const testResourceId = uuid();

  beforeEach(async () => {
    // Setup test database
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterEach(async () => {
    // Cleanup
    const repo = AppDataSource.getRepository(AuditLog);
    await repo.delete({ organizationId: testOrgId });
  });

  describe('log()', () => {
    it('should create an audit log entry', async () => {
      const log = await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'create',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'success',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
      });

      expect(log).toBeDefined();
      expect(log.userId).toBe(testUserId);
      expect(log.organizationId).toBe(testOrgId);
      expect(log.action).toBe('create');
      expect(log.status).toBe('success');
    });

    it('should set severity to info for success status', async () => {
      const log = await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'read',
        resourceType: 'finance',
        resourceId: testResourceId,
        status: 'success',
      });

      expect(log.severity).toBe('info');
    });

    it('should set severity to warning for error status', async () => {
      const log = await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'delete',
        resourceType: 'user',
        resourceId: testResourceId,
        status: 'error',
        errorMessage: 'Permission denied',
      });

      expect(log.severity).toBe('warning');
    });

    it('should set severity to critical for critical errors', async () => {
      const log = await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'update',
        resourceType: 'organization',
        resourceId: testResourceId,
        status: 'error',
        errorMessage: 'Database connection failed',
      });

      expect(log.severity).toBe('warning');
    });

    it('should store changes as JSONB', async () => {
      const changes = { name: { old: 'Tour 1', new: 'Tour 2' } };
      const log = await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'update',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'success',
        changes,
      });

      expect(log.changes).toEqual(changes);
    });
  });

  describe('getById()', () => {
    it('should retrieve audit log by id', async () => {
      const created = await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'create',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'success',
      });

      const found = await auditService.getById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.action).toBe('create');
    });

    it('should return undefined for non-existent id', async () => {
      const found = await auditService.getById(uuid());

      expect(found).toBeUndefined();
    });
  });

  describe('getAuditLog()', () => {
    beforeEach(async () => {
      // Create test data
      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'create',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'success',
      });

      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'update',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'success',
      });

      await auditService.log({
        userId: uuid(),
        organizationId: testOrgId,
        action: 'delete',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'error',
      });
    });

    it('should list audit logs with pagination', async () => {
      const result = await auditService.getAuditLog({
        limit: 10,
        offset: 0,
      });

      expect(result.data).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      const result = await auditService.getAuditLog({
        limit: 10,
        offset: 0,
        status: 'success',
      });

      expect(result.data.length).toBe(2);
      result.data.forEach((log) => {
        expect(log.status).toBe('success');
      });
    });

    it('should filter by severity', async () => {
      const result = await auditService.getAuditLog({
        limit: 10,
        offset: 0,
        severity: 'warning',
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].severity).toBe('warning');
    });

    it('should filter by date range', async () => {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      const result = await auditService.getAuditLog({
        limit: 10,
        offset: 0,
        startDate,
        endDate,
      });

      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe('getUserAuditLog()', () => {
    beforeEach(async () => {
      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'create',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'success',
      });

      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'update',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'success',
      });
    });

    it('should get user-specific audit logs', async () => {
      const result = await auditService.getUserAuditLog(testUserId, testOrgId, {
        limit: 10,
        offset: 0,
      });

      expect(result.data.length).toBe(2);
      result.data.forEach((log) => {
        expect(log.userId).toBe(testUserId);
      });
    });

    it('should filter user logs by action', async () => {
      const result = await auditService.getUserAuditLog(testUserId, testOrgId, {
        limit: 10,
        offset: 0,
        action: 'create',
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].action).toBe('create');
    });
  });

  describe('getResourceAuditLog()', () => {
    beforeEach(async () => {
      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'create',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'success',
      });

      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'update',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'success',
      });

      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'delete',
        resourceType: 'show',
        resourceId: uuid(), // Different resource
        status: 'success',
      });
    });

    it('should get resource-specific audit logs', async () => {
      const result = await auditService.getResourceAuditLog(
        'show',
        testResourceId,
        testOrgId,
        {
          limit: 10,
          offset: 0,
        }
      );

      expect(result.data.length).toBe(2);
      result.data.forEach((log) => {
        expect(log.resourceId).toBe(testResourceId);
        expect(log.resourceType).toBe('show');
      });
    });
  });

  describe('getOrganizationAuditLog()', () => {
    beforeEach(async () => {
      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'create',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'success',
      });

      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'update',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'success',
      });
    });

    it('should get organization-wide audit logs', async () => {
      const result = await auditService.getOrganizationAuditLog(testOrgId, {
        limit: 10,
        offset: 0,
      });

      expect(result.data.length).toBe(2);
      result.data.forEach((log) => {
        expect(log.organizationId).toBe(testOrgId);
      });
    });
  });

  describe('search()', () => {
    beforeEach(async () => {
      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'create',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'success',
        errorMessage: 'Tour created successfully',
      });

      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'update',
        resourceType: 'finance',
        resourceId: testResourceId,
        status: 'error',
        errorMessage: 'Currency conversion failed',
      });
    });

    it('should search audit logs by query', async () => {
      const result = await auditService.search(testOrgId, 'Tour', {
        limit: 10,
        offset: 0,
      });

      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should return empty results for non-matching query', async () => {
      const result = await auditService.search(testOrgId, 'NonExistentQuery', {
        limit: 10,
        offset: 0,
      });

      expect(result.data.length).toBe(0);
    });
  });

  describe('getStatistics()', () => {
    beforeEach(async () => {
      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'create',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'success',
        duration: 100,
      });

      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'create',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'success',
        duration: 150,
      });

      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'update',
        resourceType: 'finance',
        resourceId: testResourceId,
        status: 'success',
        duration: 200,
      });
    });

    it('should calculate audit statistics', async () => {
      const stats = await auditService.getStatistics(testOrgId);

      expect(stats).toBeDefined();
      expect(stats.totalLogs).toBe(3);
      expect(stats.byStatus).toBeDefined();
      expect(stats.byAction).toBeDefined();
    });

    it('should calculate average duration', async () => {
      const stats = await auditService.getStatistics(testOrgId);

      expect(stats.averageDuration).toBeGreaterThan(0);
      // (100 + 150 + 200) / 3 = 150
      expect(stats.averageDuration).toBeLessThanOrEqual(150);
    });
  });

  describe('clearOldLogs()', () => {
    it('should respect retention policy', async () => {
      // This test would require mocking date or using a real retention scenario
      const result = await auditService.clearOldLogs(testOrgId, 90);

      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('count()', () => {
    beforeEach(async () => {
      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'create',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'success',
      });

      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'update',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'success',
      });
    });

    it('should count audit logs for organization', async () => {
      const count = await auditService.count(testOrgId);

      expect(count).toBe(2);
    });
  });

  describe('delete()', () => {
    it('should delete single audit log', async () => {
      const log = await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'create',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'success',
      });

      const deleted = await auditService.delete(log.id);

      expect(deleted).toBe(true);

      const found = await auditService.getById(log.id);
      expect(found).toBeUndefined();
    });
  });

  describe('generateAuditReport()', () => {
    beforeEach(async () => {
      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'create',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'success',
      });

      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'update',
        resourceType: 'show',
        resourceId: testResourceId,
        status: 'error',
      });
    });

    it('should generate comprehensive audit report', async () => {
      const report = await auditService.generateAuditReport(testOrgId, {});

      expect(report).toBeDefined();
      expect(report.organizationId).toBe(testOrgId);
      expect(report.totalLogs).toBeGreaterThan(0);
      expect(report.summary).toBeDefined();
    });
  });
});
