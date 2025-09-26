import React, { useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useShowDraft, ShowDraft } from './useShowDraft';
import { t } from '../../../lib/i18n';
import { countryLabel } from '../../../lib/countries';
import type { Cost } from '../../../types/shows';
import { useSettings } from '../../../context/SettingsContext';
import { computeNet, breakdownNet } from '../../../lib/computeNet';
import { convertToBase, getRateToEUR, SupportedCurrency } from '../../../lib/fx';
import { trackEvent as track } from '../../../lib/telemetry';
import { TE } from '../../../lib/telemetryEvents';
import { useToast } from '../../../ui/Toast';
import StatusBadge from '../../../ui/StatusBadge';
import CountrySelect from '../../../ui/CountrySelect';
import { useFieldOrder, sortByFieldOrder } from './fieldOrderConfig';

export type ShowEditorMode = 'add'|'edit';

export interface ShowEditorDrawerProps {
  open: boolean;
  mode: ShowEditorMode;
  initial: ShowDraft;
  onSave: (draft: ShowDraft) => void;
  onDelete?: () => void;
  onRestore?: () => void; // optional restore callback for undo delete
  hasTripAroundDate?: (isoDate: string) => boolean; // contextual travel info
  onPlanTravel?: (isoDate: string) => void;
  onOpenTrip?: (isoDate: string) => void;
  onRequestClose: () => void; // parent decides (will show confirm if needed)
}

