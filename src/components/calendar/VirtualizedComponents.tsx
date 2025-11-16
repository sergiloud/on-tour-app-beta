/**
 * Virtualized Calendar Components
 * 
 * High-performance calendar rendering using virtualization for large datasets.
 * Optimizes memory usage and render performance for thousands of events.
 */

import React, { useMemo, useCallback, useState, useRef } from 'react';
import { VirtualList, VirtualGrid, useAdvancedVirtualizer } from '../../lib/virtualization';
import { useMemoryManagement } from '../../lib/memoryManagement';
import { CalEvent } from './types';
import { motion } from 'framer-motion';

// ============================================================================
// VIRTUALIZED EVENT LIST
// ============================================================================

interface VirtualizedEventListProps {
  events: CalEvent[];
  onEventClick?: (event: CalEvent) => void;
  onEventEdit?: (event: CalEvent) => void;
  className?: string;
  height?: number;
  debug?: boolean;
}

export function VirtualizedEventList({
  events,
  onEventClick,
  onEventEdit,
  className = '',
  height = 400,
  debug = false,
}: VirtualizedEventListProps) {
  const { isMounted } = useMemoryManagement('VirtualizedEventList');
  
  // Memoize event rendering for performance
  const renderEvent = useCallback((event: CalEvent, index: number) => {
    if (!isMounted()) return null;
    
    return (
      <motion.div
        key={event.id}
        className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => onEventClick?.(event)}
        data-testid={`event-item-${index}`}
      >
        <div className="flex items-center space-x-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: getEventColor(event.color || 'blue') }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {event.title}
            </p>
            <p className="text-xs text-gray-500">
              {formatEventTime(event)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {event.status && (
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(event.status)}`}
            >
              {event.status}
            </span>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEventEdit?.(event);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={`Edit ${event.title}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </motion.div>
    );
  }, [isMounted, onEventClick, onEventEdit]);
  
  // Estimate item size based on content
  const estimateSize = useCallback((index: number) => {
    const event = events[index];
    if (!event) return 60; // Default height
    
    // Dynamic height based on content
    const hasStatus = !!event.status;
    const hasLongTitle = event.title.length > 30;
    
    let height = 60; // Base height
    if (hasStatus) height += 8;
    if (hasLongTitle) height += 20; // Extra line for wrapping
    
    return height;
  }, [events]);
  
  return (
    <div className={`virtualized-event-list ${className}`}>
      <VirtualList
        data={events}
        itemCount={events.length}
        renderItem={renderEvent}
        estimateSize={estimateSize}
        overscan={5}
        enableSmoothScrolling={true}
        enableDynamicSizing={true}
        maxItemsInMemory={500} // Limit for memory efficiency
        preloadBuffer={10}
        style={{ height: `${height}px` }}
        className="border border-gray-200 rounded-lg bg-white"
        role="list"
        ariaLabel="Event list"
        debug={debug}
      />
    </div>
  );
}

// ============================================================================
// VIRTUALIZED CALENDAR GRID
// ============================================================================

interface VirtualizedCalendarGridProps {
  events: CalEvent[];
  startDate: Date;
  endDate: Date;
  viewMode: 'month' | 'week' | 'day';
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalEvent) => void;
  className?: string;
  debug?: boolean;
}

