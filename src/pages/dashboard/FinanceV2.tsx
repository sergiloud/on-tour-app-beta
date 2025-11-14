/**
 * Finance V2 - Módulo de Finanzas Refactorizado
 *
 * ARQUITECTURA MODULAR PURA:
 * Este componente es un ORQUESTADOR PURO que NO contiene lógica de negocio.
 *
 * FLUJO DE DATOS (Abstracción en Capas):
 *
 * 1. CAPA DE ADQUISICIÓN:
 *    useRawTransactions → Obtiene datos crudos (abstrae la fuente)
 *
 * 2. CAPA DE PROCESAMIENTO:
 *    useFinanceData → Procesa y enriquece los datos
 *                   → Incluye operaciones (exportToCSV)
 *
 * 3. CAPA DE PRESENTACIÓN:
 *    FinanceV2 → Orquesta componentes de pestaña
 *              → Solo gestiona estado de UI
 *
 * RESPONSABILIDADES EXCLUSIVAS:
 * ✅ Gestionar estado de UI (tab activa, modal abierto/cerrado)
 * ✅ Obtener período seleccionado (context)
 * ✅ Enrutar a componentes de pestaña
 *
 * NO HACE (Delegado a hooks/componentes):
 * ❌ Generar transacciones (→ useRawTransactions)
 * ❌ Calcular KPIs/gráficos (→ useFinanceData)
 * ❌ Calcular presupuestos (→ useFinanceData)
 * ❌ Exportar CSV (→ useFinanceData.exportToCSV)
 * ❌ Filtrar transacciones (→ useTransactionFilters)
 * ❌ Renderizar JSX complejo (→ DashboardTab, TransactionsTab, BudgetsTab)
 *
 * BENEFICIOS:
 * - Máxima separación de incumbencias
 * - Fácil cambiar fuente de datos (solo modificar useRawTransactions)
 * - Testeable: Lógica 100% aislada en hooks
 * - Escalable: Añadir features sin tocar orquestador
 */

import React, { useState, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Plus, Download, BarChart3, Receipt, Wallet, TrendingUp, Loader2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { trackPageView } from '../../lib/activityTracker';
import { useAuth } from '../../context/AuthContext';
import { slideUp, staggerFast } from '../../lib/animations';
import PeriodFilter from '../../components/finance/PeriodFilter';
import { useFinancePeriod, FinancePeriodProvider } from '../../context/FinancePeriodContext';
import { FinanceTargetsProvider } from '../../context/FinanceTargetsContext';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { WorkerErrorState } from '../../components/finance/ErrorStates';
import { useRawTransactions } from '../../hooks/useRawTransactions';
import { useFinanceData } from '../../hooks/useFinanceData';
import { useFinanceWorker } from '../../hooks/useFinanceWorker';

// Lazy load modal pesado
const AddTransactionModal = lazy(() => import('../../components/finance/AddTransactionModal'));

// Lazy load tabs para reducir bundle inicial
const DashboardTab = lazy(() => import('../../components/finance/DashboardTab'));
const TransactionsTab = lazy(() => import('../../components/finance/TransactionsTab'));
const BudgetsTab = lazy(() => import('../../components/finance/BudgetsTab'));
const ProjectionsTab = lazy(() => import('../../components/finance/ProjectionsTab'));

// Skeleton loading para tabs
const TabSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-32 bg-interactive rounded-lg" />
    <div className="h-64 bg-interactive rounded-lg" />
    <div className="h-48 bg-interactive rounded-lg" />
  </div>
);

