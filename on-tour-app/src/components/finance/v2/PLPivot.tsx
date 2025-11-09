import React from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { useSettings } from '../../../context/SettingsContext';
import { t } from '../../../lib/i18n';
import { ArrowUpDown, TrendingUp } from 'lucide-react';

type Dim = 'Region' | 'Country' | 'Promoter' | 'Route' | 'Agency';
type SortKey = 'key' | 'income' | 'expenses' | 'net' | 'count' | 'gm';

interface Props { onViewInPL?: (kind: 'Region' | 'Country' | 'Promoter' | 'Route' | 'Agency', value: string) => void }

const PLPivot: React.FC<Props> = ({ onViewInPL }) => {
  const { v2 } = useFinance();
  const { fmtMoney } = useSettings();
  const [dim, setDim] = React.useState<Dim>('Region');
  const [sort, setSort] = React.useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'net', dir: 'desc' });

  const data = React.useMemo(() => {
    if (!v2) return [] as { key: string; income: number; expenses: number; net: number; count: number }[];
    const by = dim === 'Region' ? v2.breakdowns.region
      : dim === 'Country' ? v2.breakdowns.country
        : dim === 'Promoter' ? v2.breakdowns.promoter
          : dim === 'Route' ? v2.breakdowns.route
            : v2.breakdowns.agency;
    const rows = [...by].map(r => ({ ...r, gm: r.income ? (r.net / r.income) : 0 } as any));
    const m = sort.dir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      const va = (sort.key === 'key') ? a.key : (a as any)[sort.key];
      const vb = (sort.key === 'key') ? b.key : (b as any)[sort.key];
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * m;
      return String(va).localeCompare(String(vb)) * m;
    });
    return rows;
  }, [v2, dim, sort]);

  const totals = React.useMemo(() => {
    return data.reduce((acc, r) => {
      acc.income += r.income; acc.expenses += r.expenses; acc.net += r.net; acc.count += r.count; return acc;
    }, { income: 0, expenses: 0, net: 0, count: 0 });
  }, [data]);

  const setSortKey = (key: SortKey) => setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'key' ? 'asc' : 'desc' });

  return (
    <div className="bg-dark-800/50 rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-4 border-b border-slate-200 dark:border-white/10 bg-dark-900/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-slate-400 dark:text-white/40 uppercase tracking-wider">
            Pivot Analysis
          </h3>
          <div className="text-xs text-slate-200 dark:text-white/30">
            {totals.count} shows • {fmtMoney(totals.net)} net
          </div>
        </div>
        <div className="flex gap-2">
          {(['Region', 'Country', 'Promoter', 'Route', 'Agency'] as Dim[]).map(d => (
            <button
              key={d}
              onClick={() => setDim(d)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${dim === d
                ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                : 'bg-white/5 text-slate-400 dark:text-white/60 border border-slate-100 dark:border-white/5 hover:bg-slate-200 dark:bg-white/10 hover:text-slate-600 dark:text-white/80'
                }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-auto max-h-[500px]">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-dark-900 z-10">
            <tr className="border-b border-white/5">
              <th className="text-left px-6 py-3" aria-sort={sort.key === 'key' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <button
                  className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-white/40 uppercase tracking-wider hover:text-slate-400 dark:text-white/60 transition-colors"
                  onClick={() => setSortKey('key')}
                >
                  {dim}
                  {sort.key === 'key' && (
                    <ArrowUpDown className="w-3 h-3" />
                  )}
                </button>
              </th>
              <th className="text-right px-6 py-3" aria-sort={sort.key === 'income' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <button
                  className="flex items-center gap-2 ml-auto text-xs font-medium text-slate-400 dark:text-white/40 uppercase tracking-wider hover:text-slate-400 dark:text-white/60 transition-colors"
                  onClick={() => setSortKey('income')}
                >
                  Revenue
                  {sort.key === 'income' && (
                    <ArrowUpDown className="w-3 h-3" />
                  )}
                </button>
              </th>
              <th className="text-right px-6 py-3" aria-sort={sort.key === 'expenses' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <button
                  className="flex items-center gap-2 ml-auto text-xs font-medium text-slate-400 dark:text-white/40 uppercase tracking-wider hover:text-slate-400 dark:text-white/60 transition-colors group"
                  onClick={() => setSortKey('expenses')}
                  title="Includes show expenses and agency commissions"
                >
                  <span className="flex items-center gap-1">
                    Costs
                    <span className="text-[9px] text-purple-400/60 group-hover:text-purple-400 transition-colors">incl. agencies</span>
                  </span>
                  {sort.key === 'expenses' && (
                    <ArrowUpDown className="w-3 h-3" />
                  )}
                </button>
              </th>
              <th className="text-right px-6 py-3" aria-sort={sort.key === 'net' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <button
                  className="flex items-center gap-2 ml-auto text-xs font-medium text-slate-400 dark:text-white/40 uppercase tracking-wider hover:text-slate-400 dark:text-white/60 transition-colors"
                  onClick={() => setSortKey('net')}
                >
                  Net Profit
                  {sort.key === 'net' && (
                    <ArrowUpDown className="w-3 h-3" />
                  )}
                </button>
              </th>
              <th className="text-right px-6 py-3" aria-sort={sort.key === 'gm' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <button
                  className="flex items-center gap-2 ml-auto text-xs font-medium text-slate-400 dark:text-white/40 uppercase tracking-wider hover:text-slate-400 dark:text-white/60 transition-colors"
                  onClick={() => setSortKey('gm')}
                >
                  Margin
                  {sort.key === 'gm' && (
                    <ArrowUpDown className="w-3 h-3" />
                  )}
                </button>
              </th>
              <th className="text-right px-6 py-3" aria-sort={sort.key === 'count' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <button
                  className="flex items-center gap-2 ml-auto text-xs font-medium text-slate-400 dark:text-white/40 uppercase tracking-wider hover:text-slate-400 dark:text-white/60 transition-colors"
                  onClick={() => setSortKey('count')}
                >
                  Shows
                  {sort.key === 'count' && (
                    <ArrowUpDown className="w-3 h-3" />
                  )}
                </button>
              </th>
              <th className="text-center px-6 py-3">
                <span className="text-xs font-medium text-slate-400 dark:text-white/40 uppercase tracking-wider">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, idx) => (
              <tr
                key={r.key}
                className={`border-t border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${idx % 2 === 0 ? 'bg-dark-800/30' : ''
                  }`}
              >
                <td className="px-6 py-4 text-slate-700 dark:text-slate-700 dark:text-white/90 font-light">
                  {r.key || '—'}
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-slate-700 dark:text-slate-700 dark:text-white/90 font-light">
                  {fmtMoney(r.income)}
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-slate-500 dark:text-white/70 font-light">
                  {fmtMoney(r.expenses)}
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-white font-medium">
                  {fmtMoney(r.net)}
                </td>
                <td className="px-6 py-4 text-right tabular-nums">
                  <span className={`${(r as any).gm >= 0.5 ? 'text-green-400' : (r as any).gm >= 0.3 ? 'text-white/70' : 'text-red-400'}`}>
                    {Math.round((r as any).gm * 100)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-slate-400 dark:text-white/60 text-xs">
                  {r.count}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    className="px-3 py-1.5 rounded text-xs font-medium bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/15 border border-slate-200 dark:border-white/10 transition-colors"
                    onClick={() => onViewInPL?.(dim, r.key)}
                  >
                    View in P&L
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 bg-dark-900 border-t-2 border-white/10">
            <tr>
              <td className="px-6 py-4 text-xs font-medium text-slate-400 dark:text-white/40 uppercase tracking-wider">
                Total
              </td>
              <td className="px-6 py-4 text-right tabular-nums text-white font-medium">
                {fmtMoney(totals.income)}
              </td>
              <td className="px-6 py-4 text-right tabular-nums text-slate-500 dark:text-white/70 font-medium">
                {fmtMoney(totals.expenses)}
              </td>
              <td className="px-6 py-4 text-right tabular-nums text-white font-bold">
                {fmtMoney(totals.net)}
              </td>
              <td className="px-6 py-4 text-right tabular-nums text-accent-400 font-medium">
                {totals.income ? Math.round((totals.net / totals.income) * 100) : 0}%
              </td>
              <td className="px-6 py-4 text-right tabular-nums text-slate-400 dark:text-white/60 text-xs">
                {totals.count}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default PLPivot;
