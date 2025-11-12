// Shows page – definitive clean implementation with NATIVE drag & drop
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useShows } from '../../hooks/useShows';
import { useSettings } from '../../context/SettingsContext';
import { useDebounce } from '../../lib/performance';
import { DemoShow, type Show } from '../../lib/shows';
import { regionOf } from '../../features/shows/selectors';
import { t } from '../../lib/i18n';
import { loadShowsPrefs, saveShowsPrefs } from '../../lib/showsPrefs';
import { trackEvent } from '../../lib/telemetry';
import { announce } from '../../lib/announcer';
import { Chip } from '../../ui/Chip';
import StatusBadge from '../../ui/StatusBadge';
import { useToast } from '../../ui/Toast';
import ShowEditorDrawer from '../../features/shows/editor/ShowEditorDrawer';
import GuardedAction from '../../components/common/GuardedAction';
import { countryLabel } from '../../lib/countries';
import { exportShowsCsv, exportShowsXlsx } from '../../lib/shows/export';
import { can } from '../../lib/tenants';
import { AnimatedButton } from '../../components/common/animations';
import { useAuth } from '../../context/AuthContext';
import { trackPageView } from '../../lib/activityTracker';
import { logger } from '../../lib/logger';
import { agenciesForShow, computeCommission } from '../../lib/agencies';

// Extended types for Shows with optional fields
type Cost = { id: string; type: string; amount: number; desc?: string };
type ShowWithExtras = Show & { 
  venue?: string; 
  whtPct?: number; 
  mgmtAgency?: string; 
  bookingAgency?: string; 
  notes?: string; 
  costs?: Cost[];
  createdAt?: string;
  archivedAt?: string;
};

export type DraftShow = DemoShow & { 
  venue?: string; 
  venueId?: string; 
  promoter?: string; 
  promoterId?: string; 
  whtPct?: number; 
  mgmtAgency?: string; 
  bookingAgency?: string; 
  notes?: string; 
  costs?: Cost[] 
};
type ViewMode = 'list' | 'board';
type SortKey = 'date' | 'fee' | 'net';

