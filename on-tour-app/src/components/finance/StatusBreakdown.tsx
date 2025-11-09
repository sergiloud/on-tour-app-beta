import React from 'react';
import { Card } from '../../ui/Card';
import { t } from '../../lib/i18n';
import { useSettings } from '../../context/SettingsContext';
import { useFinance } from '../../context/FinanceContext';

const fmtEuro = (n: number) => '€' + Math.round(n).toLocaleString();

export const StatusBreakdown: React.FC = () => {
  const { fmtMoney, region, dateRange, selectedStatuses, setSelectedStatuses } = useSettings();
  const { statusBreakdown: s, loading } = useFinance();
  if (loading) {
    return (
      <Card className="p-4 space-y-2 overflow-hidden" aria-busy>
  <h3 className="widget-title">{t('finance.byStatus')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 min-w-0 animate-pulse">
              <div className="h-3 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded w-24" />
              <div className="h-4 bg-white/20 rounded w-16" />
            </div>
          ))}
        </div>
      </Card>
    );
  }
  const Item: React.FC<{ label: string; count: number; total: number; tone: string }>=({ label, count, total, tone })=> (
    <div className="flex items-center justify-between px-3 py-2 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 min-w-0">
      <span className="text-xs opacity-80 truncate">{label} <span className="opacity-60">({count})</span></span>
      <strong className={`text-sm whitespace-nowrap tabular-nums ${tone}`}>{fmtMoney ? fmtMoney(total) : fmtEuro(total)}</strong>
    </div>
  );
  return (
    <Card className="p-4 space-y-2 overflow-hidden">
      <div className="flex items-center justify-between gap-2">
  <h3 className="widget-title">{t('finance.byStatus')}</h3>
        <div className="flex items-center gap-2 text-[10px] opacity-75">
            <span className="hidden sm:inline">{t('shows.filters.region')||'Region'}: {region} · {t('common.date')||'Date'}: {dateRange.from || '—'} → {dateRange.to || '—'}</span>
          </div>
      </div>
        <div className="flex items-center gap-1 flex-wrap text-[11px]">
          <button className={`px-2 py-0.5 rounded border bg-white/5 hover:bg-slate-200 dark:bg-white/10 border-white/10`} onClick={()=> setSelectedStatuses(['confirmed','pending','offer'])} title={t('ah.filter.all')||'All'}>{t('ah.filter.all')||'All'}</button>
          <button className={`px-2 py-0.5 rounded border bg-white/5 hover:bg-slate-200 dark:bg-white/10 border-white/10`} onClick={()=> setSelectedStatuses([])} title={t('common.hide')||'None'}>{t('common.hide')||'None'}</button>
        {(['confirmed','pending','offer'] as const).map(st => {
          const count = st==='confirmed'? s.confirmed.count : st==='pending'? s.pending.count : s.offer.count;
          return (
            <button key={st} className={`px-2 py-0.5 rounded border ${selectedStatuses.includes(st)?'bg-accent-500 text-black border-transparent':'bg-white/5 hover:bg-slate-200 dark:bg-white/10 border-white/10'}`}
              onClick={()=> {
                const next = selectedStatuses.includes(st) ? selectedStatuses.filter(x=> x!==st) : [...selectedStatuses, st];
                setSelectedStatuses(next);
              }}
              aria-pressed={selectedStatuses.includes(st)}
            >{t(`finance.${st}`)} <span className="opacity-80">({count})</span></button>
          );
        })}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Item label={t('finance.confirmed')} count={s.confirmed.count} total={s.confirmed.total} tone="text-emerald-400" />
        <Item label={t('finance.pending')} count={s.pending.count} total={s.pending.total} tone="text-amber-400" />
        <Item label={t('finance.offer')} count={s.offer.count} total={s.offer.total} tone="text-sky-400" />
      </div>
    </Card>
  );
};

export default StatusBreakdown;
