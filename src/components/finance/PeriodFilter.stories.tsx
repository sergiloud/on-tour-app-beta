/**
 * PeriodFilter Stories - Design System v2.0
 *
 * Componente de filtro de período para el módulo de finanzas.
 *
 * Características:
 * - Presets predefinidos (últimos 7/30 días, este mes, trimestre, año)
 * - Selector de rango personalizado
 * - Period Comparison mode selector
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import PeriodFilter from './PeriodFilter';
import type { PeriodPreset, DateRange } from './PeriodFilter';
import { FinancePeriodProvider } from '../../contexts/FinancePeriodContext';

const meta = {
  title: 'Finance/PeriodFilter',
  component: PeriodFilter,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Selector de período de tiempo con presets y opción de rango personalizado. Incluye modo de comparación de períodos.'
      }
    }
  },
  tags: ['autodocs'],
  decorators: [
    (Story: any) => (
      <FinancePeriodProvider>
        <div className="min-h-screen bg-dark-900 p-8 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <Story />
          </div>
        </div>
      </FinancePeriodProvider>
    ),
  ],
} satisfies Meta<typeof PeriodFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// STORIES: Estados del Filtro
// ============================================================================

export const EsteMes: Story = {
  render: () => {
    const [period, setPeriod] = useState<PeriodPreset>('thisMonth');
    const [range, setRange] = useState<DateRange>({
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    });

    return (
      <PeriodFilter
        value={period}
        dateRange={range}
        onChange={(preset, newRange) => {
          setPeriod(preset);
          setRange(newRange);
        }}
      />
    );
  },
};

export const Ultimos30Dias: Story = {
  render: () => {
    const [period, setPeriod] = useState<PeriodPreset>('last30days');
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [range, setRange] = useState<DateRange>({
      startDate: thirtyDaysAgo.toISOString().split('T')[0] || '',
      endDate: now.toISOString().split('T')[0] || ''
    });

    return (
      <PeriodFilter
        value={period}
        dateRange={range}
        onChange={(preset, newRange) => {
          setPeriod(preset);
          setRange(newRange);
        }}
      />
    );
  },
};

export const RangoPersonalizado: Story = {
  render: () => {
    const [period, setPeriod] = useState<PeriodPreset>('custom');
    const [range, setRange] = useState<DateRange>({
      startDate: '2023-12-01',
      endDate: '2024-01-15'
    });

    return (
      <PeriodFilter
        value={period}
        dateRange={range}
        onChange={(preset, newRange) => {
          setPeriod(preset);
          setRange(newRange);
        }}
      />
    );
  },
};

export const EsteTrimestre: Story = {
  render: () => {
    const [period, setPeriod] = useState<PeriodPreset>('thisQuarter');
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
    const quarterEnd = new Date(now.getFullYear(), quarter * 3 + 3, 0);

    const [range, setRange] = useState<DateRange>({
      startDate: quarterStart.toISOString().split('T')[0] || '',
      endDate: quarterEnd.toISOString().split('T')[0] || ''
    });

    return (
      <PeriodFilter
        value={period}
        dateRange={range}
        onChange={(preset, newRange) => {
          setPeriod(preset);
          setRange(newRange);
        }}
      />
    );
  },
};

// ============================================================================
// STORIES: Interactivo con Comparación
// ============================================================================

export const ConComparacion: Story = {
  render: () => {
    const [period, setPeriod] = useState<PeriodPreset>('thisMonth');
    const [range, setRange] = useState<DateRange>({
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    });

    return (
      <div className="space-y-4">
        <PeriodFilter
          value={period}
          dateRange={range}
          onChange={(preset, newRange) => {
            setPeriod(preset);
            setRange(newRange);
          }}
        />
        <div className="glass rounded-lg p-4 border border-white/10">
          <p className="text-sm text-slate-400 dark:text-white/60 mb-2">Período seleccionado:</p>
          <p className="text-slate-900 dark:text-white font-medium">
            {range.startDate} → {range.endDate}
          </p>
          <p className="text-sm text-slate-400 dark:text-white/60 mt-2">Preset: {period}</p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Ejemplo interactivo que muestra el período seleccionado y permite alternar el modo de comparación.'
      }
    }
  }
};

// ============================================================================
// STORIES: Layout con Dashboard
// ============================================================================

export const EnHeaderDashboard: Story = {
  render: () => {
    const [period, setPeriod] = useState<PeriodPreset>('thisMonth');
    const [range, setRange] = useState<DateRange>({
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    });

    return (
      <div className="w-full">
        <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Finanzas</h2>
              <p className="text-sm text-slate-300 dark:text-white/50">Centro de control financiero</p>
            </div>
            <PeriodFilter
              value={period}
              dateRange={range}
              onChange={(preset, newRange) => {
                setPeriod(preset);
                setRange(newRange);
              }}
            />
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Ejemplo de integración en el header de un dashboard real.'
      }
    }
  }
};
