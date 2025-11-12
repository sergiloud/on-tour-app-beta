import React, { useState } from 'react';
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

const MOCK_TRAVEL: TravelItem[] = [
  {
    id: '1',
    type: 'flight',
    title: 'Vuelo Barcelona - Madrid',
    from: 'BCN',
    to: 'MAD',
    date: new Date('2025-11-15T10:30:00'),
    time: '10:30',
    confirmation: 'ABC123',
    status: 'upcoming',
  },
  {
    id: '2',
    type: 'hotel',
    title: 'Hotel NH Collection Madrid',
    to: 'Madrid',
    date: new Date('2025-11-15T15:00:00'),
    time: '15:00 Check-in',
    confirmation: 'RES456',
    status: 'upcoming',
  },
  {
    id: '3',
    type: 'car',
    title: 'Alquiler de coche',
    to: 'Madrid',
    date: new Date('2025-11-16T09:00:00'),
    time: '09:00',
    confirmation: 'CAR789',
    status: 'upcoming',
  },
];

export const TravelApp: React.FC<AppComponentProps> = () => {
  const [travels, setTravels] = useState<TravelItem[]>(MOCK_TRAVEL);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [selectedTravel, setSelectedTravel] = useState<TravelItem | null>(null);

  const { isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  });

  const getTypeIcon = (type: TravelItem['type']) => {
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
  };

  const getTypeColor = (type: TravelItem['type']) => {
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
  };

  const filteredTravels = travels.filter(t => t.status === activeTab);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  return (
    <div className="h-full overflow-y-auto bg-ink-950">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Viajes</h1>
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
            onClick={() => setActiveTab('upcoming')}
            className={`
              flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all
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
            onClick={() => setActiveTab('completed')}
            className={`
              flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all
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
      <div className="px-6 pb-6 space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTravels.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTravel(travel)}
                  className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center ring-1 ${colors.ring}`}>
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
              className="fixed inset-x-4 bottom-4 z-[110] bg-ink-900/95 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">{selectedTravel.title}</h2>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedTravel(null)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                  >
                    <span className="text-white text-lg">×</span>
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {selectedTravel.from && selectedTravel.to && (
                    <div>
                      <div className="text-white/50 text-xs mb-2 uppercase tracking-wide">Ruta</div>
                      <div className="flex items-center gap-3 text-white">
                        <span className="text-2xl font-bold">{selectedTravel.from}</span>
                        <ChevronRight className="w-5 h-5 text-white/50" />
                        <span className="text-2xl font-bold">{selectedTravel.to}</span>
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
                    className="flex-1 py-3 bg-accent-500 text-black font-semibold rounded-xl"
                  >
                    Ver detalles
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl"
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