import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMissionControl } from '../../context/MissionControlContext';
import { useHighContrast } from '../../context/HighContrastContext';
import { trackEvent } from '../../lib/telemetry';
import { Card } from '../../ui/Card';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useFilteredShows } from '../../features/shows/selectors';
import { announce } from '../../lib/announcer';
import { useSettings } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';
import { useTheme } from '../../hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { escapeHtml } from '../../lib/escape';
import { HeatmapControl } from '../map/HeatmapControl';
import {
  convertToHeatmapData,
  createHeatmapGeoJSON,
  getHeatmapColorGradient,
  type RegionRevenue
} from '../../features/map/revenueHeatmap';

// Light Leaflet dynamic integration; keeps bundle lean until loaded.
const InteractiveMapComponent: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const mlibRef = useRef<any>(null);
  const { focus, setFocus, layers } = useMissionControl() as any;
  const [ready, setReady] = useState(false);
  const [cssWarning, setCssWarning] = useState(false);
  const { highContrast, toggleHC } = useHighContrast();
  const { shows: filteredShows } = useFilteredShows();
  const shows = useMemo(() => {
    const now = Date.now();
    return [...filteredShows]
      .filter(s => new Date(s.date).getTime() >= now) // Solo shows futuros
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 50);
  }, [filteredShows]);
  const { fmtMoney } = useSettings();
  const { theme } = useTheme();
  const navigate = useNavigate();
  // Accessibility: honor prefers-reduced-motion for route animation
  const [reducedMotion, setReducedMotion] = useState(false);
  // Revenue heatmap state
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [heatmapRegions, setHeatmapRegions] = useState<any[]>([]);
  // Stable empty costs object to avoid recreating on every render
  const emptyCosts = useMemo(() => ({}), []);
  // Cache CSS token values on theme change so we don't repeatedly call getComputedStyle
  const cssTokensRef = useRef<{ land: string; water: string; border: string; borderProvince: string; halo: string; provinceHalo: string } | null>(null);
  useEffect(() => {
    try {
      const cs = getComputedStyle(document.documentElement);
      cssTokensRef.current = {
        land: (cs.getPropertyValue('--map-land') || (theme === 'light' ? '#eaf2f8' : '#0a0f14')).trim(),
        water: (cs.getPropertyValue('--map-water') || (theme === 'light' ? '#cfe9ff' : '#07121d')).trim(),
        border: (cs.getPropertyValue('--map-border') || (theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.95)')).trim(),
        borderProvince: (cs.getPropertyValue('--map-border-province') || (theme === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.9)')).trim(),
        halo: (cs.getPropertyValue('--map-border-halo') || 'rgba(255,255,255,0.45)').trim(),
        provinceHalo: (cs.getPropertyValue('--map-province-halo') || 'rgba(255,255,255,0.35)').trim()
      };
    } catch { }
  }, [theme]);

  useEffect(() => {
    // In SSR/tests, window may be undefined
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const update = () => setReducedMotion(!!mq.matches);
      update();
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    } catch {
      // noop (no matchMedia available) – nothing to cleanup
      return; // ensure effect always returns void | cleanup fn for TS
    }
  }, []);

  // Clean up any previous persisted style choice (we now lock to the themed style)
  useEffect(() => { try { localStorage.removeItem('map-style-v1'); } catch { } }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const init = () => {
      if (!containerRef.current || mapRef.current) return;
      const mlib = mlibRef.current;

      // Safety check: ensure MapLibre is fully loaded
      if (!mlib || typeof mlib.Map !== 'function') {
        console.warn('[InteractiveMap] MapLibre not ready yet');
        return;
      }

      const map = new mlib.Map({
        container: containerRef.current,
        style: ({
          version: 8,
          glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
          sources: {},
          layers: [
            // Base background as water; land will be filled from vector polygons
            { id: 'background-water', type: 'background', paint: { 'background-color': cssTokensRef.current?.water || (theme === 'light' ? '#cfe9ff' : '#07121d') } }
          ]
        } as any),
        center: [2.3522, 48.8566],
        zoom: 2.6,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false
      });
      mapRef.current = map;
      // Lazy-load MapLibre CSS on demand (first init) to reduce initial CSS cost
      try {
        const id = 'maplibre-css';
        if (!document.getElementById(id)) {
          const link = document.createElement('link');
          link.id = id;
          link.rel = 'stylesheet';
          link.href = '/maplibre-gl.css';
          link.onerror = () => {
            try {
              const style = document.createElement('style');
              style.textContent = `
              .maplibregl-map{position:relative;overflow:hidden}
              .maplibregl-canvas{position:absolute;left:0;top:0;outline:none}
              .maplibregl-ctrl-top-left,.maplibregl-ctrl-top-right,.maplibregl-ctrl-bottom-left,.maplibregl-ctrl-bottom-right{position:absolute;pointer-events:auto}
              .maplibregl-ctrl-top-left{top:0;left:0}
              .maplibregl-ctrl-top-right{top:0;right:0}
              .maplibregl-ctrl-bottom-left{bottom:0;left:0}
              .maplibregl-ctrl-bottom-right{bottom:0;right:0}
              .maplibregl-ctrl{margin:10px}
              .maplibregl-ctrl-group{background:rgba(0,0,0,.4);border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,.15)}
              .maplibregl-ctrl-group button{width:30px;height:30px;display:block;color:#eaf2f6}
              .maplibregl-popup{max-width:280px}
              .maplibregl-popup-content{background:rgba(8,12,16,.92);border:1px solid rgba(255,255,255,.12);box-shadow:0 8px 30px -8px rgba(0,0,0,.7);color:#eaf2f6;border-radius:10px}
              .maplibregl-popup-close-button{color:#cfe7ff;font-size:16px}
              .maplibregl-popup .title{font-weight:700;color:#fff;margin-bottom:2px}
              .maplibregl-popup .meta{color:rgba(255,255,255,.85);font-size:12px}
              .maplibregl-popup .fee{color:#bfff00;font-weight:700;margin-top:4px}`;
              document.head.appendChild(style);
              console.warn('MapLibre CSS failed to load; inlined minimal fallback CSS.');
              setCssWarning(true);
            } catch { }
          };
          document.head.appendChild(link);
        }
      } catch { }
      map.addControl(new mlib.AttributionControl({ compact: true }));
      map.addControl(new mlib.NavigationControl({ showCompass: false }), 'top-left');
      // Force an early resize in case mount happened mid-layout
      setTimeout(() => { try { map.resize(); } catch { } }, 0);

      map.on('load', () => {
        try { map.resize(); } catch { }
        // Add country and province/state boundaries. Prefer OpenMapTiles (MapTiler) if key available; fallback to demo tiles countries only.
        try {
          const maptilerKey = (import.meta as any).env?.VITE_MAPTILER_KEY as string | undefined;
          if (maptilerKey) {
            const omtUrl = `https://api.maptiler.com/tiles/v3/tiles.json?key=${maptilerKey}`;
            if (!map.getSource('omt')) map.addSource('omt', { type: 'vector', url: omtUrl } as any);
            // Country borders (admin_level=2) with halo
            if (!map.getLayer('admin-country-halo')) map.addLayer({
              id: 'admin-country-halo', type: 'line', source: 'omt', 'source-layer': 'boundary',
              filter: ['==', ['get', 'admin_level'], '2'],
              paint: {
                'line-color': cssTokensRef.current?.halo || 'rgba(255,255,255,0.45)',
                'line-width': ['interpolate', ['linear'], ['zoom'], 0, 1.4, 3, 2.4, 5, 3.6, 7, 4.8],
                'line-blur': 0.2
              }
            } as any);
            if (!map.getLayer('admin-country')) map.addLayer({
              id: 'admin-country', type: 'line', source: 'omt', 'source-layer': 'boundary',
              filter: ['==', ['get', 'admin_level'], '2'],
              paint: {
                'line-color': cssTokensRef.current?.border || (theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.95)'),
                'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.9, 3, 1.8, 5, 2.6, 7, 3.4]
              }
            } as any);
            // Province / state borders (admin_level=3|4) with halo
            if (!map.getLayer('admin-province-halo')) map.addLayer({
              id: 'admin-province-halo', type: 'line', source: 'omt', 'source-layer': 'boundary',
              filter: ['in', ['get', 'admin_level'], ['literal', ['3', '4']]],
              paint: {
                'line-color': cssTokensRef.current?.provinceHalo || 'rgba(255,255,255,0.35)',
                'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.9, 3, 1.3, 5, 1.7, 7, 2.3],
                'line-blur': 0.2
              }
            } as any);
            if (!map.getLayer('admin-province')) map.addLayer({
              id: 'admin-province', type: 'line', source: 'omt', 'source-layer': 'boundary',
              filter: ['in', ['get', 'admin_level'], ['literal', ['3', '4']]],
              paint: {
                'line-color': cssTokensRef.current?.borderProvince || (theme === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.9)'),
                'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.6, 3, 1.0, 5, 1.4, 7, 1.8],
                'line-dasharray': [2, 2]
              }
            } as any);
          }
        } catch { }
        // Fallback countries outline from demo tiles (always safe). Also add land fill so background water shows oceans.
        try {
          if (!map.getSource('borders')) map.addSource('borders', { type: 'vector', url: 'https://demotiles.maplibre.org/tiles/tiles.json' } as any);
          // Land fill using country polygons below outlines
          const landColor = (getComputedStyle(document.documentElement).getPropertyValue('--map-land') || (theme === 'light' ? '#eaf2f8' : '#0a0f14')).trim();
          if (!map.getLayer('land-fill')) map.addLayer({
            id: 'land-fill', type: 'fill', source: 'borders', 'source-layer': 'countries',
            paint: {
              'fill-color': landColor,
              'fill-opacity': 1
            }
          } as any, undefined);
          if (!map.getLayer('countries-outline-halo')) map.addLayer({
            id: 'countries-outline-halo', type: 'line', source: 'borders', 'source-layer': 'countries',
            paint: {
              'line-color': (getComputedStyle(document.documentElement).getPropertyValue('--map-border-halo') || 'rgba(255,255,255,0.45)').trim(),
              'line-width': ['interpolate', ['linear'], ['zoom'], 0, 1.2, 2, 1.7, 4, 2.4, 6, 3.2],
              'line-blur': 0.2
            }
          } as any, undefined);
          if (!map.getLayer('countries-outline')) map.addLayer({
            id: 'countries-outline', type: 'line', source: 'borders', 'source-layer': 'countries',
            paint: {
              'line-color': (getComputedStyle(document.documentElement).getPropertyValue('--map-border') || (theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.95)')).trim(),
              'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.7, 2, 1.0, 4, 1.6, 6, 2.2]
            }
          } as any, undefined);
        } catch { }
        // No heat layer (removed for cleaner branded look)

        // Smart focus: Show next upcoming show with enhanced popup
        if (shows.length) {
          const next = shows[0];
          if (!next) { /* type guard */ return; }
          const center: [number, number] = [next.lng, next.lat];

          // Calculate days until show with more detail
          const now = Date.now();
          const showTime = new Date(next.date).getTime();
          const daysUntil = Math.ceil((showTime - now) / (24 * 60 * 60 * 1000));
          const hoursUntil = Math.ceil((showTime - now) / (60 * 60 * 1000));

          let timeText = '';
          let timeColor = '#bfff00';
          if (daysUntil < 0) {
            timeText = 'Past event';
            timeColor = '#6b7280';
          } else if (hoursUntil < 24) {
            timeText = hoursUntil < 1 ? 'Starting soon!' : `${hoursUntil}h away`;
            timeColor = '#ef4444';
          } else if (daysUntil === 1) {
            timeText = 'Tomorrow';
            timeColor = '#f59e0b';
          } else if (daysUntil <= 7) {
            timeText = `${daysUntil} days`;
            timeColor = '#f59e0b';
          } else {
            timeText = `${daysUntil} days`;
            timeColor = '#22c55e';
          }

          // Status badge styling with enhanced colors
          const statusColors: Record<string, string> = {
            confirmed: 'background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;box-shadow:0 2px 8px rgba(34,197,94,0.3)',
            pending: 'background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;box-shadow:0 2px 8px rgba(245,158,11,0.3)',
            offer: 'background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;box-shadow:0 2px 8px rgba(59,130,246,0.3)',
            canceled: 'background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;box-shadow:0 2px 8px rgba(239,68,68,0.3)'
          };
          const statusStyle = statusColors[next.status] || 'background:#6b7280;color:#fff';

          setTimeout(() => {
            try {
              // Smooth ease-in to next show with custom easing
              map.easeTo({ center, zoom: 6, duration: 1200, easing: (t) => 1 - Math.pow(1 - t, 4) }); // ease-out-quart
              const date = new Date(next.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              const time = new Date(next.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              const fee = fmtMoney(Number(next.fee));

              const popup = new mlib.Popup({ closeButton: true, offset: 15, closeOnClick: true })
                .setLngLat(center)
                .setHTML(`
                      <div class="map-popup-simple" style="font-family:system-ui,-apple-system,sans-serif;padding:8px;min-width:240px">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                          <div style="width:8px;height:8px;border-radius:50%;${statusStyle.split(';')[0]}"></div>
                          <div>
                            <div style="font-size:16px;font-weight:700;color:#fff">${escapeHtml(next.city)}</div>
                            <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px">${escapeHtml(next.venue || '')}</div>
                          </div>
                        </div>
                        <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-bottom:6px">${escapeHtml(date)} · ${escapeHtml(time)}</div>
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                          <span style="padding:4px 8px;border-radius:6px;font-size:10px;font-weight:600;text-transform:uppercase;${statusStyle}">${escapeHtml(next.status)}</span>
                          <div style="font-size:16px;font-weight:700;color:#bfff00">${fee}</div>
                        </div>
                        <button onclick="window.location.href='/dashboard/shows?id=${next.id}'" style="width:100%;padding:8px;border-radius:6px;background:#bfff00;color:#000;font-weight:600;font-size:12px;border:none;cursor:pointer">View Show</button>
                      </div>
                    `) as any;
              popup.addTo(map);
              announce(`Focusing map on ${next.city}, ${date}`);
            } catch { }
          }, 900);
        }

        // Shows markers (+ financial heat properties)
        const computeNet = (fee: number, status: string) => {
          const factor = status === 'confirmed' ? 0.72 : status === 'pending' ? 0.55 : 0.5; // simple heuristic
          return Math.max(0, Math.round(fee * factor));
        };
        const nets = shows.map(s => computeNet(s.fee, s.status));
        const maxNet = Math.max(1, ...nets);
        const toCategory = (n: number) => {
          const r = n / maxNet;
          if (n <= 0) return 'neg';
          if (r > 0.66) return 'high';
          if (r > 0.3) return 'mid';
          return 'low';
        };
        const showFc = {
          type: 'FeatureCollection', features: shows.map((s, idx) => {
            const net = nets[idx] ?? 0;
            const category = toCategory(net);
            return ({
              type: 'Feature', properties: {
                id: s.id,
                title: `${s.city}, ${new Date(s.date).toLocaleDateString()}`,
                city: s.city,
                date: s.date,
                status: s.status,
                fee: s.fee,
                net,
                category
              }, geometry: { type: 'Point', coordinates: [s.lng, s.lat] }
            });
          })
        } as any;
        map.addSource('shows', { type: 'geojson', data: showFc, cluster: true, clusterMaxZoom: 6, clusterRadius: 40 } as any);
        map.addLayer({
          id: 'clusters', type: 'circle', source: 'shows', filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step', ['get', 'point_count'], '#86efac', 5, '#22c55e', 10, '#16a34a'
            ],
            'circle-radius': [
              'step', ['get', 'point_count'], 12, 5, 16, 10, 20
            ],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#065f46'
          }
        });
        map.addLayer({
          id: 'cluster-count', type: 'symbol', source: 'shows', filter: ['has', 'point_count'],
          layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['Noto Sans Regular'], 'text-size': 11 },
          paint: { 'text-color': '#052e16' }
        });
        // Outer glow ring for markers (subtle halo effect)
        map.addLayer({
          id: 'unclustered-halo', type: 'circle', source: 'shows', filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              2, 10,
              6, 14,
              10, 20
            ],
            'circle-color': [
              'match', ['get', 'status'],
              'confirmed', '#22c55e',
              'pending', '#f59e0b',
              'offer', '#3b82f6',
              'canceled', '#ef4444',
              '#6b7280'
            ],
            'circle-opacity': 0.15,
            'circle-blur': 0.8
          }
        });

        // Main markers - enhanced with better colors and sizing
        map.addLayer({
          id: 'unclustered', type: 'circle', source: 'shows', filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              2, 6,
              6, 10,
              10, 14
            ],
            'circle-color': [
              'match', ['get', 'status'],
              'confirmed', '#22c55e',  // Green - confirmed shows
              'pending', '#f59e0b',    // Amber - pending approval
              'offer', '#3b82f6',      // Blue - offers
              'canceled', '#ef4444',   // Red - canceled
              '#6b7280'                // Gray fallback
            ],
            'circle-stroke-width': [
              'interpolate', ['linear'], ['zoom'],
              2, 2,
              6, 3,
              10, 4
            ],
            'circle-stroke-color': '#ffffff',
            'circle-stroke-opacity': 0.9,
            'circle-opacity': 0.95
          }
        });
        // Financial HEAT layer (circles scaled/colored by net)
        // Heat layer removed for clarity
        // Revenue heatmap layer is now managed by useEffect (see below)

        // Route line from first 3 shows
        const routeCoords = shows.slice(0, 3).map(s => [s.lng, s.lat]);
        map.addSource('route', { type: 'geojson', lineMetrics: true, data: { type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoords }, properties: {} } as any });
        // Base route stroke
        map.addLayer({ id: 'route', type: 'line', source: 'route', layout: { visibility: layers?.route ? 'visible' : 'none' }, paint: { 'line-color': '#22c55e', 'line-width': highContrast ? 3 : 2, 'line-dasharray': [2, 4], 'line-opacity': highContrast ? 0.9 : 0.7 } as any } as any);
        // Animated progress glow using line-gradient along line-progress
        map.addLayer({
          id: 'route-progress', type: 'line', source: 'route', layout: {
            'line-cap': 'round',
            'line-join': 'round',
            visibility: layers?.route ? 'visible' : 'none'
          }, paint: {
            'line-width': highContrast ? 4 : 3,
            'line-opacity': highContrast ? 0.9 : 0.65,
            'line-gradient': [
              'interpolate', ['linear'], ['line-progress'],
              0, 'rgba(34,197,94,0)',
              0.1, 'rgba(34,197,94,0.6)',
              0.3, 'rgba(34,197,94,0.0)'
            ]
          } as any
        });

        // Fit to bounds of shows
        if (shows.length) {
          const bounds = new mlib.LngLatBounds();
          shows.forEach(s => bounds.extend([s.lng, s.lat] as [number, number]));
          map.fitBounds(bounds as any, { padding: 40, duration: 600 });
          try { const first = shows[0]; if (first) announce(`Showing ${shows.length} shows, starting at ${first.city}`); } catch { }
        }

        setReady(true);
      });
      // Fallback: if 'load' not firing for some reason, mark ready on first idle
      map.once('idle', () => { if (!ready) { try { map.resize(); } catch { } setReady(true); } });

      // Handle resize to avoid gray map when container size changes
      const resize = () => { try { map.resize(); } catch { } };
      const ro = new ResizeObserver(() => resize());
      try { if (containerRef.current) ro.observe(containerRef.current); } catch { }
      window.addEventListener('resize', resize);

      // Basic interactivity: click popup
      const onClick = (e: any) => {
        // Click clusters to zoom in
        const clusterFeatures = map.queryRenderedFeatures(e.point, { layers: ['clusters'] }) as any[];
        if (clusterFeatures.length) {
          const f = clusterFeatures[0];
          const clusterId = f.properties.cluster_id;
          const src: any = map.getSource('shows');
          src.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
            if (err) return;
            map.easeTo({ center: f.geometry.coordinates as [number, number], zoom });
          });
          return;
        }
        const feats = map.queryRenderedFeatures(e.point, { layers: ['unclustered'] }) as any[];
        if (!feats.length) return;
        const f = feats[0];
        if (f && f.geometry.type === 'Point') {
          const coords = (f.geometry as any).coordinates as [number, number];
          const p = f.properties || {} as any;
          const date = p.date ? new Date(p.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '';
          const time = p.date ? new Date(p.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
          const fee = p.fee ? fmtMoney(Number(p.fee)) : '';

          // Calculate countdown
          const showTime = p.date ? new Date(p.date).getTime() : 0;
          const daysUntil = showTime ? Math.ceil((showTime - Date.now()) / (24 * 60 * 60 * 1000)) : null;
          let countdownText = '';
          let countdownColor = '#6b7280';
          if (daysUntil !== null) {
            if (daysUntil < 0) countdownText = 'Past';
            else if (daysUntil === 0) { countdownText = 'Today'; countdownColor = '#ef4444'; }
            else if (daysUntil === 1) { countdownText = 'Tomorrow'; countdownColor = '#f59e0b'; }
            else if (daysUntil <= 7) { countdownText = `${daysUntil} days`; countdownColor = '#f59e0b'; }
            else { countdownText = `${daysUntil} days`; countdownColor = '#22c55e'; }
          }

          // Enhanced status styling
          const statusStyles: Record<string, string> = {
            confirmed: 'background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff',
            pending: 'background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff',
            offer: 'background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff',
            canceled: 'background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff'
          };
          const statusStyle = statusStyles[p.status] || 'background:#6b7280;color:#fff';

          const popup = new mlib.Popup({ closeButton: true, offset: 12, className: 'enhanced-popup' })
            .setLngLat(coords)
            .setHTML(`
                <div class="map-popup" role="dialog" aria-modal="true" aria-label="${t('common.openShow') || 'Show details'}" style="font-family:system-ui,-apple-system,sans-serif;background:linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.98));backdrop-filter:blur(12px);border-radius:10px;padding:12px;box-shadow:0 8px 24px rgba(0,0,0,0.4);min-width:240px;border:1px solid rgba(255,255,255,0.1)">
                  <div style="margin-bottom:10px">
                    <div class="title" style="font-size:16px;font-weight:700;color:#fff;margin-bottom:6px">${escapeHtml(p.city || 'Show')}</div>
                    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                      <span style="padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;text-transform:uppercase;${statusStyle}">${escapeHtml(p.status || '')}</span>
                      ${countdownText ? `<span style="padding:3px 8px;border-radius:6px;font-size:10px;font-weight:600;background:rgba(255,255,255,0.05);color:${countdownColor}">${countdownText}</span>` : ''}
                    </div>
                  </div>
                  <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;font-size:11px;color:rgba(255,255,255,0.7)">
                    <div style="display:flex;align-items:center;gap:6px">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span>${escapeHtml(date)}</span>
                      ${time ? `<span style="margin-left:4px;opacity:0.6">${escapeHtml(time)}</span>` : ''}
                    </div>
                    ${fee ? `<div style="font-size:16px;font-weight:700;color:#bfff00;margin-top:2px">${fee}</div>` : ''}
                  </div>
                  <div class="actions" style="display:flex;gap:6px">
                    <button class="popup-primary" aria-label="${t('map.openInDashboard')}" style="flex:1;padding:8px 12px;border-radius:8px;background:linear-gradient(135deg,#bfff00,#a3e635);color:#000;font-weight:700;font-size:12px;border:none;cursor:pointer;transition:all 0.2s">
                      ${t('common.open') || 'Open'}
                    </button>
                  </div>
                </div>
              `)
            .addTo(map) as any;
          try {
            const trap = () => {
              const node = document.querySelector('.maplibregl-popup-content .map-popup') as HTMLElement | null;
              if (!node) return;
              const focusables = node.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
              const first = focusables[0];
              const last = focusables[focusables.length - 1];
              first?.focus();
              const onKey = (e: KeyboardEvent) => {
                if (e.key === 'Escape') { try { popup.remove(); } catch { } }
                if (e.key !== 'Tab') return;
                if (focusables.length === 0) return;
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); (last || first).focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); (first || last).focus(); }
              };
              node.addEventListener('keydown', onKey);
              popup.on('close', () => { try { node.removeEventListener('keydown', onKey); } catch { } });
              // Wire primary action
              const btn = node.querySelector('.popup-primary') as HTMLButtonElement | null;
              btn?.addEventListener('click', () => {
                try { popup.remove(); } catch { }
                navigate(`/dashboard/shows?edit=${encodeURIComponent(p.id)}`);
              });
              // Ensure there's a visible Close button and wire it
              try {
                const actions = node.querySelector('.actions') as HTMLElement | null;
                if (actions && !actions.querySelector('.popup-close')) {
                  const closeBtn = document.createElement('button');
                  closeBtn.className = 'popup-close';
                  closeBtn.setAttribute('aria-label', 'Close');
                  closeBtn.textContent = 'Close';
                  closeBtn.setAttribute('aria-label', t('common.close'));
                  closeBtn.textContent = t('common.close');
                  closeBtn.addEventListener('click', () => { try { popup.remove(); } catch { } });
                  actions.appendChild(closeBtn);
                } else {
                  const btnClose = node.querySelector('.popup-close') as HTMLButtonElement | null;
                  btnClose?.addEventListener('click', () => { try { popup.remove(); } catch { } });
                }
              } catch { }
            };
            setTimeout(trap, 0);
          } catch { }
          announce(`${p.city || 'Show'} selected ${date ? `on ${date}` : ''}`.trim());
        }
      };
      map.on('click', onClick);

      return () => { try { ro.disconnect(); } catch { } window.removeEventListener('resize', resize); map.off('click', onClick); map.remove(); mapRef.current = null; };
    };

    const boot = async () => {
      try {
        // ✅ Dynamic import - MapLibre GL is UMD, access via window after load
        await import('maplibre-gl');
        
        // MapLibre GL UMD sets global maplibregl
        const mapLibre = (window as any).maplibregl;

        // Debug logging in development
        if (import.meta.env.DEV) {
          console.log('[InteractiveMap] MapLibre loaded:', {
            hasMap: !!mapLibre?.Map,
            mapType: typeof mapLibre?.Map,
            constructorName: mapLibre?.Map?.name
          });
        }

        // Ensure the library loaded correctly
        if (!mapLibre || !mapLibre.Map || typeof mapLibre.Map !== 'function') {
          console.error('[InteractiveMap] MapLibre not loaded correctly', {
            mapLibre,
            hasMap: !!mapLibre?.Map
          });
          return undefined;
        }

        mlibRef.current = mapLibre;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          const ro = new ResizeObserver(() => {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) { try { ro.disconnect(); } catch { } init(); }
          });
          try { ro.observe(el); } catch { init(); }
          return () => { try { ro.disconnect(); } catch { } };
        } else {
          return init();
        }
      } catch (error) {
        console.error('[InteractiveMap] Failed to load MapLibre:', error);
        return undefined;
      }
    };
    return void boot();
  }, [shows]);

  // Update data sources when filtered shows change
  useEffect(() => {
    const map = mapRef.current; const mlib = mlibRef.current; if (!map || !mlib) return;
    if (!shows || !shows.length) {
      try {
        const src: any = map.getSource('shows');
        if (src) src.setData({ type: 'FeatureCollection', features: [] } as any);
        const route: any = map.getSource('route');
        if (route) route.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} } as any);
      } catch { }
      return;
    }
    const computeNet = (fee: number, status: string) => {
      const factor = status === 'confirmed' ? 0.72 : status === 'pending' ? 0.55 : 0.5;
      return Math.max(0, Math.round(fee * factor));
    };
    const nets = shows.map(s => computeNet(s.fee, s.status));
    const maxNet = Math.max(1, ...nets);
    const toCategory = (n: number) => {
      const r = n / maxNet;
      if (n <= 0) return 'neg';
      if (r > 0.66) return 'high';
      if (r > 0.3) return 'mid';
      return 'low';
    };
    const showFc = {
      type: 'FeatureCollection', features: shows.map((s, idx) => {
        const net = nets[idx] ?? 0;
        const category = toCategory(net);
        return ({
          type: 'Feature', properties: {
            id: s.id,
            title: `${s.city}, ${new Date(s.date).toLocaleDateString()}`,
            city: s.city,
            date: s.date,
            status: s.status,
            fee: s.fee,
            net,
            category
          }, geometry: { type: 'Point', coordinates: [s.lng, s.lat] }
        });
      })
    } as any;
    try { const src: any = map.getSource('shows'); if (src) src.setData(showFc); } catch { }
    try {
      const routeCoords = shows.slice(0, 3).map(s => [s.lng, s.lat]);
      const route: any = map.getSource('route');
      if (route) route.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoords }, properties: {} } as any);
    } catch { }
    // Fit bounds to new set
    try {
      const bounds = new mlib.LngLatBounds();
      shows.forEach(s => bounds.extend([s.lng, s.lat] as [number, number]));
      if (!bounds.isEmpty()) map.fitBounds(bounds as any, { padding: 40, duration: 400 });
    } catch { }
  }, [shows]);

  // Layer toggles removed; always show clusters, markers, and route

  // Focus from external requests (ActionHub etc.)
  useEffect(() => {
    const map = mapRef.current; if (!map || !focus) return;
    try {
      const center: [number, number] = [focus.lng, focus.lat];
      map.easeTo({ center, zoom: 6, duration: 600 });
      // Drop a quick pulse marker for visual feedback
      try {
        const mlib = mlibRef.current;
        if (mlib) {
          const el = document.createElement('div');
          el.className = 'focus-pulse';
          const marker = new mlib.Marker({ element: el, anchor: 'center' }).setLngLat(center).addTo(map);
          setTimeout(() => { try { marker.remove(); } catch { } }, 1600);
        }
      } catch { }
      setTimeout(() => setFocus(null), 800);
    } catch { }
  }, [focus]);

  // Heat/category filters removed

  // Status filters removed

  // Update route styling when high contrast changes without recreating the map
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const apply = () => {
      if (map.getLayer('route')) {
        try {
          map.setPaintProperty('route', 'line-width', highContrast ? 3 : 2);
          map.setPaintProperty('route', 'line-opacity', highContrast ? 0.9 : 0.7);
        } catch { }
      }
      if (map.getLayer('route-progress')) {
        try {
          map.setPaintProperty('route-progress', 'line-width', highContrast ? 4 : 3);
          map.setPaintProperty('route-progress', 'line-opacity', highContrast ? 0.9 : 0.65);
        } catch { }
      }
    };
    if ((map as any).isStyleLoaded?.()) {
      apply();
      return; // explicit undefined cleanup
    } else {
      const onLoad = () => { apply(); map.off('load', onLoad); };
      map.on('load', onLoad);
      return () => { try { map.off('load', onLoad); } catch { } };
    }
  }, [highContrast]);

  // Toggle route layers visibility based on MissionControlContext layers
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    try {
      if (map.getLayer('route')) map.setLayoutProperty('route', 'visibility', layers?.route ? 'visible' : 'none');
      if (map.getLayer('route-progress')) map.setLayoutProperty('route-progress', 'visibility', layers?.route ? 'visible' : 'none');
    } catch { }
  }, [layers?.route]);

  // Sync themed base colors (light/dark) to map without full re-init
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const cs = getComputedStyle(document.documentElement);
    const land = (cs.getPropertyValue('--map-land') || (theme === 'light' ? '#eaf2f8' : '#0a0f14')).trim();
    const water = (cs.getPropertyValue('--map-water') || (theme === 'light' ? '#cfe9ff' : '#07121d')).trim();
    const countryMain = (cs.getPropertyValue('--map-border') || (theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.95)')).trim();
    const provinceMain = (cs.getPropertyValue('--map-border-province') || (theme === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.9)')).trim();
    try { if (map.getLayer('background-water')) map.setPaintProperty('background-water', 'background-color', water); } catch { }
    try { if (map.getLayer('land-fill')) map.setPaintProperty('land-fill', 'fill-color', land); } catch { }
    try { if (map.getLayer('admin-country')) map.setPaintProperty('admin-country', 'line-color', countryMain); } catch { }
    try { if (map.getLayer('admin-province')) map.setPaintProperty('admin-province', 'line-color', provinceMain); } catch { }
    try { if (map.getLayer('countries-outline')) map.setPaintProperty('countries-outline', 'line-color', countryMain); } catch { }
  }, [theme]);

  // Animate route progress by shifting a bright segment along the line
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    // Respect reduced motion: keep a static subtle gradient and skip animation
    if (reducedMotion) {
      try {
        if (map.getLayer('route-progress')) {
          map.setPaintProperty('route-progress', 'line-gradient', [
            'interpolate', ['linear'], ['line-progress'],
            0, 'rgba(34,197,94,0.25)',
            1, 'rgba(34,197,94,0.25)'
          ] as any);
        }
      } catch { }
      return;
    }
    let raf = 0; let t = 0;
    const step = () => {
      t = (t + 0.01) % 1;
      if (map.getLayer('route-progress')) {
        try {
          map.setPaintProperty('route-progress', 'line-gradient', [
            'interpolate', ['linear'], ['line-progress'],
            Math.max(0, t - 0.15), 'rgba(34,197,94,0.0)',
            t, 'rgba(34,197,94,0.95)',
            Math.min(1, t + 0.12), 'rgba(34,197,94,0.0)'
          ] as any);
        } catch { }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { try { cancelAnimationFrame(raf); } catch { } };
  }, [ready, reducedMotion]);

  // Update heatmap layer when state changes
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    // Remove existing heatmap layer and source if they exist
    if (map.getLayer('revenue-heatmap-layer')) {
      map.removeLayer('revenue-heatmap-layer');
    }
    if (map.getSource('revenue-heatmap')) {
      map.removeSource('revenue-heatmap');
    }

    // Add heatmap layer if enabled and data available
    if (heatmapEnabled && heatmapRegions.length > 0) {
      const heatmapData = convertToHeatmapData(heatmapRegions);
      const heatmapGeoJSON = createHeatmapGeoJSON(heatmapData);

      map.addSource('revenue-heatmap', {
        type: 'geojson',
        data: heatmapGeoJSON as any
      });

      map.addLayer({
        id: 'revenue-heatmap-layer',
        type: 'heatmap',
        source: 'revenue-heatmap',
        paint: {
          'heatmap-weight': ['get', 'weight'] as any,
          'heatmap-intensity': [
            'interpolate', ['linear'], ['zoom'],
            0, 0.8,
            9, 1.2
          ] as any,
          'heatmap-color': getHeatmapColorGradient() as any,
          'heatmap-radius': [
            'interpolate', ['linear'], ['zoom'],
            0, 8,
            4, 15,
            9, 30
          ] as any,
          'heatmap-opacity': 0.75
        }
      } as any);
    }
  }, [ready, heatmapEnabled, heatmapRegions]);

  // Fit all shows function
  const fitAllShows = React.useCallback(() => {
    const map = mapRef.current;
    const mlib = mlibRef.current;
    if (!map || !mlib || shows.length === 0) return;

    const bounds = new mlib.LngLatBounds();
    shows.forEach((show: any) => {
      if (show.lng && show.lat) {
        bounds.extend([show.lng, show.lat]);
      }
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds as any, { padding: 60, duration: 800 });
      trackEvent('map.fitAllShows', { showCount: shows.length });
    }
  }, [shows]);

  return (
    <Card
      className={`relative overflow-hidden p-0 min-h-[320px] ${className}`}
      role="region"
      aria-label="Interactive tour map"
      aria-describedby="map-description"
    >
      {/* Hidden description for screen readers */}
      <div id="map-description" className="sr-only">
        Interactive map showing {shows.length} tour shows. Use arrow keys to pan, plus/minus to zoom. Click markers for show details. Press Tab to access controls.
      </div>

      {/* Live region for dynamic announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {ready ? `Map loaded with ${shows.length} shows displayed` : 'Loading map...'}
      </div>

      <div
        ref={containerRef}
        className="absolute inset-0"
        role="img"
        aria-label={`Tour map showing ${shows.length} shows across different locations`}
        tabIndex={0}
      />
      {!ready && <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100/10 to-transparent dark:from-white/5 dark:to-white/0 animate-pulse text-[10px] tracking-widest uppercase text-slate-300 dark:text-white/40">Loading map…</div>}
      {cssWarning && (
        <div className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded bg-amber-400/90 text-black border border-amber-900/20 shadow">
          {t('map.cssWarning')}
        </div>
      )}
      {highContrast && (
        <div className={`absolute inset-0 pointer-events-none map-gradient-mask contrast-125 saturate-150`} />
      )}

      {/* Fit All Shows Button */}
      {ready && shows.length > 0 && (
        <button
          onClick={fitAllShows}
          className="absolute top-4 right-4 px-3 py-2 min-h-[44px] md:min-h-0 md:py-1.5 backdrop-blur-md bg-slate-900/80 hover:bg-slate-800/90 border border-slate-300 dark:border-white/20 hover:border-accent-500/40 rounded-lg text-xs font-medium transition-all duration-300 shadow-xl hover:shadow-accent-500/20 flex items-center gap-2 active:scale-95"
          aria-label="Fit all shows in view"
          title="View all shows"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <span className="hidden md:inline">Fit All</span>
        </button>
      )}

      {/* Revenue Heatmap Control */}
      {ready && shows.length > 0 && (
        <div className="absolute top-20 right-4">
          <HeatmapControl
            shows={shows as any}
            costs={emptyCosts}
            isActive={heatmapEnabled}
            onToggle={setHeatmapEnabled}
            onDataChange={setHeatmapRegions}
          />
        </div>
      )}

      {/* Mobile: controls removed */}
      <p id="map-desc" className="sr-only">Interactive tour map with clear land and water, thicker country and province borders for visibility, status markers, and a route line connecting the tour sequence.</p>
    </Card>
  );
};

// Memoized export para evitar re-renders innecesarios del mapa
export const InteractiveMap = React.memo(InteractiveMapComponent);

export default InteractiveMap;
