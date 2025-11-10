import { z } from 'zod';

// Fee configuration schema
export const FeeConfigSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  artistPercentage: z.number().min(0).max(100, 'Artist percentage must be between 0-100'),
  agencyPercentage: z.number().min(0).max(100, 'Agency percentage must be between 0-100'),
  taxPercentage: z.number().min(0).max(100, 'Tax percentage must be between 0-100'),
});

export type FeeConfig = z.infer<typeof FeeConfigSchema>;

// Currency conversion schema
export const CurrencyConversionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  from: z.enum(['USD', 'EUR', 'GBP', 'MXN', 'ARS']).refine(
    (val) => ['USD', 'EUR', 'GBP', 'MXN', 'ARS'].includes(val),
    'Unsupported source currency'
  ),
  to: z.enum(['USD', 'EUR', 'GBP', 'MXN', 'ARS']).refine(
    (val) => ['USD', 'EUR', 'GBP', 'MXN', 'ARS'].includes(val),
    'Unsupported target currency'
  ),
});

export type CurrencyConversion = z.infer<typeof CurrencyConversionSchema>;

// Settlement participant schema
export const SettlementParticipantSchema = z.object({
  participantId: z.string().uuid('Invalid participant ID'),
  name: z.string().min(1, 'Participant name required'),
  percentage: z.number().min(0).max(100, 'Percentage must be between 0-100'),
});

export type SettlementParticipant = z.infer<typeof SettlementParticipantSchema>;

// Settlement schema
export const SettlementSchema = z.object({
  showId: z.string().uuid('Invalid show ID'),
  participants: z.array(SettlementParticipantSchema).min(1, 'At least one participant required'),
});

export type Settlement = z.infer<typeof SettlementSchema>;

// Financial report schema
export const FinancialReportSchema = z.object({
  organizationId: z.string().uuid('Invalid organization ID'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export type FinancialReport = z.infer<typeof FinancialReportSchema>;

// Finance record filter schema
export const FinanceSearchSchema = z.object({
  organizationId: z.string().uuid('Invalid organization ID'),
  type: z.enum(['income', 'expense']).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type FinanceSearch = z.infer<typeof FinanceSearchSchema>;

// Calculate show profit schema
export const ShowProfitSchema = z.object({
  showId: z.string().uuid('Invalid show ID'),
});

export type ShowProfit = z.infer<typeof ShowProfitSchema>;

// Show stats schema
export const ShowStatsSchema = z.object({
  showId: z.string().uuid('Invalid show ID'),
});

export type ShowStats = z.infer<typeof ShowStatsSchema>;
