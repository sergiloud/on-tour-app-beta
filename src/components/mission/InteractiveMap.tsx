import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMissionControl } from '../../context/MissionControlContext';
import { useHighContrast } from '../../context/HighContrastContext';
import { trackEvent } from '../../lib/telemetry';
import { Card } from '../../ui/Card';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useFilteredShows } from '../../features/shows/selectors';
import { useShows } from '../../hooks/useShows';
import { useGeocodedShows } from '../../hooks/useGeocodedShows';
import { announce } from '../../lib/announcer';
import { useSettings } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';
import { useTheme } from '../../hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { escapeHtml } from '../../lib/escape';
import { useAuth } from '../../context/AuthContext';
import { geocodeLocation } from '../../services/geocodingService';

// Light Leaflet dynamic integration; keeps bundle lean until loaded.

// Helper function to get approximate coordinates for a country code
const getCountryCoordinates = (countryCode: string): [number, number] => {
  const coords: Record<string, [number, number]> = {
    US: [-95.7129, 37.0902],
    GB: [-3.4360, 55.3781],
    FR: [2.2137, 46.2276],
    DE: [10.4515, 51.1657],
    ES: [-3.7492, 40.4637],
    IT: [12.5674, 41.8719],
    NL: [5.2913, 52.1326],
    BE: [4.4699, 50.5039],
    CH: [8.2275, 46.8182],
    AT: [14.5501, 47.5162],
    PT: [-8.2245, 39.3999],
    SE: [18.6435, 60.1282],
    NO: [8.4689, 60.4720],
    DK: [9.5018, 56.2639],
    FI: [25.7482, 61.9241],
    PL: [19.1451, 51.9194],
    CZ: [15.4730, 49.8175],
    AU: [133.7751, -25.2744],
    JP: [138.2529, 36.2048],
    CN: [104.1954, 35.8617],
    BR: [-51.9253, -14.2350],
    MX: [-102.5528, 23.6345],
    CA: [-106.3468, 56.1304],
    AR: [-63.6167, -38.4161],
    CL: [-71.5430, -35.6751],
    CO: [-74.2973, 4.5709],
    VN: [108.2772, 14.0583],
    TH: [100.9925, 15.8700],
    SG: [103.8198, 1.3521],
    MY: [101.9758, 4.2105],
    IN: [78.9629, 20.5937],
    AE: [53.8478, 23.4241],
    SA: [45.0792, 23.8859],
    ZA: [22.9375, -30.5595],
    EG: [30.8025, 26.8206],
    KE: [37.9062, -0.0236],
    NG: [8.6753, 9.0820],
    GR: [21.8243, 39.0742],
    TR: [35.2433, 38.9637],
    RU: [105.3188, 61.5240],
    UA: [31.1656, 48.3794],
    IE: [-8.2439, 53.4129],
    NZ: [174.8860, -40.9006],
    KR: [127.7669, 35.9078],
  };
  
  const code = countryCode?.toUpperCase();
  return coords[code] || [0, 0]; // Default to Atlantic Ocean if unknown
};

