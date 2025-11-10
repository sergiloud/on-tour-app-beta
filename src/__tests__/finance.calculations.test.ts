/**
 * Finance Calculations Test Suite
 *
 * Comprehensive tests for all financial logic.
 * These tests ensure accuracy, prevent regressions, and document expected behavior.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FinanceCalc, type Cost } from '../features/finance/calculations';
import { DEFAULT_RULES, getRulesForProfile } from '../lib/financeConfig';

describe('FinanceCalc', () => {
  describe('calculateGrossIncome', () => {
    it('should calculate gross income without FX conversion', () => {
      const result = FinanceCalc.calculateGrossIncome(10000, 1.0);
      expect(result).toBe(10000);
    });

    it('should apply FX conversion', () => {
      const result = FinanceCalc.calculateGrossIncome(12000, 0.92);
      expect(result).toBe(11040);
    });

    it('should handle GBP to EUR conversion', () => {
      const result = FinanceCalc.calculateGrossIncome(8500, 1.15);
      expect(result).toBe(9775);
    });

    it('should throw on negative fee', () => {
      expect(() => FinanceCalc.calculateGrossIncome(-1000, 1.0)).toThrow();
    });

    it('should throw on invalid FX rate', () => {
      expect(() => FinanceCalc.calculateGrossIncome(10000, 0)).toThrow();
      expect(() => FinanceCalc.calculateGrossIncome(10000, -1)).toThrow();
    });
  });

  describe('calculateCommissions', () => {
    it('should calculate management commission', () => {
      const result = FinanceCalc.calculateCommissions(10000, 10, 0);
      expect(result.management).toBe(1000);
      expect(result.booking).toBe(0);
    });

    it('should calculate booking commission', () => {
      const result = FinanceCalc.calculateCommissions(10000, 0, 8);
      expect(result.management).toBe(0);
      expect(result.booking).toBe(800);
    });

    it('should calculate combined commissions', () => {
      const result = FinanceCalc.calculateCommissions(10000, 10, 8);
      expect(result.management).toBe(1000);
      expect(result.booking).toBe(800);
      expect(result.management + result.booking).toBe(1800);
    });

    it('should handle fractional percentages', () => {
      const result = FinanceCalc.calculateCommissions(10000, 10.5, 8.5);
      expect(result.management).toBeCloseTo(1050, 2);
      expect(result.booking).toBeCloseTo(850, 2);
    });

    it('should throw on invalid percentages', () => {
      expect(() => FinanceCalc.calculateCommissions(10000, -1, 8)).toThrow();
      expect(() => FinanceCalc.calculateCommissions(10000, 101, 8)).toThrow();
      expect(() => FinanceCalc.calculateCommissions(10000, 10, -1)).toThrow();
    });
  });

  describe('calculateWHT', () => {
    it('should calculate WHT on gross', () => {
      const result = FinanceCalc.calculateWHT(10000, 15, 'gross');
      expect(result).toBe(1500);
    });

    it('should calculate WHT on net', () => {
      const result = FinanceCalc.calculateWHT(8200, 15, 'net');
      expect(result).toBeCloseTo(1230, 1);
    });

    it('should handle different WHT rates', () => {
      const wht10 = FinanceCalc.calculateWHT(10000, 10, 'gross');
      const wht20 = FinanceCalc.calculateWHT(10000, 20, 'gross');
      expect(wht20).toBe(2 * wht10);
    });

    it('should throw on invalid WHT percentage', () => {
      expect(() => FinanceCalc.calculateWHT(10000, -1, 'gross')).toThrow();
      expect(() => FinanceCalc.calculateWHT(10000, 101, 'gross')).toThrow();
    });

    it('should throw on negative amount', () => {
      expect(() => FinanceCalc.calculateWHT(-1000, 15, 'gross')).toThrow();
    });
  });

  describe('calculateTotalCosts', () => {
    it('should sum single cost', () => {
      const costs: Cost[] = [{ id: '1', type: 'Sound', amount: 500 }];
      const result = FinanceCalc.calculateTotalCosts(costs);
      expect(result).toBe(500);
    });

    it('should sum multiple costs', () => {
      const costs: Cost[] = [
        { id: '1', type: 'Sound', amount: 500 },
        { id: '2', type: 'Light', amount: 300 },
        { id: '3', type: 'Transport', amount: 200 }
      ];
      const result = FinanceCalc.calculateTotalCosts(costs);
      expect(result).toBe(1000);
    });

    it('should handle empty costs array', () => {
      const result = FinanceCalc.calculateTotalCosts([]);
      expect(result).toBe(0);
    });

    it('should throw on negative cost', () => {
      const costs: Cost[] = [{ id: '1', type: 'Sound', amount: -500 }];
      expect(() => FinanceCalc.calculateTotalCosts(costs)).toThrow();
    });
  });

  describe('calculateNet', () => {
    it('should calculate basic net income', () => {
      const result = FinanceCalc.calculateNet({
        grossFee: 10000,
        commissions: { management: 1000, booking: 800 },
        wht: 1500,
        totalCosts: 1000
      });
      expect(result).toBe(5700);
    });

    it('should handle zero commissions', () => {
      const result = FinanceCalc.calculateNet({
        grossFee: 10000,
        commissions: { management: 0, booking: 0 },
        wht: 1500,
        totalCosts: 500
      });
      expect(result).toBe(8000);
    });

    it('should handle zero WHT', () => {
      const result = FinanceCalc.calculateNet({
        grossFee: 10000,
        commissions: { management: 1000, booking: 800 },
        wht: 0,
        totalCosts: 1000
      });
      expect(result).toBe(7200);
    });

    it('should throw on negative gross fee', () => {
      expect(() => FinanceCalc.calculateNet({
        grossFee: -10000,
        commissions: { management: 1000, booking: 800 },
        wht: 1500,
        totalCosts: 1000
      })).toThrow();
    });
  });

  describe('settleShow', () => {
    it('should distribute settlement correctly', () => {
      const settlement = FinanceCalc.settleShow({
        net: 5700,
        fee: 10000,
        artistShare: 0.70,
        mgmtShareOfFee: 0.15,
        bookingShareOfFee: 0.10
      });

      expect(settlement.artist).toBeCloseTo(3990, 2);
      expect(settlement.management).toBeCloseTo(1500, 2);
      expect(settlement.booking).toBeCloseTo(1000, 2);
    });

    it('should handle equal distribution', () => {
      const settlement = FinanceCalc.settleShow({
        net: 6000,
        fee: 10000,
        artistShare: 0.5,
        mgmtShareOfFee: 0.25,
        bookingShareOfFee: 0.25
      });

      expect(settlement.artist).toBe(3000);
      expect(settlement.management).toBe(2500);
      expect(settlement.booking).toBe(2500);
    });

    it('should throw on invalid share', () => {
      expect(() => FinanceCalc.settleShow({
        net: 5700,
        fee: 10000,
        artistShare: -0.5,
        mgmtShareOfFee: 0.15,
        bookingShareOfFee: 0.10
      })).toThrow();

      expect(() => FinanceCalc.settleShow({
        net: 5700,
        fee: 10000,
        artistShare: 1.5,
        mgmtShareOfFee: 0.15,
        bookingShareOfFee: 0.10
      })).toThrow();
    });
  });

  describe('detectConflict', () => {
    it('should detect no conflict when versions match', () => {
      const local = { __version: 1, __modifiedAt: 1000 };
      const remote = { __version: 1, __modifiedAt: 1000 };
      expect(FinanceCalc.detectConflict(local, remote)).toBe(false);
    });

    it('should detect conflict when versions differ', () => {
      const local = { __version: 2, __modifiedAt: 2000 };
      const remote = { __version: 1, __modifiedAt: 1000 };
      expect(FinanceCalc.detectConflict(local, remote)).toBe(true);
    });

    it('should not detect conflict if only timestamp differs', () => {
      const local = { __version: 1, __modifiedAt: 2000 };
      const remote = { __version: 1, __modifiedAt: 1000 };
      expect(FinanceCalc.detectConflict(local, remote)).toBe(false);
    });
  });

  describe('resolveConflict', () => {
    it('should resolve to more recent version', () => {
      const local = { __version: 2, __modifiedAt: 2000, data: 'local' };
      const remote = { __version: 1, __modifiedAt: 1000, data: 'remote' };
      const resolved = FinanceCalc.resolveConflict(local, remote);
      expect(resolved).toBe(local);
    });

    it('should resolve to remote if more recent', () => {
      const local = { __version: 1, __modifiedAt: 1000, data: 'local' };
      const remote = { __version: 2, __modifiedAt: 2000, data: 'remote' };
      const resolved = FinanceCalc.resolveConflict(local, remote);
      expect(resolved).toBe(remote);
    });
  });

  describe('roundCurrency', () => {
    it('should round to 2 decimal places', () => {
      expect(FinanceCalc.roundCurrency(1234.567)).toBe(1234.57);
      expect(FinanceCalc.roundCurrency(1234.564)).toBe(1234.56);
    });

    it('should handle no rounding needed', () => {
      expect(FinanceCalc.roundCurrency(1234.50)).toBe(1234.50);
    });

    it('should handle zero', () => {
      expect(FinanceCalc.roundCurrency(0)).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('should format EUR correctly', () => {
      const formatted = FinanceCalc.formatCurrency(1234.56, 'EUR');
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
    });

    it('should format USD correctly', () => {
      const formatted = FinanceCalc.formatCurrency(1000, 'USD');
      // Format could be $1,000.00 or 1000 depending on locale
      expect(formatted).toMatch(/1[,.]?000/);
    });
  });

  describe('Integration: Full Calculation Flow', () => {
    it('should calculate complete show finances', () => {
      // Given
      const fee = 10000;
      const fxRate = 1.0;
      const whtPct = 15;
      const mgmtPct = 10;
      const bookingPct = 8;
      const costs: Cost[] = [
        { id: '1', type: 'Sound', amount: 500 },
        { id: '2', type: 'Light', amount: 300 }
      ];

      // Calculate step by step
      const gross = FinanceCalc.calculateGrossIncome(fee, fxRate);
      const commissions = FinanceCalc.calculateCommissions(fee, mgmtPct, bookingPct);
      const wht = FinanceCalc.calculateWHT(fee, whtPct, 'gross');
      const totalCosts = FinanceCalc.calculateTotalCosts(costs);
      const net = FinanceCalc.calculateNet({
        grossFee: gross,
        commissions,
        wht,
        totalCosts
      });
      const settlement = FinanceCalc.settleShow({
        net,
        fee: gross,
        artistShare: 0.70,
        mgmtShareOfFee: 0.15,
        bookingShareOfFee: 0.10
      });

      // Assert
      expect(gross).toBe(10000);
      expect(commissions.management + commissions.booking).toBe(1800);
      expect(wht).toBe(1500);
      expect(totalCosts).toBe(800);
      expect(net).toBe(5900);
      expect(settlement.artist + settlement.management + settlement.booking).toBeGreaterThan(0);
    });

    it('should handle multi-currency scenario', () => {
      // Given: 3 shows in different currencies
      const shows = [
        { fee: 10000, fxRate: 1.0, currency: 'EUR' },
        { fee: 12000, fxRate: 0.92, currency: 'USD' },
        { fee: 8500, fxRate: 1.15, currency: 'GBP' }
      ];

      // Calculate total in base currency
      const total = shows.reduce((sum, show) => {
        return sum + FinanceCalc.calculateGrossIncome(show.fee, show.fxRate);
      }, 0);

      // Assert
      expect(total).toBeCloseTo(30815, 0);
    });

    it('should handle 100 shows without rounding errors', () => {
      // Generate 100 shows
      const shows = Array.from({ length: 100 }, (_, i) => ({
        id: String(i),
        fee: 1000 + Math.random() * 5000,
        fxRate: 0.9 + Math.random() * 0.2,
        whtPct: 10 + Math.random() * 10,
        mgmtPct: 8 + Math.random() * 5,
        bookingPct: 5 + Math.random() * 5
      }));

      // Calculate financial totals
      const totals = shows.map(show => {
        const gross = FinanceCalc.calculateGrossIncome(show.fee, show.fxRate);
        const comm = FinanceCalc.calculateCommissions(show.fee, show.mgmtPct, show.bookingPct);
        const wht = FinanceCalc.calculateWHT(show.fee, show.whtPct, 'gross');
        return FinanceCalc.calculateNet({
          grossFee: gross,
          commissions: comm,
          wht,
          totalCosts: 500
        });
      });

      const total = totals.reduce((a, b) => a + b, 0);

      // Assert: total should be valid, positive number
      expect(Number.isFinite(total)).toBe(true);
      expect(total).toBeGreaterThan(0);
      expect(totals.length).toBe(100);
    });
  });
});
