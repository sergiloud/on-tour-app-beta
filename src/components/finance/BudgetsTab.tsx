import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { slideUp, staggerFast, fadeIn } from '../../lib/animations';
import { ProgressBar } from '../../ui/ProgressBar';
import type { BudgetCategory } from '../../hooks/useFinanceData';
import { usePerfMonitor } from '../../lib/perfMonitor';

export interface BudgetsTabProps {
  /** Categorías de presupuesto */
  budgetCategories: readonly BudgetCategory[];

  /** Función de formateo de dinero */
  fmtMoney: (amount: number) => string;
}

/**
 * Componente de la pestaña Presupuestos del módulo de Finanzas
 *
 * Responsabilidades:
 * - Mostrar progreso de presupuestos por categoría
 * - Alertas de presupuestos excedidos o cerca del límite
 */
export function BudgetsTab({
  budgetCategories,
  fmtMoney,
}: BudgetsTabProps) {
  // Performance monitoring
  usePerfMonitor('BudgetsTab:render');
  
  return (
    <div className="space-y-4">
      <div className="glass rounded-xl border border-theme p-6 hover:border-accent-500/30 transition-fast">
        <div className="mb-5">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Presupuestos por Categoría</h3>
          <p className="text-xs text-slate-300 dark:text-white/40">Seguimiento de ejecución presupuestaria</p>
        </div>
        <div className="space-y-5">
          {budgetCategories.map((budget) => {
            const getTone = (): 'accent' | 'amber' | 'rose' => {
              if (budget.percentage >= 100) return 'rose';
              if (budget.percentage >= 80) return 'amber';
              return 'accent';
            };

            const getStatusText = () => {
              if (budget.percentage >= 100) return 'Excedido';
              if (budget.percentage >= 80) return 'Cerca del límite';
              return 'Bajo control';
            };

            const getStatusColor = () => {
              if (budget.percentage >= 100) return 'text-red-400';
              if (budget.percentage >= 80) return 'text-amber-400';
              return 'text-accent-400';
            };

            return (
              <motion.div
                key={budget.category}
                variants={fadeIn}
                className="space-y-2.5"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-theme-primary">{budget.category}</span>
                    <span className={`text-xs font-medium ${getStatusColor()}`}>
                      {getStatusText()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-300 dark:text-white/50 tabular-nums">
                      {fmtMoney(budget.spent)} <span className="text-slate-300 dark:text-slate-200 dark:text-white/30">/</span> {fmtMoney(budget.budget)}
                    </span>
                    <span className={`text-sm font-bold tabular-nums min-w-[3ch] text-right ${getStatusColor()}`}>
                      {budget.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <ProgressBar
                  value={Math.min(budget.percentage / 100, 1)}
                  tone={getTone()}
                  height="md"
                  aria-label={`${budget.category} progress`}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Alertas de presupuesto */}
      <div className="glass rounded-xl border border-theme p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Alertas de Presupuesto</h4>
            {budgetCategories.filter(b => b.percentage >= 80).length > 0 ? (
              <ul className="space-y-2">
                {budgetCategories.filter(b => b.percentage >= 80).map(b => (
                  <li key={b.category} className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/60">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      b.percentage >= 100 ? 'bg-red-400' : 'bg-amber-400'
                    }`} />
                    <span className="font-medium text-theme-secondary">{b.category}</span>
                    <span>ha alcanzado el</span>
                    <span className={`font-semibold ${
                      b.percentage >= 100 ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {b.percentage.toFixed(0)}%
                    </span>
                    <span>del presupuesto</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-300 dark:text-white/50">
                No hay alertas activas. Todos los presupuestos están bajo control.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(BudgetsTab);
