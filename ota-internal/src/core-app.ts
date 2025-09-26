// Core orchestrator
import { applyThemeDensity } from './shared/settings';
import React from 'react';
// NOTE: Removed direct finance chart + provider imports; mounting handled dynamically.
import { initMissionControl } from './features/dashboard/core/mission-control';
import { renderFinanceKpis, computeMonthSummary, computePreviousMonthNet, computeYtdSummary } from './features/finance/core/finance';
import { euros } from './data/demo';
import { bindModalChrome, openModal } from './shared/modals';
import { getNextShow } from './features/shows';
import { renderDashboard } from './features/dashboard/core/dashboard';
import { initLocaleSwitcher } from './shared/locale-switcher';
import { events } from './features/dashboard/core/events'; // Import events
import { openShowEditor, bindShowEditor } from './features/shows';
import { renderFinanceModal } from './features/shows';
import { bindTravelModal } from './features/travel';
import { debounce } from './shared/utils';
import { t } from './shared/i18n';
import { toggleTelemetry } from './shared/telemetry';
import { applyTranslations } from './shared/i18n';
import { getLocale, loadLocale } from './shared/i18n';
import { announce } from './shared/announcer';

function boot(){
  installGlobalErrorHooks();
  applyThemeDensity();
  bindModalChrome();
  initMissionControl();
  renderFinanceKpis();
  hydrateGlobalKpis();
  bindGlobalKpiActions();
  bindNav();
  bindPrimaryActions();
  bindShowEditor();
  bindTravelModal();
  exposeGlobals();
  (window as any).toggleTelemetry = toggleTelemetry;
  // Expose announcer for dev / external modules (non-breaking)
  (window as any).announce = announce;
  initCollapsibles();
  initZenMode();
  initDragPanels();
  initIconHydrator();
  initLocaleSwitcher();
  applyTranslations(document); // initial hydration
  window.addEventListener('i18n:changed', () => { applyTranslations(document); try { renderDashboard(); } catch {} });
  initLazyPanels();
}

// Basic global error logging (could be wired to remote endpoint later)
function installGlobalErrorHooks(){
  if ((window as any)._errHooks) return; (window as any)._errHooks = true;
  window.addEventListener('error', (e) => {
    try { console.error('[GlobalError]', e.message, e.filename, e.lineno, e.colno); } catch {}
  });
  window.addEventListener('unhandledrejection', (e) => {
    try { console.error('[UnhandledPromise]', e.reason); } catch {}
  });
}

function hydrateGlobalKpis(){
  const sum = computeMonthSummary();
  const ytd = computeYtdSummary();
  const prevNet = computePreviousMonthNet();
  const fmt = (n:number)=> euros(n);
  const ytdEl = document.getElementById('kpiYtdNet');
  const pendingEl = document.getElementById('kpiPending');
  const burnEl = document.getElementById('kpiBurn30');
  const netMonthEl = document.getElementById('kpiNextPayout');
  animateKpi(ytdEl, ytd.net);
  animateKpi(pendingEl, sum.payable);
  animateKpi(burnEl, sum.expenses);
  if (netMonthEl){
    animateKpi(netMonthEl, sum.net);
    const diff = sum.net - prevNet;
    netMonthEl.setAttribute('data-diff', String(diff));
    netMonthEl.classList.remove('trend-up','trend-down','trend-flat');
    const cls = diff > 0 ? 'trend-up' : diff < 0 ? 'trend-down' : 'trend-flat';
    netMonthEl.classList.add(cls);
    try {
      const parentBtn = netMonthEl.closest('.kpi-link');
      if (parentBtn){ parentBtn.classList.remove('flash-up','flash-down'); }
      if (parentBtn && diff !== 0){ parentBtn.classList.add(diff>0 ? 'flash-up':'flash-down'); }
    } catch {}
    // Accessible live feedback (separate live region so we don't override button label)
    const live = document.getElementById('kpiLive');
    if (live) {
      const diffAbs = Math.abs(diff);
      if (diff === 0){
        live.textContent = t('kpi.monthNet.unchanged').replace('{value}', fmt(sum.net));
      } else {
        const trendKey = diff > 0 ? 'up' : 'down';
        live.textContent = t('kpi.monthNet.changed')
          .replace('{value}', fmt(sum.net))
          .replace('{trend}', t(`trend.${trendKey}`))
          .replace('{diff}', fmt(diffAbs));
      }
    }
  }
}

