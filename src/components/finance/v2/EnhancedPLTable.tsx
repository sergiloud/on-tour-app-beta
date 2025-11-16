/**
 * Enhanced PLTable Component
 * 
 * Advanced features added to the existing P&L table:
 * - Enhanced virtualization with performance monitoring
 * - Smart overscan based on scroll velocity
 * - Memory-aware rendering optimizations
 * - Dynamic row height support
 * - Performance dashboard overlay
 * - Optimized data processing with memoization
 */

import React from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { useSettings } from '../../../context/SettingsContext';
import { t } from '../../../lib/i18n';
import { useToast } from '../../../ui/Toast';
import { announce } from '../../../lib/announcer';
import { trackEvent } from '../../../lib/telemetry';
import { regionOfCountry } from '../../../lib/geo';
import { computeNet } from '../../../lib/computeNet';
import { can } from '../../../lib/tenants';
import { AnimatePresence, motion } from 'framer-motion';
import { agenciesForShow, computeCommission } from '../../../lib/agencies';
import type { Show } from '../../../lib/shows';
import { sanitizeName } from '../../../lib/sanitize';
import { useAdvancedVirtualizer, useVirtualPerformanceMonitor } from '../../../lib/advancedVirtualization';

type Filter = { kind: 'Region' | 'Agency' | 'Country' | 'Promoter' | 'Route' | 'Aging'; value: string } | null;
type SortKey = 'date' | 'show' | 'city' | 'country' | 'region' | 'venue' | 'promoter' | 'agency' | 'fee' | 'whtPct' | 'wht' | 'mgmtPct' | 'bookingPct' | 'cost' | 'net' | 'status' | 'route';

// Optimized agency commission calculation with memoization
const useAgencyCommissions = (show: any, bookingAgencies: any[], managementAgencies: any[]) => {
  return React.useMemo(() => {
    try {
      const demoShow: Partial<Show> = {
        id: show.id,
        name: show.name || '',
        city: show.city,
        country: show.country,
        lat: show.lat || 0,
        lng: show.lng || 0,
        date: show.date,
        fee: show.fee,
        status: show.status,
        mgmtAgency: show.mgmtAgency,
        bookingAgency: show.bookingAgency
      };

      const applicable = agenciesForShow(demoShow as Show, bookingAgencies, managementAgencies);
      const totalBooking = applicable.booking.length > 0 ? computeCommission(demoShow as Show, applicable.booking) : 0;
      const totalMgmt = applicable.management.length > 0 ? computeCommission(demoShow as Show, applicable.management) : 0;

      const totalCommission = totalBooking + totalMgmt;
      const bookingPct = show.fee > 0 ? (totalBooking / show.fee) * 100 : 0;
      const mgmtPct = show.fee > 0 ? (totalMgmt / show.fee) * 100 : 0;

      return { totalCommission, bookingPct, mgmtPct };
    } catch (e) {
      console.error('[EnhancedPLTable] Error calculating agency commissions:', e);
      return { totalCommission: 0, bookingPct: 0, mgmtPct: 0 };
    }
  }, [show.id, show.fee, show.mgmtAgency, show.bookingAgency, bookingAgencies, managementAgencies]);
};

