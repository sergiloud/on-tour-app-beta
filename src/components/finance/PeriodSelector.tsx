import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { rangeForPreset, type PeriodPreset } from '../../features/finance/period';
import { t } from '../../lib/i18n';
import { trackEvent } from '../../lib/telemetry';
import { announce } from '../../lib/announcer';

const PeriodSelector: React.FC = () => {
  const { dateRange, setDateRange, periodPreset, setPeriodPreset, comparePrev, setComparePrev } = useSettings();
  const [preset, setPreset] = React.useState<PeriodPreset>(periodPreset);
  const [from, setFrom] = React.useState(dateRange.from);
  const [to, setTo] = React.useState(dateRange.to);
  React.useEffect(()=>{ setFrom(dateRange.from); setTo(dateRange.to); }, [dateRange.from, dateRange.to]);
  React.useEffect(()=>{ setPreset(periodPreset); }, [periodPreset]);

  const applyPreset = (p: PeriodPreset) => {
    setPreset(p);
    setPeriodPreset(p);
    if (p === 'CUSTOM') return;
    const r = rangeForPreset(p);
    setFrom(r.from); setTo(r.to);
    setDateRange(r);
    try { trackEvent('finance.period.change', { preset: p, from: r.from, to: r.to }); announce((t('hud.view.month')||'This Month')+': '+p); } catch {}
  };

  const applyCustom = () => {
    setPreset('CUSTOM');
    setPeriodPreset('CUSTOM');
    setDateRange({ from, to });
    try { trackEvent('finance.period.change', { preset: 'CUSTOM', from, to }); announce((t('finance.period.custom')||'Custom')+` ${from} → ${to}`); } catch {}
  };

  return (
    <div className="flex items-center gap-2 text-[11px]">
      <div className="inline-flex bg-slate-100 dark:bg-white/5 rounded-md overflow-hidden border border-white/10">
        {(['MTD','LAST_MONTH','YTD'] as PeriodPreset[]).map(p => (
          <button key={p} className={`px-2 py-1 ${preset===p?'bg-accent-500 text-black':'hover:bg-white/10'}`} onClick={()=> applyPreset(p)}>{
            p==='MTD'?t('finance.period.mtd'):'LAST_MONTH'===p?t('finance.period.lastMonth'):t('finance.period.ytd')
          }</button>
        ))}
        <button className={`px-2 py-1 ${preset==='CUSTOM'?'bg-accent-500 text-black':'hover:bg-white/10'}`} onClick={()=> setPreset('CUSTOM')}>{t('finance.period.custom')}</button>
      </div>
      <label className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-white/5 border border-white/10">
        <input type="checkbox" checked={!!comparePrev} onChange={(e)=>{ setComparePrev(e.target.checked); try { trackEvent('finance.compare.toggle', { on: e.target.checked }); announce((t('finance.compare')||'Compare prev')+': '+(e.target.checked?(t('common.on')||'on'):(t('common.off')||'off'))); } catch {} }} />
        <span>{t('finance.compare')||'Compare prev'}</span>
      </label>
      {preset==='CUSTOM' && (
        <div className="flex items-center gap-1">
          <input type="date" className="bg-slate-100 dark:bg-white/5 rounded px-2 py-1" value={from} onChange={e=> setFrom(e.target.value)} />
          <span>–</span>
          <input type="date" className="bg-slate-100 dark:bg-white/5 rounded px-2 py-1" value={to} onChange={e=> setTo(e.target.value)} />
          <button className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/15" onClick={applyCustom}>{t('common.apply')}</button>
        </div>
      )}
    </div>
  );
};

export default PeriodSelector;
