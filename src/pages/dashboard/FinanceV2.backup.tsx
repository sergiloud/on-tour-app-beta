import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard,
  Plus, Search, Filter, Download, Calendar, Tag,
  PieChart as PieChartIcon, BarChart3, Receipt, AlertCircle
} from 'lucide-react';
import { buildFinanceSnapshot } from '../../features/finance/snapshot';
import { useSettings } from '../../context/SettingsContext';
import { trackPageView } from '../../lib/activityTracker';
import { useAuth } from '../../context/AuthContext';
import { slideUp, fadeIn, staggerFast } from '../../lib/animations';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import AddTransactionModal from '../../components/finance/AddTransactionModal';
import PeriodFilter from '../../components/finance/PeriodFilter';
import { useFinancePeriod, FinancePeriodProvider } from '../../contexts/FinancePeriodContext';
import { determineGroupingMode, groupTransactionsByPeriod, calculateAccumulatedBudget } from '../../lib/financeHelpers';
import { showToTransactionV3, calculateProfitabilityAnalysis } from '../../lib/profitabilityHelpers';
import { FinancialDistributionChart } from '../../components/finance/FinancialDistributionChart';
import { ProfitabilityWaterfallChart } from '../../components/finance/ProfitabilityWaterfallChart';
import { FinancialDistributionPieChart } from '../../components/finance/FinancialDistributionPieChart';
import { ProgressBar } from '../../ui/ProgressBar';
import type { TransactionV3 } from '../../types/financeV3';
import Papa from 'papaparse';

// Tipos para transacciones
interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  status: 'paid' | 'pending';
  tripTitle?: string;
}

// Tipos para presupuestos
interface BudgetCategory {
  category: string;
  budget: number;
  spent: number;
  percentage: number;
}

// Categorías de gastos
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

// Etiquetas de periodos
const PERIOD_LABELS: Record<string, string> = {
  last7days: 'Últimos 7 días',
  last30days: 'Últimos 30 días',
  thisMonth: 'Este mes',
  lastMonth: 'Mes pasado',
  thisQuarter: 'Este trimestre',
  lastQuarter: 'Trimestre pasado',
  thisYear: 'Este año',
  yearToDate: 'Año hasta hoy',
  allTime: 'Todos los periodos',
  custom: 'Personalizado'
};

// Colores semánticos del sistema de diseño v2.0
const CHART_COLORS = {
  income: 'rgba(16, 185, 129, 0.8)',    // accent/emerald - Ingresos
  expense: 'rgba(251, 146, 60, 0.8)',   // amber - Gastos
  net: 'rgba(59, 130, 246, 0.8)',       // blue - Balance/Neto
  categories: [
    'rgba(139, 92, 246, 0.8)',   // purple-500
    'rgba(59, 130, 246, 0.8)',   // blue-500
    'rgba(16, 185, 129, 0.7)',   // accent/emerald
    'rgba(251, 146, 60, 0.7)',   // amber
    'rgba(236, 72, 153, 0.7)',   // pink-500
    'rgba(139, 92, 246, 0.6)',   // purple-500 dim
    'rgba(59, 130, 246, 0.6)',   // blue-500 dim
    'rgba(156, 163, 175, 0.6)',  // gray-400
  ]
};

