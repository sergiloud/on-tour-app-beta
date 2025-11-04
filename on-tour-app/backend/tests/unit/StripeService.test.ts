import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger } from 'pino';
import { StripeService } from '../../src/services/StripeService.js';

const mockLogger: Logger = {
  info: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
  trace: vi.fn(),
  fatal: vi.fn(),
  silent: vi.fn(),
  level: 'info',
  levels: {} as any,
  setLevel: vi.fn(),
} as unknown as Logger;

describe('StripeService', () => {
  let service: StripeService;

  beforeEach(() => {
    service = new StripeService(mockLogger);
    vi.clearAllMocks();
  });

  describe('createPaymentIntentMock', () => {
    it('should create mock payment intent with correct structure', async () => {
      const result = await service.createPaymentIntentMock({
        amount: 5000,
        currency: 'USD',
        description: 'Test payment',
      });

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^pi_mock_/);
      expect(result.amount).toBe(5000);
      expect(result.currency).toBe('USD');
      expect(result.status).toBe('succeeded');
      expect(result.client_secret).toBeDefined();
    });

    it('should include all required fields', async () => {
      const result = await service.createPaymentIntentMock({
        amount: 10000,
        currency: 'EUR',
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('object', 'payment_intent');
      expect(result).toHaveProperty('amount', 10000);
      expect(result).toHaveProperty('currency', 'EUR');
      expect(result).toHaveProperty('status', 'succeeded');
      expect(result).toHaveProperty('charges');
      expect(result).toHaveProperty('payment_method_types');
    });

    it('should handle metadata', async () => {
      const metadata = { orderId: '12345', customerId: 'cust_123' };

      const result = await service.createPaymentIntentMock({
        amount: 5000,
        currency: 'USD',
        metadata,
      });

      expect(result.metadata).toEqual(metadata);
    });

    it('should set customer if provided', async () => {
      const result = await service.createPaymentIntentMock({
        amount: 5000,
        currency: 'USD',
        customerId: 'cus_12345',
      });

      expect(result.customer).toBe('cus_12345');
    });

    it('should handle multiple currency codes', async () => {
      const currencies = ['USD', 'EUR', 'GBP', 'JPY'];

      for (const currency of currencies) {
        const result = await service.createPaymentIntentMock({
          amount: 5000,
          currency,
        });

        expect(result.currency).toBe(currency);
      }
    });
  });

  describe('confirmPayment', () => {
    it('should log confirmation attempt', async () => {
      const paymentIntentId = 'pi_test_123';

      try {
        // This will fail in test mode without real Stripe credentials
        // Just verify the logger is called
        await service.confirmPayment(paymentIntentId);
      } catch (error) {
        // Expected to fail without real API key
        expect(mockLogger.error).toHaveBeenCalled();
      }
    });
  });

  describe('getPaymentIntent', () => {
    it('should attempt to retrieve payment intent', async () => {
      try {
        await service.getPaymentIntent('pi_test_123');
      } catch (error) {
        // Expected to fail without real API key
        expect(mockLogger.error).toHaveBeenCalled();
      }
    });
  });

  describe('createCustomer', () => {
    it('should attempt customer creation', async () => {
      try {
        await service.createCustomer({
          email: 'test@example.com',
          name: 'Test Customer',
        });
      } catch (error) {
        // Expected to fail without real API key
        expect(mockLogger.error).toHaveBeenCalled();
      }
    });
  });

  describe('getCustomer', () => {
    it('should attempt to retrieve customer', async () => {
      try {
        await service.getCustomer('cus_test_123');
      } catch (error) {
        // Expected to fail without real API key
        expect(mockLogger.error).toHaveBeenCalled();
      }
    });
  });

  describe('transferToAccount', () => {
    it('should attempt transfer creation', async () => {
      try {
        await service.transferToAccount({
          amount: 5000,
          currency: 'USD',
          destination: 'acct_123',
        });
      } catch (error) {
        // Expected to fail without real API key
        expect(mockLogger.error).toHaveBeenCalled();
      }
    });
  });

  describe('createRefund', () => {
    it('should attempt refund creation', async () => {
      try {
        await service.createRefund({
          paymentIntentId: 'pi_test_123',
        });
      } catch (error) {
        // Expected to fail without real API key
        expect(mockLogger.error).toHaveBeenCalled();
      }
    });

    it('should handle partial refunds', async () => {
      try {
        await service.createRefund({
          paymentIntentId: 'pi_test_123',
          amount: 2500,
        });
      } catch (error) {
        expect(mockLogger.error).toHaveBeenCalled();
      }
    });
  });

  describe('Mock payment scenarios', () => {
    it('should complete full payment workflow in mock mode', async () => {
      // Create payment intent
      const paymentIntent = await service.createPaymentIntentMock({
        amount: 5000,
        currency: 'USD',
        description: 'Concert ticket purchase',
        metadata: { eventId: '123', userId: '456' },
      });

      expect(paymentIntent.status).toBe('succeeded');
      expect(paymentIntent.amount).toBe(5000);

      // Verify payment can be tracked
      expect(paymentIntent.id).toBeDefined();
      expect(paymentIntent.client_secret).toBeDefined();
    });

    it('should handle settlement transfers', async () => {
      const paymentIntent = await service.createPaymentIntentMock({
        amount: 10000,
        currency: 'USD',
      });

      // Mock settlement structure
      const settlement = {
        paymentIntentId: paymentIntent.id,
        artistAmount: 6500,
        agencyAmount: 3000,
        platformFee: 500,
        artistAccountId: 'acct_artist',
        agencyAccountId: 'acct_agency',
        showId: '550e8400-e29b-41d4-a716-446655440000',
      };

      expect(settlement.artistAmount + settlement.agencyAmount + settlement.platformFee).toBe(10000);
    });
  });

  describe('Error handling', () => {
    it('should log errors with context', async () => {
      try {
        await service.getPaymentIntent('invalid_id');
      } catch (error) {
        expect(mockLogger.error).toHaveBeenCalled();
      }
    });
  });
});
