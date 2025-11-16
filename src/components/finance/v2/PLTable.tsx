import React from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { useSettings } from '../../../context/SettingsContext';
import { t } from '../../../lib/i18n';
// Dynamic import for exportFinanceCsv to reduce bundle size
import { useToast } from '../../../ui/Toast';
import { announce } from '../../../lib/announcer';
import { trackEvent } from '../../../lib/telemetry';
import { useVirtualizer } from '@tanstack/react-virtual';
import { regionOfCountry } from '../../../lib/geo';
import { computeNet } from '../../../lib/computeNet';
import { can } from '../../../lib/tenants';
import { AnimatePresence, motion } from 'framer-motion';
import { agenciesForShow, computeCommission } from '../../../lib/agencies';
import type { Show } from '../../../lib/shows';
import { sanitizeName } from '../../../lib/sanitize';

type Filter = { kind: 'Region' | 'Agency' | 'Country' | 'Promoter' | 'Route' | 'Aging'; value: string } | null;
type SortKey = 'date' | 'show' | 'city' | 'country' | 'region' | 'venue' | 'promoter' | 'agency' | 'fee' | 'whtPct' | 'wht' | 'mgmtPct' | 'bookingPct' | 'cost' | 'net' | 'status' | 'route';

// Helper function to calculate agency commissions for a show
function calculateAgencyCommissions(show: any, bookingAgencies: any[], managementAgencies: any[]): { totalCommission: number; bookingPct: number; mgmtPct: number } {
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
      mgmtAgency: show.mgmtAgency,       // Include selected agencies
      bookingAgency: show.bookingAgency  // for commission calculation
    };

    const applicable = agenciesForShow(demoShow as Show, bookingAgencies, managementAgencies);
    const totalBooking = applicable.booking.length > 0 ? computeCommission(demoShow as Show, applicable.booking) : 0;
    const totalMgmt = applicable.management.length > 0 ? computeCommission(demoShow as Show, applicable.management) : 0;

    const totalCommission = totalBooking + totalMgmt;
    const bookingPct = show.fee > 0 ? (totalBooking / show.fee) * 100 : 0;
    const mgmtPct = show.fee > 0 ? (totalMgmt / show.fee) * 100 : 0;

    return { totalCommission, bookingPct, mgmtPct };
  } catch (e) {
    console.error('[PLTable] Error calculating agency commissions:', e);
    return { totalCommission: 0, bookingPct: 0, mgmtPct: 0 };
  }
}

