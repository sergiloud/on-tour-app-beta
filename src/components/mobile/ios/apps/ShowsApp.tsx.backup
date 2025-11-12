import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Calendar, MapPin, DollarSign, Clock, CheckCircle2, AlertCircle, Plus, Search, X, RefreshCw } from 'lucide-react';
import { showStore } from '../../../../shared/showStore';
import { useSettings } from '../../../../context/SettingsContext';
import type { Show } from '../../../../lib/shows';

type FilterType = 'all' | 'confirmed' | 'pending' | 'offer';

export const ShowsApp: React.FC = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { fmtMoney } = useSettings();
  
  // Pull to refresh
  const scrollRef = useRef<HTMLDivElement>(null);
  const pullY = useMotionValue(0);
  const pullProgress = useTransform(pullY, [0, 80], [0, 1]);
  const pullRotate = useTransform(pullY, [0, 80], [0, 360]);

  // Subscribe to showStore
  React.useEffect(() => {
    const updateShows = (newShows: Show[]) => {
      setShows(newShows);
    };
    
    // Initial load
    updateShows(showStore.getAll());
    
    // Subscribe to changes
    const unsubscribe = showStore.subscribe(updateShows);
    
    return unsubscribe;
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    // Simulate refresh delay (in real app, this would refetch data)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Reload shows from store
    setShows(showStore.getAll());
    
    setIsRefreshing(false);
    pullY.set(0);
  };

    // Pull to refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollTop = scrollRef.current?.scrollTop || 0;
    if (scrollTop === 0) {
      const touch = e.touches[0];
      if (!touch) return;
      
      const startY = touch.clientY;
      
      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (!touch) return;
        
        const deltaY = Math.max(0, touch.clientY - startY);
        pullY.set(Math.min(deltaY, 100));
      };
      
      const handleTouchEnd = () => {
        if (pullY.get() > 80 && !isRefreshing) {
          handleRefresh();
        } else {
          pullY.set(0);
        }
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
      
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
  };

  // Filter and search shows
  const filteredShows = useMemo(() => {
    let result = shows;

    // Filter by status
    if (filter !== 'all') {
      result = result.filter(show => show.status === filter);
    }

    // Search by name, city, venue
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(show => 
        show.name?.toLowerCase().includes(query) ||
        show.city?.toLowerCase().includes(query) ||
        show.venue?.toLowerCase().includes(query) ||
        show.country?.toLowerCase().includes(query)
      );
    }

    // Sort by date (upcoming first)
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [shows, filter, searchQuery]);

  // Status configuration
  const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
    confirmed: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Confirmed' },
    pending: { icon: Clock, color: 'text-amber-400', label: 'Pending' },
    offer: { icon: AlertCircle, color: 'text-blue-400', label: 'Offer' },
  };

  const filters: { id: FilterType; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: shows.length },
    { id: 'confirmed', label: 'Confirmed', count: shows.filter(s => s.status === 'confirmed').length },
    { id: 'pending', label: 'Pending', count: shows.filter(s => s.status === 'pending').length },
    { id: 'offer', label: 'Offers', count: shows.filter(s => s.status === 'offer').length },
  ];

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formatted = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    }).format(date);

    if (diffDays === 0) return `Today • ${formatted}`;
    if (diffDays === 1) return `Tomorrow • ${formatted}`;
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays}d • ${formatted}`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)}d ago • ${formatted}`;
    
    return formatted;
  };

  return (
    <div className="h-full flex flex-col bg-dark-900 relative">
      {/* Pull to Refresh Indicator */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center"
        style={{ y: pullY }}
      >
        <motion.div
          className="w-10 h-10 rounded-full bg-accent-500/20 backdrop-blur-md flex items-center justify-center"
          style={{ 
            opacity: pullProgress,
            scale: pullProgress
          }}
        >
          <motion.div style={{ rotate: pullRotate }}>
            <RefreshCw 
              className={`w-5 h-5 ${isRefreshing ? 'text-accent-500 animate-spin' : 'text-accent-500'}`}
              strokeWidth={2.5}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-900/95 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-2xl font-bold text-white mb-4">Shows</h1>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shows..."
              className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-accent-500/50 focus:bg-white/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
            {filters.map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  filter === id
                    ? 'bg-accent-500 text-black'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`ml-1.5 ${filter === id ? 'opacity-70' : 'opacity-50'}`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shows List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        onTouchStart={handleTouchStart}
      >
        <AnimatePresence mode="popLayout">
          {filteredShows.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {searchQuery ? 'No shows found' : 'No shows yet'}
              </h3>
              <p className="text-sm text-slate-400">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Add your first show to get started'}
              </p>
            </motion.div>
          ) : (
            filteredShows.map((show, index) => (
              <motion.button
                key={show.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  layout: { type: 'spring', stiffness: 500, damping: 35 },
                  opacity: { duration: 0.15 },
                  y: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
                  delay: index * 0.015,
                }}
                onClick={() => setSelectedShow(show)}
                className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-98"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate mb-1">
                      {show.name || 'Unnamed Show'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(show.date)}</span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-black/20 rounded-full">
                    {React.createElement(statusConfig[show.status]?.icon || AlertCircle, {
                      className: `w-3 h-3 ${statusConfig[show.status]?.color || 'text-slate-400'}`,
                    })}
                    <span className={`text-xs font-medium ${statusConfig[show.status]?.color || 'text-slate-400'}`}>
                      {statusConfig[show.status]?.label || show.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">
                      {[show.city, show.country].filter(Boolean).join(', ') || '—'}
                    </span>
                  </div>

                  {/* Fee */}
                  {show.fee && show.fee > 0 && (
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <DollarSign className="w-3.5 h-3.5 text-green-400" />
                      <span className="font-medium">{fmtMoney(show.fee)}</span>
                    </div>
                  )}
                </div>

                {/* Venue (if present) */}
                {show.venue && (
                  <div className="mt-2 text-xs text-slate-400 truncate flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    {show.venue}
                  </div>
                )}
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* FAB - Quick Add */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute bottom-20 right-4 w-14 h-14 bg-accent-500 text-black rounded-full shadow-2xl shadow-accent-500/50 flex items-center justify-center z-20"
        onClick={() => {
          // TODO: Open add show modal
          if (navigator.vibrate) navigator.vibrate(10);
        }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Show Detail Modal */}
      <AnimatePresence>
        {selectedShow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-end"
            onClick={() => setSelectedShow(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              className="w-full bg-dark-800 rounded-t-3xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle Bar */}
              <div className="sticky top-0 z-10 pt-3 pb-4 px-4 bg-dark-800 border-b border-white/10">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white mb-1">
                      {selectedShow.name || 'Unnamed Show'}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedShow.date)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedShow(null)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Show Details */}
              <div className="p-6 space-y-4">
                {/* Status */}
                <div className="flex items-center gap-2">
                  {React.createElement(statusConfig[selectedShow.status]?.icon || AlertCircle, {
                    className: `w-5 h-5 ${statusConfig[selectedShow.status]?.color || 'text-slate-400'}`,
                  })}
                  <span className={`text-lg font-medium ${statusConfig[selectedShow.status]?.color || 'text-slate-400'}`}>
                    {statusConfig[selectedShow.status]?.label || selectedShow.status}
                  </span>
                </div>

                {/* Location */}
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="text-xs text-slate-400 mb-1">Location</div>
                  <div className="text-white font-medium">
                    {[selectedShow.city, selectedShow.country].filter(Boolean).join(', ') || '—'}
                  </div>
                  {selectedShow.venue && (
                    <div className="text-sm text-slate-300 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedShow.venue}
                    </div>
                  )}
                </div>

                {/* Financial */}
                {selectedShow.fee && selectedShow.fee > 0 && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-xs text-slate-400 mb-1">Fee</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {fmtMoney(selectedShow.fee)}
                    </div>
                  </div>
                )}

                {/* Promoter */}
                {selectedShow.promoter && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-xs text-slate-400 mb-1">Promoter</div>
                    <div className="text-white font-medium">
                      {selectedShow.promoter}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedShow.notes && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-xs text-slate-400 mb-1">Notes</div>
                    <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedShow.notes}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
