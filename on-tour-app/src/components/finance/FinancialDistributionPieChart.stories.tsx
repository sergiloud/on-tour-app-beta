/**
 * Storybook Stories para FinancialDistributionPieChart
 *
 * Visualización interactiva de la distribución financiera con drill-down
 */

import type { Meta, StoryObj } from '@storybook/react';
import { FinancialDistributionPieChart } from './FinancialDistributionPieChart';
import type { FinancialDistribution } from '../../types/financeV3';

const meta: Meta<typeof FinancialDistributionPieChart> = {
  title: 'Finance/Charts/FinancialDistributionPieChart',
  component: FinancialDistributionPieChart,
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
type Story = StoryObj<typeof FinancialDistributionPieChart>;

const fmtMoney = (amount: number) => `€${amount.toLocaleString('es-ES')}`;

// Helper para crear distribución mock
const createDistribution = (overrides?: Partial<FinancialDistribution>): FinancialDistribution => ({
  totalCommissions: 12000,
  commissions: [
    { name: 'Promotor A', amount: 8000, percentage: 16, count: 3 },
    { name: 'Agencia B', amount: 4000, percentage: 8, count: 2 }
  ],
  totalWHT: 3000,
  totalExpenses: 8500,
  expensesByCategory: [
    { category: 'Alojamiento', amount: 3000, percentage: 6, count: 5 },
    { category: 'Transporte', amount: 2500, percentage: 5, count: 4 },
    { category: 'Producción', amount: 2000, percentage: 4, count: 3 },
    { category: 'Marketing', amount: 1000, percentage: 2, count: 2 }
  ],
  expensesByType: [
    { type: 'Variable', amount: 5500, percentage: 64.7, count: 8 },
    { type: 'Fijo', amount: 3000, percentage: 35.3, count: 4 }
  ],
  netIncome: 35000,
  ...overrides
});

export const DistribucionEstandar: Story = {
  args: {
    distribution: createDistribution(),
    grossIncome: 50000,
    fmtMoney
  }
};

export const MuchasComisiones: Story = {
  args: {
    distribution: createDistribution({
      totalCommissions: 18000,
      commissions: [
        { name: 'Live Nation', amount: 8000, percentage: 16, count: 2 },
        { name: 'Promotor Local', amount: 6000, percentage: 12, count: 3 },
        { name: 'Agencia Booking', amount: 4000, percentage: 8, count: 2 }
      ],
      totalExpenses: 6000,
      expensesByCategory: [
        { category: 'Alojamiento', amount: 3000, percentage: 6, count: 4 },
        { category: 'Transporte', amount: 2000, percentage: 4, count: 3 },
        { category: 'Producción', amount: 1000, percentage: 2, count: 2 }
      ]
    }),
    grossIncome: 50000,
    fmtMoney
  }
};

export const GastosElevados: Story = {
  args: {
    distribution: createDistribution({
      totalCommissions: 8000,
      totalExpenses: 20000,
      expensesByCategory: [
        { category: 'Alojamiento', amount: 8000, percentage: 16, count: 10 },
        { category: 'Transporte', amount: 6000, percentage: 12, count: 8 },
        { category: 'Producción', amount: 4000, percentage: 8, count: 6 },
        { category: 'Personal', amount: 2000, percentage: 4, count: 4 }
      ]
    }),
    grossIncome: 50000,
    fmtMoney
  }
};

export const SinWHT: Story = {
  args: {
    distribution: createDistribution({
      totalWHT: 0
    }),
    grossIncome: 35000,
    fmtMoney
  }
};

export const TourPequeño: Story = {
  args: {
    distribution: createDistribution({
      totalCommissions: 2400,
      commissions: [
        { name: 'Promotor Local', amount: 2400, percentage: 20, count: 2 }
      ],
      totalWHT: 600,
      totalExpenses: 3000,
      expensesByCategory: [
        { category: 'Alojamiento', amount: 1500, percentage: 12.5, count: 3 },
        { category: 'Transporte', amount: 1000, percentage: 8.3, count: 2 },
        { category: 'Producción', amount: 500, percentage: 4.2, count: 1 }
      ]
    }),
    grossIncome: 12000,
    fmtMoney
  }
};

export const MegaTour: Story = {
  args: {
    distribution: createDistribution({
      totalCommissions: 60000,
      commissions: [
        { name: 'Live Nation', amount: 35000, percentage: 14, count: 5 },
        { name: 'AEG Presents', amount: 25000, percentage: 10, count: 3 }
      ],
      totalWHT: 15000,
      totalExpenses: 45000,
      expensesByCategory: [
        { category: 'Producción', amount: 20000, percentage: 8, count: 15 },
        { category: 'Personal', amount: 10000, percentage: 4, count: 8 },
        { category: 'Transporte', amount: 8000, percentage: 3.2, count: 6 },
        { category: 'Alojamiento', amount: 7000, percentage: 2.8, count: 10 }
      ]
    }),
    grossIncome: 250000,
    fmtMoney
  }
};

export const ConDrillDownCallback: Story = {
  args: {
    distribution: createDistribution(),
    grossIncome: 50000,
    fmtMoney,
    onFilterChange: (filter) => {
      console.log('Filter changed:', filter);
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Ejemplo con callback para sincronizar con tabla de transacciones. Abre la consola para ver los eventos de filtrado.'
      }
    }
  }
};

export const SinDatos: Story = {
  args: {
    distribution: createDistribution({
      totalCommissions: 0,
      commissions: [],
      totalWHT: 0,
      totalExpenses: 0,
      expensesByCategory: [],
      expensesByType: []
    }),
    grossIncome: 0,
    fmtMoney
  }
};
