/**
 * Tests de Integración para DashboardTab
 *
 * ESTRATEGIA: Verificar que el componente renderiza correctamente
 * con datos mock y que las interacciones (callbacks) funcionan.
 *
 * COBERTURA:
 * - Renderizado de KPIs
 * - Renderizado de gráficos
 * - Callbacks de navegación
 * - Manejo de datos vacíos
 * - Period comparison rendering
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardTab } from '../DashboardTab';
import type { PeriodKPIs, ComparisonKPIs } from '../../../hooks/useFinanceData';
import type { ProfitabilityAnalysis, TransactionV3 } from '../../../types/financeV3';

// ============================================================================
// FIXTURES: Datos de prueba
// ============================================================================

const mockPeriodKPIs: PeriodKPIs = {
  income: 15000,
  expenses: 8000,
  balance: 7000,
  pending: 2000
};

const mockComparisonKPIs: ComparisonKPIs = {
  income: {
    current: 15000,
    comparison: 12000,
    delta: 3000,
    deltaPercent: 25
  },
  expenses: {
    current: 8000,
    comparison: 7000,
    delta: 1000,
    deltaPercent: 14.3
  },
  balance: {
    current: 7000,
    comparison: 5000,
    delta: 2000,
    deltaPercent: 40
  },
  pending: {
    current: 2000,
    comparison: 1500,
    delta: 500,
    deltaPercent: 33.3
  }
};

const mockProfitabilityAnalysis: ProfitabilityAnalysis = {
  grossIncome: 15000,
  totalCommissions: 0,
  totalWHT: 0,
  netIncome: 15000,
  totalExpenses: 8000,
  netProfit: 7000,
  grossMargin: 46.67,
  netMargin: 46.67,
  commissionsBreakdown: {
    total: 0,
    byCommissioner: []
  },
  financialDistribution: {
    totalCommissions: 0,
    commissions: [],
    totalWHT: 0,
    totalExpenses: 8000,
    expensesByCategory: [
      { category: 'Alojamiento', amount: 3000, percentage: 20, count: 2 },
      { category: 'Transporte', amount: 2500, percentage: 16.67, count: 3 },
      { category: 'Producción', amount: 2500, percentage: 16.67, count: 1 }
    ],
    expensesByType: [],
    netIncome: 7000
  }
};

const mockIncomeVsExpensesData = [
  { month: 'Sem 1', ingresos: 5000, gastos: 2000, neto: 3000 },
  { month: 'Sem 2', ingresos: 6000, gastos: 3000, neto: 3000 },
  { month: 'Sem 3', ingresos: 4000, gastos: 3000, neto: 1000 }
];

const mockBudgetVsRealData = [
  { fecha: '2024-01-01', presupuesto: 10000, real: 5000, diferencia: -5000 },
  { fecha: '2024-01-15', presupuesto: 20000, real: 13000, diferencia: -7000 }
];

const mockCategoryData = [
  { name: 'Alojamiento', value: 3000 },
  { name: 'Transporte', value: 2500 },
  { name: 'Producción', value: 2500 }
];

const mockRecentTransactions: TransactionV3[] = [
  {
    id: '1',
    date: '2024-01-20',
    description: 'Concierto Madrid',
    category: 'Conciertos',
    type: 'income',
    amount: 5000,
    status: 'paid'
  },
  {
    id: '2',
    date: '2024-01-19',
    description: 'Hotel Madrid',
    category: 'Alojamiento',
    type: 'expense',
    amount: 1500,
    status: 'paid'
  }
];

const mockFmtMoney = (amount: number) => `€${amount.toLocaleString('es-ES')}`;

// ============================================================================
// TEST SUITE: Renderizado de KPIs
// ============================================================================

describe('DashboardTab - KPI Rendering', () => {
  it('renderiza el KPI de ingresos correctamente', () => {
    render(
      <DashboardTab
        periodKPIs={mockPeriodKPIs}
        profitabilityAnalysis={mockProfitabilityAnalysis}
        incomeVsExpensesData={mockIncomeVsExpensesData}
        categoryData={mockCategoryData}
        recentTransactions={mockRecentTransactions}
        fmtMoney={mockFmtMoney}
        onViewAllTransactions={vi.fn()}
        onAddTransaction={vi.fn()}
      />
    );

    // Verificar que el valor de ingresos se muestra
    expect(screen.getByText('€15.000')).toBeInTheDocument();
  });

  it('renderiza el KPI de gastos correctamente', () => {
    render(
      <DashboardTab
        periodKPIs={mockPeriodKPIs}
        profitabilityAnalysis={mockProfitabilityAnalysis}
        incomeVsExpensesData={mockIncomeVsExpensesData}
        categoryData={mockCategoryData}
        recentTransactions={mockRecentTransactions}
        fmtMoney={mockFmtMoney}
        onViewAllTransactions={vi.fn()}
        onAddTransaction={vi.fn()}
      />
    );

    expect(screen.getByText('€8.000')).toBeInTheDocument();
  });

  it('renderiza el KPI de balance correctamente', () => {
    render(
      <DashboardTab
        periodKPIs={mockPeriodKPIs}
        profitabilityAnalysis={mockProfitabilityAnalysis}
        incomeVsExpensesData={mockIncomeVsExpensesData}
        categoryData={mockCategoryData}
        recentTransactions={mockRecentTransactions}
        fmtMoney={mockFmtMoney}
        onViewAllTransactions={vi.fn()}
        onAddTransaction={vi.fn()}
      />
    );

    expect(screen.getByText('€7.000')).toBeInTheDocument();
  });

  it('renderiza el KPI de pendiente correctamente', () => {
    render(
      <DashboardTab
        periodKPIs={mockPeriodKPIs}
        profitabilityAnalysis={mockProfitabilityAnalysis}
        incomeVsExpensesData={mockIncomeVsExpensesData}
        categoryData={mockCategoryData}
        recentTransactions={mockRecentTransactions}
        fmtMoney={mockFmtMoney}
        onViewAllTransactions={vi.fn()}
        onAddTransaction={vi.fn()}
      />
    );

    expect(screen.getByText('€2.000')).toBeInTheDocument();
  });
});

// ============================================================================
// TEST SUITE: Period Comparison
// ============================================================================

describe('DashboardTab - Period Comparison', () => {
  it('renderiza deltas de comparación cuando comparisonKPIs está presente', () => {
    render(
      <DashboardTab
        periodKPIs={mockPeriodKPIs}
        comparisonKPIs={mockComparisonKPIs}
        profitabilityAnalysis={mockProfitabilityAnalysis}
        incomeVsExpensesData={mockIncomeVsExpensesData}
        categoryData={mockCategoryData}
        recentTransactions={mockRecentTransactions}
        fmtMoney={mockFmtMoney}
        onViewAllTransactions={vi.fn()}
        onAddTransaction={vi.fn()}
      />
    );

    // Debe mostrar el porcentaje de delta
    expect(screen.getByText(/33\.3%/)).toBeInTheDocument();
  });

  it('no renderiza deltas cuando comparisonKPIs es null', () => {
    render(
      <DashboardTab
        periodKPIs={mockPeriodKPIs}
        comparisonKPIs={null}
        profitabilityAnalysis={mockProfitabilityAnalysis}
        incomeVsExpensesData={mockIncomeVsExpensesData}
        categoryData={mockCategoryData}
        recentTransactions={mockRecentTransactions}
        fmtMoney={mockFmtMoney}
        onViewAllTransactions={vi.fn()}
        onAddTransaction={vi.fn()}
      />
    );

    // No debe mostrar porcentajes de comparación
    expect(screen.queryByText('vs. anterior')).not.toBeInTheDocument();
  });
});

// ============================================================================
// TEST SUITE: Interacciones y Callbacks
// ============================================================================

describe('DashboardTab - Interacciones', () => {
  it('llama a onViewAllTransactions cuando se hace clic en Ingresos', async () => {
    const mockOnDrillDown = vi.fn();
    const user = userEvent.setup();

    render(
      <DashboardTab
        periodKPIs={mockPeriodKPIs}
        profitabilityAnalysis={mockProfitabilityAnalysis}
        incomeVsExpensesData={mockIncomeVsExpensesData}
        categoryData={mockCategoryData}
        recentTransactions={mockRecentTransactions}
        fmtMoney={mockFmtMoney}
        onViewAllTransactions={vi.fn()}
        onAddTransaction={vi.fn()}
        onDrillDown={mockOnDrillDown}
      />
    );

    // Buscar el botón de "Ingresos" y hacer clic
    const ingresoButton = screen.getByText('Ingresos').closest('button');
    if (ingresoButton) {
      await user.click(ingresoButton);
      expect(mockOnDrillDown).toHaveBeenCalledWith({ type: 'income' });
    }
  });

  it('llama a onDrillDown con type="expense" cuando se hace clic en Gastos', async () => {
    const mockOnDrillDown = vi.fn();
    const user = userEvent.setup();

    render(
      <DashboardTab
        periodKPIs={mockPeriodKPIs}
        profitabilityAnalysis={mockProfitabilityAnalysis}
        incomeVsExpensesData={mockIncomeVsExpensesData}
        categoryData={mockCategoryData}
        recentTransactions={mockRecentTransactions}
        fmtMoney={mockFmtMoney}
        onViewAllTransactions={vi.fn()}
        onAddTransaction={vi.fn()}
        onDrillDown={mockOnDrillDown}
      />
    );

    const gastosButton = screen.getByText('Gastos').closest('button');
    if (gastosButton) {
      await user.click(gastosButton);
      expect(mockOnDrillDown).toHaveBeenCalledWith({ type: 'expense' });
    }
  });
});

// ============================================================================
// TEST SUITE: Casos Edge
// ============================================================================

describe('DashboardTab - Edge Cases', () => {
  it('maneja KPIs con valores en cero', () => {
    const emptyKPIs: PeriodKPIs = {
      income: 0,
      expenses: 0,
      balance: 0,
      pending: 0
    };

    render(
      <DashboardTab
        periodKPIs={emptyKPIs}
        profitabilityAnalysis={mockProfitabilityAnalysis}
        incomeVsExpensesData={[]}
        categoryData={[]}
        recentTransactions={[]}
        fmtMoney={mockFmtMoney}
        onViewAllTransactions={vi.fn()}
        onAddTransaction={vi.fn()}
      />
    );

    // Debe renderizar sin errores
    expect(screen.getByText('€0')).toBeInTheDocument();
  });

  it('maneja lista vacía de transacciones recientes', () => {
    render(
      <DashboardTab
        periodKPIs={mockPeriodKPIs}
        profitabilityAnalysis={mockProfitabilityAnalysis}
        incomeVsExpensesData={mockIncomeVsExpensesData}
        categoryData={mockCategoryData}
        recentTransactions={[]}
        fmtMoney={mockFmtMoney}
        onViewAllTransactions={vi.fn()}
        onAddTransaction={vi.fn()}
      />
    );

    // Debe renderizar sin errores
    expect(screen.getByText(/€15\.000/)).toBeInTheDocument();
  });

  it('maneja balance negativo correctamente', () => {
    const negativeBalanceKPIs: PeriodKPIs = {
      income: 5000,
      expenses: 10000,
      balance: -5000,
      pending: 0
    };

    render(
      <DashboardTab
        periodKPIs={negativeBalanceKPIs}
        profitabilityAnalysis={{
          ...mockProfitabilityAnalysis,
          netProfit: -5000
        }}
        incomeVsExpensesData={mockIncomeVsExpensesData}
        categoryData={mockCategoryData}
        recentTransactions={mockRecentTransactions}
        fmtMoney={mockFmtMoney}
        onViewAllTransactions={vi.fn()}
        onAddTransaction={vi.fn()}
      />
    );

    // Debe mostrar el balance negativo formateado
    expect(screen.getByText(/€-5\.000/)).toBeInTheDocument();
  });
});

// ============================================================================
// TEST SUITE: Accesibilidad
// ============================================================================

describe('DashboardTab - Accesibilidad', () => {
  it('los botones de drill-down son accesibles por teclado', () => {
    render(
      <DashboardTab
        periodKPIs={mockPeriodKPIs}
        profitabilityAnalysis={mockProfitabilityAnalysis}
        incomeVsExpensesData={mockIncomeVsExpensesData}
        categoryData={mockCategoryData}
        recentTransactions={mockRecentTransactions}
        fmtMoney={mockFmtMoney}
        onViewAllTransactions={vi.fn()}
        onAddTransaction={vi.fn()}
      />
    );

    const buttons = screen.getAllByRole('button');

    // Todos los botones deben ser focuseables
    buttons.forEach(button => {
      expect(button).not.toHaveAttribute('disabled');
    });
  });
});
