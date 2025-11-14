import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMissionControl } from '../../context/MissionControlContext';
import { trackEvent } from '../../lib/telemetry';
import { Card } from '../../ui/Card';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/leaflet-custom.css';
import { useShows } from '../../hooks/useShows';
import { useGeocodedShows } from '../../hooks/useGeocodedShows';
import { useSettings } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';
import { useTheme } from '../../hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { escapeHtml } from '../../lib/escape';
import { useAuth } from '../../context/AuthContext';
import { geocodeLocation } from '../../services/geocodingService';

const InteractiveMapComponent: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);
  const { focus } = useMissionControl() as any;
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  const [homeLocation, setHomeLocation] = useState<{ lng: number; lat: number } | null>(null);
  
  // Get all shows
  const { shows: allShows } = useShows();
  
  // Geocode shows that don't have coordinates
  const { shows: geocodedShows } = useGeocodedShows(allShows);
  
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
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 50); // Limit to 50 shows for performance
  }, [geocodedShows]);
  
  const { fmtMoney } = useSettings();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Memoize icon creation to avoid recreating on every render
  const showIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-show-marker',
      html: `
        <div class="marker-pin">
          <div class="marker-pulse"></div>
          <svg class="marker-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  }, []);

  const homeIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-home-marker',
      html: `
        <div class="home-marker-pin">
          <svg class="home-marker-icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    });
  }, []);

  // Geocode home location from profile
  useEffect(() => {
    if (!profile?.location) {
      setHomeLocation(null);
      return;
    }

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

  // Initialize Leaflet map
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    try {
      // Create map with better performance settings
      const map = L.map(container, {
        center: [30, 15],
        zoom: 2,
        minZoom: 2,
        maxZoom: 16,
        zoomControl: false,
        attributionControl: true,
        preferCanvas: true, // Use canvas renderer for better performance
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
        worldCopyJump: true,
      });

      // Add dark tile layer with better caching
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
        updateWhenIdle: true, // Only update tiles when map is idle
        updateWhenZooming: false, // Don't update while zooming for performance
        keepBuffer: 2, // Keep tiles in buffer for smoother panning
      }).addTo(map);

      // Add styled zoom control
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Smooth zoom on double-click
      map.doubleClickZoom.enable();

      mapRef.current = map;
      setReady(true);
      setIsLoading(false);

      console.log('[InteractiveMap] Leaflet map initialized with performance optimizations');
    } catch (error) {
      console.error('[InteractiveMap] Failed to initialize map:', error);
      setIsLoading(false);
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when shows change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    // Clear existing markers and polylines
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    polylinesRef.current.forEach(line => line.remove());
    polylinesRef.current = [];

    if (shows.length === 0) return;

    // Add tour path polyline connecting shows in chronological order
    if (shows.length > 1) {
      const coordinates: [number, number][] = shows.map(s => [s.lat, s.lng]);
      
      const polyline = L.polyline(coordinates, {
        color: '#10b981',
        weight: 2,
        opacity: 0.6,
        smoothFactor: 1,
        dashArray: '5, 10',
      });
      
      polyline.addTo(map);
      polylinesRef.current.push(polyline);
    }

    // Add markers for each show with staggered animation
    shows.forEach((show, index) => {
      const marker = L.marker([show.lat, show.lng], { 
        icon: showIcon,
        riseOnHover: true,
      });

      // Create popup content with optimized HTML
      const date = new Date(show.date);
      const dateStr = date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });

      const daysTillShow = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      const popupHTML = `
        <div class="map-popup-content">
          <div class="map-popup-header">
            <div class="map-popup-badge">${index + 1}</div>
            <div class="map-popup-venue">${escapeHtml(show.venue || show.name || t('dashboard.untitled'))}</div>
          </div>
          <div class="map-popup-location">
            <svg class="map-popup-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
            ${escapeHtml(show.city)}, ${escapeHtml(show.country)}
          </div>
          <div class="map-popup-date">
            <svg class="map-popup-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
            </svg>
            ${dateStr} <span class="map-popup-countdown">(${daysTillShow}d)</span>
          </div>
          ${show.fee ? `
            <div class="map-popup-fee">
              <svg class="map-popup-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
              </svg>
              ${escapeHtml(fmtMoney(show.fee))}
            </div>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupHTML, {
        className: 'custom-map-popup',
        closeButton: true,
        maxWidth: 320,
        minWidth: 240,
        autoPan: true,
        autoPanPadding: [50, 50],
      });

      // Click handler - navigate to show
      marker.on('click', () => {
        trackEvent('map_show_click', { showId: show.id, showIndex: index });
        navigate(`/dashboard/calendar?show=${show.id}`);
      });

      // Add marker with slight delay for staggered animation
      setTimeout(() => {
        marker.addTo(map);
        markersRef.current.push(marker);
      }, index * 30); // 30ms delay between each marker

      // Auto-open first show popup and fit bounds
      if (index === 0 && shows.length > 0) {
        setTimeout(() => {
          marker.openPopup();
          
          // Fit map to show all markers with padding
          if (shows.length > 1) {
            const bounds = L.latLngBounds(shows.map(s => [s.lat, s.lng]));
            map.fitBounds(bounds, { 
              padding: [80, 80],
              maxZoom: 6,
              animate: true,
              duration: 1,
            });
          } else {
            map.setView([show.lat, show.lng], 5, { animate: true });
          }
        }, 800);
      }
    });

    // Add home location marker if available
    if (homeLocation) {
      const homeMarker = L.marker([homeLocation.lat, homeLocation.lng], { 
        icon: homeIcon,
        zIndexOffset: -100, // Place behind show markers
      });
      
      homeMarker.bindPopup(`
        <div class="map-popup-content map-popup-home">
          <div class="map-popup-venue">
            <svg class="map-popup-icon-large" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            ${t('dashboard.home')}
          </div>
        </div>
      `, {
        className: 'custom-map-popup',
        closeButton: true,
        maxWidth: 200,
      });
      
      homeMarker.addTo(map);
      markersRef.current.push(homeMarker);
    }
  }, [shows, ready, homeLocation, fmtMoney, navigate, showIcon, homeIcon]);

  // Handle focus changes from MissionControl
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !focus) return;

    if (focus.type === 'show' && focus.showId) {
      const show = shows.find(s => s.id === focus.showId);
      if (show && show.lat && show.lng) {
        map.setView([show.lat, show.lng], 8, { animate: true });
        
        // Find and open the marker's popup
        const marker = markersRef.current.find(m => {
          const pos = m.getLatLng();
          return pos.lat === show.lat && pos.lng === show.lng;
        });
        
        if (marker) {
          marker.openPopup();
        }
      }
    }
  }, [focus, shows, ready]);

  return (
    <Card className={`relative overflow-hidden ${className}`} tone="soft">
      <div
        ref={containerRef}
        className="w-full h-full min-h-[500px] rounded-lg overflow-hidden"
        role="application"
        aria-label={t('dashboard.map')}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-900/80 backdrop-blur-sm z-[1000]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" />
            <div className="text-sm text-white/70">{t('loading')}</div>
          </div>
        </div>
      )}
      
      {/* Shows count badge */}
      {ready && shows.length > 0 && (
        <div className="absolute top-4 left-4 z-[400] bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
            <div className="text-xs font-semibold text-white">
              {shows.length} {shows.length === 1 ? 'show' : 'shows'}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export const InteractiveMap = React.memo(InteractiveMapComponent);
export default InteractiveMap;
