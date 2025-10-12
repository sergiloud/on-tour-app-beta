import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, Calendar, Users, Plane, ExternalLink, Clock, Sparkles, Loader2 } from 'lucide-react';
import {
    searchFlights,
    searchAirports,
    formatDuration,
    formatPrice,
    type SimpleFlightParams,
    type SimpleFlight,
    type Airport
} from '../../services/flightSearchSimple';
import { t } from '../../lib/i18n';

interface FlightSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TripType = 'one-way' | 'round-trip';

export function FlightSearchModal({ isOpen, onClose }: FlightSearchModalProps) {
    // Form state - SIMPLIFIED for artists
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [tripType, setTripType] = useState<TripType>('one-way');
    const [adults, setAdults] = useState(1);
    const [cabinClass, setCabinClass] = useState<'economy' | 'premium' | 'business' | 'first'>('economy');
    const [nonStop, setNonStop] = useState(false);

    // Search state
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<SimpleFlight[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    // Autocomplete state
    const [originQuery, setOriginQuery] = useState('');
    const [destinationQuery, setDestinationQuery] = useState('');
    const [originSuggestions, setOriginSuggestions] = useState<Airport[]>([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState<Airport[]>([]);
    const [showOriginDropdown, setShowOriginDropdown] = useState(false);
    const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

    // Debounced airport search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (originQuery.length >= 2) {
                const results = searchAirports(originQuery);
                setOriginSuggestions(results);
            } else {
                setOriginSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [originQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (destinationQuery.length >= 2) {
                const results = searchAirports(destinationQuery);
                setDestinationSuggestions(results);
            } else {
                setDestinationSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [destinationQuery]);

    const today = new Date().toISOString().split('T')[0];

    const handleSearch = async () => {
        if (!origin || !destination || !departureDate) {
            alert(t('travel.validation.completeFields'));
            return;
        }

        if (tripType === 'round-trip' && !returnDate) {
            alert(t('travel.validation.returnDate'));
            return;
        }

        setIsSearching(true);
        setHasSearched(false);

        try {
            const params: SimpleFlightParams = {
                origin,
                destination,
                departureDate,
                returnDate: tripType === 'round-trip' ? returnDate : undefined,
                adults,
                cabinClass,
                nonStop,
            };

            const results = await searchFlights(params);
            setSearchResults(results);
            setHasSearched(true);
        } catch (error) {
            console.error('Error searching flights:', error);
            alert(t('travel.search.error'));
        } finally {
            setIsSearching(false);
        }
    };

    const selectOrigin = (airport: Airport) => {
        setOrigin(airport.iataCode);
        setOriginQuery(`${airport.city} (${airport.iataCode})`);
        setShowOriginDropdown(false);
    };

    const selectDestination = (airport: Airport) => {
        setDestination(airport.iataCode);
        setDestinationQuery(`${airport.city} (${airport.iataCode})`);
        setShowDestinationDropdown(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto p-4">
            <div className="bg-ink-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-6xl my-8">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/20">
                            <Search className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-light text-white">
                                {t('travel.search.searchFlights')}
                            </h2>
                            <p className="text-sm text-white/50">
                                Compara precios en Skyscanner, Google Flights y Kayak
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/50 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Form */}
                <div className="p-6 space-y-5">
                    {/* Trip Type - Horizontal buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setTripType('one-way');
                                setReturnDate('');
                            }}
                            className={`flex-1 py-3 px-4 rounded-xl transition-all font-medium ${tripType === 'one-way'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                                }`}
                        >
                            Solo Ida
                        </button>
                        <button
                            onClick={() => setTripType('round-trip')}
                            className={`flex-1 py-3 px-4 rounded-xl transition-all font-medium ${tripType === 'round-trip'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                                }`}
                        >
                            Ida y Vuelta
                        </button>
                    </div>

                    {/* Origin and Destination */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Origin */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Origen
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    value={originQuery}
                                    onChange={(e) => setOriginQuery(e.target.value)}
                                    onFocus={() => setShowOriginDropdown(true)}
                                    placeholder="Ciudad o aeropuerto..."
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:bg-white/10 focus:border-blue-500/50 focus:outline-none transition-all"
                                />
                            </div>
                            {showOriginDropdown && originSuggestions.length > 0 && (
                                <div className="absolute z-20 w-full mt-2 bg-ink-800 border border-white/20 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                                    {originSuggestions.map((airport) => (
                                        <button
                                            key={airport.iataCode}
                                            onClick={() => selectOrigin(airport)}
                                            className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                                        >
                                            <div className="font-medium text-white">
                                                {airport.city} ({airport.iataCode})
                                            </div>
                                            <div className="text-sm text-white/50">
                                                {airport.name} · {airport.country}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Destination */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Destino
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    value={destinationQuery}
                                    onChange={(e) => setDestinationQuery(e.target.value)}
                                    onFocus={() => setShowDestinationDropdown(true)}
                                    placeholder="Ciudad o aeropuerto..."
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:bg-white/10 focus:border-blue-500/50 focus:outline-none transition-all"
                                />
                            </div>
                            {showDestinationDropdown && destinationSuggestions.length > 0 && (
                                <div className="absolute z-20 w-full mt-2 bg-ink-800 border border-white/20 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                                    {destinationSuggestions.map((airport) => (
                                        <button
                                            key={airport.iataCode}
                                            onClick={() => selectDestination(airport)}
                                            className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                                        >
                                            <div className="font-medium text-white">
                                                {airport.city} ({airport.iataCode})
                                            </div>
                                            <div className="text-sm text-white/50">
                                                {airport.name} · {airport.country}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Fecha de Salida
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="date"
                                    value={departureDate}
                                    onChange={(e) => setDepartureDate(e.target.value)}
                                    min={today}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-blue-500/50 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        {tripType === 'round-trip' && (
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Fecha de Regreso
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type="date"
                                        value={returnDate}
                                        onChange={(e) => setReturnDate(e.target.value)}
                                        min={departureDate || today}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-blue-500/50 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Advanced Options - Collapsible */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Passengers */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Pasajeros
                                </label>
                                <div className="flex items-center gap-3 bg-ink-800 rounded-lg p-2 border border-white/10">
                                    <button
                                        onClick={() => setAdults(Math.max(1, adults - 1))}
                                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white font-medium"
                                    >
                                        −
                                    </button>
                                    <span className="flex-1 text-center font-medium text-white">{adults}</span>
                                    <button
                                        onClick={() => setAdults(Math.min(9, adults + 1))}
                                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white font-medium"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Cabin Class */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Clase
                                </label>
                                <select
                                    value={cabinClass}
                                    onChange={(e) => setCabinClass(e.target.value as any)}
                                    className="w-full px-4 py-2.5 rounded-lg bg-ink-800 border border-white/10 text-white focus:border-blue-500/50 focus:outline-none transition-all"
                                >
                                    <option value="economy">Económica</option>
                                    <option value="premium">Premium</option>
                                    <option value="business">Business</option>
                                    <option value="first">Primera</option>
                                </select>
                            </div>

                            {/* Direct Flights */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Vuelos
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer bg-ink-800 rounded-lg p-2.5 border border-white/10 hover:bg-white/5 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={nonStop}
                                        onChange={(e) => setNonStop(e.target.checked)}
                                        className="w-5 h-5 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-blue-500/50"
                                    />
                                    <span className="text-sm text-white">Solo directos</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:shadow-none"
                    >
                        {isSearching ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Buscando vuelos...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                {t('travel.search.searchFlights')}
                            </>
                        )}
                    </button>
                </div>

                {/* Search Results */}
                {hasSearched && (
                    <div className="border-t border-white/10 p-6">
                        <h3 className="text-lg font-medium text-white mb-4">
                            {searchResults.length > 0 ? (
                                <>Encontramos {searchResults.length} opciones</>
                            ) : (
                                <>No se encontraron vuelos</>
                            )}
                        </h3>

                        {searchResults.length > 0 ? (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {searchResults.map((flight) => (
                                    <div
                                        key={flight.id}
                                        className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 transition-all group"
                                    >
                                        {/* Flight Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                    <Plane className="w-5 h-5 text-blue-400" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">
                                                        {flight.airline}
                                                    </div>
                                                    <div className="text-sm text-white/50">
                                                        {flight.flightNumber} · {flight.stops === 0 ? 'Directo' : `${flight.stops} escala${flight.stops > 1 ? 's' : ''}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-light text-white">
                                                    {formatPrice(flight.price, flight.currency)}
                                                </div>
                                                <div className="text-xs text-white/50">por persona</div>
                                            </div>
                                        </div>

                                        {/* Flight Times */}
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-light text-white">{flight.departureTime}</div>
                                                <div className="text-sm text-white/50">{flight.origin}</div>
                                            </div>

                                            <div className="flex-1 relative">
                                                <div className="border-t border-white/20"></div>
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-ink-900 px-2">
                                                    <Clock className="w-4 h-4 text-white/40" />
                                                </div>
                                                <div className="text-center text-xs text-white/50 mt-2">
                                                    {formatDuration(flight.duration)}
                                                </div>
                                            </div>

                                            <div className="text-center">
                                                <div className="text-2xl font-light text-white">{flight.arrivalTime}</div>
                                                <div className="text-sm text-white/50">{flight.destination}</div>
                                            </div>
                                        </div>

                                        {/* Booking Links */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <a
                                                href={flight.skyscannerUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-[#0770E3]/20 hover:bg-[#0770E3]/30 border border-[#0770E3]/30 text-[#0770E3] rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                            >
                                                Skyscanner
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                            <a
                                                href={flight.googleFlightsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-[#4285F4]/20 hover:bg-[#4285F4]/30 border border-[#4285F4]/30 text-[#4285F4] rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                            >
                                                Google
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                            <a
                                                href={flight.kayakUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-[#FF6600]/20 hover:bg-[#FF6600]/30 border border-[#FF6600]/30 text-[#FF6600] rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                            >
                                                Kayak
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                                    <Plane className="w-8 h-8 text-white/30" />
                                </div>
                                <p className="text-white/50">No se encontraron vuelos para esta búsqueda.</p>
                                <p className="text-sm text-white/30 mt-2">Prueba con otras fechas o destinos.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
