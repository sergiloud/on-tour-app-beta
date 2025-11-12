import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, Calendar, AlertTriangle } from 'lucide-react';
import { useKpi } from '../../../../context/KPIDataContext';
import { useSettings } from '../../../../context/SettingsContext';
import { useShows } from '../../../../hooks/useShows';
import type { Show } from '../../../../lib/shows';

interface FinanceStatsWidgetProps {
  className?: string;
}

interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}

export const FinanceStatsWidget: React.FC<FinanceStatsWidgetProps> = ({ className = '' }) => {
  const { raw } = useKpi();
  const { fmtMoney } = useSettings();
  const { shows } = useShows();

  // Calculate recent show expenses
  const recentShowExpenses = React.useMemo<ExpenseItem[]>(() => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    return shows
      .filter((s: Show) => new Date(s.date).getTime() >= sevenDaysAgo && s.cost)
      .sort((a: Show, b: Show) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
      .map((s: Show) => {
        const showDate = new Date(s.date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let dateLabel = showDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        if (showDate.toDateString() === today.toDateString()) {
          dateLabel = 'Hoy';
        } else if (showDate.toDateString() === yesterday.toDateString()) {
          dateLabel = 'Ayer';
        }
        
        return {
          id: s.id,
          category: 'Show',
          amount: s.cost || 0,
          date: dateLabel,
          description: `${s.city}, ${s.country}`,
        };
      });
  }, [shows]);

  const monthExpenses = raw.costsMonth || 0;
  const yearExpenses = shows.reduce((sum, s) => sum + (s.cost || 0), 0);

  const categoryIcons: Record<string, any> = {
    Show: Calendar,
    Alojamiento: Calendar,
    Transporte: TrendingDown,
    Comida: DollarSign,
  };

  const categoryColors: Record<string, { bg: string; icon: string }> = {
    Show: { bg: 'bg-accent-500/20', icon: 'text-accent-400' },
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
          <p className="text-[10px] text-white/60 font-medium mb-1">Mes</p>
          <p className="text-lg font-bold text-white">{fmtMoney(monthExpenses)}</p>
        </motion.div>

        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-[14px] p-2.5 border border-white/10"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-[10px] text-white/60 font-medium mb-1">Año</p>
          <p className="text-lg font-bold text-white">{fmtMoney(yearExpenses)}</p>
        </motion.div>
      </div>

      {/* Recent Expenses */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-white/70 mb-2">Recientes</h3>
        {recentShowExpenses.length === 0 ? (
          <div className="text-center py-4 text-white/40">
            <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">Sin gastos recientes</p>
          </div>
        ) : (
          recentShowExpenses.map((expense, index) => {
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
                    <p className="text-sm font-bold text-white">{fmtMoney(expense.amount)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Warning if high spending */}
      {monthExpenses > 5000 && (
        <motion.div
          className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-[14px] p-2.5 flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" strokeWidth={2.5} />
          <p className="text-[10px] text-yellow-200 font-medium">Gastos elevados este mes</p>
        </motion.div>
      )}
    </div>
  );
};
