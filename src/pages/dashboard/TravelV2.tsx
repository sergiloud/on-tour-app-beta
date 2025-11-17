import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Plus, Search, Calendar, MapPin, Clock, TrendingUp, Filter, ExternalLink, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { trackPageView } from '../../lib/activityTracker';
import { listTrips, onTripsChanged, type Trip, type Segment } from '../../services/trips';
import { AIRPORTS } from '../../lib/airports';
import { AddFlightModal } from '../../components/travel/AddFlightModal';
import { FlightSearchModal } from '../../components/travel/FlightSearchModal';
import { useDebounce } from '../../lib/performance';
import { slideUp, fadeIn, staggerFast } from '../../lib/animations';
import { t } from '../../lib/i18n';

interface Flight {
  id: string;
  origin: string;
  dest: string;
  originName: string;
  destName: string;
  depDate: string;
  depTime: string;
  arrDate: string;
  arrTime: string;
  carrier: string;
  flightNumber: string;
  duration: string;
  status: 'upcoming' | 'departed' | 'landed' | 'cancelled';
  bookingRef?: string;
  seat?: string;
  gate?: string;
  terminal?: string;
  price?: number;
  currency?: string;
  tripTitle?: string;
}

function segmentToFlight(segment: Segment, tripTitle: string): Flight | null {
  if (segment.type !== 'flight') return null;
  if (!segment.from || !segment.to || !segment.dep) return null;

  const fromAirport = (AIRPORTS as any)[segment.from.toUpperCase()];
  const toAirport = (AIRPORTS as any)[segment.to.toUpperCase()];

  const depDate = segment.dep.split('T')[0] || '';
  const depTime = segment.dep.split('T')[1]?.substring(0, 5) || '';
  const arrDate = segment.arr?.split('T')[0] || depDate;
  const arrTime = segment.arr?.split('T')[1]?.substring(0, 5) || '';

  let duration = '0h 0m';
  if (segment.arr) {
    const depDateTime = new Date(segment.dep);
    const arrDateTime = new Date(segment.arr);
    const diffMs = arrDateTime.getTime() - depDateTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    duration = `${hours}h ${mins}m`;
  }

  const now = new Date();
  const depDateTime = new Date(segment.dep);
  let status: Flight['status'] = 'upcoming';
  if (depDateTime < now) {
    status = 'departed';
    if (segment.arr && new Date(segment.arr) < now) {
      status = 'landed';
    }
  }

  return {
    id: `${segment.from}-${segment.to}-${depDate}-${tripTitle}`,
    origin: segment.from.toUpperCase(),
    dest: segment.to.toUpperCase(),
    originName: fromAirport?.city || segment.from,
    destName: toAirport?.city || segment.to,
    depDate,
    depTime,
    arrDate: arrDate || depDate,
    arrTime,
    carrier: (segment as any).airline || 'Unknown',
    flightNumber: (segment as any).flightNum || '',
    duration,
    status,
    tripTitle,
  };
}

// Helper function to render status badges
const getStatusBadge = (status: Flight['status']) => {
  const badges = {
    upcoming: 'px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20',
    departed: 'px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20',
    landed: 'px-2 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20',
    cancelled: 'px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20',
  };
  const labels = {
    upcoming: t('travel.flight_card.upcoming') || 'Upcoming',
    departed: t('travel.flight_card.departed') || 'In Flight',
    landed: t('travel.flight_card.landed') || 'Landed',
    cancelled: t('travel.flight_card.cancelled') || 'Cancelled',
  };
  return <span className={badges[status]}>{labels[status]}</span>;
};

