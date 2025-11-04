import React, { useState, useEffect, useMemo } from 'react';
import { useFinanceSnapshot } from '../../../hooks/useFinanceSnapshot';
import { useSettings } from '../../../context/SettingsContext';
import { t } from '../../../lib/i18n';
import { Plus, X, Calendar, DollarSign, Tag, FileText, TrendingDown, Filter, Users } from 'lucide-react';
import { loadExpenses, saveExpenses, loadDemoExpenses, type Expense as DemoExpense } from '../../../lib/expenses';
import { agenciesForShow, computeCommission } from '../../../lib/agencies';
import type { Show } from '../../../lib/shows';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { sanitizeName } from '../../../lib/sanitize';

type ExpenseCategory =
  | 'travel'
  | 'accommodation'
  | 'equipment'
  | 'marketing'
  | 'staff'
  | 'venue'
  | 'production'
  | 'other';

interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  notes?: string;
}

const CATEGORIES: { value: ExpenseCategory; label: string; color: string }[] = [
  { value: 'travel', label: 'Travel', color: 'blue' },
  { value: 'accommodation', label: 'Accommodation', color: 'purple' },
  { value: 'equipment', label: 'Equipment', color: 'green' },
  { value: 'marketing', label: 'Marketing', color: 'pink' },
  { value: 'staff', label: 'Staff', color: 'yellow' },
  { value: 'venue', label: 'Venue', color: 'red' },
  { value: 'production', label: 'Production', color: 'indigo' },
  { value: 'other', label: 'Other', color: 'gray' },
];

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'];

