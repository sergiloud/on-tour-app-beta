/**
 * Finance Rules Configuration
 *
 * Defines how financial calculations should be performed.
 * These rules can vary by country, organization, or contract.
 *
 * Author: Team
 * Date: Nov 2025
 */

/**
 * Finance configuration rules
 */
export type FinanceRules = {
  // When to apply WHT: on gross fee or on net (after commissions)
  whtApplicationPoint: 'gross' | 'net';

  // What amount commissions are calculated on: fee or net income
  commissionBasis: 'fee' | 'net';

  // Rounding strategy for currency amounts
  roundingStrategy: 'half-up' | 'half-down' | 'banker';

  // FX conversion method for multi-currency
  conversionMethod: 'spot' | 'historical' | 'monthly-avg';

  // Default currency for all calculations
  defaultCurrency: 'EUR' | 'USD' | 'GBP' | 'AUD';

  // Whether to include pending shows in financial reports
  includePendingInReports: boolean;

  // Whether to include canceled/archived shows
  includeArchivedInReports: boolean;
};

/**
 * Default finance rules (Europe-based artist)
 */
export const DEFAULT_RULES: FinanceRules = {
  whtApplicationPoint: 'gross',  // WHT on original fee (standard in EU)
  commissionBasis: 'fee',        // Commissions on gross fee
  roundingStrategy: 'half-up',   // 0.5 rounds up (standard banking)
  conversionMethod: 'spot',      // Use rate at time of confirmation
  defaultCurrency: 'EUR',        // Assume EUR unless specified
  includePendingInReports: false, // Only confirmed shows in reports
  includeArchivedInReports: false // Exclude archived
};

/**
 * US-based artist rules (WHT on net)
 */
export const US_ARTIST_RULES: FinanceRules = {
  whtApplicationPoint: 'net',    // US artists often pay WHT on net
  commissionBasis: 'fee',
  roundingStrategy: 'half-up',
  conversionMethod: 'spot',
  defaultCurrency: 'USD',
  includePendingInReports: false,
  includeArchivedInReports: false
};

/**
 * Agency rules (manage multiple artists)
 */
export const AGENCY_RULES: FinanceRules = {
  whtApplicationPoint: 'gross',
  commissionBasis: 'net',        // Agencies take commissions on net
  roundingStrategy: 'banker',    // Banker's rounding for accuracy
  conversionMethod: 'monthly-avg', // More stable for reporting
  defaultCurrency: 'EUR',
  includePendingInReports: true, // Agencies forecast with pending
  includeArchivedInReports: false
};

/**
 * Get finance rules for a specific profile
 */
export function getRulesForProfile(
  profile: 'artist' | 'us-artist' | 'agency' | 'custom',
  custom?: Partial<FinanceRules>
): FinanceRules {
  let base: FinanceRules;

  switch (profile) {
    case 'us-artist':
      base = US_ARTIST_RULES;
      break;
    case 'agency':
      base = AGENCY_RULES;
      break;
    case 'custom':
      base = DEFAULT_RULES;
      break;
    default:
      base = DEFAULT_RULES;
  }

  return { ...base, ...custom };
}

/**
 * Apply rounding strategy
 */
export function round(amount: number, strategy: FinanceRules['roundingStrategy'] = 'half-up'): number {
  const multiplier = 100;
  const shifted = amount * multiplier;

  switch (strategy) {
    case 'half-up':
      return Math.round(shifted) / multiplier;
    case 'half-down':
      return Math.trunc(shifted + 0.5) / multiplier;
    case 'banker':
      // Banker's rounding: round to nearest even
      const rounded = Math.round(shifted);
      return (shifted % 1 === 0.5 && rounded % 2 !== 0)
        ? (rounded - 1) / multiplier
        : rounded / multiplier;
    default:
      return Math.round(shifted) / multiplier;
  }
}

/**
 * Validate finance rules
 */
export function validateRules(rules: FinanceRules): string[] {
  const errors: string[] = [];

  if (!['gross', 'net'].includes(rules.whtApplicationPoint)) {
    errors.push('Invalid whtApplicationPoint');
  }

  if (!['fee', 'net'].includes(rules.commissionBasis)) {
    errors.push('Invalid commissionBasis');
  }

  if (!['EUR', 'USD', 'GBP', 'AUD'].includes(rules.defaultCurrency)) {
    errors.push('Invalid defaultCurrency');
  }

  return errors;
}
