import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../../ui/Card';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/leaflet-custom.css';
import { useShows } from '../../hooks/useShows';
import { useGeocodedShows } from '../../hooks/useGeocodedShows';
import { useSettings } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';
import { escapeHtml } from '../../lib/escape';
import { logger } from '../../lib/logger';
import { useAuth } from '../../context/AuthContext';
import { geocodeLocation } from '../../services/geocodingService';

interface TourLeg {
  shows: any[];
  startDate: Date;
  endDate: Date;
  country?: string;
}

const InteractiveMapComponent: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const polylineLayerRef = useRef<L.LayerGroup | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  const [homeLocation, setHomeLocation] = useState<{ lng: number; lat: number } | null>(null);
  
  const { shows: allShows } = useShows();
  const { shows: geocodedShows } = useGeocodedShows(allShows);
  
  const shows = useMemo(() => {
    const now = Date.now();
    return [...geocodedShows]
      .filter(s => {
        if (!s.date) return false;
        const showDate = new Date(s.date).getTime();
        if (isNaN(showDate)) return false;
        return showDate >= now && s.lng && s.lat && !isNaN(s.lng) && !isNaN(s.lat);
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 100);
  }, [geocodedShows]);
  
  const { fmtMoney } = useSettings();
  
  // Color mapping for show status (professional, minimal palette)
  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case 'confirmed': return '#10b981'; // Emerald - solid green
      case 'pending': return '#f59e0b';   // Amber - waiting
      case 'offer': return '#3b82f6';     // Blue - opportunity
      case 'canceled': return '#ef4444';  // Red - cancelled
      case 'postponed': return '#8b5cf6'; // Purple - delayed
      case 'archived': return '#6b7280';  // Gray - archived
      default: return '#10b981';
    }
  }, []);
  
  // Create memoized marker icons per status for performance
  const markerIcons = useMemo(() => {
    const icons: Record<string, L.DivIcon> = {};
    const statuses = ['confirmed', 'pending', 'offer', 'canceled', 'postponed', 'archived'];
    
    statuses.forEach(status => {
      const color = getStatusColor(status);
      icons[status] = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="map-marker-pin">
            <div class="map-marker-dot" style="background: ${color}; box-shadow: 0 2px 8px ${color}66, 0 1px 2px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
      });
    });
    
    return icons;
  }, [getStatusColor]);

  // Smart grouping: Group consecutive shows into tour legs
  const tourLegs = useMemo((): TourLeg[] => {
    if (shows.length === 0) return [];
    
    const legs: TourLeg[] = [];
    let currentLeg: TourLeg = {
      shows: [shows[0]!],
      startDate: new Date(shows[0]!.date),
      endDate: new Date(shows[0]!.date),
      country: shows[0]!.country,
    };
    
    for (let i = 1; i < shows.length; i++) {
      const prevShow = shows[i - 1]!;
      const currentShow = shows[i]!;
      const prevDate = new Date(prevShow.date);
      const currentDate = new Date(currentShow.date);
      const daysDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      const sameCountry = prevShow.country === currentShow.country;
      const shouldGroup = (sameCountry && daysDiff <= 14) || (!sameCountry && daysDiff <= 7);
      
      if (shouldGroup) {
        currentLeg.shows.push(currentShow);
        currentLeg.endDate = currentDate;
      } else {
        legs.push(currentLeg);
        currentLeg = {
          shows: [currentShow],
          startDate: currentDate,
          endDate: currentDate,
          country: currentShow.country,
        };
      }
    }
    
    legs.push(currentLeg);
    return legs;
  }, [shows]);

  const homeIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-home-marker',
      html: `<div class="home-pin"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 16],
      popupAnchor: [0, -16],
    });
  }, []);

  // Geocode home location
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
        }
      } catch (error) {
        logger.error('Failed to geocode home location', error as Error, { component: 'InteractiveMap' });
        setHomeLocation(null);
      }
    };

    parseLocation();
  }, [profile?.location]);

  // Initialize map with performance optimizations
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    try {
      const map = L.map(container, {
        center: [30, 15],
        zoom: 2,
        minZoom: 2,
        maxZoom: 14,
        zoomControl: false,
        attributionControl: true,
        preferCanvas: true,
        renderer: L.canvas({ tolerance: 5 }), // Canvas renderer with tolerance
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: false,
        worldCopyJump: true,
        zoomAnimationThreshold: 4,
        wheelPxPerZoomLevel: 60, // MUCH faster scroll zoom (was 120)
        wheelDebounceTime: 40, // Faster response
        zoomSnap: 0.5, // Smoother zoom steps
        zoomDelta: 1, // Bigger zoom jumps for speed
        trackResize: true,
        boxZoom: true,
        doubleClickZoom: true,
        keyboard: true,
        tapTolerance: 15,
        inertia: false, // Disable inertia to prevent re-renders after mouseup
        maxBoundsViscosity: 0.0,
      });

      // High-performance tile layer with aggressive caching
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 2,
        updateWhenIdle: true, // CRITICAL: Only update when idle to prevent lag
        updateWhenZooming: false,
        updateInterval: 150, // Throttle tile updates
        keepBuffer: 6, // Large buffer for smooth panning (was 4)
        maxNativeZoom: 19,
        tileSize: 256,
        crossOrigin: true,
        className: 'map-tiles',
        // Performance optimizations
        noWrap: false,
        bounds: undefined,
        detectRetina: false, // Disable retina for performance
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);
      
      // Create layer groups for better performance
      markerLayerRef.current = L.layerGroup().addTo(map);
      polylineLayerRef.current = L.layerGroup().addTo(map);

      mapRef.current = map;
      setReady(true);
      setIsLoading(false);
    } catch (error) {
      logger.error('Failed to initialize map', error as Error, { component: 'InteractiveMap' });
      setIsLoading(false);
    }

    return () => {
      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Clear layers before removing map
      if (markerLayerRef.current) {
        markerLayerRef.current.clearLayers();
        markerLayerRef.current = null;
      }
      if (polylineLayerRef.current) {
        polylineLayerRef.current.clearLayers();
        polylineLayerRef.current = null;
      }
      
      // Clear marker and polyline references
      markersRef.current = [];
      polylinesRef.current = [];
      
      // Properly remove map instance
      if (mapRef.current) {
        try {
          mapRef.current.off(); // Remove all event listeners
          mapRef.current.remove(); // Remove map and clean up
        } catch (e) {
          // Ignore errors during cleanup
          console.warn('Map cleanup warning:', e);
        }
        mapRef.current = null;
      }
      
      setReady(false);
    };
  }, []);

  // Update markers and tour paths with optimized rendering
  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    const polylineLayer = polylineLayerRef.current;
    
    if (!map || !ready || !markerLayer || !polylineLayer) return;

    // Clear existing layers efficiently
    markerLayer.clearLayers();
    polylineLayer.clearLayers();
    markersRef.current = [];
    polylinesRef.current = [];

    if (shows.length === 0) return;

    // Use requestAnimationFrame for smooth rendering
    const renderMap = () => {
      // Draw tour legs with performance optimization (batch rendering)
      const polylinesToAdd: L.Polyline[] = [];
      
      tourLegs.forEach((leg) => {
        if (leg.shows.length > 1) {
          const coordinates: [number, number][] = leg.shows.map(s => [s.lat, s.lng]);
          
          // Determine leg color based on status distribution
          const confirmedCount = leg.shows.filter(s => s.status === 'confirmed').length;
          const legColor = confirmedCount > leg.shows.length / 2 
            ? '#10b981' // Mostly confirmed = emerald
            : '#64748b'; // Mixed/pending = slate
          
          const polyline = L.polyline(coordinates, {
            color: legColor,
            weight: 1.5,
            opacity: 0.35,
            smoothFactor: 1.5, // Increased smoothing
            dashArray: confirmedCount === leg.shows.length ? undefined : '4, 8',
            interactive: false, // Non-interactive for better performance
          });
          
          polylinesToAdd.push(polyline);
        }
      });
      
      // Batch add polylines for better performance
      polylinesToAdd.forEach(p => {
        polylineLayer.addLayer(p);
        polylinesRef.current.push(p);
      });

      // Batch create markers for better performance
      const markersToAdd: L.Marker[] = [];
      
      shows.forEach((show, index) => {
        const showStatus = show.status || 'confirmed';
        const statusIcon = markerIcons[showStatus] || markerIcons['confirmed'];
        
        const marker = L.marker([show.lat, show.lng], { 
          icon: statusIcon,
          riseOnHover: true, // Rise on hover for better UX
          bubblingMouseEvents: false, // Better click performance
        });

        const date = new Date(show.date);
        const dateStr = date.toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });

        const daysTillShow = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        // Status label mapping
        const statusLabels: Record<string, string> = {
          confirmed: 'Confirmed',
          pending: 'Pending',
          offer: 'Offer',
          canceled: 'Canceled',
          postponed: 'Postponed',
          archived: 'Archived',
        };
        
        const statusColor = getStatusColor(showStatus);
        const statusLabel = statusLabels[showStatus] || showStatus;

        // Compact, professional popup content
        const popupHTML = `
          <div class="map-popup-content">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColor}; flex-shrink: 0;"></div>
              <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.5);">${statusLabel}</div>
            </div>
            <div class="map-popup-venue">${escapeHtml(show.venue || show.name || t('dashboard.untitled'))}</div>
            <div class="map-popup-location">${escapeHtml(show.city)}, ${escapeHtml(show.country)}</div>
            <div class="map-popup-date">${dateStr} · ${daysTillShow}d</div>
            ${show.fee ? `<div class="map-popup-fee">${escapeHtml(fmtMoney(show.fee))}</div>` : ''}
          </div>
        `;

        marker.bindPopup(popupHTML, {
          className: 'custom-map-popup',
          closeButton: true,
          maxWidth: 260,
          minWidth: 180,
          autoPan: true,
          autoPanPadding: [40, 40],
          keepInView: true,
          autoClose: false, // Keep popup open when clicking elsewhere
          closeOnClick: false,
        });
        
        // Add quick-view tooltip on hover (lightweight info)
        const tooltipContent = `
          <div style="font-size: 11px; font-weight: 600;">${escapeHtml(show.venue || show.name || t('dashboard.untitled'))}</div>
          <div style="font-size: 10px; opacity: 0.7; margin-top: 2px;">${dateStr}</div>
        `;
        
        marker.bindTooltip(tooltipContent, {
          className: 'custom-map-tooltip',
          direction: 'top',
          offset: [0, -8],
          opacity: 0.95,
          permanent: false,
        });

        markersToAdd.push(marker);
      });
      
      // Batch add all markers using layer group for performance
      markersToAdd.forEach(m => {
        markerLayer.addLayer(m);
        markersRef.current.push(m);
      });
      
      // Auto-open first show and fit bounds (after all markers added)
      if (markersToAdd.length > 0 && shows.length > 0) {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Use setTimeout to avoid blocking
        timeoutRef.current = setTimeout(() => {
          // Check if map still exists before operating
          if (!mapRef.current || !markersToAdd[0]) return;
          
          try {
            markersToAdd[0].openPopup();
            
            if (shows.length > 1) {
              const bounds = L.latLngBounds(shows.map(s => [s.lat, s.lng]));
              mapRef.current.fitBounds(bounds, { 
                padding: [50, 50],
                maxZoom: 5,
                animate: true,
                duration: 0.5, // Faster animation
                easeLinearity: 0.2, // Smoother easing
              });
            } else {
              mapRef.current.setView([shows[0]!.lat, shows[0]!.lng], 4, { 
                animate: true,
                duration: 0.5,
              });
            }
          } catch (e) {
            // Ignore errors if component unmounted
            console.warn('Map animation warning:', e);
          }
        }, 300); // Reduced delay
      }

      // Add home marker
      if (homeLocation) {
        const homeMarker = L.marker([homeLocation.lat, homeLocation.lng], { 
          icon: homeIcon,
          zIndexOffset: -100,
          bubblingMouseEvents: false,
        });
        
        homeMarker.bindPopup(`
          <div class="map-popup-content map-popup-home">
            <div class="map-popup-venue">${t('dashboard.home')}</div>
          </div>
        `, {
          className: 'custom-map-popup',
          closeButton: true,
          maxWidth: 160,
          autoClose: false,
          closeOnClick: false,
        });
        
        markerLayer.addLayer(homeMarker);
        markersRef.current.push(homeMarker);
      }
    };

    // Use requestAnimationFrame for smooth rendering
    animationFrameRef.current = requestAnimationFrame(renderMap);

    return () => {
      // Clear pending timeout when effect re-runs or unmounts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [shows, ready, homeLocation, fmtMoney, homeIcon, tourLegs, markerIcons, getStatusColor]);

  return (
    <Card className={`relative overflow-hidden h-full ${className}`}>
      <div
        ref={containerRef}
        className="w-full h-full rounded-lg overflow-hidden"
        role="application"
        aria-label={t('dashboard.map')}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-900/90 backdrop-blur-sm z-[1000]">
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
            <div className="text-xs text-white/60">{t('loading')}</div>
          </div>
        </div>
      )}
      
      {ready && shows.length > 0 && (
        <div className="absolute top-3 left-3 z-[400] bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2">
          <div className="text-[10px] font-medium text-white/70 tracking-wide uppercase mb-0.5">Tour</div>
          <div className="text-sm font-semibold text-white">
            {shows.length} {shows.length === 1 ? 'show' : 'shows'}
          </div>
        </div>
      )}
      
      {ready && tourLegs.length > 1 && (
        <div className="absolute top-3 left-3 mt-20 z-[400] bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2">
          <div className="text-[10px] font-medium text-white/70 tracking-wide uppercase mb-0.5">Legs</div>
          <div className="text-sm font-semibold text-white">{tourLegs.length}</div>
        </div>
      )}
    </Card>
  );
};

// Memoize to prevent unnecessary re-renders
// Only re-render when className prop changes
export const InteractiveMap = React.memo(InteractiveMapComponent);

export default InteractiveMap;