const FinanceV2Inner: React.FC = () => {
  const { userId } = useAuth();
  const { fmtMoney } = useSettings();
  const { selectedPeriod, dateRange, setPeriod, isInPeriod, comparisonMode, isInComparisonPeriod } = useFinancePeriod();

  // Estado del orquestador (SOLO UI state)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'budgets' | 'projections'>('dashboard');
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);

  React.useEffect(() => {
    trackPageView('finance-v2');
  }, [userId]);

  // ========================================================================
  // CAPA 1: Adquisición de datos crudos
  // ========================================================================
  const rawTransactions = useRawTransactions();

  // ========================================================================
  // CAPA 2: Procesamiento Inteligente (Renderizado Progresivo)
  // ========================================================================

  // Paso 2.1: Cálculo síncrono para respuesta inmediata
  // → Ahora obtiene targets del contexto automáticamente
  // → Si hay comparación activa, también calcula KPIs de comparación
  const syncFinanceData = useFinanceData(
    rawTransactions,
    dateRange,
    isInPeriod,
    selectedPeriod,
    comparisonMode !== 'none' ? isInComparisonPeriod : undefined
  );

  // Paso 2.2: Cálculo asíncrono para operaciones pesadas (Web Worker)
  // → Se activa automáticamente SOLO si hay >100 transacciones
  // → Calcula en background: profitabilityAnalysis, categoryData, etc.
  // → La UI permanece fluida mientras procesa
  const {
    data: workerData,
    isLoading: isWorkerLoading,
    error: workerError,
    computationTime
  } = useFinanceWorker(syncFinanceData.filteredTransactionsV3);

  // Paso 2.3: Fusión inteligente de datos
  // → Usa datos síncronos como base (respuesta inmediata)
  // → Cuando worker termina, hidrata con sus resultados (más precisos)
  // → Si hay error en worker, fallback a datos síncronos
  // → Pattern: Progressive Enhancement + Async Hydration + Error Recovery
  const financeData = useMemo(() => {
    if (workerData && !isWorkerLoading && !workerError) {
      // Worker completó exitosamente: usar sus cálculos optimizados
      return {
        ...syncFinanceData,
        profitabilityAnalysis: workerData.profitabilityAnalysis,
        categoryData: workerData.categoryData,
        expensesByCategory: workerData.expensesByCategory,
      };
    }
    // Worker procesando, error, o no activado: usar cálculo síncrono
    return syncFinanceData;
  }, [syncFinanceData, workerData, isWorkerLoading, workerError]);

  // Logging de performance y errores en desarrollo
  React.useEffect(() => {
    if (computationTime && import.meta.env.DEV) {
      console.log(`[FinanceV2] Worker computation: ${computationTime.toFixed(2)}ms`);
    }
    if (workerError && import.meta.env.DEV) {
      console.error('[FinanceV2] Worker error:', workerError);
    }
  }, [computationTime, workerError]);

  return (
    <>
      {showAddTransactionModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>}>
          <AddTransactionModal
            isOpen={showAddTransactionModal}
            onClose={() => setShowAddTransactionModal(false)}
          />
        </Suspense>
      )}

      <div className="min-h-screen p-4 md:p-6 ml-2 md:ml-3">
        <motion.div
          className="max-w-[1400px] mx-auto space-y-5"
          variants={staggerFast}
          initial="initial"
          animate="animate"
        >
          {/* Header - Diseño refinado */}
          <motion.div variants={slideUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-blue-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accent-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-theme-primary">Finanzas</h1>
                <p className="text-sm text-slate-300 dark:text-white/50">Centro de control financiero</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <PeriodFilter
                value={selectedPeriod}
                dateRange={dateRange}
                onChange={setPeriod}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddTransactionModal(true)}
                className="px-4 py-2.5 rounded-lg glass border border-slate-200 dark:border-white/10 hover:border-accent-500/30 text-sm flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Añadir Transacción</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={slideUp} className="flex items-center gap-2 border-b border-theme">
            {(['dashboard', 'transactions', 'budgets', 'projections'] as const).map((tab) => {
              const icons = {
                dashboard: BarChart3,
                transactions: Receipt,
                budgets: Wallet,
                projections: TrendingUp,
              };
              const labels = {
                dashboard: 'Dashboard',
                transactions: 'Transacciones',
                budgets: 'Presupuestos',
                projections: 'Proyecciones',
              };
              const Icon = icons[tab];

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-xs font-medium transition-all flex items-center gap-2 border-b-2 -mb-[1px] ${
                    activeTab === tab
                      ? 'border-accent-500 text-white'
                      : 'border-transparent text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/70 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {labels[tab]}
                </button>
              );
            })}
          </motion.div>

          {/* Content - Componentes modulares con Error Boundaries */}
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Mostrar advertencia si el worker falló */}
                {workerError && (
                  <WorkerErrorState
                    message="Los gráficos avanzados no están disponibles temporalmente."
                    errorDetails={workerError}
                  />
                )}

                {/* Envolver en ErrorBoundary para errores de renderizado */}
                <ErrorBoundary section="Dashboard">
                  <Suspense fallback={<TabSkeleton />}>
                    <DashboardTab
                      periodKPIs={financeData.periodKPIs}
                      comparisonKPIs={financeData.comparisonKPIs}
                      profitabilityAnalysis={financeData.profitabilityAnalysis}
                      incomeVsExpensesData={financeData.incomeVsExpensesData}
                      categoryData={financeData.categoryData}
                      recentTransactions={financeData.filteredTransactionsV3.slice(0, 5)}
                      fmtMoney={fmtMoney}
                      onViewAllTransactions={() => setActiveTab('transactions')}
                      onAddTransaction={() => setShowAddTransactionModal(true)}
                    />
                  </Suspense>
                </ErrorBoundary>
              </motion.div>
            )}
            {activeTab === 'transactions' && (
              <motion.div key="transactions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ErrorBoundary section="Transacciones">
                  <Suspense fallback={<TabSkeleton />}>
                    <TransactionsTab
                      transactions={syncFinanceData.filteredTransactionsV3}
                      fmtMoney={fmtMoney}
                      onExportCSV={financeData.exportToCSV}
                    />
                  </Suspense>
                </ErrorBoundary>
              </motion.div>
            )}
            {activeTab === 'budgets' && (
              <motion.div key="budgets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ErrorBoundary section="Presupuestos">
                  <Suspense fallback={<TabSkeleton />}>
                    <BudgetsTab
                      budgetCategories={financeData.budgetCategories}
                      fmtMoney={fmtMoney}
                    />
                  </Suspense>
                </ErrorBoundary>
              </motion.div>
            )}
            {activeTab === 'projections' && (
              <motion.div key="projections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ErrorBoundary section="Proyecciones">
                  <Suspense fallback={<TabSkeleton />}>
                    <ProjectionsTab
                      transactions={rawTransactions}
                      fmtMoney={fmtMoney}
                    />
                  </Suspense>
                </ErrorBoundary>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

/**
 * Wrapper principal con providers de contexto
 *
 * ARQUITECTURA DE CONTEXTOS:
 * - FinancePeriodProvider: Gestiona período de tiempo seleccionado
 * - FinanceTargetsProvider: Gestiona objetivos financieros configurables
 *
 * Esta separación permite:
 * - Configuración independiente de cada aspecto
 * - Testing más sencillo (mockear contextos)
 * - Features futuras (configuración de usuario, persistencia)
 */
const FinanceV2: React.FC = () => {
  return (
    <FinancePeriodProvider>
      <FinanceTargetsProvider>
        <FinanceV2Inner />
      </FinanceTargetsProvider>
    </FinancePeriodProvider>
  );
};

export default FinanceV2;
