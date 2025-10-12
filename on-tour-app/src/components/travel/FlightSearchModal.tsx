import React, { useState, useEffect } from 'react';
import { X, Plane, Calendar, MapPin, Users, Search, Loader2, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { searchFlights, searchAirports, type FlightSearchParams, type FlightResult, type Airport } from '../../services/flightSearchPublic';
import { searchRealFlights, isAmadeusConfigured } from '../../services/amadeusFlightSearch';
import { t } from '../../lib/i18n';

interface FlightSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FlightSearchModal: React.FC<FlightSearchModalProps> = ({ isOpen, onClose }) => {
    // Form state
    const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('roundtrip');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [adults, setAdults] = useState(1);

    // UI state
    const [originQuery, setOriginQuery] = useState('');
    const [destQuery, setDestQuery] = useState('');
    const [originResults, setOriginResults] = useState<Airport[]>([]);
    const [destResults, setDestResults] = useState<Airport[]>([]);
    const [showOriginDropdown, setShowOriginDropdown] = useState(false);
    const [showDestDropdown, setShowDestDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<FlightResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    // Debounce timer
    const [originDebounce, setOriginDebounce] = useState<NodeJS.Timeout | null>(null);
    const [destDebounce, setDestDebounce] = useState<NodeJS.Timeout | null>(null);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearchResults([]);
            setHasSearched(false);
        }
    }, [isOpen]);

    // Origin autocomplete
    useEffect(() => {
        if (originDebounce) clearTimeout(originDebounce);

        if (originQuery.length >= 2) {
            const timer = setTimeout(() => {
                const results = searchAirports(originQuery);
                setOriginResults(results);
                setShowOriginDropdown(true);
            }, 300);
            setOriginDebounce(timer);
        } else {
            setOriginResults([]);
            setShowOriginDropdown(false);
        }

        return () => {
            if (originDebounce) clearTimeout(originDebounce);
        };
    }, [originQuery]);

    // Destination autocomplete
    useEffect(() => {
        if (destDebounce) clearTimeout(destDebounce);

        if (destQuery.length >= 2) {
            const timer = setTimeout(() => {
                const results = searchAirports(destQuery);
                setDestResults(results);
                setShowDestDropdown(true);
            }, 300);
            setDestDebounce(timer);
        } else {
            setDestResults([]);
            setShowDestDropdown(false);
        }

        return () => {
            if (destDebounce) clearTimeout(destDebounce);
        };
    }, [destQuery]);

    const selectOrigin = (airport: Airport) => {
        setOrigin(airport.iata);
        setOriginQuery(`${airport.city} (${airport.iata})`);
        setShowOriginDropdown(false);
    };

    const selectDestination = (airport: Airport) => {
        setDestination(airport.iata);
        setDestQuery(`${airport.city} (${airport.iata})`);
        setShowDestDropdown(false);
    };

    const handleSearch = async () => {
        if (!origin || !destination || !departureDate) return;
        if (tripType === 'roundtrip' && !returnDate) return;

        setIsSearching(true);
        setHasSearched(true);

        try {
            // Use Amadeus API for REAL prices if configured
            if (isAmadeusConfigured()) {
                const results = await searchRealFlights({
                    origin,
                    destination,
                    departureDate,
                    returnDate: tripType === 'roundtrip' ? returnDate : undefined,
                    adults,
                });
                setSearchResults(results as FlightResult[]);
            } else {
                // Fallback to estimated prices
                const params: FlightSearchParams = {
                    origin,
                    destination,
                    departureDate,
                    returnDate: tripType === 'roundtrip' ? returnDate : undefined,
                    adults,
                    cabinClass: 'economy',
                };
                const results = await searchFlights(params);
                setSearchResults(results);
            }
        } catch (error) {
            console.error('Flight search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const openGoogleFlights = (link: string) => {
        window.open(link, '_blank');
    };

    const openSkyscanner = (link: string) => {
        window.open(link, '_blank');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-dark-900 border border-white/10 rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center">
                            <Plane className="w-5 h-5 text-accent-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-white">{t('travel.search.searchFlights')}</h2>
                            <p className="text-xs text-white/40">Encuentra las mejores opciones</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Form */}
                {/* Search Form */}
                <div className="p-5 border-b border-white/10 space-y-4">
                    {/* Trip Type */}
                    <div>
                        <label className="text-xs font-medium text-white/50 uppercase tracking-wide mb-2 block">
                            Tipo de Viaje
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTripType('roundtrip')}
                                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${tripType === 'roundtrip'
                                    ? 'bg-accent-500 text-black'
                                    : 'bg-dark-800/50 text-white/60 hover:bg-dark-800 hover:text-white/80'
                                    }`}
                            >
                                Ida y Vuelta
                            </button>
                            <button
                                onClick={() => setTripType('oneway')}
                                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${tripType === 'oneway'
                                    ? 'bg-accent-500 text-black'
                                    : 'bg-dark-800/50 text-white/60 hover:bg-dark-800 hover:text-white/80'
                                    }`}
                            >
                                Solo Ida
                            </button>
                        </div>
                    </div>

                    {/* Origin & Destination */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Origin */}
                        <div className="relative">
                            <label className="block text-xs font-medium text-white/60 uppercase tracking-wide mb-2">
                                Origen
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-400/60" />
                                <input
                                    type="text"
                                    value={originQuery}
                                    onChange={(e) => setOriginQuery(e.target.value)}
                                    placeholder="Ej: Madrid, Barcelona..."
                                    className="w-full pl-10 pr-3 py-2.5 bg-dark-700 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:bg-dark-600 focus:border-accent-500 focus:outline-none transition-all"
                                />
                            </div>

                            {/* Origin Dropdown */}
                            {showOriginDropdown && originResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-dark-700 border-2 border-white/30 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
                                    {originResults.map((airport) => (
                                        <button
                                            key={airport.iata}
                                            onClick={() => selectOrigin(airport)}
                                            className="w-full px-3 py-2.5 hover:bg-accent-500/10 hover:border-l-2 hover:border-accent-500 text-left transition-all border-b border-white/10 last:border-0"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-semibold text-white">{airport.city}</div>
                                                    <div className="text-xs text-white/50">{airport.name}</div>
                                                </div>
                                                <div className="text-xs font-bold text-accent-400 bg-accent-500/20 px-2.5 py-1 rounded border border-accent-500/30">
                                                    {airport.iata}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Destination */}
                        <div className="relative">
                            <label className="block text-xs font-medium text-white/60 uppercase tracking-wide mb-2">
                                Destino
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-400/60" />
                                <input
                                    type="text"
                                    value={destQuery}
                                    onChange={(e) => setDestQuery(e.target.value)}
                                    placeholder="Ej: Londres, París..."
                                    className="w-full pl-10 pr-3 py-2.5 bg-dark-700 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:bg-dark-600 focus:border-accent-500 focus:outline-none transition-all"
                                />
                            </div>

                            {/* Destination Dropdown */}
                            {showDestDropdown && destResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-dark-700 border-2 border-white/30 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
                                    {destResults.map((airport) => (
                                        <button
                                            key={airport.iata}
                                            onClick={() => selectDestination(airport)}
                                            className="w-full px-3 py-2.5 hover:bg-accent-500/10 hover:border-l-2 hover:border-accent-500 text-left transition-all border-b border-white/10 last:border-0"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-semibold text-white">{airport.city}</div>
                                                    <div className="text-xs text-white/50">{airport.name}</div>
                                                </div>
                                                <div className="text-xs font-bold text-accent-400 bg-accent-500/20 px-2.5 py-1 rounded border border-accent-500/30">
                                                    {airport.iata}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-white/60 uppercase tracking-wide mb-2">
                                Fecha de Salida
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-400/60" />
                                <input
                                    type="date"
                                    value={departureDate}
                                    onChange={(e) => setDepartureDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full pl-10 pr-3 py-2.5 bg-dark-700 border border-white/20 rounded-lg text-white text-sm focus:bg-dark-600 focus:border-accent-500 focus:outline-none transition-all [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70"
                                />
                            </div>
                        </div>

                        {tripType === 'roundtrip' && (
                            <div>
                                <label className="block text-xs font-medium text-white/60 uppercase tracking-wide mb-2">
                                    Fecha de Regreso
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-400/60" />
                                    <input
                                        type="date"
                                        value={returnDate}
                                        onChange={(e) => setReturnDate(e.target.value)}
                                        min={departureDate || new Date().toISOString().split('T')[0]}
                                        className="w-full pl-10 pr-3 py-2.5 bg-dark-700 border border-white/20 rounded-lg text-white text-sm focus:bg-dark-600 focus:border-accent-500 focus:outline-none transition-all [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Passengers */}
                    <div>
                        <label className="block text-xs font-medium text-white/60 uppercase tracking-wide mb-2">
                            Pasajeros
                        </label>
                        <div className="flex items-center gap-3 bg-dark-700 border border-white/20 rounded-lg p-3">
                            <Users className="w-4 h-4 text-accent-400/60" />
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setAdults(Math.max(1, adults - 1))}
                                    disabled={adults <= 1}
                                    className="w-8 h-8 rounded-lg bg-dark-800 hover:bg-dark-600 hover:border hover:border-accent-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-lg transition-all"
                                >
                                    −
                                </button>
                                <span className="w-8 text-center text-base font-medium text-white tabular-nums">{adults}</span>
                                <button
                                    onClick={() => setAdults(Math.min(9, adults + 1))}
                                    disabled={adults >= 9}
                                    className="w-8 h-8 rounded-lg bg-dark-800 hover:bg-dark-600 hover:border hover:border-accent-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-lg transition-all"
                                >
                                    +
                                </button>
                            </div>
                            <span className="text-sm text-white/50">adultos</span>
                        </div>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        disabled={!origin || !destination || !departureDate || (tripType === 'roundtrip' && !returnDate) || isSearching}
                        className="w-full py-3 bg-accent-500 hover:bg-accent-600 disabled:bg-dark-800/50 disabled:text-white/30 disabled:border disabled:border-white/10 text-black font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                        {isSearching ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Buscando...</span>
                            </>
                        ) : (
                            <>
                                <Search className="w-4 h-4" />
                                <span>{t('travel.search.searchFlights')}</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isSearching && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="w-14 h-14 text-accent-400 animate-spin mb-5" />
                            <p className="text-base text-white font-medium">Buscando vuelos...</p>
                            <p className="text-xs text-white/40 mt-1">Esto puede tardar unos segundos</p>
                        </div>
                    )}

                    {!isSearching && hasSearched && searchResults.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 bg-dark-800/30 rounded-lg border border-white/10">
                            <div className="w-16 h-16 rounded-xl bg-accent-500/10 flex items-center justify-center mb-5 border border-accent-500/20">
                                <Plane className="w-8 h-8 text-accent-400" />
                            </div>
                            <p className="text-base text-white font-medium mb-2">No se encontraron vuelos</p>
                            <p className="text-sm text-white/40">Intenta con otras fechas o destinos</p>
                        </div>
                    )}

                    {!isSearching && searchResults.length > 0 && (
                        <div className="space-y-3">
                            <div className="text-sm text-white/50 mb-3">
                                {searchResults.length} vuelos
                            </div>

                            {searchResults.map((flight) => (
                                <div
                                    key={flight.id}
                                    className="bg-dark-700 border border-white/20 rounded-lg p-4 hover:border-accent-500/50 hover:bg-dark-600 transition-all group"
                                >
                                    {/* Flight Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-10 h-10 rounded-lg bg-accent-500/20 border border-accent-500/30 flex items-center justify-center">
                                                <Plane className="w-5 h-5 text-accent-400" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">{flight.airline}</div>
                                                <div className="text-xs text-white/50 font-mono">{flight.flightNumber}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-light text-white tabular-nums">€{flight.price}</div>
                                            <div className="text-xs text-white/30">por persona</div>
                                        </div>
                                    </div>

                                    {/* Route */}
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="flex-1">
                                            <div className="text-xl font-light text-white tabular-nums">{flight.departureTime}</div>
                                            <div className="text-xs text-white/30 font-mono">{flight.origin}</div>
                                        </div>

                                        <div className="flex-1 flex flex-col items-center">
                                            <div className="text-xs text-white/30 mb-1.5 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {flight.duration}
                                            </div>
                                            <div className="relative w-full h-px bg-white/20">
                                                <div className="absolute top-1/2 left-0 w-1.5 h-1.5 rounded-full bg-white/30 -translate-y-1/2" />
                                                <div className="absolute top-1/2 right-0 w-1.5 h-1.5 rounded-full bg-accent-400 -translate-y-1/2" />
                                                <ArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                            </div>
                                            <div className="text-xs text-white/30 mt-1.5 bg-dark-900/50 px-2 py-0.5 rounded">
                                                {flight.stops === 0 ? 'Directo' : `${flight.stops} escala${flight.stops > 1 ? 's' : ''}`}
                                            </div>
                                        </div>

                                        <div className="flex-1 text-right">
                                            <div className="text-xl font-light text-white tabular-nums">{flight.arrivalTime}</div>
                                            <div className="text-xs text-white/30 font-mono">{flight.destination}</div>
                                        </div>
                                    </div>

                                    {/* Botones */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => openGoogleFlights(flight.googleFlightsLink)}
                                            className="py-2 bg-dark-800/50 hover:bg-dark-800 border border-white/10 hover:border-white/20 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                        >
                                            <span>Google Flights</span>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => openSkyscanner(flight.skyscannerLink)}
                                            className="py-2 bg-accent-500/10 hover:bg-accent-500 border border-accent-500/30 hover:border-accent-500 text-accent-400 hover:text-black rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                        >
                                            <span>Skyscanner</span>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
