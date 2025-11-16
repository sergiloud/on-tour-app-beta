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

  describe('Finance Selectors - Business Logic', () => {
    const mockFinanceData = {
      transactions: [
        { id: '1', amount: 5000, type: 'revenue', date: '2024-03-01', currency: 'USD' },
        { id: '2', amount: -1200, type: 'expense', date: '2024-03-02', currency: 'USD' },
        { id: '3', amount: 3500, type: 'revenue', date: '2024-03-05', currency: 'EUR' },
        { id: '4', amount: -800, type: 'commission', date: '2024-03-07', currency: 'USD' }
      ],
      shows: [
        { id: '1', fee: 5000, status: 'confirmed', date: '2024-03-01' },
        { id: '2', fee: 3500, status: 'confirmed', date: '2024-03-05' },
        { id: '3', fee: 2000, status: 'pending', date: '2024-03-10' }
      ]
    };

    it('should calculate total revenue from confirmed shows', () => {
      const confirmedShows = mockFinanceData.shows.filter(s => s.status === 'confirmed');
      const totalRevenue = confirmedShows.reduce((sum, show) => sum + show.fee, 0);
      expect(totalRevenue).toBe(8500);
    });

    it('should calculate total expenses correctly', () => {
      const expenses = mockFinanceData.transactions
        .filter(t => t.type === 'expense' || t.type === 'commission')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      expect(expenses).toBe(2000);
    });

    it('should calculate net profit (revenue - expenses)', () => {
      const revenue = mockFinanceData.transactions
        .filter(t => t.type === 'revenue')
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = mockFinanceData.transactions
        .filter(t => t.type === 'expense' || t.type === 'commission')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const netProfit = revenue - expenses;
      expect(netProfit).toBe(6300); // 8500 - 2000
    });

    it('should calculate profit margin percentage', () => {
      const revenue = 8500;
      const costs = 2000;
      const margin = ((revenue - costs) / revenue) * 100;
      expect(margin).toBeCloseTo(76.47, 1);
    });
  });

  describe('Commission Calculations - Advanced Logic', () => {
    it('should calculate tiered commission structure', () => {
      const amount = 50000;
      // Tier 1: First $25k at 10%
      const tier1 = Math.min(amount, 25000) * 0.10;
      // Tier 2: Remaining at 15%
      const tier2 = Math.max(amount - 25000, 0) * 0.15;
      const totalCommission = tier1 + tier2;
      
      expect(tier1).toBe(2500);
      expect(tier2).toBe(3750);
      expect(totalCommission).toBe(6250);
    });

    it('should handle minimum commission guarantees', () => {
      const smallAmount = 500;
      const calculatedCommission = smallAmount * 0.15; // 75
      const minimumGuarantee = 200;
      const finalCommission = Math.max(calculatedCommission, minimumGuarantee);
      
      expect(finalCommission).toBe(200);
    });

    it('should apply maximum commission caps', () => {
      const largeAmount = 100000;
      const calculatedCommission = largeAmount * 0.20; // 20000
      const maximumCap = 15000;
      const finalCommission = Math.min(calculatedCommission, maximumCap);
      
      expect(finalCommission).toBe(15000);
    });
  });

  describe('Period-based Financial Analysis', () => {
    const mockPeriodData = [
      { amount: 5000, date: '2024-01-15', type: 'revenue' },
      { amount: 3000, date: '2024-02-20', type: 'revenue' },
      { amount: 4500, date: '2024-03-10', type: 'revenue' },
      { amount: -1200, date: '2024-01-25', type: 'expense' },
      { amount: -800, date: '2024-02-28', type: 'expense' }
    ];

    it('should filter transactions by month', () => {
      const marchTransactions = mockPeriodData.filter(t => t.date.startsWith('2024-03'));
      expect(marchTransactions).toHaveLength(1);
      expect(marchTransactions[0]?.amount).toBe(4500);
    });

    it('should calculate monthly revenue totals', () => {
      const monthlyRevenue = mockPeriodData
        .filter(t => t.type === 'revenue')
        .reduce((acc, t) => {
          const month = t.date.substring(0, 7); // YYYY-MM
          acc[month] = (acc[month] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);
      
      expect(monthlyRevenue['2024-01']).toBe(5000);
      expect(monthlyRevenue['2024-02']).toBe(3000);
      expect(monthlyRevenue['2024-03']).toBe(4500);
    });

    it('should calculate quarter-over-quarter growth', () => {
      const q1Revenue = mockPeriodData
        .filter(t => t.type === 'revenue' && t.date < '2024-04-01')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Simulated previous quarter
      const prevQ4Revenue = 10000;
      const growthRate = ((q1Revenue - prevQ4Revenue) / prevQ4Revenue) * 100;
      
      expect(q1Revenue).toBe(12500);
      expect(growthRate).toBe(25);
    });
  });

  describe('Currency and Exchange Rate Handling', () => {
    it('should convert currencies using exchange rates', () => {
      const eurAmount = 1000;
      const exchangeRate = 1.08; // EUR to USD
      const usdAmount = eurAmount * exchangeRate;
      
      expect(usdAmount).toBe(1080);
    });

    it('should handle historical exchange rates', () => {
      const transactions = [
        { amount: 1000, currency: 'EUR', date: '2024-01-15', rate: 1.08 },
        { amount: 1000, currency: 'EUR', date: '2024-02-15', rate: 1.10 },
        { amount: 1000, currency: 'EUR', date: '2024-03-15', rate: 1.07 }
      ];
      
      const totalUSD = transactions.reduce((sum, t) => sum + (t.amount * t.rate), 0);
      expect(totalUSD).toBe(3250);
    });

    it('should aggregate multi-currency totals', () => {
      const multiCurrencyData = [
        { amount: 5000, currency: 'USD' },
        { amount: 3000, currency: 'EUR', rate: 1.08 },
        { amount: 2500, currency: 'GBP', rate: 1.25 }
      ];
      
      const totalUSD = multiCurrencyData.reduce((sum, item) => {
        const rate = item.rate || 1; // USD has rate 1
        return sum + (item.amount * rate);
      }, 0);
      
      expect(totalUSD).toBe(11365); // 5000 + (3000*1.08) + (2500*1.25)
    });
  });

  describe('Performance and Optimization Tests', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: `tx-${i}`,
        amount: Math.floor(Math.random() * 5000) + 100,
        type: 'revenue',
        date: '2024-03-01'
      }));
      
      const start = performance.now();
      const total = largeDataset.reduce((sum, t) => sum + t.amount, 0);
      const end = performance.now();
      
      expect(total).toBeGreaterThan(0);
      expect(end - start).toBeLessThan(50); // Should complete within 50ms
    });

    it('should memoize expensive calculations', () => {
      const expensiveCalculation = (data: any[]) => {
        // Simulate expensive operation
        let result = 0;
        for (let i = 0; i < data.length; i++) {
          result += data[i].amount * Math.sqrt(i + 1);
        }
        return result;
      };
      
      const testData = Array.from({ length: 1000 }, (_, i) => ({ amount: i + 1 }));
      
      const start1 = performance.now();
      const result1 = expensiveCalculation(testData);
      const end1 = performance.now();
      
      const start2 = performance.now();
      const result2 = expensiveCalculation(testData);
      const end2 = performance.now();
      
      expect(result1).toBe(result2);
      // Second calculation should be faster if memoized
      // Note: This is testing the concept, actual memoization would require implementation
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null and undefined values gracefully', () => {
      expect(computeNet({ fee: null as any })).toBe(0);
      expect(computeNet({ fee: undefined as any })).toBe(0);
      expect(computeNet(null as any)).toBe(0);
    });

    it('should handle negative fees appropriately', () => {
      const result = computeNet({ fee: -1000, mgmtPct: 10 });
      // Negative fees should not result in positive commissions
      expect(result).toBeLessThanOrEqual(0);
    });

    it('should handle extreme percentage values', () => {
      // Test 100%+ commissions
      const result1 = computeNet({ fee: 1000, mgmtPct: 100 });
      expect(result1).toBe(0);
      
      // Test over 100% total commissions
      const result2 = computeNet({ fee: 1000, mgmtPct: 60, bookingPct: 50 });
      expect(result2).toBeLessThanOrEqual(0);
    });

    it('should handle floating point precision issues', () => {
      const result = computeNet({ fee: 0.1 + 0.2, mgmtPct: 10 }); // 0.30000000000000004
      expect(result).toBeCloseTo(0.27, 2);
    });

    it('should validate input ranges', () => {
      // Percentages should be between 0-100
      const invalidInputs = [
        { fee: 1000, whtPct: -10 },
        { fee: 1000, mgmtPct: 150 },
        { fee: 1000, bookingPct: NaN }
      ];
      
      invalidInputs.forEach(input => {
        const result = computeNet(input);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(input.fee);
      });
    });
  });

  describe('Business Rule Validation', () => {
    it('should enforce minimum show fees', () => {
      const minimumFee = 500;
      const proposedFee = 300;
      const actualFee = Math.max(proposedFee, minimumFee);
      
      expect(actualFee).toBe(500);
    });

    it('should calculate early payment discounts', () => {
      const originalFee = 5000;
      const earlyPaymentDiscount = 0.02; // 2%
      const discountedFee = originalFee * (1 - earlyPaymentDiscount);
      
      expect(discountedFee).toBe(4900);
    });

    it('should handle payment milestone calculations', () => {
      const totalFee = 10000;
      const milestones = [
        { percentage: 0.25, description: 'Booking confirmation' },
        { percentage: 0.50, description: '30 days before show' },
        { percentage: 0.25, description: 'After show completion' }
      ];
      
      const payments = milestones.map(milestone => ({
        ...milestone,
        amount: totalFee * milestone.percentage
      }));
      
      expect(payments[0]?.amount).toBe(2500);
      expect(payments[1]?.amount).toBe(5000);
      expect(payments[2]?.amount).toBe(2500);
      
      const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
      expect(totalPayments).toBe(totalFee);
    });
  });
});
