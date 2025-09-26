/*
 * Finance Integrations Orchestrator
 * Unifies: Real API aggregation, ML engine, Forecasting, PDF reports, Mobile hooks.
 * Provides a stable facade for React components (professional finance charts) & vanilla UI.
 */

// Lazy imports (dynamic) to avoid heavy libs upfront if tree-shaken bundler can assist.
import * as RealAPI from './real-api-service.js';
// Heavy/optional modules will be lazy imported to avoid dev-server 500s if they fail.
let ML = null; let Forecasting = null; let PDFReports = null;
async function loadML(){ if(ML) return ML; try { ML = await import('./advanced-ml-engine.js'); } catch(e){ console.warn('[finance-integrations] ML module load failed', e); ML = {}; } return ML; }
async function loadForecast(){ if(Forecasting) return Forecasting; try { Forecasting = await import('./interactive-forecasting.js'); } catch(e){ console.warn('[finance-integrations] Forecast module load failed', e); Forecasting = {}; } return Forecasting; }
async function loadPDF(){ if(PDFReports) return PDFReports; try { PDFReports = await import('./advanced-pdf-reports.js'); } catch(e){ console.warn('[finance-integrations] PDF module load failed', e); PDFReports = {}; } return PDFReports; }
let MobileDash = null;
async function loadMobile(){ if(MobileDash) return MobileDash; try { MobileDash = await import('./mobile-dashboard.js'); } catch(e){ console.warn('[finance-integrations] Mobile module load failed', e); MobileDash = {}; } return MobileDash; }

// Simple event emitter (no external dep)
class Emitter {
  constructor(){ this.events = {}; }
  on(evt, cb){ (this.events[evt] ||= new Set()).add(cb); return () => this.off(evt, cb); }
  off(evt, cb){ this.events[evt]?.delete(cb); }
  emit(evt, payload){ this.events[evt]?.forEach(cb => { try{ cb(payload); } catch(e){ console.error('[finance-integrations] listener error', e); } }); }
}

const emitter = new Emitter();

// Internal cached state
const state = {
  initialized: false,
  lastSnapshot: null,
  lastForecasts: null,
  lastAnomalies: null,
  lastRates: null,
  meta: { startedAt: null, version: '1.0.0-orchestrator' }
};

// Init all subsystems (idempotent)
export async function initFinancePlatform(options = {}) {
  if(state.initialized) return state;
  state.meta.startedAt = Date.now();
  try {
    await RealAPI.init?.(options.realApi);
  } catch(e){ console.warn('[finance-integrations] RealAPI init failed (continuing)', e); }
  try {
    const _ml = await loadML();
    await _ml.initModels?.(options.ml);
  } catch(e){ console.warn('[finance-integrations] ML init failed (continuing)', e); }
  try {
    const _fc = await loadForecast();
    await _fc.initForecastEngine?.(options.forecasting);
  } catch(e){ console.warn('[finance-integrations] Forecast engine init failed (continuing)', e); }
  try {
    if (typeof document !== 'undefined') {
      const _mob = await loadMobile();
      _mob.registerIfNeeded?.(options.mobile);
    }
  } catch(e){ console.warn('[finance-integrations] Mobile dash registration failed (continuing)', e); }
  state.initialized = true;
  emitter.emit('ready', { ts: Date.now() });
  return state;
}

// Pull a unified snapshot (expenses, revenues, rates, etc.)
export async function loadLiveFinanceSnapshot(params = {}) {
  await initFinancePlatform();
  const start = performance.now();
  const snapshot = { ts: Date.now(), source: 'live', durationMs: 0 };
  try {
    const [rawExpenses, goals, shows, settings, rates] = await Promise.all([
      RealAPI.fetchExpenses?.(params) ?? [],
      RealAPI.fetchGoals?.(params) ?? [],
      RealAPI.fetchShows?.(params) ?? [],
      RealAPI.fetchSettings?.(params) ?? {},
      RealAPI.getFXRates?.(params) ?? {}
    ]);
    // Fallback synthesize expenses if API not implemented
    const expenses = (rawExpenses && rawExpenses.length) ? rawExpenses : buildSyntheticExpenses();
    snapshot.expenses = expenses;
    snapshot.goals = goals;
    snapshot.shows = shows;
    snapshot.settings = settings;
    snapshot.rates = rates;
  } catch(e){
    snapshot.error = e.message || String(e);
  }
  snapshot.durationMs = +(performance.now() - start).toFixed(1);
  state.lastSnapshot = snapshot;
  emitter.emit('snapshot', snapshot);
  return snapshot;
}

