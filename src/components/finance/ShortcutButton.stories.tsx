/**
 * Storybook Stories para ShortcutButton
 *
 * Botones de acceso directo reutilizables con diseño consistente
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ShortcutButton } from './ShortcutButton';
import { Plus, TrendingUp, TrendingDown, CreditCard, Receipt, Wallet, PieChart, BarChart3 } from 'lucide-react';

const meta: Meta<typeof ShortcutButton> = {
  title: 'Finance/Components/ShortcutButton',
  component: ShortcutButton,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0f172a' }]
    }
  },
  tags: ['autodocs'],
  argTypes: {
    colorScheme: {
      control: 'select',
      options: ['accent', 'amber'],
      description: 'Esquema de color semántico'
    },
    label: {
      control: 'text',
      description: 'Texto del botón'
    },
    onClick: {
      action: 'clicked',
      description: 'Callback al hacer clic'
    }
  }
};

export default meta;
type Story = StoryObj<typeof ShortcutButton>;

// ============================================================================
// Historias: Esquemas de Color
// ============================================================================

export const AccentGreen: Story = {
  args: {
    label: 'Añadir Ingreso',
    icon: Plus,
    colorScheme: 'accent'
  }
};

export const AmberOrange: Story = {
  args: {
    label: 'Añadir Gasto',
    icon: TrendingDown,
    colorScheme: 'amber'
  }
};

// ============================================================================
// Historias: Diferentes Iconos y Labels
// ============================================================================

export const TrendingUpIcon: Story = {
  args: {
    label: 'Ver Ingresos',
    icon: TrendingUp,
    colorScheme: 'accent'
  }
};

export const TrendingDownIcon: Story = {
  args: {
    label: 'Ver Gastos',
    icon: TrendingDown,
    colorScheme: 'amber'
  }
};

export const CreditCardIcon: Story = {
  args: {
    label: 'Pagos Pendientes',
    icon: CreditCard,
    colorScheme: 'accent'
  }
};

export const ReceiptIcon: Story = {
  args: {
    label: 'Generar Recibo',
    icon: Receipt,
    colorScheme: 'accent'
  }
};

export const WalletIcon: Story = {
  args: {
    label: 'Balance',
    icon: Wallet,
    colorScheme: 'accent'
  }
};

export const PieChartIcon: Story = {
  args: {
    label: 'Ver Distribución',
    icon: PieChart,
    colorScheme: 'amber'
  }
};

export const BarChartIcon: Story = {
  args: {
    label: 'Ver Análisis',
    icon: BarChart3,
    colorScheme: 'accent'
  }
};

// ============================================================================
// Historias: Variaciones de Texto
// ============================================================================

export const TextoCorto: Story = {
  args: {
    label: 'Nuevo',
    icon: Plus,
    colorScheme: 'accent'
  }
};

export const TextoLargo: Story = {
  args: {
    label: 'Añadir Nueva Transacción Financiera',
    icon: Plus,
    colorScheme: 'accent'
  }
};

// ============================================================================
// Historias: Composiciones
// ============================================================================

export const GrupoDeAcciones: Story = {
  render: () => (
    <div className="flex gap-3">
      <ShortcutButton
        label="Añadir Ingreso"
        icon={Plus}
        colorScheme="accent"
        onClick={() => console.log('Add income')}
      />
      <ShortcutButton
        label="Añadir Gasto"
        icon={TrendingDown}
        colorScheme="amber"
        onClick={() => console.log('Add expense')}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Ejemplo de múltiples botones de acceso directo agrupados horizontalmente.'
      }
    }
  }
};

export const StackVertical: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <ShortcutButton
        label="Ver Ingresos"
        icon={TrendingUp}
        colorScheme="accent"
        onClick={() => console.log('View income')}
      />
      <ShortcutButton
        label="Ver Gastos"
        icon={TrendingDown}
        colorScheme="amber"
        onClick={() => console.log('View expenses')}
      />
      <ShortcutButton
        label="Ver Balance"
        icon={Wallet}
        colorScheme="accent"
        onClick={() => console.log('View balance')}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Ejemplo de botones apilados verticalmente para navegación o menús.'
      }
    }
  }
};

export const ConClasePersonalizada: Story = {
  args: {
    label: 'Botón Ancho',
    icon: Plus,
    colorScheme: 'accent',
    className: 'w-full'
  },
  parameters: {
    docs: {
      description: {
        story: 'Ejemplo usando la prop className para extender estilos (w-full para botón de ancho completo).'
      }
    }
  }
};

// ============================================================================
// Historias: Estados Interactivos
// ============================================================================

export const ConCallback: Story = {
  args: {
    label: 'Hacer Click',
    icon: Plus,
    colorScheme: 'accent',
    onClick: () => {
      alert('¡Botón clickeado!');
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Ejemplo con callback real. Haz clic para ver la alerta.'
      }
    }
  }
};

export const TodosLosEsquemas: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h3 className="text-slate-900 dark:text-white text-sm font-medium mb-2">Accent (Verde)</h3>
        <div className="flex gap-3">
          <ShortcutButton
            label="Normal"
            icon={Plus}
            colorScheme="accent"
            onClick={() => {}}
          />
          <ShortcutButton
            label="Con Icono Diferente"
            icon={TrendingUp}
            colorScheme="accent"
            onClick={() => {}}
          />
        </div>
      </div>
      <div>
        <h3 className="text-slate-900 dark:text-white text-sm font-medium mb-2">Amber (Naranja)</h3>
        <div className="flex gap-3">
          <ShortcutButton
            label="Normal"
            icon={TrendingDown}
            colorScheme="amber"
            onClick={() => {}}
          />
          <ShortcutButton
            label="Con Icono Diferente"
            icon={CreditCard}
            colorScheme="amber"
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparación visual de todos los esquemas de color disponibles.'
      }
    }
  }
};
