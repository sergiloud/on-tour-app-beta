// Show editor logic (open, populate, save)
import { loadShows, createNewShowDefaults, addLocalShow } from '../features/shows/core/shows';
import { computeShowFinance, getCosts, addCost, deleteCost, getCostById, restoreCost } from '../features/shows/core/show-finance';
import { showConfirmModal } from '../shared/modals/modals';
import { listAgencies } from './agencies';
import { openModal } from '../shared/modals/modals';
import { euros } from '../data/demo';
import { debounce, animateButtonSave } from '../shared/utils/utils';
import { events } from '../features/dashboard/core/events';

const LOCAL_PREFIX = 'show:';

function getOverride(id: string){
  try { const raw = localStorage.getItem(LOCAL_PREFIX + id); if (raw) return JSON.parse(raw); } catch {}
  return {};
}
function saveOverride(id: string, ov: any){ try { localStorage.setItem(LOCAL_PREFIX + id, JSON.stringify(ov)); } catch {} }

export function openShowEditor(id?: string, options?: { initialTab?: string }){
  if (!id){ const draft = createNewShowDefaults(); addLocalShow(draft); id = draft.id; }
  const show = loadShows().find(s => s.id === id); if (!show) return;
  const ov = getOverride(id);
  setVal('showDate', toDateInput(ov.date || show.date || new Date().toISOString()));
  setVal('showVenue', ov.venue || show.venue || '');
  setVal('showCity', ov.city || show.city || '');
  setVal('showCountry', ov.country || '');
  setVal('showStatus', ov.status || show.status || 'planned');
  setVal('showFeeAmount', String(ov.feeEUR ?? show.feeEUR));
  // Agencies (populate after fee + fields set)
  populateAgencySelects(ov);
  // WHT percent
  const whtInput = document.getElementById('showWhtPercent') as HTMLInputElement | null;
  if (whtInput){
    const whtPct = typeof ov.whtPct === 'number' ? ov.whtPct : (show as any).whtPct || 0;
    whtInput.value = String(whtPct);
  }
  updateMiniTotals(id);
  openModal('showModal');
  (window as any).__currentShowId = id;
  // Determine initial tab precedence: explicit option > hash > stored last
  let targetTab = options?.initialTab;
  if (!targetTab){
    const hash = location.hash;
    const m = hash.match(/#\/show\/([^\/]+)\/(\w+)/);
    if (m){
      const hashId = m[1]; const hashTab = m[2];
      if (hashId === id) targetTab = hashTab;
    }
  }
  if (targetTab){
    requestAnimationFrame(()=>{ try { (window as any).activateShowTab?.(targetTab!); } catch {} });
  }
  // Update hash (#/show/{id}/{tab}) whenever tab changes (handled in initShowEditorTabs)
  updateShowHash(id);
  // Initialize mini map after open (lazy)
  requestAnimationFrame(()=> initMiniMap());
  // Pre-place mini marker if stored
  try {
    if (ov.lastLat && ov.lastLon){
      setTimeout(()=> { placeMiniMarker(ov.lastLat, ov.lastLon); }, 50);
    }
  } catch {}
  updateFinancialVisuals(id);
  renderCostsList(id);
}

export function saveShowEditor(){
  const id = (window as any).__currentShowId as string | undefined; if (!id) return;
  const ov = {
    date: (getVal('showDate') ? new Date(getVal('showDate')+'T00:00:00').toISOString(): undefined),
    venue: getVal('showVenue'),
    city: getVal('showCity'),
    country: getVal('showCountry'),
    status: getVal('showStatus'),
  feeEUR: parseFloat(getVal('showFeeAmount')||'0'),
  whtPct: parseFloat((document.getElementById('showWhtPercent') as HTMLInputElement | null)?.value || '0') || 0,
  mgmtAgencyId: (document.getElementById('showMgmtAgency') as HTMLSelectElement | null)?.value || undefined,
  bookingAgencyId: (document.getElementById('showBookingAgency') as HTMLSelectElement | null)?.value || undefined
  };
  saveOverride(id, ov);
  updateMiniTotals(id);
  events.emit('data:changed', { source: 'show-editor', showId: id });
  (window as any).refreshKpis?.();
}

function updateMiniTotals(id: string){
  const fin = computeShowFinance(id);
  setText('showMiniIncome', euros(fin.income));
  setText('showMiniExpenses', euros(fin.commissions + fin.costs + fin.wht));
  setText('showMiniPayable', euros(fin.payable));
  setText('showGross', euros(fin.income));
  setText('showCommissions', euros(fin.commissions));
  const whtEl = document.getElementById('showWhtVal'); if (whtEl) whtEl.textContent = euros(fin.wht);
  setText('showCosts', euros(fin.costs));
  setText('showNet', euros(fin.net));
  updateFinancialVisuals(id);
}

// Populate management & booking agency selects and bind change for live preview
function populateAgencySelects(ov: any){
  const mgmtSel = document.getElementById('showMgmtAgency') as HTMLSelectElement | null;
  const bookingSel = document.getElementById('showBookingAgency') as HTMLSelectElement | null;
  if (!mgmtSel || !bookingSel) return;
  const list = listAgencies();
  function render(sel: HTMLSelectElement, type: 'mgmt' | 'booking', selectedId?: string){
    const agencies = list.filter(a => a.type === type);
    sel.innerHTML = '<option value="">(None)</option>' + agencies.map(a => `<option value="${a.id}">${a.name} ${a.percent}% ${a.base==='net'?'(net)':'(gross)'}</option>`).join('');
    // Choose: explicit override id > default
    let pre = selectedId; if (!pre){ const def = agencies.find(a => a.default); if (def) pre = def.id; }
    if (pre && agencies.some(a => a.id === pre)) sel.value = pre; else sel.value = '';
  }
  render(mgmtSel, 'mgmt', ov.mgmtAgencyId);
  render(bookingSel, 'booking', ov.bookingAgencyId);
  // Bind change (once) for live preview recompute
  if (!(mgmtSel as any)._agBound){
    (mgmtSel as any)._agBound = true;
    mgmtSel.addEventListener('change', () => { liveRecomputeFinance(); });
  }
  if (!(bookingSel as any)._agBound){
    (bookingSel as any)._agBound = true;
    bookingSel.addEventListener('change', () => { liveRecomputeFinance(); });
  }
}

function liveRecomputeFinance(){
  const id = (window as any).__currentShowId as string | undefined; if (!id) return;
  try {
    const feeVal = parseFloat((document.getElementById('showFeeAmount') as HTMLInputElement | null)?.value || '0')||0;
    const whtPct = parseFloat((document.getElementById('showWhtPercent') as HTMLInputElement | null)?.value || '0')/100;
    // We'll reuse computeShowFinance by temporarily saving override values in memory (not persisted yet)
    // But simpler: call computeShowFinance which reads stored overrides; for live preview adjust via mock path.
    const costs = getCosts(id).reduce((s,c)=> s + c.amount, 0);
    const wht = feeVal * whtPct;
    // Commissions: recompute using agencies if available by creating a transient override object
    // We'll mimic structure used in computeShowFinance by saving override temporarily then reverting.
    const ov = getOverride(id);
    const origMgmt = ov.mgmtAgencyId; const origBooking = ov.bookingAgencyId; const origFee = ov.feeEUR; const origWhtPct = ov.whtPct;
    ov.mgmtAgencyId = (document.getElementById('showMgmtAgency') as HTMLSelectElement | null)?.value || undefined;
    ov.bookingAgencyId = (document.getElementById('showBookingAgency') as HTMLSelectElement | null)?.value || undefined;
    ov.feeEUR = feeVal; ov.whtPct = whtPct*100;
    saveOverride(id, ov);
    const fin = computeShowFinance(id);
    // Restore previous override (do not persist live changes yet)
    ov.mgmtAgencyId = origMgmt; ov.bookingAgencyId = origBooking; ov.feeEUR = origFee; ov.whtPct = origWhtPct;
    saveOverride(id, ov);
    updateFinancialVisualMock({ income: feeVal, commissions: fin.commissions, costs, wht, net: fin.net });
  } catch {}
}

function toDateInput(iso: string){ const d = new Date(iso); if (isNaN(d.getTime())) return ''; return d.toISOString().slice(0,10); }
function setVal(id: string, v: string){ const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null; if (el) (el as any).value = v; }
function getVal(id: string){ const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null; return (el && (el as any).value) || ''; }
function setText(id: string, v: string){ const el = document.getElementById(id); if (el) el.textContent = v; }

export function bindShowEditor(){
  if ((window as any)._showEditorBound) return; (window as any)._showEditorBound = true;
  const saveBtn = document.getElementById('saveShowBtn') as HTMLButtonElement | null;
    if (saveBtn && !(saveBtn as any)._enhanced) {
      (saveBtn as any)._enhanced = true;
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        animateButtonSave(saveBtn, async () => {
          // Simulate async save (could be replaced with real persistence later)
          await new Promise(r => setTimeout(r, 120));
          try { saveShowEditor(); } catch {}
          // After successful save close modal shortly after feedback
          setTimeout(() => {
            const modal = document.getElementById('showModal');
            if (modal) { (window as any).closeModal?.(modal); }
          }, 400);
  }, { savingLabel: 'Saving…', successLabel: 'Saved!', icon: 'loader-2', successIcon: 'check', restoreDelay: 900 });
      });
  }
  initShowEditorTabs();
  const fee = document.getElementById('showFeeAmount') as HTMLInputElement | null;
  if (fee && !(fee as any)._liveBound){
    (fee as any)._liveBound = true;
  fee.addEventListener('input', debounce(() => {
      const id = (window as any).__currentShowId as string | undefined; if (!id) return;
      // temp override preview (not saving yet)
      try {
        const val = parseFloat(fee.value||'0')||0;
        const orig = loadShows().find(s => s.id === id); if (!orig) return;
        const mock = { ...orig, feeEUR: val } as any;
        const commPct = ((window as any).getCommissionPct ? (window as any).getCommissionPct()/100 : 0.15);
  const whtPct = parseFloat((document.getElementById('showWhtPercent') as HTMLInputElement | null)?.value || '0')/100;
  const wht = mock.feeEUR * whtPct;
  const comm = mock.feeEUR * commPct;
  const costs = getCosts(id).reduce((s,c)=> s + c.amount, 0);
    const net = mock.feeEUR - wht - comm - costs;
        const lc = document.getElementById('liveComm'); if (lc) lc.textContent = euros(comm);
        const ln = document.getElementById('liveNet'); if (ln) ln.textContent = euros(net);
  updateFinancialVisualMock({ income: mock.feeEUR, commissions: comm, costs, wht, net });
      } catch {}
    }, 250));
  }
  bindQuickCosts();
  initCostHistorySuggestions();
  const whtInput = document.getElementById('showWhtPercent') as HTMLInputElement | null;
  if (whtInput && !(whtInput as any)._liveBound){
    (whtInput as any)._liveBound = true;
    whtInput.addEventListener('input', debounce(()=> {
      const id = (window as any).__currentShowId as string | undefined; if (!id) return;
      try {
        const feeVal = parseFloat((document.getElementById('showFeeAmount') as HTMLInputElement | null)?.value || '0')||0;
        const orig = loadShows().find(s => s.id === id); if (!orig) return;
        const mock = { ...orig, feeEUR: feeVal } as any;
        const commPct = ((window as any).getCommissionPct ? (window as any).getCommissionPct()/100 : 0.15);
        const whtPct = parseFloat(whtInput.value || '0')/100;
        const wht = mock.feeEUR * whtPct;
        const comm = mock.feeEUR * commPct;
        const costs = getCosts(id).reduce((s,c)=> s + c.amount, 0);
        const net = mock.feeEUR - wht - comm - costs;
        const lc = document.getElementById('liveComm'); if (lc) lc.textContent = euros(comm);
        const ln = document.getElementById('liveNet'); if (ln) ln.textContent = euros(net);
        updateFinancialVisualMock({ income: mock.feeEUR, commissions: comm, costs, wht, net });
      } catch {}
    }, 250));
  }
  // React to commission percentage changes from settings
  if (!(window as any)._showEditorCommListener){
    (window as any)._showEditorCommListener = true;
    events.on('settings:changed', (payload: any) => {
      try {
        const id = (window as any).__currentShowId as string | undefined; if (!id) return;
        // reuse fee & wht handlers logic
        const feeEl = document.getElementById('showFeeAmount') as HTMLInputElement | null;
        const whtInput = document.getElementById('showWhtPercent') as HTMLInputElement | null;
        const feeVal = parseFloat(feeEl?.value || '0')||0;
        const whtPct = parseFloat(whtInput?.value || '0')/100;
        const orig = loadShows().find(s => s.id === id); if (!orig) return;
        const mock = { ...orig, feeEUR: feeVal } as any;
        const commPct = ((window as any).getCommissionPct ? (window as any).getCommissionPct()/100 : 0.15);
        const wht = mock.feeEUR * whtPct;
        const comm = mock.feeEUR * commPct;
        const costs = getCosts(id).reduce((s,c)=> s + c.amount, 0);
        const net = mock.feeEUR - wht - comm - costs;
        const lc = document.getElementById('liveComm'); if (lc) lc.textContent = euros(comm);
        const ln = document.getElementById('liveNet'); if (ln) ln.textContent = euros(net);
        updateFinancialVisualMock({ income: mock.feeEUR, commissions: comm, costs, wht, net });
      } catch {}
    });
  }
}