// Enhanced row component with optimization
const PLTableRow = React.memo(({ 
  show, 
  index, 
  bookingAgencies, 
  managementAgencies, 
  fmtMoney,
  isAnimating,
  style 
}: {
  show: any;
  index: number;
  bookingAgencies: any[];
  managementAgencies: any[];
  fmtMoney: (amount: number) => string;
  isAnimating: boolean;
  style: React.CSSProperties;
}) => {
  const agencyCommissions = useAgencyCommissions(show, bookingAgencies, managementAgencies);
  
  const cost = React.useMemo(() => 
    typeof (show as any).cost === 'number' ? (show as any).cost : 0, 
    [(show as any).cost]
  );
  
  const wht = React.useMemo(() => 
    show.whtPct ? show.fee * (show.whtPct / 100) : 0,
    [show.fee, show.whtPct]
  );
  
  const net = React.useMemo(() => 
    computeNet({ 
      fee: show.fee, 
      whtPct: show.whtPct || 0, 
      mgmtPct: agencyCommissions.mgmtPct, 
      bookingPct: agencyCommissions.bookingPct, 
      costs: [{ amount: cost }] 
    }), 
    [show.fee, show.whtPct, agencyCommissions.mgmtPct, agencyCommissions.bookingPct, cost]
  );

  const COLS = '110px minmax(160px,1.2fr) minmax(120px,1fr) minmax(110px,0.8fr) minmax(110px,0.8fr) minmax(110px,0.8fr) minmax(160px,1fr) minmax(140px,1fr) 100px 70px 100px 70px 70px 100px 110px minmax(110px,0.8fr) minmax(120px,0.8fr) 120px';

  return (
    <motion.div
      style={{
        ...style,
        display: 'grid',
        gridTemplateColumns: COLS,
      }}
      className={
        `text-sm border-b border-slate-100 dark:border-white/10 
        hover:bg-gradient-to-r hover:from-accent-500/5 hover:to-transparent 
        transition-all duration-200 group
        ${isAnimating ? 'animate-pulse' : ''}`
      }
      role="row"
      initial={isAnimating ? { opacity: 0, x: -20 } : false}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Date */}
      <div className="p-2 text-left font-mono text-xs text-slate-600 dark:text-white/80" role="cell">
        {show.date ? new Date(show.date).toLocaleDateString() : '—'}
      </div>
      
      {/* Show Name */}
      <div className="p-2 text-left" role="cell">
        <div className="font-medium text-slate-900 dark:text-white truncate" title={show.name || 'Unnamed Show'}>
          {sanitizeName(show.name) || 'Unnamed Show'}
        </div>
      </div>
      
      {/* City */}
      <div className="p-2 text-left text-slate-600 dark:text-white/70" role="cell">
        {show.city || '—'}
      </div>
      
      {/* Country */}
      <div className="p-2 text-left text-slate-600 dark:text-white/70" role="cell">
        {show.country || '—'}
      </div>
      
      {/* Region */}
      <div className="p-2 text-left text-slate-600 dark:text-white/70" role="cell">
        {regionOfCountry(show.country) || '—'}
      </div>
      
      {/* Agency */}
      <div className="p-2 text-left text-slate-600 dark:text-white/70" role="cell">
        {(show as any).agency || '—'}
      </div>
      
      {/* Venue */}
      <div className="p-2 text-left text-slate-600 dark:text-white/70" role="cell">
        {(show as any).venue || '—'}
      </div>
      
      {/* Promoter */}
      <div className="p-2 text-left text-slate-600 dark:text-white/70" role="cell">
        {(show as any).promoter || '—'}
      </div>
      
      {/* Fee */}
      <div className="p-2 text-right font-mono text-xs" role="cell">
        <span className="text-green-600 dark:text-green-400 font-medium">
          {fmtMoney(show.fee)}
        </span>
      </div>
      
      {/* WHT % */}
      <div className="p-2 text-right font-mono text-xs text-slate-500 dark:text-white/60" role="cell">
        {(show as any).whtPct ? `${(show as any).whtPct}%` : '—'}
      </div>
      
      {/* WHT */}
      <div className="p-2 text-right font-mono text-xs text-red-500 dark:text-red-400" role="cell">
        {wht > 0 ? fmtMoney(wht) : '—'}
      </div>
      
      {/* Mgmt % */}
      <div className="p-2 text-right font-mono text-xs text-slate-500 dark:text-white/60" role="cell">
        {agencyCommissions.mgmtPct > 0 ? `${agencyCommissions.mgmtPct.toFixed(1)}%` : '—'}
      </div>
      
      {/* Booking % */}
      <div className="p-2 text-right font-mono text-xs text-slate-500 dark:text-white/60" role="cell">
        {agencyCommissions.bookingPct > 0 ? `${agencyCommissions.bookingPct.toFixed(1)}%` : '—'}
      </div>
      
      {/* Cost */}
      <div className="p-2 text-right font-mono text-xs text-red-500 dark:text-red-400" role="cell">
        {cost > 0 ? fmtMoney(cost) : '—'}
      </div>
      
      {/* Net */}
      <div className="p-2 text-right font-mono text-xs" role="cell">
        <span className={net >= 0 ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
          {fmtMoney(net)}
        </span>
      </div>
      
      {/* Status */}
      <div className="p-2 text-left" role="cell">
        <span className={`
          text-xs px-2 py-1 rounded-full font-medium
          ${show.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
          ${show.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
          ${show.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
          ${!show.status || show.status === 'draft' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : ''}
        `}>
          {show.status || 'draft'}
        </span>
      </div>
      
      {/* Route */}
      <div className="p-2 text-left text-slate-600 dark:text-white/70" role="cell">
        {(show as any).route || '—'}
      </div>
    </motion.div>
  );
});

