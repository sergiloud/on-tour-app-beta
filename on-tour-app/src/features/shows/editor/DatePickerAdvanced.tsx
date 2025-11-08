import React, { useState, useRef, useEffect } from 'react';
import { t } from '../../../lib/i18n';

export interface DatePickerAdvancedProps {
  value: string | undefined;
  onChange: (date: string) => void;
  label?: string;
  help?: string;
  error?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  // Range support (e.g., for multi-day festivals)
  rangeStart?: string | undefined;
  rangeEnd?: string | undefined;
  onRangeChange?: (start: string | undefined, end: string | undefined) => void;
}

/**
 * Advanced Date Picker with mini calendar
 * - Visual mini-calendar with current date highlighted
 * - Click to change date quickly
 * - Future: multi-day range support for festivals
 */
export const DatePickerAdvanced: React.FC<DatePickerAdvancedProps> = ({
  value,
  onChange,
  label,
  help,
  error,
  disabled = false,
  minDate,
  maxDate,
  rangeStart,
  rangeEnd,
  onRangeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    value ? new Date(value + 'T00:00:00') : new Date()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const currentDate = value ? new Date(value + 'T00:00:00') : null;
  const displayValue = currentDate
    ? currentDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : '';

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of week (0=Sunday)
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Handle calendar day click - with optional range support (Shift+click)
  const handleDayClick = (day: number, shiftKey: boolean = false) => {
    const newDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    const formatted = formatDate(newDate);

    // If range mode is available and Shift is held
    if (onRangeChange && shiftKey) {
      if (!rangeStart) {
        // First click: set as start date
        onRangeChange(formatted, undefined);
      } else if (!rangeEnd) {
        // Second click: set as end date (auto-sort if needed)
        const [start, end] = [rangeStart, formatted].sort();
        onRangeChange(start, end);
        setIsOpen(false);
      } else {
        // Third click: reset and start new range
        onRangeChange(formatted, undefined);
      }
    } else {
      // Normal single-date mode
      onChange(formatted);
      setIsOpen(false);
    }
  };

  // Navigate months
  const prevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1));
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isOpen]);

  const daysInMonth = getDaysInMonth(calendarMonth);
  const firstDay = getFirstDayOfMonth(calendarMonth);
  const monthName = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Generate calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div ref={containerRef} className="flex flex-col gap-2 relative">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
          {label}
        </label>
      )}

      {/* Input field with calendar icon */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-1.5 rounded-md bg-white/5 border border-white/10 hover:border-white/15 focus:border-accent-500 focus:bg-white/15 focus:shadow-lg focus:shadow-accent-500/10 focus:ring-1 focus:ring-accent-500/20 transition-all text-white text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-white/70 text-sm">
            {rangeStart && rangeEnd
              ? `${rangeStart} to ${rangeEnd}`
              : rangeStart
              ? `${rangeStart} to (Shift+click end)`
              : displayValue || 'Select date...'}
          </span>
          <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>

        {/* Mini Calendar Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-1.5 z-50 bg-gradient-to-br from-white/10 via-white/5 to-white/2 border border-white/20 rounded-md shadow-2xl backdrop-blur-xl p-3 w-72">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-2.5">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h3 className="text-xs font-semibold text-white text-center flex-1">{monthName}</h3>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-0.5 mb-1.5">
              {weekDays.map(day => (
                <div key={day} className="text-center text-[9px] font-semibold text-white/60 py-0.5">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="aspect-square" />;
                }

                const dateStr = formatDate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
                const isSelected = currentDate && formatDate(currentDate) === dateStr;
                const isToday = formatDate(new Date()) === dateStr;
                const isDisabledDate = !!(
                  (minDate && dateStr < minDate) || (maxDate && dateStr > maxDate)
                );

                // Range highlighting: check if this date is in the range
                let isInRange = false;
                let isRangeStart = false;
                let isRangeEnd = false;
                if (rangeStart && rangeEnd) {
                  isInRange = dateStr > rangeStart && dateStr < rangeEnd;
                  isRangeStart = dateStr === rangeStart;
                  isRangeEnd = dateStr === rangeEnd;
                }

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isDisabledDate}
                    onClick={(e) => handleDayClick(day, e.shiftKey)}
                    title={onRangeChange ? 'Click to select | Shift+Click for range' : undefined}
                    className={`aspect-square rounded-sm flex items-center justify-center text-[11px] font-medium transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-md shadow-accent-500/30'
                        : isRangeStart || isRangeEnd
                        ? 'bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-md shadow-accent-500/30'
                        : isInRange
                        ? 'bg-accent-500/30 text-accent-100 border border-accent-500/40'
                        : isToday
                        ? 'bg-white/20 text-white border border-accent-400/50'
                        : isDisabledDate
                        ? 'text-white/20 cursor-not-allowed'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Today Button */}
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const formatted = formatDate(today);
                onChange(formatted);
                setIsOpen(false);
              }}
              className="w-full mt-2.5 py-1.5 text-xs font-semibold text-accent-300 rounded-md bg-accent-500/10 border border-accent-500/30 hover:bg-accent-500/20 transition-all"
            >
              {t('common.today') || 'Today'}
            </button>
          </div>
        )}
      </div>

      {/* Help text and errors */}
      {help && <p className="text-[11px] text-white/60">{help}</p>}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
};

export default DatePickerAdvanced;
