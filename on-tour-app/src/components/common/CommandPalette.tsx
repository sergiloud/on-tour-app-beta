import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { t, getLang } from '../../lib/i18n';
import { countryLabel } from '../../lib/countries';
import { useFilteredShows } from '../../features/shows/selectors';

type Props = { open: boolean; onClose: () => void };

type Item = { id: string; label: string; type: 'show'|'action'; run?: () => void };

export const CommandPalette: React.FC<Props> = ({ open, onClose }) => {
  const { presentationMode, setPresentationMode, setDashboardView } = useSettings();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement|null>(null);
  const { shows } = useFilteredShows();

  useEffect(()=>{ if (open) { setQuery(''); setIdx(0); setTimeout(()=> inputRef.current?.focus(), 0); } }, [open]);

  const items = useMemo<Item[]>(()=>{
    const q = query.trim().toLowerCase();
    const actions: Item[] = [
      { id: 'act:filters', type: 'action', label: t('cmd.openFilters'), run: ()=>{ window.dispatchEvent(new CustomEvent('global-filters:open')); onClose(); } },
      { id: 'act:presentation', type: 'action', label: presentationMode ? t('cmd.presentation.disable') : t('cmd.presentation.enable'), run: ()=>{ setPresentationMode(!presentationMode); onClose(); } },
      { id: 'act:shortcuts', type: 'action', label: t('cmd.shortcuts'), run: ()=>{ window.dispatchEvent(new CustomEvent('shortcuts:open')); onClose(); } },
      { id: 'view:default', type: 'action', label: t('cmd.switch.default'), run: ()=>{ setDashboardView('default' as any); onClose(); } },
      { id: 'view:finance', type: 'action', label: t('cmd.switch.finance'), run: ()=>{ setDashboardView('finance' as any); onClose(); } },
      { id: 'view:operations', type: 'action', label: t('cmd.switch.operations'), run: ()=>{ setDashboardView('operations' as any); onClose(); } },
      { id: 'view:promo', type: 'action', label: t('cmd.switch.promo'), run: ()=>{ setDashboardView('promo' as any); onClose(); } },
      { id: 'open:alerts', type: 'action', label: t('cmd.openAlerts'), run: ()=>{ window.dispatchEvent(new CustomEvent('alerts:open')); onClose(); } },
      { id: 'nav:shows', type: 'action', label: t('cmd.go.shows'), run: ()=>{ navigate('/dashboard/shows'); onClose(); } },
      { id: 'nav:travel', type: 'action', label: t('cmd.go.travel'), run: ()=>{ navigate('/dashboard/travel'); onClose(); } },
      { id: 'nav:finance', type: 'action', label: t('cmd.go.finance'), run: ()=>{ navigate('/dashboard/finance'); onClose(); } }
    ];
  const lang = getLang();
  const showItems: Item[] = (shows as any[]).map((s:any)=> ({ id: String(s.id), type:'show', label: `${s.city}, ${countryLabel(s.country, lang)} — ${new Date(s.date).toLocaleDateString()}` }));
    const all = [...actions, ...showItems];
    if (!q) return all.slice(0, 12);
    return all.filter(it => it.label.toLowerCase().includes(q)).slice(0, 20);
  }, [query, navigate, presentationMode, setPresentationMode, shows]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i=> Math.min(items.length-1, i+1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i=> Math.max(0, i-1)); }
    if (e.key === 'Enter') {
      const sel = items[idx];
      if (!sel) return;
      if (sel.type === 'show') { navigate(`/dashboard/shows?edit=${encodeURIComponent(sel.id)}`); onClose(); }
      else sel.run?.();
    }
  };

  if (!open) return null;
  return createPortal(
  <div role="dialog" aria-modal="true" aria-label={t('cmd.dialog')} className="fixed inset-0 z-[var(--z-modal)]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[92vw] max-w-xl glass rounded-lg border border-white/15 shadow-2xl">
        <div className="p-2 border-b border-white/10">
          <input ref={inputRef} value={query} onChange={(e)=> setQuery(e.target.value)} onKeyDown={onKey} placeholder={t('cmd.placeholder')} className="w-full bg-transparent outline-none px-2 py-2 text-sm" aria-label="Search" />
        </div>
        <ul className="max-h-[60vh] overflow-auto p-1" role="listbox" aria-label="Results">
          {items.map((it,i)=> (
            <li key={it.type+it.id} role="option" aria-selected={i===idx} className={`px-2 py-2 rounded-md text-sm cursor-pointer ${i===idx?'bg-white/10':''}`} onMouseEnter={()=> setIdx(i)} onClick={()=>{
              if (it.type==='show') { navigate(`/dashboard/shows?edit=${encodeURIComponent(it.id)}`); onClose(); }
              else it.run?.();
            }}>
              <span className="opacity-75 mr-2 text-[11px] uppercase">{it.type==='show'?t('cmd.type.show'):t('cmd.type.action')}</span>
              {it.label}
            </li>
          ))}
          {items.length===0 && <li className="px-2 py-3 text-sm opacity-70">{t('cmd.noResults')}</li>}
        </ul>
        <div className="p-2 text-[11px] opacity-70 border-t border-white/10 flex items-center justify-between">
          <span>{t('cmd.footer.hint')}</span>
          <span className="flex items-center gap-3"><span>Cmd+K</span><span className="opacity-70">{t('cmd.footer.tip')} (press ?)</span></span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CommandPalette;
