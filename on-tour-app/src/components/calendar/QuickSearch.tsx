import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../../lib/i18n';
import type { CalEvent } from './types';

type Props = {
  events: CalEvent[];
  onSelectEvent?: (event: CalEvent) => void;
  onClose?: () => void;
};

const QuickSearch: React.FC<Props> = ({ events, onSelectEvent, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredEvents = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    return events
      .filter(ev =>
        ev.title.toLowerCase().includes(q) ||
        (typeof ev.city === 'string' && ev.city.toLowerCase().includes(q))
      )
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 10); // Limit to 10 results
  }, [events, query]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSelect = (event: CalEvent) => {
    onSelectEvent?.(event);
    setIsOpen(false);
    setQuery('');
    onClose?.();
  };

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    onClose?.();
  };

  // Global keyboard listener for Cmd/Ctrl+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.08, y: -1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        className="px-2.5 md:px-3 py-1.5 md:py-1.5 rounded-lg bg-white/8 border border-white/15 hover:border-white/30 hover:bg-white/12 text-white/70 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
        title={`${t('calendar.search') || 'Search'} (Ctrl+F)`}
        aria-label={t('calendar.search') || 'Search events'}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline">{t('calendar.search') || 'Search'}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Search Box */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="relative glass rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md w-full max-w-2xl bg-gradient-to-br from-white/8 via-white/4 to-white/2"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
            >
              {/* Input */}
              <div className="relative px-5 md:px-6 pt-4 md:pt-5">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={t('calendar.search.placeholder') || 'Type to search shows, cities...'}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-white/40 text-lg font-medium focus:outline-none"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  {query && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setQuery('')}
                      className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white/60"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Results */}
              <motion.div
                className="max-h-96 overflow-y-auto p-2 md:p-3 border-t border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {query.trim() === '' ? (
                  <div className="text-center py-8 text-white/50">
                    <p className="text-sm">{t('calendar.search.placeholder') || 'Type to search shows, cities...'}</p>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-8 text-white/50">
                    <p className="text-sm">{t('calendar.search.noResults') || 'No events found'}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredEvents.map((event, idx) => (
                      <motion.button
                        key={`${event.id}-${event.date}`}
                        onClick={() => handleSelect(event)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="w-full text-left px-3 py-2 md:py-3 rounded-lg bg-white/8 hover:bg-white/12 border border-white/10 hover:border-white/20 transition-all group cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white group-hover:text-accent-100 truncate">
                              {event.title}
                              <span className="ml-2 text-xs text-white/50">
                                {event.kind === 'show' ? '🎤' : '✈️'}
                              </span>
                            </p>
                            <p className="text-xs text-white/50 mt-1">
                              {new Date(event.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          {event.status && (
                            <span
                              className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 font-medium ${
                                event.status === 'confirmed'
                                  ? 'bg-green-500/20 text-green-300'
                                  : event.status === 'cancelled'
                                    ? 'bg-red-500/20 text-red-300'
                                    : 'bg-yellow-500/20 text-yellow-300'
                              }`}
                            >
                              {event.status}
                            </span>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Footer */}
              <div className="px-5 md:px-6 py-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                <p>Found {filteredEvents.length} {filteredEvents.length === 1 ? 'result' : 'results'}</p>
                <p>
                  Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white/70 mx-1">Esc</kbd> to close
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuickSearch;