const ExpenseManager: React.FC = () => {
  const { allShows, fmtMoney, bookingAgencies, managementAgencies } = useFinanceSnapshot();
  const { currency } = useSettings();
  const [isAdding, setIsAdding] = useState(false);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');

  // Expenses state - load from localStorage on mount
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load expenses on mount and load demo data if needed
  useEffect(() => {
    const loaded = loadExpenses();
    if (loaded.length === 0) {
      // No expenses found, load demo data
      const result = loadDemoExpenses();
      if (result.added > 0) {
        // console.log(`Loaded ${result.added} demo expenses for Danny Avila`);
        setExpenses(loadExpenses());
      }
    } else {
      setExpenses(loaded);
    }
  }, []);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    if (expenses.length > 0) {
      saveExpenses(expenses);
    }
  }, [expenses]);

  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0],
    category: 'other',
    description: '',
    amount: 0,
    currency: currency || 'EUR',
    notes: '',
  });

  const filteredExpenses = filterCategory === 'all'
    ? expenses
    : expenses.filter(e => e.category === filterCategory);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Prepare data for pie chart
  const chartData = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return CATEGORIES
      .map(cat => ({
        name: cat.label,
        value: categoryTotals[cat.value] || 0,
        color: `hsl(var(--${cat.color}-500))`,
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Calculate agency commissions from all shows
  const agencyCommissions = useMemo(() => {
    const shows = (allShows as any[]) || [];
    const commissionsByAgency: Record<string, { name: string; amount: number; type: 'booking' | 'management' }> = {};

    shows.forEach(show => {
      if (show.status === 'offer') return; // Skip offers

      const applicable = agenciesForShow(show, bookingAgencies, managementAgencies);

      // Calculate booking commissions
      applicable.booking.forEach(agency => {
        const commission = computeCommission(show, [agency]);
        if (commission > 0) {
          if (!commissionsByAgency[agency.id]) {
            commissionsByAgency[agency.id] = { name: agency.name, amount: 0, type: 'booking' };
          }
          const entry = commissionsByAgency[agency.id];
          if (entry) entry.amount += commission;
        }
      });

      // Calculate management commissions
      applicable.management.forEach(agency => {
        const commission = computeCommission(show, [agency]);
        if (commission > 0) {
          if (!commissionsByAgency[agency.id]) {
            commissionsByAgency[agency.id] = { name: agency.name, amount: 0, type: 'management' };
          }
          const entry = commissionsByAgency[agency.id];
          if (entry) entry.amount += commission;
        }
      });
    });

    return Object.values(commissionsByAgency);
  }, [bookingAgencies, managementAgencies]);

  const totalAgencyCommissions = agencyCommissions.reduce((sum, a) => sum + a.amount, 0);

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount && newExpense.amount > 0) {
      const expenseDate = newExpense.date || new Date().toISOString().split('T')[0];
      if (!expenseDate) return; // Guard against empty date
      const expense: Expense = {
        id: Date.now().toString(),
        date: expenseDate,
        category: newExpense.category || 'other',
        description: newExpense.description,
        amount: newExpense.amount,
        currency: newExpense.currency || currency || 'EUR',
        notes: newExpense.notes,
      };
      setExpenses([expense, ...expenses]);
      setNewExpense({
        date: new Date().toISOString().split('T')[0],
        category: 'other',
        description: '',
        amount: 0,
        currency: currency || 'EUR',
        notes: '',
      });
      setIsAdding(false);
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const getCategoryColor = (category: ExpenseCategory) => {
    return CATEGORIES.find(c => c.value === category)?.color || 'gray';
  };

  const getCategoryLabel = (category: ExpenseCategory) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  return (
    <div className="bg-dark-800/50 rounded-lg border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-dark-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-4 h-4 text-white/40" />
            <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">
              Additional Expenses
            </h3>
          </div>
          <div className="flex items-center gap-4">
            {expenses.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">Total:</span>
                <span className="text-lg font-light text-white tabular-nums">{fmtMoney(totalExpenses)}</span>
              </div>
            )}
            <button
              onClick={() => setIsAdding(!isAdding)}
              className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-colors ${isAdding
                ? 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                }`}
            >
              {isAdding ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Expense</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Overlay for Add Expense Form */}
      {isAdding && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          onClick={() => setIsAdding(false)}
        >
          <div
            className="bg-ink-900 rounded-xl border-2 border-accent-500/30 p-8 space-y-5 max-w-2xl w-full shadow-2xl shadow-accent-500/20 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">New Expense</h4>
                <p className="text-xs text-white/60">Add a new expense to track additional costs</p>
              </div>
              <button
                onClick={() => setIsAdding(false)}
                className="p-2 rounded-lg hover:bg-accent-500/20 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Date */}
              <div>
                <label className="block text-xs text-white/70 mb-2 font-medium">Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-ink-800 border border-accent-500/20 rounded-lg text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs text-white/70 mb-2 font-medium">Category *</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })}
                    className="w-full pl-10 pr-3 py-2.5 bg-ink-800 border border-accent-500/20 rounded-lg text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30 appearance-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs text-white/70 mb-2 font-medium">Amount *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="number"
                      step="0.01"
                      value={newExpense.amount || ''}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full pl-10 pr-3 py-2.5 bg-ink-800 border border-accent-500/20 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30"
                    />
                  </div>
                  <select
                    value={newExpense.currency}
                    onChange={(e) => setNewExpense({ ...newExpense, currency: e.target.value })}
                    className="px-3 py-2.5 bg-ink-800 border border-accent-500/20 rounded-lg text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30 appearance-none font-medium"
                  >
                    {CURRENCIES.map(cur => (
                      <option key={cur} value={cur}>{cur}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-white/70 mb-2 font-medium">Description *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="e.g., Flight tickets, Hotel booking..."
                    className="w-full pl-10 pr-3 py-2.5 bg-ink-800 border border-accent-500/20 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs text-white/70 mb-2 font-medium">Notes <span className="text-white/40">(optional)</span></label>
              <textarea
                value={newExpense.notes}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                placeholder="Add any additional details, invoice numbers, or context..."
                rows={3}
                className="w-full px-4 py-3 bg-ink-800 border border-accent-500/20 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 justify-between pt-5 border-t border-accent-500/20">
              <p className="text-xs text-white/50">
                <span className="text-accent-400">*</span> Required fields
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-5 py-2.5 rounded-lg text-sm bg-white/10 hover:bg-white/15 text-white/80 hover:text-white border border-white/20 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddExpense}
                  disabled={!newExpense.description || !newExpense.amount || newExpense.amount <= 0}
                  className="px-5 py-2.5 rounded-lg text-sm bg-accent-500 hover:bg-accent-600 text-black border border-accent-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-accent-500 flex items-center gap-2 font-semibold shadow-lg shadow-accent-500/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Expense</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Agency Commissions Section */}
        {agencyCommissions.length > 0 && (
          <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-lg border border-purple-500/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Agency Commissions</h4>
                  <p className="text-xs text-white/50 mt-0.5">Calculated from all confirmed shows</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/40 mb-1">Total YTD</div>
                <div className="text-2xl font-light text-purple-300 tabular-nums">{fmtMoney(totalAgencyCommissions)}</div>
              </div>
            </div>

            {/* Agency Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {agencyCommissions.map(agency => {
                const percentage = totalAgencyCommissions > 0 ? (agency.amount / totalAgencyCommissions) * 100 : 0;
                const typeColor = agency.type === 'booking' ? 'blue' : 'emerald';
                return (
                  <div key={agency.name} className="bg-dark-900/60 rounded-lg border border-white/10 p-4 hover:border-purple-500/40 transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium bg-${typeColor}-500/20 text-${typeColor}-400 border border-${typeColor}-500/30 uppercase tracking-wide`}>
                            {agency.type}
                          </span>
                        </div>
                        <h5 className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                          {sanitizeName(agency.name)}
                        </h5>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="text-lg font-light text-white tabular-nums">
                        {fmtMoney(agency.amount)}
                      </div>
                      <div className="text-xs text-purple-400 font-medium">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r from-${typeColor}-500 to-${typeColor}-400 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary note */}
            <div className="mt-4 flex items-start gap-2 text-xs text-purple-300/70 bg-purple-900/20 rounded p-3 border border-purple-500/20">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Agency commissions are automatically calculated based on show dates, territories, and configured commission rates.</span>
            </div>
          </div>
        )}

        {/* Filters - Only show when there are expenses */}
        {expenses.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-white/5">
            <Filter className="w-4 h-4 text-white/40" />
            <span className="text-xs text-white/40 mr-2">Filter by:</span>
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterCategory === 'all'
                ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20'
                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'
                }`}
            >
              All ({expenses.length})
            </button>
            {CATEGORIES.map(cat => {
              const count = expenses.filter(e => e.category === cat.value).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.value}
                  onClick={() => setFilterCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterCategory === cat.value
                    ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'
                    }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Expense Distribution Chart */}
        {chartData.length > 0 && (
          <div className="bg-dark-900/50 rounded-xl border border-white/10 p-6 mb-6">
            <h4 className="text-sm font-semibold text-white/90 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-500"></div>
              Expense Distribution
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => {
                    const cat = CATEGORIES.find(c => c.label === entry.name);
                    const colors: Record<string, string> = {
                      blue: '#3b82f6',
                      purple: '#a855f7',
                      green: '#10b981',
                      pink: '#ec4899',
                      yellow: '#eab308',
                      red: '#ef4444',
                      indigo: '#6366f1',
                      gray: '#6b7280',
                    };
                    return <Cell key={`cell-${index}`} fill={colors[cat?.color || 'gray']} />;
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => fmtMoney(value)}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              <TrendingDown className="w-8 h-8 text-white/30" />
            </div>
            <h4 className="text-base font-medium text-white mb-2">
              {filterCategory === 'all' ? 'No expenses yet' : `No ${getCategoryLabel(filterCategory as ExpenseCategory).toLowerCase()} expenses`}
            </h4>
            <p className="text-sm text-white/50 max-w-sm mx-auto">
              {filterCategory === 'all'
                ? 'Add your first expense to start tracking additional costs beyond show expenses.'
                : 'Try selecting a different category or add a new expense.'
              }
            </p>
            {filterCategory === 'all' && !isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="mt-6 px-4 py-2 rounded text-sm bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Expense</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map(expense => (
              <div
                key={expense.id}
                className="bg-dark-900/50 rounded-lg border border-white/10 p-4 hover:border-white/20 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium bg-${getCategoryColor(expense.category)}-500/20 text-${getCategoryColor(expense.category)}-400 border border-${getCategoryColor(expense.category)}-500/30`}>
                        {getCategoryLabel(expense.category)}
                      </span>
                      <span className="text-xs text-white/40">{expense.date}</span>
                    </div>
                    <h5 className="text-sm font-medium text-white mb-1">{expense.description}</h5>
                    {expense.notes && (
                      <p className="text-xs text-white/50">{expense.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-lg font-light text-white tabular-nums">
                        {fmtMoney(expense.amount)}
                      </div>
                      {expense.currency && expense.currency !== currency && (
                        <div className="text-[10px] text-white/40 font-medium">
                          {expense.currency}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseManager;
