import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Calendar, DollarSign, Users, FileText, 
  Settings, Building2, Link as LinkIcon, BarChart3,
  UserCircle, Palette, CreditCard, Zap, ShieldCheck
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { t, getLang } from '../../lib/i18n';
import { countryLabel } from '../../lib/countries';
import { useFilteredShows } from '../../features/shows/selectors';
import { useOrg } from '../../context/OrgContext';
import { prefetchByPath } from '../../routes/prefetch';
import { getOrgById } from '../../lib/tenants';
import { useDebounce } from '../../hooks/useDebounce';

type Props = { open: boolean; onClose: () => void };

type ItemType = 'show' | 'navigation' | 'quick-action' | 'settings' | 'org' | 'artist' | 'member' | 'team' | 'doc';

type Item = { 
  id: string; 
  label: string; 
  type: ItemType;
  icon?: React.ReactNode;
  run?: () => void;
};

export const CommandPalette: React.FC<Props> = ({ open, onClose }) => {
  const { setDashboardView } = useSettings();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 150);
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement|null>(null);
  const { shows } = useFilteredShows();
  const { org, links, members, teams } = useOrg();

  useEffect(()=>{ if (open) { setQuery(''); setIdx(0); setTimeout(()=> inputRef.current?.focus(), 0); } }, [open]);

  const items = useMemo<Item[]>(()=>{
    const q = debouncedQuery.trim().toLowerCase();
    const actions: Item[] = [
      { id: 'act:filters', type: 'quick-action', icon: <Search className="w-4 h-4" />, label: t('cmd.openFilters'), run: ()=>{ window.dispatchEvent(new CustomEvent('global-filters:open')); onClose(); } },
      { id: 'act:shortcuts', type: 'quick-action', icon: <Zap className="w-4 h-4" />, label: t('cmd.shortcuts'), run: ()=>{ window.dispatchEvent(new CustomEvent('shortcuts:open')); onClose(); } },
      { id: 'view:default', type: 'quick-action', icon: <BarChart3 className="w-4 h-4" />, label: t('cmd.switch.default'), run: ()=>{ setDashboardView('default' as any); onClose(); } },
      { id: 'view:finance', type: 'quick-action', icon: <DollarSign className="w-4 h-4" />, label: t('cmd.switch.finance'), run: ()=>{ setDashboardView('finance' as any); onClose(); } },
      { id: 'view:operations', type: 'quick-action', icon: <Settings className="w-4 h-4" />, label: t('cmd.switch.operations'), run: ()=>{ setDashboardView('operations' as any); onClose(); } },
      { id: 'view:promo', type: 'quick-action', icon: <Palette className="w-4 h-4" />, label: t('cmd.switch.promo'), run: ()=>{ setDashboardView('promo' as any); onClose(); } },
      { id: 'open:alerts', type: 'quick-action', icon: <ShieldCheck className="w-4 h-4" />, label: t('cmd.openAlerts'), run: ()=>{ window.dispatchEvent(new CustomEvent('alerts:open')); onClose(); } },
      { id: 'nav:shows', type: 'navigation', icon: <Calendar className="w-4 h-4" />, label: t('cmd.go.shows'), run: ()=>{ prefetchByPath('/dashboard/shows'); navigate('/dashboard/shows'); onClose(); } },
      { id: 'nav:travel', type: 'navigation', icon: <Calendar className="w-4 h-4" />, label: t('cmd.go.travel'), run: ()=>{ prefetchByPath('/dashboard/travel'); navigate('/dashboard/travel'); onClose(); } },
      { id: 'nav:finance', type: 'navigation', icon: <DollarSign className="w-4 h-4" />, label: t('cmd.go.finance'), run: ()=>{ prefetchByPath('/dashboard/finance'); navigate('/dashboard/finance'); onClose(); } },
      { id: 'nav:profile', type: 'settings', icon: <UserCircle className="w-4 h-4" />, label: t('cmd.go.profile'), run: ()=>{ prefetchByPath('/dashboard/profile'); navigate('/dashboard/profile'); onClose(); } },
      { id: 'nav:org', type: 'org', icon: <Building2 className="w-4 h-4" />, label: t('cmd.go.org'), run: ()=>{ prefetchByPath('/dashboard/org'); navigate('/dashboard/org'); onClose(); } },
      { id: 'nav:org:members', type: 'org', icon: <Users className="w-4 h-4" />, label: t('cmd.go.members'), run: ()=>{ prefetchByPath('/dashboard/org/members'); navigate('/dashboard/org/members'); onClose(); } },
      ...(org?.type === 'agency' ? [{ id: 'nav:org:clients', type: 'org' as const, icon: <Users className="w-4 h-4" />, label: t('cmd.go.clients'), run: ()=>{ prefetchByPath('/dashboard/org/clients'); navigate('/dashboard/org/clients'); onClose(); } }] : []),
      { id: 'nav:org:teams', type: 'org', icon: <Users className="w-4 h-4" />, label: t('cmd.go.teams'), run: ()=>{ prefetchByPath('/dashboard/org/teams'); navigate('/dashboard/org/teams'); onClose(); } },
      { id: 'nav:org:links', type: 'org', icon: <LinkIcon className="w-4 h-4" />, label: t('cmd.go.links'), run: ()=>{ prefetchByPath('/dashboard/org/links'); navigate('/dashboard/org/links'); onClose(); } },
      { id: 'nav:org:reports', type: 'org', icon: <BarChart3 className="w-4 h-4" />, label: t('cmd.go.reports'), run: ()=>{ prefetchByPath('/dashboard/org/reports'); navigate('/dashboard/org/reports'); onClose(); } },
      { id: 'nav:org:documents', type: 'org', icon: <FileText className="w-4 h-4" />, label: t('cmd.go.documents'), run: ()=>{ prefetchByPath('/dashboard/org/documents'); navigate('/dashboard/org/documents'); onClose(); } },
      { id: 'nav:org:integrations', type: 'org', icon: <Zap className="w-4 h-4" />, label: t('cmd.go.integrations'), run: ()=>{ prefetchByPath('/dashboard/org/integrations'); navigate('/dashboard/org/integrations'); onClose(); } },
      ...(org?.type === 'agency' ? [{ id: 'nav:org:billing', type: 'org' as const, icon: <CreditCard className="w-4 h-4" />, label: t('cmd.go.billing'), run: ()=>{ prefetchByPath('/dashboard/org/billing'); navigate('/dashboard/org/billing'); onClose(); } }] : []),
      ...(org?.type === 'artist' ? [{ id: 'nav:org:branding', type: 'org' as const, icon: <Palette className="w-4 h-4" />, label: t('cmd.go.branding'), run: ()=>{ prefetchByPath('/dashboard/org/branding'); navigate('/dashboard/org/branding'); onClose(); } }] : []),
    ];
  const lang = getLang();
  const showItems: Item[] = (shows as any[]).map((s:any)=> ({ id: String(s.id), type:'show', icon: <Calendar className="w-4 h-4" />, label: `${s.city}, ${countryLabel(s.country, lang)} — ${new Date(s.date).toLocaleDateString()}` }));
    // Org entities discoverability
    const artistItems: Item[] = org?.type==='agency'
      ? (links||[]).filter(l=> l.agencyOrgId===org.id).map(l => {
          const artist = getOrgById(l.artistOrgId);
          return { id: `artist:${l.artistOrgId}`, type: 'artist', icon: <Users className="w-4 h-4" />, label: `Artist Hub: ${artist?.name||l.artistOrgId}`, run: ()=>{ const path=`/dashboard/clients/${encodeURIComponent(l.artistOrgId)}`; prefetchByPath(path); navigate(path); onClose(); } };
        })
      : [];
    const memberItems: Item[] = (members||[]).map(m => ({ id: `member:${m.user.id}`, type:'member', icon: <UserCircle className="w-4 h-4" />, label: `Member: ${m.user.name}`, run: ()=>{ prefetchByPath('/dashboard/org/members'); navigate('/dashboard/org/members'); onClose(); } }));
    const teamItems: Item[] = (teams||[]).map(t => ({ id: `team:${t.id}`, type:'team', icon: <Users className="w-4 h-4" />, label: `Team: ${t.name}`, run: ()=>{ prefetchByPath('/dashboard/org/teams'); navigate('/dashboard/org/teams'); onClose(); } }));
    // lightweight docs lookup (demo)
    let docItems: Item[] = [];
    try {
      const docs = JSON.parse(localStorage.getItem('demo:orgDocs')||'[]') as Array<{id:string;name:string}>;
      docItems = docs.slice(0, 20).map(d => ({ id: `doc:${d.id}`, type:'doc', icon: <FileText className="w-4 h-4" />, label: `Doc: ${d.name}`, run: ()=>{ prefetchByPath('/dashboard/org/documents'); navigate('/dashboard/org/documents'); onClose(); } }));
    } catch {}
    const all = [...actions, ...artistItems, ...memberItems, ...teamItems, ...docItems, ...showItems];
    if (!q) return all.slice(0, 12);
    return all.filter(it => it.label.toLowerCase().includes(q)).slice(0, 20);
  }, [debouncedQuery, navigate, shows, org?.type, links, members, teams, setDashboardView, onClose]);

  const onKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i=> Math.min(items.length-1, i+1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i=> Math.max(0, i-1)); }
    if (e.key === 'Enter') {
      const sel = items[idx];
      if (!sel) return;
      if (sel.type === 'show') { navigate(`/dashboard/shows?edit=${encodeURIComponent(sel.id)}`); onClose(); }
      else sel.run?.();
    }
  }, [items, idx, navigate, onClose]);

  const handleItemClick = useCallback((item: Item) => {
    if (item.type === 'show') { 
      navigate(`/dashboard/shows?edit=${encodeURIComponent(item.id)}`); 
      onClose(); 
    } else {
      item.run?.();
    }
  }, [navigate, onClose]);

  if (!open) return null;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={t('cmd.dialog')} className="fixed inset-0 z-[var(--z-modal)]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[92vw] max-w-xl bg-white/5 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <Search className="w-4 h-4 opacity-50" />
          <input 
            ref={inputRef} 
            value={query} 
            onChange={(e)=> setQuery(e.target.value)} 
            onKeyDown={onKey} 
            placeholder={t('cmd.placeholder')} 
            className="flex-1 bg-transparent outline-none text-sm placeholder:opacity-50" 
            aria-label="Search" 
          />
          <kbd className="px-2 py-1 text-[10px] opacity-50 bg-white/5 rounded border border-white/10">ESC</kbd>
        </div>
        <ul className="max-h-[60vh] overflow-auto py-2" role="listbox" aria-label="Results">
          {items.map((it,i)=> (
            <li 
              key={it.type+it.id} 
              role="option" 
              aria-selected={i===idx} 
              className={`group flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors ${i===idx?'bg-white/10':'hover:bg-white/5'}`}
              onMouseEnter={()=> setIdx(i)} 
              onClick={()=> handleItemClick(it)}
            >
              <span className="opacity-60 group-hover:opacity-100 transition-opacity">{it.icon}</span>
              <span className="flex-1">{it.label}</span>
              <span className="text-[10px] opacity-40 uppercase tracking-wider">{it.type}</span>
            </li>
          ))}
          {items.length===0 && <li className="px-4 py-6 text-sm text-center opacity-50">{t('cmd.noResults')}</li>}
        </ul>
        <div className="px-4 py-2.5 text-[10px] border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 opacity-50">
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">↑↓</kbd>
            <span>Navigate</span>
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 ml-2">↵</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-2 opacity-50">
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">⌘K</kbd>
            <span>Toggle</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CommandPalette;
