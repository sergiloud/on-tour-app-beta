import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, Calendar, AlertTriangle } from 'lucide-react';

interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}

interface FinanceStatsWidgetProps {
  className?: string;
}

// Mock data - en producción vendría de useKpi o finance context
const MOCK_EXPENSES: Expense[] = [
  {
    id: '1',
    category: 'Alojamiento',
    amount: 350,
    date: 'Hoy',
    description: 'Hotel Barcelona',
  },
  {
    id: '2',
    category: 'Transporte',
    amount: 120,
    date: 'Ayer',
    description: 'Taxi aeropuerto',
  },
  {
    id: '3',
    category: 'Comida',
    amount: 85,
    date: 'Ayer',
    description: 'Cena equipo',
  },
];

export const FinanceStatsWidget: React.FC<FinanceStatsWidgetProps> = ({ className = '' }) => {
  const totalExpenses = MOCK_EXPENSES.reduce((sum, exp) => sum + exp.amount, 0);
  const todayExpenses = MOCK_EXPENSES.filter(e => e.date === 'Hoy').reduce((sum, exp) => sum + exp.amount, 0);

  const categoryIcons: Record<string, any> = {
    Alojamiento: Calendar,
    Transporte: TrendingDown,
    Comida: DollarSign,
  };

  const categoryColors: Record<string, { bg: string; icon: string }> = {
    Alojamiento: { bg: 'bg-blue-500/20', icon: 'text-blue-400' },
    Transporte: { bg: 'bg-purple-500/20', icon: 'text-purple-400' },
    Comida: { bg: 'bg-green-500/20', icon: 'text-green-400' },
  };

  return (
    <div className={`relative bg-white/5 backdrop-blur-md rounded-[28px] border border-white/10 overflow-hidden shadow-xl p-4 gpu-accelerate ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-green-400" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-white tracking-tight">Gastos</h2>
          <p className="text-[10px] text-white/50 font-medium">Últimos gastos</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-[14px] p-2.5 border border-white/10"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-[10px] text-white/60 font-medium mb-1">Hoy</p>
          <p className="text-lg font-bold text-white">€{todayExpenses}</p>
        </motion.div>

        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-[14px] p-2.5 border border-white/10"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-[10px] text-white/60 font-medium mb-1">Total</p>
          <p className="text-lg font-bold text-white">€{totalExpenses}</p>
        </motion.div>
      </div>

      {/* Recent Expenses */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-white/70 mb-2">Recientes</h3>
        {MOCK_EXPENSES.slice(0, 3).map((expense, index) => {
          const Icon = categoryIcons[expense.category] || DollarSign;
          const colors = categoryColors[expense.category] || { bg: 'bg-white/10', icon: 'text-white/60' };

          return (
            <motion.div
              key={expense.id}
              className="bg-white/5 backdrop-blur-sm rounded-[14px] p-2.5 border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-2.5">
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${colors.icon}`} strokeWidth={2.5} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{expense.description}</p>
                  <p className="text-[10px] text-white/50 font-medium">{expense.date}</p>
                </div>

                {/* Amount */}
                <div className="flex-shrink-0">
                  <p className="text-sm font-bold text-white">€{expense.amount}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Warning if high spending */}
      {totalExpenses > 500 && (
        <motion.div
          className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-[14px] p-2.5 flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" strokeWidth={2.5} />
          <p className="text-[10px] text-yellow-200 font-medium">Gastos elevados esta semana</p>
        </motion.div>
      )}
    </div>
  );
};
