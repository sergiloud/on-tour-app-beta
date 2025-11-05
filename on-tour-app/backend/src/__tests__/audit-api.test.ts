import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import { AppDataSource } from '../database/datasource.js';
import { AuditLog } from '../database/entities/AuditLog.js';
import auditRouter from '../routes/audit.js';
import { auditService } from '../services/AuditService.js';
import { v4 as uuid } from 'uuid';

/**
 * Mock auth middleware for testing
 */
const mockAuthMiddleware = (req: any, res: any, next: any) => {
  req.context = {
    userId: uuid(),
    organizationId: uuid(),
    permissions: ['admin:access'],
  };
  next();
};

describe('Audit API Routes', () => {
  let app: Express;
  const testOrgId = uuid();
  const testUserId = uuid();

  beforeEach(async () => {
    // Setup app
    app = express();
    app.use(express.json());
    app.use(mockAuthMiddleware);
    app.use('/api/audit', auditRouter);

    // Initialize database
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterEach(async () => {
    // Cleanup
    const repo = AppDataSource.getRepository(AuditLog);
    await repo.delete({});
  });

  describe('GET /api/audit', () => {
    it('should list all audit logs', async () => {
      // Create test data
      await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'create',
        resourceType: 'show',
        status: 'success',
      });

      const res = await request(app)
        .get('/api/audit')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.data).toBeDefined();
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/audit?limit=10&offset=0')
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/audit?status=success')
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('should filter by severity', async () => {
      const res = await request(app)
        .get('/api/audit?severity=info')
        .expect(200);

      expect(res.body).toBeDefined();
    });
  });

  describe('GET /api/audit/:id', () => {
    it('should retrieve single audit log', async () => {
      const log = await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'create',
        resourceType: 'show',
        status: 'success',
      });

      const res = await request(app)
        .get(`/api/audit/${log.id}`)
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.id).toBe(log.id);
    });

    it('should return 404 for non-existent log', async () => {
      await request(app)
        .get(`/api/audit/${uuid()}`)
        .expect(404);
    });
  });

  describe('GET /api/audit/user/:userId', () => {
    it('should get user-specific audit logs', async () => {
      const res = await request(app)
        .get(`/api/audit/user/${testUserId}`)
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('should filter by action', async () => {
      const res = await request(app)
        .get(`/api/audit/user/${testUserId}?action=create`)
        .expect(200);

      expect(res.body).toBeDefined();
    });
  });

  describe('GET /api/audit/resource/:resourceId', () => {
    it('should get resource-specific audit logs', async () => {
      const resourceId = uuid();

      const res = await request(app)
        .get(`/api/audit/resource/${resourceId}?resourceType=show`)
        .expect(200);

      expect(res.body).toBeDefined();
    });
  });

  describe('GET /api/audit/search/:query', () => {
    it('should search audit logs', async () => {
      const res = await request(app)
        .get('/api/audit/search/create')
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('should support pagination on search', async () => {
      const res = await request(app)
        .get('/api/audit/search/create?limit=5&offset=0')
        .expect(200);

      expect(res.body).toBeDefined();
    });
  });

  describe('GET /api/audit/stats', () => {
    it('should get audit statistics', async () => {
      const res = await request(app)
        .get('/api/audit/stats')
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.totalLogs).toBeDefined();
    });
  });

  describe('POST /api/audit/report', () => {
    it('should generate audit report', async () => {
      const res = await request(app)
        .post('/api/audit/report')
        .send({})
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('should accept date range parameters', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const res = await request(app)
        .post('/api/audit/report')
        .send({
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString(),
        })
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('should accept resourceType filter', async () => {
      const res = await request(app)
        .post('/api/audit/report')
        .send({ resourceType: 'show' })
        .expect(200);

      expect(res.body).toBeDefined();
    });
  });

  describe('DELETE /api/audit/old', () => {
    it('should clear old audit logs', async () => {
      const res = await request(app)
        .delete('/api/audit/old')
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.deletedCount).toBeDefined();
    });

    it('should respect custom retention policy', async () => {
      const res = await request(app)
        .delete('/api/audit/old?daysToKeep=30')
        .expect(200);

      expect(res.body).toBeDefined();
    });
  });

  describe('DELETE /api/audit/:id', () => {
    it('should delete single audit log', async () => {
      const log = await auditService.log({
        userId: testUserId,
        organizationId: testOrgId,
        action: 'create',
        resourceType: 'show',
        status: 'success',
      });

      const res = await request(app)
        .delete(`/api/audit/${log.id}`)
        .expect(200);

      expect(res.body.message).toBeDefined();
    });

    it('should return 404 when deleting non-existent log', async () => {
      await request(app)
        .delete(`/api/audit/${uuid()}`)
        .expect(404);
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      // Mock service error
      const spy = vi
        .spyOn(auditService, 'getAuditLog')
        .mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .get('/api/audit')
        .expect(500);

      expect(res.body.error).toBeDefined();
      expect(res.body.message).toBeDefined();

      spy.mockRestore();
    });
  });
});
