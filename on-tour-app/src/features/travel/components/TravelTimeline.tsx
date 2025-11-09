import React, { useMemo, useState, useEffect } from 'react';
import { useShows } from '../../../hooks/useShows';
import { useTravelSuggestions } from '../hooks/useTravelSuggestions';
import { t } from '../../../lib/i18n';
import { findAirport } from '../../../lib/airports';
import type { FlightResult } from '../../travel/providers/types';

type TimelineItem = {
  type: 'show' | 'travel';
  date: string;
  show?: any; // DemoShow
  travel?: any; // TravelSuggestion
};

type TravelTimelineProps = {
  onGapClick?: (suggestion: any) => void; // TravelSuggestion
  onFlightDrop?: (flight: FlightResult, date: string) => void;
};

export const TravelTimeline: React.FC<TravelTimelineProps> = ({ onGapClick, onFlightDrop }) => {
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [successDate, setSuccessDate] = useState<string | null>(null);

  useEffect(() => {
    if (successDate) {
      const timer = setTimeout(() => setSuccessDate(null), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successDate]);
  const { shows } = useShows();
  const confirmedShows = shows.filter(s => s.status === 'confirmed');
  const suggestions = useTravelSuggestions(confirmedShows);

  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];

    // Add confirmed shows
    confirmedShows.forEach(show => {
      items.push({
        type: 'show',
        date: show.date,
        show
      });
    });

    // Add travel suggestions between shows
    suggestions.forEach(suggestion => {
      items.push({
        type: 'travel',
        date: suggestion.fromDate, // Use fromDate as the key date
        travel: suggestion
      });
    });

    // Sort by date
    items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return items;
  }, [confirmedShows, suggestions]);

  const next30Days = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  }, []);

  const getItemsForDate = (date: string) => {
    return timelineItems.filter(item => item.date === date);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const handleDragOver = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverDate(date);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if we're actually leaving the element (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverDate(null);
    }
  };

  const handleDrop = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    setDragOverDate(null);
    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.type === 'flight' && parsed.payload) {
          onFlightDrop?.(parsed.payload, date);
          setSuccessDate(date); // Show success feedback
        }
      }
    } catch (error) {
      console.error('Failed to parse dropped flight data:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('travel.timeline.title') || 'Travel Timeline'}</h3>
      <div className="space-y-2">
        {next30Days.map(date => {
          if (!date) return null;
          const items = getItemsForDate(date);
          const hasItems = items.length > 0;

          return (
            <div
              key={date}
              className={`flex items-center gap-3 p-3 rounded-lg glass hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200 ${dragOverDate === date
                  ? 'ring-2 ring-accent-400 bg-accent-500/10 shadow-lg scale-[1.02]'
                  : successDate === date
                    ? 'ring-2 ring-green-400 bg-green-500/10 shadow-lg animate-success-flash'
                    : ''
                }`}
              onDragOver={(e) => handleDragOver(e, date)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, date)}
            >
              <div className="text-sm font-medium w-20 flex-shrink-0 flex items-center gap-2">
                {formatDate(date)}
                {successDate === date && (
                  <span className="text-green-400 animate-bounce-subtle text-lg">✓</span>
                )}
              </div>
              <div className="flex-1">
                {hasItems ? (
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div key={idx} className={`p-2 rounded ${item.type === 'show'
                          ? 'bg-accent-500/20 border border-accent-400/30'
                          : 'bg-blue-500/20 border border-blue-400/30 cursor-pointer hover:bg-blue-500/30'
                        }`} onClick={item.type === 'travel' ? () => onGapClick?.(item.travel) : undefined}>
                        {item.type === 'show' ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{item.show.name || 'Show'}</div>
                              <div className="text-xs opacity-80">{item.show.city}, {item.show.country}</div>
                            </div>
                            <div className="text-xs opacity-70">{item.show.venue || 'TBD'}</div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">✈️ {t('travel.hub.needs_planning') || 'Travel Needed'}</div>
                              <div className="text-xs opacity-80">
                                {item.travel.originCity} → {item.travel.destinationCity}
                              </div>
                            </div>
                            <div className="text-xs opacity-70">
                              {item.travel.fromDate} → {item.travel.toDate}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs opacity-50 italic">
                    {t('travel.timeline.free_day') || 'Free day'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TravelTimeline;
