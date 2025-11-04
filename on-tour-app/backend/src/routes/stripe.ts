import { Router, Request, Response } from 'express';
import { Logger } from 'pino';
import { StripeService } from '../services/StripeService.js';
import {
  PaymentRequestSchema,
  CreateCustomerSchema,
  TransferRequestSchema,
  RefundRequestSchema,
  SettlementTransferSchema,
} from '../schemas/integrations.schemas.js';
import { authMiddleware } from '../middleware/auth.js';

export function createStripeRouter(logger: Logger): Router {
  const router = Router();
  const stripeService = new StripeService(logger);

  /**
   * POST /api/stripe/payment-intent
   * Create a payment intent
   */
  router.post('/payment-intent', authMiddleware, async (req: Request, res: Response) => {
    try {
      const validated = PaymentRequestSchema.parse(req.body);

      const useMock = process.env.STRIPE_MOCK === 'true' || !process.env.STRIPE_SECRET_KEY;

      let paymentIntent;
      if (useMock) {
        paymentIntent = await stripeService.createPaymentIntentMock(validated);
      } else {
        paymentIntent = await stripeService.createPaymentIntent(validated);
      }

      res.json({
        success: true,
        data: paymentIntent,
        clientSecret: (paymentIntent as any).client_secret,
      });
    } catch (error) {
      logger.error({ error, body: req.body }, 'Payment intent creation failed');

      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid payment details',
          details: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Payment intent creation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/stripe/confirm-payment
   * Confirm a payment
   */
  router.post('/confirm-payment', authMiddleware, async (req: Request, res: Response) => {
    try {
      const { paymentIntentId, paymentMethodId } = req.body;

      if (!paymentIntentId || typeof paymentIntentId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Payment intent ID is required',
        });
      }

      const useMock = process.env.STRIPE_MOCK === 'true' || !process.env.STRIPE_SECRET_KEY;

      let paymentIntent;
      if (useMock) {
        paymentIntent = {
          id: paymentIntentId,
          status: 'succeeded',
          amount: 5000,
          currency: 'USD',
          client_secret: `${paymentIntentId}_secret`,
        };
      } else {
        paymentIntent = await stripeService.confirmPayment(paymentIntentId, paymentMethodId);
      }

      res.json({
        success: true,
        data: paymentIntent,
        status: (paymentIntent as any).status,
      });
    } catch (error) {
      logger.error({ error, body: req.body }, 'Payment confirmation failed');

      res.status(500).json({
        success: false,
        error: 'Payment confirmation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/stripe/payment-intent/:paymentIntentId
   * Get payment intent details
   */
  router.get('/payment-intent/:paymentIntentId', authMiddleware, async (req: Request, res: Response) => {
    try {
      const { paymentIntentId } = req.params;

      const useMock = process.env.STRIPE_MOCK === 'true' || !process.env.STRIPE_SECRET_KEY;

      let paymentIntent;
      if (useMock) {
        paymentIntent = {
          id: paymentIntentId,
          status: 'succeeded',
          amount: 5000,
          currency: 'USD',
        };
      } else {
        paymentIntent = await stripeService.getPaymentIntent(paymentIntentId);
      }

      res.json({
        success: true,
        data: paymentIntent,
      });
    } catch (error) {
      logger.error({ error, paymentIntentId: req.params.paymentIntentId }, 'Payment intent retrieval failed');

      res.status(500).json({
        success: false,
        error: 'Payment intent retrieval failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/stripe/customer
   * Create a customer
   */
  router.post('/customer', authMiddleware, async (req: Request, res: Response) => {
    try {
      const validated = CreateCustomerSchema.parse(req.body);

      const useMock = process.env.STRIPE_MOCK === 'true' || !process.env.STRIPE_SECRET_KEY;

      let customer;
      if (useMock) {
        customer = {
          id: `cus_mock_${Date.now()}`,
          object: 'customer',
          email: validated.email,
          name: validated.name,
          phone: validated.phone,
        };
      } else {
        customer = await stripeService.createCustomer(validated);
      }

      res.json({
        success: true,
        data: customer,
      });
    } catch (error) {
      logger.error({ error, body: req.body }, 'Customer creation failed');

      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid customer details',
          details: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Customer creation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/stripe/customer/:customerId
   * Get customer details
   */
  router.get('/customer/:customerId', authMiddleware, async (req: Request, res: Response) => {
    try {
      const { customerId } = req.params;

      const useMock = process.env.STRIPE_MOCK === 'true' || !process.env.STRIPE_SECRET_KEY;

      let customer;
      if (useMock) {
        customer = {
          id: customerId,
          object: 'customer',
          email: 'customer@example.com',
          name: 'Customer Name',
        };
      } else {
        customer = await stripeService.getCustomer(customerId);
      }

      res.json({
        success: true,
        data: customer,
      });
    } catch (error) {
      logger.error({ error, customerId: req.params.customerId }, 'Customer retrieval failed');

      res.status(500).json({
        success: false,
        error: 'Customer retrieval failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/stripe/transfer
   * Transfer funds to an account
   */
  router.post('/transfer', authMiddleware, async (req: Request, res: Response) => {
    try {
      const validated = TransferRequestSchema.parse(req.body);

      const useMock = process.env.STRIPE_MOCK === 'true' || !process.env.STRIPE_SECRET_KEY;

      let transfer;
      if (useMock) {
        transfer = {
          id: `tr_mock_${Date.now()}`,
          object: 'transfer',
          amount: validated.amount,
          currency: validated.currency,
          destination: validated.destination,
          status: 'succeeded',
        };
      } else {
        transfer = await stripeService.transferToAccount(validated);
      }

      res.json({
        success: true,
        data: transfer,
      });
    } catch (error) {
      logger.error({ error, body: req.body }, 'Transfer creation failed');

      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid transfer details',
          details: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Transfer creation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/stripe/refund
   * Create a refund
   */
  router.post('/refund', authMiddleware, async (req: Request, res: Response) => {
    try {
      const validated = RefundRequestSchema.parse(req.body);

      const useMock = process.env.STRIPE_MOCK === 'true' || !process.env.STRIPE_SECRET_KEY;

      let refund;
      if (useMock) {
        refund = {
          id: `re_mock_${Date.now()}`,
          object: 'refund',
          payment_intent: validated.paymentIntentId,
          amount: validated.amount || 5000,
          status: 'succeeded',
        };
      } else {
        refund = await stripeService.createRefund(validated);
      }

      res.json({
        success: true,
        data: refund,
      });
    } catch (error) {
      logger.error({ error, body: req.body }, 'Refund creation failed');

      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid refund details',
          details: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Refund creation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/stripe/settlement
   * Handle settlement with transfers to multiple parties
   */
  router.post('/settlement', authMiddleware, async (req: Request, res: Response) => {
    try {
      const validated = SettlementTransferSchema.parse(req.body);

      const useMock = process.env.STRIPE_MOCK === 'true' || !process.env.STRIPE_SECRET_KEY;

      let settlement;
      if (useMock) {
        settlement = {
          paymentIntentId: validated.paymentIntentId,
          artistTransfer: {
            id: `tr_mock_artist_${Date.now()}`,
            amount: validated.artistAmount,
            status: 'succeeded',
          },
          agencyTransfer: {
            id: `tr_mock_agency_${Date.now()}`,
            amount: validated.agencyAmount,
            status: 'succeeded',
          },
          totalTransferred: validated.artistAmount + validated.agencyAmount,
        };
      } else {
        settlement = await stripeService.handleSettlement(validated);
      }

      res.json({
        success: true,
        data: settlement,
        message: 'Settlement processed successfully',
      });
    } catch (error) {
      logger.error({ error, body: req.body }, 'Settlement failed');

      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid settlement details',
          details: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Settlement failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/stripe/balance
   * Get Stripe balance
   */
  router.get('/balance', authMiddleware, async (req: Request, res: Response) => {
    try {
      const useMock = process.env.STRIPE_MOCK === 'true' || !process.env.STRIPE_SECRET_KEY;

      let balance;
      if (useMock) {
        balance = {
          object: 'balance',
          available: [{ currency: 'USD', amount: 500000 }],
          pending: [{ currency: 'USD', amount: 250000 }],
          livemode: false,
        };
      } else {
        balance = await stripeService.getBalance();
      }

      res.json({
        success: true,
        data: balance,
      });
    } catch (error) {
      logger.error({ error }, 'Balance retrieval failed');

      res.status(500).json({
        success: false,
        error: 'Balance retrieval failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}
