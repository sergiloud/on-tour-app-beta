// Mission Control module (clean restored version with financial legend filtering)
import { getNextShow, getMonthShows } from '../../shows/core/shows';
import { formatEuro, computeMonthSummary } from '../../finance/core/finance';
import { computeShowFinance } from '../../shows/core/show-finance';

type View = 'next' | 'upcoming' | 'month' | 'financials';
type LayerSettings = { heat: boolean; status: boolean; route: boolean };

let currentView: View = 'next';
let layerSettings: LayerSettings = loadLayerSettings();
let map: any = null;
let markers: any[] = [];
let monthLine: any = null;
let accentIcon: any = null;
let focusedMarker: any = null;

// ---------------------------------------------------------------------------
export function initMissionControl(){
  try { const saved = localStorage.getItem('mc:view'); if (saved === 'next' || saved === 'month' || saved === 'financials') currentView = saved as View; } catch {}
  showMapLoading(true);
  bindViewToggle();
  bindLayerToggle();
  ensureLeaflet().then(() => { initMap(); renderCurrentView(); showMapLoading(false); }).catch(()=> showMapLoading(false));
  
  // Ensure HUD is visible after initialization
  setTimeout(() => {
    const hud = document.getElementById('mapHud');
    if (hud) {
      hud.style.display = 'flex';
      hud.style.opacity = '1';
      // Force show the current view
      toggleHudView(currentView);
    }
  }, 100);
}

// Lazy Leaflet loader -------------------------------------------------------
let leafletPromise: Promise<any> | null = null;
function ensureLeaflet(): Promise<any>{
  if ((window as any).L) return Promise.resolve((window as any).L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve,reject)=>{
    const s = document.createElement('script');
    s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.async=true;
    s.onload=()=> resolve((window as any).L); s.onerror=e=> reject(e);
    document.head.appendChild(s);
  });
  return leafletPromise;
}

// Map init ------------------------------------------------------------------
function initMap(){
  const el = document.getElementById('map-canvas');
  if (!el || (window as any).L === undefined) return;
  if (map) return;
  try {
    const L = (window as any).L;
    const persisted = loadMapView();
    map = L.map(el, { zoomControl:false, attributionControl:false });
    if (persisted) map.setView(persisted.center, persisted.zoom); else map.setView([48.8566,2.3522],4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:11 }).addTo(map);
    accentIcon = L.divIcon({ className:'mc-marker mc-marker-accent', html:'<div class="marker-core"></div>', iconSize:[24,24], iconAnchor:[12,12] });
    map.on('moveend', () => persistMapView());
  } catch {}
}

// Loading overlay -----------------------------------------------------------
function showMapLoading(on:boolean){
  const host = document.querySelector('.mission-placeholder');
  if (!host) return;
  let overlay = host.querySelector('.map-loading-overlay') as HTMLElement | null;
  if (on){
    if (!overlay){
      overlay = document.createElement('div');
      overlay.className='map-loading-overlay';
      overlay.innerHTML='<div class="spinner"></div><span>Loading map…</span>';
      host.appendChild(overlay);
    }
  } else if (overlay){ overlay.classList.add('fade'); setTimeout(()=> overlay && overlay.remove(), 350); }
}

interface PersistedMapView { center:[number,number]; zoom:number; }
function persistMapView(){ if (!map) return; try { const v:PersistedMapView={ center:[map.getCenter().lat,map.getCenter().lng], zoom: map.getZoom() }; localStorage.setItem('mc:map:view', JSON.stringify(v)); } catch {} }
function loadMapView():PersistedMapView | null { try { const raw = localStorage.getItem('mc:map:view'); if (raw) return JSON.parse(raw); } catch{} return null; }

// View + layer toggles ------------------------------------------------------
function bindViewToggle(){
  const group = document.getElementById('missionViewToggle');
  if (!group || (group as any)._bound) return; (group as any)._bound = true;
  group.addEventListener('click', e => {
    const btn = (e.target as HTMLElement).closest('button[data-view]') as HTMLButtonElement | null; if (!btn) return;
    const view = btn.getAttribute('data-view') as View; if (!view) return;
    currentView = view; try { localStorage.setItem('mc:view', view); } catch {}
    group.querySelectorAll('button').forEach(b => { const on = b===btn; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on?'true':'false'); });
    renderCurrentView();
  });
}

