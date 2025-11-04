import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/index.js';
import { AppDataSource } from '../../src/database/datasource.js';
import { Show } from '../../src/database/entities/Show.js';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

let showRepository: any;
let testShow: Show;
const testOrgId = 'org-test-123';
const testUserId = 'user-test-456';

// Generate test JWT token
function generateTestToken(orgId: string) {
  return jwt.sign(
    { orgId, userId: testUserId },
    process.env.JWT_SECRET || 'dev-secret-change-in-production',
    { expiresIn: '24h' }
  );
}

describe('Shows API Integration Tests', () => {
  beforeAll(async () => {
    // Initialize database
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      await AppDataSource.runMigrations();
    }
    showRepository = AppDataSource.getRepository(Show);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Clear all shows before each test
    await showRepository.clear();
  });

  describe('GET /api/shows', () => {
    it('should list all shows for organization', async () => {
      // Create test shows
      const show1 = showRepository.create({
        id: uuidv4(),
        title: 'Show 1',
        description: 'Test show 1',
        status: 'draft',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-15'),
        type: 'concert',
        location: 'New York',
        capacity: 1000,
        budget: 10000,
        currency: 'USD',
        organizationId: testOrgId,
        createdBy: testUserId,
      });

      await showRepository.save(show1);

      const token = generateTestToken(testOrgId);

      const res = await request(app)
        .get('/api/shows')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Show 1');
    });

    it('should support pagination', async () => {
      const token = generateTestToken(testOrgId);

      const res = await request(app)
        .get('/api/shows?skip=0&take=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .get('/api/shows')
        .expect(401);
    });
  });

  describe('POST /api/shows', () => {
    it('should create a new show', async () => {
      const token = generateTestToken(testOrgId);

      const newShow = {
        title: 'New Summer Festival',
        description: 'Annual summer event',
        status: 'draft',
        startDate: '2025-07-01',
        endDate: '2025-07-31',
        type: 'festival',
        location: 'Central Park',
        capacity: 5000,
        budget: 50000,
        currency: 'USD',
      };

      const res = await request(app)
        .post('/api/shows')
        .set('Authorization', `Bearer ${token}`)
        .send(newShow)
        .expect(201);

      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe(newShow.title);
      expect(res.body.data.organizationId).toBe(testOrgId);
    });

    it('should validate required fields', async () => {
      const token = generateTestToken(testOrgId);

      const invalidShow = {
        title: '', // Empty title
        description: 'Test',
        status: 'draft',
        startDate: '2025-07-01',
        endDate: '2025-07-31',
        type: 'festival',
        location: 'Test',
        capacity: 100,
        budget: 1000,
        currency: 'USD',
      };

      const res = await request(app)
        .post('/api/shows')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidShow)
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    it('should return 401 without auth', async () => {
      await request(app)
        .post('/api/shows')
        .send({
          title: 'Test',
          description: 'Test',
          status: 'draft',
          startDate: '2025-07-01',
          endDate: '2025-07-31',
          type: 'test',
          location: 'Test',
          capacity: 100,
          budget: 1000,
          currency: 'USD',
        })
        .expect(401);
    });
  });

  describe('GET /api/shows/:id', () => {
    beforeEach(async () => {
      const show = showRepository.create({
        id: uuidv4(),
        title: 'Test Show',
        description: 'Test description',
        status: 'active',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-15'),
        type: 'concert',
        location: 'New York',
        capacity: 1000,
        budget: 10000,
        currency: 'USD',
        organizationId: testOrgId,
        createdBy: testUserId,
      });

      testShow = await showRepository.save(show);
    });

    it('should get a show by id', async () => {
      const token = generateTestToken(testOrgId);

      const res = await request(app)
        .get(`/api/shows/${testShow.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.id).toBe(testShow.id);
      expect(res.body.data.title).toBe('Test Show');
    });

    it('should return 404 for non-existent show', async () => {
      const token = generateTestToken(testOrgId);

      await request(app)
        .get(`/api/shows/${uuidv4()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PUT /api/shows/:id', () => {
    beforeEach(async () => {
      const show = showRepository.create({
        id: uuidv4(),
        title: 'Original Title',
        description: 'Original description',
        status: 'draft',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-15'),
        type: 'concert',
        location: 'New York',
        capacity: 1000,
        budget: 10000,
        currency: 'USD',
        organizationId: testOrgId,
        createdBy: testUserId,
      });

      testShow = await showRepository.save(show);
    });

    it('should update a show', async () => {
      const token = generateTestToken(testOrgId);

      const updates = {
        title: 'Updated Title',
        status: 'scheduled',
      };

      const res = await request(app)
        .put(`/api/shows/${testShow.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates)
        .expect(200);

      expect(res.body.data.title).toBe('Updated Title');
      expect(res.body.data.status).toBe('scheduled');
    });

    it('should return 404 for non-existent show', async () => {
      const token = generateTestToken(testOrgId);

      await request(app)
        .put(`/api/shows/${uuidv4()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New Title' })
        .expect(404);
    });
  });

  describe('DELETE /api/shows/:id', () => {
    beforeEach(async () => {
      const show = showRepository.create({
        id: uuidv4(),
        title: 'Show to Delete',
        description: 'Will be deleted',
        status: 'draft',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-15'),
        type: 'concert',
        location: 'New York',
        capacity: 1000,
        budget: 10000,
        currency: 'USD',
        organizationId: testOrgId,
        createdBy: testUserId,
      });

      testShow = await showRepository.save(show);
    });

    it('should delete a show', async () => {
      const token = generateTestToken(testOrgId);

      const res = await request(app)
        .delete(`/api/shows/${testShow.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.message).toContain('successfully');

      // Verify it's deleted
      const deleted = await showRepository.findOne({ where: { id: testShow.id } });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent show', async () => {
      const token = generateTestToken(testOrgId);

      await request(app)
        .delete(`/api/shows/${uuidv4()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
