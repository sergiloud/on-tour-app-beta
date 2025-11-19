/**
 * Timeline Minimap Component
 * 
 * Provides a bird's-eye view of the entire timeline with viewport indicator.
 * Enables quick navigation to different time periods.
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { TimelineEvent } from '../../services/timelineMissionControlService';

interface TimelineMinimapProps {
  events: TimelineEvent[];
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
  viewportStart?: Date;
  viewportEnd?: Date;
  onNavigate?: (date: Date) => void;
}

/**
 * Get minimap color for event type
 */
function getMinimapColor(type: TimelineEvent['type'], importance: TimelineEvent['importance']): string {
  const baseColors = {
    show: importance === 'critical' ? 'bg-purple-400' : 'bg-purple-500',
    travel: 'bg-blue-500',
    finance: 'bg-green-500',
    task: 'bg-amber-500',
    contract: 'bg-slate-500',
  };
  
  return baseColors[type];
}

/**
 * Timeline Minimap Component
 */
export default function TimelineMinimap({
  events,
  scrollContainerRef,
  viewportStart: propViewportStart,
  viewportEnd: propViewportEnd,
  onNavigate,
}: TimelineMinimapProps) {
  const minimapRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ left: 0, width: 100 });
  
  // Calculate timeline bounds
  const { startDate, endDate } = useMemo(() => {
    if (events.length === 0) {
      const now = new Date();
      return {
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days ahead
      };
    }
    
    const dates = events.flatMap(e => [e.startTime, e.endTime].filter(Boolean) as Date[]);
    const start = new Date(Math.min(...dates.map(d => d.getTime())));
    const end = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Add padding
    const paddingMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    return { 
      startDate: new Date(start.getTime() - paddingMs), 
      endDate: new Date(end.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days after
    };
  }, [events]);
  
  const totalDuration = endDate.getTime() - startDate.getTime();
  
  // Convert date to position percentage
  const dateToPercent = (date: Date): number => {
    const offset = date.getTime() - startDate.getTime();
    return (offset / totalDuration) * 100;
  };
  
  // Track viewport position from scroll container
  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;
    
    const updateViewport = () => {
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      
      const left = (scrollLeft / scrollWidth) * 100;
      const width = (clientWidth / scrollWidth) * 100;
      
      setViewport({ left, width });
    };
    
    // Initial update
    updateViewport();
    
    // Update on scroll
    container.addEventListener('scroll', updateViewport);
    
    // Update on resize
    const resizeObserver = new ResizeObserver(updateViewport);
    resizeObserver.observe(container);
    
    return () => {
      container.removeEventListener('scroll', updateViewport);
      resizeObserver.disconnect();
    };
  }, [scrollContainerRef, events]); // Re-run when events change (timeline size changes)
  
  // Handle click to navigate
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!minimapRef.current || !scrollContainerRef?.current) return;
    
    const rect = minimapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentX = (clickX / rect.width) * 100;
    
    // Calculate target scroll position
    const container = scrollContainerRef.current;
    const targetScrollLeft = (percentX / 100) * container.scrollWidth - container.clientWidth / 2;
    
    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });
    
    if (onNavigate) {
      const targetTime = startDate.getTime() + (percentX / 100) * totalDuration;
      onNavigate(new Date(targetTime));
    }
  };
  
  // Calculate viewport position (use prop values if provided, otherwise tracked values)
  const viewportLeft = propViewportStart ? dateToPercent(propViewportStart) : viewport.left;
  const viewportRight = propViewportEnd ? dateToPercent(propViewportEnd) : viewport.left + viewport.width;
  const viewportWidth = viewportRight - viewportLeft;
  
  return (
    <div 
      ref={minimapRef}
      className="relative h-12 glass rounded-lg border border-white/10 p-2 cursor-pointer"
      onClick={handleClick}
    >
      {/* Background track */}
      <div className="relative h-full rounded bg-white/5">
        {/* Event markers */}
        {events.map((event) => {
          const x = dateToPercent(event.startTime);
          const width = event.endTime 
            ? Math.max((event.endTime.getTime() - event.startTime.getTime()) / totalDuration * 100, 0.5)
            : 0.5;
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.3 }}
              className={`
                absolute top-1/2 -translate-y-1/2 h-2 rounded-full
                ${getMinimapColor(event.type, event.importance)}
                opacity-70
              `}
              style={{
                left: `${x}%`,
                width: `${width}%`,
              }}
            />
          );
        })}
        
        {/* Viewport indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-0 bottom-0 border-2 border-accent-400/50 bg-accent-400/10 rounded pointer-events-none"
          style={{
            left: `${viewportLeft}%`,
            width: `${viewportWidth}%`,
          }}
        >
          {/* Resize handles */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-400/50 rounded-l" />
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-accent-400/50 rounded-r" />
        </motion.div>
      </div>
      
      {/* Date labels */}
      <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-[10px] text-white/30 pointer-events-none">
        <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <span>{endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  );
}
