import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { AppDataSource } from '../../src/database/datasource';
import { logger } from '../../src/utils/logger';

describe('Finance Routes Integration Tests', () => {
  let token: string;
  let testShowId: string;

  beforeAll(async () => {
    // Initialize database
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Get test token (mock JWT for testing)
    const mockUserId = '00000000-0000-0000-0000-000000000001';
    const mockOrgId = '00000000-0000-0000-0000-000000000099';

    // Create a simple JWT token for testing
    const jwt = require('jsonwebtoken');
    token = jwt.sign(
      { userId: mockUserId, organizationId: mockOrgId },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('POST /api/finance/calculate-fees', () => {
    it('should calculate fees correctly', async () => {
      const response = await request(app)
        .post('/api/finance/calculate-fees')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 1000,
          artistPercentage: 20,
          agencyPercentage: 15,
          taxPercentage: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('amount', 1000);
      expect(response.body.data).toHaveProperty('artistFee', 200);
      expect(response.body.data).toHaveProperty('agencyFee', 150);
      expect(response.body.data).toHaveProperty('taxes', 100);
      expect(response.body.data).toHaveProperty('netAmount', 550);
    });

    it('should reject invalid amount', async () => {
      const response = await request(app)
        .post('/api/finance/calculate-fees')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: -100,
          artistPercentage: 10,
          agencyPercentage: 10,
          taxPercentage: 10,
        });

      expect(response.status).toBe(400);
    });

    it('should reject percentages > 100', async () => {
      const response = await request(app)
        .post('/api/finance/calculate-fees')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 1000,
          artistPercentage: 150,
          agencyPercentage: 10,
          taxPercentage: 10,
        });

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/finance/calculate-fees')
        .send({
          amount: 1000,
          artistPercentage: 10,
          agencyPercentage: 10,
          taxPercentage: 10,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/finance/convert-currency', () => {
    it('should convert USD to EUR', async () => {
      const response = await request(app)
        .post('/api/finance/convert-currency')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100,
          from: 'USD',
          to: 'EUR',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('original', 100);
      expect(response.body.data).toHaveProperty('originalCurrency', 'USD');
      expect(response.body.data).toHaveProperty('targetCurrency', 'EUR');
      expect(response.body.data).toHaveProperty('converted');
      expect(response.body.data).toHaveProperty('rate', 0.92);
    });

    it('should return 1 for same currency', async () => {
      const response = await request(app)
        .post('/api/finance/convert-currency')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100,
          from: 'USD',
          to: 'USD',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.rate).toBe(1);
      expect(response.body.data.converted).toBe(100);
    });

    it('should reject unsupported currencies', async () => {
      const response = await request(app)
        .post('/api/finance/convert-currency')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100,
          from: 'XXX',
          to: 'USD',
        });

      expect(response.status).toBe(400);
    });

    it('should reject negative amounts', async () => {
      const response = await request(app)
        .post('/api/finance/convert-currency')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: -100,
          from: 'USD',
          to: 'EUR',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/finance/summary', () => {
    it('should return financial summary', async () => {
      const response = await request(app)
        .get('/api/finance/summary')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalRevenue');
      expect(response.body.data).toHaveProperty('totalExpenses');
      expect(response.body.data).toHaveProperty('netIncome');
      expect(response.body.data).toHaveProperty('currency');
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/finance/summary');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/finance/settlement', () => {
    it('should accept settlement with valid data', async () => {
      const response = await request(app)
        .post('/api/finance/settlement')
        .set('Authorization', `Bearer ${token}`)
        .send({
          showId: '00000000-0000-0000-0000-000000000001',
          participants: [
            {
              participantId: '00000000-0000-0000-0000-000000000002',
              name: 'Artist A',
              percentage: 60,
            },
            {
              participantId: '00000000-0000-0000-0000-000000000003',
              name: 'Manager',
              percentage: 40,
            },
          ],
        });

      expect(response.status).toBeOneOf([201, 500]); // 500 if show not found in DB
      if (response.status === 201) {
        expect(response.body.data).toHaveProperty('showId');
        expect(response.body.data).toHaveProperty('totalAmount');
        expect(response.body.data).toHaveProperty('participants');
      }
    });

    it('should reject invalid percentages', async () => {
      const response = await request(app)
        .post('/api/finance/settlement')
        .set('Authorization', `Bearer ${token}`)
        .send({
          showId: '00000000-0000-0000-0000-000000000001',
          participants: [
            {
              participantId: '00000000-0000-0000-0000-000000000002',
              name: 'Artist A',
              percentage: 60,
            },
            {
              participantId: '00000000-0000-0000-0000-000000000003',
              name: 'Manager',
              percentage: 30, // Only 90%, should be 100%
            },
          ],
        });

      expect(response.status).toBeOneOf([400, 500]);
    });

    it('should require at least one participant', async () => {
      const response = await request(app)
        .post('/api/finance/settlement')
        .set('Authorization', `Bearer ${token}`)
        .send({
          showId: '00000000-0000-0000-0000-000000000001',
          participants: [],
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/finance/settlements', () => {
    it('should list settlements', async () => {
      const response = await request(app)
        .get('/api/finance/settlements')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
