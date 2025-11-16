import React, { Suspense } from 'react';
import { Card } from '../../ui/Card';
import { t } from '../../lib/i18n';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import LazyVisible from '../../components/common/LazyVisible';
import { useSettings } from '../../context/SettingsContext';
import { type Widget, defaultViews, resolveView, type ViewDefinition } from '../../features/dashboard/viewConfig';
import { Link } from 'react-router-dom';
import { useToast } from '../../ui/Toast';
import { useAuth } from '../../context/AuthContext';
import FirestoreUserPreferencesService from '../../services/firestoreUserPreferencesService';

const ArrowUpIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);

// Lazy to keep parity with Dashboard
const FinanceQuicklookLazy = React.lazy(() => import('../../components/dashboard/FinanceQuicklook'));
// Lazy load InteractiveMap to reduce bundle size  
const LazyInteractiveMap = React.lazy(() => import('../../components/mission/InteractiveMap').then(mod => ({ default: mod.InteractiveMap })));
import { MissionHud } from '../../components/mission/MissionHud';
// Lazy load heavy components for better performance
const ActionHub = React.lazy(() => import('../../components/dashboard/ActionHub').then(mod => ({ default: mod.ActionHub })));
const TourOverviewCard = React.lazy(() => import('../../components/dashboard/TourOverviewCard'));

type Tile = {
  id: string;
  type: Widget['type'];
  size?: 'sm' | 'md' | 'lg';
  kinds?: Array<'risk' | 'urgency' | 'opportunity' | 'offer' | 'finrisk'>;
  col: 'main' | 'side';
  h?: number; // custom height (px) for resizable tiles; optional
};

// Size cycler for resizable tiles
function SizeCycler({ tile, onChange }: { tile: Tile; onChange: (size: 'sm' | 'md' | 'lg') => void }) {
  const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];
  const next = () => {
    const currentSize: 'sm' | 'md' | 'lg' = tile.size ?? 'md';
    const i = sizes.indexOf(currentSize);
    const n = sizes[(i + 1) % sizes.length];
    if (!n) return;
    onChange(n);
  };
  return (
    <button className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20" onClick={next} title="Cycle size">{tile.size?.toUpperCase() || 'MD'}</button>
  );
}

function makeTilesFromView(cfg: ViewDefinition): Tile[] {
  const main: Tile[] = cfg.main.map((w, i) => ({ id: `m-${i}-${w.type}`, type: w.type as Tile['type'], size: (w as any).size, kinds: (w as any).kinds, col: 'main' }));
  const side: Tile[] = cfg.sidebar.map((w, i) => ({ id: `s-${i}-${w.type}`, type: w.type as Tile['type'], size: (w as any).size, kinds: (w as any).kinds, col: 'side' }));
  return [...main, ...side];
}