function initShowEditorTabs(){
  const tabs = Array.from(document.querySelectorAll('.show-editor-tabs .tab')) as HTMLButtonElement[];
  if (!tabs.length) return;
  const panels = Array.from(document.querySelectorAll('.tab-panel')) as HTMLElement[];
  function activate(id: string){
    tabs.forEach(t => {
      const active = t.dataset.tab === id;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active ? 'true':'false');
      const panelId = 'tab-' + t.dataset.tab;
      const panel = document.getElementById(panelId);
      if (panel){ panel.hidden = !active; }
    });
    try { localStorage.setItem('showEditor:lastTab', id); } catch {}
    const currentId = (window as any).__currentShowId as string | undefined;
    if (currentId) updateShowHash(currentId, id);
  }
  tabs.forEach(t => t.addEventListener('click', () => activate(t.dataset.tab || 'details')));
  // restore last tab
  let last = 'details';
  try { const raw = localStorage.getItem('showEditor:lastTab'); if (raw) last = raw; } catch {}
  if (!tabs.some(t => t.dataset.tab === last)) last = 'details';
  // If hash defines a tab for current id, prefer it
  let fromHash: string | undefined;
  try {
    const hash = location.hash; const m = hash.match(/#\/show\/([^\/]+)\/(\w+)/);
    if (m){ fromHash = m[2]; }
  } catch {}
  if (fromHash && tabs.some(t => t.dataset.tab === fromHash)) activate(fromHash); else activate(last);
  (window as any).activateShowTab = activate;
}