function bindLayerToggle(){
  const group = document.getElementById('missionLayerToggle');
  if (!group || (group as any)._bound) return; (group as any)._bound = true;
  group.querySelectorAll('button[data-layer]').forEach(btn => {
    const key = btn.getAttribute('data-layer') as keyof LayerSettings; const on = !!layerSettings[key];
    btn.classList.toggle('active', on); btn.setAttribute('aria-pressed', on?'true':'false');
  });
  group.addEventListener('click', e => {
    const btn = (e.target as HTMLElement).closest('button[data-layer]') as HTMLButtonElement | null; if (!btn) return;
    const key = btn.getAttribute('data-layer') as keyof LayerSettings; if (!key) return;
    layerSettings[key] = !layerSettings[key]; persistLayerSettings();
    const on = layerSettings[key]; btn.classList.toggle('active', on); btn.setAttribute('aria-pressed', on?'true':'false');
    renderCurrentView();
  });
}

function persistLayerSettings(){ try { localStorage.setItem('mc:layers', JSON.stringify(layerSettings)); } catch {} }
function loadLayerSettings(): LayerSettings { try { const raw = localStorage.getItem('mc:layers'); if (raw){ const o=JSON.parse(raw); return { heat:o.heat!==false, status:o.status!==false, route:o.route!==false }; } } catch{} return { heat:true,status:true,route:true }; }

function renderCurrentView(){
  if (currentView === 'next') renderNextShow();
  else if (currentView === 'upcoming') renderUpcomingView();
  else if (currentView === 'month') renderMonthView();
  else renderFinancialsView();
}

// Utility -------------------------------------------------------------------
function clearMarkers(){ markers.forEach(m => { try { map.removeLayer(m); } catch {} }); markers=[]; if (monthLine){ try { map.removeLayer(monthLine); } catch{}; monthLine=null; } }
function fadeOutMarkers(done:()=>void){ const els = markers.map(m => m.getElement && m.getElement()).filter(Boolean) as HTMLElement[]; if (!els.length){ done(); return; } els.forEach(el => { el.style.transition='opacity .3s'; el.style.opacity='0'; }); setTimeout(()=>done(),320); }

function toggleHudView(view:View){
  const all = Array.from(document.querySelectorAll('.hud-view')) as HTMLElement[];
  all.forEach(v => { v.classList.remove('active'); if (v.dataset.viewContent !== view) v.hidden = true; });
  const target = document.querySelector(`.hud-view[data-view-content="${view}"]`) as HTMLElement | null; if (target){ target.hidden=false; target.classList.add('active'); }
  // Legend visibility
  const legend = document.getElementById('finLegend'); if (legend) legend.hidden = (view !== 'financials');
}

// Next View -----------------------------------------------------------------
async function renderNextShow(){
  toggleHudView('next');
  if (!map || !(window as any).L){ ensureLeaflet().then(()=>{ if (!map) initMap(); renderNextShow(); }); return; }
  if (markers.length){ fadeOutMarkers(()=> clearMarkers()); } else clearMarkers();
  const next = getNextShow();
  const titleEl = document.getElementById('hudNextTitle');
  const metaEl = document.getElementById('hudNextMeta');
  const segIncome = document.getElementById('hudSegIncome');
  const segExpenses = document.getElementById('hudSegExpenses');
  const segIncomeBar = document.querySelector('#hudFinancialBar .hud-bar-seg.income') as HTMLElement | null;
  const segExpensesBar = document.querySelector('#hudFinancialBar .hud-bar-seg.expenses') as HTMLElement | null;
  if (!next){ if (titleEl) titleEl.textContent='No upcoming'; if (metaEl) metaEl.textContent=''; clearMarkers(); return; }
  const fin = computeShowFinance(next.id);
  const expensesTotal = fin.commissions + fin.costs + fin.wht;
  const baseIncome = fin.income || 1;
  const expPct = Math.min(100, Math.max(0,(expensesTotal/baseIncome)*100));
  if (segIncomeBar) segIncomeBar.style.width='100%';
  if (segExpensesBar) segExpensesBar.style.width=expPct+'%';
  if (segIncome) segIncome.textContent = formatEuro(fin.income);
  if (segExpenses) segExpenses.textContent = formatEuro(expensesTotal);
  const ttComms = document.getElementById('ttCommissions'); if (ttComms) ttComms.textContent = formatEuro(fin.commissions);
  const ttCosts = document.getElementById('ttCosts'); if (ttCosts) ttCosts.textContent = formatEuro(fin.costs);
  const ttWht = document.getElementById('ttWht'); if (ttWht) ttWht.textContent = formatEuro(fin.wht);
  const ttTotal = document.getElementById('ttTotalExp'); if (ttTotal) ttTotal.textContent = formatEuro(expensesTotal);
  if (titleEl) titleEl.textContent = next.city + (next.venue ? ' — ' + next.venue : '');
  if (metaEl) metaEl.textContent = (next.status||'');
  const hudNet = document.getElementById('hudNet'); if (hudNet) hudNet.textContent = formatEuro(fin.net);
  // plot single marker
  await plotSingle(next.city, (next as any).lat, (next as any).lng, next.venue);
}