const PLTable: React.FC<{ filter?: Filter; onClearFilter?: () => void }> = React.memo(({ filter = null, onClearFilter }) => {
  const { snapshot } = useFinance();
  const { fmtMoney, bookingAgencies, managementAgencies } = useSettings();
  const toast = useToast();

  // Track previous rows for animation detection
  const [prevRows, setPrevRows] = React.useState<any[]>([]);
  const [animatingRows, setAnimatingRows] = React.useState<Set<string>>(new Set());

  const rowsAll = React.useMemo(() => {
    // Keep a stable base order by date asc
    return [...snapshot.shows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [snapshot.shows]);
  const [query, setQuery] = React.useState('');
  const rows = React.useMemo(() => {
    let base = rowsAll;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      base = base.filter(s =>
        String((s as any).name || '').toLowerCase().includes(q) ||
        String(s.city || '').toLowerCase().includes(q) ||
        String((s as any).venue || '').toLowerCase().includes(q) ||
        String((s as any).promoter || '').toLowerCase().includes(q) ||
        String(s.country || '').toLowerCase().includes(q)
      );
    }
    if (!filter) return base;
    const filtered = base.filter((s) => {
      switch (filter.kind) {
        case 'Region': {
          // Region derived from country in selectors; recompute here
          return (regionOfCountry((s as any).country) || '—') === filter.value;
        }
        case 'Country': return ((s as any).country || '—') === filter.value;
        case 'Promoter': return ((s as any).promoter || '—') === filter.value;
        case 'Route': return ((s as any).route || '—') === filter.value;
        case 'Agency': return false; // placeholder until agency field exists
        case 'Aging': {
          // Match the AR bucket of this show against filter.value using same logic as selectARAgingV2
          const now = new Date(snapshot.asOf || Date.now()).getTime();
          const days = Math.floor((now - new Date(s.date).getTime()) / (24 * 60 * 60 * 1000));
          let k: '0-30' | '31-60' | '61-90' | '90+' = '0-30';
          if (days <= 30) k = '0-30'; else if (days <= 60) k = '31-60'; else if (days <= 90) k = '61-90'; else k = '90+';
          return k === filter.value;
        }
        default: return true;
      }
    });

    // Detect changes for animation
    const currentIds = new Set(filtered.map(s => s.id));
    const prevIds = new Set(prevRows.map(s => s.id));
    const added = [...currentIds].filter(id => !prevIds.has(id));
    const removed = [...prevIds].filter(id => !currentIds.has(id));

    if (added.length > 0 || removed.length > 0) {
      setAnimatingRows(new Set([...added, ...removed]));
      // Clear animation after transition
      setTimeout(() => setAnimatingRows(new Set()), 300);
    }

    setPrevRows(filtered);
    return filtered;
  }, [rowsAll, filter, query, snapshot.asOf]);
  const [sort, setSort] = React.useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'date', dir: 'asc' });
  const handleSort = (key: SortKey) => {
    setSort(prev => {
      if (prev.key === key) return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      const numeric = key === 'fee' || key === 'cost' || key === 'net';
      return { key, dir: numeric ? 'desc' : 'asc' };
    });
    try { trackEvent('pl.sort', { key }); } catch { }
  };

  const rowsView = React.useMemo(() => {
    const arr = [...rows];
    const { key, dir } = sort;
    const m = dir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      const costA = typeof (a as any).cost === 'number' ? (a as any).cost : 0;
      const costB = typeof (b as any).cost === 'number' ? (b as any).cost : 0;
      const whtA = (a as any).whtPct ? a.fee * ((a as any).whtPct / 100) : 0;
      const whtB = (b as any).whtPct ? b.fee * ((b as any).whtPct / 100) : 0;

      // Calculate agency commissions dynamically
      const agencyA = calculateAgencyCommissions(a, bookingAgencies, managementAgencies);
      const agencyB = calculateAgencyCommissions(b, bookingAgencies, managementAgencies);
      const mgmtA = agencyA.mgmtPct;
      const bookA = agencyA.bookingPct;
      const mgmtB = agencyB.mgmtPct;
      const bookB = agencyB.bookingPct;

      const netA = computeNet({ fee: a.fee, whtPct: (a as any).whtPct || 0, mgmtPct: mgmtA, bookingPct: bookA, costs: [{ amount: costA }] });
      const netB = computeNet({ fee: b.fee, whtPct: (b as any).whtPct || 0, mgmtPct: mgmtB, bookingPct: bookB, costs: [{ amount: costB }] });
      let va: number | string = '';
      let vb: number | string = '';
      switch (key) {
        case 'date': va = new Date(a.date).getTime(); vb = new Date(b.date).getTime(); break;
        case 'show': va = (a as any).name || ''; vb = (b as any).name || ''; break;
        case 'city': va = (a as any).city || ''; vb = (b as any).city || ''; break;
        case 'country': va = (a as any).country || ''; vb = (b as any).country || ''; break;
        case 'region': va = regionOfCountry((a as any).country) || '—'; vb = regionOfCountry((b as any).country) || '—'; break;
        case 'venue': va = (a as any).venue || ''; vb = (b as any).venue || ''; break;
        case 'promoter': va = (a as any).promoter || ''; vb = (b as any).promoter || ''; break;
        case 'agency': va = (a as any).agency || ''; vb = (b as any).agency || ''; break;
        case 'fee': va = a.fee; vb = b.fee; break;
        case 'whtPct': va = (a as any).whtPct || 0; vb = (b as any).whtPct || 0; break;
        case 'wht': va = whtA; vb = whtB; break;
        case 'mgmtPct': va = mgmtA; vb = mgmtB; break;
        case 'bookingPct': va = bookA; vb = bookB; break;
        case 'cost': va = costA; vb = costB; break;
        case 'net': va = netA; vb = netB; break;
        case 'status': va = (a as any).status || ''; vb = (b as any).status || ''; break;
        case 'route': va = (a as any).route || ''; vb = (b as any).route || ''; break;
      }
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * m;
      return String(va).localeCompare(String(vb)) * m;
    });
    return arr;
  }, [rows, sort, bookingAgencies, managementAgencies]);

  const totalNet = React.useMemo(() => rowsView.reduce((a, s) => {
    const cost = typeof (s as any).cost === 'number' ? (s as any).cost : 0;
    const agency = calculateAgencyCommissions(s, bookingAgencies, managementAgencies);
    return a + computeNet({ fee: s.fee, whtPct: (s as any).whtPct || 0, mgmtPct: agency.mgmtPct, bookingPct: agency.bookingPct, costs: [{ amount: cost }] });
  }, 0), [rowsView, bookingAgencies, managementAgencies]);

  // Virtualization
  const parentRef = React.useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: rowsView.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36, // approx row height
    overscan: 10,
  });
  const firstIndex = rowVirtualizer.getVirtualItems()[0]?.index ?? 0;
  const lastIndex = rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1]?.index ?? Math.max(0, rowsView.length - 1);

  // Consistent column layout for header/body/footer to keep alignment
  const COLS = '110px minmax(160px,1.2fr) minmax(120px,1fr) minmax(110px,0.8fr) minmax(110px,0.8fr) minmax(110px,0.8fr) minmax(160px,1fr) minmax(140px,1fr) 100px 70px 100px 70px 70px 100px 110px minmax(110px,0.8fr) minmax(120px,0.8fr) 120px';

  return (
    <div className="glass rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden backdrop-blur-sm hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-transparent via-white/5 to-transparent px-6 py-4 border-b border-white/10">
        <div id="pltable-desc" className="sr-only">
          {t('finance.pl.caption') || 'Profit and Loss ledger. Use column headers to sort. Virtualized list shows a subset of rows for performance.'} {t('common.rowsVisible') || 'Rows visible'}: {firstIndex + 1}-{lastIndex + 1} / {rowsView.length}.
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
            <div className="font-semibold tracking-tight flex items-center gap-3">
              <span className="text-slate-900 dark:text-white">{t('finance.ledger') || 'P&L Ledger'}</span>
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
            <button
              className="px-4 py-2 rounded-lg text-xs font-medium glass border border-slate-200 dark:border-white/10 hover:border-accent-500/30 hover:bg-gradient-to-br hover:from-accent-500/10 hover:to-transparent transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg flex items-center gap-2"
              disabled={!can('finance:export')}
              onClick={async () => { const { exportFinanceCsv } = await import('../../../lib/finance/export'); exportFinanceCsv(rowsView, { columns: ['date', 'city', 'country', 'venue', 'promoter', 'fee', 'status', 'route', 'net'] }); try { toast.success(t('finance.export.csv.success') || 'Exported ✓'); announce(t('finance.export.csv.success') || 'Exported ✓'); } catch { } }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>
            <button
              className="px-4 py-2 rounded-lg text-xs font-medium glass border border-slate-200 dark:border-white/10 hover:border-accent-500/30 hover:bg-gradient-to-br hover:from-accent-500/10 hover:to-transparent transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg flex items-center gap-2"
              disabled={!can('finance:export')}
              onClick={async () => {
                const ExcelJS = await import('exceljs');
                // Build a simple worksheet from current rows
                const sheetRows = rowsView.map((s) => {
                  const cost = typeof (s as any).cost === 'number' ? (s as any).cost : 0;
                  const net = s.fee - cost;
                  return {
                    Date: s.date,
                    City: s.city,
                    Country: s.country,
                    Venue: (s as any).venue || '',
                    Promoter: (s as any).promoter || '',
                    Fee: s.fee,
                    Cost: cost,
                    Net: net,
                    Status: s.status,
                    Route: (s as any).route || '',
                  };
                });

                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('P&L');

                // Add columns with headers
                worksheet.columns = Object.keys(sheetRows[0] || {}).map(key => ({
                  header: key,
                  key: key,
                  width: key === 'Venue' || key === 'Promoter' ? 25 : 15
                }));

                // Style header
                worksheet.getRow(1).font = { bold: true };
                worksheet.getRow(1).fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFE5E7EB' }
                };

                // Add data
                sheetRows.forEach(row => worksheet.addRow(row));

                // Download
                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], {
                  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'finance-pl.xlsx';
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);

                try { trackEvent('finance.export.complete', { type: 'xlsx', count: rowsView.length }); } catch { }
                try { toast.success(t('finance.export.xlsx.success') || 'Exported ✓'); announce(t('finance.export.xlsx.success') || 'Exported ✓'); } catch { }
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              XLSX
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
              <div className="sr-only" role="row">{t('finance.pl.caption') || 'Profit and Loss ledger'}</div>
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
                <button className="hover:underline flex items-center gap-1 float-right" onClick={() => handleSort('fee')}>
                  {t('shows.table.fee') || 'Fee'}{sort.key === 'fee' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              <div className="text-right p-2" aria-sort={sort.key === 'whtPct' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1 float-right" onClick={() => handleSort('whtPct')}>
                  {t('finance.whtPct') || 'WHT %'}{sort.key === 'whtPct' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              <div className="text-right p-2" aria-sort={sort.key === 'wht' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1 float-right" onClick={() => handleSort('wht')}>
                  {t('finance.wht') || 'WHT'}{sort.key === 'wht' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              <div className="text-right p-2" aria-sort={sort.key === 'mgmtPct' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1 float-right" onClick={() => handleSort('mgmtPct')}>
                  {t('finance.mgmtPct') || 'Mgmt %'}{sort.key === 'mgmtPct' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              <div className="text-right p-2" aria-sort={sort.key === 'bookingPct' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1 float-right" onClick={() => handleSort('bookingPct')}>
                  {t('finance.bookingPct') || 'Booking %'}{sort.key === 'bookingPct' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              <div className="text-right p-2" aria-sort={sort.key === 'cost' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1 float-right" onClick={() => handleSort('cost')}>
                  Cost{sort.key === 'cost' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              <div className="text-right p-2" aria-sort={sort.key === 'net' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1 float-right" onClick={() => handleSort('net')}>
                  {t('shows.table.net') || 'Net'}{sort.key === 'net' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              <div className="text-left p-2" aria-sort={sort.key === 'status' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1" onClick={() => handleSort('status')}>
                  {t('shows.table.status') || 'Status'}{sort.key === 'status' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              <div className="text-left p-2" aria-sort={sort.key === 'route' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} role="columnheader">
                <button className="hover:underline flex items-center gap-1" onClick={() => handleSort('route')}>
                  Route{sort.key === 'route' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </button>
              </div>
              <div className="text-left p-2" role="columnheader">{t('common.actions') || 'Actions'}</div>
            </div>

            {/* Body (virtualized) */}
            <div style={{ position: 'relative', height: rowVirtualizer.getTotalSize() }} role="rowgroup" aria-label={t('common.rowsVisible') || 'Rows visible'}>
              <AnimatePresence mode="popLayout">
                {rowVirtualizer.getVirtualItems().map(vi => {
                  const s = rowsView[vi.index];
                  if (!s) return null; // Skip undefined rows
                  const cost = typeof (s as any).cost === 'number' ? (s as any).cost : 0;
                  const whtPct = (s as any).whtPct || 0;
                  const wht = s.fee * (whtPct / 100);

                  // Calculate agency commissions dynamically
                  const agency = calculateAgencyCommissions(s, bookingAgencies, managementAgencies);
                  const mgmtPct = agency.mgmtPct;
                  const bookingPct = agency.bookingPct;

                  const net = computeNet({ fee: s.fee, whtPct, mgmtPct, bookingPct, costs: [{ amount: cost }] });
                  const isAnimating = animatingRows.has(s.id);
                  return (
                    <motion.div
                      key={s.id}
                      className="border-t border-slate-200 dark:border-white/10 leading-tight"
                      role="row"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${vi.start}px)`, display: 'grid', gridTemplateColumns: COLS }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      layout
                    >
                      <div className="p-2 whitespace-nowrap" role="cell">{s.date}</div>
                      <div className="p-2 truncate whitespace-nowrap" role="cell">{sanitizeName((s as any).name || '')}</div>
                      <div className="p-2 truncate whitespace-nowrap" role="cell">{sanitizeName(s.city)}</div>
                      <div className="p-2 truncate whitespace-nowrap" role="cell">{s.country}</div>
                      <div className="p-2 truncate whitespace-nowrap" role="cell">{regionOfCountry(s.country) || '—'}</div>
                      <div className="p-2 truncate whitespace-nowrap" role="cell">{sanitizeName((s as any).agency || '')}</div>
                      <div className="p-2 truncate whitespace-nowrap" role="cell">{sanitizeName((s as any).venue || '')}</div>
                      <div className="p-2 truncate whitespace-nowrap" role="cell">{sanitizeName((s as any).promoter || '')}</div>
                      <div className="p-2 text-right tabular-nums whitespace-nowrap" role="cell">{fmtMoney(s.fee)}</div>
                      <div className="p-2 text-right tabular-nums whitespace-nowrap" role="cell">{whtPct}%</div>
                      <div className="p-2 text-right tabular-nums whitespace-nowrap" role="cell">{fmtMoney(wht)}</div>
                      <div className="p-2 text-right tabular-nums whitespace-nowrap" role="cell">{mgmtPct}%</div>
                      <div className="p-2 text-right tabular-nums whitespace-nowrap" role="cell">{bookingPct}%</div>
                      <div className="p-2 text-right tabular-nums whitespace-nowrap" role="cell">{fmtMoney(cost)}</div>
                      <motion.div
                        className="p-2 text-right tabular-nums whitespace-nowrap"
                        role="cell"
                        animate={{
                          color: isAnimating ? (net > 0 ? '#10b981' : '#ef4444') : 'inherit',
                          scale: isAnimating ? 1.05 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {fmtMoney(net)}
                      </motion.div>
                      <div className="p-2 truncate whitespace-nowrap" role="cell">{s.status}</div>
                      <div className="p-2 truncate whitespace-nowrap" role="cell">{(s as any).route || ''}</div>
                      <div className="p-2 whitespace-nowrap flex gap-1.5" role="cell">
                        <button className="px-3 py-1 rounded-lg text-xs font-medium glass border border-slate-200 dark:border-white/10 hover:border-accent-500/30 hover:bg-gradient-to-br hover:from-accent-500/10 hover:to-transparent transition-all duration-300 hover:shadow-lg" onClick={() => { try { trackEvent('pl.open', { id: s.id }); } catch { }; try { window.dispatchEvent(new CustomEvent('navigate', { detail: { to: `/dashboard/shows?edit=${encodeURIComponent(s.id)}` } } as any)); } catch { } }}>{t('common.open') || 'Open'}</button>
                        <div className="relative inline-block">
                          <button className="px-2.5 py-1 rounded-lg text-xs font-medium glass border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 transition-all duration-300" aria-haspopup="menu" aria-expanded={false} aria-label={t('common.moreActions') || 'More actions'} onClick={(e) => {
                            const btn = e.currentTarget as HTMLButtonElement;
                            const menu = btn.nextElementSibling as HTMLDivElement | null;
                            if (menu) {
                              menu.classList.toggle('hidden');
                              const first = menu.querySelector('button');
                              (first as HTMLButtonElement | null)?.focus();
                            }
                          }}>…</button>
                          <div className="absolute right-0 mt-1 w-40 bg-ink-800 border border-slate-200 dark:border-white/10 rounded shadow hidden" role="menu" aria-label={t('common.actions') || 'Actions'}>
                            <button role="menuitem" className="block w-full text-left px-3 py-1 hover:bg-slate-200 dark:bg-white/10" onClick={() => {
                              try { navigator.clipboard.writeText(JSON.stringify(s)); toast.success(t('common.copied') || 'Copied \u2713'); } catch { }
                            }}>{t('actions.copyRow') || 'Copy row'}</button>
                            <button role="menuitem" className="block w-full text-left px-3 py-1 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 disabled:opacity-50" disabled={!can('finance:export')} onClick={async () => {
                              if (!can('finance:export')) return;
                              const { exportFinanceCsv } = await import('../../../lib/finance/export');
                              exportFinanceCsv([s] as any, { columns: ['date', 'city', 'country', 'venue', 'promoter', 'fee', 'status', 'route', 'net'] });
                            }}>{t('actions.exportRowCsv') || 'Export row (CSV)'}</button>
                            <button role="menuitem" className="block w-full text-left px-3 py-1 hover:bg-slate-200 dark:bg-white/10" onClick={() => {
                              try { window.dispatchEvent(new CustomEvent('navigate', { detail: { to: `/dashboard/shows?edit=${encodeURIComponent(s.id)}` } } as any)); } catch { }
                            }}>{t('actions.goToShow') || 'Go to show'}</button>
                            <button role="menuitem" className="block w-full text-left px-3 py-1 hover:bg-slate-200 dark:bg-white/10" onClick={() => {
                              try { window.dispatchEvent(new CustomEvent('navigate', { detail: { to: `/dashboard/shows?edit=${encodeURIComponent(s.id)}&tab=costs` } } as any)); } catch { }
                            }}>{t('actions.openCosts') || 'Open costs'}</button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div
              className="sticky bottom-0 bg-ink-900 border-t border-slate-200 dark:border-white/10 font-medium"
              role="rowgroup"
              style={{ display: 'grid', gridTemplateColumns: COLS }}
            >
              <div className="p-2" role="cell">{t('common.total') || 'Total'}</div>
              <div className="p-2" role="cell"></div>
              <div className="p-2" role="cell"></div>
              <div className="p-2" role="cell"></div>
              <div className="p-2" role="cell"></div>
              <div className="p-2" role="cell"></div>
              <div className="p-2" role="cell"></div>
              <div className="p-2" role="cell"></div>
              <div className="p-2" role="cell"></div>
              <div className="p-2" role="cell"></div>
              <div className="p-2" role="cell"></div>
              <div className="p-2" role="cell"></div>
              <div className="p-2" role="cell"></div>
              <div className="p-2" role="cell"></div>
              <div className="p-2 text-right tabular-nums" role="cell">{fmtMoney(totalNet)}</div>
              <div className="p-2" role="cell"></div>
              <div className="p-2" role="cell"></div>
              <div className="p-2" role="cell"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PLTable.displayName = 'PLTable';

export default PLTable;
