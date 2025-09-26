import React, { useMemo } from 'react';
import { Card } from '../../ui/Card';
import { ProgressBar } from '../../ui/ProgressBar';
import MiniChart from '../../ui/MiniChart';
import { useSettings } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';
import { useFinance } from '../../context/FinanceContext';

const money = (n: number) => '€' + Math.round(n).toLocaleString();

export const ThisMonth: React.FC = () => {
  const { fmtMoney, currency, region, dateRange } = useSettings();
  const { targets, loading, thisMonth, monthlySeries } = useFinance();
  if (loading) {
    return (
      <Card className="p-4 space-y-3 overflow-hidden" aria-busy>
  <h3 className="widget-title">{t('finance.thisMonth')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          {[1,2,3].map(i => (
            <div key={i} className="glass rounded p-3 border border-white/10 min-w-0 overflow-hidden animate-pulse">
              <div className="h-3 bg-white/10 rounded w-16" />
              <div className="h-6 bg-white/20 rounded w-24 mt-2" />
              <div className="h-2 bg-white/10 rounded w-full mt-3" />
            </div>
          ))}
        </div>
      </Card>
    );
  }
  const { income, expenses, net, prev } = thisMonth;
  const prevSafe = prev ?? { income: 0, expenses: 0, net: 0 };
  const pct = (a:number,b:number)=> b===0 ? 0 : Math.min(1, a/b);
  const mask = (s: string) => s;
  const Delta: React.FC<{ v: number }>=({ v }) => (
    <span className={`text-[10px] px-1 py-0.5 rounded whitespace-nowrap ${v>=0?'bg-emerald-500/15 text-emerald-300':'bg-rose-500/15 text-rose-300'}`}>{v>=0?'+':''}{mask(fmtMoney(Math.abs(v)))}</span>
  );
  const deviationBadge = (() => {
    const fc = undefined; // use quicklook/other panels for forecast; keep UI stable here
    if (typeof fc !== 'number') return null;
    const dev = net - fc;
    const pctDev = fc === 0 ? 0 : Math.round((dev / fc) * 100);
    const tone = dev >= 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300';
    const sign = dev >= 0 ? '+' : '';
    return <span className={`text-[10px] px-1 py-0.5 rounded ${tone}`} title={`vs forecast ${mask(fmtMoney(Math.abs(fc)))}`}>{sign}{pctDev}%</span>;
  })();
  return (
    <Card className="p-4 space-y-3 overflow-hidden" aria-busy={loading}>
      <div className="flex items-center justify-between gap-2">
  <h3 className="widget-title">{t('finance.thisMonth')}</h3>
        <div className="flex items-center gap-2 text-[10px] opacity-75">
          <span className="hidden sm:inline">{region} · {currency} · {dateRange.from || '—'} → {dateRange.to || '—'}</span>
          {deviationBadge}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
  <div className="glass rounded p-3 border border-white/10 min-w-0 overflow-hidden" title={`${t('finance.income')} target · ${fmtMoney(targets.incomeMonth)}`}> 
          <div className="opacity-70 text-xs">{t('finance.income')}</div>
            <div className="flex items-center gap-2 flex-wrap min-w-0 justify-between">
      <strong className="tabular-nums">{mask(fmtMoney(income))}</strong>
              <span className="text-[10px] opacity-70">MoM</span>
              <Delta v={income - prevSafe.income} />
            </div>
          {(
            <div className="mt-1">
              <MiniChart
                values={monthlySeries.income.slice(-4)}
                tone="emerald"
                ariaLabel="Income mini chart"
                mask={false}
              />
            </div>
          )}
          <ProgressBar className="mt-1" value={pct(income, targets.incomeMonth)} tone="emerald" height="xs" aria-label="Income progress" />
        </div>
  <div className="glass rounded p-3 border border-white/10 min-w-0 overflow-hidden" title={`${t('finance.expenses')} target · ${fmtMoney(targets.expensesMonth)}`}> 
          <div className="opacity-70 text-xs">{t('finance.expenses')}</div>
            <div className="flex items-center gap-2 flex-wrap min-w-0 justify-between">
      <strong className="tabular-nums">{mask(fmtMoney(expenses))}</strong>
              <span className="text-[10px] opacity-70">MoM</span>
              <Delta v={expenses - prevSafe.expenses} />
            </div>
          {(
            <div className="mt-1">
              <MiniChart values={monthlySeries.costs.slice(-4)} tone="rose" ariaLabel="Expenses mini chart" mask={false} />
            </div>
          )}
          <ProgressBar className="mt-1" value={pct(expenses, targets.expensesMonth)} tone="rose" height="xs" aria-label="Expenses progress" />
        </div>
  <div className="glass rounded p-3 border border-white/10 min-w-0 overflow-hidden" title={`${t('finance.net')} target · ${fmtMoney(targets.netMonth)}`}> 
          <div className="opacity-70 text-xs">{t('finance.net')}</div>
            <div className="flex items-center gap-2 flex-wrap min-w-0 justify-between">
  <strong className="tabular-nums net-highlight">{mask(fmtMoney(net))}</strong>
              <span className="text-[10px] opacity-70">MoM</span>
              <Delta v={net - prevSafe.net} />
            </div>
          {(
            <div className="mt-1">
              <MiniChart values={monthlySeries.net.slice(-4)} tone="accent" ariaLabel="Net mini chart" mask={false} />
            </div>
          )}
          <ProgressBar className="mt-1" value={pct(net, targets.netMonth)} tone="accent" height="xs" aria-label="Net progress" />
        </div>
      </div>
    </Card>
  );
};

export default ThisMonth;
