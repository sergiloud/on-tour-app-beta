import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Calendar, MapPin, DollarSign, Clock, CheckCircle2, AlertCircle, Plus, Search, X, RefreshCw } from 'lucide-react';
import { showStore } from '../../../../shared/showStore';
import { useSettings } from '../../../../context/SettingsContext';
import { AddShowModal } from '../modals/AddShowModal';
import { SkeletonScreen } from '../SkeletonScreen';
import type { Show } from '../../../../lib/shows';

type FilterType = 'all' | 'confirmed' | 'pending' | 'offer';

export const ShowsApp: React.FC = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
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
      setIsLoading(false);
    };
    
    // Initial load
    updateShows(showStore.getAll());
    
    // Subscribe to changes
    const unsubscribe = showStore.subscribe(updateShows);
    
    return unsubscribe;
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
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
  }, [pullY]);

    // Pull to refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
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
  }, [isRefreshing, handleRefresh, pullY]);

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

  // Status configuration - memoize to prevent recreating on every render
  const statusConfig = useMemo<Record<string, { icon: any; color: string; label: string }>>(() => ({
    confirmed: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Confirmed' },
    pending: { icon: Clock, color: 'text-amber-400', label: 'Pending' },
    offer: { icon: AlertCircle, color: 'text-blue-400', label: 'Offer' },
  }), []);

  const filters = useMemo<{ id: FilterType; label: string; count: number }[]>(() => [
    { id: 'all', label: 'All', count: shows.length },
    { id: 'confirmed', label: 'Confirmed', count: shows.filter(s => s.status === 'confirmed').length },
    { id: 'pending', label: 'Pending', count: shows.filter(s => s.status === 'pending').length },
    { id: 'offer', label: 'Offers', count: shows.filter(s => s.status === 'offer').length },
  ], [shows]);

  // Format date for display - memoize function
  const formatDate = useCallback((dateStr: string) => {
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
  }, []);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-black relative">
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

      {/* Header - Desktop Style */}
      <div className="sticky top-0 z-10 bg-gray-900/60 backdrop-blur-xl border-b border-white/10">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-sf-display text-ios-title1 font-bold text-white">Shows</h1>
              <p className="font-sf-text text-ios-caption1 text-white/50 mt-0.5">{shows.length} eventos totales</p>
            </div>
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
              }}
              className="w-9 h-9 rounded-lg bg-accent-500 hover:bg-accent-400 text-black flex items-center justify-center transition-colors shadow-glow"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Search Bar */}
                    {/* Search */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Buscar shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pl-10 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-transparent transition-all"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
            {filters.map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`px-3.5 py-1.5 rounded-md font-medium text-xs whitespace-nowrap transition-all ${
                  filter === id
                    ? 'bg-accent-500 text-black shadow-glow'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] ${filter === id ? 'bg-black/20' : 'bg-white/10'}`}>
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
        className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5"
        onTouchStart={handleTouchStart}
      >
        {isLoading ? (
          <SkeletonScreen variant="list" count={6} />
        ) : (
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
                <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-7 h-7 text-white/40" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5">
                  {searchQuery ? 'No shows found' : 'No shows yet'}
                </h3>
                <p className="text-xs text-white/50">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Add your first show to get started'}
                </p>
              </motion.div>
            ) : (
              filteredShows.map((show, index) => (
              <motion.button
                key={show.id}
                layoutId={`show-${show.id}`}
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
                className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all active:scale-98"
                style={{ willChange: 'transform, opacity' }}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate mb-1">
                      {show.name || 'Unnamed Show'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(show.date)}</span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-black/20 rounded-md">
                    {React.createElement(statusConfig[show.status]?.icon || AlertCircle, {
                      className: `w-3 h-3 ${statusConfig[show.status]?.color || 'text-white/40'}`,
                    })}
                    <span className={`text-xs font-medium ${statusConfig[show.status]?.color || 'text-white/40'}`}>
                      {statusConfig[show.status]?.label || show.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-white/70">
                    <MapPin className="w-3 h-3 text-white/40" />
                    <span className="truncate">
                      {[show.city, show.country].filter(Boolean).join(', ') || '—'}
                    </span>
                  </div>

                  {/* Fee */}
                  {show.fee && show.fee > 0 && (
                    <div className="flex items-center gap-1.5 text-white/70">
                      <DollarSign className="w-3 h-3 text-green-400" />
                      <span className="font-medium">{fmtMoney(show.fee)}</span>
                    </div>
                  )}
                </div>

                {/* Venue (if present) */}
                {show.venue && (
                  <div className="mt-2 text-xs text-white/50 truncate flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    {show.venue}
                  </div>
                )}
              </motion.button>
            ))
            )}
          </AnimatePresence>
        )}
      </div>

      {/* FAB - Quick Add */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="absolute bottom-20 right-5 w-12 h-12 bg-accent-500 text-black rounded-lg shadow-glow flex items-center justify-center z-20 touch-target instant-feedback fab-optimized"
        onClick={() => {
          setShowAddModal(true);
          if (navigator.vibrate) navigator.vibrate(10);
        }}
      >
        <Plus className="w-5 h-5" />
      </motion.button>

      {/* Add Show Modal */}
      <AddShowModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

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
              className="w-full bg-gray-900 rounded-t-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle Bar */}
              <div className="sticky top-0 z-10 pt-3 pb-4 px-5 bg-gray-900/95 backdrop-blur-xl border-b border-white/10">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-white mb-1 tracking-tight">
                      {selectedShow.name || 'Unnamed Show'}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(selectedShow.date)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedShow(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-white/40" />
                  </button>
                </div>
              </div>

              {/* Show Details */}
              <div className="p-5 space-y-3">
                {/* Status */}
                <div className="flex items-center gap-2">
                  {React.createElement(statusConfig[selectedShow.status]?.icon || AlertCircle, {
                    className: `w-4 h-4 ${statusConfig[selectedShow.status]?.color || 'text-white/40'}`,
                  })}
                  <span className={`text-sm font-semibold ${statusConfig[selectedShow.status]?.color || 'text-white/40'}`}>
                    {statusConfig[selectedShow.status]?.label || selectedShow.status}
                  </span>
                </div>

                {/* Location */}
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                  <div className="text-[10px] text-white/50 uppercase tracking-wider font-medium mb-1">Location</div>
                  <div className="text-sm text-white font-medium">
                    {[selectedShow.city, selectedShow.country].filter(Boolean).join(', ') || '—'}
                  </div>
                  {selectedShow.venue && (
                    <div className="text-xs text-white/70 mt-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-white/40" />
                      {selectedShow.venue}
                    </div>
                  )}
                </div>

                {/* Financial */}
                {selectedShow.fee && selectedShow.fee > 0 && (
                  <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="text-[10px] text-white/50 uppercase tracking-wider font-medium mb-1">Fee</div>
                    <div className="text-xl font-bold text-emerald-400">
                      {fmtMoney(selectedShow.fee)}
                    </div>
                  </div>
                )}

                {/* Promoter */}
                {selectedShow.promoter && (
                  <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="text-[10px] text-white/50 uppercase tracking-wider font-medium mb-1">Promoter</div>
                    <div className="text-sm text-white font-medium">
                      {selectedShow.promoter}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedShow.notes && (
                  <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="text-[10px] text-white/50 uppercase tracking-wider font-medium mb-1">Notes</div>
                    <div className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap">
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
