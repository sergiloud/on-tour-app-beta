import { AppDataSource } from '../database/datasource.js';
import { Show } from '../database/entities/Show.js';
import { FinanceRecord } from '../database/entities/FinanceRecord.js';
import { Settlement } from '../database/entities/Settlement.js';
import { Logger } from 'pino';

export interface FinanceCalculation {
  grossRevenue: number;
  expenses: number;
  netProfit: number;
  margin: number;
}

export interface FeeBreakdown {
  amount: number;
  artistFee: number;
  artistPercentage: number;
  agencyFee: number;
  agencyPercentage: number;
  taxes: number;
  taxPercentage: number;
  netAmount: number;
}

export interface CurrencyConversion {
  original: number;
  originalCurrency: string;
  converted: number;
  targetCurrency: string;
  rate: number;
  timestamp: Date;
}

export interface SettlementBreakdown {
  showId: string;
  totalAmount: number;
  currency: string;
  participants: Array<{
    participantId: string;
    name: string;
    percentage: number;
    amount: number;
  }>;
  createdAt: Date;
}

export interface FinancialReport {
  organizationId: string;
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  shows: Array<{
    id: string;
    title: string;
    revenue: number;
    expenses: number;
    profit: number;
    date: Date;
  }>;
  generatedAt: Date;
}

// Mock exchange rates (in production, use real API)
const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.92, GBP: 0.79, MXN: 17.5, ARS: 850 },
  EUR: { USD: 1.09, GBP: 0.86, MXN: 19.0, ARS: 923 },
  GBP: { USD: 1.27, EUR: 1.16, MXN: 22.1, ARS: 1073 },
  MXN: { USD: 0.057, EUR: 0.053, GBP: 0.045, ARS: 48.5 },
  ARS: { USD: 0.0012, EUR: 0.0011, GBP: 0.00093, MXN: 0.021 },
};

export class FinanceService {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Calculate net profit for a show
   */
  async calculateShowProfit(showId: string): Promise<FinanceCalculation> {
    try {
      const financeRepository = AppDataSource.getRepository(FinanceRecord);

      // Get all finance records for the show
      const records = await financeRepository.find({
        where: { showId },
      });

      // Separate income and expenses
      const income = records
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0);

      const expenses = records
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0);

      const netProfit = income - expenses;
      const margin = income > 0 ? (netProfit / income) * 100 : 0;

      this.logger.info(
        { showId, income, expenses, netProfit, margin },
        'Profit calculation completed'
      );

