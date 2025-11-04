/**
 * Stripe API Service
 * Procesamiento de pagos y gestión de pagos recurrentes
 */

import { apiClient, ApiResponse } from '../client';

export interface PaymentIntent {
  id: string;
  object: string;
  amount: number;
  amount_capturable: number;
  amount_received: number;
  charges: {
    object: string;
    data: Charge[];
    has_more: boolean;
    url: string;
  };
  client_secret: string;
  confirmation_method: string;
  created: number;
  currency: string;
  customer?: string;
  description?: string;
  flow_directions?: string[];
  livemode: boolean;
  next_action?: {
    type: string;
    use_stripe_sdk?: Record<string, any>;
    redirect_to_url?: {
      return_url: string;
      url: string;
    };
  };
  payment_method?: string;
  payment_method_types: string[];
  receipt_email?: string;
  setup_future_usage?: string;
  statement_descriptor?: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
}

export interface Charge {
  id: string;
  object: string;
  amount: number;
  amount_captured: number;
  amount_refunded: number;
  balance_transaction: string;
  billing_details: {
    address: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
    email?: string;
    name?: string;
    phone?: string;
  };
  captured: boolean;
  created: number;
  currency: string;
  customer?: string;
  description?: string;
  destination?: string;
  dispute?: string;
  disputed: boolean;
  failure_code?: string;
  failure_message?: string;
  fraud_details?: any;
  livemode: boolean;
  outcome: {
    network_status: string;
    reason?: string;
    risk_level: string;
    risk_score?: number;
    seller_message: string;
    type: string;
  };
  paid: boolean;
  receipt_email?: string;
  receipt_number?: string;
  receipt_url?: string;
  refunded: boolean;
  refunds: {
    object: string;
    data: Refund[];
    has_more: boolean;
    url: string;
  };
  statement_descriptor?: string;
  status: string;
}

export interface Refund {
  id: string;
  object: string;
  amount: number;
  charge: string;
  created: number;
  currency: string;
  metadata: Record<string, any>;
  reason: string;
  receipt_number?: string;
  source_transfer_reversal?: string;
  status: string;
  transfer_reversal?: string;
}

export interface Subscription {
  id: string;
  object: string;
  application?: string;
  automatic_tax: {
    enabled: boolean;
  };
  billing_cycle_anchor: number;
  cancel_at?: number;
  cancel_at_period_end: boolean;
  canceled_at?: number;
  collection_method: string;
  created: number;
  currency: string;
  current_period_end: number;
  current_period_start: number;
  customer: string;
  days_until_due?: number;
  default_payment_method?: string;
  default_source?: string;
  default_tax_rates: any[];
  description?: string;
  discount?: any;
  ended_at?: number;
  items: {
    object: string;
    data: SubscriptionItem[];
    has_more: boolean;
    url: string;
  };
  latest_invoice?: string;
  livemode: boolean;
  metadata: Record<string, any>;
  next_pending_invoice_item_invoice?: number;
  on_behalf_of?: string;
  pause_collection?: {
    behavior: string;
    resumes_at?: number;
  };
  payment_settings: {
    payment_method_options?: any;
    save_default_payment_method?: string;
  };
  pending_invoice_item_interval?: {
    interval: string;
    interval_count: number;
  };
  pending_setup_intent?: string;
  pending_update?: any;
  schedule?: string;
  start_date: number;
  status: string;
  test_clock?: string;
  transfer_data?: {
    amount_percent?: number;
    destination: string;
  };
  trial_end?: number;
  trial_start?: number;
}

export interface SubscriptionItem {
  id: string;
  object: string;
  billing_thresholds?: any;
  created: number;
  currency: string;
  custom_price?: any;
  metadata: Record<string, any>;
  price: any;
  proration_behavior: string;
  quantity?: number;
  subscription: string;
  tax_rates: any[];
}

export interface PaymentIntentRequest {
  amount: number;
  currency: string;
  description?: string;
  statement_descriptor?: string;
  receipt_email?: string;
  customer?: string;
  payment_method_types?: string[];
  metadata?: Record<string, string>;
}

