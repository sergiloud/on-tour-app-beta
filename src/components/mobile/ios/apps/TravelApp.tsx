import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Clock,
  Plus,
  Hotel,
  Car,
  Train,
  Ship,
  ChevronRight,
  Navigation
} from 'lucide-react';
import type { AppComponentProps } from '../../../../types/mobileOS';
import { usePullToRefresh } from '../../../../hooks/usePullToRefresh';
import { fetchItineraries, type Itinerary } from '../../../../services/travelApi';
import { logger } from '../../../../lib/logger';

interface TravelItem {
  id: string;
  type: 'flight' | 'hotel' | 'car' | 'train' | 'other';
  title: string;
  from?: string;
  to?: string;
  date: Date;
  time?: string;
  confirmation?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

// Convert Itinerary to TravelItem
function itineraryToTravelItem(it: Itinerary): TravelItem {
  const now = new Date();
  const itemDate = new Date(it.date);
  const status: 'upcoming' | 'completed' | 'cancelled' = 
    it.status === 'cancelled' ? 'cancelled' :
    itemDate > now ? 'upcoming' : 'completed';

  // Map btnType to travel type
  const type = it.btnType === 'travel' ? 
    (it.departure && it.destination ? 'flight' : 'other') :
    it.btnType === 'other' ? 'other' : 'other';

  return {
    id: it.id,
    type,
    title: it.title,
    from: it.departure,
    to: it.destination || it.city,
    date: itemDate,
    time: it.startTime ? new Date(it.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : undefined,
    confirmation: it.description,
    status
  };
}

export const TravelApp: React.FC<AppComponentProps> = () => {
  const [travels, setTravels] = useState<TravelItem[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [selectedTravel, setSelectedTravel] = useState<TravelItem | null>(null);

  // Load real travel data from travelApi
  const loadTravelData = useCallback(async () => {
    try {
      const itineraries = await fetchItineraries({});
      const items = itineraries
        .filter(it => it.btnType === 'travel') // Only travel items
        .map(itineraryToTravelItem);
      setTravels(items);
    } catch (error) {
      logger.error('Error loading travel data', error instanceof Error ? error : new Error(String(error)), {
        component: 'TravelApp',
        action: 'loadTravelData'
      });
      setTravels([]);
    }
  }, []);

  useEffect(() => {
    loadTravelData();
  }, [loadTravelData]);

  const { isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      await loadTravelData();
    },
  });

  // Memoize icon getter
  const getTypeIcon = useCallback((type: TravelItem['type']) => {
    switch (type) {
      case 'flight':
        return Plane;
      case 'hotel':
        return Hotel;
      case 'car':
        return Car;
      case 'train':
        return Train;
      default:
        return Ship;
    }
  }, []);

  // Memoize color getter
  const getTypeColor = useCallback((type: TravelItem['type']) => {
    switch (type) {
      case 'flight':
        return { bg: 'bg-blue-500/20', icon: 'text-blue-400', ring: 'ring-blue-500/30' };
      case 'hotel':
        return { bg: 'bg-purple-500/20', icon: 'text-purple-400', ring: 'ring-purple-500/30' };
      case 'car':
        return { bg: 'bg-green-500/20', icon: 'text-green-400', ring: 'ring-green-500/30' };
      case 'train':
        return { bg: 'bg-orange-500/20', icon: 'text-orange-400', ring: 'ring-orange-500/30' };
      default:
        return { bg: 'bg-cyan-500/20', icon: 'text-cyan-400', ring: 'ring-cyan-500/30' };
    }
  }, []);

  // Memoize filtered travels
  const filteredTravels = useMemo(() => 
    travels.filter(t => t.status === activeTab),
    [travels, activeTab]
  );

  // Memoize date formatter
  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date);
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-ink-950">
      {/* Header - Desktop Style */}
      <div className="sticky top-0 z-10 bg-gray-900/60 backdrop-blur-xl border-b border-white/10 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Viajes</h1>
            <p className="text-white/50 text-sm">Gestiona tus desplazamientos</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center shadow-lg shadow-accent-500/30"
          >
            <Plus className="w-5 h-5 text-black" strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
            onClick={() => setActiveTab('upcoming')}
            className={`
              flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all touch-optimized
              ${activeTab === 'upcoming'
                ? 'bg-accent-500 text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
              }
            `}
          >
            Próximos ({travels.filter(t => t.status === 'upcoming').length})
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
            onClick={() => setActiveTab('completed')}
            className={`
              flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all touch-optimized
              ${activeTab === 'completed'
                ? 'bg-accent-500 text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
              }
            `}
          >
            Completados ({travels.filter(t => t.status === 'completed').length})
          </motion.button>
        </div>
      </div>

