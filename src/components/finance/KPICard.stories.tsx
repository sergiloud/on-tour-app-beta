/**
 * KPICard Stories - Design System v2.0
 *
 * Componente reutilizable para tarjetas KPI siguiendo el Design System.
 *
 * Casos de uso:
 * - Dashboard financiero
 * - Métricas de shows/tours
 * - Indicadores de rendimiento
 */

import type { Meta, StoryObj } from '@storybook/react';
import { KPICard } from './KPICard';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  ShoppingCart
} from 'lucide-react';

const meta = {
  title: 'Finance/KPICard',
  component: KPICard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Tarjeta KPI reutilizable con soporte para múltiples esquemas de color, iconos personalizados y barra de progreso opcional.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    colorScheme: {
      control: 'select',
      options: ['accent', 'amber', 'blue', 'purple'],
      description: 'Esquema de color semántico de la tarjeta'
    },
    icon: {
      control: false,
      description: 'Icono de Lucide React'
    },
    progress: {
      control: 'object',
      description: 'Configuración opcional de la barra de progreso'
    }
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-dark-900 p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof KPICard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// STORIES: Esquemas de Color
// ============================================================================

export const IngresosTotales: Story = {
  args: {
    title: 'Ingresos Totales',
    value: '€45,250',
    description: 'Recaudación del mes',
    icon: DollarSign,
    colorScheme: 'accent',
  },
};

export const GastosMensuales: Story = {
  args: {
    title: 'Gastos Totales',
    value: '€28,400',
    description: 'Costos operativos',
    icon: ShoppingCart,
    colorScheme: 'amber',
  },
};

export const BalanceNeto: Story = {
  args: {
    title: 'Balance Neto',
    value: '€16,850',
    description: 'Beneficio del período',
    icon: Wallet,
    colorScheme: 'blue',
  },
};

export const PagoPendiente: Story = {
  args: {
    title: 'Pendiente de Cobro',
    value: '€12,500',
    description: 'Facturas sin pagar',
    icon: CreditCard,
    colorScheme: 'purple',
  },
};

// ============================================================================
// STORIES: Con Barra de Progreso
// ============================================================================

export const ConProgresoCompleto: Story = {
  args: {
    title: 'Objetivo Mensual',
    value: '€50,000',
    description: 'Meta de ingresos',
    icon: TrendingUp,
    colorScheme: 'accent',
    progress: {
      current: 50000,
      target: 50000,
      label: 'Objetivo alcanzado'
    }
  },
};

export const ConProgresoMedio: Story = {
  args: {
    title: 'Objetivo Anual',
    value: '€320,000',
    description: 'Progreso del año',
    icon: TrendingUp,
    colorScheme: 'blue',
    progress: {
      current: 320000,
      target: 500000,
      label: 'Año hasta la fecha'
    }
  },
};

export const ConProgresoBajo: Story = {
  args: {
    title: 'Presupuesto Marketing',
    value: '€5,200',
    description: 'Usado este mes',
    icon: TrendingDown,
    colorScheme: 'amber',
    progress: {
      current: 5200,
      target: 20000,
      label: 'Del presupuesto total'
    }
  },
};

// ============================================================================
// STORIES: Variaciones de Contenido
// ============================================================================

export const SinDescripcion: Story = {
  args: {
    title: 'Tickets Vendidos',
    value: '1,247',
    icon: DollarSign,
    colorScheme: 'accent',
  },
};

export const ValorLargo: Story = {
  args: {
    title: 'Ingresos Anuales',
    value: '€1,234,567.89',
    description: 'Acumulado del ejercicio fiscal',
    icon: DollarSign,
    colorScheme: 'accent',
  },
};

export const ValorNegativo: Story = {
  args: {
    title: 'Pérdidas del Trimestre',
    value: '-€15,000',
    description: 'Déficit operativo',
    icon: TrendingDown,
    colorScheme: 'amber',
  },
};

// ============================================================================
// STORIES: Con Comparación (Period Comparison Feature)
// ============================================================================

export const ConComparacionPositiva: Story = {
  args: {
    title: 'Ingresos del Mes',
    value: '€52,000',
    description: 'Comparado con mes anterior',
    icon: TrendingUp,
    colorScheme: 'accent',
    comparison: {
      value: 45000,
      delta: 7000,
      deltaPercent: 15.6,
      mode: 'previous'
    }
  },
};

export const ConComparacionNegativa: Story = {
  args: {
    title: 'Gastos del Mes',
    value: '€32,000',
    description: 'Comparado con año pasado',
    icon: ShoppingCart,
    colorScheme: 'amber',
    comparison: {
      value: 28000,
      delta: 4000,
      deltaPercent: 14.3,
      mode: 'yearAgo'
    }
  },
};

export const ConComparacionNeutra: Story = {
  args: {
    title: 'Balance Estable',
    value: '€20,000',
    description: 'Sin variación significativa',
    icon: Wallet,
    colorScheme: 'blue',
    comparison: {
      value: 20000,
      delta: 0,
      deltaPercent: 0,
      mode: 'previous'
    }
  },
};

// ============================================================================
// STORIES: Grid Layout (Ejemplo de uso múltiple)
// ============================================================================

export const GridDashboard: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <KPICard
        title="Ingresos"
        value="€45,250"
        icon={DollarSign}
        colorScheme="accent"
        comparison={{
          value: 40000,
          delta: 5250,
          deltaPercent: 13.1,
          mode: 'previous'
        }}
      />
      <KPICard
        title="Gastos"
        value="€28,400"
        icon={ShoppingCart}
        colorScheme="amber"
        comparison={{
          value: 25000,
          delta: 3400,
          deltaPercent: 13.6,
          mode: 'previous'
        }}
      />
      <KPICard
        title="Balance"
        value="€16,850"
        icon={Wallet}
        colorScheme="blue"
        progress={{
          current: 16850,
          target: 20000,
          label: 'Objetivo mensual'
        }}
      />
      <KPICard
        title="Pendiente"
        value="€12,500"
        icon={CreditCard}
        colorScheme="purple"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Ejemplo de múltiples KPICards en un layout de grid típico de un dashboard.'
      }
    }
  }
};
