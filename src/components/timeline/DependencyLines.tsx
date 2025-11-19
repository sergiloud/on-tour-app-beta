/**
 * Dependency Lines Component
 * 
 * Renders SVG lines connecting dependent events in the timeline.
 * Shows the relationships and critical path with fluid animations.
 */

import React, { useMemo, useRef, useEffect, useState } from 'react';

interface TimelineDependency {
  id: string;
  fromEventId: string;
  toEventId: string;
  type: 'before' | 'after' | 'blocks' | 'enabledBy';
  minGapMinutes?: number;
}

interface DependencyLinesProps {
  dependencies: TimelineDependency[];
  eventPositions: Map<string, { x: number; y: number; width: number; height: number }>;
  showCriticalPath?: boolean;
  criticalEventIds?: Set<string>;
  zoomLevel?: number;
}

/**
 * Get color for dependency type
 */
function getDependencyColor(type: TimelineDependency['type'], isCritical: boolean): string {
  if (isCritical) {
    return 'rgb(239, 68, 68)'; // red-500
  }
  
  switch (type) {
    case 'blocks':
      return 'rgb(251, 146, 60)'; // orange-400
    case 'enabledBy':
      return 'rgb(34, 197, 94)'; // green-500
    case 'before':
    case 'after':
    default:
      return 'rgb(148, 163, 184)'; // slate-400
  }
}

/**
 * Dependency Lines Component
 */
/**
 * Dependency Lines Component
 */
export default function DependencyLines({
  dependencies,
  eventPositions,
  showCriticalPath = false,
  criticalEventIds = new Set(),
  zoomLevel = 1,
}: DependencyLinesProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  
  // Update container width on resize and zoom changes
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        setContainerWidth(svgRef.current.parentElement.offsetWidth * zoomLevel);
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [zoomLevel]);
  
  // Memoize paths for performance (plain paths for immediate updates)
  const paths = useMemo(() => {
    return dependencies.map((dep) => {
      const fromPos = eventPositions.get(dep.fromEventId);
      const toPos = eventPositions.get(dep.toEventId);
      
      if (!fromPos || !toPos) return null;
      
      // Calculate connection points in pixels (already in px from eventPositions!)
      const x1 = fromPos.x + fromPos.width;
      const y1 = fromPos.y + fromPos.height / 2;
      const x2 = toPos.x;
      const y2 = toPos.y + toPos.height / 2;
      
      const isCritical = showCriticalPath && 
        criticalEventIds.has(dep.fromEventId) && 
        criticalEventIds.has(dep.toEventId);
      
      const color = getDependencyColor(dep.type, isCritical);
      const strokeWidth = isCritical ? 3 : 2;
      const opacity = isCritical ? 1 : 0.6;
      
      // Create a smooth curved path with dynamic control points
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const controlOffset = Math.min(distance * 0.4, 200); // Adaptive curve
      
      const path = `M ${x1},${y1} C ${x1 + controlOffset},${y1} ${x2 - controlOffset},${y2} ${x2},${y2}`;
      
      return {
        id: dep.id,
        path,
        color,
        strokeWidth,
        opacity,
        type: dep.type,
        isCritical,
      };
    }).filter(Boolean);
  }, [dependencies, eventPositions, containerWidth, showCriticalPath, criticalEventIds]);
  
  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ 
        zIndex: 2,
        width: '100%',
        height: '100%',
      }}
      preserveAspectRatio="none"
    >
      <defs>
        {/* Arrow markers with smooth gradients */}
        <marker
          id="arrow-critical"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,10 L10,5 z" fill="rgb(239, 68, 68)" />
        </marker>
        <marker
          id="arrow-normal"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,10 L10,5 z" fill="rgb(148, 163, 184)" opacity="0.7" />
        </marker>
        <marker
          id="arrow-green"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,10 L10,5 z" fill="rgb(34, 197, 94)" opacity="0.7" />
        </marker>
        
        {/* Glow filters for critical paths */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {paths.map((pathData) => {
        if (!pathData) return null;
        
        return (
          <g key={pathData.id}>
            {/* Glow effect for critical paths (immediate update) */}
            {pathData.isCritical && (
              <path
                d={pathData.path}
                stroke={pathData.color}
                strokeWidth={pathData.strokeWidth + 4}
                fill="none"
                opacity={0.28}
                filter="url(#glow)"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Main path (plain SVG for instant updates) */}
            <path
              d={pathData.path}
              stroke={pathData.color}
              strokeWidth={pathData.strokeWidth}
              fill="none"
              opacity={pathData.opacity}
              strokeDasharray={pathData.type === 'enabledBy' ? '6 4' : undefined}
              markerEnd={
                pathData.isCritical ? 'url(#arrow-critical)' : 
                pathData.type === 'enabledBy' ? 'url(#arrow-green)' : 
                'url(#arrow-normal)'
              }
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      })}
    </svg>
  );
}