function bindGlobalKpiActions(){
  const bar = document.getElementById('global-kpis'); if (!bar) return;
  if ((bar as any)._bound) return; (bar as any)._bound = true;
  bar.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.kpi-link[data-action]') as HTMLElement | null;
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    if (!action) return;
    switch(action){
      case 'finance-year':
      case 'net-month':
      case 'expenses-month':
        window.location.hash = '#/finance';
        break;
      case 'pending': {
        const sec = document.getElementById('pending-actions');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
    }
  });
}

function animateKpi(el: HTMLElement | null, value: number){
  if (!el) return;
  const duration = 600;
  const start = performance.now();
  const fromRaw = parseFloat(el.getAttribute('data-prev') || '0');
  const from = isNaN(fromRaw) ? 0 : fromRaw;
  const to = value;
  const fmt = (n:number)=> euros(n);
  function frame(t: number){
    const progress = Math.min(1, (t - start)/duration);
    const current = from + (to - from)*progress;
    if (el) {
      el.textContent = fmt(current);
      if (progress < 1) requestAnimationFrame(frame); else el.setAttribute('data-prev', String(to));
    }
  }
  requestAnimationFrame(frame);
}

function bindNav(){
  window.addEventListener('hashchange', handleHash, false);
  handleHash();
}

function handleHash(){
  const hash = window.location.hash || '#/dashboard';
  const view = hash.replace('#/','');
  document.querySelectorAll<HTMLElement>('section.view').forEach(s => {
    const isTarget = s.dataset.view === view;
    s.toggleAttribute('hidden', !isTarget);
    s.classList.toggle('active', isTarget);
  });
  document.querySelectorAll<HTMLAnchorElement>('.side-nav a[data-link]').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#/${view}`);
  });
  if (view === 'dashboard') { try { renderDashboard(); } catch {} }
  if (view === 'finance') { ensureFinanceChartsMounted(); }
}

function exposeGlobals(){
  (window as any).openFinanceModalForShow = (id: string) => { renderFinanceModal(id); openModal('financeModal'); };
  (window as any).renderDashboard = () => { renderDashboard(); };
  // Public API so external mutations (e.g. after editing a show) can refresh financial KPIs on demand
  ;(window as any).refreshKpis = () => { renderFinanceKpis(); hydrateGlobalKpis(); };
  (window as any).mountProfessionalFinanceCharts = () => ensureFinanceChartsMounted();
  // Bridge event for UI show modal
  events.on('ui:openShowModal', (payload: any) => {
    try { openShowEditor(payload?.id, payload || {}); } catch (e) { console.warn('Failed to open show editor via event', e); }
  });
}

function initCollapsibles(){
  document.querySelectorAll<HTMLElement>('.panel.collapsible').forEach(panel => {
    const skipIds = new Set(['action-hub','action-center','upcoming-feed']);
    if (skipIds.has(panel.id)) return; // mantener siempre visibles estas secciones
    const id = panel.getAttribute('data-panel') || panel.id;
    const btn = panel.querySelector<HTMLButtonElement>('.panel-toggle[data-action="collapse"]');
    if (!btn) return;
    if ((panel as any)._collapsibleBound) return; (panel as any)._collapsibleBound = true;
    // restore state
    try {
      const saved = localStorage.getItem('panel:' + id);
      if (saved === 'collapsed') collapsePanel(panel, true);
    } catch {}
    btn.addEventListener('click', () => {
      const collapsed = panel.classList.toggle('collapsed');
      const icon = btn.querySelector('i[data-lucide]');
      if (icon) icon.setAttribute('data-lucide', collapsed ? 'chevron-down' : 'chevron-up');
      try { localStorage.setItem('panel:'+id, collapsed ? 'collapsed':'open'); } catch {}
    });
  });
}

function collapsePanel(panel: HTMLElement, initial = false){
  panel.classList.add('collapsed');
  if (!initial){
    // optional animation hook
  }
  const btn = panel.querySelector<HTMLButtonElement>('.panel-toggle[data-action="collapse"] i[data-lucide]');
  if (btn) btn.setAttribute('data-lucide','chevron-down');
}

function initZenMode(){
  const toolbar = document.getElementById('dashboardToolbar');
  if (!toolbar || (toolbar as any)._zenBound) return; (toolbar as any)._zenBound = true;
  const btn = document.createElement('button');
  btn.id = 'dashZenToggle';
  btn.className = 'ghost small';
  btn.innerHTML = '<i data-lucide="maximize"></i> Focus';
  btn.setAttribute('aria-pressed','false');
  toolbar.querySelector('.right')?.prepend(btn);
  btn.addEventListener('click', () => {
    const on = document.body.classList.toggle('zen-mode');
    btn.setAttribute('aria-pressed', on ? 'true':'false');
    btn.innerHTML = on ? '<i data-lucide="minimize"></i> Exit Focus' : '<i data-lucide="maximize"></i> Focus';
  });
}