export function VirtualizedCalendarGrid({
  events,
  startDate,
  endDate,
  viewMode,
  onDateClick,
  onEventClick,
  className = '',
  debug = false,
}: VirtualizedCalendarGridProps) {
  const { isMounted } = useMemoryManagement('VirtualizedCalendarGrid');
  
  // Generate date range for virtualization
  const dateRange = useMemo(() => {
    const dates: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }, [startDate, endDate]);
  
  // Group events by date for efficient lookup
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalEvent[]>();
    
    events.forEach(event => {
      const dateKey = event.date.slice(0, 10); // YYYY-MM-DD
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });
    
    return grouped;
  }, [events]);
  
  // Render a single calendar cell
  const renderCalendarCell = useCallback((date: Date, index: number) => {
    if (!isMounted()) return null;
    
    const dateKey = date.toISOString().slice(0, 10);
    const dayEvents = eventsByDate.get(dateKey) || [];
    const isToday = dateKey === new Date().toISOString().slice(0, 10);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    return (
      <motion.div
        key={dateKey}
        className={`calendar-cell p-2 border border-gray-200 min-h-[120px] cursor-pointer ${
          isToday ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'
        } ${isWeekend ? 'bg-gray-25' : ''}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onDateClick?.(date)}
        data-testid={`calendar-cell-${dateKey}`}
      >
        {/* Date header */}
        <div className="flex items-center justify-between mb-1">
          <span
            className={`text-sm font-medium ${
              isToday ? 'text-blue-600' : 'text-gray-900'
            }`}
          >
            {date.getDate()}
          </span>
          {dayEvents.length > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
              {dayEvents.length}
            </span>
          )}
        </div>
        
        {/* Events (limited to first few for performance) */}
        <div className="space-y-1">
          {dayEvents.slice(0, 3).map((event, eventIndex) => (
            <motion.div
              key={event.id}
              className="text-xs p-1 rounded truncate cursor-pointer"
              style={{
                backgroundColor: getEventColor(event.color || 'blue', 0.1),
                borderLeft: `3px solid ${getEventColor(event.color || 'blue')}`,
              }}
              whileHover={{ scale: 1.05 }}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick?.(event);
              }}
              title={`${event.title} - ${formatEventTime(event)}`}
            >
              {event.title}
            </motion.div>
          ))}
          
          {dayEvents.length > 3 && (
            <div className="text-xs text-gray-500 text-center py-1">
              +{dayEvents.length - 3} more
            </div>
          )}
        </div>
      </motion.div>
    );
  }, [isMounted, eventsByDate, onDateClick, onEventClick]);
  
  // Calculate grid dimensions based on view mode
  const { columns, rowHeight } = useMemo(() => {
    switch (viewMode) {
      case 'week':
        return { columns: 7, rowHeight: 160 };
      case 'day':
        return { columns: 1, rowHeight: 600 };
      case 'month':
      default:
        return { columns: 7, rowHeight: 120 };
    }
  }, [viewMode]);
  
  return (
    <div className={`virtualized-calendar-grid ${className}`}>
      {/* Calendar header */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-t-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500 text-center"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Virtualized calendar body */}
      <div className="border-x border-b border-gray-200 rounded-b-lg overflow-hidden">
        <VirtualGrid
          data={dateRange}
          columns={columns}
          rowHeight={rowHeight}
          renderItem={renderCalendarCell}
          gap={1}
          className="bg-gray-100"
          style={{ height: '500px' }}
        />
      </div>
      
      {debug && (
        <div className="mt-2 text-xs text-gray-500">
          Rendering {dateRange.length} dates, {events.length} events
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VIRTUALIZED TIMELINE VIEW
// ============================================================================

interface TimeSlot {
  time: string;
  events: CalEvent[];
}

interface VirtualizedTimelineProps {
  events: CalEvent[];
  date: Date;
  startHour?: number;
  endHour?: number;
  slotDuration?: number; // in minutes
  onEventClick?: (event: CalEvent) => void;
  onTimeSlotClick?: (time: string) => void;
  className?: string;
  debug?: boolean;
}

export function VirtualizedTimeline({
  events,
  date,
  startHour = 0,
  endHour = 24,
  slotDuration = 30,
  onEventClick,
  onTimeSlotClick,
  className = '',
  debug = false,
}: VirtualizedTimelineProps) {
  const { isMounted } = useMemoryManagement('VirtualizedTimeline');
  
  // Generate time slots
  const timeSlots = useMemo((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const totalMinutes = (endHour - startHour) * 60;
    const slotCount = totalMinutes / slotDuration;
    
    for (let i = 0; i < slotCount; i++) {
      const minutes = startHour * 60 + i * slotDuration;
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const time = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      
      // Filter events for this time slot
      const slotEvents = events.filter(event => {
        // Extract time from start field (ISO format)
        const eventTime = event.start ? new Date(event.start).toTimeString().slice(0, 5) : '00:00';
        const [eventHour, eventMin] = eventTime.split(':').map(Number);
        const eventMinutes = (eventHour || 0) * 60 + (eventMin || 0);
        
        return eventMinutes >= minutes && eventMinutes < minutes + slotDuration;
      });
      
      slots.push({ time, events: slotEvents });
    }
    
    return slots;
  }, [startHour, endHour, slotDuration, events]);
  
  // Render time slot
  const renderTimeSlot = useCallback((slot: TimeSlot, index: number) => {
    if (!isMounted()) return null;
    
    return (
      <motion.div
        key={slot.time}
        className="timeline-slot flex border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
        whileHover={{ backgroundColor: '#f9fafb' }}
        onClick={() => onTimeSlotClick?.(slot.time)}
        data-testid={`time-slot-${slot.time}`}
      >
        {/* Time label */}
        <div className="w-20 flex-shrink-0 p-3 text-sm text-gray-500 border-r border-gray-100">
          {slot.time}
        </div>
        
        {/* Events */}
        <div className="flex-1 p-3">
          {slot.events.length === 0 ? (
            <div className="text-sm text-gray-300 italic">No events</div>
          ) : (
            <div className="space-y-2">
              {slot.events.map(event => (
                <motion.div
                  key={event.id}
                  className="flex items-center space-x-3 p-2 rounded-md cursor-pointer"
                  style={{
                    backgroundColor: getEventColor(event.color || 'blue', 0.1),
                    borderLeft: `4px solid ${getEventColor(event.color || 'blue')}`,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick?.(event);
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.title}
                    </p>
                    {event.city && (
                      <p className="text-xs text-gray-500 truncate">
                        📍 {event.city}
                      </p>
                    )}
                  </div>
                  
                  {event.status && (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(event.status)}`}
                    >
                      {event.status}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }, [isMounted, onEventClick, onTimeSlotClick]);
  
  return (
    <div className={`virtualized-timeline ${className}`}>
      {/* Timeline header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900">
          {date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </h3>
      </div>
      
      {/* Virtualized timeline body */}
      <VirtualList
        data={timeSlots}
        itemCount={timeSlots.length}
        renderItem={renderTimeSlot}
        estimateSize={() => 80} // Each slot is ~80px high
        overscan={3}
        enableSmoothScrolling={true}
        maxItemsInMemory={200}
        preloadBuffer={5}
        style={{ height: '600px' }}
        className="border border-gray-200 bg-white"
        role="grid"
        ariaLabel="Timeline view"
        debug={debug}
      />
      
      {debug && (
        <div className="mt-2 text-xs text-gray-500">
          {timeSlots.length} time slots, {events.length} events
        </div>
      )}
    </div>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getEventColor(color: string, opacity = 1): string {
  const colorMap: Record<string, string> = {
    blue: `rgba(59, 130, 246, ${opacity})`,
    green: `rgba(34, 197, 94, ${opacity})`,
    yellow: `rgba(234, 179, 8, ${opacity})`,
    red: `rgba(239, 68, 68, ${opacity})`,
    purple: `rgba(147, 51, 234, ${opacity})`,
    gray: `rgba(107, 114, 128, ${opacity})`,
    accent: `rgba(59, 130, 246, ${opacity})`, // Map accent to blue
  };
  
  return colorMap[color] || `rgba(59, 130, 246, ${opacity})`;
}

function getStatusStyle(status: string): string {
  const statusStyles: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    offer: 'bg-blue-100 text-blue-800',
  };
  
  return statusStyles[status] || 'bg-yellow-100 text-yellow-800';
}

function formatEventTime(event: CalEvent): string {
  // Use start time if available, otherwise show as all day
  if (!event.start) return 'All day';
  
  const date = new Date(event.start);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}