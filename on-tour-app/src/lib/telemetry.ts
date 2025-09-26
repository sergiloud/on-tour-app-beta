// Basic performance telemetry collector
// Captures LCP, FCP, CLS and first input delay (FID) if available.

interface Metric {
  name: string;
  value: number;
  detail?: any;
  ts: number;
}

const listeners: Array<(m: Metric) => void> = [];
export function onMetric(cb: (m: Metric) => void) { listeners.push(cb); }

function emit(name: string, value: number, detail?: any) {
  const metric: Metric = { name, value, detail, ts: performance.now() };
  listeners.forEach(l => l(metric));
  if (import.meta.env.DEV && !(globalThis as any).__TEST__) {
    // eslint-disable-next-line no-console
    console.log('[telemetry]', name, value, detail || '');
  }
}

export function initTelemetry() {
  if (typeof PerformanceObserver === 'undefined') return;

  try {
    const po = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          emit('LCP', (entry as any).renderTime || entry.startTime);
        }
      }
    });
    po.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}

  try {
    const poFCP = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') emit('FCP', entry.startTime);
      }
    });
    poFCP.observe({ type: 'paint', buffered: true });
  } catch {}

  try {
    let clsValue = 0;
    const poCLS = new PerformanceObserver(list => {
      for (const entry of list.getEntries() as any) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      emit('CLS', clsValue);
    });
    poCLS.observe({ type: 'layout-shift', buffered: true });
  } catch {}

  // FID heuristic (first input delay) using event listener
  const onFirstInput = (e: Event) => {
    const now = performance.now();
    const bi = (e as any).timeStamp;
    emit('FID', now - bi);
    ['pointerdown','keydown','mousedown','touchstart'].forEach(t => window.removeEventListener(t, onFirstInput, true));
  };
  ['pointerdown','keydown','mousedown','touchstart'].forEach(t => window.addEventListener(t, onFirstInput, { passive: true, capture: true }));
}

// Lightweight event telemetry API
export type AppEvent = { name: string; props?: Record<string, any>; ts: number };
const eventListeners: Array<(e: AppEvent) => void> = [];
export function onEvent(cb: (e: AppEvent) => void) { eventListeners.push(cb); }
let _lastEvent: { name: string; propsStr: string; ts: number } | null = null;
// Simple session id for correlation (persists for browser session)
const sessionId = (()=>{
  try {
    const key = 'telemetry:sessionId';
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, id);
    return id;
  } catch { return 'sess-unknown'; }
})();

function withDefaults(props?: Record<string, any>) {
  const base = { sessionId };
  try {
    const view = (JSON.parse(localStorage.getItem('settings-v1')||'{}')||{}).dashboardView;
    const region = (JSON.parse(localStorage.getItem('settings-v1')||'{}')||{}).region;
    return { ...base, view, region, ...(props||{}) };
  } catch { return { ...base, ...(props||{}) }; }
}

export function trackEvent(name: string, props?: Record<string, any>) {
  if ((globalThis as any).__TEST__) return; // no-op in tests to reduce noise/memory
  const ev: AppEvent = { name, props: withDefaults(props), ts: Date.now() };
  // De-dupe identical back-to-back events within 400ms (e.g., input composition)
  try {
    const propsStr = JSON.stringify(props || {});
    if (_lastEvent && _lastEvent.name === name && _lastEvent.propsStr === propsStr && (ev.ts - _lastEvent.ts) < 400) {
      return; // drop duplicate burst
    }
    _lastEvent = { name, propsStr, ts: ev.ts };
  } catch {}
  eventListeners.forEach(l => l(ev));
  try {
    const key = 'telemetry:events';
    const arr = JSON.parse(sessionStorage.getItem(key) || '[]');
    arr.push(ev);
    if (arr.length > 200) arr.shift();
    sessionStorage.setItem(key, JSON.stringify(arr));
  } catch {}
  if (import.meta.env.DEV && !(globalThis as any).__TEST__) {
    // eslint-disable-next-line no-console
    console.log('[event]', name, ev.props || {});
  }
}

// Web Vitals per-view with thresholds and console marks
type VitalsThresholds = { LCP: number; CLS: number; FID: number };
const DEFAULT_THRESHOLDS: VitalsThresholds = { LCP: 2500, CLS: 0.1, FID: 100 };

export function startViewVitals(viewId: string, thresholds: Partial<VitalsThresholds> = {}) {
  const thr = { ...DEFAULT_THRESHOLDS, ...thresholds } as VitalsThresholds;
  try {
    const report = (name: 'LCP'|'CLS'|'FID', value: number) => {
      const ok = name === 'CLS' ? value <= thr.CLS : value <= (thr as any)[name];
      // eslint-disable-next-line no-console
      console.log(`[vitals][${viewId}] ${name}=${value.toFixed(name==='CLS'?3:0)} ${ok? 'OK' : 'SLOW'}`);
      trackEvent('vitals', { view: viewId, metric: name, value, ok });
    };
    onMetric(m => {
      if (m.name === 'LCP' || m.name === 'CLS' || m.name === 'FID') {
        report(m.name as any, m.value);
      }
    });
  } catch {}
}

// Helper emitters for common app events (attach typical context)
export type CommonCtx = { view?: string; region?: string; team?: string; count?: number; ms?: number };
export const Events = {
  dashboardView(view: string) { trackEvent('dashboard.view', { view }); },
  shortcutUsed(key: string, ctx: CommonCtx = {}) { trackEvent('shortcut.used', { key, ...ctx }); },
  alertsOpen(ctx: CommonCtx = {}) { trackEvent('alerts.open', ctx); },
  ahKindFilter(kind: string, ctx: CommonCtx = {}) { trackEvent('ah.kind.filter', { kind, ...ctx }); },
  ahComputeWorker(used: boolean, ctx: CommonCtx = {}) { trackEvent('ah.compute.worker', { used, ...ctx }); },
  ahComputeComplete(ctx: Required<Pick<CommonCtx,'count'|'ms'>> & { worker: boolean } & CommonCtx) { trackEvent('ah.compute.complete', ctx as any); }
};
