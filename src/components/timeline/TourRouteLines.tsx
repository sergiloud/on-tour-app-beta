/**
 * Tour Route Lines Component
 * 
 * Draws visual route lines connecting sequential shows in a tour.
 * Helps visualize the tour flow and travel sequence with fluid animations.
 */

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import type { TimelineEvent } from '../../services/timelineMissionControlService';

interface TourRouteLinesProps {
  events: TimelineEvent[];
  eventPositions: Map<string, { x: number; y: number; width: number; height: number }>;
  zoomLevel?: number;
}

export default function TourRouteLines({ events, eventPositions, zoomLevel = 1 }: TourRouteLinesProps) {
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
  
  // Group events into tour sequences
  const tourRoutes = useMemo(() => {
    // Filter only shows
    const shows = events
      .filter(e => e.type === 'show')
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    const routes: Array<{ 
      from: TimelineEvent; 
      to: TimelineEvent;
      path: string;
      distance: number;
    }> = [];
    
    // Connect consecutive shows
    for (let i = 0; i < shows.length - 1; i++) {
      const current = shows[i];
      const next = shows[i + 1];
      
      if (!current || !next) continue;
      
      // Only connect if they're within 7 days of each other (likely same tour)
      const daysDiff = (next.startTime.getTime() - current.startTime.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff <= 7) {
        const fromPos = eventPositions.get(current.id);
        const toPos = eventPositions.get(next.id);
        
        if (fromPos && toPos) {
          // Calculate connection points in pixels (already in px from eventPositions!)
          const x1 = fromPos.x + fromPos.width;
          const y1 = fromPos.y + fromPos.height / 2;
          const x2 = toPos.x;
          const y2 = toPos.y + toPos.height / 2;
          
          // Create smooth curve with dynamic control points
          const dx = x2 - x1;
          const dy = y2 - y1;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const controlOffset = Math.min(distance * 0.35, 180);
          
          const path = `M ${x1},${y1} C ${x1 + controlOffset},${y1} ${x2 - controlOffset},${y2} ${x2},${y2}`;
          
          routes.push({ 
            from: current, 
            to: next,
            path,
            distance,
          });
        }
      }
    }
    
    return routes;
  }, [events, eventPositions, containerWidth]);
  
  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ 
        zIndex: 1,
        width: '100%',
        height: '100%',
      }}
      preserveAspectRatio="none"
    >
      <defs>
        {/* Enhanced gradient for tour route */}
        <linearGradient id="tourGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.7" />
          <stop offset="50%" stopColor="rgb(99, 102, 241)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.7" />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id="tourGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {tourRoutes.map((route, index) => {
        // Dynamic stroke width based on distance (closer = thicker)
        const strokeWidth = Math.max(2, Math.min(4, 800 / route.distance));
        
        return (
          <motion.g
            key={`${route.from.id}-${route.to.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.08,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            {/* Background glow - adaptive to zoom */}
            <motion.path
              d={route.path}
              fill="none"
              stroke="url(#tourGradient)"
              strokeWidth={strokeWidth + 6}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.25}
              filter="url(#tourGlow)"
              style={{
                vectorEffect: 'non-scaling-stroke',
              }}
            />
            
            {/* Main animated line */}
            <motion.path
              d={route.path}
              fill="none"
              stroke="url(#tourGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="10 5"
              className="tour-route-line"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: 0.8,
              }}
              transition={{ 
                pathLength: { 
                  duration: 1, 
                  ease: [0.4, 0, 0.2, 1],
                  delay: index * 0.08,
                },
                opacity: { 
                  duration: 0.3,
                  delay: index * 0.08 + 0.2,
                },
              }}
              style={{
                vectorEffect: 'non-scaling-stroke',
              }}
            />
            
            {/* Animated traveling dot */}
            <motion.circle
              r={Math.max(3, strokeWidth / 2)}
              fill="rgb(139, 92, 246)"
              filter="url(#tourGlow)"
            >
              <animateMotion
                dur={`${4 + index * 0.5}s`}
                repeatCount="indefinite"
                path={route.path}
              />
            </motion.circle>
          </motion.g>
        );
      })}
      
      <style>{`
        .tour-route-line {
          animation: dash 25s linear infinite;
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: -150;
          }
        }
      `}</style>
    </svg>
  );
}