// Minimal initial extraction. Features to be layered incrementally.
export const ShowEditorDrawer: React.FC<ShowEditorDrawerProps> = ({ open, mode, initial, onSave, onDelete, onRestore, hasTripAroundDate, onPlanTravel, onOpenTrip, onRequestClose }) => {
  const { draft, setDraft, validation, isValid, dirty, reset, restored, discardSavedDraft } = useShowDraft(initial);
  const { lang, fmtMoney, managementAgencies, bookingAgencies } = useSettings();
  // Persist + restore last active tab
  const initialTab = (() => {
    try { const v = localStorage.getItem('showEditor.lastTab'); if(v==='details'||v==='finance'||v==='costs') return v as 'details'|'finance'|'costs'; } catch { /* ignore */ }
    return 'details';
  })();
  const [tab, setTab] = useState<'details'|'finance'|'costs'>(initialTab);
  const restoredTabRef = useRef(false);
  const [ready, setReady] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement|null>(null);
  const drawerRef = useRef<HTMLDivElement|null>(null);
  const [showDiscard, setShowDiscard] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  // Accessibility announcements (refactored with explicit severity)
  const [announceMsg, setAnnounceMsg] = useState('');
  const [announceSeverity, setAnnounceSeverity] = useState<'polite'|'assertive'>('polite');
  const lastAnnounceRef = useRef<{ msg:string; ts:number }|null>(null);
  const announce = useCallback((msg: string, severity: 'polite'|'assertive'='polite') => {
    const now = performance.now();
    if(lastAnnounceRef.current && lastAnnounceRef.current.msg===msg && (now - lastAnnounceRef.current.ts) < 1200){
      return; // suppress duplicate within window
    }
    lastAnnounceRef.current = { msg, ts: now };
    setAnnounceSeverity(severity);
    setAnnounceMsg('');
    requestAnimationFrame(()=> setAnnounceMsg(msg));
  }, []);
  interface PendingDelete { timer: number|null; deadline: number; remaining: number; paused: boolean; }
  const [pendingDelete, setPendingDelete] = useState<PendingDelete|null>(null);
  const [saving, setSaving] = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const firstSaveTracked = useRef(false); // guard first save metric
  // Cost templates menu state
  const [openTemplateMenu, setOpenTemplateMenu] = useState(false);
  // Bulk cost modal state
  const [showBulk, setShowBulk] = useState(false);
  const [bulkRaw, setBulkRaw] = useState('');
  const [bulkParsed, setBulkParsed] = useState<Array<{ type:string; amount:number; desc:string; line:number }>>([]);
  const bulkTextAreaRef = useRef<HTMLTextAreaElement|null>(null);
  const parseBulk = useCallback((text: string) => {
    const lines = text.split(/\r?\n/);
    const out: Array<{ type:string; amount:number; desc:string; line:number }> = [];
    lines.forEach((ln, idx)=> {
      if(!ln.trim()) return;
      const parts = ln.split(/\t|,/).map(p=> p.trim());
      if(parts.length===1){ const type = parts[0]; if(type) out.push({ type, amount:0, desc:'', line: idx+1 }); return; }
      const [pType, pAmountRaw, ...rest] = parts;
      if(!pType) return;
      let amount = 0; let desc='';
      if(pAmountRaw && /\d/.test(pAmountRaw)){
        const norm = pAmountRaw.replace(/[^0-9.,-]/g,'').replace(/,/g,'.');
        const num = parseFloat(norm); if(!isNaN(num)) amount = num; else desc = [pAmountRaw, ...rest].join(' ');
      } else { desc = [pAmountRaw, ...rest].filter(Boolean).join(' '); }
      if(!desc) desc = rest.join(' ');
      out.push({ type: pType, amount: Math.round(amount), desc: desc.trim(), line: idx+1 });
    });
    return out;
  }, []);
  useEffect(()=> { if(showBulk){ setTimeout(()=> { const title = document.getElementById('bulk-title'); (title as HTMLElement|undefined)?.focus?.(); if(!title) bulkTextAreaRef.current?.focus(); }, 50); } }, [showBulk]);
  useEffect(()=> { if(!showBulk){ setBulkRaw(''); setBulkParsed([]); } }, [showBulk]);
  useEffect(()=> { if(bulkRaw){ setBulkParsed(parseBulk(bulkRaw)); } else { setBulkParsed([]); } }, [bulkRaw, parseBulk]);
  interface CostTemplate { id: string; label: string; items: Array<{ type: string; amount: number; desc?: string }>; }
  const COST_TEMPLATES: CostTemplate[] = [
    { id: 'travel-basic', label: t('shows.editor.cost.template.travel') || 'Travel basics', items: [
      { type: 'Travel', amount: 0, desc: 'Flights' },
      { type: 'Travel', amount: 0, desc: 'Hotel' },
      { type: 'Travel', amount: 0, desc: 'Ground' }
    ] },
    { id: 'production-basic', label: t('shows.editor.cost.template.production') || 'Production basics', items: [
      { type: 'Production', amount: 0, desc: 'Crew' },
      { type: 'Production', amount: 0, desc: 'Backline' }
    ] },
    { id: 'marketing-basic', label: t('shows.editor.cost.template.marketing') || 'Marketing basics', items: [
      { type: 'Marketing', amount: 0, desc: 'Ads' },
      { type: 'Marketing', amount: 0, desc: 'Design' }
    ] }
  ];
  const applyCostTemplate = useCallback((tpl: CostTemplate) => {
    setDraft(d=> ({...d, costs: [...(d.costs||[]), ...tpl.items.map(i=> ({ id: crypto.randomUUID(), ...i }))]}));
  announce(t('shows.editor.cost.template.applied') || 'Template applied', 'polite');
    track('shows.editor.cost.template.apply', { template: tpl.id, items: tpl.items.length });
    setOpenTemplateMenu(false);
  }, [setDraft, t]);
  // Close template menu on outside click
  useEffect(()=> {
    if(!openTemplateMenu) return;
    const handler = (e: MouseEvent) => {
      if(!(e.target instanceof Node)) return;
      const root = document.querySelector('[data-cost-template-menu]');
      if(root && !root.contains(e.target)) setOpenTemplateMenu(false);
    };
    window.addEventListener('mousedown', handler);
    return ()=> window.removeEventListener('mousedown', handler);
  }, [openTemplateMenu]);
  const toast = useToast();
  // Telemetry session metrics
  const openedAt = useRef<number|null>(null);
  const validationFails = useRef(0);
  // Advanced telemetry accumulators
  const undoDeletesRef = useRef(0);
  const deleteCount = useRef(0);
  const quickParseApply = useRef(0);
  const bulkCostAdds = useRef(0);
  const manualCostAdds = useRef(0);
  // Field order (A/B experiment) configuration
  const { order: fieldOrder, variant: fieldOrderVariant } = useFieldOrder();
  // (Local toast system removed — using global ToastProvider)
  // Recent city/venue suggestions (persisted)
  const [recentCities, setRecentCities] = useState<string[]>([]);
  const [recentVenues, setRecentVenues] = useState<string[]>([]);
  useEffect(()=> {
    try {
      const c = JSON.parse(localStorage.getItem('shows.recentCities.v1')||'[]');
      const v = JSON.parse(localStorage.getItem('shows.recentVenues.v1')||'[]');
      if(Array.isArray(c)) setRecentCities(c.filter(x=> typeof x==='string'));
      if(Array.isArray(v)) setRecentVenues(v.filter(x=> typeof x==='string'));
    } catch { /* ignore */ }
  }, []);
  const recordCity = useCallback((city: string)=> {
    setRecentCities(prev=> {
      const next = [city, ...prev.filter(x=> x.toLowerCase()!==city.toLowerCase())].slice(0,8);
      try { localStorage.setItem('shows.recentCities.v1', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);
  const recordVenue = useCallback((venue: string)=> {
    setRecentVenues(prev=> {
      const next = [venue, ...prev.filter(x=> x.toLowerCase()!==venue.toLowerCase())].slice(0,8);
      try { localStorage.setItem('shows.recentVenues.v1', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);
  // Tab refs for roving tabindex keyboard navigation
  const tabRefs = useRef<Record<string, HTMLButtonElement|null>>({});

  // Reset only when switching to a different show id (avoid wiping user typing on parent re-renders)
  const prevInitialIdRef = useRef(initial.id);
  useEffect(()=> {
    if (!open) return;
    if (prevInitialIdRef.current !== initial.id) {
      reset(initial);
      setTab('details');
      prevInitialIdRef.current = initial.id;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial.id]);

  useEffect(()=>{ if (open){ requestAnimationFrame(()=> setReady(true)); } else { setReady(false); } }, [open]);

  useLayoutEffect(()=>{ if (open && ready){ firstFieldRef.current?.focus(); } }, [open, ready]);

  // Venue telemetry tracking (set/changed/cleared)
  const prevVenueRef = useRef<string|undefined>(draft.venue);
  useEffect(()=> {
    if(!open) return;
    const current = draft.venue || '';
    const prev = prevVenueRef.current || '';
    if(current===prev) return;
    if(!prev && current){ track(TE.SHOW_VENUE_SET); }
    else if(prev && current){ track(TE.SHOW_VENUE_CHANGED); }
    else if(prev && !current){ track(TE.SHOW_VENUE_CLEARED); }
    prevVenueRef.current = current;
  }, [draft.venue, open]);

  // Keyboard shortcuts
  useEffect(()=>{
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey||e.ctrlKey) && (e.key==='s' || e.key==='Enter')){ e.preventDefault(); attemptSave(); }
      if (e.key==='Enter' && e.shiftKey){
        const active = document.activeElement as HTMLElement | null;
        if(active && (active.getAttribute('aria-describedby')?.includes('quick') || active.getAttribute('placeholder')?.toLowerCase().includes('quick'))){
          e.preventDefault();
          // call apply directly
          (applyQuickPreview as any)();
        }
      }
      if (e.key==='Escape') {
        e.preventDefault(); requestClose();
      }
    };
    window.addEventListener('keydown', handler);
    return ()=> window.removeEventListener('keydown', handler);
  }, [open, dirty, isValid, draft]);

  // Focus trap for keyboard navigation
  useEffect(()=>{
    if(!open) return;
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusables = drawerRef.current?.querySelectorAll<HTMLElement>("a,button,input,textarea,select,[tabindex]:not([tabindex='-1'])");
        if (!focusables || focusables.length===0) return;
        const list = Array.from(focusables).filter(el=> !el.hasAttribute('disabled'));
        const first = list[0];
        const last = list[list.length-1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    drawerRef.current?.addEventListener('keydown', keyHandler);
    return ()=> drawerRef.current?.removeEventListener('keydown', keyHandler);
  }, [open]);

  // Telemetry now uses shared trackEvent util (aliased as track)

  // Fire open/close events
  useEffect(()=>{
    if(open){
      openedAt.current = performance.now();
      validationFails.current = 0;
  track(TE.SHOW_OPEN, { mode, draftId: initial.id, dirty });
    }
    return ()=> {
      if(open && openedAt.current!=null){
        // Derived telemetry metrics
        const deletes = deleteCount.current;
        const undoDeletes = undoDeletesRef.current;
        const undoDeleteRate = deletes > 0 ? +(undoDeletes / deletes).toFixed(3) : 0;
        const manual = manualCostAdds.current;
        const bulk = bulkCostAdds.current;
        const costAddTotal = manual + bulk;
        const manualPct = costAddTotal > 0 ? +(manual / costAddTotal).toFixed(3) : 0;
        const bulkPct = costAddTotal > 0 ? +(bulk / costAddTotal).toFixed(3) : 0;
        const quickApply = quickParseApply.current;
        const quickShareBase = costAddTotal + quickApply; // treat parse apply as its own contribution
        const quickShare = quickShareBase > 0 ? +(quickApply / quickShareBase).toFixed(3) : 0;
  track(TE.SHOW_CLOSE, {
          dirty,
          durationMs: Math.round(performance.now() - openedAt.current),
          validationFails: validationFails.current,
          undoDeletes: undoDeletesRef.current,
          deletes: deleteCount.current,
          quickParseApply: quickParseApply.current,
          bulkCosts: bulkCostAdds.current,
          manualCosts: manualCostAdds.current,
          derived: {
            undoDeleteRate,
            costAdd: { total: costAddTotal, manual, bulk, manualPct, bulkPct },
            quickParse: { apply: quickApply, share: quickShare }
          }
        });
      }
    };
  }, [open]);

  const attemptSave = useCallback(async()=>{
    if (!isValid) {
      const firstKey = Object.keys(validation)[0];
      if (firstKey){
        const el = drawerRef.current?.querySelector(`[data-field="${firstKey}"]`) as HTMLElement | null;
        el?.focus();
      }
  track(TE.VALIDATION_FAIL, { fields: Object.keys(validation) });
    announce(t('shows.editor.validation.fail')||'Fix errors to continue', 'assertive');
    const errCount = Object.keys(validation).length;
    announce((t('shows.editor.errors.count')||'There are {n} errors').replace('{n}', String(errCount)), 'assertive');
      toast.error(t('shows.editor.toast.validation')||'Validation errors');
      validationFails.current += 1;
      return;
    }
    if(saving==='saving') return; // prevent double submit
    try {
      setSaving('saving');
      const ret: any = onSave(draft);
      if(ret && typeof ret.then === 'function') {
        await ret;
      }
      if(openedAt.current!=null && !firstSaveTracked.current){
  track(TE.SHOW_SAVE_TTFS, { ms: Math.round(performance.now() - openedAt.current), costCount: draft.costs?.length||0 });
        firstSaveTracked.current = true;
      }
  track(TE.SHOW_SAVE, {
        id: initial.id,
        mode,
        fee: draft.fee,
        wht: draft.whtPct,
        mgmtPct: draft.mgmtPct,
        bookingPct: draft.bookingPct,
        costCount: draft.costs?.length||0,
        durationMs: openedAt.current!=null ? Math.round(performance.now() - openedAt.current) : undefined,
        validationFails: validationFails.current
      });
  setSaving('saved');
  // Clear autosaved draft after a successful save since baseline has moved
  discardSavedDraft();
      announce(t('shows.editor.toast.saved')||'Saved', 'polite');
      toast.success(t('shows.editor.toast.saved')||'Saved');
      setTimeout(()=> setSaving('idle'), 1500);
    } catch (err){
  if(dirty){ track(TE.SHOW_ABANDON, { unsaved: true }); }
      console.error(err);
      setSaving('error');
  track(TE.SHOW_SAVE_FAIL, { id: initial.id, mode });
      announce(t('shows.editor.save.error')||'Save failed', 'assertive');
      toast.error(t('shows.editor.save.error')||'Save failed');
      setTimeout(()=> setSaving('idle'), 2000);
    }
  }, [isValid, validation, draft, onSave, toast]);

  function requestClose(){
    if (dirty){ setShowDiscard(true); } else { onRequestClose(); }
  }

  useEffect(()=>{ if (open){ document.body.style.overflow='hidden'; } return ()=> { document.body.style.overflow=''; }; }, [open]);

  if (!open) return null;

  // Localized header meta (city · country · date) with safe date construction (avoid TZ shift)
  const metaCity = (draft.city||'').trim() || '—';
  const metaCountry = draft.country ? countryLabel(draft.country, lang) : '';
  let metaDate = '';
  if (draft.date) {
    const iso = String(draft.date).slice(0,10);
    const parts = iso.split('-');
    if(parts.length===3){
      const [y,m,d] = parts.map(p=> Number(p));
      if(!isNaN(y)&&!isNaN(m)&&!isNaN(d)){
        const dateObj = new Date(y, m-1, d); // Local midnight
        try {
          metaDate = new Intl.DateTimeFormat(lang==='es'? 'es-ES':'en-US', { day:'2-digit', month:'short', year:'numeric' }).format(dateObj);
        } catch { metaDate = iso; }
      }
    }
  }

  // Simple cost aggregation for summary
  const totalCosts = (draft.costs||[]).reduce((s,c)=> s + (c.amount||0), 0);
  const { currency: baseCurrency } = useSettings();
  const feeCurrency = (draft as any).feeCurrency as SupportedCurrency || baseCurrency as SupportedCurrency;
  const fee = Number(draft.fee)||0;
  const fx = convertToBase(fee, draft.date as any, feeCurrency, baseCurrency as any);
  const convertedFee = fx?.value;
  const effectiveRate = fx?.rate; // multiplier from original -> base
  const fxUnavailableTracked = useRef(false);
  useEffect(()=> {
    if(!fxUnavailableTracked.current && fee>0 && feeCurrency!==baseCurrency && convertedFee==null){
      track(TE.FX_UNAVAILABLE, { from: feeCurrency, to: baseCurrency, date: draft.date });
      fxUnavailableTracked.current = true;
    }
  }, [convertedFee, feeCurrency, baseCurrency, fee, draft.date]);
  const wht = fee * ((draft.whtPct||0)/100);
  const commissions = 0;
  const net = computeNet({ fee, whtPct: draft.whtPct, costs: draft.costs });
  const marginPct = fee>0 ? (net/fee)*100 : 0;
  // Memoized cost grouping (subtotals) reused in Costs tab summary
  const costGroups = useMemo(()=> {
    const arr = (draft.costs||[]);
    const groups = arr.reduce<Record<string,{ total:number; count:number }>>((acc,c)=> { const key = c.type||t('shows.costs.type')||'Type'; const amt = c.amount||0; if(!acc[key]) acc[key]={ total:0, count:0 }; acc[key].total+=amt; acc[key].count +=1; return acc; }, {});
    return groups;
  }, [draft.costs, lang]);
  // Focus helper for cost fields
  const focusCostField = useCallback((id: string, field: 'type'|'amount'|'desc'='type')=> {
    requestAnimationFrame(()=> {
      const el = document.querySelector<HTMLInputElement>(`[data-cost-id="${id}"][data-cost-field="${field}"]`);
      el?.focus();
    });
  }, []);
  // Reorder costs up/down by id
  const moveCost = useCallback((id: string, direction: 'up'|'down', focusField: 'type'|'amount'|'desc'='type')=> {
    setDraft(d=> {
      const arr = [...(d.costs||[])];
      const idx = arr.findIndex(c=> c.id===id);
      if (idx<0) return d;
      const newIdx = direction==='up'? Math.max(0, idx-1) : Math.min(arr.length-1, idx+1);
      if (newIdx===idx) return d;
      const [item] = arr.splice(idx,1);
      arr.splice(newIdx, 0, item);
      track(TE.COST_SORT, { by: 'position', direction });
      return { ...d, costs: arr };
    });
    focusCostField(id, focusField);
  }, [setDraft, focusCostField]);
  // Duplicate a cost line (insert after current)
  const duplicateCost = useCallback((id: string)=> {
    setDraft(d=> {
      const arr = [...(d.costs||[])];
      const idx = arr.findIndex(c=> c.id===id);
      if (idx<0) return d;
      const cur = arr[idx];
      const newId = crypto.randomUUID();
      const dup = { id: newId, type: cur.type, amount: cur.amount, desc: cur.desc } as any;
      arr.splice(idx+1, 0, dup);
      manualCostAdds.current += 1;
      track(TE.COST_ADD, { id: newId, duplicate: true });
      // Focus duplicated row after render
      focusCostField(newId, 'type');
      return { ...d, costs: arr };
    });
  }, [setDraft, focusCostField]);
  // Quick Entry parsing state
  const [quickEntry, setQuickEntry] = useState('');
  const [quickPreview, setQuickPreview] = useState<any|null>(null);
  const [quickError, setQuickError] = useState<string|null>(null);
  const quickIcons: Record<string,string> = {
    date: '📅', city: '🏙️', country: '🌍', fee: '💰', whtPct: '🏦', name: '🎤'
  };
  // Track last quick parse event to avoid spamming telemetry
  const lastQuickTrackRef = useRef<{ text: string; status: 'success'|'fail' }|null>(null);

  // Recent cost types memory (localStorage) — most recently used first
  const [recentCostTypes, setRecentCostTypes] = useState<string[]>([]);
  const [justAddedCostId, setJustAddedCostId] = useState<string|null>(null);
  const [justAppliedQuick, setJustAppliedQuick] = useState(false);
  useEffect(()=> {
    try {
      const raw = localStorage.getItem('shows.recentCostTypes.v1');
      if(raw){
        const arr = JSON.parse(raw);
        if(Array.isArray(arr)) setRecentCostTypes(arr.filter(x=> typeof x==='string'));
      }
    } catch { /* ignore */ }
  }, []);
  const recordCostType = useCallback((type: string) => {
    const val = (type||'').trim();
    if(!val) return;
    setRecentCostTypes(prev => {
      if(prev[0]===val) return prev; // already most recent
      const updated = [val, ...prev.filter(p=> p!==val)].slice(0,8);
      try { localStorage.setItem('shows.recentCostTypes.v1', JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  // Enhanced parser: date, city, country, fee (k/m + currency symbols + spaced), wht %, name in quotes, spaced multipliers ("12 k"), IRPF alias
  const parseQuickEntry = useCallback((text: string) => {
    const result: any = {};
    const rawInput = text.trim();
    if(!rawInput){ return { empty: true }; }
    const lower = rawInput; // keep original case for city heuristics later
    // Date dd/mm/yyyy or dd-mm-yyyy or dd/mm/yy
    const dateMatch = lower.match(/(\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b)/);
    if(dateMatch){
      const raw = dateMatch[1].replace(/-/g,'/');
      const [d,m,yRaw] = raw.split('/');
      let y = yRaw;
      if(yRaw.length===2){ y = '20'+yRaw; }
      const iso = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
      if(!isNaN(Date.parse(iso))) result.date = iso;
    }
    // Country code (two uppercase letters)
    const countryMatch = lower.match(/[\s,]([A-Z]{2})(?=\b)/);
    if(countryMatch){ result.country = countryMatch[1].toUpperCase(); }
    // Fee patterns: optional 'fee' keyword OR trailing 'fee', currency symbols, k/m multipliers, allow space before multiplier
    let feeNum: number|undefined;
    const feePatterns = [
      /fee\s+([$€£])?\s*([0-9]+(?:[.,][0-9]{1,3})?)\s*([kKmM])?/i,
      /([$€£])?\s*([0-9]+(?:[.,][0-9]{1,3})?)\s*([kKmM])?\s*fee/i
    ];
    for(const r of feePatterns){
      const m = lower.match(r);
      if(m){
        const numRaw = m[2].replace(/,/g,'.');
        const mult = m[3]?.toLowerCase();
        let num = parseFloat(numRaw);
        if(!isNaN(num)){
          if(mult==='k') num *= 1000; else if(mult==='m') num *= 1_000_000;
          feeNum = num;
          break;
        }
      }
    }
    // Legacy pattern fallback (e.g., "12k fee" without currency symbol already covered but keep alternative like "fee 12,500")
    if(feeNum==null){
      const legacy = lower.match(/fee\s+([0-9.,]+k?)/i) || lower.match(/([0-9.,]+k?)\s*fee/i);
      if(legacy){
        let val = legacy[1].toLowerCase().replace(/,/g,'');
        if(/k$/.test(val)) val = String(parseFloat(val.slice(0,-1))*1000);
        const n = Number(val);
        if(!isNaN(n)) feeNum = n;
      }
    }
    // Spaced multiplier pattern ("12 k" or "12 K") when a single plausible amount appears and fee keyword absent
    if(feeNum==null){
      const spaced = lower.match(/\b([0-9]+)\s*([kKmM])\b/);
      if(spaced){
        let num = parseFloat(spaced[1]);
        const mult = spaced[2].toLowerCase();
        if(!isNaN(num)){
          if(mult==='k') num *= 1000; else if(mult==='m') num *= 1_000_000;
          // Heuristic: treat as fee if no existing explicit fee and not obviously a WHT
          feeNum = num;
        }
      }
    }
    if(feeNum!=null && feeNum>0){ result.fee = Math.round(feeNum); }
    // WHT patterns: wht 15% / irpf 15% / 15% wht / wht15%
    const whtMatch = lower.match(/(?:wht|irpf)\s*(\d{1,2})(?:%|pct)?/i) || lower.match(/(\d{1,2})%\s*(?:wht|irpf)/i) || lower.match(/(?:wht|irpf)(\d{1,2})%/i);
    if(whtMatch){ const pct = Number(whtMatch[1]); if(pct>=0 && pct<=50) result.whtPct = pct; }
    // Name in quotes
    const nameMatch = lower.match(/"([^"\n]+)"/);
    if(nameMatch){ result.name = nameMatch[1].trim(); }
    // City heuristic (before country code or followed by comma)
    if(!result.city){
      const cityMatch = lower.match(/([A-Za-zÁÉÍÓÚÜÑ][A-Za-zÁÉÍÓÚÜÑ' .-]{2,})(?:,|\s+[A-Z]{2}\b)/);
      if(cityMatch){ result.city = cityMatch[1].trim(); }
    }
    return result;
  }, []);

  useEffect(()=> {
    if(!quickEntry){ setQuickPreview(null); setQuickError(null); return; }
    const parsed = parseQuickEntry(quickEntry);
    const trimmed = quickEntry.trim();
    if(parsed.empty){ setQuickPreview(null); setQuickError(null); return; }
    const keys = Object.keys(parsed);
    if(keys.length===0){
      setQuickPreview(null); setQuickError(t('shows.editor.quick.parseError')||'Cannot interpret');
      if(trimmed && (!lastQuickTrackRef.current || lastQuickTrackRef.current.text!==trimmed)){
  track(TE.QUICK_PARSE_FAIL);
        lastQuickTrackRef.current = { text: trimmed, status: 'fail' };
      }
    } else {
      setQuickPreview(parsed); setQuickError(null);
      if(trimmed && (!lastQuickTrackRef.current || lastQuickTrackRef.current.text!==trimmed)){
  track(TE.QUICK_PARSE_SUCCESS, { keys });
        lastQuickTrackRef.current = { text: trimmed, status: 'success' };
      }
    }
  }, [quickEntry, parseQuickEntry, t, track]);

  const applyQuickPreview = useCallback(()=> {
  setJustAppliedQuick(true);
  setTimeout(()=> setJustAppliedQuick(false), 900);
    if(!quickPreview) return;
    setDraft(d=> ({...d, ...quickPreview }));
  track(TE.QUICK_PARSE_APPLY, { keys: Object.keys(quickPreview) });
    quickParseApply.current += 1;
  announce(t('shows.editor.quick.applied')||'Quick entry applied', 'polite');
    setQuickEntry('');
    setQuickPreview(null);
  }, [quickPreview, setDraft, t]);

  // Keyboard navigation for tabs (Arrow keys + Home/End)
  const handleTabKeyNav = useCallback((e: React.KeyboardEvent) => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
    const order: Array<typeof tab> = ['details','finance','costs'];
    const idx = order.indexOf(tab);
    let next = tab;
    if (e.key === 'ArrowRight') next = order[(idx + 1) % order.length];
    else if (e.key === 'ArrowLeft') next = order[(idx - 1 + order.length) % order.length];
    else if (e.key === 'Home') next = order[0];
    else if (e.key === 'End') next = order[order.length - 1];
    if (next !== tab) {
      setTab(next);
      requestAnimationFrame(()=> tabRefs.current[next]?.focus());
    }
    e.preventDefault();
  }, [tab]);

  // Tab change helper with telemetry
  const changeTab = useCallback((next: typeof tab) => {
    if (next === tab) return;
  track(TE.TAB_CHANGE, { from: tab, to: next });
    setTab(next);
    try { localStorage.setItem('showEditor.lastTab', next); } catch { /* ignore */ }
    const label = t(`shows.editor.tab.${next}`) || next.charAt(0).toUpperCase()+next.slice(1);
    const template = t('shows.editor.tab.active') || 'Active tab: {label}';
    announce(template.replace('{label}', label), 'polite');
  }, [tab, announce, t]);

  useEffect(()=> {
    if(open && !restoredTabRef.current){
      if(initialTab !== 'details'){
        const label = t(`shows.editor.tab.${initialTab}`) || initialTab.charAt(0).toUpperCase()+initialTab.slice(1);
        const tpl = t('shows.editor.tab.restored') || 'Restored last tab: {label}';
        announce(tpl.replace('{label}', label), 'polite');
      }
      restoredTabRef.current = true;
    }
  }, [open, initialTab, announce, t]);

  // Focus first interactive element inside panel when tab changes (after paint)
  useEffect(()=> {
    if(!open) return;
    const panelId = `panel-${tab}`;
    const panel = drawerRef.current?.querySelector<HTMLElement>(`#${panelId}`);
    if(panel){
      requestAnimationFrame(()=> {
        const focusable = panel.querySelector<HTMLElement>('input,select,textarea,button,[tabindex]:not([tabindex="-1"])');
        focusable?.focus();
      });
    }
  }, [tab, open]);

  const portal = (
    <>
  <div className="fixed inset-0 bg-black/40 transition-opacity duration-300" onMouseDown={()=> requestClose()} style={{ zIndex: 9999 }} aria-hidden={showDiscard||showDelete? 'true': undefined} />
  {/* Aria-live region for tab announcements */}
  <div aria-live="polite" className="sr-only" id="tab-announcer" />
      <div
        ref={drawerRef}
  className={`fixed top-0 right-0 bottom-0 w-[100vw] sm:w-[95vw] max-w-[900px] bg-ink-900 text-white shadow-xl flex flex-col drawer-anim-enter ${ready? '':'translate-x-full'} overscroll-contain`}
        role="dialog" aria-modal="true" aria-labelledby="show-editor-title" aria-describedby="show-editor-desc" style={{ zIndex: 10000 }}
        onMouseDown={e=> e.stopPropagation()}
        onWheel={e=> {
          // Allow scroll chaining: if form at top and user scrolls up OR at bottom and scrolls down, let event bubble to body so underlying list scrolls.
          const scrollable = drawerRef.current?.querySelector<HTMLFormElement>('form.flex-1.overflow-y-auto');
          if(!scrollable) return; // fallback
          const atTop = scrollable.scrollTop <= 0;
          const atBottom = Math.ceil(scrollable.scrollTop + scrollable.clientHeight) >= scrollable.scrollHeight;
          if((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)){
            // Temporarily disable pointer-events so body can receive wheel, then restore.
            // Simpler: stop preventing default (we're not). Just don't stopPropagation so outer page scrolls.
            // Ensure event is not captured by nested handler preventing bubbling.
            // No action needed other than not calling stopPropagation.
          } else {
            // Prevent body scroll while inside content mid-range
            e.stopPropagation();
          }
        }}
      >
        {/* Focus trap start sentinel */}
        <div tabIndex={0} aria-hidden="true" onFocus={()=> {
          const focusables = drawerRef.current?.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
          if(focusables && focusables.length>0){
            focusables[focusables.length-1].focus();
          }
        }} />
        {/* Header */}
        <div className="border-b border-white/10 px-4 py-2.5 flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <h3 id="show-editor-title" className="text-lg md:text-xl font-semibold flex items-center gap-2 leading-tight">
              {mode==='add' ? (t('shows.editor.add')||'Add show') : (t('shows.editor.edit')||'Edit show')}
              {(draft as any).status && (
                <div className="flex items-center gap-2">
                  <StatusBadge status={(draft as any).status as any} />
                  {(['offer','pending'] as any[]).includes((draft as any).status) && (
                    <button
                      type="button"
                      onClick={()=> {
                        const current = (draft as any).status;
                        const next = current==='offer'? 'pending' : 'confirmed';
                        setDraft(d=> ({...d, status: next } as any));
                        track(TE.STATUS_PROMOTE, { from: current, to: next });
                        announce((t('shows.editor.status.promote')||'Promoted to')+': '+next, 'polite');
                      }}
                      className="px-2 py-1 rounded bg-accent-500/20 hover:bg-accent-500/30 text-accent-100 text-[11px] border border-accent-400/30 focus-ring"
                    >{t('shows.promote')||'Promote'}</button>
                  )}
                </div>
              )}
            </h3>
            <div id="show-editor-desc" className="text-[11px] opacity-60 flex flex-wrap items-center gap-2 leading-snug min-w-0">
              <span className="truncate max-w-full" title={`${metaCity}${metaCountry?`, ${metaCountry}`:''}${metaDate?` · ${metaDate}`:''}`}>{metaCity}{metaCountry?`, ${metaCountry}`:''}{metaDate?` · ${metaDate}`:''}</span>
              {restored && (
                <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-200 border border-amber-400/30" aria-label={t('shows.editor.restored')||'Restored draft'}>
                  {t('shows.editor.restored')||'Restored draft'}
                </span>
              )}
            </div>
          </div>
          <button onClick={requestClose} className="px-3 py-1.5 text-xs rounded hover:bg-white/10 ml-auto order-3 sm:order-none">{t('shows.dialog.close')||'Close'}</button>
        </div>
        {/* Tab bar + summary */}
  <div className="px-4 pt-2.5 flex flex-wrap items-start gap-3">
          <div className="inline-flex border border-white/12 rounded-md overflow-hidden text-[11px] flex-shrink-0 bg-white/3" role="tablist" aria-label={t('shows.editor.tabs')||'Editor tabs'}>
            {(['details','finance','costs'] as const).map(k=> {
              const active = tab===k;
              const labelKey = `shows.editor.tab.${k}`;
              return (
                <button
                  key={k}
                  role="tab"
                  id={`tab-${k}`}
                  aria-selected={active}
                  aria-controls={`panel-${k}`}
                  tabIndex={active?0:-1}
                  onClick={()=> { changeTab(k); requestAnimationFrame(()=> tabRefs.current[k]?.focus()); }}
                  onKeyDown={handleTabKeyNav}
                  ref={el=> { tabRefs.current[k] = el; }}
                  className={`px-3 py-1 transition-colors ${active?'bg-accent-500/25 text-accent-100 font-semibold':'text-white/70 hover:bg-white/5 focus-visible:bg-white/8'}`}
                >{k==='costs'
                  ? `${(t(labelKey) || t('shows.editor.costs.title') || 'Costs')} (${(draft.costs||[]).length})`
                  : (t(labelKey) || k.charAt(0).toUpperCase()+k.slice(1))}</button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] ml-auto min-w-[260px] md:items-center" aria-label={t('shows.editor.summary.net')||'Summary'}>
            <div className="whitespace-nowrap"><span className="opacity-60 hidden sm:inline">{t('shows.editor.summary.fee')||'Fee'}:</span><span className="opacity-60 sm:hidden">{t('shows.editor.summary.fee')?.slice(0,1)||'F'}:</span> <span className="tabular-nums font-semibold">{fmtMoney(fee)}</span></div>
            <div className="whitespace-nowrap"><span className="opacity-60 hidden sm:inline">{t('shows.editor.summary.wht')||'WHT'}:</span><span className="opacity-60 sm:hidden">{t('shows.editor.summary.wht')?.slice(0,3)||'WHT'}:</span> <span className="tabular-nums font-semibold">{fmtMoney(Math.round(wht))}</span></div>
            <div className="whitespace-nowrap"><span className="opacity-60 hidden sm:inline">{t('shows.editor.summary.costs')||'Costs'}:</span><span className="opacity-60 sm:hidden">{t('shows.editor.summary.costs')?.slice(0,2)||'Ct'}:</span> <span className="tabular-nums font-semibold">{fmtMoney(totalCosts)}</span></div>
            <div className="whitespace-nowrap flex items-center gap-1 text-accent-100"><span className="opacity-60 hidden sm:inline">{t('shows.editor.summary.net')||'Est. Net'}:</span><span className="opacity-60 sm:hidden">{t('shows.editor.summary.net')?.split(' ')[0]||'Net'}:</span> <span className="tabular-nums font-semibold text-accent-50 bg-accent-500/15 px-1.5 py-0.5 rounded border border-accent-500/30">{fmtMoney(net)}</span>{fee>0 && <span className="ml-1 px-1 py-0.5 rounded bg-accent-500/25 border border-accent-500/40 text-accent-50 tabular-nums" title={(t('shows.tooltip.margin')||'Net divided by Fee (%)')+ ' • '+ (t('shows.editor.margin.formula')||'Margin % = Net/Fee')}>{Math.round(marginPct)}%</span>}</div>
          </div>
          <div className="basis-full h-0" aria-hidden="true" />
        </div>
        {/* Body */}
  <form className="flex-1 overflow-y-auto px-4 py-4 text-sm" onSubmit={e=> { e.preventDefault(); attemptSave(); }}>
          {tab==='details' && (
            <div id="panel-details" role="tabpanel" aria-labelledby="tab-details" className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Dynamic primary field group (A/B ordering) */}
              {(() => {
                const fieldNodes: { key: string; node: React.ReactNode }[] = [
                  { key: 'name', node: (
                    <label key="name" className="flex flex-col gap-1">
                      <span className="opacity-80">{t('shows.editor.label.name') || t('shows.table.name') || 'Show name'}</span>
                      <input
                        ref={firstFieldRef}
                        data-field="name"
                        className="px-3 py-2 rounded bg-white/5 border border-white/12 focus-ring"
                        value={(draft as any).name || ''}
                        placeholder={t('shows.editor.placeholder.name') || ''}
                        onChange={e=> setDraft(d=> ({...d, name: e.target.value}))}
                      />
                    </label>
                  )},
                  { key: 'status', node: (
                    <label key="status" className="flex flex-col gap-1">
                      <span className="opacity-80 flex items-center gap-2">{t('shows.editor.label.status')||'Status'}<span className="text-[10px] uppercase tracking-wide opacity-50 font-medium">{t('shows.editor.status.hint')||'Badge o campo'}</span></span>
                      <select
                        data-field="status"
                        className="px-3 py-2 rounded bg-white/5 border border-white/12 focus-ring"
                        value={(draft as any).status || 'pending'}
                        onChange={e=> setDraft(d=> ({...d, status: e.target.value as any}))}
                      >
                        <option value="offer">{t('shows.status.offer')||'Offer'}</option>
                        <option value="pending">{t('shows.status.pending')||'Pending'}</option>
                        <option value="confirmed">{t('shows.status.confirmed')||'Confirmed'}</option>
                        <option value="postponed">{t('shows.status.postponed')||'Postponed'}</option>
                        <option value="canceled">{t('shows.status.canceled')||'Canceled'}</option>
                        <option value="archived">{t('shows.status.archived')||'Archived'}</option>
                      </select>
                    </label>
                  )},
                  { key: 'currencyFee', node: (
                    <div className="flex flex-col gap-1">
                      <label className="flex flex-col gap-1">
                        <span className="opacity-80 flex items-center gap-2">{t('shows.editor.label.currency')||'Currency'}<span className="text-[10px] uppercase tracking-wide opacity-50 font-medium">{t('shows.editor.help.currency')||'Contract currency'}</span></span>
                        <select
                          data-field="feeCurrency"
                          className="px-3 py-2 rounded bg-white/5 border border-white/12 focus-ring"
                          value={feeCurrency}
                          onChange={e=> setDraft(d=> ({...d, feeCurrency: e.target.value as any }))}
                        >
                          {['EUR','USD','GBP','AUD'].map(c=> <option key={c} value={c}>{c}</option>)}
                        </select>
                      </label>
                      {fee>0 && feeCurrency!==baseCurrency && (
                        <p className="text-[11px] opacity-70 leading-snug">
                          {(t('shows.editor.fx.convertedFee')||'≈ {amount} {base}')
                            .replace('{amount}', (convertedFee!=null? fmtMoney(Math.round(convertedFee)) : '?'))
                            .replace('{base}', baseCurrency)}
                          {effectiveRate && (
                            <><br/><span className="inline-flex items-center gap-1">{t('shows.editor.fx.rateOn')||'Rate'}: {effectiveRate.toFixed(3)}</span></>
                          )}
                        </p>
                      )}
                      {fee>0 && feeCurrency!==baseCurrency && convertedFee==null && (
                        <p className="text-[11px] text-amber-300">{t('shows.editor.fx.unavailable')||'Rate unavailable'}</p>
                      )}
                    </div>
                  )},
                  { key: 'city', node: (
                    <label key="city" className="flex flex-col gap-1">
                      <span className="opacity-80">{t('shows.editor.label.city')||'City'}</span>
                      <div className="flex gap-2 items-center">
                        <input list="city-suggestions" data-field="city" aria-required="true" aria-invalid={!!validation.city} aria-describedby={validation.city? 'err-city':undefined} className="px-3 py-2 rounded bg-white/5 border border-white/12 focus-ring flex-1" value={draft.city||''} onChange={e=> setDraft(d=>({...d, city: e.target.value}))} onBlur={e=> { const v = e.target.value.trim(); if(v) recordCity(v); }} />
                        {recentCities.length>0 && (
                          <div className="hidden md:flex items-center gap-1" aria-label={t('shows.editor.city.recent')||'Recent cities'}>
                            {recentCities.slice(0,4).map(rc=> (
                              <button key={rc} type="button" className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px]" onClick={()=> { setDraft(d=> ({...d, city: rc })); recordCity(rc); }}>{rc}</button>
                            ))}
                          </div>
                        )}
                      </div>
                      <datalist id="city-suggestions">
                        {recentCities.map(c=> <option key={'city-'+c} value={c} />)}
                      </datalist>
                      {validation.city && <p id="err-city" className="text-[11px] text-red-400">{t(validation.city)||'Required'}</p>}
                    </label>
                  )},
                  { key: 'country', node: (
                    <div key="country" className="flex flex-col gap-1">
                      <label htmlFor="show-editor-country" className="opacity-80">{t('shows.editor.label.country')||'Country'}</label>
                      <CountrySelect
                        id="show-editor-country"
                        aria-label={t('shows.editor.label.country')||'Country'}
                        data-field="country"
                        aria-required="true"
                        aria-invalid={!!validation.country}
                        aria-describedby={validation.country? 'err-country':undefined}
                        value={draft.country||''}
                        onChange={code=> setDraft(d=> ({...d, country: code}))}
                      />
                      {validation.country && <p id="err-country" className="text-[11px] text-red-400">{t(validation.country)||'Required'}</p>}
                    </div>
                  )},
                  { key: 'date', node: (
                    <label key="date" className="flex flex-col gap-1">
                      <span className="opacity-80">{t('shows.editor.label.date')||'Date'}</span>
                      <input data-field="date" aria-required="true" aria-invalid={!!validation.date} aria-describedby={validation.date? 'err-date':undefined} type="date" className="px-3 py-2 rounded bg-white/5 border border-white/12 focus-ring" value={String(draft.date||'').slice(0,10)} onChange={e=> setDraft(d=>({...d, date: e.target.value}))} />
                      {validation.date && <p id="err-date" className="text-[11px] text-red-400">{t(validation.date)||'Required'}</p>}
                    </label>
                  )},
                  { key: 'fee', node: (
                    <label key="fee" className="flex flex-col gap-1 relative">
                      <span className="opacity-80 flex flex-col gap-0.5">
                        <span className="flex items-center gap-2">{t('shows.editor.label.fee')||'Fee'}</span>
                        <span id="fee-help" className="text-[11px] font-normal opacity-60 leading-tight">{t('shows.editor.help.fee')||'Gross fee before deductions'}</span>
                      </span>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none text-accent-200" aria-hidden="true">{fmtMoney(0).replace(/[0-9,\.\s-]/g,'').trim()||'$'}</span>
                        <input data-field="fee" aria-required="true" aria-invalid={!!validation.fee} aria-describedby={(validation.fee? 'err-fee ':'') + 'fee-help'} type="number" step={1} min={0} className="pl-6 pr-3 py-2 rounded bg-white/5 border border-white/12 focus-ring w-full" value={draft.fee??''} onChange={e=> setDraft(d=>({...d, fee: e.target.value===''? undefined : Number(e.target.value)}))} onBlur={e=> { const v = Number(e.target.value); if(!isNaN(v)) setDraft(d=> ({...d, fee: Math.round(v)})); }} />
                      </div>
                      {validation.fee && <p id="err-fee" className="text-[11px] text-red-400">{t(validation.fee)||'Required'}</p>}
                    </label>
                  )},
                  { key: 'whtPct', node: (
                    <label key="whtPct" className="flex flex-col gap-1 relative">
                      <span className="opacity-80 flex flex-col gap-0.5">
                        <span className="flex items-center gap-2">{t('shows.editor.label.wht')||'WHT %'}</span>
                        <span id="wht-help" className="text-[11px] font-normal opacity-60 leading-tight">{t('shows.editor.help.wht')||'Local withholding %'}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <input data-field="whtPct" aria-invalid={!!validation.whtPct} aria-describedby={(validation.whtPct? 'err-whtPct ':'') + 'wht-help'} type="number" step={1} min={0} max={50} className="px-3 py-2 rounded bg-white/5 border border-white/12 focus-ring w-full" value={draft.whtPct??''} onChange={e=> setDraft(d=>({...d, whtPct: e.target.value===''? undefined : Math.max(0, Math.min(50, Number(e.target.value)||0))}))} />
                        {(() => {
                          if(!draft.country) return null;
                          const defaults: Record<string, number> = { ES:15, FR:15, DE:15, MX:10, BR:15, US:0 };
                          const sug = defaults[draft.country];
                          if(sug==null) return null;
                          const isApplied = draft.whtPct === sug;
                          const show = draft.whtPct==null || (!isApplied && draft.whtPct !== sug);
                          if(!show) return null;
                          return (
                            <button
                              type="button"
                              onClick={()=> { setDraft(d=> ({...d, whtPct: sug })); announce((t('shows.editor.wht.suggest.applied')||'WHT suggestion applied')+': '+sug+'%'); track(TE.WHT_SUGGEST_APPLY, { country: draft.country, pct: sug }); }}
                              className={`px-2 py-1 rounded text-[11px] border ${isApplied? 'border-green-500/40 text-green-300 bg-green-500/10':'border-accent-500/40 text-accent-200 bg-accent-500/10 hover:bg-accent-500/20'}`}
                              aria-pressed={isApplied}
                            >{sug}% {isApplied? (t('shows.editor.wht.suggest.applied')||'applied') : (t('shows.editor.wht.suggest')||'suggest')}</button>
                          );
                        })()}
                      </div>
                      {validation.whtPct && <p id="err-whtPct" className="text-[11px] text-red-400">{t(validation.whtPct)||'Out of range'}</p>}
                    </label>
                  )},
                ];
                const ordered = sortByFieldOrder(fieldNodes, fieldOrder);
                // Ensure every mapped node has a stable key (wrap in Fragment so internal structure untouched)
                return ordered.map(f=> <React.Fragment key={f.key}>{f.node}</React.Fragment>);
              })()}
              {/* Venue merged conceptually with Name: keep field hidden for backward compatibility */}
                <label className="flex flex-col gap-1 md:col-span-2">
                  <span className="opacity-80 flex items-center gap-2">{t('shows.editor.label.venue')||'Venue'}<span className="text-[10px] uppercase tracking-wide opacity-50 font-medium">{t('shows.editor.help.venue')||'Optional venue / room name'}</span></span>
                  <input
                    list="venue-suggestions"
                    data-field="venue"
                    className="px-3 py-2 rounded bg-white/5 border border-white/12 focus-ring"
                    value={(draft as any).venue||''}
                    placeholder={t('shows.editor.placeholder.venue')||'Venue name'}
                    onChange={e=> setDraft(d=> ({...d, venue: e.target.value }))}
                    onBlur={e=> { const v = e.target.value.trim(); if(v) recordVenue(v); }}
                  />
                  {recentVenues.length>0 && (
                    <div className="hidden md:flex items-center gap-1 mt-1" aria-label={t('shows.editor.venue.recent')||'Recent venues'}>
                      {recentVenues.slice(0,6).map(rv=> (
                        <button key={rv} type="button" className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px]" onClick={()=> { setDraft(d=> ({...d, venue: rv })); recordVenue(rv); }}>{rv}</button>
                      ))}
                    </div>
                  )}
                  <datalist id="venue-suggestions">
                    {recentVenues.map(v=> <option key={'venue-'+v} value={v} />)}
                  </datalist>
                </label>
              {/* Status selector */}
              {/* Travel CTA (contextual) */}
              {draft.date && draft.status!== 'canceled' && (() => {
                const iso = String(draft.date).slice(0,10);
                const showDate = new Date(iso + 'T00:00:00');
                const now = new Date();
                const diffDays = Math.round((showDate.getTime() - now.getTime()) / 86400000);
                const within = diffDays <= 30;
                const tripExists = within && hasTripAroundDate?.(iso);
                const noAction = diffDays > 30;
                let msg: string;
                if (noAction) msg = t('shows.travel.noCta')||'No travel action needed';
                else if (tripExists) msg = t('shows.travel.tripExists')||'Trip already scheduled around this date';
                else msg = (draft.status==='confirmed'
                  ? (t('shows.travel.soonConfirmed')||'Upcoming confirmed show — consider adding travel.')
                  : (t('shows.travel.soonGeneric')||'Upcoming show — consider planning travel.'));
                return (
                  <div className="md:col-span-2 -mb-1 -mt-1 flex items-center gap-2 text-[11px]" data-travel-cta>
                    <span className="px-2 py-1 rounded bg-accent-500/15 border border-accent-500/30 text-accent-200">
                      {t('shows.travel.quick')||'Travel'}:
                    </span>
                    <span className="opacity-80 line-clamp-2 flex-1 min-w-0">{msg}</span>
                    {!noAction && !tripExists && (
                      <button
                        type="button"
                        className="ml-auto px-2 py-1 rounded bg-accent-500 text-black hover:brightness-110"
                        onClick={()=> { track(TE.TRAVEL_CTA_CLICK, { type:'plan', date: iso }); onPlanTravel?.(iso); }}
                      >{t('shows.travel.plan')||'Plan travel'}</button>
                    )}
                    {tripExists && (
                      <button
                        type="button"
                        className="ml-auto px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                        onClick={()=> { track(TE.TRAVEL_CTA_CLICK, { type:'openTrip', date: iso }); onOpenTrip?.(iso); }}
                      >{t('shows.travel.title')||'Location'}</button>
                    )}
                  </div>
                );
              })()}
              {/* Agencies moved to Finance tab for clarity */}
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="opacity-80">{t('shows.editor.label.notes')||'Notes'}</span>
                <textarea data-field="notes" className="px-3 py-2 rounded bg-white/5 border border-white/12 focus-ring" rows={3} value={draft.notes||''} onChange={e=> setDraft(d=>({...d, notes: e.target.value}))} />
              </label>
              {/* Quick Entry (beta) */}
              <div className="md:col-span-2 flex flex-col gap-1 border border-white/10 rounded p-2 bg-white/3">
                <div className="flex items-center gap-2 text-[11px]" aria-live={quickError? 'polite': undefined}>
                  <span className="uppercase tracking-wide text-accent-200 font-semibold">{t('shows.editor.quick.label')||'Quick entry (beta)'}</span>
                  <span className="text-accent-300" id="quick-hint">{t('shows.editor.quick.hint')||'Entrada rápida (beta) — pega o escribe y aplica'}</span>
                </div>
                <div className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={quickEntry}
                    onChange={e=> setQuickEntry(e.target.value)}
                    placeholder={t('shows.editor.quick.placeholder')||'20/04/2025 "Nombre" Madrid ES fee 12k wht 15%'}
                    className="flex-1 px-3 py-1.5 rounded bg-white/8 border border-white/20 focus-ring text-xs placeholder:text-accent-400/70"
                    aria-describedby={(quickError? 'quick-error ' : '') + 'quick-hint' + (quickPreview? ' quick-preview' : '')}
                  />
                  <button
                    type="button"
                    disabled={!quickPreview}
                    onClick={applyQuickPreview}
                    aria-disabled={!quickPreview}
                    className={`px-2 py-1 rounded text-xs font-medium border focus-ring transition-colors ${quickPreview? 'bg-accent-500 text-black border-accent-400 hover:bg-accent-400':'bg-white/5 text-accent-400 border-white/15 cursor-not-allowed'}`}
                    aria-label={t('shows.editor.quick.apply')||'Apply parsed values'}
                  >{t('shows.editor.quick.apply')||'Apply'}</button>
                </div>
                {quickError && <p id="quick-error" className="text-[11px] text-red-400">{quickError}</p>}
                {quickPreview && !quickError && (
                  <>
                    <div className="text-[10px] opacity-70 mt-1" aria-live="polite">
                      {(t('shows.editor.quick.preview.summary')||'Will set: {fields}').replace('{fields}', Object.keys(quickPreview).join(', '))}
                    </div>
                    <div id="quick-preview" className="text-[11px] flex flex-wrap gap-2 mt-1" role="list" aria-label={t('shows.editor.quick.preview.list')||'Parsed tokens preview'}>
                      {Object.entries(quickPreview).map(([k,v])=> (
                        <span role="listitem" key={k} className="px-1.5 py-0.5 rounded bg-accent-500/15 border border-accent-500/30 text-accent-100 flex items-center gap-1" title={t('shows.editor.quick.icon.'+k) || k}>
                          <span aria-hidden="true">{quickIcons[k]||'•'}</span>
                          <span>{k}: <strong className="font-semibold text-accent-50">{String(v)}</strong></span>
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {/* Compact financial cards */}
              {(() => {
                const feeVal = Number(draft.fee)||0;
                const mgmt = managementAgencies.find(a=> a.name===draft.mgmtAgency);
                const booking = bookingAgencies.find(a=> a.name===draft.bookingAgency);
                const mgmtPctEff = draft.mgmtPct!=null? draft.mgmtPct : (mgmt?.commissionPct||0);
                const bookingPctEff = draft.bookingPct!=null? draft.bookingPct : (booking?.commissionPct||0);
                const mgmtDefault = mgmt?.commissionPct || 0;
                const bookingDefault = booking?.commissionPct || 0;
                const mgmtOverridden = draft.mgmtPct!=null && draft.mgmtPct !== mgmtDefault;
                const bookingOverridden = draft.bookingPct!=null && draft.bookingPct !== bookingDefault;
                const whtPctEff = draft.whtPct||0;
                const whtVal = feeVal * (whtPctEff/100);
                const commVal = feeVal * ((mgmtPctEff + bookingPctEff)/100);
                const costsVal = (draft.costs||[]).reduce((s,c)=> s + (c.amount||0), 0);
                const netVal = feeVal - whtVal - commVal - costsVal;
                return (
                  <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mt-1">
                    <div className="glass rounded p-2"><div className="uppercase tracking-wide opacity-60">{t('shows.editor.summary.fee')||'Fee'}</div><div className="text-sm font-semibold tabular-nums flex items-center gap-1">{fmtMoney(feeVal)}{feeVal>0 && netVal>0 && <span className="px-1 rounded bg-accent-500/15 border border-accent-500/30 text-accent-200 text-[10px]" title={t('shows.tooltip.margin')||'Net divided by Fee (%)'}>{Math.round((netVal/feeVal)*100)}%</span>}</div></div>
                    <div className="glass rounded p-2"><div className="uppercase tracking-wide opacity-60">{t('shows.editor.summary.wht')||'WHT'}</div><div className="text-sm font-semibold tabular-nums">-{fmtMoney(Math.round(whtVal))}</div></div>
                    <div className={`glass rounded p-2 ${ (mgmtOverridden||bookingOverridden)? 'ring-1 ring-amber-400/70' : ''}`
                      +` relative`}
                      title={(mgmtOverridden||bookingOverridden)? (t('shows.editor.commission.overriddenIndicator')||'Commission overridden') : undefined}
                    >
                      <div className="uppercase tracking-wide opacity-60 flex items-center gap-1 flex-wrap">
                        {t('shows.editor.finance.commissions')||'Commissions'}
                        {!mgmtOverridden && mgmtDefault>0 && <span className="px-1 rounded bg-white/5 border border-white/10 text-[9px] text-accent-200" title={t('shows.editor.commission.default')?.replace('{pct}', String(mgmtDefault))}>{t('shows.editor.commission.default')?.replace('{pct}', String(mgmtDefault))}</span>}
                        {!bookingOverridden && bookingDefault>0 && <span className="px-1 rounded bg-white/5 border border-white/10 text-[9px] text-accent-200" title={t('shows.editor.commission.default')?.replace('{pct}', String(bookingDefault))}>{t('shows.editor.commission.default')?.replace('{pct}', String(bookingDefault))}</span>}
                        {(mgmtOverridden||bookingOverridden) && <span className="px-1 rounded bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[9px]">{t('shows.editor.commission.overridden')||'Override'}</span>}
                      </div>
                      <div className="text-sm font-semibold tabular-nums flex items-center gap-2">
                        -{fmtMoney(Math.round(commVal))}
                        {(mgmtOverridden) && <span className="px-1 rounded bg-amber-500/25 border border-amber-400/50 text-amber-100 text-[9px]" title={`${mgmtDefault}% → ${draft.mgmtPct}`}>{mgmtDefault}%→{draft.mgmtPct}</span>}
                        {(bookingOverridden) && <span className="px-1 rounded bg-amber-500/25 border border-amber-400/50 text-amber-100 text-[9px]" title={`${bookingDefault}% → ${draft.bookingPct}`}>{bookingDefault}%→{draft.bookingPct}</span>}
                      </div>
                    </div>
                    <div className="glass rounded p-2 col-span-2 sm:col-span-1 bg-accent-500/10 border border-accent-500/30">
                      <div className="uppercase tracking-wide opacity-70 font-medium flex items-center gap-1 text-accent-100">{t('shows.editor.summary.net')||'Est. Net'}</div>
                      <div className="text-sm font-semibold tabular-nums flex items-center gap-1 text-accent-50">{fmtMoney(Math.round(netVal))}{feeVal>0 && <span className="px-1 rounded bg-accent-500/25 border border-accent-500/40 text-accent-50 text-[10px]" title={t('shows.tooltip.margin')||'Net divided by Fee (%)'}>{Math.round((netVal/feeVal)*100)}%</span>}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          {tab==='finance' && (
            <div id="panel-finance" role="tabpanel" aria-labelledby="tab-finance" className="text-xs space-y-5 max-w-[620px]">
              <div className="opacity-80 text-[11px] flex items-center gap-2">
                <span>{t('shows.editor.tooltip.netFormula')||'Net = Fee − (Fee×WHT%) − Commission − Costs'}</span>
              </div>
              {(() => {
                const feeVal = Number(draft.fee)||0;
                const mgmt = managementAgencies.find(a=> a.name===draft.mgmtAgency);
                const booking = bookingAgencies.find(a=> a.name===draft.bookingAgency);
                const mgmtPctEff = draft.mgmtPct!=null? draft.mgmtPct : (mgmt?.commissionPct||0);
                const bookingPctEff = draft.bookingPct!=null? draft.bookingPct : (booking?.commissionPct||0);
                const mgmtDefault = mgmt?.commissionPct || 0;
                const bookingDefault = booking?.commissionPct || 0;
                const mgmtOverridden = draft.mgmtPct!=null && draft.mgmtPct !== mgmtDefault;
                const bookingOverridden = draft.bookingPct!=null && draft.bookingPct !== bookingDefault;
                const whtPctEff = draft.whtPct||0;
                const whtVal = feeVal * (whtPctEff/100);
                const commVal = feeVal * ((mgmtPctEff + bookingPctEff)/100);
                const costsVal = (draft.costs||[]).reduce((s,c)=> s + (c.amount||0), 0);
                const netVal = feeVal - whtVal - commVal - costsVal;
                return <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="glass rounded p-2 space-y-1">
                    <div className="uppercase tracking-wide opacity-60">{t('shows.editor.summary.fee')||'Fee'}</div>
                    <div className="text-sm font-semibold tabular-nums">{fmtMoney(feeVal)}</div>
                  </div>
                  <div className="glass rounded p-2 space-y-1">
                    <div className="uppercase tracking-wide opacity-60">{t('shows.editor.summary.wht')||'WHT'} {whtPctEff?`(${whtPctEff}%)`:''}</div>
                    <div className="text-sm font-semibold tabular-nums">-{fmtMoney(Math.round(whtVal))}</div>
                  </div>
                  <div
                    className={`glass rounded p-2 space-y-1 relative ${(mgmtOverridden||bookingOverridden)?'ring-1 ring-amber-400/70':''}`}
                    title={(mgmtOverridden||bookingOverridden)? (t('shows.editor.commission.overriddenIndicator')||'Commission overridden') : undefined}
                  >
                    <div className="uppercase tracking-wide opacity-60 flex items-center gap-1 flex-wrap">
                      {t('shows.editor.finance.commissions')||'Commissions'} {(mgmtPctEff+bookingPctEff)?`(${(mgmtPctEff+bookingPctEff).toFixed(1)}%)`:''}
                      {!mgmtOverridden && mgmtDefault>0 && <span className="px-1 rounded bg-white/5 border border-white/10 text-[9px]" title={t('shows.editor.commission.default')?.replace('{pct}', String(mgmtDefault))}>{t('shows.editor.commission.default')?.replace('{pct}', String(mgmtDefault))}</span>}
                      {!bookingOverridden && bookingDefault>0 && <span className="px-1 rounded bg-white/5 border border-white/10 text-[9px]" title={t('shows.editor.commission.default')?.replace('{pct}', String(bookingDefault))}>{t('shows.editor.commission.default')?.replace('{pct}', String(bookingDefault))}</span>}
                      {(mgmtOverridden||bookingOverridden) && <span className="px-1 rounded bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[9px]">{t('shows.editor.commission.overridden')||'Override'}</span>}
                    </div>
                    <div className="text-sm font-semibold tabular-nums flex items-center gap-2">
                      -{fmtMoney(Math.round(commVal))}
                      {(mgmtOverridden) && <span className="px-1 rounded bg-amber-500/25 border border-amber-400/50 text-amber-100 text-[9px]" title={`${mgmtDefault}% → ${draft.mgmtPct}`}>{mgmtDefault}%→{draft.mgmtPct}</span>}
                      {(bookingOverridden) && <span className="px-1 rounded bg-amber-500/25 border border-amber-400/50 text-amber-100 text-[9px]" title={`${bookingDefault}% → ${draft.bookingPct}`}>{bookingDefault}%→{draft.bookingPct}</span>}
                    </div>
                  </div>
                  <div className="glass rounded p-2 space-y-1">
                    <div className="uppercase tracking-wide opacity-60">{t('shows.editor.summary.costs')||'Costs'}</div>
                    <div className="text-sm font-semibold tabular-nums">-{fmtMoney(Math.round(costsVal))}</div>
                  </div>
                  <div className="glass rounded p-2 space-y-1 col-span-2 sm:col-span-3 bg-accent-500/12 border border-accent-500/40">
                    <div className="uppercase tracking-wide opacity-80 font-medium flex items-center gap-2 text-accent-100">{t('shows.editor.summary.net')||'Est. Net'}{feeVal>0 && <span className="px-1 py-0.5 rounded bg-accent-500/25 border border-accent-500/40 text-accent-50 text-[10px]" title={t('shows.tooltip.margin')||'Net divided by Fee (%)'}>{Math.round((netVal/feeVal)*100)}%</span>}</div>
                    <div className="text-base font-semibold tabular-nums text-accent-50">{fmtMoney(Math.round(netVal))}</div>
                  </div>
                </div>;
              })()}
              {(() => {
                const mgmt = managementAgencies.find(a=> a.name===draft.mgmtAgency);
                const booking = bookingAgencies.find(a=> a.name===draft.bookingAgency);
                const mgmtDefault = mgmt?.commissionPct || 0;
                const bookingDefault = booking?.commissionPct || 0;
                return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1">
                    <span className="opacity-80">{t('shows.editor.label.mgmt')||'Mgmt Agency'}</span>
                    <select
                      className="px-3 py-2 rounded bg-white/5 border border-white/12 focus-ring"
                      value={draft.mgmtAgency || ''}
                      onChange={e=> setDraft(d=> ({...d, mgmtAgency: e.target.value || undefined}))}
                    >
                      <option value="">{t('common.none')||'—'}</option>
                      {managementAgencies.map(a=> (
                        <option key={a.id} value={a.name}>{a.name} ({a.commissionPct}%)</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="opacity-80">{t('shows.editor.label.booking')||'Booking Agency'}</span>
                    <select
                      className="px-3 py-2 rounded bg-white/5 border border-white/12 focus-ring"
                      value={draft.bookingAgency || ''}
                      onChange={e=> setDraft(d=> ({...d, bookingAgency: e.target.value || undefined}))}
                    >
                      <option value="">{t('common.none')||'—'}</option>
                      {bookingAgencies.map(a=> (
                        <option key={a.id} value={a.name}>{a.name} ({a.commissionPct}%)</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="opacity-80 flex items-center gap-2">{t('shows.table.agency.mgmt')||'Mgmt'} %
                      {draft.mgmtAgency && (
                        draft.mgmtPct==null ? (
                          <span className="px-1 rounded bg-white/5 border border-white/15 text-[10px]" title={t('shows.editor.commission.default')?.replace('{pct}', String(mgmtDefault)) || `Default ${mgmtDefault}%`}>
                            {t('shows.editor.commission.default')? t('shows.editor.commission.default')!.replace('{pct}', String(mgmtDefault)) : `Default ${mgmtDefault}%`}
                          </span>
                        ) : draft.mgmtPct !== mgmtDefault && (
                          <button type="button" onClick={()=> setDraft(d=> ({...d, mgmtPct: undefined}))} className="px-1 rounded bg-amber-500/20 border border-amber-400/50 text-amber-100 hover:bg-amber-500/30 text-[10px] focus-ring"
                            title={t('shows.editor.commission.reset')||'Reset'}
                          >{t('shows.editor.commission.overridden')||'Override'}</button>
                        )
                      )}
                    </span>
                    <input aria-describedby={draft.mgmtPct!=null && draft.mgmtPct!==mgmtDefault? 'mgmt-override-hint': undefined} type="number" min={0} max={50} className={`px-3 py-2 rounded bg-white/5 border focus-ring ${(draft.mgmtPct!=null && draft.mgmtPct!==mgmtDefault)?'border-amber-400/60':'border-white/12'}`} value={draft.mgmtPct??''} onChange={e=> setDraft(d=> ({...d, mgmtPct: e.target.value===''? undefined : Math.max(0, Math.min(50, Number(e.target.value)||0))}))} />
                    {(draft.mgmtPct!=null && draft.mgmtPct!==mgmtDefault) && <span id="mgmt-override-hint" className="text-[10px] text-amber-200">{t('shows.editor.commission.overriddenIndicator')||'Commission overridden'} ({mgmtDefault}% → {draft.mgmtPct}%)</span>}
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="opacity-80 flex items-center gap-2">{t('shows.table.agency.booking')||'Booking'} %
                      {draft.bookingAgency && (
                        draft.bookingPct==null ? (
                          <span className="px-1 rounded bg-white/5 border border-white/15 text-[10px]" title={t('shows.editor.commission.default')?.replace('{pct}', String(bookingDefault)) || `Default ${bookingDefault}%`}>
                            {t('shows.editor.commission.default')? t('shows.editor.commission.default')!.replace('{pct}', String(bookingDefault)) : `Default ${bookingDefault}%`}
                          </span>
                        ) : draft.bookingPct !== bookingDefault && (
                          <button type="button" onClick={()=> setDraft(d=> ({...d, bookingPct: undefined}))} className="px-1 rounded bg-amber-500/20 border border-amber-400/50 text-amber-100 hover:bg-amber-500/30 text-[10px] focus-ring"
                            title={t('shows.editor.commission.reset')||'Reset'}
                          >{t('shows.editor.commission.overridden')||'Override'}</button>
                        )
                      )}
                    </span>
                    <input aria-describedby={draft.bookingPct!=null && draft.bookingPct!==bookingDefault? 'booking-override-hint': undefined} type="number" min={0} max={50} className={`px-3 py-2 rounded bg-white/5 border focus-ring ${(draft.bookingPct!=null && draft.bookingPct!==bookingDefault)?'border-amber-400/60':'border-white/12'}`} value={draft.bookingPct??''} onChange={e=> setDraft(d=> ({...d, bookingPct: e.target.value===''? undefined : Math.max(0, Math.min(50, Number(e.target.value)||0))}))} />
                    {(draft.bookingPct!=null && draft.bookingPct!==bookingDefault) && <span id="booking-override-hint" className="text-[10px] text-amber-200">{t('shows.editor.commission.overriddenIndicator')||'Commission overridden'} ({bookingDefault}% → {draft.bookingPct}%)</span>}
                  </label>
                </div>;
              })()}
              {(() => {
                const b = breakdownNet({ fee: draft.fee, whtPct: draft.whtPct, mgmtPct: draft.mgmtPct, bookingPct: draft.bookingPct, costs: draft.costs });
                return (
                  <div className="border border-white/10 rounded-md p-4 bg-white/5 space-y-3">
                    <h4 className="font-semibold text-[12px] tracking-wide opacity-90">{t('shows.editor.finance.breakdown')||'Financial Breakdown'}</h4>
                    <dl className="grid grid-cols-2 gap-y-1 text-[11px]">
                      <dt className="opacity-70">{t('shows.editor.summary.fee')||'Fee'}</dt><dd className="text-right tabular-nums font-medium">{fmtMoney(b.fee)}</dd>
                      <dt className="opacity-70">{t('shows.editor.summary.wht')||'WHT'}</dt><dd className="text-right tabular-nums">-{fmtMoney(Math.round(b.wht))}</dd>
                      <dt className="opacity-70">{t('shows.table.agency.mgmt')||'Mgmt'} ({b.mgmt?((b.mgmt/b.fee*100).toFixed(1)+'%'): '0%'})</dt><dd className="text-right tabular-nums">-{fmtMoney(Math.round(b.mgmt))}</dd>
                      <dt className="opacity-70">{t('shows.table.agency.booking')||'Booking'} ({b.booking?((b.booking/b.fee*100).toFixed(1)+'%'): '0%'})</dt><dd className="text-right tabular-nums">-{fmtMoney(Math.round(b.booking))}</dd>
                      <dt className="opacity-70">{t('shows.editor.summary.costs')||'Costs'}</dt><dd className="text-right tabular-nums">-{fmtMoney(Math.round(b.totalCosts))}</dd>
                      <dt className="font-semibold pt-1 border-t border-white/10 mt-1 text-accent-100">{t('shows.editor.summary.net')||'Est. Net'}</dt><dd className="text-right tabular-nums font-semibold pt-1 border-t border-white/10 mt-1 flex items-center gap-1 text-accent-50">{fmtMoney(Math.round(b.net))}{b.fee>0 && <span className="px-1 rounded bg-accent-500/25 border border-accent-500/40 text-accent-50 text-[10px]" title={t('shows.tooltip.margin')||'Net divided by Fee (%)'}>{Math.round((b.net/b.fee)*100)}%</span>}</dd>
                    </dl>
                  </div>
                );
              })()}
            </div>
          )}
          {tab==='costs' && (
            <div className="space-y-4 text-xs" id="panel-costs" role="tabpanel" aria-labelledby="tab-costs">
              <div className="flex flex-wrap items-center gap-2 sticky top-0 z-10 bg-ink-900/90 backdrop-blur px-1 py-2 -mx-1 border-b border-white/5">
                <p className="opacity-80 font-medium mr-auto flex items-center gap-2">
                  {t('shows.costs.desc')||'Costs'} <span className="opacity-50">({(draft.costs||[]).length})</span>
                  {(draft.costs&&draft.costs.length>0) && (
                    <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 tracking-wide">
                      {fmtMoney((draft.costs||[]).reduce((s,c)=> s+(c.amount||0),0))}
                    </span>
                  )}
                </p>
                {(draft.costs&&draft.costs.length>1) && (
                  <div className="flex items-center gap-1" aria-label={t('shows.editor.cost.sort')||'Sort'}>
                    <button type="button" className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px]" onClick={()=> { setDraft(d=> ({...d, costs: [...(d.costs||[])].sort((a,b)=> (a.type||'').localeCompare(b.type||'')) })); track(TE.COST_SORT, { by:'type', direction:'asc' }); }}>{t('shows.sort.type')||'Type'}</button>
                    <button type="button" className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px]" onClick={()=> { setDraft(d=> ({...d, costs: [...(d.costs||[])].sort((a,b)=> (b.amount||0)-(a.amount||0)) })); track(TE.COST_SORT, { by:'amount', direction:'desc' }); }}>{t('shows.sort.amount')||'Amount'}</button>
                  </div>
                )}
                {recentCostTypes.length>0 && (
                  <div className="hidden md:flex items-center gap-1" aria-label={t('shows.editor.cost.recent')||'Recent cost types'}>
                    {recentCostTypes.slice(0,4).map(ct=> (
                      <button key={ct} type="button" className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] tracking-wide" onClick={()=> {
                        const id = crypto.randomUUID();
                        setDraft(d=> ({...d, costs: [...(d.costs||[]), { id, type: ct, amount:0, desc:'' }]}));
                        manualCostAdds.current += 1;
                        setJustAddedCostId(id);
                        setTimeout(()=> setJustAddedCostId(null), 1200);
                        track(TE.COST_ADD_QUICK_RECENT, { type: ct });
                      }}>{ct}</button>
                    ))}
                  </div>
                )}
                <button type="button" onClick={()=> { setShowBulk(true); track(TE.COST_BULK_OPEN); }} className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] focus-ring">{t('shows.editor.bulk.open')||'Bulk add'}</button>
                {/* Cost Templates Popover */}
                <div className="relative" data-cost-template-menu>
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={openTemplateMenu? 'true':'false'}
                    aria-controls="cost-template-popover"
                    onClick={()=> setOpenTemplateMenu(o=> !o)}
                    onKeyDown={e=> {
                      if(e.key==='ArrowDown' && !openTemplateMenu){ e.preventDefault(); setOpenTemplateMenu(true); requestAnimationFrame(()=> document.getElementById('cost-template-item-0')?.focus()); }
                    }}
                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 focus-ring"
                  >{t('shows.editor.cost.addTemplate')||'Add template'}</button>
                  {openTemplateMenu && (
                    <div
                      id="cost-template-popover"
                      role="menu"
                      aria-label={t('shows.editor.cost.templateMenu')||'Cost templates'}
                      className="absolute z-20 mt-1 -left-4 sm:left-auto sm:right-0 w-56 rounded-md shadow-lg border border-white/10 backdrop-blur bg-neutral-900/95 p-1 flex flex-col focus-outline"
                    >
                      {COST_TEMPLATES.map((tpl,idx)=> (
                        <button
                          key={tpl.id}
                          id={`cost-template-item-${idx}`}
                          type="button"
                          role="menuitem"
                          className="text-left px-2 py-1 rounded text-[11px] hover:bg-white/10 focus:bg-white/10 focus:outline-none flex flex-col gap-0.5"
                          onClick={()=> { applyCostTemplate(tpl); }}
                          onKeyDown={e=> {
                            if(e.key==='Escape'){ e.stopPropagation(); setOpenTemplateMenu(false); (e.currentTarget.closest('[data-cost-template-menu]') as HTMLElement)?.querySelector('button')?.focus(); }
                            else if(e.key==='ArrowDown'){ e.preventDefault(); (document.getElementById(`cost-template-item-${idx+1}`)||document.getElementById('cost-template-item-0'))?.focus(); }
                            else if(e.key==='ArrowUp'){ e.preventDefault(); (document.getElementById(`cost-template-item-${idx-1}`)||document.getElementById(`cost-template-item-${COST_TEMPLATES.length-1}`))?.focus(); }
                            else if(e.key==='Tab'){ setOpenTemplateMenu(false); }
                          }}
                        >
                          <span className="font-medium leading-tight">{tpl.label}</span>
                          <span className="opacity-60 line-clamp-2 leading-tight">{tpl.items.map(i=> i.desc||i.type).join(', ')}</span>
                        </button>
                      ))}
                      <div className="mt-1 pt-1 border-t border-white/10 flex">
                        <button
                          type="button"
                          className="flex-1 text-[10px] uppercase tracking-wide px-2 py-1 rounded hover:bg-white/5 text-accent-300"
                          onClick={()=> { setOpenTemplateMenu(false); track(TE.COST_TEMPLATE_DISMISS); }}
                        >{t('common.close')||'Close'}</button>
                      </div>
                    </div>
                  )}
                </div>
                {(draft.costs&&draft.costs.length>0) && (
                  <button type="button" className="px-2 py-1 rounded bg-white/5 hover:bg-white/10" onClick={()=> setDraft(d=> ({...d, costs: []}))}>{t('filters.clear')||'Clear'}</button>
                )}
              </div>
              {/* Subtotals sticky below toolbar */}
              {draft.costs && draft.costs.length>0 && (()=> {
                const entries = Object.entries(costGroups).sort((a,b)=> a[0].localeCompare(b[0]));
                const total = entries.reduce((s,[,v])=> s+v.total,0);
                return (
                  <div className="sticky top-[46px] z-10 bg-ink-900/85 backdrop-blur -mx-1 px-2 py-2 border-b border-white/5 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                    <span className="uppercase tracking-wide opacity-60">{t('shows.editor.cost.subtotals')||'Subtotals'}:</span>
                    {entries.map(([k,v])=> <span key={k} className="whitespace-nowrap flex items-center gap-1">{k}: <strong className="tabular-nums">{fmtMoney(v.total)}</strong>{v.count>1 && <span className="px-1 rounded bg-white/5 text-[9px] border border-white/10" aria-label={t('shows.editor.cost.items')||'Items'} title={t('shows.editor.cost.items')||'Items'}>{v.count}</span>}</span>)}
                    <span className="ml-auto whitespace-nowrap">{t('shows.editor.summary.costs')||'Costs'}: <strong className="tabular-nums">{fmtMoney(total)}</strong></span>
                  </div>
                );
              })()}
              <div className="grid gap-2 mt-1">
                {(draft.costs||[]).map((c, idx, arr)=> {
                  const isFirst = idx===0;
                  const isLast = idx===arr.length-1;
                  return (
                  <fieldset key={c.id} className="flex flex-col gap-2 sm:flex-row sm:items-center rounded bg-white/2 p-2 border border-white/8 focus-within:border-accent-500/60 transition-colors group" aria-label={c.type||t('shows.costs.type')||'Cost'}>
                    <div className="flex flex-1 gap-2">
                      <input
                        list="cost-type-suggestions"
                        className="px-2 py-1 rounded bg-white/5 border border-white/12 flex-1 focus-ring"
                        placeholder={t('shows.costs.type')||'Type'}
                        value={c.type||''}
                        data-cost-id={c.id}
                        data-cost-field="type"
                        onKeyDown={e=> {
                          if (e.altKey && (e.key==='ArrowUp' || e.key==='ArrowDown')){ e.preventDefault(); moveCost(c.id, e.key==='ArrowUp'?'up':'down', 'type'); }
                        }}
                        onChange={e=> setDraft(d=> { track(TE.COST_UPDATE, { id: c.id, field: 'type' }); recordCostType(e.target.value); return ({...d, costs: (d.costs||[]).map(cc=> cc.id===c.id? {...cc, type:e.target.value}: cc)}); })}
                      />
                      <input
                        type="number"
                        className="px-2 py-1 rounded bg-white/5 border border-white/12 w-28 text-right focus-ring tabular-nums"
                        placeholder={t('shows.costs.amount')||'Amount'}
                        value={c.amount ?? 0}
                        data-cost-id={c.id}
                        data-cost-field="amount"
                        onKeyDown={e=> {
                          if (e.altKey && (e.key==='ArrowUp' || e.key==='ArrowDown')){ e.preventDefault(); moveCost(c.id, e.key==='ArrowUp'?'up':'down', 'amount'); }
                        }}
                        onChange={e=> setDraft(d=> { track(TE.COST_UPDATE, { id: c.id, field: 'amount' }); return ({...d, costs: (d.costs||[]).map(cc=> cc.id===c.id? {...cc, amount: e.target.value===''? 0 : Number(e.target.value)}: cc)}); })}
                      />
                    </div>
                    <input
                      className="px-2 py-1 rounded bg-white/5 border border-white/12 flex-1 focus-ring"
                      placeholder={t('shows.costs.desc')||'Description'}
                      value={c.desc||''}
                      data-cost-id={c.id}
                      data-cost-field="desc"
                      onKeyDown={e=> {
                        if (e.altKey && (e.key==='ArrowUp' || e.key==='ArrowDown')){ e.preventDefault(); moveCost(c.id, e.key==='ArrowUp'?'up':'down', 'desc'); }
                      }}
                      onChange={e=> setDraft(d=> { track(TE.COST_UPDATE, { id: c.id, field: 'desc' }); return ({...d, costs: (d.costs||[]).map(cc=> cc.id===c.id? {...cc, desc:e.target.value}: cc)}); })}
                    />
                    <div className="flex items-center gap-1 self-start sm:self-center">
                      <button
                        type="button"
                        aria-label={t('shows.editor.cost.duplicate')||'Duplicate'}
                        className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px]"
                        onClick={()=> duplicateCost(c.id)}
                      >{t('shows.editor.cost.duplicate')||'Duplicate'}</button>
                      <button
                        type="button"
                        aria-label={t('shows.editor.cost.moveUp')||'Move up'}
                        className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 disabled:opacity-40"
                        disabled={isFirst}
                        onClick={()=> moveCost(c.id, 'up')}
                      >↑</button>
                      <button
                        type="button"
                        aria-label={t('shows.editor.cost.moveDown')||'Move down'}
                        className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 disabled:opacity-40"
                        disabled={isLast}
                        onClick={()=> moveCost(c.id, 'down')}
                      >↓</button>
                      <button
                        type="button"
                        aria-label={t('shows.table.remove')||'Remove'}
                        className="px-2 py-1 rounded bg-red-600/30 hover:bg-red-600/50 text-red-100"
                        onClick={()=> setDraft(d=> { track(TE.COST_REMOVE, { id: c.id }); return ({...d, costs: (d.costs||[]).filter(cc=> cc.id!==c.id)}); })}
                      >&times;</button>
                    </div>
                  </fieldset>
                );})}
                <datalist id="cost-type-suggestions">
                  {recentCostTypes.map(ct=> <option key={'recent-'+ct} value={ct} />)}
                  {/* Static fallbacks */}
                  {['Travel','Production','Marketing','Hospitality','Promo','Logistics'].filter(x=> !recentCostTypes.includes(x)).map(x=> <option key={x} value={x} />)}
                </datalist>
                <button
                  type="button"
                  className="mt-2 px-3 py-1.5 rounded bg-white/10 hover:bg-white/15 text-xs w-fit"
                  onClick={()=> setDraft(d=> { const id = crypto.randomUUID(); track(TE.COST_ADD, { id }); manualCostAdds.current += 1; return ({...d, costs: [...(d.costs||[]), { id, type:'', amount: 0, desc:'' }]}); })}
                >+ {t('common.add')||'Add'} {t('shows.costs.type')||'Cost'}</button>
              </div>
              {(!draft.costs || draft.costs.length===0) && (
                <div className="text-[11px] opacity-60 border border-dashed border-white/15 rounded p-4 text-center">
                  <p>{t('shows.noCosts')||'No costs yet'}</p>
                  <p className="mt-1 opacity-70">{t('shows.editor.cost.empty.hint')||'Add individual lines or use templates / bulk import.'}</p>
                </div>
              )}
            </div>
          )}
          <button type="submit" className="hidden" aria-hidden="true" />
        </form>
         {showBulk && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-40" role="dialog" aria-modal="true" aria-labelledby="bulk-title" aria-describedby="bulk-help" onMouseDown={e=> { if(e.target===e.currentTarget) setShowBulk(false); }}>
             <div className="glass rounded-lg p-5 w-[680px] max-h-[80vh] overflow-y-auto animate-scale-in space-y-4 text-sm" onKeyDown={e=> { if(e.key==='Escape'){ e.preventDefault(); setShowBulk(false); } }}>
               <div className="flex items-start justify-between gap-4">
                 <div className="space-y-1">
                   <h2 id="bulk-title" tabIndex={-1} className="text-lg font-semibold">{t('shows.editor.bulk.title')||'Bulk add costs'}</h2>
                   <p id="bulk-help" className="text-[11px] opacity-70 max-w-prose">{t('shows.editor.bulk.help')||'Paste CSV or tab lines: Type, Amount, Description'}</p>
                 </div>
                <button type="button" aria-label={t('common.close')||'Close'} className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={()=> setShowBulk(false)}>×</button>
               </div>
               <textarea
                 ref={bulkTextAreaRef}
                 value={bulkRaw}
                 onChange={e=> setBulkRaw(e.target.value)}
                 placeholder={t('shows.editor.bulk.placeholder')||'Type, Amount, Desc'}
                 className="w-full h-40 px-3 py-2 rounded bg-white/5 border border-white/15 focus-ring font-mono text-[12px] resize-vertical"
               />
               <div className="space-y-2">
                 <div className="flex items-center justify-between text-[11px]">
                   <span>{bulkParsed.length? (t('shows.editor.bulk.parsed')||'{count} lines').replace('{count}', String(bulkParsed.length)) : (t('shows.editor.bulk.empty')||'No valid lines')}</span>
                   {bulkParsed.length>0 && <span className="opacity-60">{t('shows.editor.bulk.preview')||'Preview'}</span>}
                 </div>
                 {bulkParsed.length>0 && (
                   <div className="max-h-60 overflow-auto rounded border border-white/10">
                     <table className="w-full text-[11px]">
                       <thead className="bg-white/5 sticky top-0">
                         <tr>
                           <th className="text-left px-2 py-1 w-12 opacity-60">#</th>
                           <th className="text-left px-2 py-1 opacity-60">{t('shows.costs.type')||'Type'}</th>
                           <th className="text-left px-2 py-1 opacity-60">{t('shows.costs.amount')||'Amount'}</th>
                           <th className="text-left px-2 py-1 opacity-60">{t('shows.costs.desc')||'Description'}</th>
                         </tr>
                       </thead>
                       <tbody>
                         {bulkParsed.map(r=> (
                           <tr key={r.line} className={r.amount===0 && !r.desc? 'bg-red-600/20' : 'odd:bg-white/2'}>
                             <td className="px-2 py-1 tabular-nums opacity-60">{r.line}</td>
                             <td className="px-2 py-1">{r.type}</td>
                             <td className="px-2 py-1 tabular-nums">{r.amount||''}</td>
                             <td className="px-2 py-1">{r.desc}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 )}
               </div>
               <div className="flex justify-end gap-2">
                 <button type="button" className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/15" onClick={()=> setShowBulk(false)}>{t('shows.editor.bulk.cancel')||'Cancel'}</button>
                 <button
                   type="button"
                   disabled={bulkParsed.length===0}
                   onClick={()=> {
                     if(bulkParsed.length===0) return;
                     setDraft(d=> ({...d, costs: [...(d.costs||[]), ...bulkParsed.map(b=> ({ id: crypto.randomUUID(), type: b.type, amount: b.amount, desc: b.desc }))]}));
                     bulkParsed.forEach(b=> recordCostType(b.type));
                     track(TE.COST_BULK_ADD, { count: bulkParsed.length });
                     announce((t('shows.editor.bulk.add')||'Add costs')+': '+bulkParsed.length, 'polite');
                     setShowBulk(false);
                   }}
                   className={`px-3 py-1.5 rounded ${bulkParsed.length? 'bg-accent-500 text-black hover:brightness-110':'bg-white/5 opacity-40 cursor-not-allowed'}`}
                 >{t('shows.editor.bulk.add')||'Add costs'}</button>
               </div>
             </div>
           </div>
         )}
  {/* Sticky Footer */}
        <div className="border-t border-white/10 px-4 py-3 flex flex-wrap gap-3 items-center justify-between text-sm bg-ink-900/85 backdrop-blur sticky bottom-0 [@supports(padding:max(0px))]:pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          <div className="flex items-center gap-3 order-2 sm:order-1 w-full sm:w-auto justify-end sm:justify-start *:min-h-[44px]">
            <button
              type="button"
              className="px-4 py-2 rounded bg-white/10 hover:bg-white/15 min-w-[110px] text-sm"
              onClick={requestClose}
            >{t('shows.dialog.cancel')||'Cancel'}</button>
            {mode==='edit' && (
              <button
                type="button"
                className="px-4 py-2 rounded bg-red-600/80 hover:bg-red-600 min-w-[110px] text-sm"
                onClick={()=> { setShowDelete(true); deleteCount.current += 1; }}
              >{t('shows.dialog.delete')||'Delete'}</button>
            )}
          </div>
          <div className="flex items-center gap-2 ml-auto order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end *:min-h-[44px]">
            <div id="save-hint" className="text-[11px] opacity-60 hidden md:block">
              {!isValid && Object.keys(validation).length>0 ? (t('shows.editor.validation.hint')||'Fix highlighted fields') : saving==='saved' ? (t('shows.editor.saved')||'Saved ✓') : saving==='error' ? (t('shows.editor.save.error')||'Save failed') : ' '}
            </div>
            <button
              type="button"
              aria-describedby="save-hint"
              disabled={!isValid || saving==='saving'}
              aria-busy={saving==='saving'}
              className="px-6 py-2.5 rounded-full bg-accent-500 text-black shadow-glow hover:brightness-110 disabled:opacity-50 flex items-center gap-2 font-semibold min-w-[160px] justify-center text-sm"
              onClick={()=> attemptSave()}
            >
              {saving==='saving' && <span className="inline-block h-3 w-3 rounded-full border-2 border-black/40 border-t-black animate-spin" aria-hidden="true" />}
              {saving==='saving' ? (t('shows.editor.saving')||'Saving…')
                : saving==='saved' ? (t('shows.editor.saved')||'Saved ✓')
                : saving==='error' ? (t('shows.editor.save.retry')||'Retry')
                : (mode==='add' ? (t('shows.editor.save.create')||'Save') : (t('shows.editor.save.edit')||'Save changes'))}
            </button>
          </div>
        </div>
        {/* Discard dialog */}
        {/* Focus trap end sentinel */}
        <div tabIndex={0} aria-hidden="true" onFocus={()=> {
          const focusables = drawerRef.current?.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
          if(focusables && focusables.length>0){
            focusables[0].focus();
          }
        }} />
        {showDiscard && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="discard-title" aria-describedby="discard-desc">
            <div className="glass rounded-lg p-5 w-[360px] text-sm space-y-4 animate-scale-in" ref={el=> {
              if (el) {
                const first = el.querySelector<HTMLElement>('button');
                first?.focus();
              }
            }}>
              <h4 id="discard-title" className="font-semibold text-base">{t('shows.editor.discard.title')||'Discard changes?'}</h4>
              <p id="discard-desc" className="opacity-80">{t('shows.editor.discard.body')||'You have unsaved changes. They will be lost.'}</p>
              <div className="flex justify-end gap-2">
                <button className="px-3 py-2 rounded bg-white/10 hover:bg-white/15" onClick={()=> { setShowDiscard(false); track(TE.DISCARD_CANCEL); }}>{t('shows.editor.discard.cancel')||'Keep editing'}</button>
                <button className="px-3 py-2 rounded bg-red-600/80 hover:bg-red-600" onClick={()=> { setShowDiscard(false); track(TE.DISCARD_CONFIRM); discardSavedDraft(); onRequestClose(); const msg = t('shows.editor.toast.discarded')||'Changes discarded'; announce(msg, 'polite'); toast.info(msg); }}>{t('shows.editor.discard.confirm')||'Discard'}</button>
              </div>
            </div>
          </div>
        )}
        {showDelete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 animate-fade-in" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-desc">
            <div className="glass rounded-lg p-5 w-[380px] text-sm space-y-4 animate-scale-in" ref={el=> { if(el){ el.querySelector<HTMLElement>('button')?.focus(); } }}>
              <h4 id="delete-title" className="font-semibold text-base">{t('shows.editor.delete.confirmTitle')||'Delete show?'}</h4>
              <p id="delete-desc" className="opacity-80">{t('shows.editor.delete.confirmBody')||'This action cannot be undone.'}</p>
              <div className="flex justify-end gap-2">
                <button className="px-3 py-2 rounded bg-white/10 hover:bg-white/15" onClick={()=> { setShowDelete(false); track(TE.DELETE_CANCEL); }}>{t('shows.editor.delete.cancel')||'Cancel'}</button>
                <button className="px-3 py-2 rounded bg-red-600/80 hover:bg-red-600" onClick={()=> {
                  track(TE.DELETE_CONFIRM);
                  setShowDelete(false);
                  const deletedMsg = t('shows.editor.toast.deleted') || 'Deleted';
                  const ttl = 6000;
                  const deadline = Date.now() + ttl;
                  const finalize = () => {
                    onDelete?.();
                    track(TE.DELETE_FINAL, { id: initial.id });
                    setPendingDelete(null);
                  };
                  const timer = window.setTimeout(finalize, ttl);
                  setPendingDelete({ timer, deadline, remaining: ttl, paused: false });
                  announce(deletedMsg, 'assertive');
                }}>{t('shows.editor.delete.confirm')||'Delete'}</button>
              </div>
            </div>
          </div>
        )}
  {/* aria-live region now driven by explicit severity state */}
  <div className="sr-only" aria-live={announceSeverity}>{announceMsg}</div>
        {/* Inline undo delete banner */}
        {pendingDelete && (
          <div
            role="alert"
            aria-label={t('shows.editor.toast.deleted')||'Deleted'}
            className="absolute bottom-[72px] right-4 z-[11005] bg-slate-800/95 border border-slate-400/30 rounded-md px-4 py-2 flex items-center gap-4 text-xs shadow-glow animate-fade-in"
            onMouseEnter={()=> {
              setPendingDelete(p=> {
                if(!p || p.paused) return p;
                if(p.timer) clearTimeout(p.timer);
                const remaining = Math.max(0, p.deadline - Date.now());
                return { ...p, timer: null, remaining, paused: true };
              });
            }}
            onMouseLeave={()=> {
              setPendingDelete(p=> {
                if(!p || !p.paused) return p;
                const finalize = () => {
                  onDelete?.();
                  track(TE.DELETE_FINAL, { id: initial.id });
                  setPendingDelete(null);
                };
                const timer = window.setTimeout(finalize, p.remaining);
                return { ...p, timer, deadline: Date.now() + p.remaining, paused: false };
              });
            }}
          >
            <span className="leading-tight">{t('shows.editor.toast.deleted')||'Deleted'}</span>
            <button
              type="button"
              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 font-medium tracking-wide"
              onClick={()=> {
                setPendingDelete(p=> {
                  if(p?.timer) clearTimeout(p.timer);
                  return null;
                });
                onRestore?.();
                undoDeletesRef.current += 1;
                // Telemetry: explicit undo click event (aliased for legacy dashboard)
                track(TE.DELETE_UNDO);
                track(TE.UNDO_CLICK, { id: initial.id });
                toast.success(t('shows.editor.toast.restored')||'Restored');
                announce(t('shows.editor.toast.restored')||'Restored', 'polite');
              }}
            >{t('shows.editor.toast.undo')||'Undo'}</button>
            <button
              aria-label={t('common.close')||'Close'}
              className="opacity-70 hover:opacity-100"
              onClick={()=> {
                setPendingDelete(p=> {
                  if(p?.timer) clearTimeout(p.timer);
                  return null;
                });
                // User dismissed; do not delete yet (explicit choice). Keep item.
              }}
            >×</button>
          </div>
        )}
        {/* Local toast stack removed; using global ToastProvider */}
      </div>
    </>
  );

  return createPortal(portal, document.body);
};

export default ShowEditorDrawer;