// Memoized Flight Card component to avoid re-renders
const FlightCard = React.memo<{ flight: Flight; onShare: (flight: Flight) => void }>(({ flight, onShare }) => {
  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className="glass rounded-lg border border-theme p-5 hover:border-white/15 transition-all group"
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center border border-white/5">
            <Plane className="w-4.5 h-4.5 text-slate-500 dark:text-white/70" />
          </div>
          <div>
            <p className="text-slate-900 dark:text-white font-semibold tracking-tight">{flight.carrier} {flight.flightNumber}</p>
            {flight.tripTitle && (
              <p className="text-slate-400 dark:text-white/40 text-xs mt-0.5">{flight.tripTitle}</p>
            )}
          </div>
        </div>
        {getStatusBadge(flight.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 dark:text-white/40 text-[10px] uppercase tracking-wider font-medium">
            <MapPin className="w-3 h-3" />
            <span>Salida</span>
          </div>
          <p className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">{flight.origin}</p>
          <p className="text-slate-400 dark:text-white/60 text-sm">{flight.originName}</p>
          <div className="flex items-center gap-2 text-slate-400 dark:text-white/40 text-xs">
            <Clock className="w-3 h-3" />
            <span>{flight.depDate} {flight.depTime}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <div className="w-full h-[1px] bg-gradient-to-r from-slate-100 dark:from-white/5 via-slate-300 dark:via-white/20 to-slate-50 dark:to-white/5 relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/40 rounded-full" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 dark:text-white/40 text-[10px] uppercase tracking-wider font-medium">
            <MapPin className="w-3 h-3" />
            <span>Llegada</span>
          </div>
          <p className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">{flight.dest}</p>
          <p className="text-slate-400 dark:text-white/60 text-sm">{flight.destName}</p>
          <div className="flex items-center gap-2 text-slate-400 dark:text-white/40 text-xs">
            <Clock className="w-3 h-3" />
            <span>{flight.arrDate} {flight.arrTime}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-theme flex items-center gap-6 text-xs text-slate-300 dark:text-white/40">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          <span>{flight.duration}</span>
        </div>
        {flight.price && (
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{flight.price} {flight.currency || 'EUR'}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onShare(flight)}
          className="px-3 py-1.5 rounded-lg bg-interactive text-slate-400 dark:text-white/60 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:text-slate-600 dark:text-white/80 text-xs transition-all flex items-center gap-2 border border-theme"
        >
          <Share2 className="w-3 h-3" />
          Compartir
        </motion.button>
      </div>
    </motion.div>
  );
});
FlightCard.displayName = 'FlightCard';

const TravelV2: React.FC = () => {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState<'flights' | 'search' | 'timeline'>('flights');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchQueryInput, setSearchQueryInput] = useState({ origin: '', dest: '', date: '' });
  const searchQuery = useDebounce(searchQueryInput, 300);
  const [showAddFlightModal, setShowAddFlightModal] = useState(false);
  const [showSearchFlightModal, setShowSearchFlightModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'departed' | 'landed'>('all');

  useEffect(() => {
    setTrips(listTrips());
    const unsub = onTripsChanged(() => {
      setTrips(listTrips());
    });
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    trackPageView('travel-v2');
  }, [userId]);

  const allFlights = useMemo(() => {
    const flights: Flight[] = [];
    for (const trip of trips) {
      for (const segment of trip.segments || []) {
        const flight = segmentToFlight(segment, trip.title);
        if (flight) flights.push(flight);
      }
    }
    return flights;
  }, [trips]);

  const filteredFlights = useMemo(() => {
    let filtered = allFlights;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(f => f.status === filterStatus);
    }
    return filtered.sort((a, b) => new Date(a.depDate).getTime() - new Date(b.depDate).getTime());
  }, [allFlights, filterStatus]);

  const upcomingFlights = useMemo(() => {
    return allFlights
      .filter(f => f.status === 'upcoming')
      .sort((a, b) => new Date(a.depDate).getTime() - new Date(b.depDate).getTime());
  }, [allFlights]);

  const stats = useMemo(() => ({
    total: allFlights.length,
    upcoming: allFlights.filter(f => f.status === 'upcoming').length,
    landed: allFlights.filter(f => f.status === 'landed').length,
    totalDistance: allFlights.length * 1000,
  }), [allFlights]);

  const handleSkyscannerSearch = () => {
    if (!searchQuery.origin || !searchQuery.dest) return;
    const origin = searchQuery.origin.toUpperCase();
    const dest = searchQuery.dest.toUpperCase();
    const date = searchQuery.date.replace(/-/g, '');
    const url = `https://www.skyscanner.com/transport/flights/${origin}/${dest}/${date}/?adultsv2=1&cabinclass=economy&childrenv2=&inboundaltsenabled=false&outboundaltsenabled=false&preferdirects=false&ref=home&rtn=0`;
    window.open(url, '_blank');
  };

  const handleShareFlight = (flight: Flight) => {
    const text = `Flight: ${flight.carrier} ${flight.flightNumber}\n${flight.origin} → ${flight.dest}\nDeparture: ${flight.depDate} ${flight.depTime}\nArrival: ${flight.arrDate} ${flight.arrTime}`;
    if (navigator.share) {
      navigator.share({ title: 'Flight Details', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const renderFlights = () => (
    <motion.div variants={staggerFast} initial="initial" animate="animate" className="space-y-5">
      {/* Stats Cards - Diseño más serio y compacto */}
      <motion.div variants={slideUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-lg border border-theme p-5 hover:border-white/15 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center">
                <Plane className="w-4.5 h-4.5 text-slate-500 dark:text-white/70" />
              </div>
              <div>
                <div className="text-2xl font-semibold tracking-tight text-theme-primary">{stats.total}</div>
                <div className="text-xs text-slate-400 dark:text-white/40 tracking-wide uppercase">{t('travel.stats.totalFlights')}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-lg border border-theme p-5 hover:border-white/15 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600/20 to-blue-700/20 flex items-center justify-center border border-blue-500/20">
                <Calendar className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-semibold tracking-tight text-theme-primary">{stats.upcoming}</div>
                <div className="text-xs text-slate-400 dark:text-white/40 tracking-wide uppercase">{t('travel.stats.upcoming')}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-lg border border-theme p-5 hover:border-white/15 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center">
                <TrendingUp className="w-4.5 h-4.5 text-slate-500 dark:text-white/70" />
              </div>
              <div>
                <div className="text-2xl font-semibold tracking-tight text-theme-primary">{(stats.totalDistance / 1000).toFixed(0)}k</div>
                <div className="text-xs text-slate-400 dark:text-white/40 tracking-wide uppercase">{t('travel.stats.totalKm')}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters Bar - Diseño más profesional */}
      <motion.div variants={slideUp} className="glass rounded-lg border border-theme p-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-300 dark:text-white/40" />
            <span className="text-xs text-slate-400 dark:text-white/40 tracking-wide uppercase font-medium">Estado</span>
          </div>
          {(['all', 'upcoming', 'departed', 'landed'] as const).map((status) => {
            const labels = {
              all: t('travel.filter.all'),
              upcoming: t('travel.filter.upcoming'),
              departed: t('travel.filter.departed'),
              landed: t('travel.filter.landed'),
            };
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-slate-200 dark:bg-white/10 text-white border border-white/20'
                    : 'text-slate-300 dark:text-white/50 hover:text-slate-500 dark:text-white/70 hover:bg-interactive border border-transparent'
                }`}
              >
                {labels[status]}
              </button>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {filteredFlights.length === 0 ? (
          <motion.div
            key="empty"
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="glass rounded-lg border border-theme p-12 text-center"
          >
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-slate-700/30 to-slate-800/30 flex items-center justify-center mx-auto mb-4 border border-white/5">
              <Plane className="w-7 h-7 text-slate-300 dark:text-white/40" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">{t('travel.empty.title')}</h3>
            <p className="text-slate-400 dark:text-white/40 text-sm mb-6">
              {filterStatus !== 'all'
                ? t('travel.empty.subtitle.filtered')
                : t('travel.empty.subtitle.all')
              }
            </p>
            {filterStatus === 'all' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddFlightModal(true)}
                className="px-5 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-white font-medium hover:bg-slate-300 dark:bg-white/15 transition-all inline-flex items-center gap-2 border border-theme"
              >
                <Plus className="w-4 h-4" />
                {t('travel.empty.cta')}
              </motion.button>
            )}
          </motion.div>
        ) : (
          filteredFlights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} onShare={handleShareFlight} />
          ))
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderSearch = () => (
    <motion.div variants={staggerFast} initial="initial" animate="animate" className="space-y-5">
      <motion.div variants={slideUp} className="glass rounded-lg border border-theme p-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-5 tracking-tight">{t('travel.search.title')}</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="block text-xs text-slate-400 dark:text-white/40 mb-2 uppercase tracking-wide font-medium">{t('travel.search.origin')}</label>
            <input
              type="text"
              value={searchQueryInput.origin}
              onChange={(e) => setSearchQueryInput(prev => ({ ...prev, origin: e.target.value }))}
              placeholder="BCN, MAD..."
              className="w-full px-3.5 py-2.5 bg-interactive border border-theme rounded-lg text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 focus:outline-none focus:border-slate-300 dark:border-white/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 dark:text-white/40 mb-2 uppercase tracking-wide font-medium">{t('travel.search.destination')}</label>
            <input
              type="text"
              value={searchQueryInput.dest}
              onChange={(e) => setSearchQueryInput(prev => ({ ...prev, dest: e.target.value }))}
              placeholder="LON, PAR..."
              className="w-full px-3.5 py-2.5 bg-interactive border border-theme rounded-lg text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 focus:outline-none focus:border-slate-300 dark:border-white/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 dark:text-white/40 mb-2 uppercase tracking-wide font-medium">{t('travel.search.departure_date')}</label>
            <input
              type="date"
              value={searchQueryInput.date}
              onChange={(e) => setSearchQueryInput(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-interactive border border-theme rounded-lg text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 focus:outline-none focus:border-slate-300 dark:border-white/20 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSkyscannerSearch}
            disabled={!searchQuery.origin || !searchQuery.dest}
            className="px-4 py-2.5 rounded-lg bg-purple-600/20 text-purple-300 font-medium hover:bg-purple-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 border border-purple-500/20 text-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {t('travel.search.skyscanner')}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowSearchFlightModal(true)}
            className="px-4 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-white font-medium hover:bg-slate-300 dark:bg-white/15 transition-all flex items-center gap-2 border border-theme text-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('travel.search.advanced')}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderTimeline = () => (
    <motion.div variants={staggerFast} initial="initial" animate="animate" className="space-y-5">
      <motion.div variants={slideUp} className="glass rounded-lg border border-theme p-10 text-center">
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-slate-700/30 to-slate-800/30 flex items-center justify-center mx-auto mb-4 border border-white/5">
          <Calendar className="w-7 h-7 text-slate-300 dark:text-white/40" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">{t('travel.timeline') || 'Travel Timeline'}</h3>
        <p className="text-slate-400 dark:text-white/40 text-sm">{t('travel.timeline.subtitle') || 'Chronological view of your upcoming flights'}</p>
      </motion.div>

      <div className="space-y-3">
        {upcomingFlights.slice(0, 5).map((flight) => (
          <motion.div
            key={flight.id}
            variants={fadeIn}
            className="glass rounded-lg border border-theme p-4 hover:border-white/15 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="text-center min-w-[56px]">
                <p className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">{flight.depDate.split('-')[2]}</p>
                <p className="text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-wider">{flight.depDate.split('-')[1]}</p>
              </div>

              <div className="h-10 w-[1px] bg-gradient-to-b from-slate-100 dark:from-white/5 via-slate-300 dark:via-white/20 to-white/5" />

              <div className="flex-1">
                <p className="text-slate-900 dark:text-white font-semibold text-sm tracking-tight">{flight.carrier} {flight.flightNumber}</p>
                <p className="text-xs text-slate-300 dark:text-white/50">{flight.origin} → {flight.dest}</p>
              </div>

              <div className="text-right">
                <p className="text-slate-900 dark:text-white font-medium text-sm">{flight.depTime}</p>
                <p className="text-xs text-slate-300 dark:text-white/40">{flight.duration}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <>
      <AddFlightModal
        isOpen={showAddFlightModal}
        onClose={() => setShowAddFlightModal(false)}
      />

      <FlightSearchModal
        isOpen={showSearchFlightModal}
        onClose={() => setShowSearchFlightModal(false)}
      />

      <div className="min-h-screen p-4 md:p-6 ml-2 md:ml-3">
        <motion.div
          className="max-w-[1400px] mx-auto space-y-5"
          variants={staggerFast}
          initial="initial"
          animate="animate"
        >
          {/* Header - Diseño más serio */}
          <motion.div variants={slideUp} className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-theme flex items-center justify-center flex-shrink-0">
                <Plane className="w-5 h-5 text-slate-500 dark:text-white/70" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-1 tracking-tight">{t('nav.travel')}</h1>
                <p className="text-slate-400 dark:text-white/40 text-xs tracking-wide">{t('travel.subtitle') || 'Manage your flights and trips'}</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowAddFlightModal(true)}
              className="px-4 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-white font-medium hover:bg-slate-300 dark:bg-white/15 transition-all flex items-center gap-2 border border-theme text-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('travel.addFlight') || 'Add Flight'}
            </motion.button>
          </motion.div>

          {/* Tabs - Diseño más compacto */}
          <motion.div variants={slideUp} className="flex items-center gap-1.5 border-b border-theme pb-1">
            {(['flights', 'search', 'timeline'] as const).map((tab) => {
              const icons = {
                flights: Plane,
                search: Search,
                timeline: Calendar,
              };
              const labels = {
                flights: t('travel.tabs.flights'),
                search: t('travel.tabs.search'),
                timeline: t('travel.tabs.timeline'),
              };
              const Icon = icons[tab];

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                    activeTab === tab
                      ? 'bg-slate-200 dark:bg-white/10 text-white border border-white/20'
                      : 'text-slate-300 dark:text-white/50 hover:text-slate-500 dark:text-white/70 hover:bg-interactive border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {labels[tab]}
                </button>
              );
            })}
          </motion.div>

          {activeTab === 'flights' && renderFlights()}
          {activeTab === 'search' && renderSearch()}
          {activeTab === 'timeline' && renderTimeline()}
        </motion.div>
      </div>
    </>
  );
};

export default TravelV2;