async function plotSingle(city:string, lat?:number, lng?:number, venue?:string){
  const L = (window as any).L; if (!L) return; clearMarkers();
  const base = (lat && lng) ? { lat, lng } : await getLatLng(city);
  const m = L.marker([base.lat, base.lng], accentIcon?{ icon:accentIcon }:undefined).addTo(map).bindPopup(`${city}${venue? ' — '+venue:''}`);
  markers.push(m);
  try { if (map.flyTo) map.flyTo([base.lat,base.lng], 6, { duration:1.0 }); else map.setView([base.lat,base.lng],6); } catch { map.setView([base.lat,base.lng],6); }
}

// Upcoming View -----------------------------------------------------------------
async function renderUpcomingView(){
  toggleHudView('upcoming');
  if (!map || !(window as any).L){ ensureLeaflet().then(()=>{ if (!map) initMap(); renderUpcomingView(); }); return; }
  if (markers.length){ fadeOutMarkers(()=> clearMarkers()); } else clearMarkers();

  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 30); // Next 30 days

  const allShows = getMonthShows();
  const upcomingShows = allShows.filter(show => {
    const showDate = new Date(show.date);
    return showDate >= now && showDate <= endDate;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const titleEl = document.getElementById('hudUpcomingTitle');
  const countEl = document.getElementById('hudUpcomingCount');
  const eventsEl = document.getElementById('hudUpcomingEvents');

  if (titleEl) titleEl.textContent = 'Next 30 Days';
  if (countEl) countEl.textContent = `${upcomingShows.length} upcoming events`;

  if (eventsEl) {
  if (upcomingShows.length === 0) {
      eventsEl.innerHTML = `
        <div class="upcoming-event empty">
          <div class="event-date">No shows</div>
      <div class="event-info">No upcoming shows in the next 30 days</div>
        </div>
      `;
    } else {
    eventsEl.innerHTML = upcomingShows.slice(0, 5).map(show => {
        const showDate = new Date(show.date);
        const daysUntil = Math.ceil((showDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const timeLabel = daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;
        const fin = computeShowFinance(show.id);

        return `
      <div class="upcoming-event ${daysUntil <= 14 ? 'near' : 'far'}">
            <div class="event-date">${showDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            <div class="event-info">
              <div class="event-city">${show.city}</div>
              <div class="event-venue">${show.venue || 'Venue TBA'}</div>
              <div class="event-net">${formatEuro(fin.net)}</div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Plot markers for upcoming shows
  if (upcomingShows.length > 0) {
    const L = (window as any).L;
    for (const show of upcomingShows) {
      const base = (show as any).lat && (show as any).lng ? { lat: (show as any).lat, lng: (show as any).lng } : await getLatLng(show.city);
      const showDate = new Date(show.date);
      const daysUntil = Math.ceil((showDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let markerColor = '#16a34a'; // green for near future
  if (daysUntil > 14) markerColor = '#3B82F6'; // blue for further (15-30)
  if (daysUntil <= 1) markerColor = '#f59e0b'; // orange for very soon

      const marker = L.circleMarker([base.lat, base.lng], {
        radius: 8,
        color: markerColor,
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.7,
        className: 'mc-upcoming-marker'
      }).addTo(map);

      const fin = computeShowFinance(show.id);
      const popupContent = `
        <div style="background: rgba(15,18,22,0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); backdrop-filter: blur(8px); color: #fff; font-size: 13px; max-width: 220px; line-height: 1.4;">
          <div style="font-weight: 700; font-size: 15px; margin-bottom: 6px; color: #00d4ff;">${show.city}</div>
          <div style="color: #ccc; margin-bottom: 4px;">${show.venue || 'Venue TBA'}</div>
          <div style="color: #fff; margin-bottom: 6px; font-weight: 500;">${showDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <div style="color: ${markerColor}; margin-bottom: 8px; font-weight: 600;">● ${daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}</div>
          <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #ccc;">Estimated Net:</span>
              <span style="color: ${fin.net >= 0 ? '#16a34a' : '#dc2626'}; font-weight: 600;">${formatEuro(fin.net)}</span>
            </div>
          </div>
        </div>`;

      marker.bindPopup(popupContent);
      markers.push(marker);
    }

    // Fit bounds to show all upcoming events
    try {
      const bounds = L.latLngBounds(upcomingShows.map(show => {
        const coords = (show as any).lat && (show as any).lng ? [(show as any).lat, (show as any).lng] : [0, 0];
        return coords;
      }).filter(coord => coord[0] !== 0 || coord[1] !== 0));

      if (bounds.isValid()) {
        if ((map as any).flyToBounds) map.flyToBounds(bounds, { padding: [28, 28], duration: 1 });
        else map.fitBounds(bounds, { padding: [28, 28] });
      }
    } catch {}
  }
}
async function renderMonthView(){
  toggleHudView('month');
  if (!map || !(window as any).L){ ensureLeaflet().then(()=>{ if (!map) initMap(); renderMonthView(); }); return; }
  if (markers.length){ fadeOutMarkers(()=> clearMarkers()); } else clearMarkers();
  const list = getMonthShows();
  const sum = computeMonthSummary();
  const titleEl = document.getElementById('hudMonthTitle'); if (titleEl) titleEl.textContent='This Month'; // already English
  const metaEl = document.getElementById('hudMonthMeta'); if (metaEl) metaEl.textContent = `${list.length} shows`;
  const incEl = document.getElementById('hudMonthIncome'); if (incEl) incEl.textContent = formatEuro(sum.income||0);
  const expEl = document.getElementById('hudMonthExpenses'); if (expEl) expEl.textContent = formatEuro((sum.commissions||0)+(sum.expenses||0));
  const netEl = document.getElementById('hudMonthNet'); if (netEl) netEl.textContent = formatEuro(sum.net||0);
  const segIncomeBar = document.querySelector('#hudFinancialBar .hud-bar-seg.income') as HTMLElement | null;
  const segExpensesBar = document.querySelector('#hudFinancialBar .hud-bar-seg.expenses') as HTMLElement | null;
  // Month summary currently exposes commissions + expenses; WHT aggregated per show not yet in summary
  const expensesTotal = (sum.commissions||0)+(sum.expenses||0);
  const baseIncome = sum.income || 1;
  const expPct = Math.min(100, Math.max(0,(expensesTotal/baseIncome)*100));
  if (segIncomeBar) segIncomeBar.style.width='100%';
  if (segExpensesBar) segExpensesBar.style.width=expPct+'%';
  const segIncome = document.getElementById('hudSegIncome'); if (segIncome) segIncome.textContent = formatEuro(sum.income||0);
  const segExpenses = document.getElementById('hudSegExpenses'); if (segExpenses) segExpenses.textContent = formatEuro(expensesTotal);
  const ttComms = document.getElementById('ttCommissions'); if (ttComms) ttComms.textContent = formatEuro(sum.commissions||0);
  const ttCosts = document.getElementById('ttCosts'); if (ttCosts) ttCosts.textContent = formatEuro(sum.expenses||0);
  const ttWht = document.getElementById('ttWht'); if (ttWht) ttWht.textContent = '—';
  const ttTotal = document.getElementById('ttTotalExp'); if (ttTotal) ttTotal.textContent = formatEuro(expensesTotal);
  // Sidebar stats (basic)
  const showCountEl = document.getElementById('sidebarShowCount');
  if (showCountEl) showCountEl.textContent = list.length.toString();
  const distanceEl = document.getElementById('sidebarDistance');
  if (distanceEl){ const uniqueCities = new Set(list.map(s=>s.city)).size; distanceEl.textContent = `${uniqueCities * 500} km`; }
  const avgNetEl = document.getElementById('sidebarAvgNet');
  if (avgNetEl){ const totalNet = list.reduce((acc, s)=> { const fin = computeShowFinance(s.id); return acc + fin.net; },0); const avg = list.length? totalNet / list.length : 0; avgNetEl.textContent = formatEuro(avg); }
}

async function plotMonth(entries:{id:string; city:string}[]){
  clearMarkers(); const L = (window as any).L; if (!L) return;
  const full = getMonthShows();
  const now = new Date();
  const pts = await Promise.all(entries.map(async e => { const s = full.find(f => f.id===e.id) as any; const base = (s && s.lat && s.lng)? { lat:s.lat, lng:s.lng } : await getLatLng(e.city); const status=(s?.status||'').toLowerCase(); const date = new Date(s.date); let color='#bfff00'; if(['tentative','offer','inquiry','hold 1','hold 2','hold 3'].includes(status)) color='#3B82F6'; if(['cancelled','canceled','postponed'].includes(status)) color='#EF4444'; return { ...base, status, statusColor:color, date, city: e.city, venue: s?.venue, id: e.id }; }));
  if (layerSettings.status) pts.forEach(p => { const cm = L.circleMarker([p.lat,p.lng], { radius:6, color:p.statusColor, weight:2, opacity:0.9, fillOpacity:0.8, className:'mc-month-marker' }).addTo(map); const show = full.find(f => f.id === p.id); if (show) {
    const fin = computeShowFinance(show.id);
    const daysUntil = Math.ceil((p.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const timeStatus = daysUntil < 0 ? 'past' : daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`;

    const popupContent = `
      <div style="background: rgba(15,18,22,0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); backdrop-filter: blur(8px); color: #fff; font-size: 13px; max-width: 240px; line-height: 1.4;">
        <div style="font-weight: 700; font-size: 15px; margin-bottom: 6px; color: #00d4ff;">${p.city}</div>
        <div style="color: #ccc; margin-bottom: 4px;">${show.venue || 'Venue TBA'}</div>
        <div style="color: #fff; margin-bottom: 6px; font-weight: 500;">${new Date(show.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
        <div style="color: ${p.statusColor}; margin-bottom: 8px; font-weight: 600;">● ${show.status} • ${timeStatus}</div>
        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #ccc;">Income:</span>
            <span style="color: #16a34a; font-weight: 600;">${formatEuro(fin.income)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #ccc;">Net:</span>
            <span style="color: ${fin.net >= 0 ? '#16a34a' : '#dc2626'}; font-weight: 600;">${formatEuro(fin.net)}</span>
          </div>
        </div>
      </div>`;
    cm.bindPopup(popupContent);
  } markers.push(cm); });
  if (pts.length>1 && layerSettings.route){ const segments:any[]=[]; for (let i=0;i<pts.length-1;i++){ const a=pts[i], b=pts[i+1]; let routeColor = '#16a34a'; let routeStyle = 'solid'; // default green for future
    if (a.date < now && b.date < now) {
      routeColor = '#EF4444'; // red for past
      routeStyle = 'solid';
    } else if (a.date >= now && b.date >= now) {
      const daysFromNow = (a.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysFromNow > 30) {
        routeColor = '#3B82F6'; // blue for far future
        routeStyle = 'dashed';
      } else if (daysFromNow > 7) {
        routeColor = '#16a34a'; // green for near future
        routeStyle = 'dashed';
      } else {
        routeColor = '#f59e0b'; // orange for very near future
        routeStyle = 'solid';
      }
    } else {
      // Mixed: one past, one future
      routeColor = '#8B5CF6'; // purple for mixed
      routeStyle = 'solid';
    }
    const style:any={ color: routeColor, weight:3, opacity:0.8 };
    if (routeStyle === 'dashed') style.dashArray='8,8'; // dash for future routes
    segments.push(L.polyline([[a.lat,a.lng],[b.lat,b.lng]], style).addTo(map));

    // Add route direction arrows for future routes
    if (routeStyle === 'dashed' && a.date >= now) {
      const midPoint = [(a.lat + b.lat) / 2, (a.lng + b.lng) / 2];
      const angle = Math.atan2(b.lng - a.lng, b.lat - a.lat) * 180 / Math.PI;
      L.marker(midPoint, {
        icon: L.divIcon({
          className: 'route-arrow',
          html: `<div style="color:${routeColor};font-size:14px;font-weight:bold;transform:rotate(${angle}deg);text-shadow:1px 1px 2px rgba(0,0,0,0.7);">▶</div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).addTo(map);
    }
  } monthLine={segments}; try { const all:any[]=[]; segments.forEach(seg=>{ try{ all.push(...seg.getLatLngs()); }catch{} }); const bounds=L.latLngBounds(all); if ((map as any).flyToBounds) map.flyToBounds(bounds,{padding:[28,28],duration:1}); else map.fitBounds(bounds,{padding:[28,28]}); } catch{} } else if (pts.length===1){ const p=pts[0]; try { if (map.flyTo) map.flyTo([p.lat,p.lng],5,{duration:1}); else map.setView([p.lat,p.lng],5); } catch { map.setView([p.lat,p.lng],5); } }

  // Update sidebar stats
  const showCountEl = document.getElementById('sidebarShowCount');
  if (showCountEl) showCountEl.textContent = entries.length.toString();

  // Calculate total distance (simplified - just count cities for now)
  const uniqueCities = new Set(entries.map((e: any) => e.city)).size;
  const distanceEl = document.getElementById('sidebarDistance');
  if (distanceEl) distanceEl.textContent = `${uniqueCities * 500} km`; // Rough estimate

  // Calculate average net
  const avgNetEl = document.getElementById('sidebarAvgNet');
  if (avgNetEl) {
    const totalNet = entries.reduce((sum: number, e: any) => {
      const show = full.find((f: any) => f.id === e.id);
      if (show) {
        const fin = computeShowFinance(show.id);
        return sum + fin.net;
      }
      return sum;
    }, 0);
    const avg = entries.length > 0 ? totalNet / entries.length : 0;
    avgNetEl.textContent = formatEuro(avg);
  }
}

// Financials View -----------------------------------------------------------
async function renderFinancialsView(){
  toggleHudView('financials');
  if (!map || !(window as any).L){ ensureLeaflet().then(()=>{ if (!map) initMap(); renderFinancialsView(); }); return; }
  if (markers.length){ fadeOutMarkers(()=> clearMarkers()); } else clearMarkers();
  const shows = getMonthShows();
  const L = (window as any).L;
  interface FinRow { id:string; city:string; lat:number; lng:number; net:number; costs:number; income:number; commissions:number; title:string; wht:number; mgmtCommission:number; bookingCommission:number; }
  const rows:FinRow[] = await Promise.all(shows.map(async s => { const fin = computeShowFinance(s.id); const base = (s as any).lat && (s as any).lng ? { lat:(s as any).lat, lng:(s as any).lng } : await getLatLng(s.city); return { id:s.id, city:s.city, lat:base.lat, lng:base.lng, net:fin.net, costs:fin.costs, income:fin.income, commissions:fin.commissions, title:s.venue||s.city, wht:fin.wht, mgmtCommission:fin.mgmtCommission||0, bookingCommission:fin.bookingCommission||0 }; }));
  if (!rows.length) return;
  const maxNet = Math.max(...rows.map(r=>r.net));
  function colorForNet(n:number){ if (n<0) return '#dc2626'; const ratio = maxNet>0 ? n/maxNet : 0; if (ratio>0.66) return '#16a34a'; if (ratio>0.30) return '#f59e0b'; return '#eab308'; }
  function radiusForNet(n:number){ if (n<=0) return 5; const ratio = maxNet>0 ? n/maxNet : 0; return 6 + ratio*18; }
  function categoryForNet(n:number){ if (n<0) return 'neg'; const ratio = maxNet>0 ? n/maxNet : 0; if (ratio>0.66) return 'high'; if (ratio>0.30) return 'mid'; return 'low'; }
  if (layerSettings.heat){ rows.forEach(r => { const cat = categoryForNet(r.net); const marker = L.circleMarker([r.lat,r.lng], { radius: radiusForNet(r.net), color: colorForNet(r.net), weight:2, opacity:0, fillOpacity:0.22, className:'mc-fin-marker fin-cat-'+cat }).addTo(map); const popupHtml = `<div class="fin-popup" style="background: rgba(15,18,22,0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); backdrop-filter: blur(8px); color: #fff; font-size: 12px; max-width: 220px;"><div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: #00d4ff;">${r.city}</div><div style="color: #ccc; font-size: 11px; margin-bottom: 8px;">${r.title}</div><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 2px 6px 2px 0; color: #ccc;">Income</td><td style="padding: 2px 0; text-align: right; font-weight: 600;">${formatEuro(r.income)}</td></tr><tr><td style="padding: 2px 6px 2px 0; color: #ccc;">WHT</td><td style="padding: 2px 0; text-align: right;">${formatEuro(r.wht)}</td></tr><tr><td style="padding: 2px 6px 2px 0; color: #ccc;">Mgmt</td><td style="padding: 2px 0; text-align: right;">${formatEuro(r.mgmtCommission)}</td></tr><tr><td style="padding: 2px 6px 2px 0; color: #ccc;">Booking</td><td style="padding: 2px 0; text-align: right;">${formatEuro(r.bookingCommission)}</td></tr><tr><td style="padding: 2px 6px 2px 0; color: #ccc;">Costs</td><td style="padding: 2px 0; text-align: right;">${formatEuro(r.costs)}</td></tr><tr><td style="padding: 2px 6px 2px 0; font-weight: 700; color: #fff;">Net</td><td style="padding: 2px 0; text-align: right; font-weight: 700; color: ${r.net >= 0 ? '#16a34a' : '#dc2626'};">${formatEuro(r.net)}</td></tr></table></div>`; marker.bindPopup(popupHtml); markers.push(marker); const el = marker.getElement(); if (el){ el.setAttribute('data-fin-cat', cat); requestAnimationFrame(()=>{ el.style.transition='opacity .45s'; el.style.opacity='0.9'; }); } }); }
  // Fit bounds
  if (rows.length>1){ try { const bounds = L.latLngBounds(rows.map(r=>[r.lat,r.lng])); if ((map as any).flyToBounds) map.flyToBounds(bounds,{padding:[28,28],duration:0.8}); else map.fitBounds(bounds,{padding:[28,28]}); } catch{} } else { const r=rows[0]; try { if (map.flyTo) map.flyTo([r.lat,r.lng],6,{duration:0.8}); else map.setView([r.lat,r.lng],6); } catch { map.setView([r.lat,r.lng],6); } }
  // KPIs (optional elements)
  const avgNet = rows.reduce((s,r)=>s+r.net,0)/rows.length;
  const best = rows.slice().sort((a,b)=> b.net-a.net)[0];
  const maxCost = rows.slice().sort((a,b)=> b.costs-a.costs)[0];
  const avgEl = document.getElementById('hudFinAvgNet'); if (avgEl) avgEl.textContent = `Avg Net: ${formatEuro(avgNet)}`;
  const bestEl = document.getElementById('hudFinBest'); if (bestEl) bestEl.textContent = best ? `Top Show: ${best.city} ${formatEuro(best.net)}` : 'Top Show: —';
  const highEl = document.getElementById('hudFinHighCost'); if (highEl) highEl.textContent = maxCost ? `Max Cost: ${maxCost.city} ${formatEuro(maxCost.costs)}` : 'Max Cost: —';
  const incomeEl = document.getElementById('hudFinIncome'); if (incomeEl) incomeEl.textContent = formatEuro(rows.reduce((s,r)=> s+r.income,0));
  const commsEl = document.getElementById('hudFinComms'); if (commsEl) commsEl.textContent = formatEuro(rows.reduce((s,r)=> s+r.commissions,0));
  const costsEl = document.getElementById('hudFinCosts'); if (costsEl) costsEl.textContent = formatEuro(rows.reduce((s,r)=> s+r.costs,0));
  // Legend filtering
  const legend = document.getElementById('finLegend');
  if (legend){
    legend.hidden = false;
    const saved = (()=>{ try { const raw=localStorage.getItem('mc:finLegend'); if (raw){ const arr=JSON.parse(raw); if (Array.isArray(arr)&&arr.length) return arr; } } catch{} return ['high','mid','low','neg']; })();
    const btns = Array.from(legend.querySelectorAll<HTMLButtonElement>('[data-fin-filter]'));
    btns.forEach(b => { const cat=b.getAttribute('data-fin-filter')!; b.setAttribute('aria-pressed', saved.includes(cat)?'true':'false'); });
    function apply(){
      let active = btns.filter(b => b.getAttribute('aria-pressed')==='true').map(b => b.getAttribute('data-fin-filter')!);
      if (!active.length){ active=['high','mid','low','neg']; btns.forEach(b=> b.setAttribute('aria-pressed','true')); }
      try { localStorage.setItem('mc:finLegend', JSON.stringify(active)); } catch{}
      document.querySelectorAll<HTMLElement>('.mc-fin-marker').forEach(el => { const cat = el.getAttribute('data-fin-cat'); if (!cat || active.includes(cat)) el.classList.remove('fin-dim'); else el.classList.add('fin-dim'); });
    }
    btns.forEach(b => b.onclick = () => { const cur = b.getAttribute('aria-pressed')==='true'; b.setAttribute('aria-pressed', cur?'false':'true'); apply(); });
    apply();
  }
}

// Focus helper --------------------------------------------------------------
export async function focusShow(showId:string){ ensureLeaflet().then(async ()=>{ const show = getMonthShows().find(s=>s.id===showId) || getNextShow(); if (!show) return; const { lat,lng } = ((show as any).lat && (show as any).lng) ? { lat:(show as any).lat, lng:(show as any).lng } : await getLatLng(show.city); if (!map){ initMap(); if (!map) return; } try { if (map.flyTo) map.flyTo([lat,lng],6,{duration:0.9}); else map.setView([lat,lng],6); } catch { map.setView([lat,lng],6); } const L=(window as any).L; if (!L) return; if (focusedMarker){ try { map.removeLayer(focusedMarker); } catch{} } focusedMarker = L.marker([lat,lng], accentIcon?{icon:accentIcon}:undefined).addTo(map); const el=focusedMarker.getElement(); if (el) el.classList.add('mc-marker-focused'); setTimeout(()=>{ if(focusedMarker){ try { map.removeLayer(focusedMarker); } catch{} focusedMarker=null; } },5000); }); }

// Misc helpers --------------------------------------------------------------
const geocodeCache: { [city: string]: { lat: number; lng: number } | null } = {};
function loadGeocodeCache() {
  try {
    const raw = localStorage.getItem('mc:geocode-cache');
    if (raw) Object.assign(geocodeCache, JSON.parse(raw));
  } catch {}
}
function saveGeocodeCache() {
  try {
    localStorage.setItem('mc:geocode-cache', JSON.stringify(geocodeCache));
  } catch {}
}
loadGeocodeCache();

async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  if (geocodeCache[city] !== undefined) return geocodeCache[city];
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`);
    const data = await response.json();
    if (data && data.length > 0) {
      const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      geocodeCache[city] = result;
      saveGeocodeCache();
      return result;
    }
  } catch (e) {
    console.warn('Geocoding failed for', city, e);
  }
  geocodeCache[city] = null;
  saveGeocodeCache();
  return null;
}

function pseudoLatLng(city: string): { lat: number; lng: number } {
  // Try cached geocode first
  const cached = geocodeCache[city];
  if (cached) return cached;

  // Fallback to hash-based pseudo coords
  let h = 0;
  for (let i = 0; i < city.length; i++) {
    h = (h * 31 + city.charCodeAt(i)) >>> 0;
  }
  const lat = ((h & 0xff) / 255) * 30 + 30;
  const lng = (((h >> 8) & 0xff) / 255) * 40 - 10;
  return { lat, lng };
}

async function getLatLng(city: string): Promise<{ lat: number; lng: number }> {
  const geocoded = await geocodeCity(city);
  return geocoded || pseudoLatLng(city);
}

