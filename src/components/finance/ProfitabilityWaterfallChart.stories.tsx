/**
 * Storybook Stories para ProfitabilityWaterfallChart
 *
 * Visualiza el flujo de dinero desde ingreso bruto hasta beneficio neto final
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ProfitabilityWaterfallChart } from './ProfitabilityWaterfallChart';
import type { ProfitabilityAnalysis } from '../../types/financeV3';

const meta: Meta<typeof ProfitabilityWaterfallChart> = {
  title: 'Finance/Charts/ProfitabilityWaterfallChart',
  component: ProfitabilityWaterfallChart,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0f172a' }]
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof ProfitabilityWaterfallChart>;

const fmtMoney = (amount: number) => `€${amount.toLocaleString('es-ES')}`;

// Helper para crear análisis mock mínimo
const createAnalysis = (overrides: Partial<ProfitabilityAnalysis>): ProfitabilityAnalysis => ({
  grossIncome: 50000,
  totalCommissions: 12000,
  totalWHT: 3000,
  netIncome: 35000,
  totalExpenses: 8500,
  netProfit: 26500,
  grossMargin: 53,
  netMargin: 75.71,
  commissionsBreakdown: { total: 0, byCommissioner: [] },
  financialDistribution: {
    totalCommissions: 0,
    commissions: [],
    totalWHT: 0,
    totalExpenses: 0,
    expensesByCategory: [],
    expensesByType: [],
    netIncome: 0
  },
  ...overrides
});

export const TourRentable: Story = {
  args: {
    analysis: createAnalysis({}),
    fmtMoney
  }
};

export const AltasComisiones: Story = {
  args: {
    analysis: createAnalysis({
      grossIncome: 40000,
      totalCommissions: 16000,
      totalWHT: 2400,
      netIncome: 21600,
      totalExpenses: 7000,
      netProfit: 14600,
      grossMargin: 36.5,
      netMargin: 67.59
    }),
    fmtMoney
  }
};

export const GastosElevados: Story = {
  args: {
    analysis: createAnalysis({
      grossIncome: 45000,
      totalCommissions: 10800,
      totalWHT: 2700,
      netIncome: 31500,
      totalExpenses: 18000,
      netProfit: 13500,
      grossMargin: 30,
      netMargin: 42.86
    }),
    fmtMoney
  }
};

export const TourPequeño: Story = {
  args: {
    analysis: createAnalysis({
      grossIncome: 12000,
      totalCommissions: 2880,
      totalWHT: 720,
      netIncome: 8400,
      totalExpenses: 3200,
      netProfit: 5200,
      grossMargin: 43.33,
      netMargin: 61.90
    }),
    fmtMoney
  }
};

export const TourNoRentable: Story = {
  args: {
    analysis: createAnalysis({
      grossIncome: 25000,
      totalCommissions: 10000,
      totalWHT: 1500,
      netIncome: 13500,
      totalExpenses: 15000,
      netProfit: -1500,
      grossMargin: -6,
      netMargin: -11.11
    }),
    fmtMoney
  }
};

export const SinWHT: Story = {
  args: {
    analysis: createAnalysis({
      grossIncome: 35000,
      totalCommissions: 8400,
      totalWHT: 0,
      netIncome: 26600,
      totalExpenses: 7000,
      netProfit: 19600,
      grossMargin: 56,
      netMargin: 73.68
    }),
    fmtMoney
  }
};

export const MegaTour: Story = {
  args: {
    analysis: createAnalysis({
      grossIncome: 250000,
      totalCommissions: 60000,
      totalWHT: 15000,
      netIncome: 175000,
      totalExpenses: 45000,
      netProfit: 130000,
      grossMargin: 52,
      netMargin: 74.29
    }),
    fmtMoney
  }
};