const FinanceV2Inner: React.FC = () => {
  const { userId } = useAuth();

  // Build snapshot directly from all shows (no global filters applied)
  const snapshot = useMemo(() => buildFinanceSnapshot(), []);

  // Mock targets (can be moved to useState + local storage later)
  const targets = useMemo(() => ({
    yearNet: 250000,
    pending: 50000,
    expensesMonth: 42000,
    netMonth: 60000,
    incomeMonth: 120000,
    costsMonth: 60000,
  }), []);

  const { fmtMoney } = useSettings();
  const { selectedPeriod, dateRange, setPeriod, isInPeriod } = useFinancePeriod();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'budgets'>('dashboard');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);

  React.useEffect(() => {
    trackPageView('finance-v2');
  }, [userId]);

  // Generar transacciones V3 desde shows reales con detalle completo
  const transactionsV3: TransactionV3[] = useMemo(() => {
    const transactions: TransactionV3[] = [];

    // Convertir cada show a transacciones V3 con detalle de comisiones y WHT
    snapshot.shows.forEach((show) => {
      // Incluir shows confirmados, pendientes y postponed
      if (show.status !== 'offer' && show.status !== 'canceled' && show.status !== 'archived') {
        const showTransactions = showToTransactionV3(show);
        transactions.push(...showTransactions);
      }
    });

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [snapshot.shows]);

  // Convertir TransactionV3 a Transaction simple para compatibilidad con UI existente
  const mockTransactions: Transaction[] = useMemo(() => {
    return transactionsV3.map(t => ({
      id: t.id,
      date: t.date,
      description: t.description,
      category: t.category,
      type: t.type,
      amount: t.amount,
      status: t.status,
      tripTitle: t.tripTitle
    }));
  }, [transactionsV3]);

  // Filtrar transacciones
  const filteredTransactions = useMemo(() => {
    let filtered = mockTransactions;

    // Filtrar por periodo
    filtered = filtered.filter(t => isInPeriod(t.date));

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [mockTransactions, filterType, filterCategory, filterStatus, searchQuery, isInPeriod]);

  // Calcular análisis de rentabilidad completo
  const profitabilityAnalysis = useMemo(() => {
    // Filtrar transactionsV3 por período
    const filteredV3 = transactionsV3.filter(t => isInPeriod(t.date));
    return calculateProfitabilityAnalysis(filteredV3);
  }, [transactionsV3, isInPeriod]);

  // Calcular datos para gráficos con agrupamiento dinámico
  const incomeVsExpensesData = useMemo(() => {
    const groupingMode = determineGroupingMode(dateRange.startDate, dateRange.endDate);
    const grouped = groupTransactionsByPeriod(
      filteredTransactions,
      groupingMode,
      dateRange.startDate,
      dateRange.endDate
    );

    return grouped.map(g => ({
      month: g.label,
      ingresos: g.income,
      gastos: g.expenses,
      neto: g.net
    }));
  }, [filteredTransactions, dateRange]);

  // Calcular gráfico presupuesto vs real
  const budgetVsRealData = useMemo(() => {
    const totalBudget = targets.expensesMonth;
    const daysInRange = Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const budgetPerDay = totalBudget / 30; // Asumiendo presupuesto mensual

    return calculateAccumulatedBudget(
      filteredTransactions,
      budgetPerDay,
      dateRange.startDate,
      dateRange.endDate
    ).map(d => ({
      fecha: d.label,
      presupuesto: Math.round(d.budgetAcc),
      real: Math.round(d.realAcc),
      diferencia: Math.round(d.difference)
    }));
  }, [filteredTransactions, dateRange, targets.expensesMonth]);

  // Calcular categorías de gasto
  const categoryData = useMemo(() => {
    const categoryTotals = new Map<string, number>();

    filteredTransactions
      .filter(t => t.type === 'expense' && t.status === 'paid')
      .forEach(t => {
        const current = categoryTotals.get(t.category) || 0;
        categoryTotals.set(t.category, current + t.amount);
      });

    return Array.from(categoryTotals.entries())
      .map(([category, value]) => ({ name: category, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Mock presupuestos
  const budgetCategories: BudgetCategory[] = useMemo(() => {
    return EXPENSE_CATEGORIES.map(cat => {
      const spent = categoryData.find(c => c.name === cat)?.value || 0;
      const budget = targets.expensesMonth / EXPENSE_CATEGORIES.length;
      return {
        category: cat,
        budget,
        spent,
        percentage: budget > 0 ? (spent / budget) * 100 : 0
      };
    });
  }, [categoryData, targets.expensesMonth]);

  // Calcular KPIs dinámicos basados en periodo
  const periodKPIs = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter(t => t.type === 'expense' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    const pending = filteredTransactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : -t.amount), 0);

    return {
      income,
      expenses,
      balance: income - expenses,
      pending
    };
  }, [filteredTransactions]);

  // Calcular balance neto
  const balance = snapshot.year.income - snapshot.year.expenses;
  const budgetRemaining = targets.yearNet - balance;

  // Calcular gastos por categoría para el gráfico de distribución
  const expensesByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();

    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });

    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount
    })).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Función para exportar transacciones a CSV
  const exportToCSV = () => {
    const exportData = filteredTransactions.map(t => ({
      Fecha: new Date(t.date).toLocaleDateString('es-ES'),
      Descripción: t.description,
      Categoría: t.category,
      Tipo: t.type === 'income' ? 'Ingreso' : 'Gasto',
      Importe: t.amount,
      Estado: t.status === 'paid' ? 'Pagado' : 'Pendiente',
      Tour: t.tripTitle || ''
    }));

    const csv = Papa.unparse(exportData, {
      delimiter: ',',
      header: true
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transacciones_${PERIOD_LABELS[selectedPeriod]}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Renderizar Dashboard Financiero
  const renderDashboard = () => (
    <motion.div variants={staggerFast} initial="initial" animate="animate" className="space-y-6">
      {/* KPI Cards - Diseño profesional refinado */}
      <motion.div variants={slideUp} className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <motion.div
          whileHover={{ scale: 1.01, y: -1 }}
          className="glass rounded-xl p-5 border border-slate-200 dark:border-white/10 hover:border-accent-500/30 transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center shadow-sm border border-white/5">
              <TrendingUp className="w-5 h-5 text-accent-400" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-medium">Ingresos Totales</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{fmtMoney(periodKPIs.income)}</div>
            <div className="text-xs text-slate-200 dark:text-white/30">Período seleccionado</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01, y: -1 }}
          className="glass rounded-xl p-5 border border-slate-200 dark:border-white/10 hover:border-amber-500/30 transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center shadow-sm border border-white/5">
              <TrendingDown className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-medium">Gastos Totales</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{fmtMoney(periodKPIs.expenses)}</div>
            <div className="text-xs text-slate-200 dark:text-white/30">Total de egresos</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01, y: -1 }}
          className="glass rounded-xl p-5 border border-slate-200 dark:border-white/10 hover:border-blue-500/30 transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center shadow-sm border border-white/5">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-medium">Balance Neto</div>
            <div className={`text-3xl font-bold tabular-nums ${periodKPIs.balance >= 0 ? 'text-accent-400' : 'text-red-400'}`}>
              {fmtMoney(periodKPIs.balance)}
            </div>
            <div className="text-xs text-slate-200 dark:text-white/30">
              {periodKPIs.balance >= 0 ? 'Superávit' : 'Déficit'}
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01, y: -1 }}
          className="glass rounded-xl p-5 border border-slate-200 dark:border-white/10 hover:border-purple-500/30 transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center shadow-sm border border-white/5">
              <CreditCard className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-medium">Pendiente</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{fmtMoney(periodKPIs.pending)}</div>
            <div className="text-xs text-slate-200 dark:text-white/30">Por cobrar/pagar</div>
          </div>
        </motion.div>
      </motion.div>

      {/* SECCIÓN: Análisis de Rentabilidad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Waterfall Chart - Flujo de Rentabilidad */}
        <motion.div variants={slideUp}>
          <ProfitabilityWaterfallChart
            analysis={profitabilityAnalysis}
            fmtMoney={fmtMoney}
          />
        </motion.div>

        {/* Pie Chart - Distribución Financiera Completa */}
        <motion.div variants={slideUp}>
          <FinancialDistributionPieChart
            distribution={profitabilityAnalysis.financialDistribution}
            grossIncome={profitabilityAnalysis.grossIncome}
            fmtMoney={fmtMoney}
          />
        </motion.div>
      </div>

      {/* Gráficos principales - Diseño profesional */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Gráfico Ingresos vs Gastos */}
        <motion.div variants={slideUp} className="lg:col-span-2 glass rounded-xl border border-slate-200 dark:border-white/10 p-6 hover:border-accent-500/30 transition-all">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center shadow-sm border border-white/5">
                  <BarChart3 className="w-5 h-5 text-accent-400" />
                </div>
                <h3 className="text-lg font-semibold text-white tracking-tight">Ingresos vs Gastos</h3>
              </div>
              <p className="text-xs text-slate-400 dark:text-white/40 ml-[52px]">Evolución temporal del flujo de caja</p>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium">Últimos 6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={incomeVsExpensesData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.income} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={CHART_COLORS.income} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.expense} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={CHART_COLORS.expense} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                stroke="rgba(255,255,255,0.3)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => fmtMoney(value)}
              />
              <Area
                type="monotone"
                dataKey="ingresos"
                stroke={CHART_COLORS.income}
                fillOpacity={1}
                fill="url(#colorIncome)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="gastos"
                stroke={CHART_COLORS.expense}
                fillOpacity={1}
                fill="url(#colorExpense)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Gráfico de Categorías */}
        <motion.div variants={slideUp} className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6 hover:border-accent-500/30 transition-all">
          <div className="mb-5">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center shadow-sm border border-white/5">
                <PieChartIcon className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white tracking-tight">Gastos por Categoría</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-white/40 ml-[52px]">Distribución de egresos</p>
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={(props: any) => {
                    const { name, percent } = props;
                    return `${name} ${((percent || 0) * 100).toFixed(0)}%`;
                  }}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS.categories[index % CHART_COLORS.categories.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => fmtMoney(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-400 dark:text-white/40 text-sm">
              No hay datos de gastos
            </div>
          )}
        </motion.div>
      </div>

      {/* Gráfico Presupuesto vs Real Acumulado - Header v2.0 + Colores Semánticos */}
      {budgetVsRealData.length > 0 && (
        <motion.div variants={slideUp} className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6 hover:border-accent-500/30 transition-all">
          <div className="mb-5">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center shadow-sm border border-white/5">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white tracking-tight">Presupuesto vs Real Acumulado</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-white/40 ml-[52px]">Seguimiento de la ejecución presupuestaria</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={budgetVsRealData}>
              <defs>
                <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(59, 130, 246, 0.8)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgba(59, 130, 246, 0.8)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(255, 255, 255, 0.9)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgba(255, 255, 255, 0.9)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="fecha"
                stroke="rgba(255,255,255,0.3)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => fmtMoney(value)}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="presupuesto"
                stroke="rgba(59, 130, 246, 0.8)"
                strokeWidth={2}
                dot={false}
                name="Presupuesto"
              />
              <Line
                type="monotone"
                dataKey="real"
                stroke="rgba(255, 255, 255, 0.9)"
                strokeWidth={2}
                dot={false}
                name="Real"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Transacciones Recientes - Diseño profesional */}
      <motion.div variants={slideUp} className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6 hover:border-accent-500/30 transition-all">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center shadow-sm border border-white/5">
                <Receipt className="w-5 h-5 text-accent-400" />
              </div>
              <h3 className="text-lg font-semibold text-white tracking-tight">Transacciones Recientes</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-white/40 ml-[52px]">Últimos movimientos registrados</p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs text-accent-400 hover:text-accent-300 transition-colors flex items-center gap-1.5 font-medium"
          >
            Ver todas
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="space-y-2.5">
          {mockTransactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-accent-500/20 hover:bg-slate-100 dark:bg-white/[0.06] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${
                  transaction.type === 'income'
                    ? 'from-accent-500/20 to-accent-600/10 border border-accent-500/10'
                    : 'from-amber-500/20 to-amber-600/10 border border-amber-500/10'
                } flex items-center justify-center`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-4 h-4 text-accent-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-0.5">{transaction.description}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-300 dark:text-white/40">
                    <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{transaction.category}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-base font-semibold tabular-nums mb-1 ${
                  transaction.type === 'income' ? 'text-accent-400' : 'text-amber-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '−'}{fmtMoney(transaction.amount)}
                </p>
                <span className={`inline-block text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md border font-medium ${
                  transaction.status === 'paid'
                    ? 'bg-accent-500/10 text-accent-400 border-accent-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {transaction.status === 'paid' ? 'Pagado' : 'Pendiente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Accesos Directos - Diseño profesional */}
      <motion.div variants={slideUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setShowAddTransactionModal(true)}
          className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5 hover:border-accent-500/30 hover:bg-slate-50 dark:bg-white/[0.03] transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm border border-white/5">
              <Plus className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-white tracking-tight mb-0.5">Añadir Ingreso</p>
              <p className="text-xs text-slate-300 dark:text-white/40">Registra un nuevo ingreso</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setShowAddTransactionModal(true)}
          className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5 hover:border-amber-500/30 hover:bg-slate-50 dark:bg-white/[0.03] transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm border border-white/5">
              <Plus className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-white tracking-tight mb-0.5">Añadir Gasto</p>
              <p className="text-xs text-slate-300 dark:text-white/40">Registra un nuevo gasto</p>
            </div>
          </div>
        </motion.button>
      </motion.div>
    </motion.div>
  );

  // Renderizar Tabla de Transacciones
  const renderTransactions = () => (
    <motion.div variants={staggerFast} initial="initial" animate="animate" className="space-y-4">
      {/* Filtros y búsqueda - Panel unificado mejorado */}
      <motion.div variants={slideUp} className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5 hover:border-accent-500/30 transition-all">
        <div className="space-y-4">
          {/* Barra de búsqueda con icono integrado */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar transacciones por descripción..."
              className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 focus:outline-none focus:border-white/30 hover:border-slate-300 dark:hover:border-white/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <svg className="w-4 h-4 text-slate-300 dark:text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filtros en grid */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-accent-400" />
              <span className="text-xs uppercase tracking-wide text-slate-300 dark:text-white/50 font-semibold">Filtros:</span>
            </div>

            {/* Tipo */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-accent-500/50 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer"
            >
              <option value="all">Todos los tipos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </select>

            {/* Categoría */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-accent-500/50 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer"
            >
              <option value="all">Todas las categorías</option>
              <option value="Ingresos por Shows">Ingresos por Shows</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Estado */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-accent-500/50 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              <option value="paid">Pagado</option>
              <option value="pending">Pendiente</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setFilterType('all');
                setFilterCategory('all');
                setFilterStatus('all');
                setSearchQuery('');
              }}
              className="ml-auto px-4 py-2 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-xs text-white hover:bg-accent-500/20 hover:border-accent-500/30 transition-all font-medium flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar filtros
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Tabla mejorada con mejor espaciado */}
      <motion.div variants={slideUp} className="glass rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden hover:border-accent-500/30 transition-all">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5">
                <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-wider text-slate-300 dark:text-white/50 font-semibold">Fecha</th>
                <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-wider text-slate-300 dark:text-white/50 font-semibold">Descripción</th>
                <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-wider text-slate-300 dark:text-white/50 font-semibold">Categoría</th>
                <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-wider text-slate-300 dark:text-white/50 font-semibold">Tipo</th>
                <th className="px-4 py-3.5 text-right text-[10px] uppercase tracking-wider text-slate-300 dark:text-white/50 font-semibold">Importe</th>
                <th className="px-4 py-3.5 text-center text-[10px] uppercase tracking-wider text-slate-300 dark:text-white/50 font-semibold">Estado</th>
                <th className="px-4 py-3.5 text-center text-[10px] uppercase tracking-wider text-slate-300 dark:text-white/50 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-slate-200 dark:text-white/30" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 dark:text-white/60 font-medium">No se encontraron transacciones</p>
                        <p className="text-xs text-slate-400 dark:text-white/40 mt-1">{PERIOD_LABELS[selectedPeriod]}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:bg-white/[0.03] transition-colors group"
                  >
                    <td className="px-4 py-3.5 text-sm text-slate-500 dark:text-white/70 whitespace-nowrap">
                      {new Date(transaction.date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{transaction.description}</p>
                      {transaction.tripTitle && (
                        <p className="text-xs text-slate-400 dark:text-white/40 mt-0.5">{transaction.tripTitle}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/60 border border-white/10">
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
                        <span className="text-xs text-slate-400 dark:text-white/60">
                          {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`text-sm font-semibold tabular-nums ${
                        transaction.type === 'income' ? 'text-accent-400' : 'text-amber-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{fmtMoney(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-block text-[10px] px-2.5 py-1 rounded-md font-medium ${
                        transaction.status === 'paid'
                          ? 'bg-accent-500/10 text-accent-400 border border-accent-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {transaction.status === 'paid' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1.5 rounded-md bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all"
                          aria-label="Editar"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-400 dark:text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1.5 rounded-md bg-slate-100 dark:bg-white/5 hover:bg-red-500/10 border border-slate-200 dark:border-white/10 hover:border-red-500/20 transition-all group/btn"
                          aria-label="Eliminar"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-400 dark:text-white/60 group-hover/btn:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Resumen con gradientes accent */}
      <motion.div variants={slideUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 hover:border-accent-500/30 transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-accent-400" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-accent-400 tabular-nums">
            {fmtMoney(filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))}
          </p>
          <p className="text-xs text-slate-300 dark:text-white/50 mt-1">Total Ingresos</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 hover:border-amber-500/30 transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-amber-400 tabular-nums">
            {fmtMoney(filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))}
          </p>
          <p className="text-xs text-slate-300 dark:text-white/50 mt-1">Total Gastos</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 hover:border-blue-500/30 transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-blue-400 tabular-nums">
            {fmtMoney(
              filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) -
              filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
            )}
          </p>
          <p className="text-xs text-slate-300 dark:text-white/50 mt-1">Balance Filtrado</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  // Renderizar Gestión de Presupuestos
  const renderBudgets = () => (
    <motion.div variants={staggerFast} initial="initial" animate="animate" className="space-y-4">
      <motion.div variants={slideUp} className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6 hover:border-accent-500/30 transition-all">
        <div className="mb-5">
          <h3 className="text-base font-semibold text-white mb-1">Presupuestos por Categoría</h3>
          <p className="text-xs text-slate-300 dark:text-white/40">Seguimiento de ejecución presupuestaria</p>
        </div>
        <div className="space-y-5">
          {budgetCategories.map((budget) => {
            // Determinar el tono según el porcentaje consumido - usando accent
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
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{budget.category}</span>
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
      </motion.div>

      {/* Alertas de presupuesto con accent */}
      <motion.div variants={slideUp} className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white mb-2">Alertas de Presupuesto</h4>
            {budgetCategories.filter(b => b.percentage >= 80).length > 0 ? (
              <ul className="space-y-2">
                {budgetCategories.filter(b => b.percentage >= 80).map(b => (
                  <li key={b.category} className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/60">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      b.percentage >= 100 ? 'bg-red-400' : 'bg-amber-400'
                    }`} />
                    <span className="font-medium text-slate-500 dark:text-white/70">{b.category}</span>
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
      </motion.div>
    </motion.div>
  );

  return (
    <>
      <AddTransactionModal
        isOpen={showAddTransactionModal}
        onClose={() => setShowAddTransactionModal(false)}
      />

      <div className="min-h-screen p-4 md:p-6 ml-2 md:ml-3">
        <motion.div
          className="max-w-[1400px] mx-auto space-y-5"
          variants={staggerFast}
          initial="initial"
          animate="animate"
        >
        {/* Header - Diseño refinado con gradiente accent */}
        <motion.div variants={slideUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-blue-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Finanzas</h1>
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
              <span className="hidden sm:inline">Añadir</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportToCSV}
              className="px-4 py-2.5 rounded-lg glass border border-slate-200 dark:border-white/10 hover:border-accent-500/30 text-sm flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={slideUp} className="flex items-center gap-2 border-b border-white/10">
          {(['dashboard', 'transactions', 'budgets'] as const).map((tab) => {
            const icons = {
              dashboard: BarChart3,
              transactions: Receipt,
              budgets: Wallet,
            };
            const labels = {
              dashboard: 'Dashboard',
              transactions: 'Transacciones',
              budgets: 'Presupuestos',
            };
            const Icon = icons[tab];

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-medium transition-all flex items-center gap-2 border-b-2 -mb-[1px] ${
                  activeTab === tab
                    ? 'border-accent-500 text-white'
                    : 'border-transparent text-slate-300 dark:text-white/50 hover:text-slate-500 dark:text-white/70 hover:border-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {labels[tab]}
              </button>
            );
          })}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderDashboard()}
            </motion.div>
          )}
          {activeTab === 'transactions' && (
            <motion.div key="transactions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderTransactions()}
            </motion.div>
          )}
          {activeTab === 'budgets' && (
            <motion.div key="budgets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderBudgets()}
            </motion.div>
          )}
        </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

const FinanceV2: React.FC = () => {
  return (
    <FinancePeriodProvider>
      <FinanceV2Inner />
    </FinancePeriodProvider>
  );
};

export default FinanceV2;
