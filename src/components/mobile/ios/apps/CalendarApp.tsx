import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { showStore } from '../../../../shared/showStore';
import type { Show } from '../../../../lib/shows';

type ViewMode = 'month' | 'list';

export const CalendarApp: React.FC = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Subscribe to showStore
  React.useEffect(() => {
    const updateShows = (newShows: Show[]) => {
      setShows(newShows);
    };
    
    updateShows(showStore.getAll());
    const unsubscribe = showStore.subscribe(updateShows);
    
    return unsubscribe;
  }, []);

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Previous month days to fill the first week
    const prevMonthDays: Date[] = [];
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      prevMonthDays.push(date);
    }
    
    // Current month days
    const currentMonthDays: Date[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      currentMonthDays.push(new Date(year, month, day));
    }
    
    // Next month days to fill the last week
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = 42 - totalDays; // 6 weeks * 7 days
    const nextMonthDays: Date[] = [];
    for (let day = 1; day <= remainingDays; day++) {
      nextMonthDays.push(new Date(year, month + 1, day));
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [currentMonth]);

  // Map shows to dates
  const showsByDate = useMemo(() => {
    const map = new Map<string, Show[]>();
    
    shows.forEach(show => {
      if (!show.date) return; // Skip shows without dates
      const parts = show.date.split('T');
      if (!parts[0]) return; // Skip invalid dates
      const dateKey = parts[0]; // YYYY-MM-DD
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(show);
    });
    
    return map;
  }, [shows]);

  // Get shows for selected date
  const selectedDateShows = useMemo(() => {
    if (!selectedDate) return [];
    return showsByDate.get(selectedDate) || [];
  }, [selectedDate, showsByDate]);

  // Navigation
  const goToPreviousMonth = () => {
    setSwipeDirection('right');
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setSwipeDirection('left');
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSwipeDirection(null);
  };

  // Swipe handlers
  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;
    
    if (info.offset.x > threshold) {
      goToPreviousMonth();
    } else if (info.offset.x < -threshold) {
      goToNextMonth();
    }
  };

  // Format date as YYYY-MM-DD
  const formatDateKey = (date: Date): string => {
    const parts = date.toISOString().split('T');
    return parts[0] || '';
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth();
  };

  // Status colors
  const statusColors: Record<string, string> = {
    confirmed: 'bg-emerald-500',
    pending: 'bg-amber-500',
    offer: 'bg-blue-500',
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="h-full flex flex-col bg-dark-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-900/95 backdrop-blur-xl border-b border-white/10 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 bg-accent-500 text-black text-sm font-medium rounded-lg hover:bg-accent-400 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <motion.button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </motion.button>
          
          <motion.h2 
            key={monthName}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-semibold text-white"
          >
            {monthName}
          </motion.h2>
          
          <motion.button
            onClick={goToNextMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setViewMode('month')}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
              viewMode === 'month'
                ? 'bg-accent-500 text-black'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
              viewMode === 'list'
                ? 'bg-accent-500 text-black'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Content */}
      <motion.div 
        className="flex-1 overflow-y-auto px-4 py-4"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence mode="wait">
          {viewMode === 'month' ? (
            <motion.div
              key={currentMonth.toISOString()}
              initial={{ opacity: 0, x: swipeDirection === 'left' ? 100 : swipeDirection === 'right' ? -100 : 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: swipeDirection === 'left' ? -100 : swipeDirection === 'right' ? 100 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="text-center text-xs font-medium text-slate-400 pb-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const dateKey = formatDateKey(date);
                const dayShows = showsByDate.get(dateKey) || [];
                const isSelected = selectedDate === dateKey;
                const today = isToday(date);
                const currentMonthDay = isCurrentMonth(date);

                return (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                    className={`
                      relative aspect-square p-1 rounded-lg text-sm transition-all
                      ${currentMonthDay ? 'text-white' : 'text-slate-600'}
                      ${today ? 'bg-accent-500/20 border-2 border-accent-500' : 'border border-transparent'}
                      ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}
                    `}
                  >
                    <div className="font-medium">{date.getDate()}</div>
                    
                    {/* Show Indicators */}
                    {dayShows.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {dayShows.slice(0, 3).map((show, idx) => (
                          <div
                            key={idx}
                            className={`w-1 h-1 rounded-full ${statusColors[show.status] || 'bg-slate-500'}`}
                          />
                        ))}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Selected Date Shows */}
            <AnimatePresence>
              {selectedDate && selectedDateShows.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                >
                  <h3 className="text-white font-semibold mb-3">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </h3>
                  <div className="space-y-2">
                    {selectedDateShows.map(show => (
                      <div
                        key={show.id}
                        className="p-3 bg-black/20 rounded-lg"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium truncate">
                              {show.name || 'Unnamed Show'}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{[show.city, show.country].filter(Boolean).join(', ') || '—'}</span>
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${statusColors[show.status] || 'bg-slate-500'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </motion.div>
          ) : (
            /* List View */
            <motion.div 
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
            {shows
              .filter(show => {
                const showDate = new Date(show.date);
                return showDate.getMonth() === currentMonth.getMonth() &&
                       showDate.getFullYear() === currentMonth.getFullYear();
              })
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map(show => (
                <motion.div
                  key={show.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold truncate">
                        {show.name || 'Unnamed Show'}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <CalendarIcon className="w-3 h-3" />
                        <span>
                          {new Date(show.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      show.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                      show.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {show.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{[show.city, show.country].filter(Boolean).join(', ') || '—'}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
