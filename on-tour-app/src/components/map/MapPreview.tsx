import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHighContrast } from '../../context/HighContrastContext';

export interface MapMarker {
  id: string;
  label: string;
  lat: number; // -90..90
  lng: number; // -180..180
  accent?: boolean;
}

interface MapPreviewProps {
  center?: { lat: number; lng: number };
  markers?: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
  decorative?: boolean; // if true, hide from assistive tech
  reduceMotion?: boolean; // disable ping/pulse animations
}

// Simple equirectangular projection for mock (not geographic accurate)
function project(lat: number, lng: number) {
  const x = (lng + 180) / 360; // 0..1
  const y = 1 - (lat + 90) / 180; // 0..1 invert so north is top
  return { x, y };
}

export const MapPreview: React.FC<MapPreviewProps> = ({
  center = { lat: 0, lng: 0 },
  markers = [],
  onMarkerClick,
  className = '',
  decorative = false,
  reduceMotion = false
}) => {
  const ariaProps = decorative
    ? { 'aria-hidden': true }
    : { role: 'group', 'aria-label': 'Tour map preview with markers' };

  // If reduceMotion not requested, still respect system preference
  const [prefersRM, setPrefersRM] = useState(false);
  const { highContrast } = useHighContrast();
  const [focusedId, setFocusedId] = useState<string | null>(null);
  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const onChange = () => setPrefersRM(!!mq.matches);
      onChange();
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    } catch {}
  }, []);
  const effectiveRM = reduceMotion || prefersRM;
  const [travelT, setTravelT] = useState(0); // 0..1 travel progress along route
  useEffect(() => {
    if (effectiveRM) return;
    let raf = 0;
    const step = () => {
      setTravelT(t => (t + 0.005) % 1);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { try { cancelAnimationFrame(raf); } catch {} };
  }, [effectiveRM]);

  // Route polyline points (in given order)
  const routePoints = useMemo(() => {
    if (!markers.length) return '';
    const pts = markers.map(m => {
      const { x, y } = project(m.lat, m.lng);
      return `${x * 100},${y * 56}`;
    });
    return pts.join(' ');
  }, [markers]);

  // Simple geodesic arc generator between two lat/lng points using great-circle sampling
  function arcPath(a: { lat:number; lng:number }, b:{ lat:number; lng:number }, samples = 24) {
    const toRad = (d:number)=> d*Math.PI/180;
    const toDeg = (r:number)=> r*180/Math.PI;
    const φ1 = toRad(a.lat), λ1 = toRad(a.lng);
    const φ2 = toRad(b.lat), λ2 = toRad(b.lng);
    const Δ = 2 * Math.asin(Math.sqrt(Math.sin((φ2-φ1)/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin((λ2-λ1)/2)**2));
    if (!isFinite(Δ) || Δ === 0) return '';
    const sinΔ = Math.sin(Δ);
    const coords: Array<{x:number;y:number}> = [];
    for (let i=0;i<=samples;i++){
      const t = i/samples;
      const A = Math.sin((1-t)*Δ)/sinΔ;
      const B = Math.sin(t*Δ)/sinΔ;
      const x = A*Math.cos(φ1)*Math.cos(λ1) + B*Math.cos(φ2)*Math.cos(λ2);
      const y = A*Math.cos(φ1)*Math.sin(λ1) + B*Math.cos(φ2)*Math.sin(λ2);
      const z = A*Math.sin(φ1) + B*Math.sin(φ2);
      const φ = Math.atan2(z, Math.sqrt(x*x + y*y));
      const λ = Math.atan2(y, x);
      const p = project(toDeg(φ), toDeg(λ));
      coords.push({ x: p.x*100, y: p.y*56 });
    }
    return coords.reduce((acc, p, idx) => acc + (idx===0 ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`), '');
  }

  // Flattened samples across entire route for animation
  const [routeSamples, setRouteSamples] = useState<Array<{x:number;y:number}>>([]);
  const workerRef = useRef<Worker|null>(null);
  useEffect(() => {
    if (markers.length < 2) { setRouteSamples([]); return; }
    // For small sets, compute inline to avoid worker overhead
    if (markers.length <= 8) {
      const pts: Array<{x:number;y:number}> = [];
      for (let i=0;i<markers.length-1;i++){
        const d = arcPath({ lat:markers[i].lat, lng:markers[i].lng }, { lat:markers[i+1].lat, lng:markers[i+1].lng }, 28);
        if (!d) continue;
        const segs = d.replace(/^M/,'').split('L');
        for (const s of segs){
          const [sx, sy] = s.split(',').map(Number);
          if (Number.isFinite(sx) && Number.isFinite(sy)) pts.push({ x:sx, y:sy });
        }
      }
      setRouteSamples(pts);
      return;
    }
    // Larger sets: offload to worker
    try {
      if (!workerRef.current) {
        workerRef.current = new Worker(new URL('../../workers/routeSampleWorker.ts', import.meta.url), { type: 'module' });
      }
      const w = workerRef.current;
      const onMsg = (ev: MessageEvent) => {
        if (ev.data && ev.data.type === 'result') setRouteSamples(ev.data.points || []);
      };
      w.addEventListener('message', onMsg);
      w.postMessage({ type:'compute', markers });
      return () => { try { w.removeEventListener('message', onMsg); } catch {} };
    } catch {
      // Fallback inline if worker fails
      const pts: Array<{x:number;y:number}> = [];
      for (let i=0;i<markers.length-1;i++){
        const d = arcPath({ lat:markers[i].lat, lng:markers[i].lng }, { lat:markers[i+1].lat, lng:markers[i+1].lng }, 28);
        if (!d) continue;
        const segs = d.replace(/^M/,'').split('L');
        for (const s of segs){
          const [sx, sy] = s.split(',').map(Number);
          if (Number.isFinite(sx) && Number.isFinite(sy)) pts.push({ x:sx, y:sy });
        }
      }
      setRouteSamples(pts);
    }
  }, [markers]);

  // Light clustering when there are many markers
  const { renderClusters, clusters } = useMemo(() => {
    const max = markers.length;
    if (max <= 12) return { renderClusters:false, clusters: [] as any[] };
    const projected = markers.map(m => ({ m, ...project(m.lat, m.lng) }));
    const R = Math.min(6, 2 + Math.floor(max/10)); // 2..6 units threshold
    const acc: Array<{ x:number; y:number; ids:string[]; labels:string[]; count:number; accent:boolean }>=[];
    for (const p of projected){
      const px = p.x*100, py = p.y*56;
      let merged = false;
      for (const c of acc){
        const dx = c.x - px, dy = c.y - py;
        if (dx*dx + dy*dy <= R*R){
          // merge into existing cluster (simple centroid update)
          const total = c.count + 1;
          c.x = (c.x*c.count + px)/total;
          c.y = (c.y*c.count + py)/total;
          c.count = total;
          c.ids.push(p.m.id);
          c.labels.push(p.m.label);
          c.accent = c.accent || !!p.m.accent;
          merged = true;
          break;
        }
      }
      if (!merged) acc.push({ x:px, y:py, ids:[p.m.id], labels:[p.m.label], count:1, accent: !!p.m.accent });
    }
    return { renderClusters:true, clusters: acc };
  }, [markers]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 ${className}`}
      {...ariaProps}
    >
      <svg
        viewBox="0 0 100 56" // cinematic ratio
        className="w-full h-full block select-none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent-500)" stopOpacity={0.15} />
            <stop offset="100%" stopColor="var(--accent-500)" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="ocean" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0a2540" />
            <stop offset="100%" stopColor="#16324f" />
          </linearGradient>
          {/* Route stroke gradient */}
          <linearGradient id="routegrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(34,197,94,0.3)" />
            <stop offset="50%" stopColor="rgba(34,197,94,0.9)" />
            <stop offset="100%" stopColor="rgba(34,197,94,0.3)" />
          </linearGradient>
          {/* Subtle atmosphere noise */}
          <filter id="atmo" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="noise"/>
            <feColorMatrix in="noise" type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0 0.05 0" />
            </feComponentTransfer>
          </filter>
        </defs>
        <rect x={0} y={0} width={100} height={56} fill="url(#ocean)" />
        {/* simplified continents silhouettes */}
        <g opacity={0.25} fill="var(--ink-100)">
          <path d="M18 18l6-2 4 1 3 3-2 4-5 2-4-1-3-4z" />
          <path d="M44 14l5-2 4 1 2 3-1 3-4 2-5-1-2-3z" />
          <path d="M66 22l4-2 3 1 2 2-1 3-3 1-4-1-2-2z" />
        </g>
        <rect x={0} y={0} width={100} height={56} fill="url(#glow)" opacity={0.35} />
        {/* center pulse */}
        {(() => {
          const { x, y } = project(center.lat, center.lng);
          return (
            <circle
              cx={x * 100}
              cy={y * 56}
              r={6}
              className={effectiveRM ? '' : 'animate-ping'}
              fill="var(--accent-500)"
              fillOpacity={effectiveRM ? 0.08 : 0.15}
            />
          );
        })()}
        {/* Route connecting markers (optional if >= 2 points); hide when clustering is on */}
        {!renderClusters && markers.length > 1 && (
          <>
            {markers.slice(0, -1).map((m, i) => {
              const n = markers[i+1];
              const d = arcPath({ lat:m.lat, lng:m.lng }, { lat:n.lat, lng:n.lng }, 28);
              if (!d) return null;
              return (
                <path key={m.id+'=>'+n.id} d={d} fill="none" stroke="url(#routegrad)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              );
            })}
          </>
        )}
        {!renderClusters && markers.map(m => {
          const { x, y } = project(m.lat, m.lng);
          // compute an approximate width for label based on char count for better wrapping
          const charW = 2.2; // px at this SVG scale
          const lines = 2;
          const maxWidth = 26;
          const estWidth = Math.min(maxWidth, Math.max(12, Math.min(maxWidth, Math.ceil(m.label.length * (charW / lines)))));
          return (
            <g key={m.id} transform={`translate(${x * 100} ${y * 56})`}>
              <circle
                r={m.accent ? 2.9 : 2.4}
                className={m.accent ? (effectiveRM ? '' : 'animate-pulse') : ''}
                fill={m.accent ? 'var(--accent-500)' : 'white'}
                fillOpacity={m.accent ? 0.95 : 0.85}
                stroke={m.accent ? 'var(--accent-500)' : (focusedId===m.id ? 'var(--accent-400)' : 'black')}
                strokeWidth={focusedId===m.id ? 1.4 : 0.4}
                onClick={() => onMarkerClick?.(m)}
                role="button"
                tabIndex={0}
                aria-label={m.label}
                aria-pressed={!!m.accent}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onMarkerClick?.(m);
                  }
                }}
                onFocus={() => setFocusedId(m.id)}
                onBlur={() => setFocusedId(id => (id===m.id ? null : id))}
              />
              {/* Label with wrapping using foreignObject (2 lines max) */}
              <foreignObject x={4} y={-4} width={estWidth} height={12} pointerEvents="none">
                <div style={{
                  background: highContrast ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.34)',
                  color: 'white',
                  fontSize: '3px',
                  lineHeight: '1.4',
                  borderRadius: '2px',
                  padding: '1px 2px',
                  maxWidth: `${estWidth}px`,
                  wordWrap: 'break-word',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as any
                }}>{m.label}</div>
              </foreignObject>
              {focusedId===m.id && (
                <circle r={4.5} fill="none" stroke="var(--accent-400)" strokeWidth={0.6} strokeDasharray={2} opacity={0.9} />
              )}
            </g>
          );
        })}
        {/* Animated travel dot across route when not clustered and motion allowed */}
        {!renderClusters && !effectiveRM && routeSamples.length>1 && (
          (() => {
            const idx = Math.floor(travelT * (routeSamples.length-1));
            const p = routeSamples[idx];
            return <circle cx={p.x} cy={p.y} r={1.4} fill="var(--accent-500)" fillOpacity={0.95} stroke="black" strokeWidth={0.3} />
          })()
        )}
        {renderClusters && clusters.map((c, idx) => (
          <g key={`c-${idx}`} transform={`translate(${c.x} ${c.y})`}>
            {!effectiveRM && (
              <circle r={5} fill="var(--accent-500)" fillOpacity={0.18} className="animate-ping" />
            )}
            <circle r={4} fill={c.accent ? 'var(--accent-500)' : 'white'} fillOpacity={0.9} stroke={c.accent ? 'var(--accent-500)' : 'black'} strokeWidth={0.6} />
            <text y={1} textAnchor="middle" fontSize={3.2} fill={c.accent ? 'black' : 'black'}>{c.count}</text>
          </g>
        ))}
  {/* Atmosphere overlay (disabled in high contrast) */}
  {!highContrast && <rect x={0} y={0} width={100} height={56} filter="url(#atmo)" />}
      </svg>
      <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-xl" />
    </div>
  );
};

export default MapPreview;