function usePersistedTiles(key: string, fallback: () => Tile[]) {
  const { userId } = useAuth();
  const [tiles, setTiles] = React.useState<Tile[]>(() => {
    try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw) as Tile[]; } catch { }
    return fallback();
  });
  
  // Load from Firebase on mount
  React.useEffect(() => {
    if (!userId) return;
    
    FirestoreUserPreferencesService.getUserPreferences(userId)
      .then(prefs => {
        if (prefs?.missionControl?.currentLayout) {
          setTiles(prefs.missionControl.currentLayout as Tile[]);
        }
      })
      .catch(err => console.warn('[MissionControlLab] Failed to load layout from Firebase:', err));
  }, [userId]);
  
  // Sync to Firebase when tiles change
  React.useEffect(() => {
    if (!userId || tiles.length === 0) return;
    
    const timeout = setTimeout(() => {
      // Also update localStorage for backwards compatibility
      try { localStorage.setItem(key, JSON.stringify(tiles)); } catch { }
      
      FirestoreUserPreferencesService.saveMissionControlLayout(userId, {
        currentLayout: tiles
      }).catch(err => console.warn('[MissionControlLab] Failed to save layout to Firebase:', err));
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [key, tiles, userId]);
  
  return [tiles, setTiles] as const;
}

export const MissionControlLab: React.FC = () => {
  const { dashboardView, setDashboardView } = useSettings();
  const { userId } = useAuth();
  const toast = useToast();
  const views = React.useMemo(() => ([
    { id: 'default', label: 'Default' },
    { id: 'finance', label: 'Finance' },
    { id: 'operations', label: 'Operations' },
    { id: 'promo', label: 'Promotion' }
  ]), []);

  const cfg = React.useMemo<ViewDefinition>(() => resolveView(defaultViews, dashboardView), [dashboardView]);
  const [tiles, setTiles] = usePersistedTiles('dash:labLayout', () => makeTilesFromView(cfg));
  const [savedName, setSavedName] = React.useState('');
  const [savedLayouts, setSavedLayouts] = React.useState<Record<string, Tile[]>>(() => { 
    try { return JSON.parse(localStorage.getItem('dash:labSaved') || '{}'); } catch { return {}; } 
  });
  
  // Load saved layouts from Firebase
  React.useEffect(() => {
    if (!userId) return;
    
    FirestoreUserPreferencesService.getUserPreferences(userId)
      .then(prefs => {
        if (prefs?.missionControl?.savedLayouts) {
          setSavedLayouts(prefs.missionControl.savedLayouts as Record<string, Tile[]>);
        }
      })
      .catch(err => console.warn('[MissionControlLab] Failed to load saved layouts from Firebase:', err));
  }, [userId]);
  
  const persistSaved = (next: Record<string, Tile[]>) => { 
    setSavedLayouts(next); 
    try { localStorage.setItem('dash:labSaved', JSON.stringify(next)); } catch { }
    
    // Sync to Firebase
    if (userId) {
      FirestoreUserPreferencesService.saveMissionControlLayout(userId, {
        savedLayouts: next
      }).catch(err => console.warn('[MissionControlLab] Failed to save layouts to Firebase:', err));
    }
  };

  // If view changes, offer to reset layout to new template (non-destructive prompt)
  React.useEffect(() => {
    // Don't auto-reset; expose a button instead
  }, [cfg]);

  const onReset = () => setTiles(makeTilesFromView(cfg));

  const [dragId, setDragId] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<{ col: 'main' | 'side'; index: number } | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDragId(id);
  };
  const onDragOver = (e: React.DragEvent, col: 'main' | 'side', index: number) => {
    e.preventDefault();
    setOver({ col, index });
  };
  const onDrop = (e: React.DragEvent, col: 'main' | 'side', index: number) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || dragId; if (!id) return;
    setTiles(prev => {
      const list = [...prev];
      const from = list.findIndex(t => t.id === id);
      if (from === -1) return prev;
      const item = list[from];
      if (!item || !item.id) return prev;
      const fullItem: Tile = {
        id: item.id,
        type: item.type ?? 'map',
        size: item.size,
        kinds: item.kinds,
        col: col,
        h: item.h
      };
      list.splice(from, 1);
      const sameColBefore = list.filter(t => t.col === col);
      const targetIds = sameColBefore.map(t => t.id);
      // Compute insertion absolute index among all tiles
      // Place relative to other items in that column
      let absIndex = 0; let seen = 0;
      for (let i = 0; i < list.length; i++) {
        const currentTile = list[i];
        if (!currentTile || currentTile.col !== col) continue;
        if (seen === index) { absIndex = i; break; }
        seen++;
        absIndex = i + 1;
      }
      list.splice(absIndex, 0, fullItem);
      return list.map((t, i) => t); // identity
    });
    setDragId(null); setOver(null);
  };

  const renderWidget = (tile: Tile, key: React.Key) => {
    if (tile.type === 'map') {
      const hCls = tile.size === 'sm' ? 'h-64 md:h-72' : tile.size === 'md' ? 'h-72 md:h-80' : 'h-80 md:h-96';
      const style = tile.h ? { height: tile.h } : undefined;
      return (
        <Card key={key} className="p-4 flex flex-col gap-3 overflow-hidden" aria-label="Mission Control" style={style}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold tracking-tight">{t('hud.missionControl')}</h2>
            <SizeCycler tile={tile} onChange={(size) => updateTileSize(tile.id, size)} />
          </div>
          <ErrorBoundary fallback={<div className="text-xs opacity-80 flex items-center gap-2"><span>{t('hud.mapLoadError')}</span></div>}>
            <LazyVisible height={tile.h || (tile.size === 'lg' ? 360 : tile.size === 'md' ? 320 : 280)}>
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-500"></div>
                </div>
              }>
                <LazyInteractiveMap className={`w-full ${hCls}`} />
              </Suspense>
            </LazyVisible>
          </ErrorBoundary>
        </Card>
      );
    }
    if (tile.type === 'actionHub') return <ActionHub key={key} kinds={tile.kinds} />;
    if (tile.type === 'financeQuicklook') return (
      <React.Suspense key={key} fallback={<Card className="p-4"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded mb-2" /><div className="space-y-1">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="h-24 bg-slate-100 dark:bg-white/5 rounded" />))}</div></Card>}>
        <FinanceQuicklookLazy />
      </React.Suspense>
    );
    if (tile.type === 'tourOverview') return <TourOverviewCard key={key} />;
    if (tile.type === 'missionHud') return <MissionHud key={key} />;
    return null;
  };

  const updateTileSize = (id: string, size: 'sm' | 'md' | 'lg') => {
    setTiles(prev => prev.map(t => t.id === id ? { ...t, size } : t));
  };

  const updateTileHeight = (id: string, h: number) => {
    setTiles(prev => prev.map(t => t.id === id ? { ...t, h: Math.max(180, Math.min(700, Math.round(h))) } : t));
  };

  const Column: React.FC<{ col: 'main' | 'side'; children: React.ReactNode }> = ({ col, children }) => (
    <div className={col === 'main' ? 'flex flex-col gap-6 lg:col-span-2 xl:col-span-3' : 'flex flex-col gap-6 self-start xl:col-span-2'}>
      {children}
    </div>
  );

  const tilesIn = (col: 'main' | 'side') => tiles.filter(t => t.col === col);

  const DraggableShell: React.FC<{ tile: Tile; index: number; col: 'main' | 'side' }> = ({ tile, index, col }) => {
    const resizerRef = React.useRef<HTMLDivElement | null>(null);
    React.useEffect(() => {
      const el = resizerRef.current; if (!el) return;
      let startY = 0; let startH = tile.h || (tile.size === 'lg' ? 360 : tile.size === 'md' ? 320 : 280);
      const onMove = (e: MouseEvent) => { const dy = e.clientY - startY; updateTileHeight(tile.id, startH + dy); };
      const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
      const onDown = (e: MouseEvent) => { startY = e.clientY; startH = tile.h || (tile.size === 'lg' ? 360 : tile.size === 'md' ? 320 : 280); window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp); e.preventDefault(); };
      el.addEventListener('mousedown', onDown);
      return () => { el.removeEventListener('mousedown', onDown); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    }, [tile.h, tile.size]);
    const move = (dir: 'up' | 'down') => {
      setTiles(prev => {
        const list = [...prev];
        const idx = list.findIndex(t => t.id === tile.id); if (idx === -1) return prev;
        // find previous/next in same column
        const indices = list.map((t, i) => ({ t, i })).filter(x => x.t.col === col).map(x => x.i);
        const pos = indices.indexOf(idx);
        const swapWith = dir === 'up' ? indices[Math.max(0, pos - 1)] : indices[Math.min(indices.length - 1, pos + 1)];
        if (swapWith === undefined || swapWith === idx) return prev;
        const itemA = list[idx];
        const itemB = list[swapWith];
        if (!itemA || !itemB) return prev;
        const tmp = itemB;
        list[swapWith] = itemA;
        list[idx] = tmp;
        return list;
      });
    };
    return (
      <div
        className="relative group"
        draggable
        onDragStart={(e) => onDragStart(e, tile.id)}
        onDragOver={(e) => onDragOver(e, col, index)}
        onDrop={(e) => onDrop(e, col, index)}
      >
        <div className="absolute -top-2 left-2 text-[10px] px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 border border-white/10">Drag</div>
        {/* keyboard move buttons */}
        <div className="absolute -top-3 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20" onClick={() => move('up')} aria-label="Move up"><ArrowUpIcon /></button>
          <button className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20" onClick={() => move('down')} aria-label="Move down"><ArrowDownIcon /></button>
        </div>
        {renderWidget(tile, tile.id)}
        {/* resizer handle */}
        <div ref={resizerRef} className="absolute bottom-0 left-0 right-0 h-2 cursor-row-resize bg-transparent">
          <div className="mx-auto w-12 h-1 rounded bg-slate-200 dark:bg-white/20" aria-hidden />
        </div>
        {over && over.col === col && over.index === index && (
          <div className="absolute -top-2 left-0 right-0 h-1 bg-accent-500/70 rounded" aria-hidden />
        )}
      </div>
    );
  };

  const EmptyDropzone: React.FC<{ col: 'main' | 'side' }> = ({ col }) => (
    <div
      className="rounded-md border border-dashed border-slate-200 dark:border-white/10 p-6 text-center text-[12px] opacity-70"
      onDragOver={(e) => onDragOver(e, col, 0)}
      onDrop={(e) => onDrop(e, col, 0)}
    >
      {t('lab.dropHere')}
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 space-y-5 text-[13px] md:text-[13px]">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl hero-gradient border border-slate-200 dark:border-white/10 p-4 md:p-6">
        <div className="relative z-10">
          <h2 className="section-title text-glow text-2xl md:text-3xl">{t('lab.header')}</h2>
          <p className="subtle mt-1 text-[12px] md:text-[12px]">{t('lab.subheader')}</p>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <span className="opacity-75">{t('lab.template')}:</span>
            <div className="flex gap-1">
              {views.map(v => (
                <button key={v.id} onClick={() => setDashboardView(v.id as any)} aria-pressed={dashboardView === v.id} className={`px-2.5 py-1 rounded border ${dashboardView === v.id ? 'bg-accent-500 text-black border-transparent' : 'bg-slate-200 dark:bg-white/10 border-slate-200 dark:border-white/10 hover:bg-white/15'}`}>{v.label}</button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/15" onClick={onReset}>{t('lab.resetToTemplate')}</button>
              <Link to="/dashboard" className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/15">{t('lab.backToDashboard')}</Link>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <input className="bg-slate-100 dark:bg-white/5 rounded px-2 py-1 w-40" placeholder={t('lab.layoutName')} value={savedName} onChange={e => setSavedName(e.target.value)} aria-label={t('lab.layoutName')} />
            <button className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/15" onClick={() => { const name = savedName.trim() || `lab-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}`; persistSaved({ ...savedLayouts, [name]: tiles }); setSavedName(''); }}>{t('lab.save')}</button>
            <div className="relative">
              <select className="bg-slate-100 dark:bg-white/5 rounded px-1 py-1" onChange={(e) => { const n = e.target.value; if (!n) return; const lay = savedLayouts[n]; if (lay) setTiles(lay); e.currentTarget.selectedIndex = 0; }} aria-label={t('lab.applySaved')}>
                <option value="">{t('lab.apply')}</option>
                {Object.keys(savedLayouts).map(n => (<option key={n} value={n}>{n}</option>))}
              </select>
            </div>
            <div className="relative">
              <select className="bg-slate-100 dark:bg-white/5 rounded px-1 py-1" onChange={(e) => { const n = e.target.value; if (!n) return; const { [n]: _, ...rest } = savedLayouts; persistSaved(rest); e.currentTarget.selectedIndex = 0; }} aria-label={t('lab.deleteSaved')}>
                <option value="">{t('lab.delete')}</option>
                {Object.keys(savedLayouts).map(n => (<option key={n} value={n}>{n}</option>))}
              </select>
            </div>
            <button className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/15" onClick={async () => { const json = JSON.stringify(savedLayouts, null, 2); try { await navigator.clipboard.writeText(json); toast.success(t('actions.toast.export') || 'Export copied'); } catch { const w = window.open('', '_blank'); w?.document.write(`<pre>${json}</pre>`); toast.info(t('copy.manual.title') || 'Manual copy'); } }}>{t('lab.export')}</button>
            <button className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/15" onClick={() => { const raw = prompt(t('actions.import.prompt') || 'Paste Lab layouts JSON'); if (!raw) return; try { const obj = JSON.parse(raw); if (obj && typeof obj === 'object') { persistSaved(obj); toast.success(t('actions.toast.imported') || 'Imported'); } } catch { toast.error(t('actions.toast.import_invalid') || 'Invalid JSON'); } }}>{t('lab.import')}</button>
          </div>
        </div>
      </div>

      {/* Two-column experimental grid */}
      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-5 auto-rows-auto">
        <Column col="main">
          {tilesIn('main').length === 0 && <EmptyDropzone col="main" />}
          {tilesIn('main').map((t, i) => (
            <DraggableShell key={t.id} tile={t} index={i} col="main" />
          ))}
        </Column>
        <Column col="side">
          {tilesIn('side').length === 0 && <EmptyDropzone col="side" />}
          {tilesIn('side').map((t, i) => (
            <DraggableShell key={t.id} tile={t} index={i} col="side" />
          ))}
        </Column>
      </div>
    </div>
  );
};

export default MissionControlLab;
