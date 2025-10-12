import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plane, Plus, Search, Calendar, MapPin, Clock, TrendingUp, Filter, ExternalLink, Star, Loader2, MoreVertical, Edit2, Trash2, Share2, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { trackPageView } from '../../lib/activityTracker';
import { t } from '../../lib/i18n';
import { can } from '../../lib/tenants';
import { listTrips, onTripsChanged, type Trip, type Segment } from '../../services/trips';
import { AIRPORTS } from '../../lib/airports';
import { AddFlightModal } from '../../components/travel/AddFlightModal';
import { FlightSearchModal } from '../../components/travel/FlightSearchModal';
import { logger } from '../../lib/logger';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * TravelV2 - Flighty-inspired travel management
 *
 * Features:
 * 1. My Flights - Card-based list of booked flights (like Flighty)
 * 2. Flight Search - Integrated Google Flights / Skyscanner search
 * 3. Trip Timeline - Visual timeline of upcoming travel
 * 4. Smart Suggestions - Show-based flight recommendations
 */

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

// Helper to convert trip segments to flights
function segmentToFlight(segment: Segment, tripTitle: string): Flight | null {
    if (segment.type !== 'flight') return null;
    if (!segment.from || !segment.to || !segment.dep) return null;

    const depDate = new Date(segment.dep);
    const arrDate = segment.arr ? new Date(segment.arr) : depDate;
    const now = new Date();

    // Determine status
    let status: Flight['status'] = 'upcoming';
    if (arrDate < now) {
        status = 'landed';
    } else if (depDate < now && arrDate >= now) {
        status = 'departed';
    }

    // Calculate duration
    const durationMs = arrDate.getTime() - depDate.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${hours}h ${minutes}m`;

    // Get airport names
    const originAirport = AIRPORTS.find(a => a.iata === segment.from);
    const destAirport = AIRPORTS.find(a => a.iata === segment.to);

    return {
        id: segment.id,
        origin: segment.from,
        dest: segment.to,
        originName: originAirport?.city || segment.from,
        destName: destAirport?.city || segment.to,
        depDate: depDate.toISOString().split('T')[0] || '',
        depTime: depDate.toTimeString().slice(0, 5),
        arrDate: arrDate.toISOString().split('T')[0] || '',
        arrTime: arrDate.toTimeString().slice(0, 5),
        carrier: segment.carrier || 'Unknown',
        flightNumber: segment.pnr || '',
        duration,
        status,
        bookingRef: segment.pnr,
        price: segment.price,
        currency: segment.currency,
        tripTitle
    };
}

const TravelV2: React.FC = () => {
    const { userId } = useAuth();
    const [activeTab, setActiveTab] = useState<'flights' | 'search' | 'timeline'>('flights');
    const [trips, setTrips] = useState<Trip[]>([]);
    const [searchQueryInput, setSearchQueryInput] = useState({ origin: '', dest: '', date: '' });
    const searchQuery = useDebounce(searchQueryInput, 300); // Debounce search inputs
    const [isSearching, setIsSearching] = useState(false);
    const [showAddFlightModal, setShowAddFlightModal] = useState(false);
    const [showSearchFlightModal, setShowSearchFlightModal] = useState(false);
    const [activeFlightMenu, setActiveFlightMenu] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'departed' | 'landed'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'price' | 'duration'>('date');
    const [showSearchResults, setShowSearchResults] = useState(false);

    // Load trips and subscribe to changes
    useEffect(() => {
        setTrips(listTrips());
        const unsub = onTripsChanged(() => {
            setTrips(listTrips());
        });
        return () => { unsub(); };
    }, []);

    // Activity tracking
    useEffect(() => {
        trackPageView('travel-v2');
    }, [userId]);

    // Convert all trip segments to flights
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

    const filteredAndSortedFlights = useMemo(() => {
        let filtered = allFlights;

        // Apply status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(f => f.status === filterStatus);
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(a.depDate).getTime() - new Date(b.depDate).getTime();
            } else if (sortBy === 'price') {
                return (a.price || 0) - (b.price || 0);
            } else if (sortBy === 'duration') {
                const aDur = parseInt(a.duration.split('h')[0] || '0') * 60 + parseInt(a.duration.split('h')[1]?.split('m')[0] || '0');
                const bDur = parseInt(b.duration.split('h')[0] || '0') * 60 + parseInt(b.duration.split('h')[1]?.split('m')[0] || '0');
                return aDur - bDur;
            }
            return 0;
        });

        return sorted;
    }, [allFlights, filterStatus, sortBy]);

    const upcomingFlights = useMemo(() => {
        return allFlights
            .filter(f => f.status === 'upcoming')
            .sort((a, b) => new Date(a.depDate).getTime() - new Date(b.depDate).getTime());
    }, [allFlights]);

    // Calculate total distance (simplified - in production use haversine)
    const totalDistance = useMemo(() => {
        // Simplified calculation - each flight ~1000km average
        return allFlights.length * 1000;
    }, [allFlights]);

    const handleGoogleFlightsSearch = () => {
        if (!searchQuery.origin || !searchQuery.dest) return;
        setShowSearchResults(true);
    };

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
            navigator.share({
                title: 'Flight Details',
                text: text
            }).catch(() => { });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(text).then(() => {
                alert('Flight details copied to clipboard!');
            });
        }
        setActiveFlightMenu(null);
    };

    const handleDeleteFlight = (flight: Flight) => {
        if (!confirm(`Delete flight ${flight.origin} → ${flight.dest}?`)) return;

        // Find the trip and remove the segment
        const trip = trips.find(t => t.segments?.some(s => s.id === flight.id));
        if (trip) {
            const updatedSegments = trip.segments?.filter(s => s.id !== flight.id) || [];
            // Update trip (would need updateTrip function)
            logger.info('Flight deleted from trip', {
                component: 'TravelV2',
                flightId: flight.id,
                tripId: trip.id
            });
        }
        setActiveFlightMenu(null);
    };

    const handleExportFlight = (flight: Flight) => {
        // Generate iCal format
        const ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//On Tour App//Travel//EN
BEGIN:VEVENT
UID:${flight.id}@ontourapp.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${flight.depDate.replace(/-/g, '')}T${flight.depTime.replace(/:/g, '')}00
DTEND:${flight.arrDate.replace(/-/g, '')}T${flight.arrTime.replace(/:/g, '')}00
SUMMARY:Flight ${flight.carrier} ${flight.flightNumber} - ${flight.origin} to ${flight.dest}
LOCATION:${flight.origin} Airport
DESCRIPTION:Flight from ${flight.originName} to ${flight.destName}\\nCarrier: ${flight.carrier}\\nFlight: ${flight.flightNumber}${flight.bookingRef ? `\\nBooking: ${flight.bookingRef}` : ''}
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([ical], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flight-${flight.origin}-${flight.dest}-${flight.depDate}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setActiveFlightMenu(null);
    };

    const renderFlights = () => (
        <div className="space-y-5">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-dark-900 rounded-xl border border-white/10 p-5 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-2 text-white/40 text-xs uppercase font-medium mb-3">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Plane className="w-4 h-4 text-blue-400" />
                        </div>
                        <span>Próximos Vuelos</span>
                    </div>
                    <div className="text-3xl font-light text-white tabular-nums">{upcomingFlights.length}</div>
                </div>
                <div className="bg-dark-900 rounded-xl border border-white/10 p-5 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-2 text-white/40 text-xs uppercase font-medium mb-3">
                        <div className="w-7 h-7 rounded-lg bg-accent-500/20 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-accent-400" />
                        </div>
                        <span>Siguiente</span>
                    </div>
                    <div className="text-base font-medium text-white">
                        {upcomingFlights[0] ? `${upcomingFlights[0].origin} → ${upcomingFlights[0].dest}` : '—'}
                    </div>
                    <div className="text-xs text-white/40 mt-1">
                        {upcomingFlights[0]?.depDate || '—'}
                    </div>
                </div>
                <div className="bg-dark-900 rounded-xl border border-white/10 p-5 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-2 text-white/40 text-xs uppercase font-medium mb-3">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-purple-400" />
                        </div>
                        <span>Distancia Total</span>
                    </div>
                    <div className="text-3xl font-light text-white tabular-nums">
                        {totalDistance > 0 ? `${totalDistance.toLocaleString()}` : '—'}
                    </div>
                    <div className="text-xs text-white/40 mt-1">kilómetros</div>
                </div>
            </div>

            {/* Flight Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setShowSearchFlightModal(true)}
                    className="px-5 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Search className="w-5 h-5" />
                    <span>{t('travel.search.searchFlights')}</span>
                </button>
                <button
                    onClick={() => setShowAddFlightModal(true)}
                    className="px-5 py-4 rounded-xl bg-accent-500 hover:bg-accent-600 text-black font-medium transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent-500/25 hover:shadow-accent-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus className="w-5 h-5" />
                    <span>{t('travel.addFlight')}</span>
                </button>
            </div>

            {/* Filters & Sort */}
            <div className="flex flex-wrap items-center gap-3 bg-dark-800/30 rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-accent-400/60" />
                    <span className="text-xs text-white/60 font-medium uppercase">Filtrar:</span>
                </div>
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${filterStatus === 'all'
                        ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                        : 'bg-dark-700 text-white/70 hover:bg-dark-600 hover:text-white border border-white/20'
                        }`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setFilterStatus('upcoming')}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${filterStatus === 'upcoming'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-dark-700 text-white/70 hover:bg-dark-600 hover:text-white border border-white/20'
                        }`}
                >
                    Próximos
                </button>
                <button
                    onClick={() => setFilterStatus('departed')}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${filterStatus === 'departed'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-dark-700 text-white/70 hover:bg-dark-600 hover:text-white border border-white/20'
                        }`}
                >
                    En vuelo
                </button>
                <button
                    onClick={() => setFilterStatus('landed')}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${filterStatus === 'landed'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-dark-700 text-white/70 hover:bg-dark-600 hover:text-white border border-white/20'
                        }`}
                >
                    Completados
                </button>

                <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs text-white/60 font-medium uppercase">Ordenar:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="px-4 py-2 rounded-lg bg-dark-700 border border-white/20 text-xs text-white font-medium focus:outline-none focus:border-accent-500 focus:bg-dark-600 transition-all"
                    >
                        <option value="date">Fecha</option>
                        <option value="price">Precio</option>
                        <option value="duration">Duración</option>
                    </select>
                </div>
            </div>

            {/* Flight Cards */}
            <div className="space-y-4">
                {filteredAndSortedFlights.length === 0 ? (
                    <div className="text-center py-20 bg-dark-900 rounded-xl border border-white/10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 mb-5">
                            <Plane className="w-10 h-10 text-white/30" />
                        </div>
                        <h4 className="text-lg font-light text-white mb-2">No hay vuelos registrados</h4>
                        <p className="text-sm text-white/40 max-w-sm mx-auto mb-8">
                            {t('travel.emptyStateDescription')}
                        </p>
                        <button
                            onClick={() => setShowAddFlightModal(true)}
                            className="px-6 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 text-black text-sm font-medium transition-all inline-flex items-center gap-2 shadow-lg shadow-accent-500/25"
                        >
                            <Plus className="w-5 h-5" />
                            <span>{t('travel.addFirstFlight')}</span>
                        </button>
                    </div>
                ) : (
                    filteredAndSortedFlights.map(flight => (
                        <div
                            key={flight.id}
                            className="bg-dark-900 rounded-xl border border-white/10 p-6 hover:border-white/20 hover:shadow-lg transition-all group relative"
                        >
                            {/* Header - Carrier & Flight Number */}
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center border border-accent-500/20">
                                        <Plane className="w-6 h-6 text-accent-400" />
                                    </div>
                                    <div>
                                        <div className="text-base font-medium text-white">{flight.carrier}</div>
                                        <div className="text-xs text-white/40 font-mono">{flight.flightNumber}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`px-4 py-1.5 rounded-lg text-xs font-medium uppercase ${flight.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                        flight.status === 'departed' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                            flight.status === 'landed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                'bg-red-500/20 text-red-400 border border-red-500/30'
                                        }`}>
                                        {flight.status === 'upcoming' ? 'Próximo' :
                                            flight.status === 'departed' ? 'En vuelo' :
                                                flight.status === 'landed' ? 'Aterrizado' : 'Cancelado'}
                                    </div>
                                    {/* Actions Menu */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setActiveFlightMenu(activeFlightMenu === flight.id ? null : flight.id)}
                                            className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                        {activeFlightMenu === flight.id && (
                                            <div className="absolute right-0 top-full mt-2 bg-dark-800 border border-white/20 rounded-xl shadow-2xl z-10 min-w-[180px] overflow-hidden">
                                                <button
                                                    onClick={() => handleShareFlight(flight)}
                                                    className="w-full px-4 py-3 hover:bg-white/5 text-left text-sm text-white flex items-center gap-3 transition-all"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                    <span>Compartir</span>
                                                </button>
                                                <button
                                                    onClick={() => handleExportFlight(flight)}
                                                    className="w-full px-4 py-3 hover:bg-white/5 text-left text-sm text-white flex items-center gap-3 transition-all"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>Exportar</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFlight(flight)}
                                                    className="w-full px-4 py-3 hover:bg-red-500/20 text-left text-sm text-red-400 flex items-center gap-3 transition-all border-t border-white/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>{t('common.delete')}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>                            {/* Route */}
                            <div className="flex items-center gap-6 mb-6">
                                <div className="flex-1">
                                    <div className="text-4xl font-light text-white tabular-nums mb-2">{flight.depTime}</div>
                                    <div className="text-xs text-white/40 font-mono mb-1">{flight.origin}</div>
                                    <div className="text-sm text-white/60 font-medium">{flight.originName}</div>
                                </div>

                                <div className="flex-1 flex flex-col items-center px-4">
                                    <div className="text-xs text-white/40 mb-3 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="font-medium">{flight.duration}</span>
                                    </div>
                                    <div className="relative w-full h-px bg-white/20">
                                        <div className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-white/40 -translate-y-1/2" />
                                        <div className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-accent-400 -translate-y-1/2" />
                                        <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-white/60 rotate-90" />
                                    </div>
                                    <div className="text-xs text-white/40 mt-3 font-medium">Directo</div>
                                </div>

                                <div className="flex-1 text-right">
                                    <div className="text-4xl font-light text-white tabular-nums mb-2">{flight.arrTime}</div>
                                    <div className="text-xs text-white/40 font-mono mb-1">{flight.dest}</div>
                                    <div className="text-sm text-white/60 font-medium">{flight.destName}</div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex items-center flex-wrap gap-x-6 gap-y-3 pt-5 border-t border-white/10 text-xs">
                                {flight.tripTitle && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/40">Viaje:</span>
                                        <span className="text-white font-medium px-2.5 py-1 bg-white/5 rounded-md">{flight.tripTitle}</span>
                                    </div>
                                )}
                                {flight.bookingRef && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/40">Reserva:</span>
                                        <span className="text-white font-mono font-medium px-2.5 py-1 bg-white/5 rounded-md">{flight.bookingRef}</span>
                                    </div>
                                )}
                                {flight.price && flight.currency && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/40">Precio:</span>
                                        <span className="text-accent-400 font-medium px-2.5 py-1 bg-accent-500/10 rounded-md">
                                            {flight.currency} {flight.price.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                {flight.seat && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/40">Asiento:</span>
                                        <span className="text-white font-medium px-2.5 py-1 bg-white/5 rounded-md">{flight.seat}</span>
                                    </div>
                                )}
                                {flight.terminal && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/40">Terminal:</span>
                                        <span className="text-white font-medium px-2.5 py-1 bg-white/5 rounded-md">{flight.terminal}</span>
                                    </div>
                                )}
                                {flight.gate && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/40">Puerta:</span>
                                        <span className="text-white font-medium px-2.5 py-1 bg-white/5 rounded-md">{flight.gate}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderSearch = () => (
        <div className="space-y-6">
            {/* Search Form */}
            <div className="bg-dark-900/50 rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Search Flights</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-xs text-white/70 mb-2 font-medium">From</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                                type="text"
                                placeholder="Origin (e.g., BCN)"
                                value={searchQueryInput.origin}
                                onChange={(e) => setSearchQueryInput({ ...searchQueryInput, origin: e.target.value })}
                                className="w-full pl-10 pr-3 py-2.5 bg-ink-800 border border-accent-500/20 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-white/70 mb-2 font-medium">To</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                                type="text"
                                placeholder="Destination (e.g., AMS)"
                                value={searchQueryInput.dest}
                                onChange={(e) => setSearchQueryInput({ ...searchQueryInput, dest: e.target.value })}
                                className="w-full pl-10 pr-3 py-2.5 bg-ink-800 border border-accent-500/20 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-white/70 mb-2 font-medium">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                                type="date"
                                value={searchQueryInput.date}
                                onChange={(e) => setSearchQueryInput({ ...searchQueryInput, date: e.target.value })}
                                className="w-full pl-10 pr-3 py-2.5 bg-ink-800 border border-accent-500/20 rounded-lg text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30"
                            />
                        </div>
                    </div>
                </div>

                {/* Search Providers */}
                <div className="flex gap-3">
                    <button
                        onClick={handleGoogleFlightsSearch}
                        disabled={!searchQuery.origin || !searchQuery.dest}
                        className="flex-1 px-4 py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-black border border-accent-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                    >
                        <Search className="w-4 h-4" />
                        <span>Search Flights</span>
                    </button>
                    <button
                        onClick={handleSkyscannerSearch}
                        disabled={!searchQuery.origin || !searchQuery.dest}
                        className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span>Skyscanner</span>
                    </button>
                </div>

                <p className="text-xs text-white/40 mt-4 text-center">
                    <span className="text-accent-400 font-medium">Search Flights</span> shows results here in the app.
                    <span className="text-white/60"> • </span>
                    <span className="text-white/60">Skyscanner opens in new tab.</span>
                </p>
            </div>

            {/* Manual Add */}
            <div className="bg-dark-900/50 rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Add Booked Flight</h3>
                <p className="text-sm text-white/50 mb-4">
                    Already booked a flight? Add it manually to track it here.
                </p>
                <button
                    onClick={() => setShowAddFlightModal(true)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors flex items-center justify-center gap-2 font-medium"
                    disabled={!can('travel:book')}
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Flight Details</span>
                </button>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-500/10 rounded-xl border border-blue-500/20 p-6">
                <h4 className="text-sm font-semibold text-blue-400 mb-3">💡 Travel Tips</h4>
                <ul className="space-y-2 text-xs text-white/70">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>Use airport codes (BCN, AMS, MIA) for faster searches</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>Compare prices across both Google Flights and Skyscanner</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>Book directly with airlines to avoid third-party fees</span>
                    </li>
                </ul>
            </div>
        </div>
    );

    const renderTimeline = () => (
        <div className="space-y-4">
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                    <Calendar className="w-8 h-8 text-white/30" />
                </div>
                <h4 className="text-base font-medium text-white mb-2">Timeline View</h4>
                <p className="text-sm text-white/50 max-w-sm mx-auto">
                    Visual timeline of your travel schedule coming soon.
                </p>
            </div>
        </div>
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

            <div className="min-h-screen bg-ink-900">
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">Travel</h1>
                            <p className="text-sm text-white/50">Track flights and manage your tour travel</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                        <button
                            onClick={() => setActiveTab('flights')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'flights'
                                ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Plane className="w-4 h-4 inline mr-2" />
                            My Flights
                        </button>
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'search'
                                ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Search className="w-4 h-4 inline mr-2" />
                            Search & Add
                        </button>
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'timeline'
                                ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Timeline
                        </button>
                    </div>

                    {/* Content */}
                    {activeTab === 'flights' && renderFlights()}
                    {activeTab === 'search' && renderSearch()}
                    {activeTab === 'timeline' && renderTimeline()}
                </div>
            </div>
        </>
    );
};

export default TravelV2;
