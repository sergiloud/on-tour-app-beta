import React from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { useSettings } from '../../../context/SettingsContext';
import { t } from '../../../lib/i18n';
import { exportFinanceCsv } from '../../../lib/finance/export';
import { useToast } from '../../../ui/Toast';
import { announce } from '../../../lib/announcer';
import { trackEvent } from '../../../lib/telemetry';
import { useVirtualizer } from '@tanstack/react-virtual';
import { regionOfCountry } from '../../../lib/geo';
import { computeNet } from '../../../lib/computeNet';

type Filter = { kind: 'Region'|'Agency'|'Country'|'Promoter'|'Route'|'Aging'; value: string } | null;
type SortKey = 'date'|'show'|'city'|'country'|'region'|'venue'|'promoter'|'agency'|'fee'|'whtPct'|'wht'|'mgmtPct'|'bookingPct'|'cost'|'net'|'status'|'route';

const PLTable: React.FC<{ filter?: Filter; onClearFilter?: () => void }> = ({ filter = null, onClearFilter }) => {
  const { snapshot } = useFinance();
  const { fmtMoney } = useSettings();
  const toast = useToast();
  const rowsAll = React.useMemo(() => {
    // Keep a stable base order by date asc
    return [...snapshot.shows].sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [snapshot.shows]);
  const [query, setQuery] = React.useState('');
  const rows = React.useMemo(() => {
    let base = rowsAll;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      base = base.filter(s =>
        String((s as any).name||'').toLowerCase().includes(q) ||
        String(s.city||'').toLowerCase().includes(q) ||
        String((s as any).venue||'').toLowerCase().includes(q) ||
        String((s as any).promoter||'').toLowerCase().includes(q) ||
        String(s.country||'').toLowerCase().includes(q)
      );
    }
    if (!filter) return base;
    return base.filter((s) => {
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
          const days = Math.floor((now - new Date(s.date).getTime()) / (24*60*60*1000));
          let k: '0-30'|'31-60'|'61-90'|'90+' = '0-30';
          if (days <= 30) k = '0-30'; else if (days <= 60) k = '31-60'; else if (days <= 90) k = '61-90'; else k = '90+';
          return k === filter.value;
        }
        default: return true;
      }
    });
  }, [rowsAll, filter]);
  const [sort, setSort] = React.useState<{ key: SortKey; dir: 'asc'|'desc' }>({ key: 'date', dir: 'asc' });
  const handleSort = (key: SortKey) => {
    setSort(prev => {
      if (prev.key === key) return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      const numeric = key === 'fee' || key === 'cost' || key === 'net';
      return { key, dir: numeric ? 'desc' : 'asc' };
    });
    try { trackEvent('pl.sort', { key }); } catch {}
  };

  const rowsView = React.useMemo(() => {
    const arr = [...rows];
    const { key, dir } = sort;
    const m = dir === 'asc' ? 1 : -1;
    arr.sort((a,b) => {
      const costA = typeof (a as any).cost === 'number' ? (a as any).cost : 0;
      const costB = typeof (b as any).cost === 'number' ? (b as any).cost : 0;
      const whtA = (a as any).whtPct ? a.fee * ((a as any).whtPct/100) : 0;
      const whtB = (b as any).whtPct ? b.fee * ((b as any).whtPct/100) : 0;
      const mgmtA = (a as any).mgmtAgencyPct || (a as any).mgmtPct || 0;
      const bookA = (a as any).bookingAgencyPct || (a as any).bookingPct || 0;
      const mgmtB = (b as any).mgmtAgencyPct || (b as any).mgmtPct || 0;
      const bookB = (b as any).bookingAgencyPct || (b as any).bookingPct || 0;
      const netA = computeNet({ fee: a.fee, whtPct: (a as any).whtPct||0, mgmtPct: mgmtA, bookingPct: bookA, costs: [{ amount: costA }] });
      const netB = computeNet({ fee: b.fee, whtPct: (b as any).whtPct||0, mgmtPct: mgmtB, bookingPct: bookB, costs: [{ amount: costB }] });
      let va: number|string = '';
      let vb: number|string = '';
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
        case 'whtPct': va = (a as any).whtPct||0; vb = (b as any).whtPct||0; break;
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
  }, [rows, sort]);
  const totalNet = React.useMemo(()=> rowsView.reduce((a,s)=> {
    const cost = typeof (s as any).cost === 'number' ? (s as any).cost : 0;
    const mgmt = (s as any).mgmtAgencyPct || (s as any).mgmtPct || 0;
    const book = (s as any).bookingAgencyPct || (s as any).bookingPct || 0;
    return a + computeNet({ fee: s.fee, whtPct: (s as any).whtPct||0, mgmtPct: mgmt, bookingPct: book, costs: [{ amount: cost }] });
  }, 0), [rowsView]);

  // Virtualization
  const parentRef = React.useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: rowsView.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36, // approx row height
    overscan: 10,
  });
  const firstIndex = rowVirtualizer.getVirtualItems()[0]?.index ?? 0;
  const lastIndex = rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length-1]?.index ?? Math.max(0, rowsView.length-1);

  // Consistent column layout for header/body/footer to keep alignment
  const COLS = '110px minmax(160px,1.2fr) minmax(120px,1fr) minmax(110px,0.8fr) minmax(110px,0.8fr) minmax(110px,0.8fr) minmax(160px,1fr) minmax(140px,1fr) 100px 70px 100px 70px 70px 100px 110px minmax(110px,0.8fr) minmax(120px,0.8fr) 120px';

  return (
    <div className="p-3 rounded bg-white/5 border border-white/10 text-[12px]" aria-describedby="pltable-desc">
      <div id="pltable-desc" className="sr-only">
        {t('finance.pl.caption') || 'Profit and Loss ledger. Use column headers to sort. Virtualized list shows a subset of rows for performance.'} {t('common.rowsVisible') || 'Rows visible'}: {firstIndex+1}-{lastIndex+1} / {rowsView.length}.
      </div>
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium flex items-center gap-2">
          <span>{t('finance.ledger') || 'Ledger'}</span>
          {filter && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
              Filter: {filter.kind} = <strong className="font-medium">{filter.value}</strong>
              <button className="ml-2 opacity-80 hover:opacity-100" aria-label="Clear filter" onClick={()=>{ onClearFilter?.(); try { announce('Ledger filter cleared'); } catch {} }}>×</button>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            className="px-2 py-1 rounded bg-white/5 border border-white/10"
            placeholder={t('common.search') || 'Search'}
            value={query}
            onChange={e=> setQuery(e.target.value)}
            aria-label={t('common.search') || 'Search'}
          />
          <button
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/15"
            onClick={()=> { exportFinanceCsv(rowsView, { columns: ['date','city','country','venue','promoter','fee','status','route','net'] }); try { toast.success(t('finance.export.csv.success')||'Exported \u2713'); announce(t('finance.export.csv.success')||'Exported \u2713'); } catch {} }}
          >{t('actions.exportCsv') || 'Export CSV'}</button>
          <button
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/15"
            onClick={async () => {
              const XLSX = await import('xlsx');
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
              const ws = XLSX.utils.json_to_sheet(sheetRows as any);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, 'P&L');
              XLSX.writeFile(wb, 'finance-pl.xlsx');
              try { trackEvent('finance.export.complete', { type:'xlsx', count: rowsView.length }); } catch {}
              try { toast.success(t('finance.export.xlsx.success')||'Exported \u2713'); announce(t('finance.export.xlsx.success')||'Exported \u2713'); } catch {}
            }}
          >Export XLSX</button>
        </div>
      </div>
      <div className="overflow-auto max-h-[420px]" ref={parentRef}>
        <div className="min-w-[1200px]" role="table" aria-rowcount={rowsView.length}>
          {/* Header */}
          <div
            className="sticky top-0 bg-ink-900 text-[11px] opacity-80 z-10"
            role="rowgroup"
            style={{ display: 'grid', gridTemplateColumns: COLS }}
          >
            <div className="sr-only" role="row">{t('finance.pl.caption')||'Profit and Loss ledger'}</div>
            <div className="text-left p-2" aria-sort={sort.key==='date'? (sort.dir==='asc'?'ascending':'descending') : 'none'} role="columnheader">
              <button className="hover:underline flex items-center gap-1" onClick={()=>handleSort('date')}>
                {t('shows.table.date')||'Date'}{sort.key==='date' ? (sort.dir==='asc'?' ▲':' ▼') : ''}
              </button>
            </div>
            <div className="text-left p-2" aria-sort={sort.key==='show'? (sort.dir==='asc'?'ascending':'descending') : 'none'} role="columnheader">
              <button className="hover:underline flex items-center gap-1" onClick={()=>handleSort('show')}>
                {t('shows.table.name')||'Show'}{sort.key==='show' ? (sort.dir==='asc'?' ▲':' ▼') : ''}
              </button>
            </div>
            <div className="text-left p-2" aria-sort={sort.key==='city'? (sort.dir==='asc'?'ascending':'descending') : 'none'} role="columnheader">
              <button className="hover:underline flex items-center gap-1" onClick={()=>handleSort('city')}>
                {t('shows.table.city')||'City'}{sort.key==='city' ? (sort.dir==='asc'?' ▲':' ▼') : ''}
              </button>
            </div>
            <div className="text-left p-2" aria-sort={sort.key==='country'? (sort.dir==='asc'?'ascending':'descending') : 'none'} role="columnheader">
              <button className="hover:underline flex items-center gap-1" onClick={()=>handleSort('country')}>
                {t('shows.table.country')||'Country'}{sort.key==='country' ? (sort.dir==='asc'?' ▲':' ▼') : ''}
              </button>
            </div>
            <div className="text-left p-2" aria-sort={sort.key==='region'? (sort.dir==='asc'?'ascending':'descending') : 'none'} role="columnheader">
              <button className="hover:underline flex items-center gap-1" onClick={()=>handleSort('region')}>
                {t('common.region')||'Region'}{sort.key==='region' ? (sort.dir==='asc'?' ▲':' ▼') : ''}
              </button>
            </div>
            <div className="text-left p-2" aria-sort={sort.key==='agency'? (sort.dir==='asc'?'ascending':'descending') : 'none'} role="columnheader">
              <button className="hover:underline flex items-center gap-1" onClick={()=>handleSort('agency')}>
                {t('shows.table.agencies')||'Agency'}{sort.key==='agency' ? (sort.dir==='asc'?' ▲':' ▼') : ''}
              </button>
            </div>
            <div className="text-left p-2" aria-sort={sort.key==='venue'? (sort.dir==='asc'?'ascending':'descending') : 'none'} role="columnheader">
              <button className="hover:underline flex items-center gap-1" onClick={()=>handleSort('venue')}>
                {t('shows.table.venue')||'Venue'}{sort.key==='venue' ? (sort.dir==='asc'?' ▲':' ▼') : ''}
              </button>
            </div>
            <div className="text-left p-2" aria-sort={sort.key==='promoter'? (sort.dir==='asc'?'ascending':'descending') : 'none'} role="columnheader">
              <button className="hover:underline flex items-center gap-1" onClick={()=>handleSort('promoter')}>
                {t('shows.table.promoter')||'Promoter'}{sort.key==='promoter' ? (sort.dir==='asc'?' ▲':' ▼') : ''}
              </button>
            </div>
            <div className="text-right p-2" aria-sort={sort.key==='fee'? (sort.dir==='asc'?'ascending':'descending') : 'none'} role="columnheader">
              <button className="hover:underline flex items-center gap-1 float-right" onClick={()=>handleSort('fee')}>
                {t('shows.table.fee')||'Fee'}{sort.key==='fee' ? (sort.dir==='asc'?' ▲':' ▼') : ''}
              </button>
            </div>
            <div className="text-right p-2" aria-sort={sort.key==='whtPct'? (sort.dir==='asc'?'ascending':'descending') : 'none'} role="columnheader">
              <button className="hover:underline flex items-center gap-1 float-right" onClick={()=>handleSort('whtPct')}>
                {t('finance.whtPct')||'WHT %'}{sort.key==='whtPct' ? (sort.dir==='asc'?' ▲':' ▼') : ''}
              </button>
            </div>
            <div className="text-right p-2" aria-sort={sort.key==='wht'? (sort.dir==='asc'?'ascending':'descending') : 'none'} role="columnheader">
              <button className="hover:underline flex items-center gap-1 float-right" onClick={()=>handleSort('wht')}>
                {t('finance.wht')||'WHT'}{sort.key==='wht' ? (sort.dir==='asc'?' ▲':' ▼') : ''}
              </button>
            </div>
            <div className="text-right p-2" aria-sort={sort.key==='mgmtPct'? (sort.dir==='asc'?'ascending':'descending') : 'none'} role="columnheader">
              <button className="hover:underline flex items-center gap-1 float-right" onClick={()=>handleSort('mgmtPct')}>
                {t('finance.mgmtPct')||'Mgmt %'}{sort.key==='mgmtPct' ? (sort.dir==='asc'?' ▲':' ▼') : ''}
              </button>
            </div>
            <div className="text-right p-2" aria-sort={sort.key==='bookingPct'? (sort.dir==='asc'?'ascending':'descending') : 'none'} role="columnheader">
              <button className="hover:underline flex items-center gap-1 float-right" onClick={()=>handleSort('bookingPct')}>
                {t('finance.bookingPct')||'Booking %'}{sort.key==='bookingPct' ? (sort.dir==='asc'?' ▲':' ▼') : ''}
              </button>
            </div>
            <div className="text-right p-2" aria-sort={sort.key==='cost'? (sort.dir==='asc'?'ascending':'descending') : 'none'} role="columnheader">
              <button className="hover:underline flex items-center gap-1 float-right" onClick={()=>handleSort('cost')}>
                Cost{sort.key==='cost' ? (sort.dir==='asc'?' ▲':' ▼') : ''}
              </button>
            </div>
            <div className="text-right p-2" aria-sort={sort.key==='net'? (sort.dir==='asc'?'ascending':'descending') : 'none'} role="columnheader">
              <button className="hover:underline flex items-center gap-1 float-right" onClick={()=>handleSort('net')}>
                {t('shows.table.net')||'Net'}{sort.key==='net' ? (sort.dir==='asc'?' ▲':' ▼') : ''}
              </button>
            </div>
            <div className="text-left p-2" aria-sort={sort.key==='status'? (sort.dir==='asc'?'ascending':'descending') : 'none'} role="columnheader">
              <button className="hover:underline flex items-center gap-1" onClick={()=>handleSort('status')}>
                {t('shows.table.status')||'Status'}{sort.key==='status' ? (sort.dir==='asc'?' ▲':' ▼') : ''}
              </button>
            </div>
            <div className="text-left p-2" aria-sort={sort.key==='route'? (sort.dir==='asc'?'ascending':'descending') : 'none'} role="columnheader">
              <button className="hover:underline flex items-center gap-1" onClick={()=>handleSort('route')}>
                Route{sort.key==='route' ? (sort.dir==='asc'?' ▲':' ▼') : ''}
              </button>
            </div>
            <div className="text-left p-2" role="columnheader">{t('common.actions') || 'Actions'}</div>
          </div>

          {/* Body (virtualized) */}
          <div style={{ position: 'relative', height: rowVirtualizer.getTotalSize() }} role="rowgroup" aria-label={t('common.rowsVisible')||'Rows visible'}>
            {rowVirtualizer.getVirtualItems().map(vi => {
              const s = rowsView[vi.index];
              const cost = typeof (s as any).cost === 'number' ? (s as any).cost : 0;
              const whtPct = (s as any).whtPct || 0;
              const wht = s.fee * (whtPct/100);
              const mgmtPct = (s as any).mgmtAgencyPct || (s as any).mgmtPct || 0;
              const bookingPct = (s as any).bookingAgencyPct || (s as any).bookingPct || 0;
              const net = computeNet({ fee: s.fee, whtPct, mgmtPct, bookingPct, costs: [{ amount: cost }] });
              return (
                <div
                  key={s.id}
                  className="border-t border-white/10 leading-tight"
                  role="row"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${vi.start}px)`, display: 'grid', gridTemplateColumns: COLS }}
                >
                  <div className="p-2 whitespace-nowrap" role="cell">{s.date}</div>
                  <div className="p-2 truncate whitespace-nowrap" role="cell">{(s as any).name || ''}</div>
                  <div className="p-2 truncate whitespace-nowrap" role="cell">{s.city}</div>
                  <div className="p-2 truncate whitespace-nowrap" role="cell">{s.country}</div>
                  <div className="p-2 truncate whitespace-nowrap" role="cell">{regionOfCountry(s.country) || '—'}</div>
                  <div className="p-2 truncate whitespace-nowrap" role="cell">{(s as any).agency || ''}</div>
                  <div className="p-2 truncate whitespace-nowrap" role="cell">{(s as any).venue || ''}</div>
                  <div className="p-2 truncate whitespace-nowrap" role="cell">{(s as any).promoter || ''}</div>
                  <div className="p-2 text-right tabular-nums whitespace-nowrap" role="cell">{fmtMoney(s.fee)}</div>
                  <div className="p-2 text-right tabular-nums whitespace-nowrap" role="cell">{whtPct}%</div>
                  <div className="p-2 text-right tabular-nums whitespace-nowrap" role="cell">{fmtMoney(wht)}</div>
                  <div className="p-2 text-right tabular-nums whitespace-nowrap" role="cell">{mgmtPct}%</div>
                  <div className="p-2 text-right tabular-nums whitespace-nowrap" role="cell">{bookingPct}%</div>
                  <div className="p-2 text-right tabular-nums whitespace-nowrap" role="cell">{fmtMoney(cost)}</div>
                  <div className="p-2 text-right tabular-nums whitespace-nowrap" role="cell">{fmtMoney(net)}</div>
                  <div className="p-2 truncate whitespace-nowrap" role="cell">{s.status}</div>
                  <div className="p-2 truncate whitespace-nowrap" role="cell">{(s as any).route || ''}</div>
                  <div className="p-2 whitespace-nowrap" role="cell">
                    <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 mr-1" onClick={()=>{ try { trackEvent('pl.open', { id: s.id }); } catch {}; try { window.dispatchEvent(new CustomEvent('navigate', { detail: { to: `/dashboard/shows?edit=${encodeURIComponent(s.id)}` } } as any)); } catch {} }}>{t('common.open')||'Open'}</button>
                    <div className="relative inline-block">
                      <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" aria-haspopup="menu" aria-expanded={false} aria-label={t('common.moreActions')||'More actions'} onClick={(e)=>{
                        const btn = e.currentTarget as HTMLButtonElement;
                        const menu = btn.nextElementSibling as HTMLDivElement | null;
                        if (menu) {
                          menu.classList.toggle('hidden');
                          const first = menu.querySelector('button');
                          (first as HTMLButtonElement | null)?.focus();
                        }
                      }}>…</button>
                      <div className="absolute right-0 mt-1 w-40 bg-ink-800 border border-white/10 rounded shadow hidden" role="menu" aria-label={t('common.actions')||'Actions'}>
                        <button role="menuitem" className="block w-full text-left px-3 py-1 hover:bg-white/10" onClick={()=>{
                          try { navigator.clipboard.writeText(JSON.stringify(s)); toast.success(t('common.copied')||'Copied \u2713'); } catch {}
                        }}>{t('actions.copyRow')||'Copy row'}</button>
                        <button role="menuitem" className="block w-full text-left px-3 py-1 hover:bg-white/10" onClick={()=>{
                          exportFinanceCsv([s] as any, { columns: ['date','city','country','venue','promoter','fee','status','route','net'] });
                        }}>{t('actions.exportRowCsv')||'Export row (CSV)'}</button>
                        <button role="menuitem" className="block w-full text-left px-3 py-1 hover:bg-white/10" onClick={()=>{
                          try { window.dispatchEvent(new CustomEvent('navigate', { detail: { to: `/dashboard/shows?edit=${encodeURIComponent(s.id)}` } } as any)); } catch {}
                        }}>{t('actions.goToShow')||'Go to show'}</button>
                        <button role="menuitem" className="block w-full text-left px-3 py-1 hover:bg-white/10" onClick={()=>{
                          try { window.dispatchEvent(new CustomEvent('navigate', { detail: { to: `/dashboard/shows?edit=${encodeURIComponent(s.id)}&tab=costs` } } as any)); } catch {}
                        }}>{t('actions.openCosts')||'Open costs'}</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div
            className="sticky bottom-0 bg-ink-900 border-t border-white/10 font-medium"
            role="rowgroup"
            style={{ display: 'grid', gridTemplateColumns: COLS }}
          >
            <div className="p-2" role="cell">{t('common.total')||'Total'}</div>
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
  );
};

export default PLTable;
