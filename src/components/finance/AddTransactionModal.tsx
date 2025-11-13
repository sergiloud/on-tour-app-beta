import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, Tag, FileText, TrendingUp, TrendingDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { FirestoreFinanceService, type FinanceTransaction } from '../../services/firestoreFinanceService';
import { useAuth } from '../../context/AuthContext';
import { logger } from '../../lib/logger';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'income' | 'expense';
}

const EXPENSE_CATEGORIES = [
  'Alojamiento',
  'Transporte',
  'Dietas',
  'Producción',
  'Marketing',
  'Personal',
  'Logística',
  'Otros'
];

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, type }) => {
  const { userId } = useAuth();
  
  interface FormData {
    type: 'income' | 'expense';
    date: string;
    description: string;
    category: string;
    amount: string;
    status: 'paid' | 'pending';
  }

  const [formData, setFormData] = useState<FormData>({
    type: type || 'expense',
    date: new Date().toISOString().split('T')[0] as string,
    description: '',
    category: '',
    amount: '',
    status: 'paid'
  });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'La categoría es obligatoria';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El importe debe ser mayor que 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      logger.warn('Transaction form validation failed', {
        component: 'AddTransactionModal',
        errors
      });
      return;
    }

    if (!userId) {
      logger.error('Cannot save transaction: no user logged in', new Error('User not authenticated'), {
        component: 'AddTransactionModal'
      });
      setSaveStatus('error');
      return;
    }

    setSaving(true);
    setSaveStatus('idle');

    try {
      const transaction: FinanceTransaction = {
        id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        type: formData.type as 'income' | 'expense',
        amount: parseFloat(formData.amount),
        currency: 'EUR',
        category: formData.category,
        description: formData.description,
        date: formData.date as string, // Always initialized in state
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('[DEBUG AddTransactionModal] userId:', userId);
      console.log('[DEBUG AddTransactionModal] transaction:', transaction);
      
      await FirestoreFinanceService.saveTransaction(transaction, userId);
      console.log('[DEBUG AddTransactionModal] Firestore save completed');

      logger.info('Transaction saved successfully', {
        component: 'AddTransactionModal',
        transactionId: transaction.id,
        type: transaction.type,
        amount: transaction.amount
      });

      // Emit event to refresh transaction list
      console.log('[DEBUG AddTransactionModal] Dispatching event finance:transaction:created');
      window.dispatchEvent(new CustomEvent('finance:transaction:created', { detail: transaction }));
      console.log('[DEBUG AddTransactionModal] Event dispatched');

      setSaveStatus('success');

      // Reset form and close after short delay
      setTimeout(() => {
        handleReset();
        onClose();
        setSaveStatus('idle');
      }, 1500);

    } catch (error) {
      logger.error('Failed to save transaction', error as Error, {
        component: 'AddTransactionModal',
        formData
      });
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      type: type || 'expense',
      date: new Date().toISOString().split('T')[0] as string,
      description: '',
      category: '',
      amount: '',
      status: 'paid'
    });
    setErrors({});
    setSaveStatus('idle');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-lg border border-slate-200 dark:border-white/10 w-full max-w-lg pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      {formData.type === 'income' ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                        {formData.type === 'income' ? 'Añadir Ingreso' : 'Añadir Gasto'}
                      </h2>
                      <p className="text-xs text-slate-300 dark:text-white/50">
                        Registra una nueva transacción
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 flex items-center justify-center transition-all group"
                  >
                    <X className="w-4 h-4 text-slate-400 dark:text-white/60 group-hover:text-slate-900 dark:hover:text-white" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Tipo de transacción */}
                {!type && (
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-400 dark:text-white/40 mb-2">
                      Tipo
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'income' })}
                        className={`p-3 rounded-lg border transition-all ${
                          formData.type === 'income'
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/60 hover:border-white/20'
                        }`}
                      >
                        <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs font-medium">Ingreso</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'expense' })}
                        className={`p-3 rounded-lg border transition-all ${
                          formData.type === 'expense'
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/60 hover:border-white/20'
                        }`}
                      >
                        <TrendingDown className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs font-medium">Gasto</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Fecha */}
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400 dark:text-white/40 mb-2">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-slate-300 dark:border-white/20 transition-colors"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400 dark:text-white/40 mb-2">
                    <FileText className="w-3 h-3 inline mr-1" />
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      if (errors.description) setErrors({ ...errors, description: '' });
                    }}
                    placeholder="Ej: Hotel Barcelona, Transporte Madrid..."
                    required
                    className={`w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border ${
                      errors.description ? 'border-red-500/50' : 'border-slate-200 dark:border-white/10'
                    } rounded-lg text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-accent-500/50 transition-colors`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400 dark:text-white/40 mb-2">
                    <Tag className="w-3 h-3 inline mr-1" />
                    Categoría
                  </label>
                  {formData.type === 'income' ? (
                    <>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => {
                          setFormData({ ...formData, category: e.target.value });
                          if (errors.category) setErrors({ ...errors, category: '' });
                        }}
                        placeholder="Ej: Ingresos por Shows, Merchandising..."
                        required
                        className={`w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border ${
                          errors.category ? 'border-red-500/50' : 'border-slate-200 dark:border-white/10'
                        } rounded-lg text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-accent-500/50 transition-colors`}
                      />
                      {errors.category && (
                        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.category}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <select
                        value={formData.category}
                        onChange={(e) => {
                          setFormData({ ...formData, category: e.target.value });
                          if (errors.category) setErrors({ ...errors, category: '' });
                        }}
                        required
                        className={`w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border ${
                          errors.category ? 'border-red-500/50' : 'border-slate-200 dark:border-white/10'
                        } rounded-lg text-white text-sm focus:outline-none focus:border-accent-500/50 transition-colors`}
                      >
                        <option value="">Selecciona una categoría</option>
                        {EXPENSE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.category}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Importe */}
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400 dark:text-white/40 mb-2">
                    <DollarSign className="w-3 h-3 inline mr-1" />
                    Importe
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/40">€</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => {
                        setFormData({ ...formData, amount: e.target.value });
                        if (errors.amount) setErrors({ ...errors, amount: '' });
                      }}
                      placeholder="0.00"
                      required
                      className={`w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-white/5 border ${
                        errors.amount ? 'border-red-500/50' : 'border-slate-200 dark:border-white/10'
                      } rounded-lg text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-accent-500/50 transition-colors`}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.amount}
                    </p>
                  )}
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400 dark:text-white/40 mb-2">
                    Estado
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'paid' })}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        formData.status === 'paid'
                          ? 'bg-green-500/10 border-green-500/30 text-green-400'
                          : 'bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/60 hover:border-white/20'
                      }`}
                    >
                      Pagado
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'pending' })}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        formData.status === 'pending'
                          ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                          : 'bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/60 hover:border-white/20'
                      }`}
                    >
                      Pendiente
                    </button>
                  </div>
                </div>

                {/* Botones */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  {/* Status feedback */}
                  {saveStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Transacción guardada exitosamente</span>
                    </motion.div>
                  )}
                  
                  {saveStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Error al guardar. Inténtalo de nuevo.</span>
                    </motion.div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={saving}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white/10 hover:border-white/20 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Limpiar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        formData.type === 'income'
                          ? 'bg-green-500/20 border border-green-500/30 hover:bg-green-500/30'
                          : 'bg-red-500/20 border border-red-500/30 hover:bg-red-500/30'
                      }`}
                    >
                      {saving ? 'Guardando...' : 'Guardar Transacción'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddTransactionModal;
