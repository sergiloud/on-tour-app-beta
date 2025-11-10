import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Download,
  Save,
  Star,
  Trash2,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { slideUp, staggerFast } from '../../lib/animations';
import type { TransactionV3 } from '../../types/financeV3';
import { useTransactionFilters } from '../../hooks/useTransactionFilters';
import { useSavedFilters } from '../../hooks/useSavedFilters';

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

export interface TransactionsTabProps {
  /** Todas las transacciones V3 (ya filtradas por período) */
  transactions: readonly TransactionV3[];

  /** Función de formateo de dinero */
  fmtMoney: (amount: number) => string;

  /** Callback para exportar a CSV */
  onExportCSV?: () => void;
}

/**
 * Componente de la pestaña Transacciones del módulo de Finanzas
 *
 * OPTIMIZACIÓN DE RENDIMIENTO:
 * - Virtualización con @tanstack/react-virtual
 * - Solo renderiza filas visibles en viewport (~20-30)
 * - Soporta 10,000+ transacciones sin degradación
 * - Scroll fluido con constant performance
 *
 * Responsabilidades:
 * - Filtrado y búsqueda de transacciones
 * - Tabla virtualizada con transacciones del período
 * - Exportación a CSV
 */
export function TransactionsTab({
  transactions,
  fmtMoney,
  onExportCSV,
}: TransactionsTabProps) {
  // Hook de filtrado (gestiona su propio estado)
  const {
    filterType,
    filterCategory,
    filterStatus,
    searchQuery,
    setFilterType,
    setFilterCategory,
    setFilterStatus,
    setSearchQuery,
    filteredTransactions,
    resetFilters,
    filteredCount,
    totalCount,
  } = useTransactionFilters(transactions);

  // Hook de vistas guardadas
  const {
    allViews,
    userViews,
    activeView,
    activeViewId,
    saveView,
    applyView,
    renameView,
    deleteView,
  } = useSavedFilters();

  // Estado para modal de guardar vista
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [editingViewId, setEditingViewId] = useState<string | null>(null);
  const [editingViewName, setEditingViewName] = useState('');

  // Aplicar filtros de la vista activa cuando cambia
  useEffect(() => {
    if (activeView) {
      setFilterType(activeView.filters.filterType);
      setFilterCategory(activeView.filters.filterCategory);
      setFilterStatus(activeView.filters.filterStatus);
      setSearchQuery(activeView.filters.searchQuery);
    }
  }, [activeViewId]); // Solo cuando cambia el ID, no los filtros

  // Función para guardar vista actual
  const handleSaveView = () => {
    if (newViewName.trim()) {
      saveView(newViewName.trim(), {
        filterType,
        filterCategory,
        filterStatus,
        searchQuery,
      });
      setNewViewName('');
      setShowSaveModal(false);
    }
  };

  // Función para renombrar vista
  const handleRenameView = (viewId: string) => {
    if (editingViewName.trim()) {
      renameView(viewId, editingViewName.trim());
      setEditingViewId(null);
      setEditingViewName('');
    }
  };

  // Ref para el contenedor scrollable
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Configurar virtualización (solo si hay muchas transacciones)
  const rowVirtualizer = useVirtualizer({
    count: filteredTransactions.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 60, // Altura estimada de cada fila en px
    overscan: 10, // Increased from 5 for smoother scrolling
  });

  return (
    <div className="space-y-4">
      {/* Selector de Vistas Guardadas */}
      <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 hover:border-blue-500/30 transition-fast">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-blue-400" />
            <span className="text-xs uppercase tracking-wide text-slate-300 dark:text-white/50 font-semibold">Vistas Guardadas</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSaveModal(true)}
            className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs text-blue-400 hover:bg-blue-500/30 transition-fast font-medium flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Guardar Vista Actual
          </motion.button>
        </div>

        {/* Lista de vistas */}
        <div className="flex flex-wrap items-center gap-2">
          {allViews.map(view => {
            const isActive = view.id === activeViewId;
            const isEditing = editingViewId === view.id;

            return (
              <div key={view.id} className="flex items-center gap-1">
                {isEditing ? (
                  // Modo edición
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editingViewName}
                      onChange={(e) => setEditingViewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameView(view.id);
                        if (e.key === 'Escape') {
                          setEditingViewId(null);
                          setEditingViewName('');
                        }
                      }}
                      className="px-2 py-1 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded text-xs text-white w-32 focus:outline-none focus:border-blue-500/50"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRenameView(view.id)}
                      className="p-1 rounded hover:bg-interactive-hover text-green-400"
                      title="Guardar"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingViewId(null);
                        setEditingViewName('');
                      }}
                      className="p-1 rounded hover:bg-interactive-hover text-red-400"
                      title="Cancelar"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  // Modo normal
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => applyView(view.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-fast ${
                        isActive
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-interactive text-slate-500 dark:text-white/70 hover:bg-interactive-hover hover:text-white'
                      }`}
                    >
                      {view.name}
                    </button>

                    {/* Acciones para vistas personalizadas */}
                    {!view.isPreset && (
                      <>
                        <button
                          onClick={() => {
                            setEditingViewId(view.id);
                            setEditingViewName(view.name);
                          }}
                          className="p-1 rounded hover:bg-interactive-hover text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/70 transition-colors"
                          title="Renombrar"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar la vista "${view.name}"?`)) {
                              deleteView(view.id);
                            }
                          }}
                          className="p-1 rounded hover:bg-interactive-hover text-slate-500 dark:text-white/50 hover:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contador de vistas personalizadas */}
        {userViews.length > 0 && (
          <div className="mt-3 pt-3 border-t border-theme">
            <p className="text-xs text-slate-300 dark:text-white/40">
              {userViews.length} vista{userViews.length !== 1 ? 's' : ''} personalizada{userViews.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Modal para guardar nueva vista */}
      {showSaveModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowSaveModal(false)}
        >
          <div
            className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Guardar Vista de Filtros</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-500 dark:text-white/70 mb-2">
                  Nombre de la vista
                </label>
                <input
                  type="text"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveView();
                    if (e.key === 'Escape') setShowSaveModal(false);
                  }}
                  placeholder="Ej: Gastos de Alojamiento Pendientes"
                  className="w-full px-4 py-2.5 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 focus:outline-none focus:border-blue-500/50"
                  autoFocus
                />
              </div>

              {/* Preview de filtros actuales */}
              <div className="bg-interactive rounded-lg p-3 border border-theme">
                <p className="text-xs text-slate-300 dark:text-white/50 mb-2">Filtros a guardar:</p>
                <div className="space-y-1 text-xs text-slate-500 dark:text-white/70">
                  <div><strong>Tipo:</strong> {filterType === 'all' ? 'Todos' : filterType === 'income' ? 'Ingresos' : 'Gastos'}</div>
                  <div><strong>Categoría:</strong> {filterCategory === 'all' ? 'Todas' : filterCategory}</div>
                  <div><strong>Estado:</strong> {filterStatus === 'all' ? 'Todos' : filterStatus === 'paid' ? 'Pagado' : 'Pendiente'}</div>
                  {searchQuery && <div><strong>Búsqueda:</strong> "{searchQuery}"</div>}
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveView}
                  disabled={!newViewName.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Guardar Vista
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowSaveModal(false);
                    setNewViewName('');
                  }}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-fast"
                >
                  Cancelar
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5 hover:border-accent-500/30 transition-fast">
        <div className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar transacciones por descripción, categoría o show..."
              className="w-full pl-11 pr-4 py-3 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 hover:border-slate-300 dark:hover:border-white/20 transition-fast"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-interactive-hover transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <svg className="w-4 h-4 text-slate-300 dark:text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-accent-400" />
              <span className="text-xs uppercase tracking-wide text-slate-300 dark:text-white/50 font-semibold">Filtros:</span>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accent-500/50 hover:border-slate-300 dark:hover:border-white/20 transition-fast cursor-pointer"
            >
              <option value="all">Todos los tipos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accent-500/50 hover:border-slate-300 dark:hover:border-white/20 transition-fast cursor-pointer"
            >
              <option value="all">Todas las categorías</option>
              <option value="Ingresos por Shows">Ingresos por Shows</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accent-500/50 hover:border-slate-300 dark:hover:border-white/20 transition-fast cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              <option value="paid">Pagado</option>
              <option value="pending">Pendiente</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetFilters}
              className="ml-auto px-4 py-2 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-xs text-white hover:bg-accent-500/20 hover:border-accent-500/30 transition-fast font-medium flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar filtros
            </motion.button>

            {onExportCSV && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onExportCSV}
                className="px-4 py-2 bg-accent-500/20 border border-accent-500/30 rounded-lg text-xs text-accent-400 hover:bg-accent-500/30 transition-fast font-medium flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar CSV
              </motion.button>
            )}
          </div>

          {/* Contador de resultados */}
          <div className="text-xs text-slate-300 dark:text-white/40">
            Mostrando <span className="text-accent-400 font-semibold">{filteredCount}</span> de <span className="text-slate-400 dark:text-white/60 font-semibold">{totalCount}</span> transacciones
          </div>
        </div>
      </div>

      {/* Tabla Virtualizada */}
      <div className="glass rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden hover:border-accent-500/30 transition-fast">
        <div
          ref={tableContainerRef}
          className="overflow-auto"
          style={{ maxHeight: '600px' }}
        >
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-[#0b0f14]/95 backdrop-blur-sm">
              <tr className="border-b border-slate-200 dark:border-white/10 bg-interactive">
                <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-wider text-slate-300 dark:text-white/50 font-semibold">Fecha</th>
                <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-wider text-slate-300 dark:text-white/50 font-semibold">Descripción</th>
                <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-wider text-slate-300 dark:text-white/50 font-semibold">Categoría</th>
                <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-wider text-slate-300 dark:text-white/50 font-semibold">Tipo</th>
                <th className="px-4 py-3.5 text-right text-[10px] uppercase tracking-wider text-slate-300 dark:text-white/50 font-semibold">Importe</th>
                <th className="px-4 py-3.5 text-center text-[10px] uppercase tracking-wider text-slate-300 dark:text-white/50 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-interactive flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-slate-200 dark:text-white/30" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 dark:text-white/60 font-medium">No se encontraron transacciones</p>
                        <p className="text-xs text-slate-400 dark:text-white/40 mt-1">Prueba ajustando los filtros</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {/* Espaciador superior (filas virtuales no renderizadas arriba) */}
                  {rowVirtualizer.getVirtualItems().length > 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ height: `${rowVirtualizer.getVirtualItems()[0]?.start ?? 0}px` }}
                      />
                    </tr>
                  )}

                  {/* Solo renderizar filas visibles */}
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const transaction = filteredTransactions[virtualRow.index];
                    if (!transaction) return null;

                    return (
                      <tr
                        key={transaction.id}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:bg-white/[0.03] transition-colors group"
                      >
                        <td className="px-4 py-3.5 text-sm text-slate-500 dark:text-white/70 whitespace-nowrap">
                          {new Date(transaction.date).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-medium text-theme-primary">{transaction.description}</p>
                          {transaction.tripTitle && (
                            <p className="text-xs text-slate-400 dark:text-white/40 mt-0.5">{transaction.tripTitle}</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs px-2 py-1 rounded-md bg-interactive text-slate-400 dark:text-white/60 border border-theme">
                            {transaction.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            {transaction.type === 'income' ? (
                              <TrendingUp className="w-4 h-4 text-accent-400" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-amber-400" />
                            )}
                            <span className="text-xs text-slate-400 dark:text-white/60 capitalize">{transaction.type === 'income' ? 'Ingreso' : 'Gasto'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <p className={`text-sm font-semibold tabular-nums ${
                            transaction.type === 'income' ? 'text-accent-400' : 'text-amber-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '−'}{fmtMoney(transaction.amount)}
                          </p>
                          {transaction.incomeDetail && (
                            <p className="text-xs text-slate-300 dark:text-white/30 tabular-nums mt-0.5">
                              Bruto: {fmtMoney(transaction.incomeDetail.grossFee)}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-block text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md border font-medium ${
                            transaction.status === 'paid'
                              ? 'bg-accent-500/10 text-accent-400 border-accent-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {transaction.status === 'paid' ? 'Pagado' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Espaciador inferior (filas virtuales no renderizadas abajo) */}
                  {rowVirtualizer.getVirtualItems().length > 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          height: `${
                            rowVirtualizer.getTotalSize() -
                            (rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1]?.end ?? 0)
                          }px`,
                        }}
                      />
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default React.memo(TransactionsTab);