const Shows: React.FC = () => {
  const { shows, add, update, remove } = useShows();
  const { fmtMoney, lang, bookingAgencies, managementAgencies } = useSettings();
  const { userId } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const boot = useMemo<any>(() => { try { return loadShowsPrefs(); } catch { return {}; } }, []);

  // state
  const [qInput, setQInput] = useState('');
  const q = useDebounce(qInput, 120);
  const [view, setView] = useState<ViewMode>(() => boot.view || 'board');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>(() => boot.dateRange || { from: '', to: '' });
  const [region, setRegion] = useState<'all' | 'AMER' | 'EMEA' | 'APAC'>(() => boot.region || 'all');
  const [feeRange, setFeeRange] = useState<{ min?: number; max?: number }>(() => boot.feeRange || {});
  const [statusOn, setStatusOn] = useState<Record<'confirmed' | 'pending' | 'offer' | 'canceled' | 'archived' | 'postponed', boolean>>(() => boot.statusOn || { confirmed: true, pending: true, offer: true, canceled: false, archived: true, postponed: true });
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>(() => boot.sort || { key: 'date', dir: 'desc' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<DemoShow['status']>('confirmed');
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportCols, setExportCols] = useState<Record<string, boolean>>({ 'Date': true, 'City': true, 'Country': true, 'Venue': true, 'WHT %': true, 'Fee': true, 'Net': true, 'Status': true, 'Notes': true });
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [draft, setDraft] = useState<DraftShow | null>(null);
  const [costs, setCosts] = useState<Cost[]>([]);
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const [whtVisible, setWhtVisible] = useState<boolean>(() => boot.whtVisible ?? true);
  const [totalsVisible, setTotalsVisible] = useState<boolean>(() => boot.totalsVisible ?? true);
  const [totalsPinned, setTotalsPinned] = useState<boolean>(() => boot.totalsPinned ?? false);
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
  const [quickFilter, setQuickFilter] = useState<'all' | 'upcoming' | 'thisMonth' | 'highValue'>('all');
  const [statsVisible, setStatsVisible] = useState<boolean>(() => boot.statsVisible ?? false);

  // Native HTML5 Drag & Drop state (much faster than @dnd-kit)
  const [draggedShow, setDraggedShow] = useState<DemoShow | null>(null);
  const [dropTargetStatus, setDropTargetStatus] = useState<string | null>(null);

  // persist prefs
  useEffect(() => { saveShowsPrefs({ view }); }, [view]);
  useEffect(() => { saveShowsPrefs({ dateRange }); }, [dateRange]);
  useEffect(() => { saveShowsPrefs({ region }); }, [region]);
  useEffect(() => { saveShowsPrefs({ feeRange }); }, [feeRange.min, feeRange.max]);
  useEffect(() => { saveShowsPrefs({ statusOn }); }, [statusOn]);
  useEffect(() => { saveShowsPrefs({ sort }); }, [sort]);
  useEffect(() => { saveShowsPrefs({ whtVisible }); }, [whtVisible]);
  useEffect(() => { saveShowsPrefs({ totalsVisible }); }, [totalsVisible]);
  useEffect(() => { saveShowsPrefs({ totalsPinned }); }, [totalsPinned]);

  // telemetry
  useEffect(() => { if (q) trackEvent('shows.search', { qLen: q.length }); }, [q]);

  // activity tracking
  useEffect(() => {
    trackPageView('shows', { viewMode: view });
  }, [userId, view]);

  // filtering
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let result = shows.filter(x => {
      // Filter to only show real Shows (not Personal, Meeting, etc. events stored as Shows)
      const xShow = x as ShowWithExtras;
      const btnType = xShow.notes?.match(/__btnType:(\w+)/)?.[1];
      if (btnType && btnType !== 'show') return false; // Skip non-show events

      if (!statusOn[x.status as keyof typeof statusOn]) return false;
      if (dateRange.from || dateRange.to) {
        const d = new Date(x.date).getTime();
        if (dateRange.from) { const fromTs = new Date(dateRange.from).getTime(); if (Number.isFinite(fromTs) && d < fromTs) return false; }
        if (dateRange.to) { const toTs = new Date(dateRange.to + 'T23:59:59').getTime(); if (Number.isFinite(toTs) && d > toTs) return false; }
      }
      if (region !== 'all' && regionOf(x.country) !== region) return false;
      if (typeof feeRange.min === 'number' && x.fee < feeRange.min) return false;
      if (typeof feeRange.max === 'number' && x.fee > feeRange.max) return false;
      if (!s) return true;
      const searchShow = x as ShowWithExtras;
      const notes = String(searchShow.notes || '').toLowerCase();
      const venue = String(searchShow.venue || '').toLowerCase();
      return x.city.toLowerCase().includes(s) || x.country.toLowerCase().includes(s) || venue.includes(s) || notes.includes(s);
    });

    // Quick filters
    if (quickFilter !== 'all') {
      const now = new Date();
      const nowTs = now.getTime();

      if (quickFilter === 'upcoming') {
        const next30Days = nowTs + (30 * 24 * 60 * 60 * 1000);
        result = result.filter(x => {
          const showTs = new Date(x.date).getTime();
          return showTs >= nowTs && showTs <= next30Days;
        });
      } else if (quickFilter === 'thisMonth') {
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        result = result.filter(x => {
          const showDate = new Date(x.date);
          return showDate.getMonth() === currentMonth && showDate.getFullYear() === currentYear;
        });
      } else if (quickFilter === 'highValue') {
        // High value = fee above average
        const avgFee = result.length > 0 ? result.reduce((sum, x) => sum + x.fee, 0) / result.length : 0;
        result = result.filter(x => x.fee >= avgFee && avgFee > 0);
      }
    }

    return result;
  }, [shows, q, statusOn, dateRange.from, dateRange.to, region, feeRange.min, feeRange.max, quickFilter]);

  // counts per status under current non-status filters (so counts unaffected by turning status chips off show potential totals)
  const statusCounts = useMemo(() => {
    const base = shows.filter(x => {
      // Filter to only show real Shows (not Personal, Meeting, etc. events stored as Shows)
      const show = x as ShowWithExtras;
      const btnType = show.notes?.match(/__btnType:(\w+)/)?.[1];
      if (btnType && btnType !== 'show') return false; // Skip non-show events

      // exclude status gating; reuse other filters only
      if (dateRange.from || dateRange.to) {
        const d = new Date(x.date).getTime();
        if (dateRange.from) { const fromTs = new Date(dateRange.from).getTime(); if (Number.isFinite(fromTs) && d < fromTs) return false; }
        if (dateRange.to) { const toTs = new Date(dateRange.to + 'T23:59:59').getTime(); if (Number.isFinite(toTs) && d > toTs) return false; }
      }
      if (region !== 'all' && regionOf(x.country) !== region) return false;
      if (typeof feeRange.min === 'number' && x.fee < feeRange.min) return false;
      if (typeof feeRange.max === 'number' && x.fee > feeRange.max) return false;
      const s = q.trim().toLowerCase();
      if (!s) return true;
      const notes = String(show.notes || '').toLowerCase();
      const venue = String(show.venue || '').toLowerCase();
      return x.city.toLowerCase().includes(s) || x.country.toLowerCase().includes(s) || venue.includes(s) || notes.includes(s);
    });
    const counts: Record<string, number> = { confirmed: 0, pending: 0, offer: 0, canceled: 0, archived: 0, postponed: 0 };
    base.forEach(b => { counts[b.status] = (counts[b.status] || 0) + 1; });
    return counts;
  }, [shows, q, dateRange.from, dateRange.to, region, feeRange.min, feeRange.max]);

  // rows + net
  const rows = useMemo(() => {
    const calcNet = (s: Show) => {
      const show = s as ShowWithExtras;
      const whtPct = show.whtPct || 0;
      const wht = s.fee * (whtPct / 100);

      // Calculate agency commissions dynamically - only for selected agencies
      let agencyCommission = 0;
      try {
        const selectedAgencies = [];
        if (s.mgmtAgency) {
          const mgmt = managementAgencies.find(a => a.name === s.mgmtAgency);
          if (mgmt) selectedAgencies.push(mgmt);
        }
        if (s.bookingAgency) {
          const booking = bookingAgencies.find(a => a.name === s.bookingAgency);
          if (booking) selectedAgencies.push(booking);
        }
        if (selectedAgencies.length > 0) {
          agencyCommission = computeCommission(s, selectedAgencies);
        }
      } catch (e) {
        console.error('[Shows] Error calculating agency commission:', e);
      }

      const costsTotal = (show.costs || []).reduce((n: number, c: Cost) => n + (c.amount || 0), 0);
      return s.fee - wht - agencyCommission - costsTotal;
    };
    const r = filtered.map(s => ({ s, net: calcNet(s) }));
    const dir = sort.dir === 'asc' ? 1 : -1;
    r.sort((a, b) => {
      if (sort.key === 'date') return (new Date(a.s.date).getTime() - new Date(b.s.date).getTime()) * dir;
      if (sort.key === 'fee') return (a.s.fee - b.s.fee) * dir;
      if (sort.key === 'net') return (a.net - b.net) * dir;
      return 0;
    });
    return r;
  }, [filtered, sort, bookingAgencies, managementAgencies]);

  // virtualization
  const parentRef = useRef<HTMLDivElement>(null);
  const enableVirtual = rows.length > 100; // Lowered threshold from 200
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 15 // Increased from 8 for smoother scrolling
  });
  const virtualItems = enableVirtual ? virtualizer.getVirtualItems() : [];
  const topSpacer = enableVirtual && virtualItems[0] ? virtualItems[0].start : 0;
  const lastVirtualItem = virtualItems[virtualItems.length - 1];
  const bottomSpacer = enableVirtual && virtualItems.length && lastVirtualItem ? (virtualizer.getTotalSize() - lastVirtualItem.end) : 0;
  const visibleRows = enableVirtual ? virtualItems.map(v => rows[v.index]).filter((r): r is NonNullable<typeof r> => r != null) : rows;
  const allVisibleSelected = visibleRows.length > 0 && visibleRows.every(r => r && selected.has(r.s.id));

  // metrics (totals + averages)
  const { totalFee, totalNet, avgWht, avgFee, avgMarginPct } = useMemo(() => {
    if (!rows.length) return { totalFee: 0, totalNet: 0, avgWht: 0, avgFee: 0, avgMarginPct: 0 };
    let fee = 0, net = 0, wSum = 0, marginSum = 0, marginCount = 0;
    for (const r of rows) {
      const show = r.s as ShowWithExtras;
      fee += r.s.fee; net += r.net; wSum += (show.whtPct || 0);
      if (r.s.fee > 0) { const pct = (r.net / r.s.fee) * 100; if (Number.isFinite(pct)) { marginSum += pct; marginCount++; } }
    }
    const avgFeeVal = fee / rows.length;
    const avgMargin = marginCount ? (marginSum / marginCount) : 0;
    return { totalFee: fee, totalNet: net, avgWht: Math.round(wSum / rows.length), avgFee: avgFeeVal, avgMarginPct: Math.round(avgMargin) };
  }, [rows]);

  // board aggregation (offer/pending/confirmed columns)
  const boardStatuses: ('offer' | 'pending' | 'confirmed')[] = ['offer', 'pending', 'confirmed'];
  const boardStats = useMemo(() => {
    const stats: Record<string, { count: number; net: number }> = {};
    for (const st of boardStatuses) stats[st] = { count: 0, net: 0 };
    for (const r of rows) {
      const st = r.s.status;
      if (boardStatuses.includes(st as 'offer' | 'pending' | 'confirmed') && stats[st]) {
        stats[st].count++;
        stats[st].net += r.net;
      }
    }
    return stats;
  }, [rows]);

  // export
  const exportCsv = (selectedOnly?: boolean) => {
    const { count, cols } = exportShowsCsv(rows, exportCols, selectedOnly ? selected : undefined, 'shows');
    trackEvent('shows.csv.export', { count, cols });
    toast.success(t('shows.export.csv.success') || 'Exported ✓');
  };
  const exportXlsx = async (selectedOnly?: boolean) => {
    setExporting(true);
    try {
      const { count, cols } = await exportShowsXlsx(rows, exportCols, selectedOnly ? selected : undefined, 'shows');
      trackEvent('shows.xlsx.export', { count, cols });
      toast.success(t('shows.export.xlsx.success') || 'Exported ✓');
    } catch (e) {
      logger.error('Failed to export shows to XLSX', e as Error, { component: 'Shows', action: 'export_xlsx' });
      toast.error('Export failed');
    } finally { setExporting(false); }
  };

  // bulk
  const toggleSelectOne = (id: string, index?: number, shiftKey?: boolean) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (shiftKey && lastClickedIndex !== null && index !== undefined) {
        // Range selection
        const start = Math.min(lastClickedIndex, index);
        const end = Math.max(lastClickedIndex, index);
        for (let i = start; i <= end; i++) {
          const rowId = visibleRows[i]?.s.id;
          if (rowId) {
            next.add(rowId);
          }
        }
      } else {
        // Single selection
        next.has(id) ? next.delete(id) : next.add(id);
      }
      return next;
    });
    if (index !== undefined) {
      setLastClickedIndex(index);
    }
  };
  const applyBulkStatus = () => {
    for (const id of selected) update(id, { status: bulkStatus });
    const msg = (t('shows.toast.bulk.status') || 'Status: {status} ({n})').replace('{status}', String(bulkStatus)).replace('{n}', String(selected.size));
    toast.show(msg, { tone: 'success' });
    trackEvent('shows.bulk.setStatus', { count: selected.size, status: bulkStatus });
    setSelected(new Set());
  };
  const applyBulkConfirm = () => {
    for (const id of selected) update(id, { status: 'confirmed' });
    const msg = (t('shows.toast.bulk.confirmed') || 'Confirmed ({n})').replace('{n}', String(selected.size));
    toast.show(msg, { tone: 'success' });
    trackEvent('shows.bulk.confirm', { count: selected.size });
    setSelected(new Set());
  };
  const applyBulkWht = (pct: number) => {
    for (const id of selected) update(id, { whtPct: pct });
    const msg = (t('shows.toast.bulk.wht') || 'WHT {pct}% ({n})').replace('{pct}', String(pct)).replace('{n}', String(selected.size));
    toast.show(msg, { tone: 'success' });
    trackEvent('shows.bulk.setWht', { count: selected.size, pct });
    setSelected(new Set());
  };

  // drawer
  const openAdd = () => { 
    lastTriggerRef.current = document.activeElement as HTMLElement; 
    setMode('add'); 
    setDraft({ city: '', country: '', date: new Date().toISOString().slice(0, 10), fee: 5000, lat: 0, lng: 0, status: 'pending', whtPct: 0 } as DraftShow); 
    setCosts([]); 
    setModalOpen(true); 
    announce('Add show'); 
    trackEvent('shows.drawer.open', { mode: 'add' }); 
  };
  const openEdit = (s: Show) => { 
    lastTriggerRef.current = document.activeElement as HTMLElement; 
    setMode('edit'); 
    const show = s as ShowWithExtras;
    setDraft({ ...show }); 
    setCosts(show.costs || []); 
    setModalOpen(true); 
    announce('Edit show: ' + s.city); 
    trackEvent('shows.drawer.open', { mode: 'edit' }); 
  };
  const closeDrawer = () => { setModalOpen(false); trackEvent('shows.drawer.close'); try { lastTriggerRef.current?.focus(); } catch { } if (searchParams.get('add') || searchParams.get('edit')) navigate('/dashboard/shows', { replace: true }); };
  const saveDraft = (d: DraftShow) => { 
    if (mode === 'add') { 
      const id = (() => { try { return crypto.randomUUID(); } catch { return 's' + Date.now(); } })(); 
      // Cast to ShowWithExtras to allow costs property - use d.costs from draft
      add({ ...d, id, costs: d.costs || [] } as ShowWithExtras); 
    } else if (mode === 'edit' && d.id) { 
      // Use d.costs from draft to ensure all fields are preserved
      update(d.id, { ...d, costs: d.costs || [] } as ShowWithExtras); 
    } 
    announce('Saved'); 
    trackEvent('shows.drawer.save', { mode }); 
  };
  const deleteDraft = (d: DraftShow) => { if (mode === 'edit' && d.id) { remove(d.id); trackEvent('shows.drawer.delete'); } };

  // deep link
  useEffect(() => { const addFlag = searchParams.get('add'); if (addFlag === '1') openAdd(); }, [searchParams]);
  useEffect(() => { const id = searchParams.get('edit'); if (!id) return; const f = shows.find(s => s.id === id); f ? openEdit(f) : navigate('/dashboard/shows', { replace: true }); }, [searchParams, shows]);

  const clearFilters = useCallback(() => {
    setQInput('');
    setDateRange({ from: '', to: '' });
    setRegion('all');
    setFeeRange({});
    setStatusOn({ confirmed: true, pending: true, offer: true, canceled: false, archived: true, postponed: true });
    announce('Filters cleared');
    trackEvent('shows.filter.clear');
  }, []);

  // Native HTML5 Drag & Drop handlers (MUCH faster than @dnd-kit)
  const handleNativeDragStart = useCallback((show: Show) => (e: React.DragEvent) => {
    setDraggedShow(show);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', show.id);
    // Set a custom drag image that's smaller and faster
    if (e.dataTransfer.setDragImage) {
      const dragImage = document.createElement('div');
      dragImage.textContent = show.name || show.city;
      dragImage.style.cssText = 'position: absolute; top: -9999px; padding: 8px 12px; background: rgba(99, 102, 241, 0.95); color: white; border-radius: 8px; font-size: 12px; font-weight: 600;';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  }, []);

  const handleNativeDragOver = useCallback((status: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetStatus(status);
  }, []);

  const handleNativeDragLeave = useCallback(() => {
    setDropTargetStatus(null);
  }, []);

  const handleNativeDrop = useCallback((newStatus: Show['status']) => (e: React.DragEvent) => {
    e.preventDefault();
    setDropTargetStatus(null);

    if (!draggedShow) return;

    if (draggedShow.status !== newStatus) {
      update(draggedShow.id, { status: newStatus });
      toast.show(`Moved to ${newStatus}`, { tone: 'success' });
      trackEvent('shows.dragDrop.status', { from: draggedShow.status, to: newStatus });
    }

    setDraggedShow(null);
  }, [draggedShow, update, toast]);

  const handleNativeDragEnd = useCallback(() => {
    setDraggedShow(null);
    setDropTargetStatus(null);
  }, []);

  return (
    <>
      <motion.div
        animate={{
          scale: modalOpen ? 0.96 : 1,
          filter: modalOpen ? 'blur(0.5px) brightness(0.95)' : 'blur(0px) brightness(1)',
          y: modalOpen ? -8 : 0,
        }}
        transition={{
          duration: 0.4,
          ease: 'easeOut',
          filter: { duration: 0.3 }
        }}
        className="max-w-[1400px] ml-2 md:ml-3 space-y-6"
      >
        {/* Header - Improved Design */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {selected.size > 0 ? (
              <>
                <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent-500">{selected.size}</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-theme-primary">
                    {selected.size} {t('shows.selected') || 'selected'}
                  </h2>
                  <button
                    className="text-xs text-theme-secondary hover:text-accent-500 transition-colors"
                    onClick={() => setSelected(new Set())}
                  >
                    {t('common.clear') || 'Clear selection'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-blue-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-theme-primary">{t('shows.title') || 'Shows'}</h2>
                  <p className="text-sm text-slate-300 dark:text-white/50">{filtered.length} {filtered.length === 1 ? (t('shows.count.singular') || 'show') : (t('shows.count.plural') || 'shows')}</p>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center relative">
            {selected.size > 0 ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 text-sm font-medium"
                  onClick={applyBulkConfirm}
                >
                  <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('shows.bulk.confirm') || 'Confirm'}
                </motion.button>
                <div className="flex items-center gap-2 glass px-3 py-2 rounded-lg border border-theme">
                  <label className="text-xs text-theme-secondary">{t('shows.bulk.setStatus') || 'Status'}:</label>
                  <select className="bg-interactive-hover rounded px-2 py-1 text-xs border border-slate-200 dark:border-white/10 focus:border-accent-500/50 focus:outline-none" value={bulkStatus} onChange={e => setBulkStatus(e.target.value as Show['status'])}>
                    <option value="offer">offer</option>
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="canceled">canceled</option>
                    <option value="archived">archived</option>
                    <option value="postponed">postponed</option>
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1 rounded bg-accent-500/20 hover:bg-accent-500/30 text-accent-500 text-xs font-medium"
                    onClick={applyBulkStatus}
                  >
                    {t('shows.bulk.apply') || 'Apply'}
                  </motion.button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg bg-interactive-hover hover:bg-slate-300 dark:bg-white/15 text-sm"
                  onClick={() => exportCsv(true)}
                >
                  <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('shows.bulk.export') || 'Export'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-sm font-medium"
                  onClick={() => { const ok = window.confirm(`${t('shows.bulk.delete') || 'Delete selected'} (${selected.size})?`); if (!ok) return; for (const id of selected) remove(id); trackEvent('shows.bulk.delete', { count: selected.size }); setSelected(new Set()); }}
                >
                  <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t('shows.bulk.delete') || 'Delete'}
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFiltersPanelOpen(true)}
                  className="px-4 py-2.5 rounded-lg glass border border-slate-200 dark:border-white/10 hover:border-accent-500/30 text-sm flex items-center gap-2 transition-all"
                  aria-label={t('shows.filters.openPanel') || 'Open filters'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {t('shows.filters.title') || 'Filters'}
                </motion.button>
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    aria-label={t('shows.search.placeholder') || 'Search'}
                    value={qInput}
                    onChange={e => setQInput(e.target.value)}
                    placeholder={t('shows.search.placeholder') || 'Search city/country'}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-interactive border border-slate-200 dark:border-white/10 hover:border-theme-strong focus:border-accent-500/50 focus:outline-none text-sm transition-all"
                  />
                  {qInput && (
                    <button
                      onClick={() => setQInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/80 transition-colors"
                      aria-label="Clear search"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  {q && !qInput && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="animate-spin h-4 w-4 text-accent-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
                <ViewToggle view={view} setView={setView} />
                <AnimatedButton onClick={() => setExportOpen(o => !o)} className="px-4 py-2.5 rounded-lg glass border border-slate-200 dark:border-white/10 hover:border-theme-strong text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('shows.exportCsv') || 'Export'}
                  {exporting && <span className="ml-2 text-[11px] opacity-70">{t('common.exporting') || '…'}</span>}
                </AnimatedButton>
                <GuardedAction scope="shows:write" className="px-5 py-2.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-black text-sm font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2" onClick={openAdd}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('shows.add') || 'Add show'}
                </GuardedAction>
                {exportOpen && (
                  <div className="absolute top-full right-0 mt-2 glass rounded p-3 text-xs border border-white/12 min-w-[260px] z-20">
                    <div className="font-semibold mb-2">{t('export.columns') || 'Columns'}</div>
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      {(Object.keys(exportCols) as (keyof typeof exportCols)[]).map(k => (
                        <label key={k} className="inline-flex items-center gap-1"><input type="checkbox" checked={exportCols[k]} onChange={e => setExportCols(c => ({ ...c, [k]: e.target.checked }))} /> {k}</label>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button className="px-2 py-1 rounded bg-interactive-hover hover:bg-white/15" onClick={() => exportCsv(selected.size > 0)} disabled={exporting}>CSV</button>
                      <button className="px-2 py-1 rounded bg-interactive-hover hover:bg-white/15" onClick={() => exportXlsx(selected.size > 0)} disabled={exporting}>XLSX</button>
                      <button className="ml-auto text-[11px] underline" onClick={() => setExportOpen(false)}>{t('common.close') || 'Close'}</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Enhanced Statistics Panel */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-white/80">{t('shows.stats.overview') || 'Overview'}</h3>
              <span className="px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-400 text-xs font-medium">
                {filtered.length} {filtered.length === 1 ? 'show' : 'shows'}
              </span>
            </div>
            <button
              onClick={() => setStatsVisible(!statsVisible)}
              className="text-xs text-theme-secondary hover:text-accent-500 transition-colors flex items-center gap-1.5"
            >
              {statsVisible ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  {t('common.hide') || 'Hide'}
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {t('common.show') || 'Show'}
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {statsVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4" aria-live="polite">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="glass rounded-xl p-4 border border-slate-200 dark:border-white/10 hover:border-accent-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{filtered.length}</div>
                    <div className="text-xs text-slate-300 dark:text-white/50 mt-1">{t('shows.stats.filtered') || 'Filtered Shows'}</div>
                    {shows.length > 0 && filtered.length === 0 && (
                      <div className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        All filtered
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="glass rounded-xl p-4 border border-slate-200 dark:border-white/10 hover:border-green-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-400 tabular-nums">{fmtMoney(totalFee)}</div>
                    <div className="text-xs text-slate-300 dark:text-white/50 mt-1">{t('shows.stats.totalFees') || 'Total Fees'}</div>
                    {avgFee > 0 && (
                      <div className="text-xs text-slate-400 dark:text-white/40 mt-1">Avg: {fmtMoney(avgFee)}</div>
                    )}
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="glass rounded-xl p-4 border border-slate-200 dark:border-white/10 hover:border-accent-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-accent-400 tabular-nums">{fmtMoney(totalNet)}</div>
                    <div className="text-xs text-slate-300 dark:text-white/50 mt-1">{t('shows.stats.estNet') || 'Estimated Net'}</div>
                    <div className="text-xs text-slate-400 dark:text-white/40 mt-1">After all deductions</div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="glass rounded-xl p-4 border border-slate-200 dark:border-white/10 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-400 tabular-nums">{avgMarginPct}%</div>
                    <div className="text-xs text-slate-300 dark:text-white/50 mt-1">{t('shows.stats.avgMargin') || 'Avg Margin'}</div>
                    <div className={`text-xs mt-1 flex items-center gap-1 ${avgMarginPct >= 70 ? 'text-green-400' : avgMarginPct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {avgMarginPct >= 70 ? '🔥 Excellent' : avgMarginPct >= 50 ? '⚠️ Good' : '⚡ Low'}
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="glass rounded-xl p-4 border border-slate-200 dark:border-white/10 hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-amber-400 tabular-nums">{avgWht}%</div>
                    <div className="text-xs text-slate-300 dark:text-white/50 mt-1">{t('shows.stats.avgWht') || 'Avg WHT'}</div>
                    <div className="text-xs text-slate-400 dark:text-white/40 mt-1">Withholding tax</div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Totals toolbar with averages and pin/unpin */}
        {totalsVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-xl px-5 py-3 flex items-center gap-6 border border-slate-200 dark:border-white/10 mb-6 ${totalsPinned ? 'sticky top-2 z-20 shadow-xl' : ''}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-theme-secondary uppercase tracking-wider">{t('shows.summary.avgFee') || 'Avg Fee'}</span>
              <span className="text-sm font-bold tabular-nums">{fmtMoney(avgFee)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-theme-secondary uppercase tracking-wider">{t('shows.summary.avgMargin') || 'Avg Margin'}</span>
              <span className="text-sm font-bold tabular-nums">{avgMarginPct}%</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="px-3 py-1.5 rounded-lg bg-interactive-hover hover:bg-slate-300 dark:bg-white/15 border border-slate-200 dark:border-white/10 text-xs font-medium flex items-center gap-1.5"
                onClick={() => setTotalsPinned(p => !p)}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={totalsPinned ? "M6 18L18 6M6 6l12 12" : "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"} />
                </svg>
                {totalsPinned ? (t('common.unpin') || 'Unpin') : (t('common.pin') || 'Pin')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="px-3 py-1.5 rounded-lg bg-interactive-hover hover:bg-slate-300 dark:bg-white/15 border border-slate-200 dark:border-white/10 text-xs font-medium"
                onClick={() => setTotalsVisible(false)}
              >
                {t('common.hide') || 'Hide'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Table / Board */}
        {view === 'list' ? (
          <div className={`glass rounded-xl border border-slate-200 dark:border-white/10 relative overflow-hidden ${enableVirtual ? 'max-h-[70vh]' : ''}`} ref={parentRef}>
            <div className={enableVirtual ? 'overflow-y-auto max-h-[70vh]' : ''}>
              <table className="w-full text-sm">
                <thead className="text-left sticky top-0 z-10 backdrop-blur-xl bg-surface-card/80 border-b border-theme">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      <input
                        aria-label={t('shows.selectAll') || 'Select all'}
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={() => { const all = allVisibleSelected; if (all) { setSelected(new Set()); setLastClickedIndex(null); } else { setSelected(new Set(visibleRows.filter(r => r != null).map(r => r.s.id))); setLastClickedIndex(null); } }}
                        className="rounded border-theme-strong bg-interactive hover:bg-interactive-hover transition-colors cursor-pointer"
                      />
                    </th>
                    <ThSort label={t('shows.table.date') || 'Date'} active={sort.key === 'date'} dir={sort.dir} onClick={() => setSort(s => ({ key: 'date', dir: s.key === 'date' && s.dir === 'desc' ? 'asc' : 'desc' }))} />
                    <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-theme-secondary">{t('shows.table.name') || 'Name'}</th>
                    <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-theme-secondary">{t('shows.table.city') || 'City'}</th>
                    <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-theme-secondary">{t('shows.table.country') || 'Country'}</th>
                    <ThSort label={t('shows.table.fee') || 'Fee'} numeric active={sort.key === 'fee'} dir={sort.dir} onClick={() => setSort(s => ({ key: 'fee', dir: s.key === 'fee' && s.dir === 'desc' ? 'asc' : 'desc' }))} />
                    {whtVisible && <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-theme-secondary">{t('shows.columns.wht') || 'WHT %'} <button onClick={() => setWhtVisible(false)} className="ml-1.5 text-[10px] px-1 py-0.5 rounded bg-interactive-hover hover:bg-white/20 transition-colors" aria-label={t('shows.wht.hide') || 'Hide WHT column'}>×</button></th>}
                    <ThSort label={t('shows.table.net') || 'Net'} numeric active={sort.key === 'net'} dir={sort.dir} onClick={() => setSort(s => ({ key: 'net', dir: s.key === 'net' && s.dir === 'desc' ? 'asc' : 'desc' }))} />
                    <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-theme-secondary">{t('shows.table.margin') || 'Margin %'}</th>
                    <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-theme-secondary">{t('shows.table.status') || 'Status'}</th>
                  </tr>
                  {/* Totals Row */}
                  <tr className="bg-accent-500/5 border-b border-accent-500/10">
                    <th scope="row" className="px-4 py-3 text-xs font-medium text-theme-secondary">{t('shows.table.totals') || 'Totals'}</th>
                    <td className="px-4 py-3 text-xs text-theme-secondary font-medium">{rows.length} {t('shows.items') || 'items'}</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-right tabular-nums text-sm font-bold text-accent-500">{fmtMoney(totalFee)}</td>
                    {whtVisible && <td className="px-4 py-3 text-right tabular-nums text-xs text-theme-secondary">{avgWht}%</td>}
                    <td className="px-4 py-3 text-right tabular-nums text-sm font-bold text-accent-500">{fmtMoney(totalNet)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-xs text-theme-secondary">{avgMarginPct}%</td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </thead>
                <tbody>
                  {enableVirtual && <tr style={{ height: topSpacer }} aria-hidden><td colSpan={8} /></tr>}
                  <AnimatePresence mode="popLayout">
                    {visibleRows.map(({ s, net }, index) => (
                      <motion.tr
                        key={s.id}
                        layout
                        initial={{ opacity: 0, x: -20, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.98 }}
                        transition={{
                          duration: 0.25,
                          ease: [0.23, 1, 0.32, 1],
                          layout: { duration: 0.2 }
                        }}
                        onClick={(e) => {
                          // No abrir si se hace clic en checkbox o menú de acciones
                          const target = e.target as HTMLElement;
                          if (target.closest('input[type="checkbox"]') || target.closest('[data-row-menu]')) {
                            return;
                          }
                          openEdit(s);
                        }}
                        className="border-b border-slate-100 dark:border-white/5 hover:bg-accent-500/5 hover:border-accent-500/20 transition-all cursor-pointer group"
                      >
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            aria-label={t('shows.selectRow') || 'Select'}
                            type="checkbox"
                            checked={selected.has(s.id)}
                            readOnly
                            onClick={(e) => { e.preventDefault(); toggleSelectOne(s.id, index, e.shiftKey); }}
                            className="rounded border-theme-strong bg-interactive hover:bg-interactive-hover transition-colors cursor-pointer group-hover:border-accent-500/40"
                          />
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-medium" title={s.date} aria-label={(() => {
                          const today = new Date(); const showD = new Date(s.date); const diffDays = Math.round((showD.getTime() - today.getTime()) / 86400000); if (diffDays === 0) return t('common.today') || 'Today'; if (diffDays === 1) return t('common.tomorrow') || 'Tomorrow'; if (diffDays > 1) return (t('shows.relative.inDays') || 'In {n} days').replace('{n}', String(diffDays)); if (diffDays === -1) return t('shows.relative.yesterday') || 'Yesterday'; return (t('shows.relative.daysAgo') || '{n} days ago').replace('{n}', String(Math.abs(diffDays)));
                        })()}>
                          <span className="text-theme-primary group-hover:text-accent-500 transition-colors">{s.date.slice(0, 10)}</span>
                        </td>
                        <td className="px-4 py-3.5 max-w-[200px]">
                          <div className="truncate font-medium text-theme-primary group-hover:text-white transition-colors" title={s.name || (s as ShowWithExtras).venue || ''}>
                            {s.name || (s as ShowWithExtras).venue || <span className="opacity-40">—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-white/80">{s.city}</td>
                        <td className="px-4 py-3.5 text-theme-secondary">{countryLabel(s.country, lang)}</td>
                        <td className="px-4 py-3.5 text-right tabular-nums font-semibold">{fmtMoney(s.fee)}</td>
                        {whtVisible && <td className="px-4 py-3.5 text-right tabular-nums text-theme-secondary text-sm">{(s as ShowWithExtras).whtPct ?? 0}%</td>}
                        <td className="px-4 py-3.5 text-right tabular-nums">
                          <span
                            className="inline-block px-2.5 py-1 rounded-lg bg-accent-500/10 border border-accent-500/25 text-accent-400 tabular-nums font-bold group-hover:bg-accent-500/20 group-hover:border-accent-500/40 transition-all"
                            title={(t('shows.margin.tooltip') || t('shows.tooltip.margin') || 'Net divided by Fee (%)') + (s.fee > 0 ? ' • ' + Math.round((net / s.fee) * 100) + '%' : '')}
                            aria-label={(t('shows.margin.tooltip') || 'Margin % formula') + (s.fee > 0 ? ': ' + Math.round((net / s.fee) * 100) + '%' : '')}
                          >{fmtMoney(net)}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {s.fee > 0 && (
                            <span
                              className="px-2 py-1 rounded-md bg-accent-500/15 border border-accent-500/30 text-accent-300 tabular-nums text-xs font-semibold inline-block min-w-[3.5ch] text-center group-hover:bg-accent-500/25 transition-all"
                              title={(t('shows.tooltip.margin') || 'Net divided by Fee (%)') + ' • ' + (Math.round((net / s.fee) * 100)) + '%'}
                              aria-label={(t('shows.tooltip.margin') || 'Margin percentage') + ': ' + Math.round((net / s.fee) * 100) + '%'}
                            >{Math.round((net / s.fee) * 100)}%</span>
                          )}
                        </td>
                        <td className="px-3 py-2 flex items-center gap-2 relative" onClick={(e) => e.stopPropagation()}>
                          <StatusBadge status={s.status}>{s.status}</StatusBadge>

                          {/* Quick Actions - visible on hover */}
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const next = s.status === 'offer' ? 'pending' : s.status === 'pending' ? 'confirmed' : s.status;
                                if (next !== s.status) {
                                  update(s.id, { status: next });
                                  toast.show(`Status → ${next}`, { tone: 'success' });
                                }
                              }}
                              className="p-1 rounded-md bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                              title="Promote status"
                              disabled={s.status === 'confirmed'}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const id = (() => { try { return crypto.randomUUID(); } catch { return 's' + Date.now(); } })();
                                const show = s as ShowWithExtras;
                                const costsClone = Array.isArray(show.costs) ? show.costs.map((c: Cost) => ({ ...c })) : [];
                                const clone: ShowWithExtras = {
                                  ...show,
                                  id,
                                  name: (s.name || show.venue || s.city) + ' (copy)',
                                  status: s.status === 'archived' ? 'offer' : s.status,
                                  costs: costsClone,
                                  createdAt: new Date().toISOString(),
                                  archivedAt: undefined
                                };
                                add(clone);
                                toast.success('Duplicated');
                              }}
                              className="p-1 rounded-md bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
                              title="Duplicate show"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(s);
                              }}
                              className="p-1 rounded-md bg-accent-500/20 hover:bg-accent-500/30 text-accent-400 border border-accent-500/30"
                              title="Edit show"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </motion.button>
                          </div>

                          <RowActionsMenu
                            show={s}
                            onEdit={() => openEdit(s)}
                            onPromote={() => {
                              const next = s.status === 'offer' ? 'pending' : s.status === 'pending' ? 'confirmed' : s.status;
                              if (next !== s.status) {
                                update(s.id, { status: next });
                                toast.show((t('shows.editor.status.promote') || 'Promoted to') + ': ' + next, { tone: 'success' });
                                trackEvent('shows.promote.row', { from: s.status, to: next });
                              }
                            }}
                            onDuplicate={() => {
                              const id = (() => { try { return crypto.randomUUID(); } catch { return 's' + Date.now(); } })();
                              const show = s as ShowWithExtras;
                              const costsClone = Array.isArray(show.costs) ? show.costs.map((c: Cost) => ({ ...c })) : [];
                              const nowIso = new Date().toISOString();
                              const clone: ShowWithExtras = {
                                ...show,
                                id,
                                name: (s.name || show.venue || s.city) + ' (copy)',
                                status: s.status === 'archived' ? 'offer' : s.status,
                                costs: costsClone,
                                createdAt: nowIso,
                                archivedAt: undefined
                              };
                              add(clone);
                              toast.success(t('shows.action.duplicate') || 'Duplicate');
                              trackEvent('shows.duplicate', { source: s.id, new: id });
                            }}
                            onArchive={() => { if (s.status !== 'archived') { update(s.id, { status: 'archived', archivedAt: new Date().toISOString() }); trackEvent('shows.archive', { id: s.id }); toast.warn(t('shows.action.archive') || 'Archive'); } }}
                            onRestore={() => { if (s.status === 'archived') { update(s.id, { status: 'pending', archivedAt: undefined }); trackEvent('shows.restore', { id: s.id }); toast.success(t('shows.action.restore') || 'Restore'); } }}
                            onDelete={async () => { 
                              const ok = window.confirm((t('shows.action.delete') || 'Delete') + '?'); 
                              if (!ok) return; 
                              await remove(s.id); 
                              trackEvent('shows.delete', { id: s.id }); 
                              toast.error(t('shows.action.delete') || 'Delete'); 
                            }}
                          />
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-16 text-center">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="space-y-6"
                        >
                          {/* Illustration */}
                          <div className="flex justify-center">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-500/20 to-blue-500/20 flex items-center justify-center">
                              <svg className="w-12 h-12 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                          </div>

                          {/* Message */}
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-theme-primary">
                              {shows.length === 0
                                ? (t('shows.empty.noShows') || 'No shows yet')
                                : (t('shows.empty.noResults') || 'No shows match your filters')}
                            </h3>
                            <p className="text-sm text-slate-300 dark:text-white/50 max-w-md mx-auto">
                              {shows.length === 0
                                ? (t('shows.empty.noShows.desc') || 'Start by adding your first show to track your tours and finances.')
                                : (t('shows.empty.noResults.desc') || 'Try adjusting your filters or search terms to find what you\'re looking for.')}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-center gap-3">
                            {shows.length > 0 && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={clearFilters}
                                className="px-4 py-2.5 rounded-lg bg-interactive-hover hover:bg-slate-300 dark:bg-white/15 text-sm font-medium flex items-center gap-2 transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                {t('filters.clear') || 'Clear filters'}
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={openAdd}
                              className="px-5 py-2.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-black text-sm font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              {t('shows.empty.add') || t('shows.add') || 'Add your first show'}
                            </motion.button>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                  {enableVirtual && <tr style={{ height: bottomSpacer }} aria-hidden><td colSpan={8} /></tr>}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-white/80">{t('shows.board.title') || 'Board View'}</h3>
                <span className="px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-400 text-xs font-medium">
                  {rows.length} {t('shows.items') || 'shows'}
                </span>
              </div>
              <div className="text-xs text-slate-300 dark:text-white/50 flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                {t('shows.board.dragHint') || 'Drag to change status'}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boardStatuses.map(st => {
                const stat = boardStats[st] || { count: 0, net: 0 };
                const statusColors = {
                  offer: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
                  pending: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
                  confirmed: 'from-green-500/20 to-green-600/10 border-green-500/30',
                  canceled: 'from-red-500/20 to-red-600/10 border-red-500/30',
                  archived: 'from-gray-500/20 to-gray-600/10 border-gray-500/30',
                  postponed: 'from-purple-500/20 to-purple-600/10 border-purple-500/30'
                };
                const headerColors = {
                  offer: 'text-blue-300',
                  pending: 'text-amber-300',
                  confirmed: 'text-green-300',
                  canceled: 'text-red-300',
                  archived: 'text-gray-300',
                  postponed: 'text-purple-300'
                };
                const isOver = dropTargetStatus === st;

                return (
                  <BoardColumn
                    key={st}
                    status={st}
                    statusColors={statusColors}
                    headerColors={headerColors}
                    isOver={isOver}
                    stat={stat}
                    rows={rows}
                    fmtMoney={fmtMoney}
                    t={t}
                    onDragStart={handleNativeDragStart}
                    onDragOver={handleNativeDragOver}
                    onDragLeave={handleNativeDragLeave}
                    onDrop={handleNativeDrop}
                    onAddShow={() => {
                      lastTriggerRef.current = document.activeElement as HTMLElement;
                      setMode('add');
                      setDraft({
                        city: '',
                        country: '',
                        date: new Date().toISOString().slice(0, 10),
                        fee: 5000,
                        lat: 0,
                        lng: 0,
                        status: st as Show['status'],
                        whtPct: 0
                      } as DraftShow);
                      setCosts([]);
                      setModalOpen(true);
                      announce('Add show');
                      trackEvent('shows.drawer.open', { mode: 'add', fromBoard: true, status: st });
                    }}
                    onEditShow={openEdit}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Filters Panel */}
        <AnimatePresence>
          {filtersPanelOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-50 w-full sm:w-96 lg:w-80 glass border-r border-slate-200 dark:border-white/10 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-accent-500/10 to-blue-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold">{t('shows.filters.title') || 'Filters'}</h3>
                  </div>
                  <button
                    onClick={() => setFiltersPanelOpen(false)}
                    className="p-2 rounded-lg hover:bg-interactive-hover transition-colors"
                    aria-label={t('common.close') || 'Close'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Status filters */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-slate-600 dark:text-white/80">{t('shows.filters.statusGroup') || 'Status'}</h4>
                    <div className="flex flex-wrap gap-2">
                      {(['confirmed', 'pending', 'offer', 'canceled', 'archived', 'postponed'] as const).map(st => {
                        const count = statusCounts[st] || 0;
                        return (
                          <Chip key={st} active={statusOn[st]} onClick={() => setStatusOn(p => ({ ...p, [st]: !p[st] }))} size="sm" tone={st === 'confirmed' ? 'accent' : st === 'pending' ? 'warn' : st === 'offer' ? 'default' : st === 'canceled' ? 'danger' : 'default'} aria-label={`${st} (${count})`}>
                            {st} {count > 0 && <span className="opacity-70">{count}</span>}
                          </Chip>
                        );
                      })}
                    </div>
                    <button className="mt-2 text-xs underline opacity-70 hover:opacity-100" onClick={() => setStatusOn({ confirmed: true, pending: true, offer: true, canceled: false, archived: true, postponed: true })}>{t('common.reset') || 'Reset'}</button>
                  </div>

                  {/* Quick Filters */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-slate-600 dark:text-white/80">{t('shows.filters.quickFilters') || 'Quick Filters'}</h4>
                    <div className="flex flex-wrap gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setQuickFilter('all')}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${quickFilter === 'all'
                          ? 'bg-accent-500 text-black shadow-lg'
                          : 'bg-interactive text-theme-secondary hover:bg-interactive-hover'
                          }`}
                      >
                        <svg className="w-3.5 h-3.5 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        {t('shows.filters.all') || 'All Shows'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setQuickFilter('upcoming')}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${quickFilter === 'upcoming'
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-interactive text-theme-secondary hover:bg-interactive-hover'
                          }`}
                      >
                        <svg className="w-3.5 h-3.5 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        {t('shows.filters.upcoming') || 'Next 30 Days'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setQuickFilter('thisMonth')}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${quickFilter === 'thisMonth'
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'bg-interactive text-theme-secondary hover:bg-interactive-hover'
                          }`}
                      >
                        <svg className="w-3.5 h-3.5 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {t('shows.filters.thisMonth') || 'This Month'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setQuickFilter('highValue')}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${quickFilter === 'highValue'
                          ? 'bg-amber-500 text-black shadow-lg'
                          : 'bg-interactive text-theme-secondary hover:bg-interactive-hover'
                          }`}
                      >
                        <svg className="w-3.5 h-3.5 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('shows.filters.highValue') || 'High Value'}
                      </motion.button>
                    </div>
                  </div>

                  {/* Date range */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-slate-600 dark:text-white/80">{t('shows.filters.dateRange') || 'Date Range'}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="text-xs text-theme-secondary flex-1">
                          <span className="block mb-2 font-medium">{t('shows.filters.from') || 'From'}</span>
                          <input type="date" value={dateRange.from} onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-interactive border border-theme-strong hover:border-slate-400 dark:hover:border-white/30 focus:border-accent-500/50 focus:outline-none transition-all" />
                        </label>
                        <label className="text-xs text-theme-secondary flex-1">
                          <span className="block mb-2 font-medium">{t('shows.filters.to') || 'To'}</span>
                          <input type="date" value={dateRange.to} onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-interactive border border-theme-strong hover:border-slate-400 dark:hover:border-white/30 focus:border-accent-500/50 focus:outline-none transition-all" />
                        </label>
                      </div>
                      <DatePresets onApply={(from, to) => setDateRange({ from, to })} />
                    </div>
                  </div>

                  {/* Region */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-slate-600 dark:text-white/80">{t('shows.filters.region') || 'Region'}</h4>
                    <select value={region} onChange={e => setRegion(e.target.value as 'all' | 'AMER' | 'EMEA' | 'APAC')} className="w-full px-4 py-2.5 rounded-lg bg-interactive border border-theme-strong hover:border-slate-400 dark:hover:border-white/30 focus:border-accent-500/50 focus:outline-none cursor-pointer transition-all">
                      <option value="all">All Regions</option>
                      <option value="AMER">AMER</option>
                      <option value="EMEA">EMEA</option>
                      <option value="APAC">APAC</option>
                    </select>
                  </div>

                  {/* Fee range */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-slate-600 dark:text-white/80">{t('shows.filters.feeRange') || 'Fee Range'}</h4>
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-theme-secondary flex-1">
                        <span className="block mb-2 font-medium">{t('shows.filters.feeMin') || 'Min Fee'}</span>
                        <input type="number" value={feeRange.min ?? ''} placeholder="0" onChange={e => setFeeRange(fr => ({ ...fr, min: e.target.value === '' ? undefined : Number(e.target.value) }))} className="w-full px-3 py-2.5 rounded-lg bg-interactive border border-theme-strong hover:border-slate-400 dark:hover:border-white/30 focus:border-accent-500/50 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 transition-all" />
                      </label>
                      <label className="text-xs text-theme-secondary flex-1">
                        <span className="block mb-2 font-medium">{t('shows.filters.feeMax') || 'Max Fee'}</span>
                        <input type="number" value={feeRange.max ?? ''} placeholder="∞" onChange={e => setFeeRange(fr => ({ ...fr, max: e.target.value === '' ? undefined : Number(e.target.value) }))} className="w-full px-3 py-2.5 rounded-lg bg-interactive border border-theme-strong hover:border-slate-400 dark:hover:border-white/30 focus:border-accent-500/50 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 transition-all" />
                      </label>
                    </div>
                  </div>

                  {/* View toggle */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-slate-600 dark:text-white/80">{t('shows.view.title') || 'View'}</h4>
                    <ViewToggle view={view} setView={setView} />
                  </div>

                  {/* Actions */}
                  <div className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-2">
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2.5 rounded-lg bg-interactive-hover hover:bg-slate-300 dark:bg-white/15 border border-slate-200 dark:border-white/10 hover:border-theme-strong text-sm font-medium transition-all"
                    >
                      {t('filters.clear') || 'Clear All Filters'}
                    </button>
                    <button
                      onClick={() => setFiltersPanelOpen(false)}
                      className="w-full px-4 py-2.5 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/30 text-accent-400 text-sm font-medium transition-all"
                    >
                      {t('common.apply') || 'Apply Filters'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backdrop for filters panel */}
        <AnimatePresence>
          {filtersPanelOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setFiltersPanelOpen(false)}
            />
          )}
        </AnimatePresence>

        {modalOpen && draft && (
          <ShowEditorDrawer
            open={modalOpen}
            mode={mode}
            initial={{ ...draft, costs }}
            onSave={(d) => { 
              // Convert ShowDraft to DraftShow - all fields from d are preserved
              const draftShow = d as DraftShow;
              setDraft(draftShow); 
              setCosts(d.costs || []); 
              saveDraft(draftShow); 
              closeDrawer(); 
            }}
            onDelete={() => { draft && deleteDraft(draft); closeDrawer(); }}
            onRequestClose={closeDrawer}
          />
        )}

      </motion.div>
    </>
  );
};

// BoardColumn component - Native HTML5 Drag & Drop (FAST!)
const BoardColumn = React.memo<{
  status: string;
  statusColors: Record<string, string>;
  headerColors: Record<string, string>;
  isOver: boolean;
  stat: { count: number; net: number };
  rows: Array<{ s: Show; net: number }>;
  fmtMoney: (n: number) => string;
  t: (key: string) => string | null;
  onAddShow: () => void;
  onEditShow: (show: Show) => void;
  onDragStart: (show: Show) => (e: React.DragEvent) => void;
  onDragOver: (status: string) => (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (status: Show['status']) => (e: React.DragEvent) => void;
}>(({ status, statusColors, headerColors, isOver, stat, rows, fmtMoney, t, onAddShow, onEditShow, onDragStart, onDragOver, onDragLeave, onDrop }) => {
  const columnShows = React.useMemo(() => rows.filter(r => r.s.status === status), [rows, status]);

  return (
    <div
      className={`glass rounded-xl border bg-gradient-to-br ${statusColors[status] || 'from-white/10 to-slate-50 dark:to-white/5 border-theme-strong'} p-4 flex flex-col min-h-[400px] transition-all ${isOver ? 'ring-2 ring-accent-500 scale-[1.01]' : ''}`}
      onDragOver={onDragOver(status)}
      onDragLeave={onDragLeave}
      onDrop={onDrop(status as DemoShow['status'])}
      role="region"
      aria-label={`${status} ${t('shows.board.header.count') || 'Shows'}: ${stat.count}. ${t('shows.board.header.net') || 'Net'}: ${fmtMoney(stat.net)}`}
    >
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-theme">
        <div className="flex items-center gap-2">
          <h4 className={`text-sm font-bold uppercase tracking-wider ${headerColors[status] || 'text-white'}`}>
            {status}
          </h4>
          <span className="px-2 py-0.5 rounded-full bg-interactive-hover text-xs font-semibold text-theme-secondary">
            {stat.count}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-accent-400 tabular-nums" title={t('shows.board.header.net') || 'Net'}>
            {fmtMoney(stat.net)}
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto max-h-[500px] scrollbar-thin">
        {columnShows.map(r => (
          <NativeShowCard
            key={r.s.id}
            show={r.s}
            net={r.net}
            fmtMoney={fmtMoney}
            t={t}
            onClick={() => onEditShow(r.s)}
            onDragStart={onDragStart(r.s)}
          />
        ))}
        <GuardedAction
          scope="shows:write"
          className="w-full py-3 rounded-lg border-2 border-dashed border-theme-strong hover:border-accent-500/50 hover:bg-accent-500/10 text-slate-300 dark:text-white/50 hover:text-accent-500 text-xs font-medium transition-all flex items-center justify-center gap-2 group"
          onClick={onAddShow}
        >
          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('shows.add') || 'Add show'}
        </GuardedAction>
      </div>
    </div>
  );
});

// NativeShowCard component - HTML5 Native Drag (SUPER FAST!)
const NativeShowCard: React.FC<{
  show: Show;
  net: number;
  fmtMoney: (n: number) => string;
  t: (key: string) => string | null;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}> = React.memo(({ show, net, fmtMoney, t, onClick, onDragStart }) => {
  const [isDragging, setIsDragging] = React.useState(false);

  // Memoize expensive calculations
  const { rel, marginPct, primary, secondaryVenue } = React.useMemo(() => {
    const today = new Date();
    const showD = new Date(show.date);
    const diffDays = Math.round((showD.getTime() - today.getTime()) / 86400000);
    const rel = (() => {
      if (diffDays === 0) return t('common.today') || 'Today';
      if (diffDays === 1) return t('common.tomorrow') || 'Tomorrow';
      if (diffDays > 1) return (t('shows.relative.inDays') || 'In {n} days').replace('{n}', String(diffDays));
      if (diffDays === -1) return t('shows.relative.yesterday') || 'Yesterday';
      return (t('shows.relative.daysAgo') || '{n} days ago').replace('{n}', String(Math.abs(diffDays)));
    })();
    const marginPct = show.fee > 0 ? Math.round((net / show.fee) * 100) : 0;
    const showWithExtras = show as ShowWithExtras;
    const primary = show.name || showWithExtras.venue || show.city;
    const secondaryVenue = showWithExtras.venue && show.name ? showWithExtras.venue : '';
    return { rel, marginPct, primary, secondaryVenue };
  }, [show.date, show.fee, show.name, show.city, net, t]);

  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(e);
      }}
      onDragEnd={() => setIsDragging(false)}
      className={`w-full text-left rounded-lg border border-theme-strong bg-interactive px-3 py-2.5 flex flex-col gap-2 shadow-sm transition-all ${isDragging ? 'opacity-50 scale-95' : 'cursor-grab hover:bg-interactive-hover hover:border-slate-400 dark:hover:border-white/30 hover:scale-[1.02]'
        }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${primary}. ${rel}. Net ${fmtMoney(net)}${show.fee > 0 ? '. Margin ' + marginPct + '%' : ''}`}
    >
      {/* Header with date */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-theme">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-slate-400 dark:text-white/40 group-hover:text-accent-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-200 font-medium whitespace-nowrap" title={show.date}>
            {rel}
          </span>
        </div>
        <span className="inline-block px-1.5 py-0.5 rounded-md bg-interactive-hover text-[9px] font-semibold tracking-wider uppercase text-theme-secondary">
          {show.country}
        </span>
      </div>

      {/* Title and venue */}
      <div className="space-y-1">
        <div className="text-xs font-semibold truncate text-theme-primary group-hover:text-white transition-colors">
          {primary}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-theme-secondary">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{show.city}</span>
        </div>
        {secondaryVenue && (
          <div className="text-[10px] text-slate-300 dark:text-white/50 truncate italic">
            {secondaryVenue}
          </div>
        )}
      </div>

      {/* Financial info */}
      <div className="flex items-center justify-between pt-2 border-t border-theme">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] uppercase tracking-wider text-slate-300 dark:text-white/50 font-medium">Net</span>
          <span className="text-xs tabular-nums font-bold text-accent-400 group-hover:text-accent-300 transition-colors">
            {fmtMoney(net)}
          </span>
        </div>
        {show.fee > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-slate-300 dark:text-white/50 font-medium">Margin</div>
              <div className="text-xs font-bold">{fmtMoney(show.fee)}</div>
            </div>
            <div className="px-2 py-1 rounded-md bg-accent-500/20 border border-accent-500/30">
              <span className="text-accent-300 tabular-nums text-xs font-bold">
                {marginPct}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// helpers
const SummaryCard: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -4 }}
    transition={{ duration: 0.2 }}
    className="glass rounded-xl p-6 border border-slate-200 dark:border-white/10 hover:border-accent-500/30 hover:shadow-lg hover:shadow-accent-500/10 transition-all group"
  >
    <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 dark:text-white/50 mb-3 group-hover:text-accent-400 transition-colors">{label}</div>
    <div className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white group-hover:text-accent-300 transition-colors">{children}</div>
  </motion.div>
);

const ThSort: React.FC<{ label: string; active: boolean; dir: 'asc' | 'desc'; onClick: () => void; numeric?: boolean }> = ({ label, active, dir, onClick, numeric }) => {
  const nextDir = active ? (dir === 'desc' ? 'asc' : 'desc') : 'desc';
  return (
    <th scope="col"
      className={`px-3 py-2 text-xs uppercase tracking-wide select-none cursor-pointer ${numeric ? 'text-right tabular-nums' : ''}`}
      onClick={onClick}
      aria-sort={active ? (dir === 'desc' ? 'descending' : 'ascending') : 'none'}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 focus-ring"
        aria-label={`${label}. ${active ? (dir === 'desc' ? (t('shows.sort.aria.sortedDesc') || 'Sorted descending') : (t('shows.sort.aria.sortedAsc') || 'Sorted ascending')) : (t('shows.sort.aria.notSorted') || 'Not sorted')}. ${nextDir === 'desc' ? (t('shows.sort.aria.activateDesc') || 'Activate to sort descending') : (t('shows.sort.aria.activateAsc') || 'Activate to sort ascending')}`}
        title={t('shows.sort.tooltip') || `Ordenar por ${label}`}
      >
        <span>{label}</span>
        {active && <span aria-hidden="true">{dir === 'desc' ? '▼' : '▲'}</span>}
      </button>
    </th>
  );
};

const ViewToggle: React.FC<{ view: ViewMode; setView: (v: ViewMode) => void }> = ({ view, setView }) => (
  <div className="inline-flex glass border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden text-xs">
    <button
      className={`px-4 py-2 font-medium transition-all flex items-center gap-2 ${view === 'list' ? 'bg-accent-500/20 text-accent-400 border-r border-accent-500/30' : 'text-theme-secondary hover:text-theme-primary hover:bg-interactive'}`}
      onClick={() => setView('list')}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      {t('shows.view.list') || 'List'}
    </button>
    <button
      className={`px-4 py-2 font-medium transition-all flex items-center gap-2 ${view === 'board' ? 'bg-accent-500/20 text-accent-400' : 'text-theme-secondary hover:text-theme-primary hover:bg-interactive'}`}
      onClick={() => setView('board')}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
      {t('shows.view.board') || 'Board'}
    </button>
  </div>
);

// Row actions menu (dropdown)
const RowActionsMenu: React.FC<{ show: Show; onEdit: () => void; onPromote: () => void; onDuplicate: () => void; onArchive: () => void; onRestore: () => void; onDelete: () => void }> = ({ show, onEdit, onPromote, onDuplicate, onArchive, onRestore, onDelete }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (!open) return; const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); } }; const onDoc = (e: MouseEvent) => { const el = e.target as HTMLElement; if (!el.closest || !el.closest('[data-row-menu="true"]')) setOpen(false); }; document.addEventListener('keydown', onKey); document.addEventListener('mousedown', onDoc); return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDoc); }; }, [open]);
  useEffect(() => { if (open) { const first = menuRef.current?.querySelector('[role="menuitem"]') as HTMLElement | null; first?.focus(); } }, [open]);
  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') || []);
      if (items.length === 0) return;
      const idx = items.findIndex(el => el === document.activeElement);
      const delta = e.key === 'ArrowDown' ? 1 : -1;
      const next = (idx < 0 ? 0 : idx + delta + items.length) % items.length;
      items[next]?.focus();
    }
  };
  const promoteEnabled = (show.status === 'offer' || show.status === 'pending');
  return (
    <div className="relative" data-row-menu="true">
      <button ref={btnRef} type="button" aria-haspopup="menu" aria-expanded={open} aria-label={t('shows.row.menu') || 'Row actions'} className="px-2 py-1 rounded bg-interactive hover:bg-interactive-hover focus-ring text-xs" onClick={() => setOpen(o => !o)}>⋯</button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="menu"
            className="absolute z-30 min-w-[150px] right-0 top-full mt-1 glass rounded-md border border-white/12 shadow-lg py-1 text-xs origin-top-right"
            aria-label={t('shows.row.menu') || 'Row actions'}
            onKeyDown={onMenuKeyDown}
          >
            <button role="menuitem" tabIndex={0} className="w-full text-left px-3 py-1 hover:bg-interactive-hover" onClick={() => { onEdit(); setOpen(false); }}>{t('shows.action.edit') || 'Edit'}</button>
            <button role="menuitem" tabIndex={-1} disabled={!promoteEnabled} className="w-full text-left px-3 py-1 hover:bg-interactive-hover disabled:opacity-40" onClick={() => { if (!promoteEnabled) return; onPromote(); setOpen(false); }}>{t('shows.action.promote') || 'Promote'}</button>
            <button role="menuitem" tabIndex={-1} className="w-full text-left px-3 py-1 hover:bg-interactive-hover" onClick={() => { onDuplicate(); setOpen(false); }}>{t('shows.action.duplicate') || 'Duplicate'}</button>
            {show.status !== 'archived' && <button role="menuitem" tabIndex={-1} className="w-full text-left px-3 py-1 hover:bg-interactive-hover" onClick={() => { onArchive(); setOpen(false); }}>{t('shows.action.archive') || 'Archive'}</button>}
            {show.status === 'archived' && <button role="menuitem" tabIndex={-1} className="w-full text-left px-3 py-1 hover:bg-interactive-hover" onClick={() => { onRestore(); setOpen(false); }}>{t('shows.action.restore') || 'Restore'}</button>}
            <div className="h-px my-1 bg-interactive-hover" />
            <button role="menuitem" tabIndex={-1} className="w-full text-left px-3 py-1 hover:bg-rose-600/30 text-rose-200" onClick={() => { onDelete(); setOpen(false); }}>{t('shows.action.delete') || 'Delete'}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shows;

// Date range presets popover component
const DatePresets: React.FC<{ onApply: (from: string, to: string) => void }> = ({ onApply }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return; const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); }; const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; window.addEventListener('keydown', onKey); window.addEventListener('mousedown', onClick); return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onClick); };
  }, [open]);
  const applyThisMonth = () => {
    const now = new Date(); const y = now.getFullYear(); const m = now.getMonth();
    const from = new Date(y, m, 1).toISOString().slice(0, 10);
    const to = new Date(y, m + 1, 0).toISOString().slice(0, 10);
    onApply(from, to); setOpen(false);
  };
  const applyNextMonth = () => {
    const now = new Date(); const y = now.getFullYear(); const m = now.getMonth() + 1;
    const from = new Date(y, m, 1).toISOString().slice(0, 10);
    const to = new Date(y, m + 1, 0).toISOString().slice(0, 10);
    onApply(from, to); setOpen(false);
  };
  return (
    <div className="relative" ref={ref}>
      <button type="button" className="px-2 py-1 rounded bg-interactive-hover hover:bg-slate-300 dark:bg-white/15 text-[11px]" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(o => !o)}>{t('shows.date.presets') || 'Presets'}</button>
      {open && (
        <div role="dialog" aria-label={t('shows.date.presets') || 'Date presets'} className="absolute top-full right-0 mt-1 glass rounded border border-white/12 p-2 z-30 w-40 text-[11px] space-y-1">
          <button className="w-full text-left px-2 py-1 rounded hover:bg-interactive-hover" onClick={applyThisMonth}>{t('shows.date.thisMonth') || 'This Month'}</button>
          <button className="w-full text-left px-2 py-1 rounded hover:bg-interactive-hover" onClick={applyNextMonth}>{t('shows.date.nextMonth') || 'Next Month'}</button>
          <button className="w-full text-left px-2 py-1 rounded hover:bg-interactive-hover" onClick={() => { onApply('', ''); setOpen(false); }}>{t('filters.clear') || 'Clear'}</button>
        </div>
      )}
    </div>
  );
};