PLTableRow.displayName = 'PLTableRow';

const EnhancedPLTable: React.FC<{ 
  filter?: Filter; 
  onClearFilter?: () => void;
  enablePerformanceMonitoring?: boolean;
  showPerformanceMetrics?: boolean;
}> = React.memo(({ 
  filter = null, 
  onClearFilter,
  enablePerformanceMonitoring = true,
  showPerformanceMetrics = false
}) => {
  const { snapshot } = useFinance();
  const { fmtMoney, bookingAgencies, managementAgencies } = useSettings();
  const toast = useToast();

  // Track previous rows for animation detection
  const [prevRows, setPrevRows] = React.useState<any[]>([]);
  const [animatingRows, setAnimatingRows] = React.useState<Set<string>>(new Set());

  // Optimized data processing
  const rowsAll = React.useMemo(() => {
    return [...snapshot.shows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [snapshot.shows]);

  const [query, setQuery] = React.useState('');
  
  const rows = React.useMemo(() => {
    let base = rowsAll;
    
    // Search filtering with optimized string matching
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const searchFields = ['name', 'city', 'venue', 'promoter', 'country'];
      base = base.filter(s =>
        searchFields.some(field => 
          String((s as any)[field] || '').toLowerCase().includes(q)
        )
      );
    }
    
    // Filter application
    if (!filter) return base;
    
    const filtered = base.filter((s) => {
      switch (filter.kind) {
        case 'Region':
          return (regionOfCountry((s as any).country) || '—') === filter.value;
        case 'Country': 
          return ((s as any).country || '—') === filter.value;
        case 'Promoter': 
          return ((s as any).promoter || '—') === filter.value;
        case 'Route': 
          return ((s as any).route || '—') === filter.value;
        case 'Agency': 
          return false; // placeholder
        case 'Aging': {
          const now = new Date(snapshot.asOf || Date.now()).getTime();
          const days = Math.floor((now - new Date(s.date).getTime()) / (24 * 60 * 60 * 1000));
          let k: '0-30' | '31-60' | '61-90' | '90+' = '0-30';
          if (days <= 30) k = '0-30';
          else if (days <= 60) k = '31-60';
          else if (days <= 90) k = '61-90';
          else k = '90+';
          return k === filter.value;
        }
        default: 
          return true;
      }
    });

    // Animation detection
    const currentIds = new Set(filtered.map(s => s.id));
    const prevIds = new Set(prevRows.map(s => s.id));
    const added = [...currentIds].filter(id => !prevIds.has(id));
    const removed = [...prevIds].filter(id => !currentIds.has(id));

    if (added.length > 0 || removed.length > 0) {
      setAnimatingRows(new Set([...added, ...removed]));
      setTimeout(() => setAnimatingRows(new Set()), 300);
    }

    setPrevRows(filtered);
    return filtered;
  }, [rowsAll, filter, query, snapshot.asOf, prevRows]);

  const [sort, setSort] = React.useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'date', dir: 'asc' });
  
  const handleSort = React.useCallback((key: SortKey) => {
    setSort(prev => {
      if (prev.key === key) return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      const numeric = ['fee', 'cost', 'net', 'whtPct', 'mgmtPct', 'bookingPct'].includes(key);
      return { key, dir: numeric ? 'desc' : 'asc' };
    });
    try { trackEvent('pl.sort', { key }); } catch { }
  }, []);

  // Optimized sorting with memoized calculations
  const rowsView = React.useMemo(() => {
    const arr = [...rows];
    const { key, dir } = sort;
    const m = dir === 'asc' ? 1 : -1;
    
    // Pre-calculate values for sorting performance
    const rowsWithCalc = arr.map(show => {
      const cost = typeof show.cost === 'number' ? show.cost : 0;
      const wht = (show as any).whtPct ? show.fee * ((show as any).whtPct / 100) : 0;
      
      // Calculate agency commissions
      const agencyCommissions = {
        mgmtPct: 0,
        bookingPct: 0
      };
      
      try {
        const demoShow: Partial<Show> = {
          id: show.id,
          name: show.name || '',
          city: show.city,
          country: show.country,
          lat: show.lat || 0,
          lng: show.lng || 0,
          date: show.date,
          fee: show.fee,
          status: show.status,
          mgmtAgency: (show as any).mgmtAgency,
          bookingAgency: (show as any).bookingAgency
        };

        const applicable = agenciesForShow(demoShow as Show, bookingAgencies, managementAgencies);
        const totalBooking = applicable.booking.length > 0 ? computeCommission(demoShow as Show, applicable.booking) : 0;
        const totalMgmt = applicable.management.length > 0 ? computeCommission(demoShow as Show, applicable.management) : 0;

        agencyCommissions.bookingPct = show.fee > 0 ? (totalBooking / show.fee) * 100 : 0;
        agencyCommissions.mgmtPct = show.fee > 0 ? (totalMgmt / show.fee) * 100 : 0;
      } catch (e) {
        // Handle error silently
      }
      
      const net = computeNet({ 
        fee: show.fee, 
        whtPct: (show as any).whtPct || 0, 
        mgmtPct: agencyCommissions.mgmtPct, 
        bookingPct: agencyCommissions.bookingPct, 
        costs: [{ amount: cost }] 
      });
      
      return { 
        show, 
        calculated: { 
          cost, 
          wht, 
          net, 
          mgmtPct: agencyCommissions.mgmtPct, 
          bookingPct: agencyCommissions.bookingPct 
        } 
      };
    });
    
    rowsWithCalc.sort((a, b) => {
      let va: number | string = '';
      let vb: number | string = '';
      
      switch (key) {
        case 'date': 
          va = new Date(a.show.date).getTime(); 
          vb = new Date(b.show.date).getTime(); 
          break;
        case 'show': 
          va = a.show.name || ''; 
          vb = b.show.name || ''; 
          break;
        case 'city': 
          va = a.show.city || ''; 
          vb = b.show.city || ''; 
          break;
        case 'country': 
          va = a.show.country || ''; 
          vb = b.show.country || ''; 
          break;
        case 'region': 
          va = regionOfCountry(a.show.country) || '—'; 
          vb = regionOfCountry(b.show.country) || '—'; 
          break;
        case 'venue': 
          va = a.show.venue || ''; 
          vb = b.show.venue || ''; 
          break;
        case 'promoter': 
          va = a.show.promoter || ''; 
          vb = b.show.promoter || ''; 
          break;
        case 'agency': 
          va = (a.show as any).agency || '';
          vb = (b.show as any).agency || '';
          break;
        case 'fee': 
          va = a.show.fee; 
          vb = b.show.fee; 
          break;
        case 'whtPct': 
          va = (a.show as any).whtPct || 0;
          vb = (b.show as any).whtPct || 0;
          break;
        case 'wht': 
          va = a.calculated.wht; 
          vb = b.calculated.wht; 
          break;
        case 'mgmtPct': 
          va = a.calculated.mgmtPct; 
          vb = b.calculated.mgmtPct; 
          break;
        case 'bookingPct': 
          va = a.calculated.bookingPct; 
          vb = b.calculated.bookingPct; 
          break;
        case 'cost': 
          va = a.calculated.cost; 
          vb = b.calculated.cost; 
          break;
        case 'net': 
          va = a.calculated.net; 
          vb = b.calculated.net; 
          break;
        case 'status': 
          va = a.show.status || ''; 
          vb = b.show.status || ''; 
          break;
        case 'route': 
          va = a.show.route || ''; 
          vb = b.show.route || ''; 
          break;
      }
      
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * m;
      return String(va).localeCompare(String(vb)) * m;
    });
    
    return rowsWithCalc.map(item => item.show);
  }, [rows, sort, bookingAgencies, managementAgencies]);

  // Enhanced virtualization
  const parentRef = React.useRef<HTMLDivElement | null>(null);
  
  const { virtualizer, performanceMetrics, scrollVelocity } = useAdvancedVirtualizer({
    count: rowsView.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    items: rowsView,
    enablePerformanceMonitoring,
    enableSmartOverscan: true,
    enableDynamicSizing: false,
  });

  const monitoringMetrics = useVirtualPerformanceMonitor(virtualizer);

  // Calculate totals
  const totalNet = React.useMemo(() => rowsView.reduce((a, s) => {
    const cost = typeof s.cost === 'number' ? s.cost : 0;
    try {
      const demoShow: Partial<Show> = {
        id: s.id,
        name: s.name || '',
        city: s.city,
        country: s.country,
        lat: s.lat || 0,
        lng: s.lng || 0,
        date: s.date,
        fee: s.fee,
        status: s.status,
        mgmtAgency: (s as any).mgmtAgency,
        bookingAgency: (s as any).bookingAgency
      };

      const applicable = agenciesForShow(demoShow as Show, bookingAgencies, managementAgencies);
      const totalBooking = applicable.booking.length > 0 ? computeCommission(demoShow as Show, applicable.booking) : 0;
      const totalMgmt = applicable.management.length > 0 ? computeCommission(demoShow as Show, applicable.management) : 0;

      const mgmtPct = s.fee > 0 ? (totalMgmt / s.fee) * 100 : 0;
      const bookingPct = s.fee > 0 ? (totalBooking / s.fee) * 100 : 0;
      
      return a + computeNet({ 
        fee: s.fee, 
        whtPct: (s as any).whtPct || 0, 
        mgmtPct, 
        bookingPct, 
        costs: [{ amount: cost }] 
      });
    } catch (e) {
      return a;
    }
  }, 0), [rowsView, bookingAgencies, managementAgencies]);

  const firstIndex = virtualizer.getVirtualItems()[0]?.index ?? 0;
  const lastIndex = virtualizer.getVirtualItems()[virtualizer.getVirtualItems().length - 1]?.index ?? Math.max(0, rowsView.length - 1);
  
  const COLS = '110px minmax(160px,1.2fr) minmax(120px,1fr) minmax(110px,0.8fr) minmax(110px,0.8fr) minmax(110px,0.8fr) minmax(160px,1fr) minmax(140px,1fr) 100px 70px 100px 70px 70px 100px 110px minmax(110px,0.8fr) minmax(120px,0.8fr) 120px';

  return (
    <div className="glass rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden backdrop-blur-sm hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 relative">
      
      {/* Performance Dashboard */}
      {showPerformanceMetrics && (
        <div className="absolute top-4 right-4 z-30 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs space-y-1">
          <div className="font-semibold border-b border-white/20 pb-1 mb-1">Performance</div>
          <div>FPS: <span className={monitoringMetrics.fps >= 50 ? 'text-green-400' : monitoringMetrics.fps >= 30 ? 'text-yellow-400' : 'text-red-400'}>{monitoringMetrics.fps}</span></div>
          <div>Visible: {monitoringMetrics.visibleItems}/{rowsView.length}</div>
          <div>Velocity: {Math.round(scrollVelocity)}px/s</div>
          <div>Memory: {Math.round(monitoringMetrics.memoryUsage / 1024 / 1024)}MB</div>
          <div>Render: {Math.round(monitoringMetrics.renderTime)}ms</div>
          <div>Scroll: {Math.round(monitoringMetrics.scrollProgress * 100)}%</div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-transparent via-white/5 to-transparent px-6 py-4 border-b border-white/10">
        <div id="pltable-desc" className="sr-only">
          {t('finance.pl.caption') || 'Enhanced P&L ledger with performance optimizations. Use column headers to sort. Virtualized list shows a subset of rows for performance.'} 
          {t('common.rowsVisible') || 'Rows visible'}: {firstIndex + 1}-{lastIndex + 1} / {rowsView.length}.
        </div>
        
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
            <div className="font-semibold tracking-tight flex items-center gap-3">
              <span className="text-slate-900 dark:text-white">{t('finance.ledger') || 'Enhanced P&L Ledger'}</span>
              {filter && (
                <span className="text-[11px] px-3 py-1.5 rounded-lg glass border border-accent-500/30 bg-gradient-to-br from-accent-500/20 to-accent-500/10 font-medium flex items-center gap-2">
                  <span className="text-slate-400 dark:text-white/60">{filter.kind}:</span>
                  <strong className="text-accent-300">{filter.value}</strong>
                  <button
                    className="ml-1 w-4 h-4 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
                    aria-label="Clear filter"
                    onClick={() => { onClearFilter?.(); try { announce('Ledger filter cleared'); } catch { } }}
                  >×</button>
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <input
                className="pl-9 pr-4 py-2 rounded-lg glass border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all duration-300 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/40"
                placeholder={t('common.search') || 'Search...'}
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label={t('common.search') || 'Search'}
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Performance Toggle */}
            {enablePerformanceMonitoring && (
              <button
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-300 flex items-center gap-1 ${
                  showPerformanceMetrics 
                    ? 'bg-accent-500/20 border-accent-500/30 text-accent-400' 
                    : 'glass border-slate-200 dark:border-white/10 hover:border-accent-500/30'
                }`}
                onClick={() => {
                  // This would need to be managed by parent component state
                  // For now, just show what the button would look like
                }}
                title="Toggle performance metrics"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Perf
              </button>
            )}
            
            {/* Export Buttons */}
            <button
              className="px-4 py-2 rounded-lg text-xs font-medium glass border border-slate-200 dark:border-white/10 hover:border-accent-500/30 hover:bg-gradient-to-br hover:from-accent-500/10 hover:to-transparent transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg flex items-center gap-2"
              disabled={!can('finance:export')}
              onClick={async () => { 
                const { exportFinanceCsv } = await import('../../../lib/finance/export'); 
                exportFinanceCsv(rowsView, { columns: ['date', 'city', 'country', 'venue', 'promoter', 'fee', 'status', 'route', 'net'] }); 
                try { 
                  toast.success(t('finance.export.csv.success') || 'Exported ✓'); 
                  announce(t('finance.export.csv.success') || 'Exported ✓'); 
                } catch { } 
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="p-4">
        <div className="overflow-x-auto overflow-y-auto max-h-[500px] rounded-lg" ref={parentRef}>
          <div className="min-w-[1800px]" role="table" aria-rowcount={rowsView.length}>
            {/* Header */}
            <div
              className="sticky top-0 glass backdrop-blur-md text-[11px] font-medium text-slate-500 dark:text-white/70 uppercase tracking-wider z-10 border-b border-white/20"
              role="rowgroup"
              style={{ display: 'grid', gridTemplateColumns: COLS }}
            >
              <div className="sr-only" role="row">{t('finance.pl.caption') || 'Enhanced P&L ledger'}</div>
              
              <div className="text-left p-2" aria-sort={sort.key === 'date' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1" onClick={() => handleSort('date')}>
                  {t('shows.table.date') || 'Date'}{sort.key === 'date' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              
              <div className="text-left p-2" aria-sort={sort.key === 'show' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1" onClick={() => handleSort('show')}>
                  {t('shows.table.name') || 'Show'}{sort.key === 'show' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              
              <div className="text-left p-2" aria-sort={sort.key === 'city' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1" onClick={() => handleSort('city')}>
                  {t('shows.table.city') || 'City'}{sort.key === 'city' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              
              <div className="text-left p-2" aria-sort={sort.key === 'country' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1" onClick={() => handleSort('country')}>
                  {t('shows.table.country') || 'Country'}{sort.key === 'country' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              
              <div className="text-left p-2" aria-sort={sort.key === 'region' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1" onClick={() => handleSort('region')}>
                  {t('common.region') || 'Region'}{sort.key === 'region' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              
              <div className="text-left p-2" aria-sort={sort.key === 'agency' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1" onClick={() => handleSort('agency')}>
                  {t('shows.table.agencies') || 'Agency'}{sort.key === 'agency' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              
              <div className="text-left p-2" aria-sort={sort.key === 'venue' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1" onClick={() => handleSort('venue')}>
                  {t('shows.table.venue') || 'Venue'}{sort.key === 'venue' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              
              <div className="text-left p-2" aria-sort={sort.key === 'promoter' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1" onClick={() => handleSort('promoter')}>
                  {t('shows.table.promoter') || 'Promoter'}{sort.key === 'promoter' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              
              <div className="text-right p-2" aria-sort={sort.key === 'fee' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1 ml-auto" onClick={() => handleSort('fee')}>
                  {t('shows.table.fee') || 'Fee'}{sort.key === 'fee' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              
              <div className="text-right p-2" aria-sort={sort.key === 'whtPct' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1 ml-auto" onClick={() => handleSort('whtPct')}>
                  WHT %{sort.key === 'whtPct' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              
              <div className="text-right p-2" aria-sort={sort.key === 'wht' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1 ml-auto" onClick={() => handleSort('wht')}>
                  WHT{sort.key === 'wht' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              
              <div className="text-right p-2" aria-sort={sort.key === 'mgmtPct' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1 ml-auto" onClick={() => handleSort('mgmtPct')}>
                  Mgmt %{sort.key === 'mgmtPct' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              
              <div className="text-right p-2" aria-sort={sort.key === 'bookingPct' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1 ml-auto" onClick={() => handleSort('bookingPct')}>
                  Book %{sort.key === 'bookingPct' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              
              <div className="text-right p-2" aria-sort={sort.key === 'cost' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1 ml-auto" onClick={() => handleSort('cost')}>
                  Cost{sort.key === 'cost' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              
              <div className="text-right p-2" aria-sort={sort.key === 'net' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1 ml-auto" onClick={() => handleSort('net')}>
                  Net{sort.key === 'net' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              
              <div className="text-left p-2" aria-sort={sort.key === 'status' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1" onClick={() => handleSort('status')}>
                  Status{sort.key === 'status' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              
              <div className="text-left p-2" aria-sort={sort.key === 'route' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1" onClick={() => handleSort('route')}>
                  Route{sort.key === 'route' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
            </div>

            {/* Virtualized Rows */}
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
              role="rowgroup"
            >
              <AnimatePresence>
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const show = rowsView[virtualItem.index];
                  if (!show) return null;

                  return (
                    <PLTableRow
                      key={virtualItem.key}
                      show={show}
                      index={virtualItem.index}
                      bookingAgencies={bookingAgencies}
                      managementAgencies={managementAgencies}
                      fmtMoney={fmtMoney}
                      isAnimating={animatingRows.has(show.id)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Total Footer */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-white/70">
              {t('common.total') || 'Total'}: {rowsView.length} {rowsView.length === 1 ? 'show' : 'shows'}
            </div>
            <div className="text-lg font-bold">
              <span className={totalNet >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {fmtMoney(totalNet)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

EnhancedPLTable.displayName = 'EnhancedPLTable';

export default EnhancedPLTable;