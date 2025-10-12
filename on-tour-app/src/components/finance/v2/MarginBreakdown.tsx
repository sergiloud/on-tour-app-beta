import React from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { useSettings } from '../../../context/SettingsContext';
import { selectBreakdownsV2 } from '../../../features/finance/selectors.v2';
import { announce } from '../../../lib/announcer';
import { t } from '../../../lib/i18n';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

const tabs = ['Region', 'Agency', 'Country', 'Promoter', 'Route'] as const;
type TabKind = typeof tabs[number];

type Props = {
  onSelect?: (kind: TabKind, value: string) => void;
};

const MarginBreakdown: React.FC<Props> = ({ onSelect }) => {
  const [active, setActive] = React.useState<typeof tabs[number]>('Region');
  const { v2, compareSnapshot } = useFinance();
  const { comparePrev, fmtMoney } = useSettings();

  const data = React.useMemo(() => {
    if (!v2) return [] as { key: string; net: number; income: number; expenses: number; count: number }[];
    switch (active) {
      case 'Region': return v2.breakdowns.region;
      case 'Agency': return v2.breakdowns.agency;
      case 'Country': return v2.breakdowns.country;
      case 'Promoter': return v2.breakdowns.promoter;
      case 'Route': return v2.breakdowns.route;
      default: return [];
    }
  }, [v2, active]);

  const prevData = React.useMemo(() => {
    if (!comparePrev || !compareSnapshot) return null as null | Record<string, number>;
    const prev = selectBreakdownsV2(compareSnapshot);
    let arr: { key: string; net: number }[] = [];
    switch (active) {
      case 'Region': arr = prev.region; break;
      case 'Agency': arr = prev.agency; break;
      case 'Country': arr = prev.country; break;
      case 'Promoter': arr = prev.promoter; break;
      case 'Route': arr = prev.route; break;
    }
    const map: Record<string, number> = {};
    arr.forEach(r => { map[r.key] = r.net; });
    return map;
  }, [comparePrev, compareSnapshot, active]);

  const totalNet = React.useMemo(() => data.reduce((sum, row) => sum + row.net, 0), [data]);
  const totalIncome = React.useMemo(() => data.reduce((sum, row) => sum + row.income, 0), [data]);

  return (
    <div className="bg-dark-800/50 rounded-lg border border-white/10 overflow-hidden">
      {/* Header with tabs */}
      <div className="px-8 py-4 border-b border-white/10 bg-dark-900/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-4 h-4 text-white/40" />
            <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">
              Performance Analysis
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="text-white/30">
              Total: <span className="tabular-nums text-white/70 font-medium">{fmtMoney(totalNet)}</span>
            </div>
            <div className="text-white/30">
              Items: <span className="tabular-nums text-white/70">{data.length}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2" aria-label={t('finance.breakdown.by') || 'Breakdown by'}>
          {tabs.map(tab => (
            <button
              key={tab}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${active === tab
                ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                : 'bg-white/5 text-white/60 border border-white/5 hover:bg-white/10 hover:text-white/80'
                }`}
              onClick={() => {
                setActive(tab);
                try { announce(`Breakdown by ${tab}`); } catch { }
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Data Cards Grid */}
      <div className="p-6">
        {data.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-sm text-white/40">
              {t('finance.breakdown.empty') || 'No breakdown available'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.slice(0, 12).map((row, idx) => {
              const prevNet = prevData?.[row.key];
              const delta = prevNet != null ? row.net - prevNet : null;
              const deltaPercent = prevNet && prevNet !== 0 ? ((delta! / prevNet) * 100).toFixed(1) : null;
              const share = totalNet > 0 ? ((row.net / totalNet) * 100).toFixed(1) : '0.0';
              const margin = row.income > 0 ? ((row.net / row.income) * 100).toFixed(1) : '0.0';

              return (
                <button
                  key={row.key}
                  className="bg-dark-900/50 rounded-lg border border-white/10 p-6 text-left hover:border-accent-500/30 hover:bg-dark-900/70 transition-all group"
                  onClick={() => {
                    onSelect?.(active, row.key);
                    try { announce(`Selected ${row.key}`); } catch { }
                  }}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white/40 mb-1">#{idx + 1}</div>
                      <div className="text-base font-medium text-white truncate mb-1">
                        {row.key}
                      </div>
                      <div className="text-xs text-white/50">
                        {row.count} show{row.count !== 1 ? 's' : ''} • {margin}% margin
                      </div>
                    </div>
                    {deltaPercent && (
                      <div className="flex items-center gap-1 ml-2">
                        {parseFloat(deltaPercent) >= 0 ? (
                          <>
                            <TrendingUp className="w-3 h-3 text-green-400" />
                            <span className="text-xs text-green-400">+{deltaPercent}%</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3 h-3 text-red-400" />
                            <span className="text-xs text-red-400">{deltaPercent}%</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Net Value */}
                  <div className="mb-4">
                    <div className="text-2xl font-light text-white tabular-nums mb-1">
                      {fmtMoney(row.net)}
                    </div>
                    <div className="text-xs text-white/40">
                      {share}% of total
                    </div>
                  </div>

                  {/* Mini Donut Chart - Revenue vs Expenses */}
                  <div className="relative">
                    <div className="flex items-center gap-3">
                      {/* Donut visualization */}
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <svg viewBox="0 0 36 36" className="transform -rotate-90">
                          {/* Background circle */}
                          <circle
                            cx="18"
                            cy="18"
                            r="15.5"
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="3"
                          />
                          {/* Net profit arc */}
                          <circle
                            cx="18"
                            cy="18"
                            r="15.5"
                            fill="none"
                            stroke={parseFloat(margin) >= 0 ? '#10b981' : '#ef4444'}
                            strokeWidth="3"
                            strokeDasharray={`${Math.max(0, Math.min(100, parseFloat(margin)))} 100`}
                            className="transition-all duration-300"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-white/90">{margin}%</span>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex-1 space-y-1.5 text-xs min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-white/50">Revenue</span>
                          <span className="text-white/70 tabular-nums truncate">{fmtMoney(row.income)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-white/50">Expenses</span>
                          <span className="text-white/70 tabular-nums truncate">{fmtMoney(row.expenses)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-[10px] pt-0.5 border-t border-white/5">
                          <span className="text-purple-400/70">↳ Incl. agency fees</span>
                          <span className="text-purple-400/50 italic">auto</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarginBreakdown;