function updateShowHash(id: string, tab?: string){
  const current = tab || (document.querySelector('.show-editor-tabs .tab.active') as HTMLElement | null)?.dataset.tab || 'details';
  const newHash = `#/show/${id}/${current}`;
  if (location.hash !== newHash){
    history.replaceState(null, '', newHash);
  }
}

// --- Mini Map (Leaflet + Nominatim geocode) ---
let miniMapInited = false;
let miniMap: any = null;
let miniMarker: any = null;
let geocodeTimer: any = null;
// Geocode cache (localStorage) -------------------------------------------------
interface GeocodeCacheEntry { lat: number; lon: number; displayName?: string; ts: number; }
const GEOCODE_CACHE_KEY = 'ota:geocodeCache:v1';
const GEOCODE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
function loadGeocodeCache(): Record<string, GeocodeCacheEntry> {
  try { const raw = localStorage.getItem(GEOCODE_CACHE_KEY); if (raw) return JSON.parse(raw); } catch {}
  return {};
}
function saveGeocodeCache(c: Record<string, GeocodeCacheEntry>){ try { localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(c)); } catch {} }
function getCachedGeocode(q: string): GeocodeCacheEntry | undefined {
  const cache = loadGeocodeCache();
  const entry = cache[q];
  if (!entry) return;
  if (Date.now() - entry.ts > GEOCODE_TTL_MS){
    delete cache[q];
    saveGeocodeCache(cache);
    return;
  }
  return entry;
}
function setCachedGeocode(q: string, lat: number, lon: number, displayName?: string){
  const cache = loadGeocodeCache();
  cache[q] = { lat, lon, displayName, ts: Date.now() };
  const keys = Object.keys(cache);
  if (keys.length > 75){
    keys.sort((a,b)=> cache[a].ts - cache[b].ts);
    const remove = keys.length - 75;
    for (let i=0;i<remove;i++) delete cache[keys[i]];
  }
  saveGeocodeCache(cache);
}
let lastGeocodeQuery = '';
let lastGeocodeAt = 0; // timestamp when last successful fetch finished
let geocodePending = false;
let geocodeSkeletonTimer: any = null;
function ensureLeafletMini(): Promise<any>{
  if ((window as any).L) return Promise.resolve((window as any).L);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve((window as any).L);
    script.onerror = e => reject(e);
    document.head.appendChild(script);
  });
}
function initMiniMap(){
  if (miniMapInited) return; miniMapInited = true;
  const host = document.getElementById('showEditorMap'); if (!host) return;
  host.innerHTML = '<div class="mini-map-canvas" style="position:absolute;inset:0;"></div><div class="mini-map-status" style="position:absolute;left:8px;bottom:6px;font-size:10px;color:var(--color-text-secondary);background:rgba(0,0,0,.45);padding:2px 6px;border-radius:6px;">Locating…</div>';
  ensureLeafletMini().then(L => {
    const canvas = host.querySelector('.mini-map-canvas') as HTMLElement | null; if (!canvas) return;
    miniMap = L.map(canvas, { attributionControl:false, zoomControl:false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 14 }).addTo(miniMap);
    miniMap.setView([48.8566,2.3522], 3);
    bindGeoInputs();
    scheduleGeocode();
  }).catch(()=>{
    const st = host.querySelector('.mini-map-status'); if (st) st.textContent = 'Map failed';
  });
}
function bindGeoInputs(){
  ['showCity','showCountry','showVenue'].forEach(id => {
    const inp = document.getElementById(id) as HTMLInputElement | null; if (!inp) return;
    inp.addEventListener('input', ()=> scheduleGeocode());
  });
}
function scheduleGeocode(){
  clearTimeout(geocodeTimer);
  geocodeTimer = setTimeout(()=> runGeocode(), 650); // debounce 650ms
  const st = document.querySelector('#showEditorMap .mini-map-status'); if (st) st.textContent = 'Waiting…';
}
function buildGeocodeQuery(){
  const city = getVal('showCity'); const venue = getVal('showVenue'); const country = getVal('showCountry');
  return [venue, city, country].filter(Boolean).join(', ');
}
function runGeocode(){
  const query = buildGeocodeQuery();
  const st = document.querySelector('#showEditorMap .mini-map-status');
  if (!query){ if (st) st.textContent='Enter location'; return; }
  // If override has stored coords matching query, use them directly
  try {
    const id = (window as any).__currentShowId as string | undefined;
    if (id){
      const ov = getOverride(id);
      if (ov.lastGeoQuery === query && typeof ov.lastLat === 'number' && typeof ov.lastLon === 'number'){
        placeMiniMarker(ov.lastLat, ov.lastLon);
        if (st) st.textContent='✓';
        return;
      }
    }
  } catch {}
  // Skip if same query already resolved recently and no input change
  if (query === lastGeocodeQuery && geocodePending){ return; }
  const cached = getCachedGeocode(query);
  if (cached){
    placeMiniMarker(cached.lat, cached.lon);
    lastGeocodeQuery = query;
    lastGeocodeAt = Date.now();
    if (st) st.textContent='✓ (cached)';
    return;
  }
  // If identical query recently succeeded (< 30m) skip network
  if (query === lastGeocodeQuery && Date.now() - lastGeocodeAt < 30*60*1000){
    if (st) st.textContent='(recent)';
    return;
  }
  geocodePending = true;
  if (st) st.textContent='Geocoding…';
  showGeocodeSkeletonDelayed();
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`, { headers: { 'Accept':'application/json' }})
    .then(r => r.json()).then(res => {
      geocodePending = false;
      hideGeocodeSkeleton();
      if (!Array.isArray(res) || !res.length){ if (st) st.textContent='No match'; removeGeoList(); return; }
      // If more than 1 result, show list
      placePrimaryFromResults(query, res, st as any);
    }).catch(()=>{ geocodePending = false; hideGeocodeSkeleton(); if (st) st.textContent='Error'; });
}
function placePrimaryFromResults(query: string, results: any[], statusEl: HTMLElement | null){
  const first = results[0];
  applyGeocodeSelection(query, first);
  if (statusEl) statusEl.textContent = results.length > 1 ? `✓ (${results.length})` : '✓';
  if (results.length > 1) renderGeoList(query, results.slice(0,5)); else removeGeoList();
}
function applyGeocodeSelection(query: string, item: any){
  const plat = parseFloat(item.lat); const plon = parseFloat(item.lon);
  placeMiniMarker(plat, plon);
  setCachedGeocode(query, plat, plon, item.display_name);
  lastGeocodeQuery = query; lastGeocodeAt = Date.now();
  try {
    const id = (window as any).__currentShowId as string | undefined; if (id){
      const ov = getOverride(id);
      ov.lastLat = plat; ov.lastLon = plon; ov.lastGeoQuery = query; ov.lastDisplayName = item.display_name;
      saveOverride(id, ov);
    }
  } catch {}
}
function renderGeoList(query: string, items: any[]){
  const host = document.getElementById('showEditorMap'); if (!host) return;
  removeGeoList();
  const list = document.createElement('div'); list.className='geo-suggestions';
  list.style.position='absolute'; list.style.top='4px'; list.style.right='4px'; list.style.maxWidth='240px'; list.style.background='rgba(12,16,22,0.92)'; list.style.backdropFilter='blur(4px)'; list.style.border='1px solid rgba(255,255,255,0.12)'; list.style.padding='4px'; list.style.borderRadius='8px'; list.style.fontSize='11px'; list.style.lineHeight='1.3'; list.style.zIndex='30'; list.style.maxHeight='180px'; list.style.overflow='auto';
  list.innerHTML = items.map((it,i)=> `<button type="button" data-geo-idx="${i}" style="all:unset;display:block;cursor:pointer;padding:4px 6px;border-radius:6px;width:100%;text-align:left;white-space:normal;">${it.display_name.replace(/,/g,'<span class=\"muted\">,</span>')}</button>`).join('');
  list.addEventListener('click', (e)=> {
    const btn = (e.target as HTMLElement).closest('button[data-geo-idx]') as HTMLButtonElement | null; if (!btn) return;
    const idx = parseInt(btn.getAttribute('data-geo-idx')||'0',10);
    const sel = items[idx];
    applyGeocodeSelection(query, sel);
    removeGeoList();
  });
  host.appendChild(list);
}
function removeGeoList(){
  const ex = document.querySelector('#showEditorMap .geo-suggestions'); if (ex) ex.remove();
}
function showGeocodeSkeletonDelayed(){
  clearTimeout(geocodeSkeletonTimer);
  geocodeSkeletonTimer = setTimeout(()=> {
    if (!geocodePending) return;
    const host = document.getElementById('showEditorMap'); if (!host) return;
    if (host.querySelector('.geo-skeleton')) return;
    const sk = document.createElement('div');
    sk.className = 'geo-skeleton';
    sk.style.position='absolute'; sk.style.inset='0'; sk.style.display='flex'; sk.style.alignItems='center'; sk.style.justifyContent='center';
    sk.style.background='linear-gradient(110deg, rgba(255,255,255,0.06) 8%, rgba(255,255,255,0.02) 18%, rgba(255,255,255,0.06) 33%)';
    sk.style.backgroundSize='200% 100%';
    sk.style.animation='geoShimmer 1.2s linear infinite';
    sk.innerHTML = '<div style="font-size:11px;color:var(--color-text-secondary);background:rgba(0,0,0,0.4);padding:4px 8px;border-radius:6px;">Resolviendo geocodio…</div>';
    host.appendChild(sk);
  }, 380); // show if slower than 380ms
}
function hideGeocodeSkeleton(){
  clearTimeout(geocodeSkeletonTimer);
  const el = document.querySelector('#showEditorMap .geo-skeleton'); if (el) el.remove();
}
function placeMiniMarker(lat:number, lng:number){
  if (!miniMap || !(window as any).L) return;
  const L = (window as any).L;
  if (miniMarker){ try { miniMap.removeLayer(miniMarker); } catch {} }
  miniMarker = L.circleMarker([lat,lng], { radius:5, color:'#bfff00', weight:2, opacity:0.9 }).addTo(miniMap);
  try { if (miniMap.flyTo) miniMap.flyTo([lat,lng], 7, { duration:0.8 }); else miniMap.setView([lat,lng],7); } catch { miniMap.setView([lat,lng],7); }
}

// --- Financial Visuals ---
function updateFinancialVisuals(showId: string){
  try {
    const fin = computeShowFinance(showId);
    setWidth('barNet', fin.net, fin);
    setWidth('barComm', fin.commissions, fin);
    setWidth('barCosts', fin.costs, fin);
    setWidth('barWht', fin.wht, fin);
    setText('summaryNet', euros(fin.net));
    setText('summaryComm', euros(fin.commissions));
    setText('summaryCosts', euros(fin.costs));
    const whtEl = document.getElementById('summaryWht'); if (whtEl) whtEl.textContent = euros(fin.wht);
    const cbd = document.getElementById('summaryCommBreakdown');
    if (cbd){
      const mg = (fin as any).mgmtCommission; const bk = (fin as any).bookingCommission;
      if (typeof mg === 'number' || typeof bk === 'number'){
        const mgTxt = typeof mg === 'number' ? euros(mg) : '—';
        const bkTxt = typeof bk === 'number' ? euros(bk) : '—';
        cbd.textContent = `Mgmt ${mgTxt} / Booking ${bkTxt}`;
      } else cbd.textContent = 'Mgmt — / Booking —';
    }
  } catch {}
}
function updateFinancialVisualMock(fin: { income:number; commissions:number; costs:number; wht:number; net:number; }){
  const total = Math.max(0.0001, fin.income || (fin.commissions + fin.costs + fin.net + fin.wht));
  function pct(v:number){ return Math.max(0, Math.min(100, (v/total)*100)); }
  const bn = document.getElementById('barNet') as HTMLElement | null; if (bn) bn.style.width = pct(fin.net)+ '%';
  const bc = document.getElementById('barComm') as HTMLElement | null; if (bc) bc.style.width = pct(fin.commissions)+ '%';
  const bco = document.getElementById('barCosts') as HTMLElement | null; if (bco) bco.style.width = pct(fin.costs)+ '%';
  const bw = document.getElementById('barWht') as HTMLElement | null; if (bw) bw.style.width = pct(fin.wht)+ '%';
  setText('summaryNet', euros(fin.net));
  setText('summaryComm', euros(fin.commissions));
  setText('summaryCosts', euros(fin.costs));
  const whtEl = document.getElementById('summaryWht'); if (whtEl) whtEl.textContent = euros(fin.wht);
}
function setWidth(id: string, val: number, fin: { income:number; commissions:number; costs:number; net:number; wht?:number; }){
  const total = Math.max(0.0001, fin.income || (fin.commissions + fin.costs + fin.net + (fin as any).wht || 0));
  const el = document.getElementById(id) as HTMLElement | null; if (!el) return;
  const pct = Math.max(0, Math.min(100, (val/total)*100));
  el.style.width = pct + '%';
}

// --- Costs quick add + donut chart ---
let costsChart: any = null;
function bindQuickCosts(){
  const container = document.querySelector('#tab-costs .quick-costs'); if (!container || (container as any)._qcBound) return;
  (container as any)._qcBound = true;
  container.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.qc-btn') as HTMLElement | null; if (!btn) return;
    const spec = btn.getAttribute('data-qc'); if (!spec) return;
    const id = (window as any).__currentShowId as string | undefined; if (!id) return;
    const [type, amtStr] = spec.split(':');
    const amt = parseFloat(amtStr||'0')||0;
    addCost(id, type, amt, type + ' quick add');
    renderCostsList(id);
    updateMiniTotals(id);
  });
  const addBtn = document.getElementById('addCostBtn');
  if (addBtn && !(addBtn as any)._costAdd){
    (addBtn as any)._costAdd = true;
    addBtn.addEventListener('click', (e)=> {
      e.preventDefault();
      const id = (window as any).__currentShowId as string | undefined; if (!id) return;
      const type = getVal('newCostType') || 'Misc';
      const desc = getVal('newCostDesc') || '';
      const amt = parseFloat(getVal('newCostAmt')||'0')||0;
      if (!amt) return;
      addCost(id, type, amt, desc||undefined);
      setVal('newCostDesc',''); setVal('newCostAmt','');
      renderCostsList(id);
      updateMiniTotals(id);
    });
  }
}

function renderCostsList(showId: string){
  const list = document.getElementById('showCostsList'); if (!list) return;
  const costs = getCosts(showId);
  if (!costs.length){ list.innerHTML = '<div class="muted" style="font-size:12px;">No costs yet</div>'; }
  else {
    list.innerHTML = costs.map(c => `<div class="cost-row" data-cost-id="${c.id}"><span class="cost-type">${c.type}</span> <span class="muted" style="font-size:11px;">${c.desc||''}</span><strong style="margin-left:auto;">${euros(c.amount)}</strong><button class="ghost tiny cost-del" title="Remove" aria-label="Remove cost" data-id="${c.id}"><i data-lucide="x"></i></button></div>`).join('');
  }
  if (!(list as any)._costDelBound){
    (list as any)._costDelBound = true;
    list.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.cost-del') as HTMLButtonElement | null; if (!btn) return;
      const id = btn.getAttribute('data-id'); if (!id) return;
      const showId = (window as any).__currentShowId as string | undefined; if (!showId) return;
      const costToDelete = getCostById(id); // capture before removal
      const row = btn.closest('.cost-row') as HTMLElement | null;
  showConfirmModal('Delete this cost?', () => {
        if (row){
          row.classList.add('removing');
          setTimeout(()=>{ 
            deleteCost(id); 
            renderCostsList(showId); 
            updateMiniTotals(showId); 
            if (costToDelete) showUndoToast(costToDelete, showId);
          }, 260);
        } else {
          deleteCost(id); renderCostsList(showId); updateMiniTotals(showId); if (costToDelete) showUndoToast(costToDelete, showId);
        }
  }, { title:'Confirm', confirmLabel:'Delete', cancelLabel:'Cancel' });
    });
  }
  updateCostsChart(costs);
}

function updateCostsChart(costs: any[]){
  const canvas = document.getElementById('costsDonutChart') as HTMLCanvasElement | null; if (!canvas) return;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  const byType: Record<string, number> = {};
  costs.forEach(c => { byType[c.type] = (byType[c.type]||0) + c.amount; });
  const labels = Object.keys(byType);
  const data = labels.map(l => byType[l]);
  const total = data.reduce((a,b)=> a+b, 0) || 1;
  if (!(window as any).Chart) return;
  if (costsChart){ costsChart.destroy(); }
  costsChart = new (window as any).Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: genPalette(labels.length), borderWidth:1, borderColor:'rgba(0,0,0,0.4)' }] },
    options: { plugins: { legend: { display:false } }, cutout: '60%', responsive: false }
  });
  // Percent legend beneath chart
  const legendHostId = 'costsDonutLegend';
  let legendHost = document.getElementById(legendHostId);
  if (!legendHost){
    legendHost = document.createElement('div'); legendHost.id = legendHostId; legendHost.style.marginTop = '10px'; legendHost.style.fontSize='11px'; legendHost.style.display='grid'; legendHost.style.gap='4px';
    const wrap = document.querySelector('#tab-costs .costs-visual'); if (wrap) wrap.appendChild(legendHost);
  }
  if (legendHost){
    legendHost.innerHTML = labels.map((l,i)=> {
      const pct = ((data[i]/total)*100).toFixed(0);
      return `<div class="cost-legend-row"><span class="dot" style="background:${genPalette(labels.length)[i]};"></span>${l} <span style="margin-left:auto;">${pct}%</span></div>`;
    }).join('');
  }
}
function genPalette(n: number){
  const base = ['#3B82F6','#8B5CF6','#EC4899','#F59E0B','#10B981','#06B6D4','#F43F5E','#6366F1','#84CC16','#F97316'];
  const out: string[] = [];
  for (let i=0;i<n;i++){ out.push(base[i%base.length]); }
  return out;
}

// --- Recent Cost History Suggestions -------------------------------------------
function loadRecentCosts(): { type:string; amount:number; ts:number; }[]{
  try { const raw = localStorage.getItem('ota:recent-costs:v1'); if (raw) return JSON.parse(raw); } catch {}
  return [];
}
function initCostHistorySuggestions(){
  const amtInput = document.getElementById('newCostAmt') as HTMLInputElement | null;
  const typeInput = document.getElementById('newCostType') as HTMLInputElement | null;
  if (!amtInput || !typeInput) return;
  const recent = loadRecentCosts(); if (!recent.length) return;
  // datalist for types
  if (!document.getElementById('costTypeDatalist')){
    const dl = document.createElement('datalist'); dl.id='costTypeDatalist';
    dl.innerHTML = recent.map(r=> `<option value="${r.type}"></option>`).join('');
    document.body.appendChild(dl);
    typeInput.setAttribute('list','costTypeDatalist');
  }
  // suggestion chips (top of costs body)
  const host = document.querySelector('#tab-costs .costs-layout');
  if (host && !host.querySelector('.recent-cost-chips')){
    const wrap = document.createElement('div'); wrap.className='recent-cost-chips'; wrap.style.display='flex'; wrap.style.flexWrap='wrap'; wrap.style.gap='6px'; wrap.style.margin='4px 0 10px';
    wrap.innerHTML = recent.slice(0,6).map(r=> `<button type="button" class="chip small" data-rc-type="${r.type}" data-rc-amt="${r.amount}" style="cursor:pointer;">${r.type} • ${euros(r.amount)}</button>`).join('');
    host.prepend(wrap);
    wrap.addEventListener('click', (e)=> {
      const btn = (e.target as HTMLElement).closest('button[data-rc-type]') as HTMLButtonElement | null; if (!btn) return;
      const t = btn.getAttribute('data-rc-type')||''; const a = parseFloat(btn.getAttribute('data-rc-amt')||'0')||0;
      if (typeInput) typeInput.value = t;
      if (amtInput) amtInput.value = String(a);
      amtInput?.focus();
    });
  }
}

// --- Undo Toast for cost deletion -------------------------------------------------
let undoTimer: any = null;
function ensureToastHost(){
  let host = document.getElementById('toastHost');
  if (!host){
    host = document.createElement('div');
    host.id = 'toastHost';
    host.style.position = 'fixed';
    host.style.left = '50%';
    host.style.bottom = '22px';
    host.style.transform = 'translateX(-50%)';
    host.style.zIndex = '4000';
    host.style.display = 'flex';
    host.style.flexDirection = 'column';
    host.style.gap = '8px';
    host.setAttribute('role','status');
    host.setAttribute('aria-live','polite');
    document.body.appendChild(host);
  }
  return host;
}
function showUndoToast(cost: any, showId: string){
  const host = ensureToastHost();
  clearTimeout(undoTimer);
  host.innerHTML = '';
  const el = document.createElement('div');
  el.className = 'toast';
  el.style.background = 'rgba(20,24,30,0.92)';
  el.style.backdropFilter = 'blur(4px)';
  el.style.border = '1px solid rgba(255,255,255,0.12)';
  el.style.padding = '10px 14px';
  el.style.fontSize = '13px';
  el.style.borderRadius = '10px';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.gap = '14px';
  el.style.boxShadow = '0 4px 18px -4px rgba(0,0,0,0.5)';
  el.innerHTML = `<span>Removed cost <strong>${cost.type}</strong></span>`;
  const btn = document.createElement('button');
  btn.textContent = 'Undo';
  btn.className = 'ghost small';
  btn.style.background = 'var(--color-primary)';
  btn.style.color = '#000';
  btn.style.padding = '4px 10px';
  btn.style.borderRadius = '6px';
  btn.style.fontWeight = '600';
  btn.style.fontSize = '12px';
  btn.addEventListener('click', ()=> {
    restoreCost(cost);
    renderCostsList(showId);
    updateMiniTotals(showId);
    host.innerHTML='';
  });
  el.appendChild(btn);
  host.appendChild(el);
  undoTimer = setTimeout(()=> { host.innerHTML=''; }, 6000);
}