function initDragPanels(){
  const containers = [document.querySelector('.mission-main-col'), document.querySelector('.mission-sidebar-col')];
  const DRAG_KEY = 'dash:layout:v1';
  let dragEl: HTMLElement | null = null;
  // Make panels focusable + aria metadata
  document.querySelectorAll<HTMLElement>('.draggable-panel').forEach((p, idx) => {
    p.setAttribute('tabindex','0');
    p.setAttribute('role','group');
    p.setAttribute('aria-roledescription','dashboard panel');
    p.setAttribute('aria-label', p.getAttribute('data-i18n') ? p.getAttribute('data-i18n')! : (p.querySelector('.panel-title')?.textContent || 'Panel'));
    p.setAttribute('data-order', String(idx));
  });
  containers.forEach(col => {
    if (!col) return;
    col.addEventListener('dragstart', (e: Event) => {
      const de = e as DragEvent;
      const target = (e.target as HTMLElement).closest('.draggable-panel') as HTMLElement | null;
      if (!target) return;
      dragEl = target;
      de.dataTransfer?.setData('text/plain', target.id);
      target.classList.add('dragging');
      target.setAttribute('aria-grabbed','true');
    });
    col.addEventListener('dragend', () => { if (dragEl) { dragEl.classList.remove('dragging'); dragEl.removeAttribute('aria-grabbed'); } dragEl = null; saveLayout(); announceOrder(); });
    col.addEventListener('dragover', (e: Event) => {
      const de = e as DragEvent;
      if (!dragEl) return;
      e.preventDefault();
      const after = getDragAfterElement(col as HTMLElement, de.clientY);
      if (after == null) col.appendChild(dragEl); else col.insertBefore(dragEl, after);
    });
  });
  function getDragAfterElement(container: HTMLElement, y: number){
    const els = [...container.querySelectorAll('.draggable-panel:not(.dragging)')] as HTMLElement[];
    return els.reduce<{offset:number;el:HTMLElement|null}>((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height/2;
      if (offset < 0 && offset > closest.offset){ return { offset, el: child }; }
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY, el: null }).el;
  }
  function saveLayout(){
    try {
      const layout = containers.map(col => col ? [...col.querySelectorAll<HTMLElement>('.draggable-panel')].map(p => p.id) : []);
      localStorage.setItem(DRAG_KEY, JSON.stringify(layout));
    } catch {}
  }
  function applyLayout(){
    try {
      const raw = localStorage.getItem(DRAG_KEY); if (!raw) return; const layout = JSON.parse(raw);
      layout.forEach((ids: string[], idx: number) => {
        const col = containers[idx]; if (!col) return;
        ids.forEach(id => { const el = document.getElementById(id); if (el) col.appendChild(el); });
      });
    } catch {}
    announceOrder();
  }
  function announceOrder(){
    let live = document.getElementById('layoutLive');
    if (!live){
      live = document.createElement('div');
      live.id = 'layoutLive';
      live.setAttribute('aria-live','polite');
      live.className = 'sr-only';
      document.body.appendChild(live);
    }
    const order = [...document.querySelectorAll('.mission-main-col .draggable-panel'), ...document.querySelectorAll('.mission-sidebar-col .draggable-panel')]
      .map(p => (p.querySelector('.panel-title')?.textContent || p.id)).join(', ');
    live.textContent = 'Panel order: ' + order;
  }
  // Keyboard reorder (arrow up/down moves panel within its column; left/right moves between columns)
  document.addEventListener('keydown', (e) => {
    const focused = document.activeElement as HTMLElement | null;
    if (!focused || !focused.classList.contains('draggable-panel')) return;
    const col = focused.parentElement; if (!col) return;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)){
      e.preventDefault();
    }
  if (e.key === ' '){ // toggle grabbed state for clarity
      const grabbed = focused.getAttribute('aria-grabbed') === 'true';
      if (grabbed){ focused.removeAttribute('aria-grabbed'); }
      else { focused.setAttribute('aria-grabbed','true'); }
      return;
    }
    if (e.key === 'ArrowUp'){
      const prev = focused.previousElementSibling as HTMLElement | null;
      if (prev){ col.insertBefore(focused, prev); saveLayout(); announceOrder(); }
    } else if (e.key === 'ArrowDown'){
      const next = focused.nextElementSibling as HTMLElement | null;
      if (next){ col.insertBefore(next, focused); saveLayout(); announceOrder(); }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight'){
      const idx = containers.indexOf(col);
      const targetIdx = e.key === 'ArrowLeft' ? idx - 1 : idx + 1;
      const targetCol = containers[targetIdx];
      if (targetCol){ targetCol.appendChild(focused); saveLayout(); announceOrder(); focused.focus(); }
    }
  });
  applyLayout();
}

