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
import { agenciesForShow, computeCommission } from '../../../lib/agencies';
import type { Show } from '../../../lib/shows';
import { sanitizeName } from '../../../lib/sanitize';
import { PromoterAutocomplete } from '../../../components/shows/PromoterAutocomplete';
import { VenueAutocomplete } from '../../../components/shows/VenueAutocomplete';
import ContractsList from '../../../components/contracts/ContractsList';

const ArrowUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);
import { TE } from '../../../lib/telemetryEvents';
import { useToast } from '../../../ui/Toast';
import StatusBadge from '../../../ui/StatusBadge';
import CountrySelect from '../../../ui/CountrySelect';
import { useFieldOrder, sortByFieldOrder } from './fieldOrderConfig';
import DatePickerAdvanced from './DatePickerAdvanced';
import StatusSelector from './StatusSelector';
import FeeFieldAdvanced from './FeeFieldAdvanced';
import NotesEditor from './NotesEditor';
import { useAuth } from '../../../context/AuthContext';
import FirestoreUserPreferencesService from '../../../services/firestoreUserPreferencesService';

export type ShowEditorMode = 'add' | 'edit';

// Utility: Detect date conflicts with other shows
interface DateConflict {
  showId: string;
  showName: string;
  city: string;
  date: string;
  endDate?: string;
}

const detectDateConflict = (date: string, endDate: string | undefined, allShows: Show[], currentId?: string): DateConflict | null => {
  if (!date) return null;

  const curStart = new Date(date);
  const curEnd = endDate ? new Date(endDate) : curStart;

  for (const show of allShows) {
    // Skip self
    if (currentId && show.id === currentId) continue;
    // Skip canceled/archived shows
    if (show.status === 'canceled' || show.status === 'archived') continue;

    const otherStart = new Date(show.date);
    const otherEnd = show.endDate ? new Date(show.endDate) : otherStart;

    // Check for overlap: two date ranges overlap if one starts before the other ends
    if (curStart <= otherEnd && curEnd >= otherStart) {
      return {
        showId: show.id,
        showName: show.name || 'Unnamed',
        city: show.city,
        date: show.date,
        endDate: show.endDate,
      };
    }
  }

  return null;
};

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
  allShows?: Show[]; // all shows for conflict detection
}

