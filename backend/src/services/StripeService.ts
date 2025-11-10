import { Logger } from 'pino';
import Stripe from 'stripe';

export interface PaymentRequest {
  amount: number; // in cents
  currency: string;
  customerId?: string;
  paymentMethodId?: string;
  description?: string;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
}

export interface CreateCustomerRequest {
  email: string;
  name: string;
  phone?: string;
  address?: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface TransferRequest {
  amount: number; // in cents
  currency: string;
  destination: string; // Connected account ID
  sourceTransaction?: string;
  description?: string;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
}

export interface RefundRequest {
  paymentIntentId: string;
  amount?: number; // partial refund
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata?: Record<string, any>;
}

export interface PaymentMethodRequest {
  type: 'card' | 'bank_account';
  card?: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
  billing_details?: {
    name: string;
    email: string;
    address: {
      line1: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
}

export interface SettlementTransfer {
  paymentIntentId: string;
  artistAmount: number;
  agencyAmount: number;
  platformFee: number;
  artistAccountId: string;
  agencyAccountId: string;
  showId: string;
  metadata?: Record<string, any>;
}

export class StripeService {
  private stripe: Stripe;

  constructor(
    private logger: Logger,
    apiKey?: string
  ) {
    const key = apiKey || process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
    this.stripe = new Stripe(key);
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(request: PaymentRequest): Promise<Stripe.PaymentIntent> {
    try {
      const params: Stripe.PaymentIntentCreateParams = {
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        metadata: request.metadata,
      };

      if (request.customerId) {
        params.customer = request.customerId;
      }

      if (request.paymentMethodId) {
        params.payment_method = request.paymentMethodId;
        params.confirm = true;
      }

      const paymentIntent = await this.stripe.paymentIntents.create(params);

      this.logger.info(
        {
          paymentIntentId: paymentIntent.id,
          amount: request.amount,
          currency: request.currency,
          status: paymentIntent.status,
        },
        'Payment intent created'
      );

      return paymentIntent;
    } catch (error) {
      this.logger.error({ request, error }, 'Payment intent creation failed');
      throw new Error(
        `Payment intent creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPayment(paymentIntentId: string, paymentMethodId?: string): Promise<Stripe.PaymentIntent> {
    try {
      const params: Stripe.PaymentIntentConfirmParams = {};

      if (paymentMethodId) {
        params.payment_method = paymentMethodId;
      }

      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, params);

      this.logger.info(
        { paymentIntentId, status: paymentIntent.status },
        'Payment confirmed'
      );

      return paymentIntent;
    } catch (error) {
      this.logger.error({ paymentIntentId, error }, 'Payment confirmation failed');
      throw new Error(`Payment confirmation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve a payment intent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      this.logger.info({ paymentIntentId, status: paymentIntent.status }, 'Payment intent retrieved');

      return paymentIntent;
    } catch (error) {
      this.logger.error({ paymentIntentId, error }, 'Payment intent retrieval failed');
      throw new Error(`Payment retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List payment intents for a customer
   */
  async getCustomerPayments(customerId: string, limit = 10): Promise<Stripe.PaymentIntent[]> {
    try {
      const paymentIntents = await this.stripe.paymentIntents.list({
        customer: customerId,
        limit,
      });

      this.logger.info(
        { customerId, count: paymentIntents.data.length },
        'Customer payments retrieved'
      );

      return paymentIntents.data;
    } catch (error) {
      this.logger.error({ customerId, error }, 'Customer payments retrieval failed');
      throw new Error(`Payments retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create or retrieve a Stripe customer
   */
  async createCustomer(request: CreateCustomerRequest): Promise<Stripe.Customer> {
    try {
      const params: Stripe.CustomerCreateParams = {
        email: request.email,
        name: request.name,
      };

      if (request.phone) {
        params.phone = request.phone;
      }

      if (request.address) {
        params.address = {
          line1: request.address.line1,
          city: request.address.city,
          state: request.address.state,
          postal_code: request.address.postal_code,
          country: request.address.country,
        };
      }

      const customer = await this.stripe.customers.create(params);

      this.logger.info({ customerId: customer.id, email: request.email }, 'Stripe customer created');

      return customer;
    } catch (error) {
      this.logger.error({ request, error }, 'Customer creation failed');
      throw new Error(`Customer creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a customer
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);

      this.logger.info({ customerId }, 'Customer retrieved');

      return customer as Stripe.Customer;
    } catch (error) {
      this.logger.error({ customerId, error }, 'Customer retrieval failed');
      throw new Error(`Customer retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a connected account for artist/agency
   */
  async createConnectedAccount(email: string, accountType: 'artist' | 'agency'): Promise<Stripe.Account> {
    try {
      const account = await this.stripe.accounts.create({
        type: 'express',
        email,
        business_type: accountType === 'artist' ? 'individual' : 'company',
        country: 'US', // Configurable
        capabilities: {
          transfers: { requested: true },
        },
      });

      this.logger.info(
        { accountId: account.id, email, accountType },
        'Connected account created'
      );

      return account;
    } catch (error) {
      this.logger.error({ email, accountType, error }, 'Connected account creation failed');
      throw new Error(
        `Connected account creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Transfer funds to a connected account
   */
  async transferToAccount(request: TransferRequest): Promise<Stripe.Transfer> {
    try {
      const params: Stripe.TransferCreateParams = {
        amount: request.amount,
        currency: request.currency,
        destination: request.destination,
        description: request.description,
        metadata: request.metadata,
      };

      if (request.sourceTransaction) {
        params.source_transaction = request.sourceTransaction;
      }

      const transfer = await this.stripe.transfers.create(params);

      this.logger.info(
        {
          transferId: transfer.id,
          amount: request.amount,
          destination: request.destination,
        },
        'Transfer created'
      );

      return transfer;
    } catch (error) {
      this.logger.error({ request, error }, 'Transfer creation failed');
      throw new Error(`Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a refund
   */
  async createRefund(request: RefundRequest): Promise<Stripe.Refund> {
    try {
      const params: Stripe.RefundCreateParams = {
        payment_intent: request.paymentIntentId,
        reason: request.reason,
        metadata: request.metadata,
      };

      if (request.amount) {
        params.amount = request.amount;
      }

      const refund = await this.stripe.refunds.create(params);

      this.logger.info(
        {
          refundId: refund.id,
          paymentIntentId: request.paymentIntentId,
          amount: refund.amount,
          status: refund.status,
        },
        'Refund created'
      );

      return refund;
    } catch (error) {
      this.logger.error({ request, error }, 'Refund creation failed');
      throw new Error(`Refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle a settlement with transfers to artist and agency
   * This handles the actual money distribution
   */
  async handleSettlement(request: SettlementTransfer): Promise<{
    paymentIntentId: string;
    artistTransfer: Stripe.Transfer;
    agencyTransfer: Stripe.Transfer;
    totalTransferred: number;
  }> {
    try {
      const idempotencyBase = `settlement-${request.paymentIntentId}-${request.showId}`;

      // Transfer to artist
      const artistTransfer = await this.transferToAccount({
        amount: request.artistAmount,
        currency: 'USD',
        destination: request.artistAccountId,
        sourceTransaction: request.paymentIntentId,
        description: `Artist payment for show ${request.showId}`,
        metadata: {
          showId: request.showId,
          type: 'artist_payout',
        },
        idempotencyKey: `${idempotencyBase}-artist`,
      });

      // Transfer to agency
      const agencyTransfer = await this.transferToAccount({
        amount: request.agencyAmount,
        currency: 'USD',
        destination: request.agencyAccountId,
        sourceTransaction: request.paymentIntentId,
        description: `Agency payment for show ${request.showId}`,
        metadata: {
          showId: request.showId,
          type: 'agency_payout',
        },
        idempotencyKey: `${idempotencyBase}-agency`,
      });

      this.logger.info(
        {
          paymentIntentId: request.paymentIntentId,
          artistAmount: request.artistAmount,
          agencyAmount: request.agencyAmount,
          platformFee: request.platformFee,
          totalTransferred: request.artistAmount + request.agencyAmount,
        },
        'Settlement completed'
      );

      return {
        paymentIntentId: request.paymentIntentId,
        artistTransfer,
        agencyTransfer,
        totalTransferred: request.artistAmount + request.agencyAmount,
      };
    } catch (error) {
      this.logger.error({ request, error }, 'Settlement failed');
      throw new Error(`Settlement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get balance
   */
  async getBalance(): Promise<Stripe.Balance> {
    try {
      const balance = await this.stripe.balance.retrieve();

      this.logger.info(
        {
          available: balance.available.length > 0 ? balance.available[0].amount : 0,
          pending: balance.pending.length > 0 ? balance.pending[0].amount : 0,
        },
        'Balance retrieved'
      );

      return balance;
    } catch (error) {
      this.logger.error({ error }, 'Balance retrieval failed');
      throw new Error(`Balance retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List transactions
   */
  async getTransactions(limit = 10): Promise<Stripe.BalanceTransaction[]> {
    try {
      const transactions = await this.stripe.balanceTransactions.list({ limit });

      this.logger.info({ count: transactions.data.length }, 'Transactions retrieved');

      return transactions.data;
    } catch (error) {
      this.logger.error({ error }, 'Transactions retrieval failed');
      throw new Error(`Transactions retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mock mode: For testing without real Stripe credentials
   */
  async createPaymentIntentMock(request: PaymentRequest): Promise<any> {
    this.logger.info({ request }, 'Creating payment intent in MOCK mode');

    return {
      id: `pi_mock_${Date.now()}`,
      object: 'payment_intent',
      amount: request.amount,
      amount_capturable: 0,
      amount_details: { tip: {} },
      amount_received: request.amount,
      application: null,
      application_fee_amount: null,
      canceled_at: null,
      cancellation_reason: null,
      capture_method: 'automatic',
      charges: {
        object: 'list',
        data: [
          {
            id: `ch_mock_${Date.now()}`,
            object: 'charge',
            amount: request.amount,
            paid: true,
            status: 'succeeded',
          },
        ],
        has_more: false,
        url: '/v1/charges',
      },
      client_secret: `pi_mock_${Date.now()}_secret_mock`,
      confirmation_method: 'automatic',
      created: Math.floor(Date.now() / 1000),
      currency: request.currency,
      customer: request.customerId || null,
      description: request.description,
      livemode: false,
      metadata: request.metadata || {},
      next_action: null,
      on_behalf_of: null,
      payment_method: request.paymentMethodId || null,
      payment_method_options: {},
      payment_method_types: ['card'],
      processing: null,
      receipt_email: null,
      review: null,
      setup_future_usage: null,
      shipping: null,
      statement_descriptor: null,
      statement_descriptor_suffix: null,
      status: 'succeeded',
      transfer_data: null,
      transfer_group: null,
    };
  }
}
