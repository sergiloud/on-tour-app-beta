/**
 * Comprehensive Financial Calculation Tests
 * PRIORITY TEST: All financial calculations must be 100% accurate
 *
 * Covers:
 * - computeNet: Basic show fee calculations with deductions
 * - breakdownNet: Detailed fee component breakdown
 * - sumFees: Multi-currency aggregation with historical rates
 * - Edge cases: zero values, missing costs, currency mismatches
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { computeNet, breakdownNet } from '../lib/computeNet';
import { sumFees, convertToBase } from '../lib/fx';

describe('Financial Calculations - Pure Functions', () => {

  describe('computeNet - Core Financial Math', () => {
    it('should return full fee when no deductions applied', () => {
      const result = computeNet({ fee: 5000 });
      expect(result).toBe(5000);
    });

    it('should correctly calculate WHT (withholding tax) deduction', () => {
      // 10% WHT on €5000 = €500 withheld
      const result = computeNet({ fee: 5000, whtPct: 10 });
      expect(result).toBe(4500);
    });

    it('should handle fractional WHT percentages', () => {
      // 7.5% WHT on €5000 = €375 withheld
      const result = computeNet({ fee: 5000, whtPct: 7.5 });
      expect(result).toBe(4625);
    });

    it('should correctly calculate management commission', () => {
      // 5% mgmt on €5000 = €250
      const result = computeNet({ fee: 5000, mgmtPct: 5 });
      expect(result).toBe(4750);
    });

    it('should correctly calculate booking commission', () => {
      // 10% booking on €5000 = €500
      const result = computeNet({ fee: 5000, bookingPct: 10 });
      expect(result).toBe(4500);
    });

    it('should combine multiple commissions correctly', () => {
      // €5000 - (5% mgmt + 10% booking) = €5000 - €750 = €4250
      const result = computeNet({ fee: 5000, mgmtPct: 5, bookingPct: 10 });
      expect(result).toBe(4250);
    });

    it('should deduct array of costs correctly', () => {
      // €5000 - (€200 + €150 + €100) = €4550
      const result = computeNet({
        fee: 5000,
        costs: [{ amount: 200 }, { amount: 150 }, { amount: 100 }]
      });
      expect(result).toBe(4550);
    });

    it('should handle undefined costs in array', () => {
      // Should skip undefined/null cost amounts
      const result = computeNet({
        fee: 5000,
        costs: [{ amount: 200 }, { amount: undefined }, { amount: 150 }]
      });
      expect(result).toBe(4650);
    });

    it('should apply all deductions together', () => {
      // €5000 - 10% WHT (€500) - 15% commissions (€750) - €300 costs = €3450
      const result = computeNet({
        fee: 5000,
        whtPct: 10,
        mgmtPct: 5,
        bookingPct: 10,
        costs: [{ amount: 200 }, { amount: 100 }]
      });
      expect(result).toBe(3450);
    });

    it('should handle zero fee gracefully', () => {
      const result = computeNet({ fee: 0, whtPct: 10, mgmtPct: 5 });
      expect(result).toBe(0);
    });

    it('should handle missing fee (default to 0)', () => {
      const result = computeNet({ whtPct: 10 });
      expect(result).toBe(0);
    });

    it('should handle 100% deductions (edge case)', () => {
      // 100% WHT leaves nothing
      const result = computeNet({ fee: 5000, whtPct: 100 });
      expect(result).toBe(0);
    });

    it('should handle over-deductions (costs exceed fee)', () => {
      // €1000 fee - €1500 costs = -€500 (negative net, valid)
      const result = computeNet({
        fee: 1000,
        costs: [{ amount: 1500 }]
      });
      expect(result).toBe(-500);
    });

    it('should handle very large fees correctly', () => {
      const result = computeNet({
        fee: 1_000_000,
        whtPct: 5,
        mgmtPct: 3,
        bookingPct: 7
      });
      // 1M - 5% (50K) - 10% (100K) = 850K
      expect(result).toBe(850_000);
    });
  });

  describe('breakdownNet - Detailed Fee Components', () => {
    it('should return all components with no deductions', () => {
      const result = breakdownNet({ fee: 5000 });
      expect(result).toEqual({
        fee: 5000,
        wht: 0,
        mgmt: 0,
        booking: 0,
        commissions: 0,
        totalCosts: 0,
        net: 5000
      });
    });

    it('should correctly break down WHT', () => {
      const result = breakdownNet({ fee: 5000, whtPct: 10 });
      expect(result.wht).toBeCloseTo(500, 5);
      expect(result.net).toBeCloseTo(4500, 5);
    });

    it('should correctly break down management commission', () => {
      const result = breakdownNet({ fee: 5000, mgmtPct: 5 });
      expect(result.mgmt).toBeCloseTo(250, 5);
      expect(result.commissions).toBeCloseTo(250, 5);
      expect(result.net).toBeCloseTo(4750, 5);
    });

    it('should correctly break down booking commission', () => {
      const result = breakdownNet({ fee: 5000, bookingPct: 10 });
      expect(result.booking).toBeCloseTo(500, 5);
      expect(result.commissions).toBeCloseTo(500, 5);
      expect(result.net).toBeCloseTo(4500, 5);
    });

    it('should sum commissions = mgmt + booking', () => {
      const result = breakdownNet({ fee: 5000, mgmtPct: 4, bookingPct: 6 });
      expect(result.commissions).toBeCloseTo(result.mgmt + result.booking, 5);
    });

    it('should correctly sum costs', () => {
      const result = breakdownNet({
        fee: 5000,
        costs: [{ amount: 100 }, { amount: 200 }, { amount: 150 }]
      });
      expect(result.totalCosts).toBe(450);
      expect(result.net).toBe(4550);
    });

    it('breakdownNet net should match computeNet result', () => {
      const inputs = {
        fee: 10000,
        whtPct: 8,
        mgmtPct: 3,
        bookingPct: 7,
        costs: [{ amount: 500 }, { amount: 300 }]
      };

      const breakdown = breakdownNet(inputs);
      const computed = computeNet(inputs);

      expect(breakdown.net).toBeCloseTo(computed, 5);
    });

    it('should handle defaults correctly', () => {
      const result = breakdownNet({});
      expect(result).toEqual({
        fee: 0,
        wht: 0,
        mgmt: 0,
        booking: 0,
        commissions: 0,
        totalCosts: 0,
        net: 0
      });
    });

    it('should breakdown complex scenario', () => {
      const inputs = {
        fee: 50000,
        whtPct: 12.5,
        mgmtPct: 5,
        bookingPct: 8,
        costs: [{ amount: 1000 }, { amount: 500 }, { amount: 750 }]
      };

      const result = breakdownNet(inputs);

      // Verify each component
      expect(result.fee).toBe(50000);
      expect(result.wht).toBeCloseTo(6250, 5); // 50000 * 0.125
      expect(result.mgmt).toBeCloseTo(2500, 5); // 50000 * 0.05
      expect(result.booking).toBeCloseTo(4000, 5); // 50000 * 0.08
      expect(result.commissions).toBeCloseTo(6500, 5);
      expect(result.totalCosts).toBe(2250);

      // net = 50000 - 6250 - 6500 - 2250 = 35000
      expect(result.net).toBeCloseTo(35000, 5);
    });
  });

  describe('sumFees - Multi-Currency Aggregation', () => {
    it('should sum single currency correctly', () => {
      const shows = [
        { fee: 1000, feeCurrency: 'EUR', date: '2025-01-15', status: 'confirmed' },
        { fee: 2000, feeCurrency: 'EUR', date: '2025-01-20', status: 'confirmed' }
      ];

      const total = sumFees(shows, 'EUR');
      expect(total).toBe(3000);
    });

    it('should ignore offers in summation', () => {
      const shows = [
        { fee: 1000, feeCurrency: 'EUR', date: '2025-01-15', status: 'confirmed' },
        { fee: 5000, feeCurrency: 'EUR', date: '2025-01-20', status: 'offer' },
        { fee: 2000, feeCurrency: 'EUR', date: '2025-01-25', status: 'confirmed' }
      ];

      const total = sumFees(shows, 'EUR');
      // Only confirmed shows: 1000 + 2000 = 3000 (ignores 5000 offer)
      expect(total).toBe(3000);
    });

    it('should default to EUR currency when not specified', () => {
      const shows = [
        { fee: 1000, date: '2025-01-15', status: 'confirmed' },
        { fee: 2000, feeCurrency: 'EUR', date: '2025-01-20', status: 'confirmed' }
      ];

      const total = sumFees(shows, 'EUR');
      expect(total).toBe(3000);
    });

    it('should convert USD to EUR using Jan 2025 rate (1.09)', () => {
      const shows = [
        { fee: 1090, feeCurrency: 'USD', date: '2025-01-15', status: 'confirmed' }
      ];

      const total = sumFees(shows, 'EUR');
      expect(total).toBeCloseTo(1000, 0); // 1090 / 1.09 = 1000
    });

    it('should convert GBP to EUR using Jan 2025 rate (0.86)', () => {
      const shows = [
        { fee: 860, feeCurrency: 'GBP', date: '2025-01-15', status: 'confirmed' }
      ];

      const total = sumFees(shows, 'EUR');
      expect(total).toBeCloseTo(1000, 0); // 860 / 0.86 = 1000
    });

    it('should convert AUD to EUR using Jan 2025 rate (1.63)', () => {
      const shows = [
        { fee: 1630, feeCurrency: 'AUD', date: '2025-01-15', status: 'confirmed' }
      ];

      const total = sumFees(shows, 'EUR');
      expect(total).toBeCloseTo(1000, 0); // 1630 / 1.63 = 1000
    });

    it('should sum multiple currencies in single result', () => {
      const shows = [
        { fee: 1000, feeCurrency: 'EUR', date: '2025-01-15', status: 'confirmed' },
        { fee: 1090, feeCurrency: 'USD', date: '2025-01-15', status: 'confirmed' },
        { fee: 860, feeCurrency: 'GBP', date: '2025-01-15', status: 'confirmed' },
        { fee: 1630, feeCurrency: 'AUD', date: '2025-01-15', status: 'confirmed' }
      ];

      const total = sumFees(shows, 'EUR');
      // 1000 + 1000 + 1000 + 1000 = 4000
      expect(total).toBeCloseTo(4000, 0);
    });

    it('should use historical rates by month', () => {
      const shows = [
        { fee: 1090, feeCurrency: 'USD', date: '2025-01-15', status: 'confirmed' }, // Rate 1.09
        { fee: 1080, feeCurrency: 'USD', date: '2025-02-15', status: 'confirmed' }, // Rate 1.08
        { fee: 1070, feeCurrency: 'USD', date: '2025-03-15', status: 'confirmed' }  // Rate 1.07
      ];

      const total = sumFees(shows, 'EUR');
      // 1000 + 1000 + 1000 = 3000
      expect(total).toBeCloseTo(3000, 0);
    });

    it('should handle empty array', () => {
      const total = sumFees([], 'EUR');
      expect(total).toBe(0);
    });

    it('should handle array with only offers (all filtered out)', () => {
      const shows = [
        { fee: 5000, feeCurrency: 'EUR', date: '2025-01-15', status: 'offer' },
        { fee: 3000, feeCurrency: 'EUR', date: '2025-01-20', status: 'offer' }
      ];

      const total = sumFees(shows, 'EUR');
      expect(total).toBe(0);
    });

    it('should fallback when conversion rate not found (future date)', () => {
      const shows = [
        { fee: 1000, feeCurrency: 'EUR', date: '2025-01-15', status: 'confirmed' },
        { fee: 2000, feeCurrency: 'USD', date: '2099-12-31', status: 'confirmed' }
      ];

      const total = sumFees(shows, 'EUR');
      // Should include the 1000 EUR, and fallback for USD
      expect(total).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases & Error Scenarios', () => {
    it('should not crash with NaN in fee', () => {
      const result = computeNet({ fee: NaN });
      // NaN calculations result in NaN
      expect(isNaN(result)).toBe(true);
    });

    it('should handle negative fees', () => {
      const result = computeNet({ fee: -1000, whtPct: 10 });
      // Should compute correctly even with negative
      expect(result).toBe(-900);
    });

    it('should handle extremely small fees', () => {
      const result = computeNet({ fee: 0.01, whtPct: 10 });
      expect(result).toBeCloseTo(0.009, 5);
    });

    it('should maintain precision with financial calculations', () => {
      const result = computeNet({
        fee: 123.45,
        whtPct: 7.25,
        mgmtPct: 2.5,
        bookingPct: 4.75
      });
      // 123.45 - 7.25% (8.9498) - 7.25% (8.9498) = 105.54975
      expect(result).toBeCloseTo(105.55, 1);
    });
  });
});
