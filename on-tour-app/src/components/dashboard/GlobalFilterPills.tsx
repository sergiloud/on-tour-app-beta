import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { announce } from '../../lib/announcer';
import { t } from '../../lib/i18n';
import { rangeForPreset, type PeriodPreset } from '../../features/finance/period';
import { UIEvents } from '../../lib/telemetry/ui';

const GlobalFilterPills: React.FC = () => {
  const { region, setRegion, dateRange, setDateRange, currency } = useSettings();
  const openDrawer = () => { try { window.dispatchEvent(new CustomEvent('global-filters:open')); } catch {} };
  const clearAll = () => {
    setRegion('all' as any);
    setDateRange({ from: '', to: '' });
    try { announce(t('filters.cleared') || 'Filters cleared'); } catch {}
    UIEvents.filtersCleared({ where: 'global-pills' });
  };
  const applyPreset = (preset: 'LAST_7'|'LAST_30'|'LAST_90'|'MTD'|'YTD'|'QTD') => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const asRange = (from: Date, to: Date) => ({ from: `${from.getFullYear()}-${pad(from.getMonth()+1)}-${pad(from.getDate())}`, to: `${to.getFullYear()}-${pad(to.getMonth()+1)}-${pad(to.getDate())}` });
    let range;
    if (preset === 'LAST_7') {
      const to = new Date(now); const from = new Date(now); from.setDate(now.getDate()-6); range = asRange(from, to);
    } else if (preset === 'LAST_30') {
      const to = new Date(now); const from = new Date(now); from.setDate(now.getDate()-29); range = asRange(from, to);
    } else if (preset === 'LAST_90') {
      const to = new Date(now); const from = new Date(now); from.setDate(now.getDate()-89); range = asRange(from, to);
    } else if (preset === 'QTD') {
      const q = Math.floor(now.getMonth()/3); const from = new Date(now.getFullYear(), q*3, 1); range = asRange(from, now);
    } else if (preset === 'MTD') {
      range = rangeForPreset('MTD');
    } else { // YTD
      range = rangeForPreset('YTD');
    }
    setDateRange(range);
    UIEvents.filterPresetUsed(preset, { where: 'global-pills' });
    try { announce(t('filters.applied') || 'Filters applied'); } catch {}
    setOpen(false);
  };
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement|null>(null);
  React.useEffect(()=>{
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onClick = (e: MouseEvent) => { if (!menuRef.current) return; if (!menuRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return ()=>{ document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, [open]);
  const from = dateRange.from || '—';
  const to = dateRange.to || '—';
  return (
    <div className="px-3 md:px-5 py-2 border-b border-white/5 bg-ink-900/35 backdrop-blur-xl sticky top-[var(--kpi-offset,0px)] z-20">
      <div className="flex items-center gap-2 text-[12px] overflow-x-auto">
        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10" aria-label={`Region ${region}`}>{region}</span>
        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10" aria-label={`Currency ${currency}`}>{currency}</span>
        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10" aria-label={`Date range ${from} to ${to}`}>{from} → {to}</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative" ref={menuRef}>
            <button className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/15 text-[12px]" aria-haspopup="menu" aria-expanded={open} onClick={()=> setOpen(o=>!o)} title={t('filters.presets')||'Presets'}>{t('filters.presets')||'Presets'}</button>
            {open && (
              <div role="menu" className="absolute right-0 mt-1 min-w-[180px] glass rounded-md border border-white/10 p-1 shadow-lg">
                <button role="menuitem" className="w-full text-left px-2 py-1 rounded hover:bg-white/10" onClick={()=>applyPreset('LAST_7')}>{t('filters.presets.last7')||'Last 7 days'}</button>
                <button role="menuitem" className="w-full text-left px-2 py-1 rounded hover:bg-white/10" onClick={()=>applyPreset('LAST_30')}>{t('filters.presets.last30')||'Last 30 days'}</button>
                <button role="menuitem" className="w-full text-left px-2 py-1 rounded hover:bg-white/10" onClick={()=>applyPreset('LAST_90')}>{t('filters.presets.last90')||'Last 90 days'}</button>
                <div className="h-px my-1 bg-white/10" />
                <button role="menuitem" className="w-full text-left px-2 py-1 rounded hover:bg-white/10" onClick={()=>applyPreset('MTD')}>{t('filters.presets.mtd')||'Month to date'}</button>
                <button role="menuitem" className="w-full text-left px-2 py-1 rounded hover:bg-white/10" onClick={()=>applyPreset('QTD')}>{t('filters.presets.qtd')||'Quarter to date'}</button>
                <button role="menuitem" className="w-full text-left px-2 py-1 rounded hover:bg-white/10" onClick={()=>applyPreset('YTD')}>{t('filters.presets.ytd')||'Year to date'}</button>
              </div>
            )}
          </div>
          <button className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/15 text-[12px]" onClick={clearAll} title={t('filters.clear')||'Clear'}>{t('filters.clear')||'Clear'}</button>
          <button className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/15 text-[12px]" onClick={openDrawer} title={t('filters.more')||'More filters'}>{t('filters.more')||'More filters'}</button>
        </div>
      </div>
    </div>
  );
};

export default GlobalFilterPills;