// Minimal initial extraction. Features to be layered incrementally.
export const ShowEditorDrawer: React.FC<ShowEditorDrawerProps> = ({ open, mode, initial, onSave, onDelete, onRestore, hasTripAroundDate, onPlanTravel, onOpenTrip, onRequestClose, allShows = [] }) => {
  const { draft, setDraft, validation, isValid, dirty, reset, restored, discardSavedDraft } = useShowDraft(initial);
  const { lang, fmtMoney, managementAgencies, bookingAgencies } = useSettings();
  const { userId } = useAuth();
  // Persist + restore last active tab
  const initialTab = (() => {
    try { const v = localStorage.getItem('showEditor.lastTab'); if (v === 'details' || v === 'finance' || v === 'costs') return v as 'details' | 'finance' | 'costs'; } catch { /* ignore */ }
    return 'details';
  })();
  const [tab, setTab] = useState<'overview' | 'finance' | 'costs'>(initialTab === 'details' ? 'overview' : initialTab);
  const restoredTabRef = useRef(false);
  const [ready, setReady] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const [showDiscard, setShowDiscard] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuBtnRef = useRef<HTMLButtonElement>(null);
  const [dateConflict, setDateConflict] = useState<DateConflict | null>(null);
  // Accessibility announcements (refactored with explicit severity)
  const [announceMsg, setAnnounceMsg] = useState('');
  const [announceSeverity, setAnnounceSeverity] = useState<'polite' | 'assertive'>('polite');
  const lastAnnounceRef = useRef<{ msg: string; ts: number } | null>(null);
  const announce = useCallback((msg: string, severity: 'polite' | 'assertive' = 'polite') => {
    const now = performance.now();
    if (lastAnnounceRef.current && lastAnnounceRef.current.msg === msg && (now - lastAnnounceRef.current.ts) < 1200) {
      return; // suppress duplicate within window
    }
    lastAnnounceRef.current = { msg, ts: now };
    setAnnounceSeverity(severity);
    setAnnounceMsg('');
    requestAnimationFrame(() => setAnnounceMsg(msg));
  }, []);
  interface PendingDelete { timer: number | null; deadline: number; remaining: number; paused: boolean; }
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const firstSaveTracked = useRef(false); // guard first save metric
  // Cost templates menu state
  const [openTemplateMenu, setOpenTemplateMenu] = useState(false);
  // Bulk cost modal state
  const [showBulk, setShowBulk] = useState(false);
  const [bulkRaw, setBulkRaw] = useState('');
  const [bulkParsed, setBulkParsed] = useState<Array<{ type: string; amount: number; desc: string; line: number }>>([]);
  const bulkTextAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const parseBulk = useCallback((text: string) => {
    const lines = text.split(/\r?\n/);
    const out: Array<{ type: string; amount: number; desc: string; line: number }> = [];
    lines.forEach((ln, idx) => {
      if (!ln.trim()) return;
      const parts = ln.split(/\t|,/).map(p => p.trim());
      if (parts.length === 1) { const type = parts[0]; if (type) out.push({ type, amount: 0, desc: '', line: idx + 1 }); return; }
      const [pType, pAmountRaw, ...rest] = parts;
      if (!pType) return;
      let amount = 0; let desc = '';
      if (pAmountRaw && /\d/.test(pAmountRaw)) {
        const norm = pAmountRaw.replace(/[^0-9.,-]/g, '').replace(/,/g, '.');
        const num = parseFloat(norm); if (!isNaN(num)) amount = num; else desc = [pAmountRaw, ...rest].join(' ');
      } else { desc = [pAmountRaw, ...rest].filter(Boolean).join(' '); }
      if (!desc) desc = rest.join(' ');
      out.push({ type: pType, amount: Math.round(amount), desc: desc.trim(), line: idx + 1 });
    });
    return out;
  }, []);
  useEffect(() => { if (showBulk) { setTimeout(() => { const title = document.getElementById('bulk-title'); (title as HTMLElement | undefined)?.focus?.(); if (!title) bulkTextAreaRef.current?.focus(); }, 50); } }, [showBulk]);
  useEffect(() => { if (!showBulk) { setBulkRaw(''); setBulkParsed([]); } }, [showBulk]);
  useEffect(() => { if (bulkRaw) { setBulkParsed(parseBulk(bulkRaw)); } else { setBulkParsed([]); } }, [bulkRaw, parseBulk]);
  interface CostTemplate { id: string; label: string; items: Array<{ type: string; amount: number; desc?: string }>; }
  const COST_TEMPLATES: CostTemplate[] = [
    {
      id: 'travel-basic', label: t('shows.editor.cost.template.travel') || 'Travel basics', items: [
        { type: 'Travel', amount: 0, desc: 'Flights' },
        { type: 'Travel', amount: 0, desc: 'Hotel' },
        { type: 'Travel', amount: 0, desc: 'Ground' }
      ]
    },
    {
      id: 'production-basic', label: t('shows.editor.cost.template.production') || 'Production basics', items: [
        { type: 'Production', amount: 0, desc: 'Crew' },
        { type: 'Production', amount: 0, desc: 'Backline' }
      ]
    },
    {
      id: 'marketing-basic', label: t('shows.editor.cost.template.marketing') || 'Marketing basics', items: [
        { type: 'Marketing', amount: 0, desc: 'Ads' },
        { type: 'Marketing', amount: 0, desc: 'Design' }
      ]
    }
  ];
  const applyCostTemplate = useCallback((tpl: CostTemplate) => {
    setDraft((d: ShowDraft) => ({ ...d, costs: [...(d.costs || []), ...tpl.items.map(i => ({ id: crypto.randomUUID(), ...i }))] }));
    announce(t('shows.editor.cost.template.applied') || 'Template applied', 'polite');
    track('shows.editor.cost.template.apply', { template: tpl.id, items: tpl.items.length });
    setOpenTemplateMenu(false);
  }, [setDraft, t]);
  // Close template menu on outside click
  useEffect(() => {
    if (!openTemplateMenu) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target instanceof Node)) return;
      const root = document.querySelector('[data-cost-template-menu]');
      if (root && !root.contains(e.target)) setOpenTemplateMenu(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [openTemplateMenu]);
  const toast = useToast();
  // Telemetry session metrics
  const openedAt = useRef<number | null>(null);
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
  
  // Load from Firebase on mount
  useEffect(() => {
    if (userId) {
      FirestoreUserPreferencesService.getUserPreferences(userId)
        .then(prefs => {
          if (prefs?.shows) {
            if (prefs.shows.recentCities) {
              setRecentCities(prefs.shows.recentCities);
              localStorage.setItem('shows.recentCities.v1', JSON.stringify(prefs.shows.recentCities));
            }
            if (prefs.shows.recentVenues) {
              setRecentVenues(prefs.shows.recentVenues);
              localStorage.setItem('shows.recentVenues.v1', JSON.stringify(prefs.shows.recentVenues));
            }
          }
        })
        .catch(err => console.error('Failed to load shows preferences:', err));
    }
  }, [userId]);
  
  // Fallback to localStorage if not logged in
  useEffect(() => {
    if (!userId) {
      try {
        const c = JSON.parse(localStorage.getItem('shows.recentCities.v1') || '[]');
        const v = JSON.parse(localStorage.getItem('shows.recentVenues.v1') || '[]');
        if (Array.isArray(c)) setRecentCities(c.filter(x => typeof x === 'string'));
        if (Array.isArray(v)) setRecentVenues(v.filter(x => typeof x === 'string'));
      } catch { /* ignore */ }
    }
  }, [userId]);
  
  const recordCity = useCallback((city: string) => {
    setRecentCities(prev => {
      const next = [city, ...prev.filter(x => x.toLowerCase() !== city.toLowerCase())].slice(0, 8);
      try { localStorage.setItem('shows.recentCities.v1', JSON.stringify(next)); } catch { /* ignore */ }
      // Sync to Firebase
      if (userId) {
        FirestoreUserPreferencesService.saveShowsPreferences(userId, { recentCities: next })
          .catch(err => console.error('Failed to sync recent cities:', err));
      }
      return next;
    });
  }, [userId]);
  
  const recordVenue = useCallback((venue: string) => {
    setRecentVenues(prev => {
      const next = [venue, ...prev.filter(x => x.toLowerCase() !== venue.toLowerCase())].slice(0, 8);
      try { localStorage.setItem('shows.recentVenues.v1', JSON.stringify(next)); } catch { /* ignore */ }
      // Sync to Firebase
      if (userId) {
        FirestoreUserPreferencesService.saveShowsPreferences(userId, { recentVenues: next })
          .catch(err => console.error('Failed to sync recent venues:', err));
      }
      return next;
    });
  }, [userId]);
  // Tab refs for roving tabindex keyboard navigation
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Reset only when switching to a different show id (avoid wiping user typing on parent re-renders)
  const prevInitialIdRef = useRef(initial.id);
  useEffect(() => {
    if (!open) return;
    if (prevInitialIdRef.current !== initial.id) {
      reset(initial);
      setTab('overview');
      prevInitialIdRef.current = initial.id;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial.id]);

  useEffect(() => { if (open) { requestAnimationFrame(() => setReady(true)); } else { setReady(false); } }, [open]);

  useLayoutEffect(() => { if (open && ready) { firstFieldRef.current?.focus(); } }, [open, ready]);

  // Venue telemetry tracking (set/changed/cleared)
  const prevVenueRef = useRef<string | undefined>(draft.venue);
  useEffect(() => {
    if (!open) return;
    const current = draft.venue || '';
    const prev = prevVenueRef.current || '';
    if (current === prev) return;
    if (!prev && current) { track(TE.SHOW_VENUE_SET); }
    else if (prev && current) { track(TE.SHOW_VENUE_CHANGED); }
    else if (prev && !current) { track(TE.SHOW_VENUE_CLEARED); }
    prevVenueRef.current = current;
  }, [draft.venue, open]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'Enter')) { e.preventDefault(); attemptSave(); }
      if (e.key === 'Enter' && e.shiftKey) {
        const active = document.activeElement as HTMLElement | null;
        if (active && (active.getAttribute('aria-describedby')?.includes('quick') || active.getAttribute('placeholder')?.toLowerCase().includes('quick'))) {
          e.preventDefault();
          applyQuickPreview();
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault(); requestClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, dirty, isValid, draft]);

  // Focus trap for keyboard navigation
  useEffect(() => {
    if (!open) return;
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusables = drawerRef.current?.querySelectorAll<HTMLElement>("a,button,input,textarea,select,[tabindex]:not([tabindex='-1'])");
        if (!focusables || focusables.length === 0) return;
        const list = Array.from(focusables).filter(el => !el.hasAttribute('disabled'));
        const first = list[0];
        const last = list[list.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    drawerRef.current?.addEventListener('keydown', keyHandler);
    return () => drawerRef.current?.removeEventListener('keydown', keyHandler);
  }, [open]);

  // Telemetry now uses shared trackEvent util (aliased as track)

  // Fire open/close events
  useEffect(() => {
    if (open) {
      openedAt.current = performance.now();
      validationFails.current = 0;
      track(TE.SHOW_OPEN, { mode, draftId: initial.id, dirty });
    }
    return () => {
      if (open && openedAt.current != null) {
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

  // Detect date conflicts with other shows
  useEffect(() => {
    if (!draft.date) return; // Guard against undefined date
    const endDateStr: string | undefined = draft.endDate ? String(draft.endDate) : undefined;
    const conflict = detectDateConflict(String(draft.date), endDateStr, allShows, initial.id || '');
    setDateConflict(conflict);
  }, [draft.date, draft.endDate, allShows, initial.id]);

  const attemptSave = useCallback(async () => {
    if (!isValid) {
      const firstKey = Object.keys(validation)[0];
      if (firstKey) {
        const el = drawerRef.current?.querySelector(`[data-field="${firstKey}"]`) as HTMLElement | null;
        el?.focus();
      }
      track(TE.VALIDATION_FAIL, { fields: Object.keys(validation) });
      announce(t('shows.editor.validation.fail') || 'Fix errors to continue', 'assertive');
      const errCount = Object.keys(validation).length;
      announce((t('shows.editor.errors.count') || 'There are {n} errors').replace('{n}', String(errCount)), 'assertive');
      toast.error(t('shows.editor.toast.validation') || 'Validation errors');
      validationFails.current += 1;
      return;
    }
    if (saving === 'saving') return; // prevent double submit
    try {
      setSaving('saving');
      const ret: any = onSave(draft);
      if (ret && typeof ret.then === 'function') {
        await ret;
      }
      if (openedAt.current != null && !firstSaveTracked.current) {
        track(TE.SHOW_SAVE_TTFS, { ms: Math.round(performance.now() - openedAt.current), costCount: draft.costs?.length || 0 });
        firstSaveTracked.current = true;
      }
      track(TE.SHOW_SAVE, {
        id: initial.id,
        mode,
        fee: draft.fee,
        wht: draft.whtPct,
        mgmtPct: draft.mgmtPct,
        bookingPct: draft.bookingPct,
        costCount: draft.costs?.length || 0,
        durationMs: openedAt.current != null ? Math.round(performance.now() - openedAt.current) : undefined,
        validationFails: validationFails.current
      });
      setSaving('saved');
      // Clear autosaved draft after a successful save since baseline has moved
      discardSavedDraft();
      // Reset draft baseline so dirty flag returns to false
      reset(draft);
      announce(t('shows.editor.toast.saved') || 'Saved', 'polite');
      toast.success(t('shows.editor.toast.saved') || 'Saved');
      setTimeout(() => setSaving('idle'), 1500);
    } catch (err) {
      if (dirty) { track(TE.SHOW_ABANDON, { unsaved: true }); }
      console.error(err);
      setSaving('error');
      track(TE.SHOW_SAVE_FAIL, { id: initial.id, mode });
      announce(t('shows.editor.save.error') || 'Save failed', 'assertive');
      toast.error(t('shows.editor.save.error') || 'Save failed');
      setTimeout(() => setSaving('idle'), 2000);
    }
  }, [isValid, validation, draft, onSave, reset, toast]);

  function requestClose() {
    if (dirty) { setShowDiscard(true); } else { onRequestClose(); }
  }

  useEffect(() => { if (open) { document.body.style.overflow = 'hidden'; } return () => { document.body.style.overflow = ''; }; }, [open]);

  if (!open) return null;

  // Localized header meta (city · country · date) with safe date construction (avoid TZ shift)
  const metaCity = (draft.city || '').trim() || '—';
  const metaCountry = draft.country ? countryLabel(draft.country, lang) : '';
  let metaDate = '';
  if (draft.date) {
    const iso = String(draft.date).slice(0, 10);
    const parts = iso.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts.map(p => Number(p));
      if (y !== undefined && m !== undefined && d !== undefined && !isNaN(y) && !isNaN(m) && !isNaN(d)) {
        const dateObj = new Date(y, m - 1, d); // Local midnight
        try {
          metaDate = new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(dateObj);
        } catch { metaDate = iso; }
      }
    }
  }

  // Simple cost aggregation for summary
  const totalCosts = (draft.costs || []).reduce((s: number, c: Cost) => s + (c.amount || 0), 0);
  const { currency: baseCurrency } = useSettings();
  const feeCurrency = (draft.feeCurrency as SupportedCurrency) || (baseCurrency as SupportedCurrency);
  const fee = Number(draft.fee) || 0;
  const fx = convertToBase(fee, draft.date || '', feeCurrency, baseCurrency as SupportedCurrency);
  const convertedFee = fx?.value;
  const effectiveRate = fx?.rate; // multiplier from original -> base
  const fxUnavailableTracked = useRef(false);
  useEffect(() => {
    if (!fxUnavailableTracked.current && fee > 0 && feeCurrency !== baseCurrency && convertedFee == null) {
      track(TE.FX_UNAVAILABLE, { from: feeCurrency, to: baseCurrency, date: draft.date });
      fxUnavailableTracked.current = true;
    }
  }, [convertedFee, feeCurrency, baseCurrency, fee, draft.date]);
  const wht = fee * ((draft.whtPct || 0) / 100);
  const vat = fee * ((draft.vatPct || 0) / 100);

  // Calculate agency commissions dynamically
  const commissions = useMemo(() => {
    console.log('[ShowEditor] Recalculating commissions with:', {
      mgmtAgency: draft.mgmtAgency,
      bookingAgency: draft.bookingAgency,
      fee: draft.fee
    });
    const demoShow: Show = {
      id: draft.id || '',
      date: draft.date || '',
      city: draft.city || '',
      country: draft.country || '',
      lat: 0,
      lng: 0,
      fee: draft.fee || 0,
      feeCurrency: draft.feeCurrency || 'EUR',
      status: draft.status || 'confirmed',
      mgmtAgency: draft.mgmtAgency,       // Include selected agencies
      bookingAgency: draft.bookingAgency, // for commission calculation
      __version: 1,
      __modifiedAt: Date.now(),
      __modifiedBy: ''
    };
    const applicable = agenciesForShow(demoShow, bookingAgencies, managementAgencies);
    const allAgencies = [...applicable.booking, ...applicable.management];
    const result = allAgencies.length > 0 ? computeCommission(demoShow, allAgencies) : 0;
    console.log('[ShowEditor] Commission result:', result, 'agencies:', allAgencies.length);
    return result;
  }, [draft.date, draft.country, draft.fee, draft.feeCurrency, draft.id, draft.city, draft.status, draft.mgmtAgency, draft.bookingAgency, bookingAgencies, managementAgencies]);

  const net = computeNet({ fee, whtPct: draft.whtPct, vatPct: draft.vatPct, costs: draft.costs });
  const marginPct = fee > 0 ? (net / fee) * 100 : 0;
  
  // Calculate Finance tab card values with selected agencies
  const financeCards = useMemo(() => {
    const feeVal = Number(draft.fee) || 0;
    
    // Get only the agencies that are actually selected in the dropdowns
    const selectedAgencies = [];
    if (draft.mgmtAgency) {
      const mgmt = managementAgencies.find(a => a.name === draft.mgmtAgency);
      if (mgmt) selectedAgencies.push(mgmt);
    }
    if (draft.bookingAgency) {
      const booking = bookingAgencies.find(a => a.name === draft.bookingAgency);
      if (booking) selectedAgencies.push(booking);
    }
    
    const demoShow: Show = {
      id: draft.id || '',
      date: draft.date || '',
      city: draft.city || '',
      country: draft.country || '',
      lat: 0,
      lng: 0,
      fee: feeVal,
      feeCurrency: draft.feeCurrency || 'EUR',
      status: draft.status || 'confirmed',
      mgmtAgency: draft.mgmtAgency,
      bookingAgency: draft.bookingAgency,
      __version: 1,
      __modifiedAt: Date.now(),
      __modifiedBy: ''
    };
    
    const commVal = selectedAgencies.length > 0
      ? computeCommission(demoShow, selectedAgencies)
      : 0;
    const totalCommPct = feeVal > 0 ? (commVal / feeVal) * 100 : 0;
    
    const whtPctEff = draft.whtPct || 0;
    const whtVal = feeVal * (whtPctEff / 100);
    const vatPctEff = draft.vatPct || 0;
    const vatVal = feeVal * (vatPctEff / 100);
    const invoiceTotal = feeVal + vatVal; // Total client pays (Fee + VAT)
    const costsVal = (draft.costs || []).reduce((s: number, c: any) => s + (c.amount || 0), 0);
    const netVal = feeVal - whtVal - commVal - costsVal; // VAT doesn't reduce net
    
    const agencyNames = selectedAgencies
      .map(a => {
        const isBooking = bookingAgencies.some(ba => ba.name === a.name);
        return `${a.name} (${isBooking ? 'B' : 'M'})`;
      })
      .join(', ');
    
    return { feeVal, commVal, totalCommPct, whtPctEff, whtVal, vatPctEff, vatVal, invoiceTotal, costsVal, netVal, agencyNames };
  }, [draft.fee, draft.mgmtAgency, draft.bookingAgency, draft.whtPct, draft.vatPct, draft.costs, draft.id, draft.date, draft.city, draft.country, draft.feeCurrency, draft.status, managementAgencies, bookingAgencies]);
  
  // Financial breakdown with dynamic agency commissions
  const financialBreakdown = useMemo(() => {
    const feeVal = Number(draft.fee) || 0;
    
    // Get selected agencies and calculate commissions individually
    let mgmtCommission = 0;
    let bookingCommission = 0;
    
    const demoShow: Show = {
      id: draft.id || '',
      date: draft.date || '',
      city: draft.city || '',
      country: draft.country || '',
      lat: 0,
      lng: 0,
      fee: feeVal,
      feeCurrency: draft.feeCurrency || 'EUR',
      status: draft.status || 'confirmed',
      mgmtAgency: draft.mgmtAgency,
      bookingAgency: draft.bookingAgency,
      __version: 1,
      __modifiedAt: Date.now(),
      __modifiedBy: ''
    };
    
    if (draft.mgmtAgency) {
      const mgmt = managementAgencies.find(a => a.name === draft.mgmtAgency);
      if (mgmt) {
        mgmtCommission = computeCommission(demoShow, [mgmt]);
      }
    }
    
    if (draft.bookingAgency) {
      const booking = bookingAgencies.find(a => a.name === draft.bookingAgency);
      if (booking) {
        bookingCommission = computeCommission(demoShow, [booking]);
      }
    }
    
    const whtPctEff = draft.whtPct || 0;
    const wht = feeVal * (whtPctEff / 100);
    const totalCosts = (draft.costs || []).reduce((s: number, c: any) => s + (c.amount || 0), 0);
    const net = feeVal - wht - mgmtCommission - bookingCommission - totalCosts;
    
    return {
      fee: feeVal,
      wht,
      mgmt: mgmtCommission,
      booking: bookingCommission,
      commissions: mgmtCommission + bookingCommission,
      totalCosts,
      net
    };
  }, [draft.fee, draft.whtPct, draft.mgmtAgency, draft.bookingAgency, draft.costs, draft.id, draft.date, draft.city, draft.country, draft.feeCurrency, draft.status, managementAgencies, bookingAgencies]);
  
  // Memoized cost grouping (subtotals) reused in Costs tab summary
  const costGroups = useMemo(() => {
    const arr = (draft.costs || []);
    const groups = arr.reduce<Record<string, { total: number; count: number }>>((acc: Record<string, { total: number; count: number }>, c: any) => { const key = c.type || t('shows.costs.type') || 'Type'; const amt = c.amount || 0; if (!acc[key]) acc[key] = { total: 0, count: 0 }; acc[key].total += amt; acc[key].count += 1; return acc; }, {});
    return groups;
  }, [draft.costs, lang]);
  // Focus helper for cost fields
  const focusCostField = useCallback((id: string, field: 'type' | 'amount' | 'desc' = 'type') => {
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLInputElement>(`[data-cost-id="${id}"][data-cost-field="${field}"]`);
      el?.focus();
    });
  }, []);
  // Reorder costs up/down by id
  const moveCost = useCallback((id: string, direction: 'up' | 'down', focusField: 'type' | 'amount' | 'desc' = 'type') => {
    setDraft((d: ShowDraft) => {
      const arr = [...(d.costs || [])];
      const idx = arr.findIndex(c => c.id === id);
      if (idx < 0) return d;
      const newIdx = direction === 'up' ? Math.max(0, idx - 1) : Math.min(arr.length - 1, idx + 1);
      if (newIdx === idx) return d;
      const [item] = arr.splice(idx, 1);
      if (item) arr.splice(newIdx, 0, item);
      track(TE.COST_SORT, { by: 'position', direction });
      return { ...d, costs: arr };
    });
    focusCostField(id, focusField);
  }, [setDraft, focusCostField]);
  // Duplicate a cost line (insert after current)
  const duplicateCost = useCallback((id: string) => {
    setDraft((d: ShowDraft) => {
      const arr = [...(d.costs || [])];
      const idx = arr.findIndex(c => c.id === id);
      if (idx < 0) return d;
      const cur = arr[idx];
      if (!cur) return d;
      const newId = crypto.randomUUID();
      const dup: Cost = { id: newId, type: cur.type, amount: cur.amount, desc: cur.desc };
      arr.splice(idx + 1, 0, dup);
      manualCostAdds.current += 1;
      track(TE.COST_ADD, { id: newId, duplicate: true });
      // Focus duplicated row after render
      focusCostField(newId, 'type');
      return { ...d, costs: arr };
    });
  }, [setDraft, focusCostField]);
  // Quick Entry parsing state
  const [quickEntry, setQuickEntry] = useState('');
  const [quickPreview, setQuickPreview] = useState<any | null>(null);
  const [quickError, setQuickError] = useState<string | null>(null);
  const quickIcons: Record<string, string> = {
    date: '📅', city: '🏙️', country: '🌍', fee: '💰', whtPct: '🏦', name: '🎤'
  };
  // Track last quick parse event to avoid spamming telemetry
  const lastQuickTrackRef = useRef<{ text: string; status: 'success' | 'fail' } | null>(null);

  // Recent cost types memory (localStorage) — most recently used first
  const [recentCostTypes, setRecentCostTypes] = useState<string[]>([]);
  const [justAddedCostId, setJustAddedCostId] = useState<string | null>(null);
  const [justAppliedQuick, setJustAppliedQuick] = useState(false);
  
  // Load from Firebase on mount (only cost types, cities/venues loaded above)
  useEffect(() => {
    if (userId) {
      FirestoreUserPreferencesService.getUserPreferences(userId)
        .then(prefs => {
          if (prefs?.shows?.recentCostTypes) {
            setRecentCostTypes(prefs.shows.recentCostTypes);
            localStorage.setItem('shows.recentCostTypes.v1', JSON.stringify(prefs.shows.recentCostTypes));
          }
        })
        .catch(err => console.error('Failed to load cost types preferences:', err));
    }
  }, [userId]);
  
  // Fallback to localStorage if not logged in
  useEffect(() => {
    if (!userId) {
      try {
        const raw = localStorage.getItem('shows.recentCostTypes.v1');
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) setRecentCostTypes(arr.filter(x => typeof x === 'string'));
        }
      } catch { /* ignore */ }
    }
  }, [userId]);
  
  const recordCostType = useCallback((type: string) => {
    const val = (type || '').trim();
    if (!val) return;
    setRecentCostTypes(prev => {
      if (prev[0] === val) return prev; // already most recent
      const updated = [val, ...prev.filter(p => p !== val)].slice(0, 8);
      try { localStorage.setItem('shows.recentCostTypes.v1', JSON.stringify(updated)); } catch { /* ignore */ }
      // Sync to Firebase
      if (userId) {
        FirestoreUserPreferencesService.saveShowsPreferences(userId, { recentCostTypes: updated })
          .catch(err => console.error('Failed to sync cost types:', err));
      }
      return updated;
    });
  }, [userId]);

  // Enhanced parser: date, city, country, fee (k/m + currency symbols + spaced), wht %, name in quotes, spaced multipliers ("12 k"), IRPF alias
  const parseQuickEntry = useCallback((text: string) => {
    const result: any = {};
    const rawInput = text.trim();
    if (!rawInput) { return { empty: true }; }
    const lower = rawInput; // keep original case for city heuristics later
    // Date dd/mm/yyyy or dd-mm-yyyy or dd/mm/yy
    const dateMatch = lower.match(/(\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b)/);
    if (dateMatch && dateMatch[1]) {
      const raw = dateMatch[1].replace(/-/g, '/');
      const [d, m, yRaw] = raw.split('/');
      let y = yRaw;
      if (yRaw && yRaw.length === 2) { y = '20' + yRaw; }
      if (y && m && d) {
        const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        if (!isNaN(Date.parse(iso))) result.date = iso;
      }
    }
    // Country code (two uppercase letters)
    const countryMatch = lower.match(/[\s,]([A-Z]{2})(?=\b)/);
    if (countryMatch && countryMatch[1]) { result.country = countryMatch[1].toUpperCase(); }
    // Fee patterns: optional 'fee' keyword OR trailing 'fee', currency symbols, k/m multipliers, allow space before multiplier
    let feeNum: number | undefined;
    const feePatterns = [
      /fee\s+([$€£])?\s*([0-9]+(?:[.,][0-9]{1,3})?)\s*([kKmM])?/i,
      /([$€£])?\s*([0-9]+(?:[.,][0-9]{1,3})?)\s*([kKmM])?\s*fee/i
    ];
    for (const r of feePatterns) {
      const m = lower.match(r);
      if (m && m[2]) {
        const numRaw = m[2].replace(/,/g, '.');
        const mult = m[3]?.toLowerCase();
        let num = parseFloat(numRaw);
        if (!isNaN(num)) {
          if (mult === 'k') num *= 1000; else if (mult === 'm') num *= 1_000_000;
          feeNum = num;
          break;
        }
      }
    }
    // Legacy pattern fallback (e.g., "12k fee" without currency symbol already covered but keep alternative like "fee 12,500")
    if (feeNum == null) {
      const legacy = lower.match(/fee\s+([0-9.,]+k?)/i) || lower.match(/([0-9.,]+k?)\s*fee/i);
      if (legacy && legacy[1]) {
        let val = legacy[1].toLowerCase().replace(/,/g, '');
        if (/k$/.test(val)) val = String(parseFloat(val.slice(0, -1)) * 1000);
        const n = Number(val);
        if (!isNaN(n)) feeNum = n;
      }
    }
    // Spaced multiplier pattern ("12 k" or "12 K") when a single plausible amount appears and fee keyword absent
    if (feeNum == null) {
      const spaced = lower.match(/\b([0-9]+)\s*([kKmM])\b/);
      if (spaced && spaced[1] && spaced[2]) {
        let num = parseFloat(spaced[1]);
        const mult = spaced[2].toLowerCase();
        if (!isNaN(num)) {
          if (mult === 'k') num *= 1000; else if (mult === 'm') num *= 1_000_000;
          // Heuristic: treat as fee if no existing explicit fee and not obviously a WHT
          feeNum = num;
        }
      }
    }
    if (feeNum != null && feeNum > 0) { result.fee = Math.round(feeNum); }
    // WHT patterns: wht 15% / irpf 15% / 15% wht / wht15%
    const whtMatch = lower.match(/(?:wht|irpf)\s*(\d{1,2})(?:%|pct)?/i) || lower.match(/(\d{1,2})%\s*(?:wht|irpf)/i) || lower.match(/(?:wht|irpf)(\d{1,2})%/i);
    if (whtMatch) { const pct = Number(whtMatch[1]); if (pct >= 0 && pct <= 50) result.whtPct = pct; }
    // Name in quotes
    const nameMatch = lower.match(/"([^"\n]+)"/);
    if (nameMatch && nameMatch[1]) { result.name = nameMatch[1].trim(); }
    // City heuristic (before country code or followed by comma)
    if (!result.city) {
      const cityMatch = lower.match(/([A-Za-zÁÉÍÓÚÜÑ][A-Za-zÁÉÍÓÚÜÑ' .-]{2,})(?:,|\s+[A-Z]{2}\b)/);
      if (cityMatch && cityMatch[1]) { result.city = cityMatch[1].trim(); }
    }
    return result;
  }, []);

  useEffect(() => {
    if (!quickEntry) { setQuickPreview(null); setQuickError(null); return; }
    const parsed = parseQuickEntry(quickEntry);
    const trimmed = quickEntry.trim();
    if (parsed.empty) { setQuickPreview(null); setQuickError(null); return; }
    const keys = Object.keys(parsed);
    if (keys.length === 0) {
      setQuickPreview(null); setQuickError(t('shows.editor.quick.parseError') || 'Cannot interpret');
      if (trimmed && (!lastQuickTrackRef.current || lastQuickTrackRef.current.text !== trimmed)) {
        track(TE.QUICK_PARSE_FAIL);
        lastQuickTrackRef.current = { text: trimmed, status: 'fail' };
      }
    } else {
      setQuickPreview(parsed); setQuickError(null);
      if (trimmed && (!lastQuickTrackRef.current || lastQuickTrackRef.current.text !== trimmed)) {
        track(TE.QUICK_PARSE_SUCCESS, { keys });
        lastQuickTrackRef.current = { text: trimmed, status: 'success' };
      }
    }
  }, [quickEntry, parseQuickEntry, t, track]);

  const applyQuickPreview = useCallback(() => {
    setJustAppliedQuick(true);
    setTimeout(() => setJustAppliedQuick(false), 900);
    if (!quickPreview) return;
    setDraft((d: ShowDraft) => ({ ...d, ...quickPreview }));
    track(TE.QUICK_PARSE_APPLY, { keys: Object.keys(quickPreview) });
    quickParseApply.current += 1;
    announce(t('shows.editor.quick.applied') || 'Quick entry applied', 'polite');
    setQuickEntry('');
    setQuickPreview(null);
  }, [quickPreview, setDraft, t]);

  // Keyboard navigation for tabs (Arrow keys + Home/End)
  const handleTabKeyNav = useCallback((e: React.KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const order: Array<typeof tab> = ['overview', 'finance', 'costs'];
    const idx = order.indexOf(tab);
    let next = tab;
    const nextTab = (e.key === 'ArrowRight') ? order[(idx + 1) % order.length] :
      (e.key === 'ArrowLeft') ? order[(idx - 1 + order.length) % order.length] :
        (e.key === 'Home') ? order[0] :
          (e.key === 'End') ? order[order.length - 1] : undefined;
    if (nextTab) next = nextTab;
    if (next !== tab) {
      setTab(next);
      requestAnimationFrame(() => tabRefs.current[next]?.focus());
    }
    e.preventDefault();
  }, [tab]);

  // Tab change helper with telemetry
  const changeTab = useCallback((next: typeof tab) => {
    if (next === tab) return;
    track(TE.TAB_CHANGE, { from: tab, to: next });
    setTab(next);
    try { localStorage.setItem('showEditor.lastTab', next); } catch { /* ignore */ }
    // Sync to Firebase
    if (userId) {
      FirestoreUserPreferencesService.saveShowsPreferences(userId, { lastTab: next })
        .catch(err => console.error('Failed to sync last tab:', err));
    }
    const label = t(`shows.editor.tab.${next}`) || next.charAt(0).toUpperCase() + next.slice(1);
    const template = t('shows.editor.tab.active') || 'Active tab: {label}';
    announce(template.replace('{label}', label), 'polite');
  }, [tab, announce, t, userId]);

  useEffect(() => {
    if (open && !restoredTabRef.current) {
      if (initialTab !== 'details') {
        const label = t(`shows.editor.tab.${initialTab}`) || initialTab.charAt(0).toUpperCase() + initialTab.slice(1);
        const tpl = t('shows.editor.tab.restored') || 'Restored last tab: {label}';
        announce(tpl.replace('{label}', label), 'polite');
      }
      restoredTabRef.current = true;
    }
  }, [open, initialTab, announce, t]);

  // Focus first interactive element inside panel when tab changes (after paint)
  useEffect(() => {
    if (!open) return;
    const panelId = `panel-${tab}`;
    const panel = drawerRef.current?.querySelector<HTMLElement>(`#${panelId}`);
    if (panel) {
      requestAnimationFrame(() => {
        const focusable = panel.querySelector<HTMLElement>('input,select,textarea,button,[tabindex]:not([tabindex="-1"])');
        focusable?.focus();
      });
    }
  }, [tab, open]);

  // Global keyboard shortcuts (Cmd/Ctrl+S, Esc, etc)
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + S → Save
      if (modifier && e.key === 's') {
        e.preventDefault();
        if (isValid && saving !== 'saving') {
          attemptSave();
        }
        return;
      }

      // Esc → Close (with confirmation if dirty)
      if (e.key === 'Escape' && !showDiscard && !showDelete) {
        e.preventDefault();
        requestClose();
        return;
      }

      // Enter in input fields → focus next field (unless in textarea)
      if (e.key === 'Enter' && e.target instanceof HTMLInputElement && !(e.target as any).classList.contains('no-enter-submit')) {
        e.preventDefault();
        const focusables = Array.from(
          drawerRef.current?.querySelectorAll<HTMLElement>(
            'input,select,textarea,button,[tabindex]:not([tabindex="-1"])'
          ) || []
        );
        const currentIndex = focusables.indexOf(e.target as HTMLElement);
        if (currentIndex >= 0 && currentIndex < focusables.length - 1) {
          focusables[currentIndex + 1]?.focus();
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, isValid, saving, showDiscard, showDelete, requestClose, attemptSave]);

  // Close more menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!showMoreMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showMoreMenu]);

  const portal = (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" onMouseDown={() => requestClose()} style={{ zIndex: 9999 }} aria-hidden={showDiscard || showDelete ? 'true' : undefined} />
      {/* Aria-live region for tab announcements */}
      <div aria-live="polite" className="sr-only" id="tab-announcer" />
      <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }} onMouseDown={() => requestClose()}>
        <div
          ref={drawerRef}
          className={`glass text-white flex flex-col rounded-2xl overscroll-contain border border-[var(--card-border,white/10)] w-full max-w-3xl max-h-[90vh] transform transition-all duration-300 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-white/2 ${ready ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          role="dialog" aria-modal="true" aria-labelledby="show-editor-title" aria-describedby="show-editor-desc" style={{ boxShadow: 'var(--card-shadow, 0 25px 50px -12px rgb(0 0 0 / 0.25))' }}
          onMouseDown={e => e.stopPropagation()}
          onWheel={e => {
            // Allow scroll chaining: if form at top and user scrolls up OR at bottom and scrolls down, let event bubble to body so underlying list scrolls.
            const scrollable = drawerRef.current?.querySelector<HTMLFormElement>('form.flex-1.overflow-y-auto');
            if (!scrollable) return; // fallback
            const atTop = scrollable.scrollTop <= 0;
            const atBottom = Math.ceil(scrollable.scrollTop + scrollable.clientHeight) >= scrollable.scrollHeight;
            if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
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
        <div tabIndex={0} aria-hidden="true" onFocus={() => {
          const focusables = drawerRef.current?.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
          if (focusables && focusables.length > 0) {
            const lastFocusable = focusables[focusables.length - 1];
            lastFocusable?.focus();
          }
        }} />
        {/* Header rediseñado - Dinámico, Contextual & Refined */}
        <div className={`relative border-b-2 transition-all duration-300 ${
          draft.status === 'confirmed' ? 'border-green-500/70' :
          draft.status === 'pending' ? 'border-blue-500/70' :
          draft.status === 'offer' ? 'border-amber-500/70' :
          draft.status === 'postponed' ? 'border-orange-500/70' :
          draft.status === 'canceled' ? 'border-red-500/70' :
          draft.status === 'archived' ? 'border-white/50' :
          'border-white/25'
        } bg-gradient-to-r from-white/6 via-white/3 to-transparent backdrop-blur-sm`}>
          <div className="relative px-4 py-3 flex items-center justify-between gap-3">
            {/* Left: Icon + Title + Location/Date + Status */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Show Icon - Premium */}
              <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 border transition-all duration-200 ${
                draft.status === 'confirmed' ? 'bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/15' :
                draft.status === 'pending' ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/15' :
                draft.status === 'offer' ? 'bg-amber-500/20 border-amber-500/50 shadow-lg shadow-amber-500/15' :
                draft.status === 'postponed' ? 'bg-orange-500/20 border-orange-500/50 shadow-lg shadow-orange-500/15' :
                draft.status === 'canceled' ? 'bg-red-500/20 border-red-500/50 shadow-lg shadow-red-500/15' :
                draft.status === 'archived' ? 'bg-white/15 border-white/35 shadow-lg shadow-white/10' :
                'bg-accent-500/20 border-accent-500/50 shadow-lg shadow-accent-500/15'
              }`}>
                <svg className="w-4.5 h-4.5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>

              {/* Title + Context */}
              <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                {/* Main Title */}
                <h3 id="show-editor-title" className="text-sm font-bold flex items-center gap-1.5 flex-wrap leading-tight">
                  <span className="text-white/95 truncate">
                    {mode === 'add'
                      ? (t('shows.editor.add') || 'Add Show')
                      : (draft.name || draft.city || t('common.unnamed') || 'Unnamed Show')
                    }
                  </span>
                  {dateConflict && (
                    <svg className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                  )}
                </h3>

                {/* Context Row: Location • Date • Status */}
                <div className="text-[9.5px] text-white/65 flex items-center gap-1.5 flex-wrap leading-tight">
                  {draft.city && <span className="font-medium text-white/75">{draft.city}</span>}
                  {draft.country && <span className="text-white/50">({draft.country})</span>}
                  {draft.date && <span className="text-white/40">•</span>}
                  {draft.date && <span className="text-white/65">{new Date(draft.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</span>}
                  {draft.status && <span className="text-white/40">•</span>}
                  {draft.status && (
                    <span className={`px-2 py-0.5 rounded-[6px] text-[8px] font-bold uppercase tracking-wider border transition-all ${
                      draft.status === 'confirmed' ? 'bg-green-500/25 border-green-500/50 text-green-200 shadow-md shadow-green-500/10' :
                      draft.status === 'pending' ? 'bg-blue-500/25 border-blue-500/50 text-blue-200 shadow-md shadow-blue-500/10' :
                      draft.status === 'offer' ? 'bg-amber-500/25 border-amber-500/50 text-amber-200 shadow-md shadow-amber-500/10' :
                      draft.status === 'postponed' ? 'bg-orange-500/25 border-orange-500/50 text-orange-200 shadow-md shadow-orange-500/10' :
                      draft.status === 'canceled' ? 'bg-red-500/25 border-red-500/50 text-red-200 shadow-md shadow-red-500/10' :
                      draft.status === 'archived' ? 'bg-white/15 border-white/35 text-white/70 shadow-md shadow-white/10' :
                      'bg-white/15 border-white/25 text-white/80'
                    }`}>
                      {t(`shows.status.${draft.status}`) || draft.status}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions - Premium */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Promote Button - visible only for offer/pending */}
              {(['offer', 'pending'] as any[]).includes((draft as any).status) && (
                <button
                  type="button"
                  onClick={() => {
                    const current = (draft as any).status;
                    const next = current === 'offer' ? 'pending' : 'confirmed';
                    setDraft((d: ShowDraft) => ({ ...d, status: next } as any));
                    track(TE.STATUS_PROMOTE, { from: current, to: next });
                    announce((t('shows.editor.status.promote') || 'Promoted to') + ': ' + next, 'polite');
                  }}
                  className="px-2.5 py-1 rounded-[8px] bg-accent-500/25 hover:bg-accent-500/35 border border-accent-500/50 hover:border-accent-500/70 text-accent-100 text-xs font-semibold focus-ring transition-all duration-150 shadow-md shadow-accent-500/10 hover:shadow-lg hover:shadow-accent-500/20"
                  title={t('shows.promote') || 'Promote status'}
                >
                  {t('shows.promote') || 'Promote'}
                </button>
              )}

              {/* Plan Travel Button */}
              {onPlanTravel && draft.date && (
                <button
                  type="button"
                  onClick={() => onPlanTravel(draft.date!)}
                  className="p-1.5 rounded-[8px] bg-white/12 hover:bg-white/18 border border-white/25 hover:border-white/35 text-white/75 hover:text-white/90 text-sm focus-ring transition-all duration-150 hover:shadow-md hover:shadow-white/10"
                  title={t('shows.editor.action.travel') || 'Plan travel'}
                >
                  ✈️
                </button>
              )}

              {/* More Actions Menu - Premium */}
              {mode === 'edit' && (
                <div className="relative">
                  <button
                    ref={moreMenuBtnRef}
                    type="button"
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="p-1.5 rounded-[8px] bg-white/8 hover:bg-white/15 border border-white/15 hover:border-white/30 text-white/70 hover:text-white/90 transition-all duration-150 focus-ring hover:shadow-md hover:shadow-white/10"
                    aria-label={t('common.more') || 'More actions'}
                    title={t('common.more') || 'More actions'}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="5" r="2" />
                      <circle cx="12" cy="19" r="2" />
                    </svg>
                  </button>

                  {/* Dropdown Menu - Portal for proper z-index */}
                  {showMoreMenu && moreMenuBtnRef.current && createPortal(
                    <>
                      {/* Backdrop blur overlay */}
                      <div
                        className="fixed inset-0 z-[99998]"
                        style={{
                          backdropFilter: 'blur(4px)',
                          backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        }}
                        onClick={() => setShowMoreMenu(false)}
                      />
                      {/* Menu */}
                      <div
                        className="fixed rounded-lg border border-white/25 bg-gradient-to-br from-white/10 via-white/5 to-white/2 backdrop-blur-md shadow-2xl shadow-black/50 py-1.5 w-48 overflow-hidden"
                        style={{
                          zIndex: 99999,
                          left: `${moreMenuBtnRef.current.getBoundingClientRect().right - 176}px`,
                          top: `${moreMenuBtnRef.current.getBoundingClientRect().bottom + 10}px`,
                        }}
                      >
                      {/* Duplicate */}
                      <button
                        type="button"
                        onClick={() => {
                          track(TE.SHOW_DUPLICATE, { id: initial.id });
                          announce((t('shows.editor.duplicate.initiated') || 'Show duplicated') + ': ' + draft.city, 'polite');
                          try {
                            localStorage.setItem('showEditor.duplicateDraft', JSON.stringify({
                              ...draft,
                              id: undefined,
                              date: undefined,
                            }));
                          } catch { }
                          setShowMoreMenu(false);
                          onRequestClose();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-colors duration-150 border-b border-white/5"
                      >
                        <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {t('shows.editor.duplicate') || 'Duplicate'}
                      </button>

                      {/* Archive */}
                      {draft.status !== 'archived' && (
                        <button
                          type="button"
                          onClick={() => {
                            setDraft((d: ShowDraft) => ({ ...d, status: 'archived' } as any));
                            track(TE.STATUS_PROMOTE, { from: draft.status, to: 'archived' });
                            announce((t('shows.editor.archived') || 'Show archived'), 'polite');
                            setShowMoreMenu(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-colors duration-150 border-b border-white/5"
                        >
                          <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9-4v4m4-4v4" />
                          </svg>
                          {t('shows.editor.archive') || 'Archive'}
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowDelete(true);
                          setShowMoreMenu(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-300/90 hover:text-red-200 hover:bg-red-500/15 flex items-center gap-3 transition-colors duration-150"
                      >
                        <svg className="w-4 h-4 text-red-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {t('shows.dialog.delete') || 'Delete'}
                      </button>
                      </div>
                    </>,
                    document.body
                  )}
                </div>
              )}

              {/* Close button - Premium */}
              <button
                onClick={requestClose}
                className="p-1.5 rounded-[8px] bg-white/8 hover:bg-white/15 border border-white/15 hover:border-white/30 text-white/70 hover:text-white/90 transition-all duration-150 focus-ring hover:shadow-md hover:shadow-white/10 flex-shrink-0"
                aria-label={t('common.close') || 'Close'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* KPI Ticker - Financial Summary Bar (Always Visible & Refined) */}
        <div className="px-4 py-2.5 border-b border-white/15 bg-gradient-to-r from-white/2 via-white/1 to-transparent backdrop-blur-sm">
          {/* Main Ticker Row */}
          <div className="flex items-center justify-between gap-2.5 min-h-[2.75rem] overflow-x-auto">
            {/* Fee (Neutral) */}
            <div className="flex items-center gap-2 flex-shrink-0 px-3.5 py-1.5 rounded-[10px] bg-white/5 hover:bg-white/8 border border-white/15 hover:border-white/25 transition-all duration-150">
              <span className="text-[9px] uppercase tracking-wider font-bold text-white/60">Fee</span>
              <span className="text-sm tabular-nums font-bold text-white/95">{fmtMoney(fee)}</span>
            </div>

            {/* Divider */}
            <div className="w-0.5 h-5 bg-gradient-to-b from-white/20 via-white/10 to-transparent flex-shrink-0"></div>

            {/* WHT (Red/Negative) */}
            {wht > 0 && (
              <>
                <div className="flex items-center gap-2 flex-shrink-0 px-3.5 py-1.5 rounded-[10px] bg-red-500/12 hover:bg-red-500/18 border border-red-500/35 hover:border-red-500/50 transition-all duration-150 group">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-red-300/80 group-hover:text-red-300">WHT</span>
                  <span className="text-sm tabular-nums font-bold text-red-200/90 group-hover:text-red-200">-{fmtMoney(wht)}</span>
                </div>

                {/* Divider */}
                <div className="w-0.5 h-5 bg-gradient-to-b from-white/20 via-white/10 to-transparent flex-shrink-0"></div>
              </>
            )}

            {/* Costs (Orange/Negative) */}
            {totalCosts > 0 && (
              <>
                <div className="flex items-center gap-2 flex-shrink-0 px-3.5 py-1.5 rounded-[10px] bg-orange-500/12 hover:bg-orange-500/18 border border-orange-500/35 hover:border-orange-500/50 transition-all duration-150 group">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-orange-300/80 group-hover:text-orange-300">Costs</span>
                  <span className="text-sm tabular-nums font-bold text-orange-200/90 group-hover:text-orange-200">-{fmtMoney(totalCosts)}</span>
                </div>

                {/* Divider */}
                <div className="w-0.5 h-5 bg-gradient-to-b from-white/20 via-white/10 to-transparent flex-shrink-0"></div>
              </>
            )}

            {/* Commissions (Red/Negative) */}
            {commissions > 0 && (
              <>
                <div className="flex items-center gap-2 flex-shrink-0 px-3.5 py-1.5 rounded-[10px] bg-red-500/12 hover:bg-red-500/18 border border-red-500/35 hover:border-red-500/50 transition-all duration-150 group">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-red-300/80 group-hover:text-red-300">Comm.</span>
                  <span className="text-sm tabular-nums font-bold text-red-200/90 group-hover:text-red-200">-{fmtMoney(commissions)}</span>
                </div>

                {/* Divider */}
                <div className="w-0.5 h-5 bg-gradient-to-b from-white/20 via-white/10 to-transparent flex-shrink-0"></div>
              </>
            )}

            {/* Est. Net (Green if positive, Red if negative) - Premium Highlighted */}
            <div className={`flex items-center gap-3 flex-shrink-0 px-4 py-1.5 rounded-[10px] border backdrop-blur-md transition-all duration-200 group ${
              net >= 0
                ? 'bg-green-500/18 border-green-500/45 hover:bg-green-500/25 hover:border-green-500/60 hover:shadow-lg hover:shadow-green-500/15'
                : 'bg-red-500/18 border-red-500/45 hover:bg-red-500/25 hover:border-red-500/60 hover:shadow-lg hover:shadow-red-500/15'
            }`}>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-wider font-bold text-white/70 group-hover:text-white/90 transition-colors" style={{ color: net >= 0 ? 'rgb(134 239 172 / 0.85)' : 'rgb(252 165 165 / 0.85)' }}>Est. Net</span>
                <span className="text-sm tabular-nums font-bold group-hover:scale-105 transition-transform" style={{ color: net >= 0 ? 'rgb(220 252 231)' : 'rgb(254 226 226)' }}>{fmtMoney(net)}</span>
              </div>

              {/* Margin Percentage (KPI Badge) - Premium */}
              {fee > 0 && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] border font-semibold transition-all duration-200 ${
                  net >= 0
                    ? 'bg-green-600/45 border-green-400/60 text-green-100 hover:bg-green-600/60 hover:shadow-md hover:shadow-green-500/20'
                    : 'bg-red-600/45 border-red-400/60 text-red-100 hover:bg-red-600/60 hover:shadow-md hover:shadow-red-500/20'
                }`}>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" opacity="0.7" />
                    <path d="M13 2v7h7" strokeWidth="0.5" />
                  </svg>
                  <span className="text-[10px] tabular-nums">{Math.round(marginPct)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section - Premium */}
        <div className="px-4 py-2 border-b border-white/15 bg-gradient-to-r from-white/2 via-white/1 to-transparent backdrop-blur-sm">
          {/* Tabs con iconos y indicadores mejorados */}
          <div className="inline-flex gap-0.5 p-1 rounded-[10px] border border-white/15 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-sm" role="tablist" aria-label={t('shows.editor.tabs') || 'Editor tabs'}>
            {(['overview', 'finance', 'costs'] as const).map(k => {
              const active = tab === k;
              const labelKey = `shows.editor.tab.${k === 'overview' ? 'details' : k}`;
              const icons = {
                overview: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
                finance: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
                costs: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              };
              return (
                <button
                  key={k}
                  role="tab"
                  id={`tab-${k}`}
                  aria-selected={active}
                  aria-controls={`panel-${k}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => { changeTab(k); requestAnimationFrame(() => tabRefs.current[k]?.focus()); }}
                  onKeyDown={handleTabKeyNav}
                  ref={el => { tabRefs.current[k] = el; }}
                  className={`relative px-2.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 group ${
                    active
                      ? 'text-white'
                      : 'text-white/65 hover:text-white/85'
                  }`}
                >
                  {/* Animated background for active tab */}
                  {active && (
                    <div className="absolute inset-0 rounded-[8px] bg-gradient-to-r from-accent-500/35 to-accent-600/25 border border-accent-400/40 -z-10 shadow-lg shadow-accent-500/10"></div>
                  )}

                  {/* Icon with color change */}
                  <svg className={`w-3.5 h-3.5 transition-colors duration-200 ${active ? 'text-accent-300' : 'text-white/45 group-hover:text-white/70'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icons[k]}
                  </svg>

                  {/* Label */}
                  <span className="relative text-xs font-medium">
                    {k === 'costs'
                      ? `${(t(labelKey) || 'Costs')} (${(draft.costs || []).length})`
                      : (t(labelKey) || k.charAt(0).toUpperCase() + k.slice(1))}

                    {/* Underline indicator for active tab */}
                    {active && (
                      <div className="absolute bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-400 via-accent-300 to-accent-400 rounded-full"></div>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Body con mejor diseño y gradiente */}
        <form className="flex-1 overflow-y-auto px-4 py-4 lg:px-6 lg:py-5 text-sm bg-gradient-to-b from-white/2 via-white/1 to-white/0.5 space-y-4" onSubmit={e => { e.preventDefault(); attemptSave(); }}>
          {/* Conflict Warning Banner */}
          {dateConflict && (
            <div className="px-3 py-2 rounded-md bg-amber-500/15 border border-amber-500/40 flex items-start gap-2.5 animate-fade-in">
              <svg className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-200">
                  {t('shows.editor.conflict.warning') || '⚠️ Date Conflict'}
                </p>
                <p className="text-[11px] text-amber-100/80 mt-0.5">
                  {t('shows.editor.conflict.overlaps') || 'This date overlaps with'} <strong>"{dateConflict.showName}"</strong> {t('shows.editor.conflict.in') || 'in'} {dateConflict.city} ({dateConflict.date}{dateConflict.endDate ? ` - ${dateConflict.endDate}` : ''})
                </p>
              </div>
            </div>
          )}
          {tab === 'overview' && (
            <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" className="grid grid-cols-1 lg:grid-cols-10 gap-4 lg:gap-6 w-full">
              {/* LEFT COLUMN (70%) - Primary Show Information */}
              <div className="lg:col-span-7 space-y-3 lg:space-y-4">
                {/* Show Name - Large & Prominent */}
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-bold uppercase tracking-wider text-white/80">
                    {t('shows.editor.label.name') || t('shows.table.name') || 'Show name'}
                  </span>
                  <input
                    ref={firstFieldRef}
                    data-field="name"
                    className="px-4 py-2.5 rounded-md bg-white/5 border border-white/15 hover:border-white/25 focus:border-accent-500 focus:bg-white/10 focus:shadow-lg focus:shadow-accent-500/15 focus:ring-1 focus:ring-accent-500/30 transition-all placeholder:text-white/40 text-base font-semibold"
                    value={(draft as any).name || ''}
                    placeholder={t('shows.editor.placeholder.name') || 'Enter show name...'}
                    onChange={e => setDraft((d: ShowDraft) => ({ ...d, name: e.target.value }))}
                  />
                </label>

                {/* Date & Time Row */}
                <div className="grid grid-cols-2 gap-3">
                  <DatePickerAdvanced
                    value={String(draft.date || '').slice(0, 10) || undefined}
                    onChange={date => setDraft((d: ShowDraft) => ({ ...d, date }))}
                    label={t('shows.editor.label.date') || 'Date'}
                    help={t('shows.editor.help.date') || 'Select show date'}
                    error={validation.date ? t(validation.date) || 'Required' : undefined}
                    disabled={false}
                  />
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">
                      {t('shows.editor.label.time') || 'Time'}
                    </span>
                    <input
                      type="time"
                      data-field="startTime"
                      className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-white/15 focus:border-accent-500 focus:bg-slate-300 dark:bg-white/15 focus:shadow-lg focus:shadow-accent-500/10 focus:ring-1 focus:ring-accent-500/20 transition-all text-sm"
                      value={(draft as any).startTime || ''}
                      onChange={e => setDraft((d: ShowDraft) => ({ ...d, startTime: e.target.value } as ShowDraft))}
                    />
                  </label>
                </div>

                {/* Location Section (City + Country grouped) */}
                <div className="glass rounded-[10px] border border-slate-200 dark:border-white/10 p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/60">{t('shows.editor.label.location') || 'Location'}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">
                        {t('shows.editor.label.city') || 'City'}
                      </span>
                      <div className="flex gap-1.5 items-center">
                        <input
                          list="city-suggestions"
                          data-field="city"
                          aria-required="true"
                          aria-invalid={!!validation.city}
                          aria-describedby={validation.city ? 'err-city' : undefined}
                          className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-white/15 focus:border-accent-500 focus:bg-slate-300 dark:bg-white/15 focus:shadow-lg focus:shadow-accent-500/10 focus:ring-1 focus:ring-accent-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 flex-1 text-sm"
                          value={draft.city || ''}
                          placeholder="Enter city..."
                          onChange={e => setDraft((d: ShowDraft) => ({ ...d, city: e.target.value }))}
                          onBlur={e => { const v = e.target.value.trim(); if (v) recordCity(v); }}
                        />
                      </div>
                      <datalist id="city-suggestions">
                        {recentCities.map(c => <option key={'city-' + c} value={c} />)}
                      </datalist>
                      {validation.city && <p id="err-city" className="text-[10px] text-red-400">{t(validation.city) || 'Required'}</p>}
                    </label>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="show-editor-country" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">
                        {t('shows.editor.label.country') || 'Country'}
                      </label>
                      <CountrySelect
                        id="show-editor-country"
                        aria-label={t('shows.editor.label.country') || 'Country'}
                        data-field="country"
                        aria-required="true"
                        aria-invalid={!!validation.country}
                        aria-describedby={validation.country ? 'err-country' : undefined}
                        value={draft.country || ''}
                        onChange={code => setDraft((d: ShowDraft) => ({ ...d, country: code }))}
                      />
                      {validation.country && <p id="err-country" className="text-[10px] text-red-400">{t(validation.country) || 'Required'}</p>}
                    </div>
                  </div>
                </div>

                {/* Fee Input */}
                <div className="glass rounded-[10px] border border-slate-200 dark:border-white/10 p-4 space-y-3">
                  <FeeFieldAdvanced
                    fee={draft.fee}
                    onFeeChange={(newFee) => setDraft((d: ShowDraft) => ({ ...d, fee: newFee }))}
                    currency={feeCurrency || baseCurrency}
                    currencySymbol={(() => {
                      const symbols: Record<string, string> = { EUR: '€', USD: '$', GBP: '£', AUD: 'A$' };
                      return symbols[feeCurrency || baseCurrency] || '€';
                    })()}
                    costs={(draft.costs || []).reduce((s: number, c: any) => s + (c.amount || 0), 0)}
                    commissions={financeCards.commVal}
                    whtPct={draft.whtPct || 0}
                    fmtMoney={fmtMoney}
                    error={validation.fee ? String(t(validation.fee) || 'Invalid fee') : undefined}
                    disabled={false}
                  />
                </div>

                {/* Promoter Field with Autocomplete */}
                <div className="glass rounded-[10px] border border-slate-200 dark:border-white/10 p-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">
                      {t('shows.editor.label.promoter') || 'Promoter'}
                    </span>
                    <PromoterAutocomplete
                      value={(draft as any).promoter || ''}
                      onChange={(name, contactId) => {
                        setDraft((d: ShowDraft) => ({ 
                          ...d, 
                          promoter: name,
                          promoterId: contactId 
                        } as any));
                      }}
                      className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-white/15 focus:border-accent-500 focus:bg-slate-300 dark:focus:bg-white/15 focus:shadow-lg focus:shadow-accent-500/10 focus:ring-1 focus:ring-accent-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 text-sm"
                    />
                  </label>
                </div>

                {/* Venue with Autocomplete */}
                <div className="glass rounded-[10px] border border-slate-200 dark:border-white/10 p-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70 flex items-center gap-2">
                      {t('shows.editor.label.venue') || 'Venue'}
                      <span className="text-[9px] lowercase tracking-normal opacity-50 font-normal">
                        {t('shows.editor.help.venue') || 'venue/room name'}
                      </span>
                    </span>
                    <VenueAutocomplete
                      value={(draft as any).venue || ''}
                      onChange={(name, venueId) => {
                        setDraft((d: ShowDraft) => ({ 
                          ...d, 
                          venue: name,
                          venueId: venueId 
                        } as any));
                        if (name.trim()) recordVenue(name.trim());
                      }}
                      city={draft.city}
                      country={draft.country}
                      className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-white/15 focus:border-accent-500 focus:bg-slate-300 dark:focus:bg-white/15 focus:shadow-lg focus:shadow-accent-500/10 focus:ring-1 focus:ring-accent-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 text-sm"
                    />
                  </label>
                </div>

                {/* Notes - Large & Prominent */}
                <NotesEditor
                  value={draft.notes}
                  onChange={notes => setDraft((d: ShowDraft) => ({ ...d, notes }))}
                  onAutoSave={notes => {
                    track(TE.NOTES_AUTO_SAVE);
                  }}
                  label={t('shows.editor.label.notes') || 'Notes'}
                  help={t('shows.editor.help.notes') || 'Sound check, stage setup, special requirements, etc.'}
                  placeholder={t('shows.editor.placeholder.notes') || 'Add notes...'}
                  autoSaveDelay={2000}
                />
              </div>

              {/* RIGHT COLUMN (30%) - Metadata & Status */}
              <div className="lg:col-span-3 space-y-3 lg:space-y-4">
                {/* Status */}
                <div className="glass rounded-[10px] border border-slate-200 dark:border-white/10 p-3.5 space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/60 block">
                    {t('shows.editor.label.status') || 'Status'}
                  </span>
                  <StatusSelector
                    value={(draft as any).status || 'pending'}
                    onChange={status => setDraft((d: ShowDraft) => ({ ...d, status } as any))}
                    label=""
                    help=""
                    disabled={false}
                  />
                </div>

                {/* Currency & FX Conversion */}
                <div className="glass rounded-[10px] border border-slate-200 dark:border-white/10 p-4 space-y-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">
                      {t('shows.editor.label.currency') || 'Currency'}
                    </span>
                    <select
                      data-field="feeCurrency"
                      className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-white/15 focus:border-accent-500 focus:bg-slate-300 dark:bg-white/15 focus:shadow-lg focus:shadow-accent-500/10 focus:ring-1 focus:ring-accent-500/20 transition-all cursor-pointer text-sm"
                      value={feeCurrency}
                      onChange={e => setDraft((d: ShowDraft) => ({ ...d, feeCurrency: e.target.value as any }))}
                    >
                      {['EUR', 'USD', 'GBP', 'AUD'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  {fee > 0 && feeCurrency !== baseCurrency && (
                    <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-1.5">
                      <p className="text-[11px] text-slate-400 dark:text-white/60 font-semibold">
                        {t('shows.editor.fx.convertedFee') || 'Converted to'} {baseCurrency}:
                      </p>
                      <p className="text-base font-bold text-accent-300">
                        {convertedFee != null ? fmtMoney(Math.round(convertedFee)) : '?'}
                      </p>
                      {effectiveRate && (
                        <p className="text-[10px] text-slate-300 dark:text-white/50">
                          {t('shows.editor.fx.rateOn') || 'Rate'}: {effectiveRate.toFixed(4)}
                        </p>
                      )}
                      {fee > 0 && feeCurrency !== baseCurrency && convertedFee == null && (
                        <p className="text-[10px] text-amber-300">{t('shows.editor.fx.unavailable') || 'Rate unavailable'}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Agencies & Commissions */}
                <div className="glass rounded-[10px] border border-slate-200 dark:border-white/10 p-3 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/60">
                    {t('shows.editor.label.agencies') || 'Agencies'}
                  </h4>
                  <div className="space-y-2">
                    {(() => {
                      const mgmt = managementAgencies.find(a => a.name === draft.mgmtAgency);
                      const booking = bookingAgencies.find(a => a.name === draft.bookingAgency);
                      const mgmtDefault = mgmt?.commissionPct || 0;
                      const bookingDefault = booking?.commissionPct || 0;
                      return (
                        <>
                          <label className="flex flex-col gap-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">
                              {t('shows.table.agency.mgmt') || 'Management'}
                            </span>
                            <select
                              className="px-3 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-white/15 focus:border-accent-500 focus:bg-slate-300 dark:bg-white/15 focus:shadow-lg focus:shadow-accent-500/10 focus:ring-1 focus:ring-accent-500/20 transition-all cursor-pointer text-sm"
                              value={draft.mgmtAgency || ''}
                              onChange={e => {
                                console.log('[ShowEditor] Mgmt agency changed to:', e.target.value);
                                setDraft((d: ShowDraft) => {
                                  const updated = { ...d, mgmtAgency: e.target.value || undefined };
                                  console.log('[ShowEditor] New draft state:', updated);
                                  return updated;
                                });
                              }}
                            >
                              <option value="">{t('common.none') || '—'}</option>
                              {managementAgencies.map(a => (
                                <option key={a.id} value={a.name}>{sanitizeName(a.name)}</option>
                              ))}
                            </select>
                          </label>
                          {draft.mgmtAgency && (
                            <div className="flex items-center gap-1.5 text-[9px]">
                              <span className="text-slate-400 dark:text-white/60">{mgmtDefault}%</span>
                              <span className="px-1.5 py-0.5 rounded bg-accent-500/20 border border-accent-500/40 text-accent-300 font-semibold text-[8px]">Mgmt</span>
                            </div>
                          )}
                          <label className="flex flex-col gap-1 pt-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">
                              {t('shows.table.agency.booking') || 'Booking'}
                            </span>
                            <select
                              className="px-3 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-white/15 focus:border-accent-500 focus:bg-slate-300 dark:bg-white/15 focus:shadow-lg focus:shadow-accent-500/10 focus:ring-1 focus:ring-accent-500/20 transition-all cursor-pointer text-sm"
                              value={draft.bookingAgency || ''}
                              onChange={e => setDraft((d: ShowDraft) => ({ ...d, bookingAgency: e.target.value || undefined }))}
                            >
                              <option value="">{t('common.none') || '—'}</option>
                              {bookingAgencies.map(a => (
                                <option key={a.id} value={a.name}>{sanitizeName(a.name)}</option>
                              ))}
                            </select>
                          </label>
                          {draft.bookingAgency && (
                            <div className="flex items-center gap-1.5 text-[9px]">
                              <span className="text-slate-400 dark:text-white/60">{bookingDefault}%</span>
                              <span className="px-1.5 py-0.5 rounded bg-accent-500/20 border border-accent-500/40 text-accent-300 font-semibold text-[8px]">Booking</span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* WHT & Additional Fields */}
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">
                    {t('shows.editor.label.wht') || 'WHT %'}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      data-field="whtPct"
                      aria-invalid={!!validation.whtPct}
                      aria-describedby={(validation.whtPct ? 'err-whtPct ' : '') + 'wht-help'}
                      type="number"
                      step={1}
                      min={0}
                      max={50}
                      className="px-3 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-white/15 focus:border-accent-500 focus:bg-slate-300 dark:bg-white/15 focus:shadow-lg focus:shadow-accent-500/10 focus:ring-1 focus:ring-accent-500/20 transition-all text-sm flex-1"
                      value={draft.whtPct ?? ''}
                      placeholder="0"
                      onChange={e => setDraft((d: ShowDraft) => ({ ...d, whtPct: e.target.value === '' ? undefined : Math.max(0, Math.min(50, Number(e.target.value) || 0)) }))}
                    />
                    {(() => {
                      if (!draft.country) return null;
                      const defaults: Record<string, number> = { ES: 15, FR: 15, DE: 15, MX: 10, BR: 15, US: 0 };
                      const sug = defaults[draft.country];
                      if (sug == null) return null;
                      const isApplied = draft.whtPct === sug;
                      const show = draft.whtPct == null || (!isApplied && draft.whtPct !== sug);
                      if (!show) return null;
                      return (
                        <button
                          type="button"
                          onClick={() => { setDraft((d: ShowDraft) => ({ ...d, whtPct: sug })); announce((t('shows.editor.wht.suggest.applied') || 'WHT suggestion applied') + ': ' + sug + '%'); track(TE.WHT_SUGGEST_APPLY, { country: draft.country, pct: sug }); }}
                          className={`px-2 py-1 rounded text-[10px] border whitespace-nowrap ${isApplied ? 'border-green-500/40 text-green-300 bg-green-500/10' : 'border-accent-500/40 text-accent-200 bg-accent-500/10 hover:bg-accent-500/20'}`}
                          aria-pressed={isApplied}
                        >{sug}%</button>
                      );
                    })()}
                  </div>
                  {validation.whtPct && <p id="err-whtPct" className="text-[10px] text-red-400">{t(validation.whtPct) || 'Out of range'}</p>}
                </label>

                {/* VAT/IVA Field */}
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">
                    {t('shows.editor.label.vat') || 'VAT/IVA %'}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      data-field="vatPct"
                      aria-invalid={!!validation.vatPct}
                      aria-describedby={(validation.vatPct ? 'err-vatPct ' : '') + 'vat-help'}
                      type="number"
                      step={1}
                      min={0}
                      max={30}
                      className="px-3 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-white/15 focus:border-accent-500 focus:bg-slate-300 dark:bg-white/15 focus:shadow-lg focus:shadow-accent-500/10 focus:ring-1 focus:ring-accent-500/20 transition-all text-sm flex-1"
                      value={draft.vatPct ?? ''}
                      placeholder="0"
                      onChange={e => setDraft((d: ShowDraft) => ({ ...d, vatPct: e.target.value === '' ? undefined : Math.max(0, Math.min(30, Number(e.target.value) || 0)) }))}
                    />
                    {(() => {
                      if (!draft.country) return null;
                      const defaults: Record<string, number> = { ES: 21, FR: 20, DE: 19, IT: 22, GB: 20, PT: 23, NL: 21, BE: 21, US: 0, MX: 16, BR: 0 };
                      const sug = defaults[draft.country];
                      if (sug == null) return null;
                      const isApplied = draft.vatPct === sug;
                      const show = draft.vatPct == null || (!isApplied && draft.vatPct !== sug);
                      if (!show) return null;
                      return (
                        <button
                          type="button"
                          onClick={() => { setDraft((d: ShowDraft) => ({ ...d, vatPct: sug })); announce((t('shows.editor.vat.suggest.applied') || 'VAT suggestion applied') + ': ' + sug + '%'); track(TE.VAT_SUGGEST_APPLY, { country: draft.country, pct: sug }); }}
                          className={`px-2 py-1 rounded text-[10px] border whitespace-nowrap ${isApplied ? 'border-green-500/40 text-green-300 bg-green-500/10' : 'border-accent-500/40 text-accent-200 bg-accent-500/10 hover:bg-accent-500/20'}`}
                          aria-pressed={isApplied}
                        >{sug}%</button>
                      );
                    })()}
                  </div>
                  {validation.vatPct && <p id="err-vatPct" className="text-[10px] text-red-400">{t(validation.vatPct) || 'Out of range'}</p>}
                  <p id="vat-help" className="text-[10px] text-slate-400 dark:text-white/50">{t('shows.editor.vat.hint') || 'Value Added Tax percentage (0-30%)'}</p>
                </label>

                {/* Travel CTA */}
                {draft.date && draft.status !== 'canceled' && (() => {
                  const iso = String(draft.date).slice(0, 10);
                  const showDate = new Date(iso + 'T00:00:00');
                  const now = new Date();
                  const diffDays = Math.round((showDate.getTime() - now.getTime()) / 86400000);
                  const within = diffDays <= 30;
                  const tripExists = within && hasTripAroundDate?.(iso);
                  const noAction = diffDays > 30;
                  if (noAction) return null;
                  return (
                    <button
                      type="button"
                      className="w-full px-3 py-1.5 rounded-md bg-accent-500/20 border border-accent-500/40 text-accent-200 hover:bg-accent-500/30 text-xs font-medium transition-all"
                      onClick={() => { track(TE.TRAVEL_CTA_CLICK, { type: 'plan', date: iso }); onPlanTravel?.(iso); }}
                    >
                      {tripExists ? (t('shows.travel.tripExists') || 'Trip exists') : (t('shows.travel.plan') || 'Plan')}
                    </button>
                  );
                })()}

                {/* Contracts Section */}
                {mode === 'edit' && draft.id && (
                  <div className="pt-4 border-t border-white/10">
                    <ContractsList 
                      showId={draft.id} 
                      showName={draft.name || `${draft.city}, ${draft.country}`}
                      compact={true}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          {tab === 'finance' && (
            <div id="panel-finance" role="tabpanel" aria-labelledby="tab-finance" className="text-sm space-y-4 max-w-7xl mx-auto">
              {/* Fee Input Field - ADDED */}
              <div className="glass rounded-lg border border-slate-200 dark:border-white/10 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/60">
                  {t('shows.editor.label.fee') || 'Fee Amount'}
                </h4>
                <FeeFieldAdvanced
                  fee={draft.fee}
                  onFeeChange={(newFee) => setDraft((d: ShowDraft) => ({ ...d, fee: newFee }))}
                  currency={(draft as any).feeCurrency || baseCurrency}
                  currencySymbol={(() => {
                    const symbols: Record<string, string> = { EUR: '€', USD: '$', GBP: '£', AUD: 'A$' };
                    return symbols[(draft as any).feeCurrency || baseCurrency] || '€';
                  })()}
                  costs={((draft as any).costs || []).reduce((s: number, c: any) => s + (c.amount || 0), 0)}
                  commissions={financeCards.commVal}
                  whtPct={(draft as any).whtPct || 0}
                  fmtMoney={fmtMoney}
                  error={validation.fee ? String(t(validation.fee) || 'Invalid fee') : undefined}
                  disabled={false}
                />
              </div>

              <div className="glass rounded-md p-3 border border-white/10">
                <div className="flex items-center gap-2 text-slate-400 dark:text-white/60 text-xs">
                  <svg className="w-3.5 h-3.5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{t('shows.editor.tooltip.netFormula') || 'Net = Fee − (Fee×WHT%) − Commission − Costs'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="glass rounded p-2 space-y-1">
                  <div className="uppercase tracking-wide opacity-60">{t('shows.editor.summary.fee') || 'Fee'}</div>
                  <div className="text-sm font-semibold tabular-nums">{fmtMoney(financeCards.feeVal)}</div>
                </div>
                <div className="glass rounded p-2 space-y-1 bg-green-500/10 border border-green-500/40">
                  <div className="uppercase tracking-wide opacity-60 text-green-200">{t('shows.editor.summary.vat') || 'VAT'} {financeCards.vatPctEff ? `(${financeCards.vatPctEff}%)` : ''}</div>
                  <div className="text-sm font-semibold tabular-nums text-green-100">+{fmtMoney(Math.round(financeCards.vatVal))}</div>
                </div>
                <div className="glass rounded p-2 space-y-1 bg-blue-500/10 border border-blue-500/40">
                  <div className="uppercase tracking-wide opacity-60 text-blue-200">{t('shows.editor.summary.invoiceTotal') || 'Invoice Total'}</div>
                  <div className="text-sm font-semibold tabular-nums text-blue-100">{fmtMoney(Math.round(financeCards.invoiceTotal))}</div>
                </div>
                <div className="glass rounded p-2 space-y-1">
                  <div className="uppercase tracking-wide opacity-60">{t('shows.editor.summary.wht') || 'WHT'} {financeCards.whtPctEff ? `(${financeCards.whtPctEff}%)` : ''}</div>
                  <div className="text-sm font-semibold tabular-nums">-{fmtMoney(Math.round(financeCards.whtVal))}</div>
                </div>
                <div
                  className="glass rounded p-2 space-y-1 relative"
                  title={financeCards.agencyNames || undefined}
                >
                  <div className="uppercase tracking-wide opacity-60 flex items-center gap-1 flex-wrap">
                    {t('shows.editor.finance.commissions') || 'Commissions'} {financeCards.totalCommPct > 0 ? `(${financeCards.totalCommPct.toFixed(1)}%)` : ''}
                  </div>
                  <div className="text-sm font-semibold tabular-nums flex items-center gap-2">
                    -{fmtMoney(Math.round(financeCards.commVal))}
                    {financeCards.agencyNames && <span className="px-1 rounded bg-accent-500/20 border border-accent-400/40 text-accent-200 text-[9px]">{financeCards.agencyNames}</span>}
                  </div>
                </div>
                <div className="glass rounded p-2 space-y-1">
                  <div className="uppercase tracking-wide opacity-60">{t('shows.editor.summary.costs') || 'Costs'}</div>
                  <div className="text-sm font-semibold tabular-nums">-{fmtMoney(Math.round(financeCards.costsVal))}</div>
                </div>
                <div className="glass rounded p-2 space-y-1 col-span-2 sm:col-span-3 bg-accent-500/12 border border-accent-500/40">
                  <div className="uppercase tracking-wide opacity-80 font-medium flex items-center gap-2 text-accent-100">{t('shows.editor.summary.net') || 'Est. Net'}{financeCards.feeVal > 0 && <span className="px-1 py-0.5 rounded bg-accent-500/25 border border-accent-500/40 text-accent-50 text-[10px]" title={t('shows.tooltip.margin') || 'Net divided by Fee (%)'}>{Math.round((financeCards.netVal / financeCards.feeVal) * 100)}%</span>}</div>
                  <div className="text-base font-semibold tabular-nums text-accent-50">{fmtMoney(Math.round(financeCards.netVal))}</div>
                </div>
              </div>
              {(() => {
                const mgmt = managementAgencies.find(a => a.name === draft.mgmtAgency);
                const booking = bookingAgencies.find(a => a.name === draft.bookingAgency);
                const mgmtDefault = mgmt?.commissionPct || 0;
                const bookingDefault = booking?.commissionPct || 0;
                return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">{t('shows.editor.label.mgmt') || 'Mgmt Agency'}</span>
                    <select
                      className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-white/15 focus:border-accent-500 focus:bg-slate-300 dark:bg-white/15 focus:shadow-lg focus:shadow-accent-500/10 focus:ring-1 focus:ring-accent-500/20 transition-all cursor-pointer text-sm"
                      value={draft.mgmtAgency || ''}
                      onChange={e => setDraft((d: ShowDraft) => ({ ...d, mgmtAgency: e.target.value || undefined }))}
                    >
                      <option value="">{t('common.none') || '—'}</option>
                      {managementAgencies.map(a => (
                        <option key={a.id} value={a.name}>{sanitizeName(a.name)} ({a.commissionPct}%)</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">{t('shows.editor.label.booking') || 'Booking Agency'}</span>
                    <select
                      className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-white/15 focus:border-accent-500 focus:bg-slate-300 dark:bg-white/15 focus:shadow-lg focus:shadow-accent-500/10 focus:ring-1 focus:ring-accent-500/20 transition-all cursor-pointer text-sm"
                      value={draft.bookingAgency || ''}
                      onChange={e => setDraft((d: ShowDraft) => ({ ...d, bookingAgency: e.target.value || undefined }))}
                    >
                      <option value="">{t('common.none') || '—'}</option>
                      {bookingAgencies.map(a => (
                        <option key={a.id} value={a.name}>{sanitizeName(a.name)} ({a.commissionPct}%)</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70 flex items-center gap-1.5">
                      {t('shows.table.agency.mgmt') || 'Mgmt'} %
                      {draft.mgmtAgency && (
                        draft.mgmtPct == null ? (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/20 text-[9px] font-normal normal-case tracking-normal" title={t('shows.editor.commission.default')?.replace('{pct}', String(mgmtDefault)) || `Default ${mgmtDefault}%`}>
                            {t('shows.editor.commission.default') ? t('shows.editor.commission.default')!.replace('{pct}', String(mgmtDefault)) : `Default ${mgmtDefault}%`}
                          </span>
                        ) : draft.mgmtPct !== mgmtDefault && (
                          <button type="button" onClick={() => setDraft((d: ShowDraft) => ({ ...d, mgmtPct: undefined }))} className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/50 text-amber-100 hover:bg-amber-500/30 text-[9px] font-medium focus-ring"
                            title={t('shows.editor.commission.reset') || 'Reset'}
                          >{t('shows.editor.commission.overridden') || 'Override'}</button>
                        )
                      )}
                    </span>
                    <input aria-describedby={draft.mgmtPct != null && draft.mgmtPct !== mgmtDefault ? 'mgmt-override-hint' : undefined} type="number" min={0} max={50} className={`px-3 py-1.5 rounded-md bg-white/5 border focus-ring transition-all text-sm ${(draft.mgmtPct != null && draft.mgmtPct !== mgmtDefault) ? 'border-amber-400/60 bg-amber-500/5' : 'border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/30 focus:border-accent-500/50'}`} value={draft.mgmtPct ?? ''} onChange={e => setDraft((d: ShowDraft) => ({ ...d, mgmtPct: e.target.value === '' ? undefined : Math.max(0, Math.min(50, Number(e.target.value) || 0)) }))} />
                    {(draft.mgmtPct != null && draft.mgmtPct !== mgmtDefault) && <span id="mgmt-override-hint" className="text-xs text-amber-200 font-medium">{t('shows.editor.commission.overriddenIndicator') || 'Commission overridden'} ({mgmtDefault}% → {draft.mgmtPct}%)</span>}
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70 flex items-center gap-1.5">
                      {t('shows.table.agency.booking') || 'Booking'} %
                      {draft.bookingAgency && (
                        draft.bookingPct == null ? (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/20 text-[9px] font-normal normal-case tracking-normal" title={t('shows.editor.commission.default')?.replace('{pct}', String(bookingDefault)) || `Default ${bookingDefault}%`}>
                            {t('shows.editor.commission.default') ? t('shows.editor.commission.default')!.replace('{pct}', String(bookingDefault)) : `Default ${bookingDefault}%`}
                          </span>
                        ) : draft.bookingPct !== bookingDefault && (
                          <button type="button" onClick={() => setDraft((d: ShowDraft) => ({ ...d, bookingPct: undefined }))} className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/50 text-amber-100 hover:bg-amber-500/30 text-[9px] font-medium focus-ring"
                            title={t('shows.editor.commission.reset') || 'Reset'}
                          >{t('shows.editor.commission.overridden') || 'Override'}</button>
                        )
                      )}
                    </span>
                    <input aria-describedby={draft.bookingPct != null && draft.bookingPct !== bookingDefault ? 'booking-override-hint' : undefined} type="number" min={0} max={50} className={`px-3 py-1.5 rounded-md bg-white/5 border focus-ring transition-all text-sm ${(draft.bookingPct != null && draft.bookingPct !== bookingDefault) ? 'border-amber-400/60 bg-amber-500/5' : 'border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/30 focus:border-accent-500/50'}`} value={draft.bookingPct ?? ''} onChange={e => setDraft((d: ShowDraft) => ({ ...d, bookingPct: e.target.value === '' ? undefined : Math.max(0, Math.min(50, Number(e.target.value) || 0)) }))} />
                    {(draft.bookingPct != null && draft.bookingPct !== bookingDefault) && <span id="booking-override-hint" className="text-xs text-amber-200 font-medium">{t('shows.editor.commission.overriddenIndicator') || 'Commission overridden'} ({bookingDefault}% → {draft.bookingPct}%)</span>}
                  </label>
                </div>;
              })()}

              {/* WHT Field */}
              <div className="glass border border-slate-200 dark:border-white/10 rounded-[10px] p-4">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">
                    {t('shows.editor.label.wht') || 'WHT %'}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      data-field="whtPct"
                      aria-invalid={!!validation.whtPct}
                      aria-describedby={(validation.whtPct ? 'err-whtPct-finance ' : '') + 'wht-help-finance'}
                      type="number"
                      step={1}
                      min={0}
                      max={50}
                      className="px-3 py-2 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-white/15 focus:border-accent-500 focus:bg-slate-300 dark:focus:bg-white/15 focus:shadow-lg focus:shadow-accent-500/10 focus:ring-1 focus:ring-accent-500/20 transition-all text-sm flex-1"
                      value={draft.whtPct ?? ''}
                      placeholder="0"
                      onChange={e => setDraft((d: ShowDraft) => ({ ...d, whtPct: e.target.value === '' ? undefined : Math.max(0, Math.min(50, Number(e.target.value) || 0)) }))}
                    />
                    {(() => {
                      if (!draft.country) return null;
                      const defaults: Record<string, number> = { ES: 15, FR: 15, DE: 15, MX: 10, BR: 15, US: 0 };
                      const sug = defaults[draft.country];
                      if (sug == null) return null;
                      const isApplied = draft.whtPct === sug;
                      const show = draft.whtPct == null || (!isApplied && draft.whtPct !== sug);
                      if (!show) return null;
                      return (
                        <button
                          type="button"
                          onClick={() => { setDraft((d: ShowDraft) => ({ ...d, whtPct: sug })); announce((t('shows.editor.wht.suggest.applied') || 'WHT suggestion applied') + ': ' + sug + '%'); track(TE.WHT_SUGGEST_APPLY, { country: draft.country, pct: sug }); }}
                          className={`px-2 py-1 rounded text-[10px] border whitespace-nowrap ${isApplied ? 'border-green-500/40 text-green-300 bg-green-500/10' : 'border-accent-500/40 text-accent-200 bg-accent-500/10 hover:bg-accent-500/20'}`}
                          aria-pressed={isApplied}
                        >{sug}%</button>
                      );
                    })()}
                  </div>
                  {validation.whtPct && <p id="err-whtPct-finance" className="text-[10px] text-red-400">{t(validation.whtPct) || 'Out of range'}</p>}
                  <p id="wht-help-finance" className="text-[10px] text-slate-400 dark:text-white/50">{t('shows.editor.wht.hint') || 'Withholding tax percentage (0-50%)'}</p>
                </label>
              </div>

              <div className="glass border border-slate-200 dark:border-white/10 rounded-[10px] p-3 space-y-2">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-white/80">{t('shows.editor.finance.breakdown') || 'Financial Breakdown'}</h4>
                <dl className="grid grid-cols-2 gap-y-1 text-[11px]">
                  <dt className="text-slate-400 dark:text-white/60 font-medium">{t('shows.editor.summary.fee') || 'Fee'}</dt><dd className="text-right tabular-nums font-semibold text-slate-900 dark:text-white">{fmtMoney(financialBreakdown.fee)}</dd>
                  <dt className="text-slate-400 dark:text-white/60 font-medium">{t('shows.editor.summary.wht') || 'WHT'}</dt><dd className="text-right tabular-nums font-semibold text-slate-900 dark:text-white">-{fmtMoney(Math.round(financialBreakdown.wht))}</dd>
                  <dt className="text-slate-400 dark:text-white/60 font-medium">{t('shows.table.agency.mgmt') || 'Mgmt'} ({financialBreakdown.mgmt && financialBreakdown.fee ? ((financialBreakdown.mgmt / financialBreakdown.fee * 100).toFixed(1) + '%') : '0%'})</dt><dd className="text-right tabular-nums font-semibold text-slate-900 dark:text-white">-{fmtMoney(Math.round(financialBreakdown.mgmt))}</dd>
                  <dt className="text-slate-400 dark:text-white/60 font-medium">{t('shows.table.agency.booking') || 'Booking'} ({financialBreakdown.booking && financialBreakdown.fee ? ((financialBreakdown.booking / financialBreakdown.fee * 100).toFixed(1) + '%') : '0%'})</dt><dd className="text-right tabular-nums font-semibold text-slate-900 dark:text-white">-{fmtMoney(Math.round(financialBreakdown.booking))}</dd>
                  <dt className="text-slate-400 dark:text-white/60 font-medium">{t('shows.editor.summary.costs') || 'Costs'}</dt><dd className="text-right tabular-nums font-semibold text-slate-900 dark:text-white">-{fmtMoney(Math.round(financialBreakdown.totalCosts))}</dd>
                  <dt className="font-bold pt-1 border-t border-slate-200 dark:border-white/10 mt-0.5 text-accent-300">{t('shows.editor.summary.net') || 'Est. Net'}</dt><dd className="text-right tabular-nums font-bold pt-1 border-t border-slate-200 dark:border-white/10 mt-0.5 flex items-center justify-end gap-1.5 text-accent-300">{fmtMoney(Math.round(financialBreakdown.net))}{financialBreakdown.fee > 0 && <span className="px-1.5 py-0.5 rounded-md bg-accent-500/30 border border-accent-500/50 text-accent-200 text-[9px] font-bold" title={t('shows.tooltip.margin') || 'Net divided by Fee (%)'}>{Math.round((financialBreakdown.net / financialBreakdown.fee) * 100)}%</span>}</dd>
                </dl>
              </div>
            </div>
          )}
          {tab === 'costs' && (
            <div className="space-y-3 text-sm max-w-4xl mx-auto" id="panel-costs" role="tabpanel" aria-labelledby="tab-costs">
              <div className="flex flex-wrap items-center gap-1.5 sticky top-0 z-10 glass backdrop-blur px-3 py-1.5 -mx-1 border-b border-slate-200 dark:border-white/10 rounded-t-md">
                <p className="text-xs font-semibold mr-auto flex items-center gap-1.5">
                  <span className="uppercase tracking-wider text-white/80">{t('shows.costs.desc') || 'Costs'}</span>
                  <span className="text-slate-300 dark:text-white/50">({(draft.costs || []).length})</span>
                  {(draft.costs && draft.costs.length > 0) && (
                    <span className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded-md bg-accent-500/20 border border-accent-500/30 tracking-wide font-bold text-accent-300">
                      {fmtMoney((draft.costs || []).reduce((s: number, c: any) => s + (c.amount || 0), 0))}
                    </span>
                  )}
                </p>
                {(draft.costs && draft.costs.length > 1) && (
                  <div className="flex items-center gap-1" aria-label={t('shows.editor.cost.sort') || 'Sort'}>
                    <button type="button" className="px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-[10px] font-medium transition-all" onClick={() => { setDraft((d: ShowDraft) => ({ ...d, costs: [...(d.costs || [])].sort((a, b) => (a.type || '').localeCompare(b.type || '')) })); track(TE.COST_SORT, { by: 'type', direction: 'asc' }); }}>{t('shows.sort.type') || 'Type'}</button>
                    <button type="button" className="px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-[10px] font-medium transition-all" onClick={() => { setDraft((d: ShowDraft) => ({ ...d, costs: [...(d.costs || [])].sort((a, b) => (b.amount || 0) - (a.amount || 0)) })); track(TE.COST_SORT, { by: 'amount', direction: 'desc' }); }}>{t('shows.sort.amount') || 'Amount'}</button>
                  </div>
                )}
                {recentCostTypes.length > 0 && (
                  <div className="hidden md:flex items-center gap-0.5" aria-label={t('shows.editor.cost.recent') || 'Recent cost types'}>
                    {recentCostTypes.slice(0, 3).map(ct => (
                      <button key={ct} type="button" className="px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-[9px] tracking-wide border border-slate-200 dark:border-white/10 transition-all" onClick={() => {
                        const id = crypto.randomUUID();
                        setDraft((d: ShowDraft) => ({ ...d, costs: [...(d.costs || []), { id, type: ct, amount: 0, desc: '' }] }));
                        manualCostAdds.current += 1;
                        setJustAddedCostId(id);
                        setTimeout(() => setJustAddedCostId(null), 1200);
                        track(TE.COST_ADD_QUICK_RECENT, { type: ct });
                      }}>{ct}</button>
                    ))}
                  </div>
                )}
                <button type="button" onClick={() => { setShowBulk(true); track(TE.COST_BULK_OPEN); }} className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-[11px] focus-ring">{t('shows.editor.bulk.open') || 'Bulk add'}</button>
                {/* Cost Templates Popover */}
                <div className="relative" data-cost-template-menu>
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={openTemplateMenu ? 'true' : 'false'}
                    aria-controls="cost-template-popover"
                    onClick={() => setOpenTemplateMenu(o => !o)}
                    onKeyDown={e => {
                      if (e.key === 'ArrowDown' && !openTemplateMenu) { e.preventDefault(); setOpenTemplateMenu(true); requestAnimationFrame(() => document.getElementById('cost-template-item-0')?.focus()); }
                    }}
                    className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 focus-ring"
                  >{t('shows.editor.cost.addTemplate') || 'Add template'}</button>
                  {openTemplateMenu && (
                    <div
                      id="cost-template-popover"
                      role="menu"
                      aria-label={t('shows.editor.cost.templateMenu') || 'Cost templates'}
                      className="absolute z-20 mt-1 -left-4 sm:left-auto sm:right-0 w-56 rounded-md shadow-lg border border-slate-200 dark:border-white/10 backdrop-blur bg-neutral-900/95 p-1 flex flex-col focus-outline"
                    >
                      {COST_TEMPLATES.map((tpl, idx) => (
                        <button
                          key={tpl.id}
                          id={`cost-template-item-${idx}`}
                          type="button"
                          role="menuitem"
                          className="text-left px-2 py-1 rounded text-[11px] hover:bg-slate-200 dark:bg-white/10 focus:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 focus:outline-none flex flex-col gap-0.5"
                          onClick={() => { applyCostTemplate(tpl); }}
                          onKeyDown={e => {
                            if (e.key === 'Escape') { e.stopPropagation(); setOpenTemplateMenu(false); (e.currentTarget.closest('[data-cost-template-menu]') as HTMLElement)?.querySelector('button')?.focus(); }
                            else if (e.key === 'ArrowDown') { e.preventDefault(); (document.getElementById(`cost-template-item-${idx + 1}`) || document.getElementById('cost-template-item-0'))?.focus(); }
                            else if (e.key === 'ArrowUp') { e.preventDefault(); (document.getElementById(`cost-template-item-${idx - 1}`) || document.getElementById(`cost-template-item-${COST_TEMPLATES.length - 1}`))?.focus(); }
                            else if (e.key === 'Tab') { setOpenTemplateMenu(false); }
                          }}
                        >
                          <span className="font-medium leading-tight">{tpl.label}</span>
                          <span className="opacity-60 line-clamp-2 leading-tight">{tpl.items.map(i => i.desc || i.type).join(', ')}</span>
                        </button>
                      ))}
                      <div className="mt-1 pt-1 border-t border-slate-200 dark:border-white/10 flex">
                        <button
                          type="button"
                          className="flex-1 text-[10px] uppercase tracking-wide px-2 py-1 rounded hover:bg-slate-100 dark:bg-white/5 text-accent-300"
                          onClick={() => { setOpenTemplateMenu(false); track(TE.COST_TEMPLATE_DISMISS); }}
                        >{t('common.close') || 'Close'}</button>
                      </div>
                    </div>
                  )}
                </div>
                {(draft.costs && draft.costs.length > 0) && (
                  <button type="button" className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-white/10" onClick={() => setDraft((d: ShowDraft) => ({ ...d, costs: [] }))}>{t('filters.clear') || 'Clear'}</button>
                )}
              </div>
              {/* Subtotals sticky below toolbar */}
              {draft.costs && draft.costs.length > 0 && (() => {
                const entries = Object.entries(costGroups).sort((a, b) => a[0].localeCompare(b[0]));
                const total = entries.reduce((s: number, [, v]: [string, any]) => s + v.total, 0);
                return (
                  <div className="sticky top-[42px] z-10 bg-ink-900/85 backdrop-blur -mx-1 px-1.5 py-1 border-b border-slate-100 dark:border-white/5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px]">
                    <span className="uppercase tracking-wide opacity-60">{t('shows.editor.cost.subtotals') || 'Subtotals'}:</span>
                    {entries.map(([k, v]: [string, any]) => <span key={k} className="whitespace-nowrap flex items-center gap-0.5">{k}: <strong className="tabular-nums">{fmtMoney(v.total)}</strong>{v.count > 1 && <span className="px-0.5 rounded bg-slate-100 dark:bg-white/5 text-[8px] border border-white/10" aria-label={t('shows.editor.cost.items') || 'Items'} title={t('shows.editor.cost.items') || 'Items'}>{v.count}</span>}</span>)}
                    <span className="ml-auto whitespace-nowrap">{t('shows.editor.summary.costs') || 'Costs'}: <strong className="tabular-nums">{fmtMoney(total)}</strong></span>
                  </div>
                );
              })()}
              <div className="grid gap-1.5 mt-0.5">
                {(draft.costs || []).map((c: any, idx: number, arr: any[]) => {
                  const isFirst = idx === 0;
                  const isLast = idx === arr.length - 1;
                  return (
                    <fieldset key={c.id} className="flex flex-col gap-1 sm:flex-row sm:items-center rounded-md glass p-2 border border-slate-200 dark:border-white/10 focus-within:border-accent-500/50 hover:border-slate-300 dark:hover:border-white/20 transition-all group" aria-label={c.type || t('shows.costs.type') || 'Cost'}>
                      <div className="flex flex-1 gap-1.5">
                        <input
                          list="cost-type-suggestions"
                          className="px-3 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/30 focus:border-accent-500/50 flex-1 focus-ring transition-all text-xs"
                          placeholder={t('shows.costs.type') || 'Type'}
                          value={c.type || ''}
                          data-cost-id={c.id}
                          data-cost-field="type"
                          onKeyDown={e => {
                            if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); moveCost(c.id, e.key === 'ArrowUp' ? 'up' : 'down', 'type'); }
                          }}
                          onChange={e => setDraft((d: ShowDraft) => { track(TE.COST_UPDATE, { id: c.id, field: 'type' }); recordCostType(e.target.value); return ({ ...d, costs: (d.costs || []).map(cc => cc.id === c.id ? { ...cc, type: e.target.value } : cc) }); })}
                        />
                        <input
                          type="number"
                          className="px-3 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/30 focus:border-accent-500/50 w-24 text-right focus-ring tabular-nums transition-all text-xs font-semibold"
                          placeholder={t('shows.costs.amount') || 'Amount'}
                          value={c.amount ?? 0}
                          data-cost-id={c.id}
                          data-cost-field="amount"
                          onKeyDown={e => {
                            if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); moveCost(c.id, e.key === 'ArrowUp' ? 'up' : 'down', 'amount'); }
                          }}
                          onChange={e => setDraft((d: ShowDraft) => { track(TE.COST_UPDATE, { id: c.id, field: 'amount' }); return ({ ...d, costs: (d.costs || []).map(cc => cc.id === c.id ? { ...cc, amount: e.target.value === '' ? 0 : Number(e.target.value) } : cc) }); })}
                        />
                      </div>
                      <input
                        className="px-3 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/30 focus:border-accent-500/50 flex-1 focus-ring transition-all text-xs"
                        placeholder={t('shows.costs.desc') || 'Description'}
                        value={c.desc || ''}
                        data-cost-id={c.id}
                        data-cost-field="desc"
                        onKeyDown={e => {
                          if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); moveCost(c.id, e.key === 'ArrowUp' ? 'up' : 'down', 'desc'); }
                        }}
                        onChange={e => setDraft((d: ShowDraft) => { track(TE.COST_UPDATE, { id: c.id, field: 'desc' }); return ({ ...d, costs: (d.costs || []).map(cc => cc.id === c.id ? { ...cc, desc: e.target.value } : cc) }); })}
                      />
                      <div className="flex items-center gap-1 self-start sm:self-center">
                        <button
                          type="button"
                          aria-label={t('shows.editor.cost.duplicate') || 'Duplicate'}
                          className="px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/15 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-[11px] font-medium transition-all"
                          onClick={() => duplicateCost(c.id)}
                        >{t('shows.editor.cost.duplicate') || 'Dup'}</button>
                        <button
                          type="button"
                          aria-label={t('shows.editor.cost.moveUp') || 'Move up'}
                          className="p-1 rounded-md bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/15 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 disabled:opacity-40 transition-all"
                          disabled={isFirst}
                          onClick={() => moveCost(c.id, 'up')}
                        ><ArrowUpIcon /></button>
                        <button
                          type="button"
                          aria-label={t('shows.editor.cost.moveDown') || 'Move down'}
                          className="p-1 rounded-md bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/15 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 disabled:opacity-40 transition-all"
                          disabled={isLast}
                          onClick={() => moveCost(c.id, 'down')}
                        ><ArrowDownIcon /></button>
                        <button
                          type="button"
                          aria-label={t('shows.table.remove') || 'Remove'}
                          className="px-2 py-1 rounded-md bg-red-600/30 hover:bg-red-600/50 border border-red-500/30 hover:border-red-500/50 text-red-100 font-bold text-base leading-none transition-all"
                          onClick={() => setDraft((d: ShowDraft) => { track(TE.COST_REMOVE, { id: c.id }); return ({ ...d, costs: (d.costs || []).filter(cc => cc.id !== c.id) }); })}
                        >&times;</button>
                      </div>
                    </fieldset>
                  );
                })}
                <datalist id="cost-type-suggestions">
                  {recentCostTypes.map(ct => <option key={'recent-' + ct} value={ct} />)}
                  {/* Static fallbacks */}
                  {['Travel', 'Production', 'Marketing', 'Hospitality', 'Promo', 'Logistics'].filter(x => !recentCostTypes.includes(x)).map(x => <option key={x} value={x} />)}
                </datalist>
                <button
                  type="button"
                  className="mt-1.5 px-3 py-1.5 rounded-md bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/30 hover:border-accent-500/50 text-xs font-semibold text-accent-300 hover:text-accent-200 transition-all w-fit flex items-center gap-1"
                  onClick={() => setDraft((d: ShowDraft) => { const id = crypto.randomUUID(); track(TE.COST_ADD, { id }); manualCostAdds.current += 1; return ({ ...d, costs: [...(d.costs || []), { id, type: '', amount: 0, desc: '' }] }); })}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('common.add') || 'Add'} {t('shows.costs.type') || 'Cost'}
                </button>
              </div>
              {(!draft.costs || draft.costs.length === 0) && (
                <div className="text-[10px] opacity-60 border border-dashed border-white/15 rounded-md p-3 text-center space-y-0.5">
                  <p>{t('shows.noCosts') || 'No costs yet'}</p>
                  <p className="opacity-70">{t('shows.editor.cost.empty.hint') || 'Add individual lines or use templates / bulk import.'}</p>
                </div>
              )}
            </div>
          )}
          <button type="submit" className="hidden" aria-hidden="true" />
        </form>
        {showBulk && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-40" role="dialog" aria-modal="true" aria-labelledby="bulk-title" aria-describedby="bulk-help" onMouseDown={e => { if (e.target === e.currentTarget) setShowBulk(false); }}>
            <div className="glass rounded-md p-3 w-[640px] max-h-[75vh] overflow-y-auto animate-scale-in space-y-2.5 text-sm" onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); setShowBulk(false); } }}>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <h2 id="bulk-title" tabIndex={-1} className="text-sm font-semibold">{t('shows.editor.bulk.title') || 'Bulk add costs'}</h2>
                  <p id="bulk-help" className="text-[9px] opacity-70 max-w-prose">{t('shows.editor.bulk.help') || 'Paste CSV or tab lines: Type, Amount, Description'}</p>
                </div>
                <button type="button" aria-label={t('common.close') || 'Close'} className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/15 text-sm leading-none" onClick={() => setShowBulk(false)}>×</button>
              </div>
              <textarea
                ref={bulkTextAreaRef}
                value={bulkRaw}
                onChange={e => setBulkRaw(e.target.value)}
                placeholder={t('shows.editor.bulk.placeholder') || 'Type, Amount, Desc'}
                className="w-full h-28 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-white/5 border border-white/15 focus-ring font-mono text-[10px] resize-vertical"
              />
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span>{bulkParsed.length ? (t('shows.editor.bulk.parsed') || '{count} lines').replace('{count}', String(bulkParsed.length)) : (t('shows.editor.bulk.empty') || 'No valid lines')}</span>
                  {bulkParsed.length > 0 && <span className="opacity-60">{t('shows.editor.bulk.preview') || 'Preview'}</span>}
                </div>
                {bulkParsed.length > 0 && (
                  <div className="max-h-48 overflow-auto rounded border border-white/10">
                    <table className="w-full text-[9px]">
                      <thead className="bg-slate-100 dark:bg-white/5 sticky top-0">
                        <tr>
                          <th className="text-left px-2 py-0.5 w-10 opacity-60">#</th>
                          <th className="text-left px-2 py-0.5 opacity-60">{t('shows.costs.type') || 'Type'}</th>
                          <th className="text-left px-2 py-0.5 opacity-60">{t('shows.costs.amount') || 'Amount'}</th>
                          <th className="text-left px-2 py-0.5 opacity-60">{t('shows.costs.desc') || 'Description'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkParsed.map(r => (
                          <tr key={r.line} className={r.amount === 0 && !r.desc ? 'bg-red-600/20' : 'odd:bg-white/2'}>
                            <td className="px-2 py-0.5 tabular-nums opacity-60">{r.line}</td>
                            <td className="px-2 py-0.5">{r.type}</td>
                            <td className="px-2 py-0.5 tabular-nums">{r.amount || ''}</td>
                            <td className="px-2 py-0.5">{r.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-1.5">
                <button type="button" className="px-3 py-1 rounded text-sm bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/15" onClick={() => setShowBulk(false)}>{t('shows.editor.bulk.cancel') || 'Cancel'}</button>
                <button
                  type="button"
                  disabled={bulkParsed.length === 0}
                  onClick={() => {
                    if (bulkParsed.length === 0) return;
                    setDraft((d: ShowDraft) => ({ ...d, costs: [...(d.costs || []), ...bulkParsed.map(b => ({ id: crypto.randomUUID(), type: b.type, amount: b.amount, desc: b.desc }))] }));
                    bulkParsed.forEach(b => recordCostType(b.type));
                    track(TE.COST_BULK_ADD, { count: bulkParsed.length });
                    announce((t('shows.editor.bulk.add') || 'Add costs') + ': ' + bulkParsed.length, 'polite');
                    setShowBulk(false);
                  }}
                  className={`px-3 py-1 rounded text-sm font-medium ${bulkParsed.length ? 'bg-accent-500 text-black hover:brightness-110' : 'bg-white/5 opacity-40 cursor-not-allowed'}`}
                >{t('shows.editor.bulk.add') || 'Add costs'}</button>
              </div>
            </div>
          </div>
        )}
        {/* Footer with enhanced clarity and visual hierarchy */}
        <div className="relative border-t border-[var(--card-border,white/10)] px-4 py-1.5 flex items-center justify-between gap-2 flex-shrink-0 bg-gradient-to-r from-white/1 via-white/0.5 to-white/1">
          {/* Decorative top border glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-500/30 to-transparent"></div>

          {/* Delete button - left side (edit mode only) */}
          <div className="flex items-center gap-1.5">
            {mode === 'edit' && (
              <button
                type="button"
                className="px-3 py-1.5 rounded-md bg-red-500/15 border border-red-500/40 text-red-200 font-medium text-xs transition-all duration-200 hover:bg-red-500/25 hover:border-red-500/60 hover:text-red-100 hover:shadow-lg hover:shadow-red-500/25 active:scale-95"
                onClick={() => { setShowDelete(true); deleteCount.current += 1; }}
              >
                {t('shows.dialog.delete') || 'Delete'}
              </button>
            )}
          </div>

          {/* Action buttons - right side */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Cancel button - secondary action */}
            <button
              type="button"
              className="px-3 py-1.5 rounded-md bg-white/8 border border-white/15 text-white/80 font-medium text-xs transition-all duration-200 hover:bg-white/12 hover:border-white/25 hover:text-white active:scale-95"
              onClick={requestClose}
            >
              {t('shows.dialog.cancel') || 'Cancel'}
            </button>

            {/* Save button - primary action */}
            <button
              type="button"
              disabled={!isValid || saving === 'saving'}
              aria-busy={saving === 'saving'}
              className="px-3.5 py-1.5 rounded-md bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold text-xs transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/40 hover:brightness-110 disabled:opacity-60 disabled:hover:shadow-none disabled:hover:brightness-100 active:scale-95 flex items-center gap-1.5"
              onClick={() => attemptSave()}
            >
              {saving === 'saving' ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('shows.editor.saving') || 'Saving…'}</span>
                </>
              ) : saving === 'saved' ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  <span>{t('shows.editor.saved') || 'Saved'}</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{mode === 'add' ? (t('shows.editor.save.create') || 'Create') : (t('shows.editor.save.edit') || 'Save')}</span>
                </>
              )}
            </button>
          </div>
        </div>
        {/* Discard dialog */}
        {/* Focus trap end sentinel */}
        <div tabIndex={0} aria-hidden="true" onFocus={() => {
          const focusables = drawerRef.current?.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
          if (focusables && focusables.length > 0) {
            const firstFocusable = focusables[0];
            firstFocusable?.focus();
          }
        }} />
        {showDiscard && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="discard-title" aria-describedby="discard-desc">
            <div className="glass rounded-md p-4 w-[340px] text-sm space-y-3 animate-scale-in" ref={el => {
              if (el) {
                const first = el.querySelector<HTMLElement>('button');
                first?.focus();
              }
            }}>
              <h4 id="discard-title" className="font-semibold text-sm">{t('shows.editor.discard.title') || 'Discard changes?'}</h4>
              <p id="discard-desc" className="opacity-80 text-xs">{t('shows.editor.discard.body') || 'You have unsaved changes. They will be lost.'}</p>
              <div className="flex justify-end gap-1.5">
                <button className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 font-medium text-xs transition-all" onClick={() => { setShowDiscard(false); track(TE.DISCARD_CANCEL); }}>{t('shows.editor.discard.cancel') || 'Keep editing'}</button>
                <button className="px-3 py-1.5 rounded-md bg-red-600/90 hover:bg-red-600 border border-red-500/50 hover:border-red-400 hover:scale-[1.02] active:scale-[0.98] font-semibold text-xs transition-all" onClick={() => { setShowDiscard(false); track(TE.DISCARD_CONFIRM); discardSavedDraft(); onRequestClose(); const msg = t('shows.editor.toast.discarded') || 'Changes discarded'; announce(msg, 'polite'); toast.info(msg); }}>{t('shows.editor.discard.confirm') || 'Discard'}</button>
              </div>
            </div>
          </div>
        )}
        {showDelete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 animate-fade-in" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-desc">
            <div className="glass rounded-md p-4 w-[340px] text-sm space-y-3 animate-scale-in" ref={el => { if (el) { el.querySelector<HTMLElement>('button')?.focus(); } }}>
              <h4 id="delete-title" className="font-semibold text-sm">{t('shows.editor.delete.confirmTitle') || 'Delete show?'}</h4>
              <p id="delete-desc" className="opacity-80 text-xs">{t('shows.editor.delete.confirmBody') || 'This action cannot be undone.'}</p>
              <div className="flex justify-end gap-1.5">
                <button className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 font-medium text-xs transition-all" onClick={() => { setShowDelete(false); track(TE.DELETE_CANCEL); }}>{t('shows.editor.delete.cancel') || 'Cancel'}</button>
                <button className="px-3 py-1.5 rounded-md bg-red-600/90 hover:bg-red-600 border border-red-500/50 hover:border-red-400 hover:scale-[1.02] active:scale-[0.98] font-semibold text-xs transition-all" onClick={() => {
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
                }}>{t('shows.editor.delete.confirm') || 'Delete'}</button>
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
            aria-label={t('shows.editor.toast.deleted') || 'Deleted'}
            className="absolute bottom-[70px] right-3 z-[11005] bg-slate-800/95 border border-slate-400/30 rounded-md px-3 py-1.5 flex items-center gap-2 text-xs shadow-glow animate-fade-in"
            onMouseEnter={() => {
              setPendingDelete(p => {
                if (!p || p.paused) return p;
                if (p.timer) clearTimeout(p.timer);
                const remaining = Math.max(0, p.deadline - Date.now());
                return { ...p, timer: null, remaining, paused: true };
              });
            }}
            onMouseLeave={() => {
              setPendingDelete(p => {
                if (!p || !p.paused) return p;
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
            <span className="leading-tight">{t('shows.editor.toast.deleted') || 'Deleted'}</span>
            <button
              type="button"
              className="px-1.5 py-0.5 rounded-sm bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/20 font-medium text-[10px]"
              onClick={() => {
                setPendingDelete(p => {
                  if (p?.timer) clearTimeout(p.timer);
                  return null;
                });
                onRestore?.();
                undoDeletesRef.current += 1;
                // Telemetry: explicit undo click event (aliased for legacy dashboard)
                track(TE.DELETE_UNDO);
                track(TE.UNDO_CLICK, { id: initial.id });
                toast.success(t('shows.editor.toast.restored') || 'Restored');
                announce(t('shows.editor.toast.restored') || 'Restored', 'polite');
              }}
            >{t('shows.editor.toast.undo') || 'Undo'}</button>
            <button
              aria-label={t('common.close') || 'Close'}
              className="opacity-70 hover:opacity-100"
              onClick={() => {
                setPendingDelete(p => {
                  if (p?.timer) clearTimeout(p.timer);
                  return null;
                });
                // User dismissed; do not delete yet (explicit choice). Keep item.
              }}
            >×</button>
          </div>
        )}
        {/* Local toast stack removed; using global ToastProvider */}
      </div>
      </div>
    </>
  );

  return createPortal(portal, document.body);
};

export default ShowEditorDrawer;
