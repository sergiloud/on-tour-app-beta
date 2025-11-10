import React, { useEffect, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { trackEvent } from '../../lib/telemetry';
import { announce } from '../../lib/announcer';
import { t } from '../../lib/i18n';
import { UIEvents } from '../../lib/telemetry/ui';
import { rangeForPreset } from '../../features/finance/period';

type Props = { className?: string; title?: string };

export const GlobalFilters: React.FC<Props> = ({ className = '', title = t('filters.title') || 'Filters' }) => {
  const { region, setRegion, dateRange, setDateRange, currency, setCurrency, presentationMode, setPresentationMode } = useSettings();
  const [open, setOpen] = useState<boolean>(()=>{ try { return localStorage.getItem('dash:filters:open') === '1'; } catch { return false; } });
  useEffect(()=>{ try { localStorage.setItem('dash:filters:open', open ? '1' : '0'); } catch{} }, [open]);
  useEffect(()=>{
    const onOpen = () => setOpen(true);
    window.addEventListener('global-filters:open', onOpen as any);
    return () => window.removeEventListener('global-filters:open', onOpen as any);
  }, []);
  const [lastAppliedRange, setLastAppliedRange] = useState<{from:string; to:string} | null>(null);
  return (
    <div className={`px-3 md:px-5 py-2 border-b border-slate-100 dark:border-white/5 bg-ink-900/20 backdrop-blur-xl ${className}`}>
      <div className="flex items-center justify-between">
        <button className="text-[12px] opacity-80 hover:opacity-100 underline" onClick={()=> setOpen(o=>{ const next = !o; try { trackEvent('filters.drawer', { open: next }); } catch{}; return next; })} aria-expanded={open} aria-controls="global-filters-body" title={t('filters.shortcutHint') || 'Ctrl/Cmd+K – open filters'}>
          {open ? `${t('common.hide')||'Hide'} ${(title||'').toLowerCase()}` : `${t('common.show')||'Show'} ${(title||'').toLowerCase()}`}
        </button>
        <div className="text-[12px] opacity-70 hidden xs:flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-white/10">{region}</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-white/10">{currency}</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-white/10">{dateRange.from || '—'} → {dateRange.to || '—'}</span>
          <label className="ml-2 inline-flex items-center gap-1"><input type="checkbox" className="accent-current" checked={presentationMode} onChange={(e)=> setPresentationMode(e.target.checked)} /><span>{t('filters.presentation')||'Presentation mode'}</span></label>
          {lastAppliedRange && (
            <span className="px-2 py-0.5 rounded bg-accent-500/20 text-accent-200 border border-accent-500/30" aria-label={t('filters.appliedRange')||'Rango aplicado'}>
              {lastAppliedRange.from || '—'} → {lastAppliedRange.to || '—'}
            </span>
          )}
        </div>
      </div>
      {open && (
        <div className="mt-2 flex items-center gap-2 text-[12px] flex-wrap">
          <span className="opacity-70">{t('filters.presets')||'Presets'}:</span>
          {(['LAST_7','LAST_30','LAST_90','MTD','QTD','YTD'] as const).map(p => (
            <button key={p} className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/15" onClick={()=>{
              let range;
              if (p==='MTD' || p==='YTD') range = rangeForPreset(p);
              else if (p==='QTD') { const now = new Date(); const q=Math.floor(now.getMonth()/3); const from = new Date(now.getFullYear(), q*3, 1); const pad=(n:number)=>String(n).padStart(2,'0'); range = { from: `${from.getFullYear()}-${pad(from.getMonth()+1)}-${pad(from.getDate())}`, to: `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}` }; }
              else {
                const now = new Date(); const to = new Date(now); const from = new Date(now);
                const n = p==='LAST_7'?6:p==='LAST_30'?29:89; from.setDate(now.getDate()-n);
                const pad=(n:number)=>String(n).padStart(2,'0');
                range = { from: `${from.getFullYear()}-${pad(from.getMonth()+1)}-${pad(from.getDate())}`, to: `${to.getFullYear()}-${pad(to.getMonth()+1)}-${pad(to.getDate())}` };
              }
              setDateRange(range);
              setLastAppliedRange(range);
              UIEvents.filterPresetUsed(p, { where: 'global-drawer' });
              try { announce(t('filters.applied')||'Filters applied'); } catch {}
            }}>
              {p==='LAST_7'? (t('filters.presets.last7')||'Last 7 days') : p==='LAST_30'? (t('filters.presets.last30')||'Last 30 days') : p==='LAST_90'? (t('filters.presets.last90')||'Last 90 days') : p==='MTD'? (t('filters.presets.mtd')||'Month to date') : p==='QTD'? (t('filters.presets.qtd')||'Quarter to date') : (t('filters.presets.ytd')||'Year to date')}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/15" onClick={()=>{ setRegion('all' as any); setDateRange({ from:'', to:'' }); setLastAppliedRange(null); try { announce(t('filters.cleared')||'Filters cleared'); } catch {}; UIEvents.filtersCleared({ where:'global-drawer' }); }}>{t('filters.clear')||'Clear'}</button>
          </div>
        </div>
      )}
      {open && (
        <div id="global-filters-body" className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-[12px]">
          <div className="card glass rounded-md p-3 border border-white/10">
            <label className="flex items-center justify-between gap-2">
              <span className="opacity-85">{t('filters.region')||'Region'}</span>
              <select className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded px-2 py-1" value={region} onChange={(e)=> { const next = e.target.value as any; if (next !== region) { trackEvent('settings.region', { prev: region, next }); } setRegion(next); }}>
                <option value="all">All</option>
                <option value="AMER">AMER</option>
                <option value="EMEA">EMEA</option>
                <option value="APAC">APAC</option>
              </select>
            </label>
          </div>
          <div className="card glass rounded-md p-3 border border-white/10">
            <label className="flex items-center justify-between gap-2">
              <span className="opacity-85">{t('filters.from')||'From'}</span>
              <input type="date" className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded px-2 py-1" value={dateRange.from} onChange={(e)=> { const next = e.target.value; if (next !== dateRange.from) { trackEvent('settings.date.from', { prev: dateRange.from, next }); } setDateRange({ ...dateRange, from: next }); }} />
            </label>
          </div>
          <div className="card glass rounded-md p-3 border border-white/10">
            <label className="flex items-center justify-between gap-2">
              <span className="opacity-85">{t('filters.to')||'To'}</span>
              <input type="date" className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded px-2 py-1" value={dateRange.to} onChange={(e)=> { const next = e.target.value; if (next !== dateRange.to) { trackEvent('settings.date.to', { prev: dateRange.to, next }); } setDateRange({ ...dateRange, to: next }); }} />
            </label>
          </div>
          <div className="card glass rounded-md p-3 border border-white/10">
            <label className="flex items-center justify-between gap-2">
              <span className="opacity-85">{t('filters.currency')||'Currency'}</span>
              <select className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded px-2 py-1" value={currency} onChange={(e)=> { const next = e.target.value as any; if (next !== currency) { trackEvent('settings.currency', { prev: currency, next }); } setCurrency(next); }}>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </label>
          </div>
          {/* Mask control removed: amounts are always visible now */}
          <div className="card glass rounded-md p-3 border border-white/10">
            <label className="flex items-center justify-between gap-2">
              <span className="opacity-85">{t('filters.presentation')||'Presentation mode'}</span>
              <input type="checkbox" className="accent-current" checked={presentationMode} onChange={(e)=> setPresentationMode(e.target.checked)} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalFilters;