      return {
        grossRevenue: income,
        expenses,
        netProfit,
        margin,
      };
    } catch (error) {
      this.logger.error({ error, showId }, 'Error calculating show profit');
      throw new Error('Failed to calculate show profit');
    }
  }

  /**
   * Calculate fees and net amount
   */
  calculateFees(
    amount: number,
    artistPercentage: number,
    agencyPercentage: number,
    taxPercentage: number
  ): FeeBreakdown {
    if (amount < 0) {
      throw new Error('Amount must be positive');
    }

    const artistFee = (amount * artistPercentage) / 100;
    const agencyFee = (amount * agencyPercentage) / 100;
    const taxes = (amount * taxPercentage) / 100;
    const netAmount = amount - artistFee - agencyFee - taxes;

    this.logger.debug(
      { amount, artistFee, agencyFee, taxes, netAmount },
      'Fee calculation completed'
    );

    return {
      amount,
      artistFee,
      artistPercentage,
      agencyFee,
      agencyPercentage,
      taxes,
      taxPercentage,
      netAmount,
    };
  }

  /**
   * Convert currency using exchange rates
   */
  convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): CurrencyConversion {
    if (amount < 0) {
      throw new Error('Amount must be positive');
    }

    if (fromCurrency === toCurrency) {
      return {
        original: amount,
        originalCurrency: fromCurrency,
        converted: amount,
        targetCurrency: toCurrency,
        rate: 1,
        timestamp: new Date(),
      };
    }

    const rates = EXCHANGE_RATES[fromCurrency];
    if (!rates || !rates[toCurrency]) {
      throw new Error(`Unsupported currency conversion: ${fromCurrency} to ${toCurrency}`);
    }

    const rate = rates[toCurrency];
    const converted = amount * rate;

    this.logger.info(
      { amount, fromCurrency, toCurrency, rate, converted },
      'Currency conversion completed'
    );

    return {
      original: amount,
      originalCurrency: fromCurrency,
      converted,
      targetCurrency: toCurrency,
      rate,
      timestamp: new Date(),
    };
  }

  /**
   * Calculate settlement breakdown
   */
  async calculateSettlement(
    showId: string,
    participants: Array<{ participantId: string; name: string; percentage: number }>
  ): Promise<SettlementBreakdown> {
    try {
      // Get show
      const showRepository = AppDataSource.getRepository(Show);
      const show = await showRepository.findOne({
        where: { id: showId },
        relations: ['finances'],
      });

      if (!show) {
        throw new Error('Show not found');
      }

      // Calculate total income
      const totalIncome = (show.finances || [])
        .filter((r: any) => r.type === 'income')
        .reduce((sum: number, r: any) => sum + r.amount, 0);

      // Verify percentages sum to 100
      const totalPercentage = participants.reduce((sum, p) => sum + p.percentage, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new Error(`Settlement percentages must sum to 100%, got ${totalPercentage}%`);
      }

      // Calculate individual amounts
      const breakdown: SettlementBreakdown = {
        showId,
        totalAmount: totalIncome,
        currency: show.currency,
        participants: participants.map(p => ({
          participantId: p.participantId,
          name: p.name,
          percentage: p.percentage,
          amount: (totalIncome * p.percentage) / 100,
        })),
        createdAt: new Date(),
      };

      this.logger.info(breakdown, 'Settlement breakdown calculated');

      return breakdown;
    } catch (error) {
      this.logger.error({ error, showId }, 'Error calculating settlement');
      throw error;
    }
  }

  /**
   * Generate financial report for date range
   */
  async generateFinancialReport(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FinancialReport> {
    try {
      const showRepository = AppDataSource.getRepository(Show);

      // Get all shows in date range
      const shows = await showRepository
        .createQueryBuilder('show')
        .where('show.organizationId = :organizationId', { organizationId })
        .andWhere('show.startDate >= :startDate', { startDate })
        .andWhere('show.endDate <= :endDate', { endDate })
        .leftJoinAndSelect('show.finances', 'records')
        .orderBy('show.startDate', 'ASC')
        .getMany();

      // Calculate totals
      let totalIncome = 0;
      let totalExpenses = 0;

      const showDetails = shows.map(show => {
        const income = (show.finances || [])
          .filter((r: any) => r.type === 'income')
          .reduce((sum: number, r: any) => sum + r.amount, 0);

        const expenses = (show.finances || [])
          .filter((r: any) => r.type === 'expense')
          .reduce((sum: number, r: any) => sum + r.amount, 0);

        totalIncome += income;
        totalExpenses += expenses;

        return {
          id: show.id,
          title: show.title,
          revenue: income,
          expenses,
          profit: income - expenses,
          date: show.startDate,
        };
      });

      const report: FinancialReport = {
        organizationId,
        startDate,
        endDate,
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        shows: showDetails,
        generatedAt: new Date(),
      };

      this.logger.info(
        { organizationId, startDate, endDate, totalIncome, totalExpenses },
        'Financial report generated'
      );

      return report;
    } catch (error) {
      this.logger.error({ error, organizationId }, 'Error generating financial report');
      throw error;
    }
  }

  /**
   * Get statistics for a show
   */
  async getShowStats(showId: string) {
    try {
      const showRepository = AppDataSource.getRepository(Show);
      const financeRepository = AppDataSource.getRepository(FinanceRecord);

      const show = await showRepository.findOne({
        where: { id: showId },
      });

      if (!show) {
        throw new Error('Show not found');
      }

      const records = await financeRepository.find({
        where: { showId },
      });

      const income = records
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0);

      const expenses = records
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0);

      return {
        showId,
        title: show.title,
        status: show.status,
        totalIncome: income,
        totalExpenses: expenses,
        netProfit: income - expenses,
        recordCount: records.length,
        incomeRecords: records.filter(r => r.type === 'income').length,
        expenseRecords: records.filter(r => r.type === 'expense').length,
      };
    } catch (error) {
      this.logger.error({ error, showId }, 'Error getting show stats');
      throw error;
    }
  }

  /**
   * Search finance records with filters
   */
  async searchRecords(
    organizationId: string,
    filters: {
      type?: 'income' | 'expense';
      status?: string;
      minAmount?: number;
      maxAmount?: number;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    try {
      const financeRepository = AppDataSource.getRepository(FinanceRecord);

      let query = financeRepository
        .createQueryBuilder('record')
        .leftJoin('record.show', 'show')
        .where('show.organizationId = :organizationId', { organizationId });

      if (filters.type) {
        query = query.andWhere('record.type = :type', { type: filters.type });
      }

      if (filters.status) {
        query = query.andWhere('record.status = :status', { status: filters.status });
      }

      if (filters.minAmount !== undefined) {
        query = query.andWhere('record.amount >= :minAmount', { minAmount: filters.minAmount });
      }

      if (filters.maxAmount !== undefined) {
        query = query.andWhere('record.amount <= :maxAmount', { maxAmount: filters.maxAmount });
      }

      if (filters.startDate) {
        query = query.andWhere('record.createdAt >= :startDate', { startDate: filters.startDate });
      }

      if (filters.endDate) {
        query = query.andWhere('record.createdAt <= :endDate', { endDate: filters.endDate });
      }

      const records = await query.orderBy('record.createdAt', 'DESC').getMany();

      this.logger.info(
        { organizationId, filterCount: Object.keys(filters).length, resultCount: records.length },
        'Finance records search completed'
      );

      return records;
    } catch (error) {
      this.logger.error({ error, organizationId }, 'Error searching finance records');
      throw error;
    }
  }
}
