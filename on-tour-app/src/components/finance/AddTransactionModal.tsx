import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, Tag, FileText, TrendingUp, TrendingDown } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    type: type || 'expense',
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    amount: '',
    status: 'paid' as 'paid' | 'pending'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar la transacción
    console.log('Nueva transacción:', formData);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      type: type || 'expense',
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: '',
      amount: '',
      status: 'paid'
    });
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
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ej: Hotel Barcelona, Transporte Madrid..."
                    required
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 focus:outline-none focus:border-slate-300 dark:border-white/20 transition-colors"
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400 dark:text-white/40 mb-2">
                    <Tag className="w-3 h-3 inline mr-1" />
                    Categoría
                  </label>
                  {formData.type === 'income' ? (
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Ej: Ingresos por Shows, Merchandising..."
                      required
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 focus:outline-none focus:border-slate-300 dark:border-white/20 transition-colors"
                    />
                  ) : (
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-slate-300 dark:border-white/20 transition-colors"
                    >
                      <option value="">Selecciona una categoría</option>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
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
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      required
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 focus:outline-none focus:border-slate-300 dark:border-white/20 transition-colors"
                    />
                  </div>
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
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 text-white text-sm font-medium transition-all"
                  >
                    Limpiar
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all ${
                      formData.type === 'income'
                        ? 'bg-green-500/20 border border-green-500/30 hover:bg-green-500/30'
                        : 'bg-red-500/20 border border-red-500/30 hover:bg-red-500/30'
                    }`}
                  >
                    Guardar Transacción
                  </button>
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
