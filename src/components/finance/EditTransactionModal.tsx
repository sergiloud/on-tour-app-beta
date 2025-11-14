import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { FirestoreFinanceService } from '../../services/firestoreFinanceService';
import { useAuth } from '../../context/AuthContext';
import { getCurrentOrgId } from '../../lib/tenants';
import { useToast } from '../../ui/Toast';
import type { TransactionV3 } from '../../types/financeV3';

interface EditTransactionModalProps {
  transaction: TransactionV3;
  isOpen: boolean;
  onClose: () => void;
  fmtMoney: (amount: number) => string;
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

export function EditTransactionModal({ 
  transaction, 
  isOpen, 
  onClose,
  fmtMoney 
}: EditTransactionModalProps) {
  const { userId } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    description: transaction.description,
    category: transaction.category,
    amount: transaction.amount,
    date: transaction.date.split('T')[0],
    type: transaction.type
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset form when transaction changes
  useEffect(() => {
    setFormData({
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount,
      date: transaction.date.split('T')[0],
      type: transaction.type
    });
    setValidationErrors({});
    setShowSuccess(false);
  }, [transaction]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.description.trim()) {
      errors.description = 'La descripción es obligatoria';
    }

    if (!formData.category) {
      errors.category = 'La categoría es obligatoria';
    }

    if (formData.amount <= 0) {
      errors.amount = 'El importe debe ser mayor que 0';
    }

    if (!formData.date) {
      errors.date = 'La fecha es obligatoria';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Por favor, corrige los errores del formulario');
      return;
    }

    if (!userId) {
      toast.error('Usuario no autenticado');
      return;
    }

    setIsSubmitting(true);

    try {
      const orgId = getCurrentOrgId();
      const updatedTransaction = {
        id: transaction.id,
        type: formData.type,
        amount: Number(formData.amount),
        currency: 'EUR',
        category: formData.category,
        description: formData.description,
        date: formData.date as string,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await FirestoreFinanceService.saveTransaction(updatedTransaction, userId, orgId);

      setShowSuccess(true);
      toast.success('Transacción actualizada correctamente');

      // Emit event for real-time refresh
      window.dispatchEvent(new CustomEvent('finance:transaction:updated'));

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Error al actualizar la transacción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!userId) {
      toast.error('Usuario no autenticado');
      return;
    }

    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar esta transacción?\n\n${transaction.description}\n${fmtMoney(transaction.amount)}`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const orgId = getCurrentOrgId();
      await FirestoreFinanceService.deleteTransaction(transaction.id, userId, orgId);

      toast.success('Transacción eliminada correctamente');

      // Emit event for real-time refresh
      window.dispatchEvent(new CustomEvent('finance:transaction:deleted'));

      onClose();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Error al eliminar la transacción');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isDeleting) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="glass rounded-xl border border-white/10 p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Editar Transacción</h3>
              <button
                onClick={handleClose}
                disabled={isSubmitting || isDeleting}
                className="p-2 rounded-lg hover:bg-white/5 transition-fast disabled:opacity-50"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Success State */}
            {showSuccess ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-accent-400 mx-auto mb-4" />
                </motion.div>
                <p className="text-lg font-medium text-white mb-2">¡Transacción actualizada!</p>
                <p className="text-sm text-white/60">Se cerrará automáticamente...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Descripción *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-interactive border ${
                      validationErrors.description ? 'border-red-500/50' : 'border-white/10'
                    } rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent-500/50 transition-fast`}
                    placeholder="Ej: Pago de hotel en Barcelona"
                    disabled={isSubmitting || isDeleting}
                  />
                  {validationErrors.description && (
                    <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors.description}</span>
                    </div>
                  )}
                </div>

                {/* Type & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Tipo *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                      className="w-full px-4 py-2.5 bg-interactive border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-500/50 transition-fast"
                      disabled={isSubmitting || isDeleting}
                    >
                      <option value="expense">Gasto</option>
                      <option value="income">Ingreso</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Categoría *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`w-full px-4 py-2.5 bg-interactive border ${
                        validationErrors.category ? 'border-red-500/50' : 'border-white/10'
                      } rounded-lg text-white focus:outline-none focus:border-accent-500/50 transition-fast`}
                      disabled={isSubmitting || isDeleting}
                    >
                      <option value="">Seleccionar...</option>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {validationErrors.category && (
                      <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                        <AlertCircle className="w-4 h-4" />
                        <span>{validationErrors.category}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount & Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Importe (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2.5 bg-interactive border ${
                        validationErrors.amount ? 'border-red-500/50' : 'border-white/10'
                      } rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent-500/50 transition-fast`}
                      placeholder="0.00"
                      disabled={isSubmitting || isDeleting}
                    />
                    {validationErrors.amount && (
                      <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                        <AlertCircle className="w-4 h-4" />
                        <span>{validationErrors.amount}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={`w-full px-4 py-2.5 bg-interactive border ${
                        validationErrors.date ? 'border-red-500/50' : 'border-white/10'
                      } rounded-lg text-white focus:outline-none focus:border-accent-500/50 transition-fast`}
                      disabled={isSubmitting || isDeleting}
                    />
                    {validationErrors.date && (
                      <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                        <AlertCircle className="w-4 h-4" />
                        <span>{validationErrors.date}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting || isDeleting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 font-medium hover:bg-red-500/20 transition-fast disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                  </motion.button>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting || isDeleting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2.5 bg-accent-500 text-white rounded-lg font-medium hover:bg-accent-600 transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