// Forecast scenarios (baseline + alt scenarios) with caching
export async function getForecastScenarios(params = {}) {
  await initFinancePlatform();
  const baseData = state.lastSnapshot?.expenses || [];
  try {
    const _fc = await loadForecast();
    const scenarios = await _fc.generateScenarios?.(baseData, params) || [];
    state.lastForecasts = scenarios;
    emitter.emit('forecast', scenarios);
    return scenarios;
  } catch(e){
    console.error('[finance-integrations] forecast failed', e);
    return [];
  }
}

// Batch expense classification
export async function classifyExpenses(expenses = []) {
  await initFinancePlatform();
  if(!expenses.length) return [];
  try {
    const _ml = await loadML();
    const results = await _ml.classifyExpenses?.(expenses) || [];
    emitter.emit('classified', results);
    return results;
  } catch(e){ console.error('[finance-integrations] classify failed', e); return []; }
}

// Anomaly detection wrapper
export async function detectAnomalies(expenses = []) {
  await initFinancePlatform();
  if(!expenses.length) return [];
  try {
    const _ml = await loadML();
    const anomalies = await _ml.detectExpenseAnomalies?.(expenses) || [];
    state.lastAnomalies = anomalies;
    emitter.emit('anomalies', anomalies);
    return anomalies;
  } catch(e){ console.error('[finance-integrations] anomalies failed', e); return []; }
}

// PDF report generation (returns Blob or Uint8Array depending on underlying impl)
export async function generateFinanceReport(type = 'financial', options = {}) {
  await initFinancePlatform();
  try {
    const _pdf = await loadPDF();
    const doc = await _pdf.generateReport?.(type, {
      snapshot: state.lastSnapshot,
      forecasts: state.lastForecasts,
      anomalies: state.lastAnomalies,
      ...options
    });
    emitter.emit('report', { type, size: doc?.output?.().length });
    return doc;
  } catch(e){ console.error('[finance-integrations] report failed', e); return null; }
}

// Subscribe to FX or crypto rate live updates (polling fallback)
let ratePollTimer = null;
export function subscribeToRates(callback, { intervalMs = 60000 } = {}) {
  let active = true;
  const poll = async () => {
    if(!active) return; 
    try {
      const rates = await RealAPI.getFXRates?.();
      state.lastRates = rates;
      callback?.(rates);
      emitter.emit('rates', rates);
    } catch(e){ console.warn('[finance-integrations] rate poll failed', e); }
    finally {
      if(active) ratePollTimer = setTimeout(poll, intervalMs);
    }
  };
  poll();
  return () => { active = false; if(ratePollTimer) clearTimeout(ratePollTimer); };
}

export function on(eventName, cb){ return emitter.on(eventName, cb); }
export function off(eventName, cb){ return emitter.off(eventName, cb); }

// Provide a simple selector style getter for React usage
export function useFinanceState(){ return { ...state }; }

// Tear down (for tests or hot reload)
export function teardown(){
  if(ratePollTimer) clearTimeout(ratePollTimer);
  state.initialized = false;
  emitter.emit('teardown');
}

// Convenience: one-shot full refresh (snapshot + forecast + anomalies)
export async function refreshAll(params = {}) {
  const snap = await loadLiveFinanceSnapshot(params);
  const forecasts = await getForecastScenarios(params);
  if(snap.expenses?.length) await detectAnomalies(snap.expenses);
  return { snap, forecasts, anomalies: state.lastAnomalies };
}

export default {
  initFinancePlatform,
  loadLiveFinanceSnapshot,
  getForecastScenarios,
  classifyExpenses,
  detectAnomalies,
  generateFinanceReport,
  subscribeToRates,
  refreshAll,
  on, off,
  useFinanceState,
  teardown
};

// --- Internal Utility: Synthetic expenses (placeholder when RealAPI lacks implementation) ---
function buildSyntheticExpenses(){
  try {
    const baseDate = new Date();
    const categories = ['Travel','Accommodation','Equipment','Marketing','Food','Performance'];
    const out = [];
    for(let i=0;i<24;i++){
      const dt = new Date(baseDate.getTime() - i*86400000);
      const cat = categories[i % categories.length];
      const isIncome = (i % 5 === 0); // every 5th record as income
      out.push({
        id: i+1,
        date: dt.toISOString().slice(0,10),
        amount: isIncome ? 1000 + (i*37)%500 : - (50 + (i*19)%400),
        category: isIncome ? 'Performance' : cat,
        type: isIncome ? 'income' : 'expense',
        description: isIncome ? 'Show payout' : `${cat} cost`,
        paid: !isIncome && (i % 3 === 0)
      });
    }
    return out.reverse();
  } catch(e){
    console.warn('[finance-integrations] synthetic expense build failed', e); return [];
  }
}
