import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FinanceService } from '../../src/services/FinanceService';
import pino from 'pino';

const logger = pino({ level: 'silent' });

describe('FinanceService', () => {
  let financeService: FinanceService;

  beforeEach(() => {
    financeService = new FinanceService(logger);
  });

  describe('calculateFees', () => {
    it('should calculate fees correctly with standard rates', () => {
      const result = financeService.calculateFees(1000, 20, 15, 10);

      expect(result.amount).toBe(1000);
      expect(result.artistFee).toBe(200);
      expect(result.agencyFee).toBe(150);
      expect(result.taxes).toBe(100);
      expect(result.netAmount).toBe(550);
    });

    it('should handle zero fees', () => {
      const result = financeService.calculateFees(1000, 0, 0, 0);

      expect(result.artistFee).toBe(0);
      expect(result.agencyFee).toBe(0);
      expect(result.taxes).toBe(0);
      expect(result.netAmount).toBe(1000);
    });

    it('should handle maximum fees', () => {
      const result = financeService.calculateFees(1000, 100, 100, 100);

      expect(result.artistFee).toBe(1000);
      expect(result.agencyFee).toBe(1000);
      expect(result.taxes).toBe(1000);
      expect(result.netAmount).toBe(-2000);
    });

    it('should throw error for negative amounts', () => {
      expect(() => {
        financeService.calculateFees(-100, 10, 10, 10);
      }).toThrow('Amount must be positive');
    });

    it('should calculate with decimal percentages', () => {
      const result = financeService.calculateFees(500, 5.5, 3.2, 2.1);

      expect(result.artistFee).toBe(27.5);
      expect(result.agencyFee).toBe(16);
      expect(result.taxes).toBe(10.5);
      expect(result.netAmount).toBeCloseTo(446);
    });
  });

  describe('convertCurrency', () => {
    it('should return same amount for same currency', () => {
      const result = financeService.convertCurrency(100, 'USD', 'USD');

      expect(result.original).toBe(100);
      expect(result.converted).toBe(100);
      expect(result.rate).toBe(1);
    });

    it('should convert USD to EUR correctly', () => {
      const result = financeService.convertCurrency(100, 'USD', 'EUR');

      expect(result.original).toBe(100);
      expect(result.originalCurrency).toBe('USD');
      expect(result.targetCurrency).toBe('EUR');
      expect(result.converted).toBeCloseTo(92);
      expect(result.rate).toBe(0.92);
    });

    it('should convert EUR to GBP correctly', () => {
      const result = financeService.convertCurrency(100, 'EUR', 'GBP');

      expect(result.converted).toBeCloseTo(86);
      expect(result.rate).toBe(0.86);
    });

    it('should throw error for unsupported currency', () => {
      expect(() => {
        financeService.convertCurrency(100, 'XXX', 'USD');
      }).toThrow('Unsupported currency conversion');
    });

    it('should throw error for negative amounts', () => {
      expect(() => {
        financeService.convertCurrency(-100, 'USD', 'EUR');
      }).toThrow('Amount must be positive');
    });

    it('should work with multiple currency pairs', () => {
      const pairs = [
        ['USD', 'GBP', 100, 79],
        ['USD', 'MXN', 100, 1750],
        ['EUR', 'USD', 100, 109],
        ['GBP', 'EUR', 100, 116],
      ];

      pairs.forEach(([from, to, amount, expected]) => {
        const result = financeService.convertCurrency(
          amount as number,
          from as string,
          to as string
        );
        expect(result.converted).toBeCloseTo(expected as number, -1);
      });
    });
  });

  describe('getShowStats', () => {
    it('should throw error if show not found', async () => {
      await expect(
        financeService.getShowStats('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow('Show not found');
    });
  });

  describe('calculateSettlement', () => {
    it('should throw error for invalid percentages', async () => {
      const participants = [
        { participantId: '00000000-0000-0000-0000-000000000001', name: 'Artist', percentage: 60 },
        { participantId: '00000000-0000-0000-0000-000000000002', name: 'Manager', percentage: 30 },
      ];

      await expect(
        financeService.calculateSettlement('00000000-0000-0000-0000-000000000000', participants)
      ).rejects.toThrow();
    });
  });

  describe('searchRecords', () => {
    it('should handle no filters', async () => {
      const results = await financeService.searchRecords(
        '00000000-0000-0000-0000-000000000000',
        {}
      );

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('generateFinancialReport', () => {
    it('should generate report with date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const report = await financeService.generateFinancialReport(
        '00000000-0000-0000-0000-000000000000',
        startDate,
        endDate
      );

      expect(report.organizationId).toBe('00000000-0000-0000-0000-000000000000');
      expect(report.startDate).toEqual(startDate);
      expect(report.endDate).toEqual(endDate);
      expect(Array.isArray(report.shows)).toBe(true);
      expect(typeof report.totalIncome).toBe('number');
      expect(typeof report.totalExpenses).toBe('number');
      expect(typeof report.netProfit).toBe('number');
    });
  });
});
