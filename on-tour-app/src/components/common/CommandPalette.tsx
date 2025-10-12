import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { t, getLang } from '../../lib/i18n';
import { countryLabel } from '../../lib/countries';
import { useFilteredShows } from '../../features/shows/selectors';
import { useOrg } from '../../context/OrgContext';
import { prefetchByPath } from '../../routes/prefetch';
import { getOrgById } from '../../lib/tenants';

type Props = { open: boolean; onClose: () => void };

type Item = { id: string; label: string; type: 'show'|'action'; run?: () => void };

export const CommandPalette: React.FC<Props> = ({ open, onClose }) => {
  const { setDashboardView } = useSettings();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement|null>(null);
  const { shows } = useFilteredShows();
  const { org, links, members, teams } = useOrg();

  useEffect(()=>{ if (open) { setQuery(''); setIdx(0); setTimeout(()=> inputRef.current?.focus(), 0); } }, [open]);

  const items = useMemo<Item[]>(()=>{
    const q = query.trim().toLowerCase();
    const actions: Item[] = [
      { id: 'act:filters', type: 'action', label: t('cmd.openFilters'), run: ()=>{ window.dispatchEvent(new CustomEvent('global-filters:open')); onClose(); } },
      { id: 'act:shortcuts', type: 'action', label: t('cmd.shortcuts'), run: ()=>{ window.dispatchEvent(new CustomEvent('shortcuts:open')); onClose(); } },
      { id: 'view:default', type: 'action', label: t('cmd.switch.default'), run: ()=>{ setDashboardView('default' as any); onClose(); } },
      { id: 'view:finance', type: 'action', label: t('cmd.switch.finance'), run: ()=>{ setDashboardView('finance' as any); onClose(); } },
      { id: 'view:operations', type: 'action', label: t('cmd.switch.operations'), run: ()=>{ setDashboardView('operations' as any); onClose(); } },
      { id: 'view:promo', type: 'action', label: t('cmd.switch.promo'), run: ()=>{ setDashboardView('promo' as any); onClose(); } },
      { id: 'open:alerts', type: 'action', label: t('cmd.openAlerts'), run: ()=>{ window.dispatchEvent(new CustomEvent('alerts:open')); onClose(); } },
      { id: 'nav:shows', type: 'action', label: t('cmd.go.shows'), run: ()=>{ prefetchByPath('/dashboard/shows'); navigate('/dashboard/shows'); onClose(); } },
      { id: 'nav:travel', type: 'action', label: t('cmd.go.travel'), run: ()=>{ prefetchByPath('/dashboard/travel'); navigate('/dashboard/travel'); onClose(); } },
      { id: 'nav:finance', type: 'action', label: t('cmd.go.finance'), run: ()=>{ prefetchByPath('/dashboard/finance'); navigate('/dashboard/finance'); onClose(); } },
  // Profile / Preferences quick nav
  { id: 'nav:profile', type: 'action', label: t('cmd.go.profile'), run: ()=>{ prefetchByPath('/dashboard/settings?tab=profile'); navigate('/dashboard/settings?tab=profile'); onClose(); } },
  { id: 'nav:preferences', type: 'action', label: t('cmd.go.preferences'), run: ()=>{ prefetchByPath('/dashboard/settings?tab=preferences'); navigate('/dashboard/settings?tab=preferences'); onClose(); } },
      // Org navigation
      { id: 'nav:org', type: 'action', label: t('cmd.go.org'), run: ()=>{ prefetchByPath('/dashboard/org'); navigate('/dashboard/org'); onClose(); } },
      { id: 'nav:org:members', type: 'action', label: t('cmd.go.members'), run: ()=>{ prefetchByPath('/dashboard/org/members'); navigate('/dashboard/org/members'); onClose(); } },
      ...(org?.type === 'agency' ? [{ id: 'nav:org:clients', type: 'action', label: t('cmd.go.clients'), run: ()=>{ prefetchByPath('/dashboard/org/clients'); navigate('/dashboard/org/clients'); onClose(); } }] as Item[] : []),
      { id: 'nav:org:teams', type: 'action', label: t('cmd.go.teams'), run: ()=>{ prefetchByPath('/dashboard/org/teams'); navigate('/dashboard/org/teams'); onClose(); } },
      { id: 'nav:org:links', type: 'action', label: t('cmd.go.links'), run: ()=>{ prefetchByPath('/dashboard/org/links'); navigate('/dashboard/org/links'); onClose(); } },
      { id: 'nav:org:reports', type: 'action', label: t('cmd.go.reports'), run: ()=>{ prefetchByPath('/dashboard/org/reports'); navigate('/dashboard/org/reports'); onClose(); } },
      { id: 'nav:org:documents', type: 'action', label: t('cmd.go.documents'), run: ()=>{ prefetchByPath('/dashboard/org/documents'); navigate('/dashboard/org/documents'); onClose(); } },
      { id: 'nav:org:integrations', type: 'action', label: t('cmd.go.integrations'), run: ()=>{ prefetchByPath('/dashboard/org/integrations'); navigate('/dashboard/org/integrations'); onClose(); } },
      ...(org?.type === 'agency' ? [{ id: 'nav:org:billing', type: 'action', label: t('cmd.go.billing'), run: ()=>{ prefetchByPath('/dashboard/org/billing'); navigate('/dashboard/org/billing'); onClose(); } }] as Item[] : []),
      ...(org?.type === 'artist' ? [{ id: 'nav:org:branding', type: 'action', label: t('cmd.go.branding'), run: ()=>{ prefetchByPath('/dashboard/org/branding'); navigate('/dashboard/org/branding'); onClose(); } }] as Item[] : []),
    ];
  const lang = getLang();
  const showItems: Item[] = (shows as any[]).map((s:any)=> ({ id: String(s.id), type:'show', label: `${s.city}, ${countryLabel(s.country, lang)} — ${new Date(s.date).toLocaleDateString()}` }));
    // Org entities discoverability
    const artistItems: Item[] = org?.type==='agency'
      ? (links||[]).filter(l=> l.agencyOrgId===org.id).map(l => {
          const artist = getOrgById(l.artistOrgId);
          return { id: `artist:${l.artistOrgId}`, type: 'action', label: `Artist Hub: ${artist?.name||l.artistOrgId}`, run: ()=>{ const path=`/dashboard/clients/${encodeURIComponent(l.artistOrgId)}`; prefetchByPath(path); navigate(path); onClose(); } } as Item;
        })
      : [];
    const memberItems: Item[] = (members||[]).map(m => ({ id: `member:${m.user.id}`, type:'action', label: `Member: ${m.user.name}`, run: ()=>{ prefetchByPath('/dashboard/org/members'); navigate('/dashboard/org/members'); onClose(); } }));
    const teamItems: Item[] = (teams||[]).map(t => ({ id: `team:${t.id}`, type:'action', label: `Team: ${t.name}`, run: ()=>{ prefetchByPath('/dashboard/org/teams'); navigate('/dashboard/org/teams'); onClose(); } }));
    // lightweight docs lookup (demo)
    let docItems: Item[] = [];
    try {
      const docs = JSON.parse(localStorage.getItem('demo:orgDocs')||'[]') as Array<{id:string;name:string}>;
      docItems = docs.slice(0, 20).map(d => ({ id: `doc:${d.id}`, type:'action', label: `Doc: ${d.name}`, run: ()=>{ prefetchByPath('/dashboard/org/documents'); navigate('/dashboard/org/documents'); onClose(); } }));
    } catch {}
    const all = [...actions, ...artistItems, ...memberItems, ...teamItems, ...docItems, ...showItems];
    if (!q) return all.slice(0, 12);
    return all.filter(it => it.label.toLowerCase().includes(q)).slice(0, 20);
  }, [query, navigate, shows, org?.type]);

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
