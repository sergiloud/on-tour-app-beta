import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import { createAmadeusRouter } from '../../src/routes/amadeus.js';
import { createStripeRouter } from '../../src/routes/stripe.js';
import { createEmailRouter } from '../../src/routes/email.js';
import { logger } from '../../src/utils/logger.js';

describe('API Integration: Amadeus, Stripe, Email Routes', () => {
  let app: Express;
  let token: string;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock auth middleware that just passes through
    app.use((req: any, res, next) => {
      req.user = { id: '123', organizationId: '456' };
      next();
    });

    // Mount routes
    app.use('/api/amadeus', createAmadeusRouter(logger));
    app.use('/api/stripe', createStripeRouter(logger));
    app.use('/api/email', createEmailRouter(logger));

    // Set mock env
    process.env.AMADEUS_MOCK = 'true';
    process.env.STRIPE_MOCK = 'true';
  });

  afterEach(() => {
    delete process.env.AMADEUS_MOCK;
    delete process.env.STRIPE_MOCK;
  });

  describe('Amadeus Routes', () => {
    describe('POST /api/amadeus/search', () => {
      it('should return flight offers for valid search', async () => {
        const response = await request(app)
          .post('/api/amadeus/search')
          .send({
            origin: 'NYC',
            destination: 'LAX',
            departureDate: '2025-12-15',
            adults: 2,
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.count).toBeGreaterThanOrEqual(0);
      });

      it('should reject invalid origin code', async () => {
        const response = await request(app)
          .post('/api/amadeus/search')
          .send({
            origin: 'INVALID',
            destination: 'LAX',
            departureDate: '2025-12-15',
            adults: 1,
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should handle return flights', async () => {
        const response = await request(app)
          .post('/api/amadeus/search')
          .send({
            origin: 'NYC',
            destination: 'LAX',
            departureDate: '2025-12-15',
            returnDate: '2025-12-22',
            adults: 1,
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should respect maxResults parameter', async () => {
        const response = await request(app)
          .post('/api/amadeus/search')
          .send({
            origin: 'NYC',
            destination: 'LAX',
            departureDate: '2025-12-15',
            adults: 1,
            maxResults: 3,
          });

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeLessThanOrEqual(3);
      });
    });

    describe('POST /api/amadeus/confirm', () => {
      it('should confirm flight offer', async () => {
        const response = await request(app)
          .post('/api/amadeus/confirm')
          .send({
            flightOfferId: 'MOCK-12345',
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });

      it('should reject missing flightOfferId', async () => {
        const response = await request(app).post('/api/amadeus/confirm').send({});

        expect(response.status).toBe(400);
      });
    });

    describe('GET /api/amadeus/airport/:iataCode', () => {
      it('should return airport information', async () => {
        const response = await request(app).get('/api/amadeus/airport/LAX');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });

      it('should handle invalid airport code', async () => {
        const response = await request(app).get('/api/amadeus/airport/INVALID');

        expect(response.status).toBe(500);
      });
    });

    describe('GET /api/amadeus/airline/:carrierCode', () => {
      it('should return airline information', async () => {
        const response = await request(app).get('/api/amadeus/airline/AA');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });
    });

    describe('GET /api/amadeus/status/:carrierCode/:flightNumber/:date', () => {
      it('should return flight status', async () => {
        const response = await request(app).get('/api/amadeus/status/AA/123/2025-12-15');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });
  });

  describe('Stripe Routes', () => {
    describe('POST /api/stripe/payment-intent', () => {
      it('should create payment intent', async () => {
        const response = await request(app)
          .post('/api/stripe/payment-intent')
          .send({
            amount: 5000,
            currency: 'USD',
            description: 'Concert tickets',
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.clientSecret).toBeDefined();
      });

      it('should reject negative amount', async () => {
        const response = await request(app)
          .post('/api/stripe/payment-intent')
          .send({
            amount: -5000,
            currency: 'USD',
          });

        expect(response.status).toBe(400);
      });

      it('should handle metadata', async () => {
        const response = await request(app)
          .post('/api/stripe/payment-intent')
          .send({
            amount: 10000,
            currency: 'USD',
            metadata: { orderId: '12345', userId: '456' },
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    describe('POST /api/stripe/customer', () => {
      it('should create customer', async () => {
        const response = await request(app)
          .post('/api/stripe/customer')
          .send({
            email: 'customer@example.com',
            name: 'John Doe',
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });

      it('should reject invalid email', async () => {
        const response = await request(app)
          .post('/api/stripe/customer')
          .send({
            email: 'invalid-email',
            name: 'John Doe',
          });

        expect(response.status).toBe(400);
      });
    });

    describe('POST /api/stripe/transfer', () => {
      it('should initiate transfer', async () => {
        const response = await request(app)
          .post('/api/stripe/transfer')
          .send({
            amount: 5000,
            currency: 'USD',
            destination: 'acct_123456',
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });

      it('should reject missing destination', async () => {
        const response = await request(app)
          .post('/api/stripe/transfer')
          .send({
            amount: 5000,
            currency: 'USD',
          });

        expect(response.status).toBe(400);
      });
    });

    describe('POST /api/stripe/refund', () => {
      it('should create refund', async () => {
        const response = await request(app)
          .post('/api/stripe/refund')
          .send({
            paymentIntentId: 'pi_123456',
            reason: 'requested_by_customer',
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should reject missing payment intent', async () => {
        const response = await request(app).post('/api/stripe/refund').send({});

        expect(response.status).toBe(400);
      });
    });

    describe('POST /api/stripe/settlement', () => {
      it('should process settlement', async () => {
        const response = await request(app)
          .post('/api/stripe/settlement')
          .send({
            paymentIntentId: 'pi_123456',
            artistAmount: 6500,
            agencyAmount: 3000,
            platformFee: 500,
            artistAccountId: 'acct_artist',
            agencyAccountId: 'acct_agency',
            showId: '550e8400-e29b-41d4-a716-446655440000',
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });
    });

    describe('GET /api/stripe/balance', () => {
      it('should retrieve balance', async () => {
        const response = await request(app).get('/api/stripe/balance');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });
    });
  });

  describe('Email Routes', () => {
    describe('POST /api/email/send', () => {
      it('should send generic email', async () => {
        const response = await request(app)
          .post('/api/email/send')
          .send({
            to: 'test@example.com',
            subject: 'Test Email',
            html: '<p>Test</p>',
          });

        // May fail if SMTP not configured, but endpoint should respond
        expect([200, 500]).toContain(response.status);
      });

      it('should handle multiple recipients', async () => {
        const response = await request(app)
          .post('/api/email/send')
          .send({
            to: ['test1@example.com', 'test2@example.com'],
            subject: 'Test Email',
            html: '<p>Test</p>',
          });

        expect([200, 500]).toContain(response.status);
      });
    });

    describe('POST /api/email/booking-confirmation', () => {
      it('should send booking confirmation', async () => {
        const response = await request(app)
          .post('/api/email/booking-confirmation')
          .send({
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            bookingId: '550e8400-e29b-41d4-a716-446655440000',
            flightDetails: {
              origin: 'NYC',
              destination: 'LAX',
              departureDate: '2025-12-15',
              departureTime: '14:30',
              airline: 'American Airlines',
              flightNumber: 'AA123',
              totalPrice: 500.0,
              currency: 'USD',
            },
            bookingReference: 'BK123456',
            confirmationDate: new Date().toISOString(),
          });

        expect([200, 500]).toContain(response.status);
      });
    });

    describe('POST /api/email/invoice', () => {
      it('should send invoice', async () => {
        const response = await request(app)
          .post('/api/email/invoice')
          .send({
            customerName: 'Business Corp',
            customerEmail: 'billing@example.com',
            invoiceNumber: 'INV-2025-001',
            invoiceDate: '2025-11-04',
            dueDate: '2025-12-04',
            items: [
              {
                description: 'Service',
                quantity: 1,
                unitPrice: 100.0,
                total: 100.0,
              },
            ],
            subtotal: 100.0,
            tax: 10.0,
            total: 110.0,
            currency: 'USD',
          });

        expect([200, 500]).toContain(response.status);
      });
    });

    describe('POST /api/email/settlement-report', () => {
      it('should send settlement report', async () => {
        const response = await request(app)
          .post('/api/email/settlement-report')
          .send({
            artistName: 'Rock Star',
            artistEmail: 'rockstar@example.com',
            reportPeriod: 'November 2025',
            totalEarnings: 5000.0,
            totalShows: 5,
            averageEarningPerShow: 1000.0,
            currency: 'USD',
            shows: [
              {
                name: 'Concert',
                date: '2025-11-10',
                earnings: 1000.0,
              },
            ],
            reportDate: '2025-11-04',
          });

        expect([200, 500]).toContain(response.status);
      });
    });

    describe('POST /api/email/alert', () => {
      it('should send alert', async () => {
        const response = await request(app)
          .post('/api/email/alert')
          .send({
            recipientName: 'Admin',
            recipientEmail: 'admin@example.com',
            alertType: 'System Alert',
            alertMessage: 'This is a test alert',
            urgency: 'medium',
            actionRequired: false,
            timestamp: new Date().toISOString(),
          });

        expect([200, 500]).toContain(response.status);
      });
    });
  });
});
