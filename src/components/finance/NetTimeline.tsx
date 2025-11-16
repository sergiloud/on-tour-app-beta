import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../../ui/Card';
import { t } from '../../lib/i18n';
import { useSettings } from '../../context/SettingsContext';
import { trackEvent } from '../../lib/telemetry';
import { useFinance } from '../../context/FinanceContext';
import { announce } from '../../lib/announcer';
import { useCleanup } from '../../hooks/useCleanup';
// duplicate import removed

export const NetTimeline: React.FC = () => {
  const { fmtMoney, comparePrev, setDateRange, setPeriodPreset } = useSettings() as any;
  const { snapshot, netSeries, compareMonthlySeries, targets } = useFinance();
  const [showTable, setShowTable] = useState(false);
  const [ma, setMa] = useState<0 | 7 | 30>(0);
  const [zoomRange, setZoomRange] = useState<{ start: number; end: number } | null>(null);
  const [drag, setDrag] = useState<{ startX: number; currentX: number } | null>(null);
  const thisMonth = useMemo(() => {
    const ref = new Date(snapshot.asOf || Date.now());
    return `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, '0')}`;
  }, [snapshot.asOf]);
  const data = netSeries;
  const comp = useMemo(() => {
    if (!comparePrev || !compareMonthlySeries) return null;
    // Align months by index — assume same number of points when using fixed monthly aggregation
    return compareMonthlySeries.months.map((m, idx) => ({ month: m, net: compareMonthlySeries.net[idx] ?? 0 }));
  }, [comparePrev, compareMonthlySeries]);
  const sIndex = zoomRange ? Math.max(0, Math.min(zoomRange.start, zoomRange.end)) : 0;
  const eIndex = zoomRange ? Math.min(data.length - 1, Math.max(zoomRange.start, zoomRange.end)) : data.length - 1;
  const viewData = data.slice(sIndex, eIndex + 1);
  const viewComp = comp ? comp.slice(sIndex, eIndex + 1) : null;
  const max = Math.max(1, ...viewData.map(d => d.net), ...(viewComp?.map(c => c.net) ?? [0]));
  const maSeries = useMemo(() => {
    if (!ma) return null;
    const arr = data.map(d => d.net);
    const out: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      const start = Math.max(0, i - (ma - 1));
      const slice = arr.slice(start, i + 1);
      const avg = Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
      out.push(avg);
    }
    return out;
  }, [data, ma]);
  const viewMA = maSeries ? maSeries.slice(sIndex, eIndex + 1) : null;
  // Deviation badge for current month vs forecast
  const deviation = useMemo(() => {
    const cur = data.find(d => d.month === thisMonth)?.net ?? null;
    const forecast = (snapshot as any).forecast?.netMonth ?? null;
    if (cur == null || forecast == null || forecast === 0) return null;
    const delta = cur - forecast;
    const pct = delta / forecast;
    // Show badge if beyond ±10%
    if (Math.abs(pct) < 0.1) return null;
    return { delta, pct };
  }, [data, thisMonth, snapshot]);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const raf = useRef<number | null>(null);
  const cleanup = useCleanup();
  const onEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    rectRef.current = (e.currentTarget.parentElement as HTMLElement)?.getBoundingClientRect() ?? null;
  }, []);
  const onLeave = useCallback(() => {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
    rectRef.current = null;
    setTip(null);
  }, []);
  const onTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const container = e.currentTarget.parentElement as HTMLElement;
    rectRef.current = container?.getBoundingClientRect() ?? null;
  }, []);
  const onTouchEnd = useCallback(() => {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
    setTip(null);
  }, []);

  // Automatic cleanup on unmount via useCleanup hook
  useEffect(() => {
    return () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
        raf.current = null;
      }
      cleanup.clearAll();
    };
  }, [cleanup]);
  return (
    <Card className="p-4 overflow-hidden relative">
      <div className="flex items-center justify-between mb-2">
        <h3 className="widget-title">{t('finance.net')} {t('finance.byMonth')}</h3>
        <div className="flex items-center gap-2">
          <button className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/15" onClick={() => { setShowTable(v => !v); try { trackEvent('finance.timeline.viewToggle', { table: !showTable }); } catch { } }} aria-pressed={showTable}>
            {showTable ? (t('charts.hideTable') || 'Hide table') : (t('charts.viewTable') || 'View data as table')}
          </button>
          <div className="hidden md:flex items-center gap-2">
            {comparePrev && comp && (
              <div className="hidden md:flex items-center gap-2 text-[10px] opacity-80" aria-label={t('charts.legend') || 'Legend'}>
                <span className="inline-flex items-center gap-1"><span aria-hidden className="inline-block w-3 h-1 rounded bg-accent-300" />{t('common.current') || 'Current'}</span>
                <span className="inline-flex items-center gap-1"><span aria-hidden className="inline-block w-3 h-1 rounded bg-slate-100 dark:bg-white/50" />{t('common.compare') || 'Prev'}</span>
              </div>
            )}
            <span className="text-[10px] opacity-70" id="ma-label">MA</span>
            <div role="group" aria-labelledby="ma-label" className="inline-flex items-center gap-2">
              {[0, 7, 30].map(opt => (
                <button key={opt} className={`text-[11px] px-2 py-0.5 rounded ${ma === opt ? 'bg-accent-500 text-black' : 'bg-slate-200 dark:bg-white/10 hover:bg-white/15'}`} onClick={() => { setMa(opt as 0 | 7 | 30); try { trackEvent('finance.timeline.ma.change', { ma: opt }); } catch { } }} aria-pressed={ma === opt}>{opt === 0 ? (t('common.off') || 'Off') : (opt + 'd')}</button>
              ))}
            </div>
            {zoomRange && (
              <>
                <button className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/15" onClick={() => setZoomRange(null)} title={t('charts.resetZoom') || 'Reset zoom'}>
                  {t('charts.resetZoom') || 'Reset zoom'}
                </button>
                <button className="text-[11px] px-2 py-0.5 rounded bg-accent-500/80 hover:bg-accent-500 text-black" onClick={() => {
                  const startIdx = Math.max(0, Math.min(zoomRange.start, zoomRange.end));
                  const endIdx = Math.min(data.length - 1, Math.max(zoomRange.start, zoomRange.end));
                  const fromKey = data[startIdx]?.month;
                  const toKey = data[endIdx]?.month;
                  if (!fromKey || !toKey) return;
                  const mkToDates = (key: string) => {
                    const y = Number(key.slice(0, 4));
                    const m = Number(key.slice(5, 7));
                    const from = `${y}-${String(m).padStart(2, '0')}-01`;
                    const last = new Date(y, m, 0).getDate();
                    const to = `${y}-${String(m).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
                    return { from, to };
                  };
                  const f = mkToDates(fromKey);
                  const t2 = mkToDates(toKey);
                  setPeriodPreset && setPeriodPreset('CUSTOM');
                  setDateRange && setDateRange({ from: f.from, to: t2.to });
                  try { trackEvent('finance.timeline.zoom.apply', { from: f.from, to: t2.to, startIdx, endIdx }); } catch { }
                  try { announce(t('filters.applied') || 'Filters applied'); } catch { }
                }} title={t('common.apply') || 'Apply'}>
                  {t('common.apply') || 'Apply'}
                </button>
              </>
            )}
          </div>
          {deviation && (
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] ${deviation.delta > 0 ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200'}`}
              title={`${deviation.delta > 0 ? '+' : ''}${fmtMoney(deviation.delta)} (${Math.round(deviation.pct * 100)}%) vs forecast`}
              aria-label={`Deviation ${Math.round(deviation.pct * 100)}% ${deviation.delta > 0 ? 'over' : 'under'} forecast`}
            >
              {deviation.delta > 0 ? '+' : ''}{fmtMoney(deviation.delta)} · {Math.round(deviation.pct * 100)}%
            </span>
          )}
        </div>
      </div>
      {/* A11y summary for screen readers */}
      <p className="sr-only" aria-live="polite">
        {t('finance.net')} {t('finance.byMonth')}: {data.length} {t('shows.items') || 'items'}. Max {fmtMoney(max)}.
      </p>
      {showTable ? (
        <div className="max-h-40 overflow-auto border border-slate-200 dark:border-white/10 rounded">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left opacity-70">
                <th className="px-2 py-1">{t('common.date') || 'Date'}</th>
                <th className="px-2 py-1">{t('finance.net') || 'Net'}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.month} className="border-t border-white/10">
                  <td className="px-2 py-1 whitespace-nowrap">{d.month}</td>
                  <td className="px-2 py-1 tabular-nums">{fmtMoney(d.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <React.Fragment>
          <div className="h-36 flex items-end gap-1 overflow-hidden relative"
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onMouseDown={(e) => {
              if (!rectRef.current) return;
              const rect = rectRef.current;
              setDrag({ startX: e.clientX - rect.left, currentX: e.clientX - rect.left });
            }}
            onMouseMove={(e) => {
              if (!drag || !rectRef.current) return;
              const rect = rectRef.current;
              setDrag(d => d ? { ...d, currentX: e.clientX - rect.left } : null);
            }}
            onMouseUp={(e) => {
              if (!rectRef.current || !drag) { setDrag(null); return; }
              const rect = rectRef.current;
              const start = Math.max(0, Math.min(drag.startX, drag.currentX));
              const end = Math.min(rect.width, Math.max(drag.startX, drag.currentX));
              const count = data.length;
              if (end - start < 8 || count < 2) { setDrag(null); return; }
              const step = rect.width / count;
              const startIdx = Math.max(0, Math.min(count - 1, Math.floor(start / step)));
              const endIdx = Math.max(0, Math.min(count - 1, Math.floor(end / step)));
              setZoomRange({ start: startIdx, end: endIdx });
              try { trackEvent('finance.timeline.zoom', { startIdx, endIdx, count }); } catch { }
              setDrag(null);
            }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="list"
            aria-label={t('finance.net') + ' ' + t('finance.byMonth')}
          >
            {viewData.map((d, i) => {
              const h = Math.round((d.net / max) * 100);
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1 min-w-[12px]" role="listitem">
                  <div
                    className="w-full bg-gradient-to-t from-accent-500/20 to-accent-500/80 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
                    style={{ height: `${h}%` }}
                    aria-label={`${d.month} ${t('finance.net')} ${fmtMoney(d.net)}`}
                    title={`${d.month} · ${fmtMoney(d.net)}${viewComp ? ` · ${t('common.compare') || 'Compare'} ${fmtMoney(viewComp[i]?.net || 0)} (${((d.net - (viewComp[i]?.net || 0)) / (Math.max(1, viewComp[i]?.net || 1)) * 100) | 0}%)` : ''}`}
                    tabIndex={0}
                    onMouseMove={(e) => {
                      if (!rectRef.current) return;
                      const rect = rectRef.current;
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top - 24;
                      const maxX = rect.width - 80;
                      if (raf.current) cancelAnimationFrame(raf.current);
                      raf.current = requestAnimationFrame(() => {
                        const cmp = viewComp ? viewComp[i]?.net : null;
                        const txt = cmp != null ? `${d.month} · ${fmtMoney(d.net)} · ${t('common.compare') || 'Compare'} ${fmtMoney(cmp)} (${((d.net - cmp) / Math.max(1, cmp) * 100) | 0}%)` : `${d.month} · ${fmtMoney(d.net)}`;
                        setTip({ x: Math.max(8, Math.min(x, maxX)), y: Math.max(8, y), text: txt });
                      });
                    }}
                    onTouchMove={(e) => {
                      if (!rectRef.current) return;
                      const rect = rectRef.current;
                      const touch = e.touches[0];
                      if (!touch) return;
                      const x = touch.clientX - rect.left;
                      const y = touch.clientY - rect.top - 24;
                      const maxX = rect.width - 80;
                      if (raf.current) cancelAnimationFrame(raf.current);
                      raf.current = requestAnimationFrame(() => {
                        const cmp = viewComp ? viewComp[i]?.net : null;
                        const txt = cmp != null ? `${d.month} · ${fmtMoney(d.net)} · ${t('common.compare') || 'Compare'} ${fmtMoney(cmp)} (${((d.net - cmp) / Math.max(1, cmp) * 100) | 0}%)` : `${d.month} · ${fmtMoney(d.net)}`;
                        setTip({ x: Math.max(8, Math.min(x, maxX)), y: Math.max(8, y), text: txt });
                      });
                    }}
                    onFocus={(e) => {
                      const container = e.currentTarget.parentElement?.parentElement as HTMLElement;
                      rectRef.current = container.getBoundingClientRect();
                      const cmp = viewComp ? viewComp[i]?.net : null;
                      const txt = cmp != null ? `${d.month} · ${fmtMoney(d.net)} · ${t('common.compare') || 'Compare'} ${fmtMoney(cmp)} (${((d.net - cmp) / Math.max(1, cmp) * 100) | 0}%)` : `${d.month} · ${fmtMoney(d.net)}`;
                      setTip({ x: 12, y: 8, text: txt });
                    }}
                    onBlur={() => setTip(null)}
                  />
                  <span className="text-[10px] opacity-70">{d.month.split('-')[1]}</span>
                </div>
              );
            })}
            {/* Brush selection rectangle */}
            {drag && (
              <div
                className="absolute top-0 bottom-0 bg-accent-500/20 border border-accent-300/50 pointer-events-none"
                style={{ left: Math.min(drag.startX, drag.currentX), width: Math.abs(drag.currentX - drag.startX) }}
              />
            )}
          </div>
          {(ma || (comparePrev && comp) || (targets && targets.netMonth)) ? (
            <div className="absolute inset-x-4 bottom-10 top-16 pointer-events-none">
              <svg width="100%" height="100%" preserveAspectRatio="none">
                {(() => {
                  const w = (rectRef.current?.width || 0);
                  const h = (rectRef.current?.height || 0) - 24;
                  if (!w || !h) return null;
                  const count = viewData.length;
                  const step = count ? w / count : 0;
                  const elems: React.ReactNode[] = [];
                  if (ma && viewMA) {
                    const points = viewMA.map((v, idx) => {
                      const x = Math.max(0, idx * step + step / 2);
                      const y = Math.max(0, h - (v / Math.max(1, max)) * h);
                      return `${x},${y}`;
                    }).join(' ');
                    elems.push(<polyline key="ma" points={points} fill="none" stroke="url(#grad)" strokeWidth="2" />);
                  }
                  if (comparePrev && viewComp) {
                    const points2 = viewComp.map((v, idx) => {
                      const x = Math.max(0, idx * step + step / 2);
                      const netValue = v?.net ?? 0;
                      const y = Math.max(0, h - (netValue / Math.max(1, max)) * h);
                      return `${x},${y}`;
                    }).join(' ');
                    elems.push(<polyline key="cmp" points={points2} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="4 3" />);
                  }
                  // Target line
                  if (targets && targets.netMonth) {
                    const targetY = h - (targets.netMonth / Math.max(1, max)) * h;
                    elems.push(
                      <line key="target" x1={0} x2={w} y1={targetY} y2={targetY} stroke="rgba(255,215,0,0.7)" strokeWidth="2" strokeDasharray="6 4" />
                    );
                  }
                  return elems;
                })()}
                <defs>
                  <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          ) : null}
        </React.Fragment>
      )}
      {tip && (
        <div className="pointer-events-none absolute z-10 px-2 py-1 rounded-md bg-ink-900/90 border border-slate-200 dark:border-white/10 text-[10px]"
          style={{ left: tip.x, top: tip.y }}
          role="tooltip"
        >{tip.text}</div>
      )}
    </Card>
  );
};

export default NetTimeline;
