// Shows page – definitive clean implementation
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useShows } from '../../hooks/useShows';
import { useSettings } from '../../context/SettingsContext';
import { useDebounce } from '../../hooks/useDebounce';
import { DemoShow } from '../../lib/demoShows';
import { regionOf } from '../../features/shows/selectors';
import { t } from '../../lib/i18n';
import { loadShowsPrefs, saveShowsPrefs } from '../../lib/showsPrefs';
import { trackEvent } from '../../lib/telemetry';
import { announce } from '../../lib/announcer';
import { Chip } from '../../ui/Chip';
import StatusBadge from '../../ui/StatusBadge';
import { useToast } from '../../ui/Toast';
import ShowEditorDrawer from '../../features/shows/editor/ShowEditorDrawer';
import { countryLabel } from '../../lib/countries';
import { exportShowsCsv, exportShowsXlsx } from '../../lib/shows/export';

export type DraftShow = DemoShow & { venue?:string; whtPct?:number; mgmtAgency?:string; bookingAgency?:string; notes?:string; costs?: any[] };
type ViewMode = 'list'|'board';
type SortKey = 'date'|'fee'|'net';

const Shows: React.FC = () => {
  const { shows, add, update, remove } = useShows();
  const { fmtMoney, lang } = useSettings();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const boot = useRef<any>(()=>{ try { return loadShowsPrefs(); } catch { return {}; } }) as any;

  // state
  const [qInput, setQInput] = useState('');
  const q = useDebounce(qInput, 120);
  const [view, setView] = useState<ViewMode>(()=> boot.current.view || 'list');
  const [dateRange, setDateRange] = useState<{from:string;to:string}>(()=> boot.current.dateRange || {from:'',to:''});
  const [region, setRegion] = useState<'all'|'AMER'|'EMEA'|'APAC'>(()=> boot.current.region || 'all');
  const [feeRange, setFeeRange] = useState<{min?:number;max?:number}>(()=> boot.current.feeRange || {});
  const [statusOn, setStatusOn] = useState<Record<'confirmed'|'pending'|'offer'|'canceled'|'archived'|'postponed', boolean>>(()=> boot.current.statusOn || { confirmed:true,pending:true,offer:true,canceled:false,archived:false, postponed:true });
  const [sort, setSort] = useState<{key:SortKey;dir:'asc'|'desc'}>(()=> boot.current.sort || { key:'date', dir:'desc' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<DemoShow['status']>('confirmed');
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportCols, setExportCols] = useState<Record<string, boolean>>({ 'Date':true,'City':true,'Country':true,'Venue':true,'WHT %':true,'Fee':true,'Net':true,'Status':true,'Notes':true });
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<'add'|'edit'>('add');
  const [draft, setDraft] = useState<DraftShow|null>(null);
  const [costs, setCosts] = useState<any[]>([]);
  const lastTriggerRef = useRef<HTMLElement|null>(null);
  const [totalsVisible, setTotalsVisible] = useState<boolean>(()=> boot.current.totalsVisible ?? true);
  const [totalsPinned, setTotalsPinned] = useState<boolean>(()=> boot.current.totalsPinned ?? false);
  const [whtVisible, setWhtVisible] = useState<boolean>(()=> boot.current.whtVisible ?? true);

  // persist prefs
  useEffect(()=>{ saveShowsPrefs({ view }); }, [view]);
  useEffect(()=>{ saveShowsPrefs({ dateRange }); }, [dateRange]);
  useEffect(()=>{ saveShowsPrefs({ region }); }, [region]);
  useEffect(()=>{ saveShowsPrefs({ feeRange }); }, [feeRange.min, feeRange.max]);
  useEffect(()=>{ saveShowsPrefs({ statusOn }); }, [statusOn]);
  useEffect(()=>{ saveShowsPrefs({ sort }); }, [sort]);
  useEffect(()=>{ saveShowsPrefs({ totalsVisible }); }, [totalsVisible]);
  useEffect(()=>{ saveShowsPrefs({ totalsPinned }); }, [totalsPinned]);
  useEffect(()=>{ saveShowsPrefs({ whtVisible }); }, [whtVisible]);

  // telemetry
  useEffect(()=>{ if(q) trackEvent('shows.search',{ qLen:q.length }); }, [q]);

  // filtering
  const filtered = useMemo(()=> {
    const s = q.trim().toLowerCase();
    return shows.filter(x => {
      if (!statusOn[x.status as keyof typeof statusOn]) return false;
      if (dateRange.from || dateRange.to){
        const d = new Date(x.date).getTime();
        if (dateRange.from){ const fromTs = new Date(dateRange.from).getTime(); if(Number.isFinite(fromTs) && d < fromTs) return false; }
        if (dateRange.to){ const toTs = new Date(dateRange.to+'T23:59:59').getTime(); if(Number.isFinite(toTs) && d > toTs) return false; }
      }
      if (region !== 'all' && regionOf(x.country) !== region) return false;
      if (typeof feeRange.min==='number' && x.fee < feeRange.min) return false;
      if (typeof feeRange.max==='number' && x.fee > feeRange.max) return false;
      if (!s) return true;
      const notes = String((x as any).notes||'').toLowerCase();
      const venue = String((x as any).venue||'').toLowerCase();
      return x.city.toLowerCase().includes(s) || x.country.toLowerCase().includes(s) || venue.includes(s) || notes.includes(s);
    });
  }, [shows, q, statusOn, dateRange.from, dateRange.to, region, feeRange.min, feeRange.max]);

  // counts per status under current non-status filters (so counts unaffected by turning status chips off show potential totals)
  const statusCounts = useMemo(()=> {
    const base = shows.filter(x => {
      // exclude status gating; reuse other filters only
      if (dateRange.from || dateRange.to){
        const d = new Date(x.date).getTime();
        if (dateRange.from){ const fromTs = new Date(dateRange.from).getTime(); if(Number.isFinite(fromTs) && d < fromTs) return false; }
        if (dateRange.to){ const toTs = new Date(dateRange.to+'T23:59:59').getTime(); if(Number.isFinite(toTs) && d > toTs) return false; }
      }
      if (region !== 'all' && regionOf(x.country) !== region) return false;
      if (typeof feeRange.min==='number' && x.fee < feeRange.min) return false;
      if (typeof feeRange.max==='number' && x.fee > feeRange.max) return false;
      const s = q.trim().toLowerCase();
      if (!s) return true;
      const notes = String((x as any).notes||'').toLowerCase();
      const venue = String((x as any).venue||'').toLowerCase();
      return x.city.toLowerCase().includes(s) || x.country.toLowerCase().includes(s) || venue.includes(s) || notes.includes(s);
    });
    const counts: Record<string, number> = { confirmed:0, pending:0, offer:0, canceled:0, archived:0, postponed:0 };
    base.forEach(b=> { counts[b.status] = (counts[b.status]||0)+1; });
    return counts;
  }, [shows, q, dateRange.from, dateRange.to, region, feeRange.min, feeRange.max]);

  // rows + net
  const rows = useMemo(()=> {
    const calcNet = (s:DemoShow) => {
      const whtPct = (s as any).whtPct||0; const wht = s.fee * (whtPct/100);
      const mgmtPct = (s as any).mgmtAgencyPct||0; const bookPct = (s as any).bookingAgencyPct||0;
      const comm = s.fee * ((mgmtPct+bookPct)/100);
      const costsTotal = (((s as any).costs)||[]).reduce((n:number,c:any)=> n + (c.amount||0),0);
      return s.fee - wht - comm - costsTotal;
    };
    const r = filtered.map(s=> ({ s, net: calcNet(s) }));
    const dir = sort.dir==='asc'?1:-1;
    r.sort((a,b)=>{
      if (sort.key==='date') return (new Date(a.s.date).getTime() - new Date(b.s.date).getTime())*dir;
      if (sort.key==='fee') return (a.s.fee - b.s.fee)*dir;
      if (sort.key==='net') return (a.net - b.net)*dir;
      return 0;
    });
    return r;
  }, [filtered, sort]);

  // virtualization
  const parentRef = useRef<HTMLDivElement>(null);
  const enableVirtual = rows.length > 200;
  const virtualizer = useVirtualizer({ count: rows.length, getScrollElement: ()=> parentRef.current, estimateSize: ()=> 44, overscan: 8 });
  const virtualItems = enableVirtual ? virtualizer.getVirtualItems() : [];
  const topSpacer = enableVirtual && virtualItems[0]? virtualItems[0].start : 0;
  const bottomSpacer = enableVirtual && virtualItems.length? (virtualizer.getTotalSize() - virtualItems[virtualItems.length-1].end) : 0;
  const visibleRows = enableVirtual ? virtualItems.map(v=> rows[v.index]) : rows;
  const allVisibleSelected = visibleRows.length>0 && visibleRows.every(r=> selected.has(r.s.id));

  // metrics (totals + averages)
  const { totalFee, totalNet, avgWht, avgFee, avgMarginPct } = useMemo(()=> {
    if (!rows.length) return { totalFee:0, totalNet:0, avgWht:0, avgFee:0, avgMarginPct:0 };
    let fee=0, net=0, wSum=0, marginSum=0, marginCount=0;
    for(const r of rows){
      fee+=r.s.fee; net+=r.net; wSum += ((r.s as any).whtPct||0);
      if (r.s.fee>0){ const pct = (r.net / r.s.fee) * 100; if(Number.isFinite(pct)){ marginSum += pct; marginCount++; } }
    }
    const avgFeeVal = fee / rows.length;
    const avgMargin = marginCount ? (marginSum / marginCount) : 0;
    return { totalFee:fee, totalNet:net, avgWht:Math.round(wSum/rows.length), avgFee:avgFeeVal, avgMarginPct:Math.round(avgMargin) };
  }, [rows]);

  // board aggregation (offer/pending/confirmed columns)
  const boardStatuses: ('offer'|'pending'|'confirmed')[] = ['offer','pending','confirmed'];
  const boardStats = useMemo(()=> {
    const stats: Record<string,{count:number; net:number}> = {};
    for(const st of boardStatuses) stats[st] = { count:0, net:0 };
    for(const r of rows){ const st = r.s.status as any; if(boardStatuses.includes(st)){ stats[st].count++; stats[st].net += r.net; } }
    return stats;
  }, [rows]);

  // export
  const exportCsv = (selectedOnly?:boolean) => {
    const { count, cols } = exportShowsCsv(rows as any, exportCols, selectedOnly? selected : undefined, 'shows');
    trackEvent('shows.csv.export',{ count, cols });
    toast.success(t('shows.export.csv.success')||'Exported ✓');
  };
  const exportXlsx = async(selectedOnly?:boolean) => {
    setExporting(true);
    try {
      const { count, cols } = await exportShowsXlsx(rows as any, exportCols, selectedOnly? selected : undefined, 'shows');
      trackEvent('shows.xlsx.export',{ count, cols });
      toast.success(t('shows.export.xlsx.success')||'Exported ✓');
    } catch (e){
      console.warn(e);
    } finally { setExporting(false); }
  };

  // bulk
  const toggleSelectOne = (id:string)=> setSelected(prev=>{ const next=new Set(prev); next.has(id)?next.delete(id):next.add(id); return next; });
  const applyBulkStatus = () => {
    for(const id of selected) update(id, { status: bulkStatus } as any);
    const msg = (t('shows.toast.bulk.status')||'Status: {status} ({n})').replace('{status}', String(bulkStatus)).replace('{n}', String(selected.size));
    toast.show(msg, { tone:'success' });
    trackEvent('shows.bulk.setStatus',{count:selected.size,status:bulkStatus});
    setSelected(new Set());
  };
  const applyBulkConfirm = () => {
    for(const id of selected) update(id, { status:'confirmed' } as any);
    const msg = (t('shows.toast.bulk.confirmed')||'Confirmed ({n})').replace('{n}', String(selected.size));
    toast.show(msg, { tone:'success' });
    trackEvent('shows.bulk.confirm',{count:selected.size});
    setSelected(new Set());
  };
  const applyBulkWht = (pct:number) => {
    for(const id of selected) update(id, { whtPct:pct } as any);
    const msg = (t('shows.toast.bulk.wht')||'WHT {pct}% ({n})').replace('{pct}', String(pct)).replace('{n}', String(selected.size));
    toast.show(msg, { tone:'success' });
    trackEvent('shows.bulk.setWht',{count:selected.size,pct});
    setSelected(new Set());
  };

  // drawer
  const openAdd = () => { lastTriggerRef.current = document.activeElement as HTMLElement; setMode('add'); setDraft({ city:'', country:'', date:new Date().toISOString().slice(0,10), fee:5000, lat:0, lng:0, status:'pending', whtPct:0 } as any); setCosts([]); setModalOpen(true); announce('Add show'); trackEvent('shows.drawer.open',{mode:'add'}); };
  const openEdit = (s:DemoShow) => { lastTriggerRef.current = document.activeElement as HTMLElement; setMode('edit'); setDraft({ ...(s as any) }); setCosts(((s as any).costs)||[]); setModalOpen(true); announce('Edit show: '+s.city); trackEvent('shows.drawer.open',{mode:'edit'}); };
  const closeDrawer = () => { setModalOpen(false); trackEvent('shows.drawer.close'); try { lastTriggerRef.current?.focus(); } catch{} if (searchParams.get('add') || searchParams.get('edit')) navigate('/dashboard/shows',{replace:true}); };
  const saveDraft = (d:DraftShow) => { if (mode==='add'){ const id=(()=>{try{return crypto.randomUUID();}catch{return 's'+Date.now();}})(); add({ ...(d as any), id, costs}); } else if (mode==='edit'&&d.id) { update(d.id,{...(d as any), costs} as any); } announce('Saved'); trackEvent('shows.drawer.save',{mode}); };
  const deleteDraft = (d:DraftShow) => { if(mode==='edit'&&d.id){ remove(d.id); trackEvent('shows.drawer.delete'); } };

  // deep link
  useEffect(()=>{ const addFlag = searchParams.get('add'); if (addFlag==='1') openAdd(); }, [searchParams]);
  useEffect(()=>{ const id = searchParams.get('edit'); if (!id) return; const f = shows.find(s=>s.id===id); f? openEdit(f): navigate('/dashboard/shows',{replace:true}); }, [searchParams, shows]);

  const clearFilters = () => { setQInput(''); setDateRange({from:'',to:''}); setRegion('all'); setFeeRange({}); setStatusOn({confirmed:true,pending:true,offer:true,canceled:false,archived:false,postponed:true}); announce('Filters cleared'); trackEvent('shows.filter.clear'); };

  return (
    <>
      <div className="max-w-[1400px] ml-2 md:ml-3 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold tracking-tight">{t('shows.title')||'Shows'}</h2>
          <div className="flex gap-2 items-center relative">
            <input aria-label={t('shows.search.placeholder')||'Search'} value={qInput} onChange={e=> setQInput(e.target.value)} placeholder={t('shows.search.placeholder')||'Search city/country'} className="px-3 py-2 rounded bg-white/5 border border-white/12 hover:border-white/20 focus-ring text-sm" />
            <button onClick={()=> setExportOpen(o=>!o)} className="px-3 py-2 rounded bg-white/10 hover:bg-white/15 text-sm">{t('shows.exportCsv')||'Export'}{exporting && <span className="ml-2 text-[11px] opacity-70">{t('common.exporting')||'…'}</span>}</button>
            <button type="button" onClick={openAdd} className="px-4 py-2 rounded-full bg-accent-500 text-black text-sm shadow-glow hover:brightness-110">{t('shows.add')||'Add show'}</button>
            {exportOpen && (
              <div className="absolute top-full right-0 mt-2 glass rounded p-3 text-xs border border-white/12 min-w-[260px] z-20">
                <div className="font-semibold mb-2">{t('export.columns')||'Columns'}</div>
                <div className="grid grid-cols-2 gap-1 mb-2">
                  {(Object.keys(exportCols) as (keyof typeof exportCols)[]).map(k=> (
                    <label key={k} className="inline-flex items-center gap-1"><input type="checkbox" checked={exportCols[k]} onChange={e=> setExportCols(c=>({ ...c, [k]: e.target.checked }))} /> {k}</label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={()=> exportCsv(selected.size>0)} disabled={exporting}>CSV</button>
                  <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={()=> exportXlsx(selected.size>0)} disabled={exporting}>XLSX</button>
                  <button className="ml-auto text-[11px] underline" onClick={()=> setExportOpen(false)}>{t('common.close')||'Close'}</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status & filters */}
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5" role="group" aria-label={t('shows.filters.statusGroup')||'Status filters'}>
            {(['confirmed','pending','offer','canceled','archived','postponed'] as const).map(st=> {
              const count = statusCounts[st];
              return (
                <Chip key={st} active={statusOn[st]} onClick={()=> setStatusOn(p=> ({...p, [st]: !p[st]}))} size="sm" tone={st==='confirmed'?'accent': st==='pending'?'warn': st==='offer'?'default': st==='canceled'?'danger':'default'} aria-label={`${st} (${count})`}>
                  {st} {count>0 && <span className="opacity-70">{count}</span>}
                </Chip>
              );
            })}
            <button className="ml-1 text-xs underline opacity-70 hover:opacity-100" onClick={()=> setStatusOn({ confirmed:true,pending:true,offer:true,canceled:false,archived:false,postponed:true })}>{t('common.reset')||'Reset'}</button>
          </div>
          <div className="flex items-center gap-3 ml-auto text-[11px]">
            <ViewToggle view={view} setView={setView} />
            <div className="relative flex items-center gap-1">
              <label className="flex items-center gap-1"><span>{t('shows.filters.from')||'From'}</span><input type="date" value={dateRange.from} onChange={e=> setDateRange(r=>({...r, from:e.target.value}))} className="px-2 py-1 rounded bg-white/5 border border-white/12 focus-ring" /></label>
              <label className="flex items-center gap-1"><span>{t('shows.filters.to')||'To'}</span><input type="date" value={dateRange.to} onChange={e=> setDateRange(r=>({...r, to:e.target.value}))} className="px-2 py-1 rounded bg-white/5 border border-white/12 focus-ring" /></label>
              <DatePresets onApply={(from,to)=> setDateRange({ from, to })} />
            </div>
            <label className="flex items-center gap-1"><span>{t('shows.filters.region')||'Region'}</span><select value={region} onChange={e=> setRegion(e.target.value as any)} className="bg-white/5 rounded px-1 py-0.5"><option value="all">All</option><option value="AMER">AMER</option><option value="EMEA">EMEA</option><option value="APAC">APAC</option></select></label>
            <label className="flex items-center gap-1"><span>{t('shows.filters.feeMin')||'Min'}</span><input aria-describedby="feeMinHint" type="number" value={feeRange.min ?? ''} onChange={e=> setFeeRange(fr=>({...fr, min:e.target.value===''?undefined:Number(e.target.value)}))} className="w-20 px-2 py-1 rounded bg-white/5 border border-white/12 focus-ring" /></label>
            <span id="feeMinHint" className="sr-only">{t('shows.filters.feeMin')||'Min fee'}</span>
            <label className="flex items-center gap-1"><span>{t('shows.filters.feeMax')||'Max'}</span><input aria-describedby="feeMaxHint" type="number" value={feeRange.max ?? ''} onChange={e=> setFeeRange(fr=>({...fr, max:e.target.value===''?undefined:Number(e.target.value)}))} className="w-20 px-2 py-1 rounded bg-white/5 border border-white/12 focus-ring" /></label>
            <span id="feeMaxHint" className="sr-only">{t('shows.filters.feeMax')||'Max fee'}</span>
            <button className="text-xs underline opacity-70 hover:opacity-100" onClick={clearFilters}>{t('filters.clear')||'Clear'}</button>
            <div className="opacity-70 whitespace-nowrap">{rows.length} {t('shows.items')||'items'}</div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2" aria-live="polite">
          <SummaryCard label={t('shows.summary.upcoming')||'Upcoming'}>{filtered.length}</SummaryCard>
          <SummaryCard label={t('shows.summary.totalFees')||'Total Fees'}>{fmtMoney(totalFee)}</SummaryCard>
          <SummaryCard label={t('shows.summary.estNet')||'Est. Net'}>{fmtMoney(totalNet)}</SummaryCard>
          <SummaryCard label={t('shows.summary.avgWht')||'Avg WHT'}>{avgWht}%</SummaryCard>
        </div>

        {/* Table / Board */}
        {view==='list' ? (
          <div className={`glass rounded-lg relative ${enableVirtual? 'max-h-[70vh] overflow-y-auto':'overflow-hidden'}`} ref={parentRef}>
            <table className="w-full text-sm">
              <thead className="text-left sticky top-0 z-10 backdrop-blur-xl bg-ink-900/40 border-b border-white/10">
                <tr>
                  <th scope="col" className="px-3 py-2"><input aria-label={t('shows.selectAll')||'Select all'} type="checkbox" checked={allVisibleSelected} onChange={()=> { const all = allVisibleSelected; if(all) setSelected(new Set()); else setSelected(new Set(visibleRows.map(r=> r.s.id))); }} /></th>
                  <ThSort label={t('shows.table.date')||'Date'} active={sort.key==='date'} dir={sort.dir} onClick={()=> setSort(s=>({ key:'date', dir: s.key==='date' && s.dir==='desc' ? 'asc':'desc'}))} />
                  <th scope="col" className="px-3 py-2 text-xs uppercase tracking-wide">{t('shows.table.name')||'Name'}</th>
                  <th scope="col" className="px-3 py-2 text-xs uppercase tracking-wide">{t('shows.table.city')||'City'}</th>
                  <th scope="col" className="px-3 py-2 text-xs uppercase tracking-wide">{t('shows.table.country')||'Country'}</th>
                  <ThSort label={t('shows.table.fee')||'Fee'} numeric active={sort.key==='fee'} dir={sort.dir} onClick={()=> setSort(s=>({ key:'fee', dir: s.key==='fee' && s.dir==='desc' ? 'asc':'desc'}))} />
                  {whtVisible && <th scope="col" className="px-3 py-2 text-xs uppercase tracking-wide">{t('shows.columns.wht')||'WHT %'} <button onClick={()=> setWhtVisible(false)} className="ml-1 text-[10px] underline opacity-60 hover:opacity-100" aria-label={t('shows.wht.hide')||'Hide WHT column'}>×</button></th>}
                  <ThSort label={t('shows.table.net')||'Net'} numeric active={sort.key==='net'} dir={sort.dir} onClick={()=> setSort(s=>({ key:'net', dir: s.key==='net' && s.dir==='desc' ? 'asc':'desc'}))} />
                  <th scope="col" className="px-3 py-2 text-xs uppercase tracking-wide">{t('shows.table.margin')||'Margin %'}</th>
                  <th scope="col" className="px-3 py-2 text-xs uppercase tracking-wide">{t('shows.table.status')||'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {enableVirtual && <tr style={{height:topSpacer}} aria-hidden><td colSpan={8} /></tr>}
                {visibleRows.map(({s, net}) => (
                  <tr key={s.id} className="odd:bg-white/3 hover:bg-white/7">
                    <td className="px-3 py-2"><input aria-label={t('shows.selectRow')||'Select'} type="checkbox" checked={selected.has(s.id)} onChange={()=> toggleSelectOne(s.id)} /></td>
                    <td className="px-3 py-2 whitespace-nowrap" title={s.date} aria-label={(() => {
                      const today = new Date(); const showD = new Date(s.date); const diffDays = Math.round((showD.getTime() - today.getTime())/86400000); if(diffDays===0) return t('common.today')||'Today'; if(diffDays===1) return t('common.tomorrow')||'Tomorrow'; if(diffDays>1) return (t('shows.relative.inDays')||'In {n} days').replace('{n}', String(diffDays)); if(diffDays===-1) return t('shows.relative.yesterday')||'Yesterday'; return (t('shows.relative.daysAgo')||'{n} days ago').replace('{n}', String(Math.abs(diffDays))); })()}>{s.date.slice(0,10)}</td>
                    <td className="px-3 py-2 max-w-[180px] truncate" title={s.name || (s as any).venue || ''}>{s.name || (s as any).venue || <span className="opacity-40">—</span>}</td>
                    <td className="px-3 py-2">{s.city}</td>
                    <td className="px-3 py-2">{countryLabel(s.country, lang)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmtMoney(s.fee)}</td>
                    {whtVisible && <td className="px-3 py-2 text-right tabular-nums">{(s as any).whtPct ?? 0}%</td>}
                    <td className="px-3 py-2 text-right tabular-nums">
                      <span
                        className="inline-block px-1.5 py-0.5 rounded bg-accent-500/10 border border-accent-500/25 text-accent-50 tabular-nums"
                        title={(t('shows.margin.tooltip')||t('shows.tooltip.margin')||'Net divided by Fee (%)') + (s.fee>0? ' • '+Math.round((net/s.fee)*100)+'%':'')}
                        aria-label={(t('shows.margin.tooltip')||'Margin % formula') + (s.fee>0? ': '+Math.round((net/s.fee)*100)+'%':'')}
                      >{fmtMoney(net)}</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {s.fee>0 && (
                        <span
                          className="px-1 py-0.5 rounded bg-accent-500/15 border border-accent-500/30 text-accent-200 tabular-nums text-[11px] inline-block min-w-[3ch] text-center"
                          title={(t('shows.tooltip.margin')||'Net divided by Fee (%)')+ ' • '+(Math.round((net/s.fee)*100))+'%'}
                          aria-label={(t('shows.tooltip.margin')||'Margin percentage')+': '+Math.round((net/s.fee)*100)+'%'}
                        >{Math.round((net/s.fee)*100)}%</span>
                      )}
                    </td>
                    <td className="px-3 py-2 flex items-center gap-2 relative">
                      <StatusBadge status={s.status as any}>{s.status}</StatusBadge>
                      <RowActionsMenu
                        show={s}
                        onEdit={()=> openEdit(s)}
                        onPromote={()=> {
                          const next = s.status==='offer'?'pending': s.status==='pending'?'confirmed': s.status;
                          if(next!==s.status){
                            update(s.id,{ status: next } as any);
                            toast.show((t('shows.editor.status.promote')||'Promoted to')+': '+next, { tone:'success' });
                            trackEvent('shows.promote.row',{ from:s.status, to:next });
                          }
                        }}
                        onDuplicate={()=> {
                          const id = (()=>{try{return crypto.randomUUID();}catch{return 's'+Date.now();}})();
                          // Deep clone costs to avoid mutating original
                          const costsClone = Array.isArray((s as any).costs) ? (s as any).costs.map((c:any)=> ({ ...c })) : [];
                          const nowIso = new Date().toISOString();
                          const clone: any = {
                            ...(s as any),
                            id,
                            name: (s.name|| (s as any).venue || s.city) + ' (copy)',
                            status: s.status==='archived' ? 'offer' : s.status, // copies of archived start fresh
                            costs: costsClone,
                            createdAt: nowIso,
                            archivedAt: undefined
                          };
                          add(clone);
                          toast.success(t('shows.action.duplicate')||'Duplicate');
                          trackEvent('shows.duplicate',{ source:s.id, new:id });
                        }}
                        onArchive={()=> { if(s.status!=='archived'){ update(s.id,{ status:'archived', archivedAt:new Date().toISOString() } as any); trackEvent('shows.archive',{ id:s.id }); toast.warn(t('shows.action.archive')||'Archive'); } }}
                        onRestore={()=> { if(s.status==='archived'){ update(s.id,{ status:'pending', archivedAt:undefined } as any); trackEvent('shows.restore',{ id:s.id }); toast.success(t('shows.action.restore')||'Restore'); } }}
                        onDelete={()=> { const ok = window.confirm((t('shows.action.delete')||'Delete')+'?'); if(!ok) return; remove(s.id); trackEvent('shows.delete',{ id:s.id }); toast.error(t('shows.action.delete')||'Delete'); }}
                      />
                    </td>
                  </tr>
                ))}
                {rows.length===0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-10 text-center">
                      <div className="space-y-3">
                        <div className="text-sm opacity-70">{t('shows.empty')||t('common.noResults')||'No results'}</div>
                        <div className="flex justify-center gap-3">
                          <button
                            type="button"
                            onClick={clearFilters}
                            className="px-3 py-2 rounded-full bg-white/10 hover:bg-white/15 text-sm"
                          >{t('filters.clear')||'Clear filters'}</button>
                          <button
                            type="button"
                            onClick={openAdd}
                            className="px-4 py-2 rounded-full bg-accent-500 text-black text-sm shadow-glow hover:brightness-110"
                          >{t('shows.empty.add')||t('shows.add')||'Add show'}</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {enableVirtual && <tr style={{height:bottomSpacer}} aria-hidden><td colSpan={8} /></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="glass rounded-lg p-4">
            <div className="text-xs opacity-70 mb-2">Board view – grouped by status</div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {boardStatuses.map(st => {
                const stat = boardStats[st];
                return (
                  <div key={st} className="glass rounded p-2 space-y-1" aria-label={`${st} ${t('shows.board.header.count')||'Shows'}: ${stat.count}. ${(t('shows.board.header.net')||'Net')}: ${fmtMoney(stat.net)}`}> 
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[11px] uppercase tracking-wide opacity-70">{st}</div>
                      <div className="text-[10px] leading-tight text-right opacity-80 tabular-nums">
                        <div title={t('shows.board.header.count')||'Shows'}>{stat.count}</div>
                        <div title={t('shows.board.header.net')||'Net'}>{fmtMoney(stat.net)}</div>
                      </div>
                    </div>
                    {rows.filter(r=> r.s.status===st).map(r=> {
                      const show = r.s;
                      const today = new Date();
                      const showD = new Date(show.date);
                      const diffDays = Math.round((showD.getTime() - today.getTime())/86400000);
                      const rel = (()=>{ if(diffDays===0) return t('common.today')||'Today'; if(diffDays===1) return t('common.tomorrow')||'Tomorrow'; if(diffDays>1) return (t('shows.relative.inDays')||'In {n} days').replace('{n}', String(diffDays)); if(diffDays===-1) return t('shows.relative.yesterday')||'Yesterday'; return (t('shows.relative.daysAgo')||'{n} days ago').replace('{n}', String(Math.abs(diffDays))); })();
                      const marginPct = show.fee>0 ? Math.round((r.net/show.fee)*100) : 0;
                      const primary = show.name || (show as any).venue || show.city;
                      const secondaryVenue = (show as any).venue && show.name ? (show as any).venue : '';
                      return (
                        <button
                          key={show.id}
                          onClick={()=> openEdit(show)}
                          className="w-full text-left rounded-md border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] px-2 py-2 flex flex-col gap-1 focus-ring"
                          aria-label={`${primary}. ${rel}. Net ${fmtMoney(r.net)}${show.fee>0?'. Margin '+marginPct+'%':''}`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-medium truncate">{primary}</div>
                              <div className="text-[10px] opacity-70 truncate flex items-center gap-1">
                                {secondaryVenue && <span className="truncate">{secondaryVenue}</span>}
                                <span className="truncate">{show.city}</span>
                                <span className="inline-block px-1 rounded bg-white/10 text-[9px] tracking-wide">{show.country}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 ml-1">
                              <span className="px-1 py-0.5 rounded bg-indigo-500/20 text-indigo-100 text-[10px] whitespace-nowrap" title={show.date}>{rel}</span>
                              <span className="tabular-nums text-[11px] font-semibold" title={t('shows.board.header.net')||'Net'}>{fmtMoney(r.net)}</span>
                              {show.fee>0 && (
                                <span className="px-1 py-0.5 rounded bg-accent-500/15 border border-accent-500/30 text-accent-200 tabular-nums text-[10px]" title={(t('shows.tooltip.margin')||'Margin %')+': '+marginPct+'%'} aria-label={(t('shows.tooltip.margin')||'Margin percentage')+': '+marginPct+'%'}>{marginPct}%</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {modalOpen && draft && (
          <ShowEditorDrawer
            open={modalOpen}
            mode={mode}
            initial={{ ...(draft as any), costs }}
            onSave={(d)=>{ setDraft(d as any); setCosts((d as any).costs||[]); saveDraft(d as any); closeDrawer(); }}
            onDelete={()=>{ draft && deleteDraft(draft); closeDrawer(); }}
            onRequestClose={closeDrawer}
          />
        )}

        {totalsVisible && (
          <div className={"fixed right-4 z-40 transition-all " + (totalsPinned ? 'bottom-4' : 'bottom-4 md:bottom-4') }>
            <div className="glass rounded-xl px-3 py-2 text-[11px] md:text-xs flex flex-wrap gap-x-4 gap-y-1 items-center max-w-[90vw]">
              <div className="opacity-80 whitespace-nowrap">{rows.length} {t('shows.items')||'items'}</div>
              <div className="whitespace-nowrap">{t('shows.totals.fees')||'Fees'}: <span className="tabular-nums font-semibold">{fmtMoney(totalFee)}</span></div>
              <div className="whitespace-nowrap">{t('shows.totals.net')||'Net'}: <span className="tabular-nums font-semibold">{fmtMoney(totalNet)}</span></div>
              <div className="whitespace-nowrap" title={t('shows.totals.avgFee.tooltip')||'Average fee per show'}>{t('shows.totals.avgFee')||'Avg Fee'}: <span className="tabular-nums font-semibold">{fmtMoney(avgFee)}</span></div>
              <div className="whitespace-nowrap" title={t('shows.totals.avgMargin.tooltip')||'Average margin % across shows with fee'}>{t('shows.totals.avgMargin')||'Avg Margin %'}: <span className="tabular-nums font-semibold">{avgMarginPct}%</span></div>
              <div className="flex items-center gap-2 ml-2">
                <button className="underline opacity-70 hover:opacity-100" onClick={()=> setTotalsPinned(p=> !p)}>{totalsPinned ? (t('shows.totals.unpin')||'Unpin') : (t('shows.totals.pin')||'Pin')}</button>
                <button className="underline opacity-70 hover:opacity-100" onClick={()=> setTotalsVisible(false)}>{t('shows.totals.hide')||'Hide'}</button>
              </div>
            </div>
          </div>
        )}
        {!totalsVisible && (
          <button className="fixed bottom-4 right-4 z-40 px-3 py-2 rounded-xl glass underline text-xs" onClick={()=> setTotalsVisible(true)}>{t('shows.totals.show')||'Show totals'}</button>
        )}

        {selected.size>0 && (
          <div className="fixed left-0 right-0 bottom-0 z-40">
            <div className="mx-auto max-w-[1400px] m-2 md:m-3 glass rounded-xl px-3 py-2 text-sm flex items-center gap-3">
              <div className="opacity-80">{selected.size} {t('shows.bulk.selected')||'selected'}</div>
              <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={applyBulkConfirm}>{t('shows.bulk.confirm')||'Confirm'}</button>
              <div className="flex items-center gap-1">
                <label className="opacity-80">{t('shows.bulk.setStatus')||'Set status'}:</label>
                <select className="bg-white/5 rounded px-1 py-0.5" value={bulkStatus} onChange={e=> setBulkStatus(e.target.value as any)}>
                  <option value="offer">offer</option>
                  <option value="pending">pending</option>
                  <option value="confirmed">confirmed</option>
                  <option value="canceled">canceled</option>
                  <option value="archived">archived</option>
                  <option value="postponed">postponed</option>
                </select>
                <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={applyBulkStatus}>{t('shows.bulk.apply')||'Apply'}</button>
              </div>
              <div className="flex items-center gap-1">
                <label className="opacity-80">{t('shows.bulk.setWht')||'Set WHT %'}:</label>
                <input type="number" className="w-20 px-2 py-1 rounded bg-white/5 border border-white/12 focus-ring text-[11px]" onKeyDown={e=>{ if(e.key==='Enter'){ const val = Number((e.target as HTMLInputElement).value||0); applyBulkWht(val); (e.target as HTMLInputElement).value=''; } }} />
              </div>
              <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={()=> exportCsv(true)}>{t('shows.bulk.export')||'Export'}</button>
              <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={()=>{ const ok = window.confirm(`${t('shows.bulk.delete')||'Delete selected'} (${selected.size})?`); if(!ok) return; for(const id of selected) remove(id); trackEvent('shows.bulk.delete', { count:selected.size }); setSelected(new Set()); }}>{t('shows.bulk.delete')||'Delete selected'}</button>
              <button className="ml-auto text-xs underline opacity-80 hover:opacity-100" onClick={()=> setSelected(new Set())}>{t('common.clear')||'Clear'}</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// helpers
const SummaryCard: React.FC<{ label:string; children:React.ReactNode }> = ({ label, children }) => (
  <div className="glass rounded p-3">
    <div className="text-[11px] uppercase tracking-wide opacity-70">{label}</div>
    <div className="text-lg font-semibold tabular-nums">{children}</div>
  </div>
);

const ThSort: React.FC<{ label:string; active:boolean; dir:'asc'|'desc'; onClick:()=>void; numeric?:boolean }> = ({ label, active, dir, onClick, numeric }) => {
  const nextDir = active ? (dir==='desc' ? 'asc':'desc') : 'desc';
  return (
    <th scope="col"
      className={`px-3 py-2 text-xs uppercase tracking-wide select-none cursor-pointer ${numeric?'text-right tabular-nums':''}`}
      onClick={onClick}
      aria-sort={active ? (dir==='desc'?'descending':'ascending') : 'none'}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 focus-ring"
        aria-label={`${label}. ${active ? (dir==='desc'? (t('shows.sort.aria.sortedDesc')||'Sorted descending') : (t('shows.sort.aria.sortedAsc')||'Sorted ascending')) : (t('shows.sort.aria.notSorted')||'Not sorted')}. ${nextDir==='desc' ? (t('shows.sort.aria.activateDesc')||'Activate to sort descending') : (t('shows.sort.aria.activateAsc')||'Activate to sort ascending')}`}
        title={t('shows.sort.tooltip') || `Ordenar por ${label}`}
      >
        <span>{label}</span>
        {active && <span aria-hidden="true">{dir==='desc'?'▼':'▲'}</span>}
      </button>
    </th>
  );
};

const ViewToggle: React.FC<{ view:ViewMode; setView:(v:ViewMode)=>void }> = ({ view, setView }) => (
  <div className="inline-flex border border-white/12 rounded-md overflow-hidden text-[11px]">
    <button className={`px-2 py-1 ${view==='list'?'bg-white/12':''}`} onClick={()=> setView('list')}>{t('shows.view.list')||'List'}</button>
    <button className={`px-2 py-1 ${view==='board'?'bg-white/12':''}`} onClick={()=> setView('board')}>{t('shows.view.board')||'Board'}</button>
  </div>
);

// Row actions menu (dropdown)
const RowActionsMenu: React.FC<{ show:DemoShow; onEdit:()=>void; onPromote:()=>void; onDuplicate:()=>void; onArchive:()=>void; onRestore:()=>void; onDelete:()=>void }> = ({ show, onEdit, onPromote, onDuplicate, onArchive, onRestore, onDelete }) => {
  const [open,setOpen]=useState(false);
  const btnRef = useRef<HTMLButtonElement|null>(null);
  const menuRef = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{ if(!open) return; const onKey=(e:KeyboardEvent)=> { if(e.key==='Escape'){ setOpen(false); btnRef.current?.focus(); } }; const onDoc=(e:MouseEvent)=> { const el=e.target as HTMLElement; if(!el.closest || !el.closest('[data-row-menu="true"]')) setOpen(false); }; document.addEventListener('keydown',onKey); document.addEventListener('mousedown',onDoc); return ()=>{ document.removeEventListener('keydown',onKey); document.removeEventListener('mousedown',onDoc); }; },[open]);
  useEffect(()=>{ if(open){ const first = menuRef.current?.querySelector('[role="menuitem"]') as HTMLElement|null; first?.focus(); } }, [open]);
  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    if(e.key==='ArrowDown' || e.key==='ArrowUp'){
      e.preventDefault();
      const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')||[]);
      if(items.length===0) return;
      const idx = items.findIndex(el=> el===document.activeElement);
      const delta = e.key==='ArrowDown' ? 1 : -1;
      const next = (idx<0?0:idx+delta+items.length)%items.length;
      items[next]?.focus();
    }
  };
  const promoteEnabled = (show.status==='offer' || show.status==='pending');
  return (
    <div className="relative" data-row-menu="true">
      <button ref={btnRef} type="button" aria-haspopup="menu" aria-expanded={open} aria-label={t('shows.row.menu')||'Row actions'} className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 focus-ring text-xs" onClick={()=> setOpen(o=>!o)}>⋯</button>
      {open && (
        <div ref={menuRef} role="menu" className="absolute z-30 min-w-[150px] right-0 top-full mt-1 glass rounded-md border border-white/12 shadow-lg py-1 text-xs" aria-label={t('shows.row.menu')||'Row actions'} onKeyDown={onMenuKeyDown}>
          <button role="menuitem" tabIndex={0} className="w-full text-left px-3 py-1 hover:bg-white/10" onClick={()=> { onEdit(); setOpen(false); }}>{t('shows.action.edit')||'Edit'}</button>
          <button role="menuitem" tabIndex={0} disabled={!promoteEnabled} className="w-full text-left px-3 py-1 hover:bg-white/10 disabled:opacity-40" onClick={()=> { if(!promoteEnabled) return; onPromote(); setOpen(false); }}>{t('shows.action.promote')||'Promote'}</button>
          <button role="menuitem" tabIndex={0} className="w-full text-left px-3 py-1 hover:bg-white/10" onClick={()=> { onDuplicate(); setOpen(false); }}>{t('shows.action.duplicate')||'Duplicate'}</button>
          {show.status!=='archived' && (
            <button role="menuitem" tabIndex={0} className="w-full text-left px-3 py-1 hover:bg-white/10" onClick={()=> { onArchive(); setOpen(false); }}>{t('shows.action.archive')||'Archive'}</button>
          )}
          {show.status==='archived' && (
            <button role="menuitem" tabIndex={0} className="w-full text-left px-3 py-1 hover:bg-white/10" onClick={()=> { onRestore(); setOpen(false); }}>{t('shows.action.restore')||'Restore'}</button>
          )}
          <div className="h-px my-1 bg-white/10" />
            <button role="menuitem" tabIndex={0} className="w-full text-left px-3 py-1 hover:bg-rose-600/30 text-rose-200" onClick={()=> { onDelete(); setOpen(false); }}>{t('shows.action.delete')||'Delete'}</button>
        </div>
      )}
    </div>
  );
};

export default Shows;

// Date range presets popover component
const DatePresets: React.FC<{ onApply:(from:string,to:string)=>void }> = ({ onApply }) => {
  const [open,setOpen] = useState(false);
  const ref = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{
    if(!open) return; const onKey=(e:KeyboardEvent)=> { if(e.key==='Escape') setOpen(false); }; const onClick=(e:MouseEvent)=> { if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; window.addEventListener('keydown',onKey); window.addEventListener('mousedown',onClick); return ()=>{ window.removeEventListener('keydown',onKey); window.removeEventListener('mousedown',onClick); };
  },[open]);
  const applyThisMonth = () => {
    const now = new Date(); const y=now.getFullYear(); const m=now.getMonth();
    const from = new Date(y,m,1).toISOString().slice(0,10);
    const to = new Date(y,m+1,0).toISOString().slice(0,10);
    onApply(from,to); setOpen(false);
  };
  const applyNextMonth = () => {
    const now = new Date(); const y=now.getFullYear(); const m=now.getMonth()+1;
    const from = new Date(y,m,1).toISOString().slice(0,10);
    const to = new Date(y,m+1,0).toISOString().slice(0,10);
    onApply(from,to); setOpen(false);
  };
  return (
    <div className="relative" ref={ref}>
      <button type="button" className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px]" aria-haspopup="dialog" aria-expanded={open} onClick={()=> setOpen(o=>!o)}>{t('shows.date.presets')||'Presets'}</button>
      {open && (
        <div role="dialog" aria-label={t('shows.date.presets')||'Date presets'} className="absolute top-full right-0 mt-1 glass rounded border border-white/12 p-2 z-30 w-40 text-[11px] space-y-1">
          <button className="w-full text-left px-2 py-1 rounded hover:bg-white/10" onClick={applyThisMonth}>{t('shows.date.thisMonth')||'This Month'}</button>
          <button className="w-full text-left px-2 py-1 rounded hover:bg-white/10" onClick={applyNextMonth}>{t('shows.date.nextMonth')||'Next Month'}</button>
          <button className="w-full text-left px-2 py-1 rounded hover:bg-white/10" onClick={()=> { onApply('', ''); setOpen(false); }}>{t('filters.clear')||'Clear'}</button>
        </div>
      )}
    </div>
  );
};