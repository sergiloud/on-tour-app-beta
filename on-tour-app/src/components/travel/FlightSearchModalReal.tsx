import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, Calendar, Plane, ExternalLink, Clock, Loader2, Sparkles } from 'lucide-react';
import {
    searchRealFlights,
    searchAirports,
    formatPrice,
    type RealFlightParams,
    type RealFlight,
    type Airport
} from '../../services/flightSearchReal';
import { t } from '../../lib/i18n';

interface FlightSearchModalRealProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FlightSearchModalReal({ isOpen, onClose }: FlightSearchModalRealProps) {
    // Form state - MINIMAL para artistas
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
    const [adults, setAdults] = useState(1);

    // Search state
    const [isSearching, setIsSearching] = useState(false);
    const [flights, setFlights] = useState<RealFlight[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    // Autocomplete
    const [originQuery, setOriginQuery] = useState('');
    const [destinationQuery, setDestinationQuery] = useState('');
    const [originSuggestions, setOriginSuggestions] = useState<Airport[]>([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState<Airport[]>([]);
    const [showOriginDropdown, setShowOriginDropdown] = useState(false);
    const [showDestDropdown, setShowDestDropdown] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (originQuery.length >= 2) {
                setOriginSuggestions(searchAirports(originQuery));
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [originQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (destinationQuery.length >= 2) {
                setDestinationSuggestions(searchAirports(destinationQuery));
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [destinationQuery]);

    const today = new Date().toISOString().split('T')[0];

    const handleSearch = async () => {
        if (!origin || !destination || !departureDate) {
            return;
        }

        setIsSearching(true);
        setHasSearched(false);

        try {
            const params: RealFlightParams = {
                origin,
                destination,
                departureDate,
                returnDate: tripType === 'round-trip' ? returnDate : undefined,
                adults,
            };

            const results = await searchRealFlights(params);
            setFlights(results);
            setHasSearched(true);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto p-4">
            <div className="bg-dark-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-5xl my-8">
                {/* Header - Igual que Dashboard */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-accent-500/20">
                            <Search className="w-6 h-6 text-accent-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-light text-white">{t('travel.search.searchFlights')}</h2>
                            <p className="text-sm text-white/40">Precios reales en tiempo real</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form - Diseño Dark/Ink */}
                <div className="p-6 space-y-5">
                    {/* Trip Type */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setTripType('one-way');
                                setReturnDate('');
                            }}
                            className={`flex-1 py-3 px-4 rounded-xl transition-all text-sm font-medium ${tripType === 'one-way'
                                ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                                : 'bg-dark-800/50 text-white/40 hover:text-white/60 border border-white/10 hover:border-white/20'
                                }`}
                        >
                            Solo Ida
                        </button>
                        <button
                            onClick={() => setTripType('round-trip')}
                            className={`flex-1 py-3 px-4 rounded-xl transition-all text-sm font-medium ${tripType === 'round-trip'
                                ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                                : 'bg-dark-800/50 text-white/40 hover:text-white/60 border border-white/10 hover:border-white/20'
                                }`}
                        >
                            Ida y Vuelta
                        </button>
                    </div>

                    {/* Origin and Destination */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Origin */}
                        <div className="relative">
                            <label className="block text-xs font-medium text-white/50 mb-2">ORIGEN</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="text"
                                    value={originQuery}
                                    onChange={(e) => setOriginQuery(e.target.value)}
                                    onFocus={() => setShowOriginDropdown(true)}
                                    placeholder="Barcelona, Madrid..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-dark-800/50 border border-white/10 text-white text-sm placeholder-white/20 focus:bg-dark-800 focus:border-accent-500/50 focus:outline-none transition-all"
                                />
                            </div>
                            {showOriginDropdown && originSuggestions.length > 0 && (
                                <div className="absolute z-20 w-full mt-2 bg-dark-800 border border-white/20 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                                    {originSuggestions.map((airport) => (
                                        <button
                                            key={airport.iataCode}
                                            onClick={() => {
                                                setOrigin(airport.iataCode);
                                                setOriginQuery(`${airport.city} (${airport.iataCode})`);
                                                setShowOriginDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                                        >
                                            <div className="text-sm font-medium text-white">
                                                {airport.city} ({airport.iataCode})
                                            </div>
                                            <div className="text-xs text-white/40 mt-0.5">
                                                {airport.name}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Destination */}
                        <div className="relative">
                            <label className="block text-xs font-medium text-white/50 mb-2">DESTINO</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="text"
                                    value={destinationQuery}
                                    onChange={(e) => setDestinationQuery(e.target.value)}
                                    onFocus={() => setShowDestDropdown(true)}
                                    placeholder="Londres, París..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-dark-800/50 border border-white/10 text-white text-sm placeholder-white/20 focus:bg-dark-800 focus:border-accent-500/50 focus:outline-none transition-all"
                                />
                            </div>
                            {showDestDropdown && destinationSuggestions.length > 0 && (
                                <div className="absolute z-20 w-full mt-2 bg-dark-800 border border-white/20 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                                    {destinationSuggestions.map((airport) => (
                                        <button
                                            key={airport.iataCode}
                                            onClick={() => {
                                                setDestination(airport.iataCode);
                                                setDestinationQuery(`${airport.city} (${airport.iataCode})`);
                                                setShowDestDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                                        >
                                            <div className="text-sm font-medium text-white">
                                                {airport.city} ({airport.iataCode})
                                            </div>
                                            <div className="text-xs text-white/40 mt-0.5">
                                                {airport.name}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dates and Passengers */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-white/50 mb-2">SALIDA</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="date"
                                    value={departureDate}
                                    onChange={(e) => setDepartureDate(e.target.value)}
                                    min={today}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-dark-800/50 border border-white/10 text-white text-sm focus:bg-dark-800 focus:border-accent-500/50 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        {tripType === 'round-trip' && (
                            <div>
                                <label className="block text-xs font-medium text-white/50 mb-2">REGRESO</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <input
                                        type="date"
                                        value={returnDate}
                                        onChange={(e) => setReturnDate(e.target.value)}
                                        min={departureDate || today}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-dark-800/50 border border-white/10 text-white text-sm focus:bg-dark-800 focus:border-accent-500/50 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-white/50 mb-2">PASAJEROS</label>
                            <div className="flex items-center gap-2 bg-dark-800/50 rounded-lg p-2 border border-white/10">
                                <button
                                    onClick={() => setAdults(Math.max(1, adults - 1))}
                                    className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium"
                                >
                                    −
                                </button>
                                <span className="flex-1 text-center text-white text-sm font-medium">{adults}</span>
                                <button
                                    onClick={() => setAdults(Math.min(9, adults + 1))}
                                    className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        disabled={isSearching || !origin || !destination || !departureDate}
                        className="w-full py-3.5 px-6 bg-accent-500 hover:bg-accent-600 disabled:bg-white/10 disabled:text-white/30 text-black rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    >
                        {isSearching ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Buscando...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                {t('travel.search.searchFlights')}
                            </>
                        )}
                    </button>
                </div>

                {/* Results */}
                {hasSearched && (
                    <div className="border-t border-white/10 p-6">
                        <h3 className="text-base font-medium text-white mb-4">
                            {flights.length > 0 ? `${flights.length} vuelos encontrados` : 'No hay vuelos'}
                        </h3>

                        {flights.length > 0 ? (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {flights.map((flight) => (
                                    <div
                                        key={flight.id}
                                        className="bg-dark-800/50 border border-white/10 rounded-xl p-4 hover:bg-dark-800 hover:border-white/20 transition-all group"
                                    >
                                        {/* Flight Header */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center">
                                                    <Plane className="w-4 h-4 text-accent-400" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">
                                                        {flight.airline}
                                                    </div>
                                                    <div className="text-xs text-white/40">
                                                        {flight.flightNumber} · {flight.stops === 0 ? 'Directo' : `${flight.stops} escala${flight.stops > 1 ? 's' : ''}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-light text-white">
                                                    {formatPrice(flight.price, flight.currency)}
                                                </div>
                                                <div className="text-xs text-white/40">por persona</div>
                                            </div>
                                        </div>

                                        {/* Flight Route */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="text-center">
                                                <div className="text-lg font-light text-white">{flight.departureTime}</div>
                                                <div className="text-xs text-white/40">{flight.origin}</div>
                                            </div>

                                            <div className="flex-1 relative">
                                                <div className="border-t border-white/20"></div>
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-800 px-2">
                                                    <Clock className="w-3.5 h-3.5 text-white/30" />
                                                </div>
                                                <div className="text-center text-xs text-white/40 mt-1.5">
                                                    {flight.duration}
                                                </div>
                                            </div>

                                            <div className="text-center">
                                                <div className="text-lg font-light text-white">{flight.arrivalTime}</div>
                                                <div className="text-xs text-white/40">{flight.destination}</div>
                                            </div>
                                        </div>

                                        {/* Book Button */}
                                        <a
                                            href={flight.deepLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-2.5 px-4 bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/30 text-accent-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                        >
                                            Ver en Skyscanner
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Plane className="w-12 h-12 text-white/20 mx-auto mb-3" />
                                <p className="text-white/40 text-sm">No se encontraron vuelos</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
