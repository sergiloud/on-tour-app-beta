import { z } from 'zod';

// ============================================
// AMADEUS SCHEMAS
// ============================================

export const FlightSearchParamsSchema = z.object({
  origin: z.string().length(3, 'Origin must be a 3-letter IATA code'),
  destination: z.string().length(3, 'Destination must be a 3-letter IATA code'),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Departure date must be YYYY-MM-DD'),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Return date must be YYYY-MM-DD').optional(),
  adults: z.number().int().min(1, 'At least 1 adult required'),
  children: z.number().int().min(0).optional(),
  infants: z.number().int().min(0).optional(),
  travelClass: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).optional(),
  currencyCode: z.string().length(3).optional(),
  maxResults: z.number().int().min(1).max(50).optional(),
});

export type FlightSearchParams = z.infer<typeof FlightSearchParamsSchema>;

export const BookingConfirmationSchema = z.object({
  flightOfferId: z.string().min(1, 'Flight offer ID required'),
  travelers: z.array(
    z.object({
      id: z.string().uuid(),
      dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      name: z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
      }),
      gender: z.enum(['MALE', 'FEMALE']),
      email: z.string().email(),
      phone: z.string().min(10),
    })
  ),
});

export type BookingConfirmation = z.infer<typeof BookingConfirmationSchema>;

export const FlightStatusSchema = z.object({
  carrierCode: z.string().length(2),
  flightNumber: z.string().min(1),
  scheduledDepartureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type FlightStatus = z.infer<typeof FlightStatusSchema>;

export const GetAirportInfoSchema = z.object({
  iataCode: z.string().length(3),
});

export type GetAirportInfo = z.infer<typeof GetAirportInfoSchema>;

export const GetAirlineInfoSchema = z.object({
  carrierCode: z.string().length(2),
});

export type GetAirlineInfo = z.infer<typeof GetAirlineInfoSchema>;

// ============================================
// STRIPE SCHEMAS
// ============================================

export const PaymentRequestSchema = z.object({
  amount: z.number().int().positive('Amount must be positive'),
  currency: z.string().length(3),
  customerId: z.string().optional(),
  paymentMethodId: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type PaymentRequest = z.infer<typeof PaymentRequestSchema>;

export const CreateCustomerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name required'),
  phone: z.string().optional(),
  address: z
    .object({
      line1: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      postal_code: z.string().min(1),
      country: z.string().min(1),
    })
    .optional(),
});

export type CreateCustomer = z.infer<typeof CreateCustomerSchema>;

export const TransferRequestSchema = z.object({
  amount: z.number().int().positive('Amount must be positive'),
  currency: z.string().length(3),
  destination: z.string().min(1, 'Destination account required'),
  sourceTransaction: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type TransferRequest = z.infer<typeof TransferRequestSchema>;

export const RefundRequestSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID required'),
  amount: z.number().int().positive().optional(),
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
  metadata: z.record(z.any()).optional(),
});

export type RefundRequest = z.infer<typeof RefundRequestSchema>;

export const SettlementTransferSchema = z.object({
  paymentIntentId: z.string().min(1),
  artistAmount: z.number().int().positive(),
  agencyAmount: z.number().int().positive(),
  platformFee: z.number().int().min(0),
  artistAccountId: z.string().min(1),
  agencyAccountId: z.string().min(1),
  showId: z.string().uuid(),
  metadata: z.record(z.any()).optional(),
});

export type SettlementTransfer = z.infer<typeof SettlementTransferSchema>;

// ============================================
// EMAIL SCHEMAS
// ============================================

export const EmailRequestSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1, 'Subject required'),
  html: z.string().min(1, 'HTML content required'),
  text: z.string().optional(),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  replyTo: z.string().email().optional(),
});

export type EmailRequest = z.infer<typeof EmailRequestSchema>;

export const BookingConfirmationEmailSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  bookingId: z.string().uuid(),
  flightDetails: z.object({
    origin: z.string().length(3),
    destination: z.string().length(3),
    departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    departureTime: z.string().regex(/^\d{2}:\d{2}$/),
    airline: z.string().min(1),
    flightNumber: z.string().min(1),
    totalPrice: z.number().positive(),
    currency: z.string().length(3),
  }),
  bookingReference: z.string().min(1),
  confirmationDate: z.string(),
});

export type BookingConfirmationEmail = z.infer<typeof BookingConfirmationEmailSchema>;

export const ReminderEmailSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  showName: z.string().min(1),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  eventTime: z.string().regex(/^\d{2}:\d{2}$/),
  venue: z.string().min(1),
  bookingReference: z.string().min(1),
  hoursUntilEvent: z.number().int().positive(),
});

export type ReminderEmail = z.infer<typeof ReminderEmailSchema>;

export const InvoiceEmailSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  invoiceNumber: z.string().min(1),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
      total: z.number().positive(),
    })
  ),
  subtotal: z.number().positive(),
  tax: z.number().min(0),
  total: z.number().positive(),
  currency: z.string().length(3),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
});

export type InvoiceEmail = z.infer<typeof InvoiceEmailSchema>;

export const SettlementReportEmailSchema = z.object({
  artistName: z.string().min(1),
  artistEmail: z.string().email(),
  reportPeriod: z.string().min(1),
  totalEarnings: z.number().positive(),
  totalShows: z.number().int().positive(),
  averageEarningPerShow: z.number().positive(),
  currency: z.string().length(3),
  shows: z.array(
    z.object({
      name: z.string().min(1),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      earnings: z.number().positive(),
    })
  ),
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type SettlementReportEmail = z.infer<typeof SettlementReportEmailSchema>;

export const AlertEmailSchema = z.object({
  recipientName: z.string().min(1),
  recipientEmail: z.string().email(),
  alertType: z.string().min(1),
  alertMessage: z.string().min(1),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  actionRequired: z.boolean(),
  actionUrl: z.string().url().optional(),
  actionButtonText: z.string().optional(),
  timestamp: z.string(),
});

export type AlertEmail = z.infer<typeof AlertEmailSchema>;
