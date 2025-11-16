import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Show } from './SmartShowRow';

interface CalendarViewProps {
  shows: Show[];
  onShowClick: (show: Show) => void;
  onEdit: (show: Show) => void;
  onViewTasks: (show: Show) => void;
  onViewFinance: (show: Show) => void;
}

interface CalendarEvent {
  show: Show;
  date: Date;
  day: number;
  month: number;
  year: number;
}

export const CalendarView = React.memo<CalendarViewProps>(({
  shows,
  onShowClick,
  onEdit,
  onViewTasks,
  onViewFinance
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const calendarEvents = useMemo(() => {
    return shows.map(show => {
      const date = new Date(show.date);
      return {
        show,
        date,
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear()
      };
    });
  }, [shows]);

  const getEventsForDate = (day: number, month: number, year: number) => {
    return calendarEvents.filter(event =>
      event.day === day && event.month === month && event.year === year
    );
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getEventColor = (status: Show['status']) => {
    switch (status) {
      case 'planned': return 'bg-slate-500';
      case 'confirmed': return 'bg-blue-500';
      case 'on_sale': return 'bg-green-500';
      case 'upcoming': return 'bg-amber-500';
      case 'completed': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: Show['priority']) => {
    switch (priority) {
      case 'critical': return 'ring-red-500';
      case 'high': return 'ring-amber-500';
      case 'medium': return 'ring-blue-500';
      case 'low': return 'ring-slate-500';
      default: return 'ring-gray-500';
    }
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full flex flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-lg transition-colors"
          >
            ←
          </button>
          <h2 className="text-xl font-semibold text-theme-primary">
            {formatMonthYear(currentDate)}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-lg transition-colors"
          >
            →
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1">
        {/* Week Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {days.map((day, index) => {
            const events = day ? getEventsForDate(day, currentDate.getMonth(), currentDate.getFullYear()) : [];
            const isToday = day && new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15, delay: index * 0.005 }}
                className={`min-h-[120px] p-2 border border-theme rounded-lg ${
                  day ? 'hover:bg-interactive cursor-pointer' : ''
                } ${isToday ? 'ring-2 ring-blue-500/50' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-300' : 'text-white'}`}>
                      {day}
                    </div>

                    {/* Events for this day */}
                    <div className="space-y-1">
                      <AnimatePresence>
                        {events.slice(0, 3).map((event, eventIndex) => (
                          <motion.div
                            key={event.show.id}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 5 }}
                            transition={{ duration: 0.15, delay: eventIndex * 0.02 }}
                            className={`text-xs p-1 rounded text-white cursor-pointer hover:scale-102 transition-transform ${
                              getEventColor(event.show.status)
                            } ${getPriorityColor(event.show.priority)} ring-1`}
                            onClick={() => onShowClick(event.show)}
                            onMouseEnter={() => setSelectedEvent(event)}
                            onMouseLeave={() => setSelectedEvent(null)}
                          >
                            <div className="font-medium truncate">
                              {event.show.name}
                            </div>
                            <div className="text-xs opacity-80">
                              {event.show.city}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {events.length > 3 && (
                        <div className="text-xs text-slate-400 text-center">
                          +{events.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Event Tooltip */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 bg-black/90 backdrop-blur-sm border border-slate-300 dark:border-white/20 rounded-lg p-4 shadow-xl"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-white text-lg">{selectedEvent.show.name}</h3>
                <p className="text-slate-400">{selectedEvent.show.city}, {selectedEvent.show.venue}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Date:</span>
                  <p className="text-theme-primary">{selectedEvent.date.toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>
                  <p className="text-slate-900 dark:text-white capitalize">{selectedEvent.show.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-slate-400">Tickets:</span>
                  <p className="text-theme-primary">{selectedEvent.show.ticketSalesPercentage}% sold</p>
                </div>
                <div>
                  <span className="text-slate-400">Margin:</span>
                  <p className={`font-medium ${
                    selectedEvent.show.projectedMargin >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedEvent.show.projectedMargin >= 0 ? '+' : ''}{selectedEvent.show.projectedMargin}%
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    onEdit(selectedEvent.show);
                    setSelectedEvent(null);
                  }}
                  className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onViewTasks(selectedEvent.show);
                    setSelectedEvent(null);
                  }}
                  className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded text-sm"
                >
                  Tasks
                </button>
                <button
                  onClick={() => {
                    onViewFinance(selectedEvent.show);
                    setSelectedEvent(null);
                  }}
                  className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded text-sm"
                >
                  Finance
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

CalendarView.displayName = 'CalendarView';