function bindPrimaryActions(){
  document.getElementById('mcFinance')?.addEventListener('click', () => {
    const next = getNextShow(); if (!next) return; renderFinanceModal(next.id); openModal('financeModal');
  });
  document.getElementById('mcAddTravel')?.addEventListener('click', () => {
    openModal('travelModal');
  });
  document.getElementById('mcOpenNextShowPrimary')?.addEventListener('click', () => {
    const next = getNextShow(); if (!next) return; openShowEditor(next.id);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const loc = getLocale();
  if (loc !== 'en') { try { await loadLocale(loc); } catch {} }
  boot();
});

// Centralized lucide icon auto-hydration (ensures dynamically injected <i data-lucide> render reliably)
function initIconHydrator(){
  if ((window as any)._iconHydrator) return; // idempotent
  const run = () => { try { (window as any).lucide?.createIcons(); } catch {} };
  // Initial attempt + lightweight polling until lucide script loaded
  run();
  if (!(window as any).lucide){
    const poll = setInterval(() => {
      if ((window as any).lucide){ clearInterval(poll); run(); }
    }, 120);
    // Stop polling after a few seconds to avoid infinite loop
    setTimeout(()=> clearInterval(poll), 4000);
  }
  const observer = new MutationObserver(debounce((mutations) => {
    for (const m of mutations){
      for (const node of Array.from(m.addedNodes)){
        if (!(node instanceof HTMLElement)) continue;
        if (node.matches?.('i[data-lucide]') || node.querySelector?.('i[data-lucide]')){ run(); return; }
      }
    }
  }, 60));
  try { observer.observe(document.body, { subtree: true, childList: true }); } catch {}
  (window as any)._iconHydrator = observer;
}

function initLazyPanels(){
  const candidates = document.querySelectorAll<HTMLElement>('[data-lazy-panel]');
  if (!candidates.length) return;
  if (!('IntersectionObserver' in window)){
    candidates.forEach(c => mountLazyPanel(c));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting){
        const el = en.target as HTMLElement;
        mountLazyPanel(el);
        obs.unobserve(el);
      }
    });
  }, { rootMargin:'80px 0px' });
  candidates.forEach(c => obs.observe(c));
}
function mountLazyPanel(el: HTMLElement){
  if (el.getAttribute('data-lazy-mounted') === 'true') return;
  const src = el.getAttribute('data-lazy-src');
  if (src){
    // dynamic import a module that exports a mount(el) function
    import(/* @vite-ignore */ src).then(mod => {
      try { mod.mount?.(el); } catch(e){ console.warn('Lazy panel mount failed', e); }
    }).catch(err => console.warn('Lazy panel load error', err));
  } else {
    // fallback: reveal existing content
    el.querySelectorAll('[data-lazy-hidden]')?.forEach(n => (n as HTMLElement).hidden = false);
  }
  el.setAttribute('data-lazy-mounted','true');
}

// ---- Dynamic Finance Charts Mount (lazy) ----
let __financeChartsRequested = false;
async function ensureFinanceChartsMounted(){
  if (__financeChartsRequested) return; // idempotent
  const attemptMount = async (attempt:number) => {
    const host = document.getElementById('professional-finance-charts');
    if (!host){
      if (attempt < 4){
        console.debug('[core-app] finance host not ready, retry', attempt);
        setTimeout(()=> attemptMount(attempt+1), 250);
      } else {
        console.warn('[core-app] finance host not found after retries');
      }
      return;
    }
    if (!__financeChartsRequested){
      __financeChartsRequested = true;
      try {
  console.debug('[core-app] importing finance-charts-mount.js');
  // @ts-ignore dynamic plain JS module
  const mod: any = await import('./finance-charts-mount.js');
        if (!mod.mountFinanceCharts){
          console.warn('[core-app] mountFinanceCharts missing on module, keys:', Object.keys(mod));
        }
        console.debug('[core-app] invoking mountFinanceCharts');
        await mod.mountFinanceCharts?.();
      } catch(e){ console.warn('[finance] dynamic mount failed', e); }
    }
  };
  attemptMount(1);
}