export interface SubscriptionCreateRequest {
  customer: string;
  items: Array<{
    price: string;
    quantity?: number;
  }>;
  billing_cycle_anchor?: number;
  collection_method?: string;
  default_payment_method?: string;
  default_source?: string;
  default_tax_rates?: string[];
  days_until_due?: number;
  metadata?: Record<string, string>;
  pause_collection?: {
    behavior: 'mark_uncollectible' | 'keep_as_draft';
    resumes_at?: number;
  };
  payment_behavior?: string;
  payment_settings?: any;
  trial_end?: number;
  trial_period_days?: number;
}

class StripeService {
  /**
   * Create payment intent
   */
  public async createPaymentIntent(
    request: PaymentIntentRequest
  ): Promise<ApiResponse<PaymentIntent>> {
    return apiClient.post<PaymentIntent>('/stripe/payment-intents', request);
  }

  /**
   * Confirm payment intent
   */
  public async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethod?: string
  ): Promise<ApiResponse<PaymentIntent>> {
    return apiClient.post<PaymentIntent>(
      `/stripe/payment-intents/${paymentIntentId}/confirm`,
      { paymentMethod }
    );
  }

  /**
   * Get payment intent
   */
  public async getPaymentIntent(
    paymentIntentId: string
  ): Promise<ApiResponse<PaymentIntent>> {
    return apiClient.get<PaymentIntent>(`/stripe/payment-intents/${paymentIntentId}`);
  }

  /**
   * Cancel payment intent
   */
  public async cancelPaymentIntent(
    paymentIntentId: string,
    cancellationReason?: string
  ): Promise<ApiResponse<PaymentIntent>> {
    return apiClient.post<PaymentIntent>(
      `/stripe/payment-intents/${paymentIntentId}/cancel`,
      { cancellation_reason: cancellationReason }
    );
  }

  /**
   * Create refund
   */
  public async createRefund(
    chargeId: string,
    amount?: number,
    reason?: string
  ): Promise<ApiResponse<Refund>> {
    return apiClient.post<Refund>('/stripe/refunds', {
      charge: chargeId,
      ...(amount && { amount }),
      ...(reason && { reason })
    });
  }

  /**
   * Get refund
   */
  public async getRefund(refundId: string): Promise<ApiResponse<Refund>> {
    return apiClient.get<Refund>(`/stripe/refunds/${refundId}`);
  }

  /**
   * Create subscription
   */
  public async createSubscription(
    request: SubscriptionCreateRequest
  ): Promise<ApiResponse<Subscription>> {
    return apiClient.post<Subscription>('/stripe/subscriptions', request);
  }

  /**
   * Update subscription
   */
  public async updateSubscription(
    subscriptionId: string,
    data: Partial<SubscriptionCreateRequest>
  ): Promise<ApiResponse<Subscription>> {
    return apiClient.patch<Subscription>(
      `/stripe/subscriptions/${subscriptionId}`,
      data
    );
  }

  /**
   * Cancel subscription
   */
  public async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd?: boolean
  ): Promise<ApiResponse<Subscription>> {
    const data = cancelAtPeriodEnd ? { cancel_at_period_end: true } : undefined;
    return apiClient.patch<Subscription>(
      `/stripe/subscriptions/${subscriptionId}`,
      { canceled_at: new Date().toISOString(), ...data }
    );
  }

  /**
   * Get subscription
   */
  public async getSubscription(
    subscriptionId: string
  ): Promise<ApiResponse<Subscription>> {
    return apiClient.get<Subscription>(`/stripe/subscriptions/${subscriptionId}`);
  }

  /**
   * List charges
   */
  public async listCharges(
    limit?: number,
    startingAfter?: string
  ): Promise<ApiResponse<{
    object: string;
    data: Charge[];
    has_more: boolean;
    url: string;
  }>> {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (startingAfter) params.starting_after = startingAfter;
    return apiClient.get<any>('/stripe/charges', params);
  }

  /**
   * Retrieve charge
   */
  public async getCharge(chargeId: string): Promise<ApiResponse<Charge>> {
    return apiClient.get<Charge>(`/stripe/charges/${chargeId}`);
  }

  /**
   * Update charge
   */
  public async updateCharge(
    chargeId: string,
    description?: string,
    metadata?: Record<string, string>
  ): Promise<ApiResponse<Charge>> {
    return apiClient.patch<Charge>(
      `/stripe/charges/${chargeId}`,
      {
        ...(description && { description }),
        ...(metadata && { metadata })
      }
    );
  }
}

export const stripeService = new StripeService();