      {/* Pull to refresh indicator */}
      {isRefreshing && (
        <div className="flex justify-center py-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-accent-500 border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Travel List */}
      <div className="px-5 pb-6 space-y-2.5 smooth-scroll">
        <AnimatePresence mode="popLayout">
          {filteredTravels.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="text-center py-12"
            >
              <Navigation className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 text-sm">
                No hay viajes {activeTab === 'upcoming' ? 'próximos' : 'completados'}
              </p>
            </motion.div>
          ) : (
            filteredTravels.map((travel, index) => {
              const Icon = getTypeIcon(travel.type);
              const colors = getTypeColor(travel.type);

              return (
                <motion.div
                  key={travel.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{
                    delay: Math.min(index * 0.03, 0.15),
                    duration: 0.2,
                    ease: 'easeOut',
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTravel(travel)}
                  className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden cursor-pointer hover:bg-white/10 transition-colors card-list-item touch-optimized"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center ring-1 ${colors.ring}`}>
                        <Icon className={`w-6 h-6 ${colors.icon}`} strokeWidth={2} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-base mb-1 truncate">
                          {travel.title}
                        </h3>

                        {/* Route */}
                        {travel.from && travel.to && (
                          <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
                            <span className="font-medium">{travel.from}</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="font-medium">{travel.to}</span>
                          </div>
                        )}

                        {/* Date & Time */}
                        <div className="flex items-center gap-3 text-white/50 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(travel.date)}</span>
                          </div>
                          {travel.time && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{travel.time}</span>
                            </div>
                          )}
                        </div>

                        {/* Confirmation */}
                        {travel.confirmation && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg">
                            <span className="text-[10px] text-white/40 uppercase tracking-wide">Conf:</span>
                            <span className="text-xs text-white/70 font-mono">{travel.confirmation}</span>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-white/30 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Travel Detail Modal */}
      <AnimatePresence>
        {selectedTravel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTravel(null)}
              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-x-4 bottom-4 z-[110] bg-ink-900/95 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-white">{selectedTravel.title}</h2>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedTravel(null)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                  >
                    <span className="text-white text-lg">×</span>
                  </motion.button>
                </div>

                <div className="space-y-3">
                  {selectedTravel.from && selectedTravel.to && (
                    <div>
                      <div className="text-white/50 text-xs mb-2 uppercase tracking-wide">Ruta</div>
                      <div className="flex items-center gap-3 text-white">
                        <span className="text-xl font-bold">{selectedTravel.from}</span>
                        <ChevronRight className="w-5 h-5 text-white/50" />
                        <span className="text-xl font-bold">{selectedTravel.to}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-white/50 text-xs mb-2 uppercase tracking-wide">Fecha y hora</div>
                    <div className="text-white text-lg">
                      {formatDate(selectedTravel.date)} • {selectedTravel.time}
                    </div>
                  </div>

                  {selectedTravel.confirmation && (
                    <div>
                      <div className="text-white/50 text-xs mb-2 uppercase tracking-wide">Confirmación</div>
                      <div className="text-white text-lg font-mono">{selectedTravel.confirmation}</div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2.5 bg-accent-500 text-black font-semibold rounded-lg"
                  >
                    Ver detalles
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2.5 bg-white/10 text-white font-semibold rounded-lg text-sm"
                  >
                    Editar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};