import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, AlertCircle, CheckCircle2, Euro } from 'lucide-react';
import type { BudgetCategory } from '../../hooks/useFinanceData';

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetCategories: readonly BudgetCategory[];
  onSave: (budgets: Record<string, number>) => void;
}

const CATEGORIES = [
  'Alojamiento',
  'Transporte',
  'Dietas',
  'Producción',
  'Marketing',
  'Personal',
  'Logística',
  'Otros'
];

export function EditBudgetModal({ isOpen, onClose, budgetCategories, onSave }: EditBudgetModalProps) {
  // Initialize with current budgets
  const [budgets, setBudgets] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    budgetCategories.forEach(cat => {
      initial[cat.category] = cat.budget;
    });
    // Add any missing categories with 0 budget
    CATEGORIES.forEach(cat => {
      if (!(cat in initial)) {
        initial[cat] = 0;
      }
    });
    return initial;
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
      onSave(budgets);
      setSaveStatus('success');
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving budgets:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleBudgetChange = (category: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setBudgets(prev => ({ ...prev, [category]: numValue }));
  };

  const totalBudget = Object.values(budgets).reduce((sum, val) => sum + val, 0);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !saving) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="glass rounded-xl border border-white/10 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-accent-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Editar Presupuestos</h3>
                  <p className="text-sm text-white/60">Establece límites de gasto por categoría</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={saving}
                className="p-2 rounded-lg hover:bg-white/5 transition-fast disabled:opacity-50"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Success State */}
            {saveStatus === 'success' ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-accent-400 mx-auto mb-4" />
                </motion.div>
                <p className="text-lg font-medium text-white mb-2">¡Presupuestos actualizados!</p>
                <p className="text-sm text-white/60">Se cerrará automáticamente...</p>
              </div>
            ) : (
              <>
                {/* Total Budget Summary */}
                <div className="mb-6 p-4 rounded-xl bg-accent-500/10 border border-accent-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/80">Presupuesto Total</span>
                    <div className="flex items-center gap-2">
                      <Euro className="w-4 h-4 text-accent-400" />
                      <span className="text-lg font-bold text-accent-400 tabular-nums">
                        {totalBudget.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Budget Categories Grid */}
                <div className="space-y-4 mb-6">
                  {CATEGORIES.map((category) => {
                    const currentBudget = budgetCategories.find(b => b.category === category);
                    const spent = currentBudget?.spent || 0;
                    const budgetValue = budgets[category] || 0;
                    const percentage = budgetValue > 0 ? (spent / budgetValue) * 100 : 0;

                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-white/80">
                            {category}
                          </label>
                          {spent > 0 && (
                            <span className="text-xs text-white/50">
                              Gastado: €{spent.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>

                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Euro className="w-4 h-4 text-white/40" />
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={budgets[category] || ''}
                            onChange={(e) => handleBudgetChange(category, e.target.value)}
                            className="w-full pl-10 pr-20 py-2.5 bg-interactive border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent-500/50 transition-fast"
                            placeholder="0.00"
                            disabled={saving}
                          />
                          {percentage > 0 && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <span className={`text-xs font-medium tabular-nums ${
                                percentage >= 100 ? 'text-red-400' :
                                percentage >= 80 ? 'text-amber-400' :
                                'text-accent-400'
                              }`}>
                                {percentage.toFixed(0)}%
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Progress bar if there's spending */}
                        {spent > 0 && budgetValue > 0 && (
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                percentage >= 100 ? 'bg-red-500' :
                                percentage >= 80 ? 'bg-amber-500' :
                                'bg-accent-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Info Message */}
                <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-200">
                      Los presupuestos te ayudan a controlar tus gastos. Establece límites realistas
                      para cada categoría y recibe alertas cuando te acerques al límite.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2.5 bg-accent-500 text-white rounded-lg font-medium hover:bg-accent-600 transition-fast disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-500/30"
                  >
                    {saving ? 'Guardando...' : 'Guardar Presupuestos'}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