const InteractiveMapComponent: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const mlibRef = useRef<any>(null);
  const { focus, setFocus, layers } = useMissionControl() as any;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cssWarning, setCssWarning] = useState(false);
  const { highContrast, toggleHC } = useHighContrast();
  const { profile } = useAuth();
  const [homeLocation, setHomeLocation] = useState<{ lng: number; lat: number } | null>(null);
  
  // Use useShows directly to show all shows without date/region filters from SettingsContext
  const { shows: allShows } = useShows();
  
  // Geocode shows that don't have coordinates
  const { shows: geocodedShows, loading: geocoding, processed, total } = useGeocodedShows(allShows);
  
  const shows = useMemo(() => {
    const now = Date.now();
    return [...geocodedShows]
      .filter(s => {
        if (!s.date) return false;
        const showDate = new Date(s.date).getTime();
        if (isNaN(showDate)) return false;
        // Only show future shows with valid coordinates
        return showDate >= now && s.lng && s.lat && !isNaN(s.lng) && !isNaN(s.lat);
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [geocodedShows]);
  const { fmtMoney } = useSettings();
  const { theme } = useTheme();
  const navigate = useNavigate();
  // Accessibility: honor prefers-reduced-motion for route animation
  const [reducedMotion, setReducedMotion] = useState(false);
  // Cache CSS token values on theme change so we don't repeatedly call getComputedStyle
  const cssTokensRef = useRef<{ land: string; water: string; border: string; borderProvince: string; halo: string; provinceHalo: string } | null>(null);
  useEffect(() => {
    try {
      const cs = getComputedStyle(document.documentElement);
      cssTokensRef.current = {
        land: (cs.getPropertyValue('--map-land') || (theme === 'light' ? '#f8fafc' : '#0f172a')).trim(),
        water: (cs.getPropertyValue('--map-water') || (theme === 'light' ? '#dbeafe' : '#0c1623')).trim(),
        border: (cs.getPropertyValue('--map-border') || (theme === 'light' ? 'rgba(100,116,139,0.3)' : 'rgba(148,163,184,0.4)')).trim(),
        borderProvince: (cs.getPropertyValue('--map-border-province') || (theme === 'light' ? 'rgba(148,163,184,0.2)' : 'rgba(148,163,184,0.25)')).trim(),
        halo: (cs.getPropertyValue('--map-border-halo') || 'rgba(255,255,255,0.3)').trim(),
        provinceHalo: (cs.getPropertyValue('--map-province-halo') || 'rgba(255,255,255,0.15)').trim()
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

  // Geocode home location from profile
  useEffect(() => {
    if (!profile?.location) {
      setHomeLocation(null);
      return;
    }

    // Parse location string (e.g., "Madrid, Spain" or "Barcelona, ES")
    const parseLocation = async () => {
      try {
        const location = profile.location;
        if (!location) return;

        const parts = location.split(',').map(p => p.trim());
        if (parts.length < 2) return;

        const city = parts[0];
        const country = parts[parts.length - 1];

        if (!city || !country) return;

        const result = await geocodeLocation(city, country);
        if (result) {
          setHomeLocation({ lng: result.lng, lat: result.lat });
          console.log(`[InteractiveMap] Home location geocoded: ${city}, ${country} → (${result.lat}, ${result.lng})`);
        }
      } catch (error) {
        console.error('[InteractiveMap] Failed to geocode home location:', error);
        setHomeLocation(null);
      }
    };

    parseLocation();
  }, [profile?.location]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const init = () => {
      const container = containerRef.current;
      if (!container || mapRef.current) return;
      
      // Ensure container has explicit dimensions before MapLibre initialization
      const rect = container.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) {
        console.warn('[InteractiveMap] Container has no dimensions, waiting...');
        return;
      }
      
      // Set explicit width/height styles to prevent MapLibre resize issues
      container.style.width = `${rect.width}px`;
      container.style.height = `${rect.height}px`;
      
      const mlib = mlibRef.current;

      // Safety check: ensure MapLibre is fully loaded
      if (!mlib || typeof mlib.Map !== 'function') {
        console.warn('[InteractiveMap] MapLibre not ready yet');
        return;
      }

      let map;
      try {
        // Temporarily suppress console errors during MapLibre init to avoid non-fatal resize errors
        const originalError = console.error;
        const errors: any[] = [];
        console.error = (...args: any[]) => {
          // Capture but don't display the _calcMatrices error - it's non-fatal
          if (args[0]?.toString().includes('_calcMatrices') || args[0]?.toString().includes("Cannot read properties of null")) {
            errors.push(args);
            return;
          }
          originalError(...args);
        };

        try {
          map = new mlib.Map({
            container: container,
            style: ({
              version: 8,
              glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
              sources: {},
              layers: [
                {
                  id: 'background-water',
                  type: 'background',
                  paint: {
                    'background-color': cssTokensRef.current?.water || (theme === 'light' ? '#e0f2fe' : '#0c1623')
                  }
                }
              ]
            } as any),
            center: [15, 30], // Center on Europe/Mediterranean  
            zoom: 2,
            minZoom: 1,
            maxZoom: 16,
            attributionControl: false,
            dragRotate: false,
            pitchWithRotate: false,
            doubleClickZoom: true,
            touchZoomRotate: true,
            touchPitch: false,
            // Disable web workers completely - run everything on main thread
            // This avoids '_ is not defined' minification errors in worker bundles
            maxParallelImageRequests: 0,
            refreshExpiredTiles: false
          });
        } finally {
          console.error = originalError;
        }
      } catch (error) {
        console.error('[InteractiveMap] Failed to initialize map:', error);
        return;
      }
      
      if (!map) {
        console.error('[InteractiveMap] Map object is null after construction');
        return;
      }
      
      mapRef.current = map;
      
      // Resize after map is fully loaded
      map.once('load', () => {
        try {
          map.resize();
        } catch (e) {
          // Ignore resize errors
        }
      });
      
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
              .maplibregl-popup-content{background:rgba(8,12,16,.92);border:1px solid rgba(255,255,255,.12);box-shadow:0 8px 30px -8px rgba(0,0,0,.7);color:#eaf2f6;border-radius:8px;padding:0}
              .maplibregl-popup-close-button{color:#cfe7ff;font-size:14px;padding:4px;width:24px;height:24px}
              .maplibregl-popup .title{font-weight:700;color:#fff;margin-bottom:2px}
              .maplibregl-popup .meta{color:rgba(255,255,255,.85);font-size:11px}
              .maplibregl-popup .fee{color:#bfff00;font-weight:700;margin-top:4px}
              .city-list{scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.2) transparent}
              .city-list::-webkit-scrollbar{width:4px}
              .city-list::-webkit-scrollbar-track{background:transparent}
              .city-list::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.2);border-radius:2px}`;
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
              map.easeTo({ center, zoom: 6, duration: 1200, easing: (t: number) => 1 - Math.pow(1 - t, 4) }); // ease-out-quart
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

        // Shows markers - initialize with empty data, will be populated by separate useEffect
        map.addSource('shows', { 
          type: 'geojson', 
          data: { type: 'FeatureCollection', features: [] }, 
          cluster: false 
        } as any);
        
        // Outer glow ring for markers (enhanced halo effect)
        map.addLayer({
          id: 'unclustered-halo', type: 'circle', source: 'shows',
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              1, 8,
              4, 14,
              8, 20,
              12, 28
            ],
            'circle-color': [
              'match', ['get', 'status'],
              'confirmed', theme === 'light' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.3)',
              'pending', theme === 'light' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.3)',
              'offer', theme === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.3)',
              theme === 'light' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.3)'
            ],
            'circle-opacity': 0.6,
            'circle-blur': 1
          }
        } as any);

        // Main markers
        map.addLayer({
          id: 'unclustered', type: 'circle', source: 'shows',
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              1, 4,
              4, 7,
              8, 11,
              12, 16
            ],
            'circle-color': [
              'match', ['get', 'status'],
              'confirmed', '#22c55e',
              'pending', '#f59e0b',
              'offer', '#3b82f6',
              '#94a3b8'
            ],
            'circle-stroke-width': [
              'interpolate', ['linear'], ['zoom'],
              1, 1.5,
              8, 2.5,
              12, 3.5
            ],
            'circle-stroke-color': theme === 'light' ? '#ffffff' : '#0f172a',
            'circle-opacity': 0.95
          }
        } as any);

        // Main markers - enhanced with better sizing for precision
        map.addLayer({
          id: 'unclustered-labels', type: 'symbol', source: 'shows',
          minzoom: 6, // Only show labels when zoomed in
          layout: {
            'text-field': ['get', 'city'],
            // Removed 'text-font' to use browser default instead of external font server
            'text-size': 11,
            'text-offset': [0, 1.5],
            'text-anchor': 'top'
          },
          paint: {
            'text-color': theme === 'light' ? '#0f172a' : '#f1f5f9',
            'text-halo-color': theme === 'light' ? '#ffffff' : '#0f172a',
            'text-halo-width': 1.5
          }
        } as any);

        // Home location marker - initialize empty, will be populated when profile location is geocoded
        map.addSource('home', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        } as any);

        // Home marker outer glow
        map.addLayer({
          id: 'home-halo', type: 'circle', source: 'home',
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              1, 10,
              4, 16,
              8, 24,
              12, 32
            ],
            'circle-color': theme === 'light' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.25)',
            'circle-opacity': 0.7,
            'circle-blur': 1
          }
        } as any);

        // Home marker main circle (house icon will be a circle with distinctive color)
        map.addLayer({
          id: 'home-marker', type: 'circle', source: 'home',
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              1, 5,
              4, 8,
              8, 12,
              12, 18
            ],
            'circle-color': '#3b82f6', // Blue color for home
            'circle-stroke-width': [
              'interpolate', ['linear'], ['zoom'],
              1, 2,
              8, 3,
              12, 4
            ],
            'circle-stroke-color': theme === 'light' ? '#ffffff' : '#0f172a',
            'circle-opacity': 1
          }
        } as any);

        // Home label (optional, shows "Home")
        map.addLayer({
          id: 'home-label', type: 'symbol', source: 'home',
          minzoom: 4,
          layout: {
            'text-field': '🏠 Home',
            'text-size': 12,
            'text-offset': [0, 1.8],
            'text-anchor': 'top'
          },
          paint: {
            'text-color': theme === 'light' ? '#0f172a' : '#f1f5f9',
            'text-halo-color': theme === 'light' ? '#ffffff' : '#0f172a',
            'text-halo-width': 2
          }
        } as any);

        // Financial HEAT layer removed for clarity
        // Revenue heatmap layer is now managed by useEffect (see below)

        // Route line - initialize empty, will be populated by separate useEffect
        map.addSource('route', { 
          type: 'geojson', 
          lineMetrics: true, 
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} } 
        } as any);
        
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

        // Map is ready - shows data will be populated by separate useEffect
        setReady(true);
      });
      // Fallback: if 'load' not firing for some reason, mark ready on first idle
      map.once('idle', () => { if (!ready) { try { map.resize(); } catch { } setReady(true); } });

      // Handle resize to avoid gray map when container size changes
      const resize = () => { try { map.resize(); } catch { } };
      const ro = new ResizeObserver(() => resize());
      try { if (containerRef.current) ro.observe(containerRef.current); } catch { }
      window.addEventListener('resize', resize);

      // Basic interactivity: click popup - no clustering, all shows individual
      const onClick = (e: any) => {
        const feats = map.queryRenderedFeatures(e.point, { layers: ['unclustered-halo', 'unclustered'] }) as any[];
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

          const popup = new mlib.Popup({ closeButton: true, offset: 15, className: 'enhanced-popup', maxWidth: '280px' })
            .setLngLat(coords)
            .setHTML(`
                <div class="map-popup" role="dialog" aria-modal="true" aria-label="${t('common.openShow') || 'Show details'}" style="font-family:system-ui,-apple-system,sans-serif;background:linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.98));backdrop-filter:blur(16px);border-radius:10px;padding:12px;box-shadow:0 12px 32px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.1);min-width:220px;max-width:280px;animation:popupSlideIn 0.3s ease-out">
                  <style>
                    @keyframes popupSlideIn {
                      from { opacity:0; transform:translateY(8px) scale(0.95); }
                      to { opacity:1; transform:translateY(0) scale(1); }
                    }
                    .map-popup button:hover {
                      transform: translateY(-1px);
                      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    }
                    .map-popup button:active {
                      transform: translateY(0);
                    }
                  </style>
                  <div style="margin-bottom:10px">
                    <div class="title" style="font-size:15px;font-weight:700;color:#fff;margin-bottom:6px;letter-spacing:-0.02em">${escapeHtml(p.city || 'Show')}</div>
                    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                      <span style="padding:3px 8px;border-radius:5px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;${statusStyle}">${escapeHtml(p.status || '')}</span>
                      ${countdownText ? `<span style="padding:3px 8px;border-radius:5px;font-size:9px;font-weight:600;background:rgba(255,255,255,0.08);color:${countdownColor};border:1px solid ${countdownColor}40">${countdownText}</span>` : ''}
                    </div>
                  </div>
                  <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;font-size:11px;color:rgba(255,255,255,0.7)">
                    <div style="display:flex;align-items:center;gap:6px">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span style="font-size:11px;font-weight:500">${escapeHtml(date)}</span>
                      ${time ? `<span style="margin-left:4px;opacity:0.6;font-size:10px">${escapeHtml(time)}</span>` : ''}
                    </div>
                    ${fee ? `<div style="font-size:16px;font-weight:800;color:#bfff00;margin-top:4px;text-shadow:0 2px 8px rgba(191,255,0,0.3)">${fee}</div>` : ''}
                  </div>
                  <div class="actions" style="display:flex;gap:6px">
                    <button class="popup-primary" aria-label="${t('map.openInDashboard')}" style="flex:1;padding:8px 12px;border-radius:7px;background:linear-gradient(135deg,#bfff00,#a3e635);color:#000;font-weight:700;font-size:12px;border:none;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(191,255,0,0.3)">
                      ${t('common.open') || 'Open'}
                    </button>
                  </div>
                </div>
              `)
            .addTo(map) as any;
          
          // Smooth flyTo animation with optimal zoom
          const currentZoom = map.getZoom();
          const targetZoom = Math.max(currentZoom, 8); // Zoom in at least to 8 for better view
          map.flyTo({
            center: coords,
            zoom: targetZoom,
            duration: 1200,
            essential: true,
            curve: 1.2,
            easing: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // easeInOutQuad
          });
          
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
      
      // Change cursor on hover over shows
      map.on('mouseenter', 'unclustered-halo', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'unclustered-halo', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'unclustered', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'unclustered', () => { map.getCanvas().style.cursor = ''; });

      return () => { try { ro.disconnect(); } catch { } window.removeEventListener('resize', resize); map.off('click', onClick); map.remove(); mapRef.current = null; };
    };

    const boot = async () => {
      try {
        // ✅ Dynamic import - MapLibre GL is UMD, access via window after load
        console.log('[InteractiveMap] Starting MapLibre import...');
        const mlModule = await import('maplibre-gl');
        console.log('[InteractiveMap] MapLibre module imported:', !!mlModule);
        
        // MapLibre GL UMD sets global maplibregl
        const mapLibre = (window as any).maplibregl || mlModule.default || mlModule;

        // CRITICAL: Disable web workers BEFORE creating any maps
        // This prevents '_ is not defined' minification errors in worker bundles
        if (mapLibre && 'workerCount' in mapLibre) {
          (mapLibre as any).workerCount = 0;
        }

        console.log('[InteractiveMap] MapLibre loaded:', {
          hasMap: !!mapLibre?.Map,
          mapType: typeof mapLibre?.Map,
          constructorName: mapLibre?.Map?.name,
          hasWindow: !!(window as any).maplibregl,
          hasModule: !!mlModule,
          hasDefault: !!mlModule.default,
          workerCount: (mapLibre as any)?.workerCount
        });

        // Ensure the library loaded correctly
        if (!mapLibre || !mapLibre.Map || typeof mapLibre.Map !== 'function') {
          const errorMsg = 'MapLibre library failed to load. Please refresh the page.';
          console.error('[InteractiveMap] MapLibre not loaded correctly', {
            mapLibre,
            hasMap: !!mapLibre?.Map,
            windowMapLibre: (window as any).maplibregl,
            module: mlModule
          });
          // Set error state to show fallback message
          setError(errorMsg);
          setReady(false);
          return undefined;
        }

        mlibRef.current = mapLibre;
        
        // Wait for container to be fully painted before initializing map
        const initWithDelay = () => {
          const rect = el?.getBoundingClientRect();
          if (!rect || rect.width === 0 || rect.height === 0) {
            const ro = new ResizeObserver(() => {
              const r = el?.getBoundingClientRect();
              if (r && r.width > 0 && r.height > 0) { 
                try { ro.disconnect(); } catch { } 
                // Double rAF ensures layout is committed and painted
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => init());
                });
              }
            });
            try { if (el) ro.observe(el); } catch { 
              requestAnimationFrame(() => {
                requestAnimationFrame(() => init());
              });
            }
            return () => { try { ro.disconnect(); } catch { } };
          } else {
            // Double rAF ensures DOM is fully painted before MapLibre init
            requestAnimationFrame(() => {
              requestAnimationFrame(() => init());
            });
            return () => {};
          }
        };
        
        return initWithDelay();
      } catch (error) {
        const errorMsg = `Failed to load map: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error('[InteractiveMap] Failed to load MapLibre:', error);
        setError(errorMsg);
        setReady(false);
        return undefined;
      }
    };
    return void boot();
  }, []); // Initialize map only once, not on every shows change

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
        
        // Use show coordinates if available, otherwise approximate from country
        let lng = s.lng;
        let lat = s.lat;
        if (!lng || !lat || (lng === 0 && lat === 0)) {
          const [approxLng, approxLat] = getCountryCoordinates(s.country || '');
          lng = approxLng;
          lat = approxLat;
        }
        
        return ({
          type: 'Feature', properties: {
            id: s.id,
            title: `${s.city}, ${new Date(s.date).toLocaleDateString()}`,
            city: s.city,
            country: s.country,
            date: s.date,
            status: s.status,
            fee: s.fee,
            net,
            category
          }, geometry: { type: 'Point', coordinates: [lng, lat] }
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
      shows.forEach(s => {
        let lng = s.lng;
        let lat = s.lat;
        if (!lng || !lat || (lng === 0 && lat === 0)) {
          const [approxLng, approxLat] = getCountryCoordinates(s.country || '');
          lng = approxLng;
          lat = approxLat;
        }
        if (lng && lat) bounds.extend([lng, lat] as [number, number]);
      });
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds as any, { 
          padding: { top: 80, bottom: 80, left: 80, right: 80 }, 
          duration: 500,
          maxZoom: 8 
        });
        try { const first = shows[0]; if (first) announce(`Showing ${shows.length} shows, starting at ${first.city}`); } catch { }
      }
    } catch { }
  }, [shows, ready]); // Re-run when shows change OR when map becomes ready

  // Update home location marker when homeLocation changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    try {
      const src: any = map.getSource('home');
      if (!src) return;

      if (!homeLocation) {
        // Clear home marker if no location
        src.setData({ type: 'FeatureCollection', features: [] } as any);
        return;
      }

      // Add home marker
      const homeFeature = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: { type: 'home' },
          geometry: {
            type: 'Point',
            coordinates: [homeLocation.lng, homeLocation.lat]
          }
        }]
      } as any;

      src.setData(homeFeature);
      console.log(`[InteractiveMap] Home marker updated at (${homeLocation.lat}, ${homeLocation.lng})`);
    } catch (error) {
      console.error('[InteractiveMap] Failed to update home marker:', error);
    }
  }, [homeLocation, ready]);

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
      map.fitBounds(bounds as any, { 
        padding: { top: 100, bottom: 100, left: 100, right: 100 }, 
        duration: 1000,
        maxZoom: 8,
        essential: true,
        easing: (t: number) => 1 - Math.pow(1 - t, 3) // easeOutCubic for smoother deceleration
      });
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
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
          <div className="text-center max-w-md">
            <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Map Failed to Load</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}
      
      {!ready && !error && <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/50 dark:to-transparent backdrop-blur-sm animate-pulse">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide">Loading map...</div>
      </div>}
      
      {/* Geocoding indicator - Improved design */}
      {geocoding && processed < total && (
        <div className="absolute bottom-3 left-3 px-2.5 py-1.5 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-700 dark:text-white shadow-lg flex items-center gap-2">
          <svg className="w-3.5 h-3.5 animate-spin text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-[11px]">{processed}/{total}</span>
        </div>
      )}
      {cssWarning && (
        <div className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded bg-amber-400/90 text-black border border-amber-900/20 shadow">
          {t('map.cssWarning')}
        </div>
      )}
      {highContrast && (
        <div className={`absolute inset-0 pointer-events-none map-gradient-mask contrast-125 saturate-150`} />
      )}

      {/* Fit All Shows Button - Enhanced design with gradient and glow */}
      {ready && shows.length > 0 && (
        <button
          onClick={fitAllShows}
          className="group absolute top-3 right-3 px-4 py-2 backdrop-blur-xl bg-gradient-to-br from-white/95 to-white/85 dark:from-slate-900/95 dark:to-slate-800/95 hover:from-accent-50 hover:to-accent-100/90 dark:hover:from-accent-900/40 dark:hover:to-accent-800/40 border border-slate-200 dark:border-white/10 hover:border-accent-400 dark:hover:border-accent-500/50 rounded-xl text-xs font-bold text-slate-800 dark:text-white hover:text-accent-700 dark:hover:text-accent-300 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-accent-500/20 dark:hover:shadow-accent-500/30 flex items-center gap-2.5 active:scale-95 transform hover:-translate-y-0.5"
          aria-label="Fit all shows in view"
          style={{ letterSpacing: '0.02em' }}
        >
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="text-[11px] font-extrabold">{t('map.viewAll') || 'View All'}</span>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-400/0 via-accent-400/10 to-accent-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </button>
      )}
      
      {/* Show count badge */}
      {ready && shows.length > 0 && (
        <div className="absolute top-3 left-3 px-3 py-1.5 backdrop-blur-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-white/10 rounded-lg text-xs font-bold text-white shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
          <span className="text-[11px]">{shows.length} {shows.length === 1 ? 'show' : 'shows'}</span>
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
