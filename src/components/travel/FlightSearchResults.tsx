import React, { useState, useEffect } from 'react';
import { X, Plane, ExternalLink, Loader2, Clock, TrendingUp, Zap, Info, ChevronRight, Star, Filter as FilterIcon } from 'lucide-react';
import { AIRPORTS } from '../../lib/airports';

interface FlightSearchResultsProps {
    origin: string;
    dest: string;
    date: string;
    onClose: () => void;
    onAddFlight?: () => void;
}

interface FlightOption {
    id: string;
    carrier: string;
    flightNumber: string;
    departure: string;
    arrival: string;
    duration: string;
    price: number;
    currency: string;
    stops: number;
    aircraft?: string;
    class: 'Economy' | 'Premium' | 'Business' | 'First';
    available: number;
    features: string[];
}

// Mock flight data generator
const generateMockFlights = (origin: string, dest: string): FlightOption[] => {
    const carriers = [
        { name: 'KLM', code: 'KL' },
        { name: 'Lufthansa', code: 'LH' },
        { name: 'Air France', code: 'AF' },
        { name: 'Iberia', code: 'IB' },
        { name: 'British Airways', code: 'BA' },
        { name: 'Vueling', code: 'VY' }
    ];

    const features = [
        ['WiFi', 'USB Power'],
        ['Meals included', 'WiFi'],
        ['Extra legroom', 'Priority boarding'],
        ['WiFi', 'Entertainment'],
        ['Meals included', 'USB Power']
    ];

    return carriers.slice(0, 6).map((carrier, idx) => ({
        id: `flight-${idx}`,
        carrier: carrier.name,
        flightNumber: `${carrier.code}${1000 + idx * 100}`,
        departure: `${8 + idx * 2}:${idx % 2 === 0 ? '30' : '15'}`,
        arrival: `${10 + idx * 2}:${idx % 2 === 0 ? '45' : '30'}`,
        duration: `${2 + Math.floor(idx / 2)}h ${15 + idx * 5}m`,
        price: Math.round(150 + idx * 50 + Math.random() * 100),
        currency: 'EUR',
        stops: idx % 3 === 0 ? 0 : idx % 3,
        aircraft: idx % 2 === 0 ? 'Airbus A320' : 'Boeing 737',
        class: 'Economy',
        available: 15 - idx * 2,
        features: features[idx] || []
    }));
};

export const FlightSearchResults: React.FC<FlightSearchResultsProps> = ({
    origin,
    dest,
    date,
    onClose,
    onAddFlight
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [flights, setFlights] = useState<FlightOption[]>([]);
    const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price');
    const [filterStops, setFilterStops] = useState<'all' | 'direct' | '1stop'>('all');

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            const mockFlights = generateMockFlights(origin, dest);
            setFlights(mockFlights);
            setIsLoading(false);
        }, 1200);
    }, [origin, dest, date]);

    const originAirport = AIRPORTS.find(a => a.iata === origin.toUpperCase());
    const destAirport = AIRPORTS.find(a => a.iata === dest.toUpperCase());

    const handleOpenGoogleFlights = () => {
        const url = `https://www.google.com/travel/flights?q=flights%20from%20${origin}%20to%20${dest}%20on%20${date}`;
        window.open(url, '_blank');
    };

    const handleOpenSkyscanner = () => {
        const formattedDate = date.replace(/-/g, '');
        const url = `https://www.skyscanner.com/transport/flights/${origin}/${dest}/${formattedDate}/?adultsv2=1&cabinclass=economy`;
        window.open(url, '_blank');
    };

    const sortedAndFilteredFlights = flights
        .filter(f => {
            if (filterStops === 'direct') return f.stops === 0;
            if (filterStops === '1stop') return f.stops === 1;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'price') return a.price - b.price;
            if (sortBy === 'duration') {
                const aDur = parseInt(a.duration.split('h')[0] || '0') * 60 + parseInt(a.duration.split('h')[1]?.split('m')[0] || '0');
                const bDur = parseInt(b.duration.split('h')[0] || '0') * 60 + parseInt(b.duration.split('h')[1]?.split('m')[0] || '0');
                return aDur - bDur;
            }
            return a.departure.localeCompare(b.departure);
        });

    const cheapestFlight = flights.length > 0 ? flights.reduce((min, f) => (min && f.price < min.price) ? f : min, flights[0]) : null;
    const fastestFlight = flights.length > 0 ? flights.reduce((min, f) => {
        if (!min) return f; // Guard against undefined min
        const minDur = parseInt(min.duration.split('h')[0] || '0') * 60;
        const fDur = parseInt(f.duration.split('h')[0] || '0') * 60;
        return fDur < minDur ? f : min;
    }, flights[0]) : null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-ink-900 rounded-xl border border-accent-500/30 w-full max-w-6xl h-[90vh] flex flex-col">
                {/* Compact Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-ink-900 to-ink-800">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="text-base font-semibold text-slate-900 dark:text-white">
                                {originAirport?.city || origin.toUpperCase()}
                            </div>
                            <Plane className="w-4 h-4 text-accent-400 rotate-90" />
                            <div className="text-base font-semibold text-slate-900 dark:text-white">
                                {destAirport?.city || dest.toUpperCase()}
                            </div>
                        </div>
                        <div className="h-4 w-px bg-slate-200 dark:bg-white/20" />
                        <div className="text-sm text-slate-400 dark:text-white/60">
                            {date ? new Date(date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            }) : 'Select date'}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-white/70 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="w-10 h-10 text-accent-400 animate-spin mx-auto mb-3" />
                            <p className="text-slate-900 dark:text-white font-medium mb-1">Searching flights...</p>
                            <p className="text-slate-300 dark:text-white/50 text-sm">Finding best options</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Filters & Insights Bar */}
                        <div className="px-6 py-3 border-b border-slate-100 dark:border-white/5 bg-dark-800/30">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                {/* Quick Insights */}
                                <div className="flex items-center gap-4 text-xs">
                                    {cheapestFlight && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-green-500/10 border border-green-500/20">
                                            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                                            <span className="text-green-400 font-medium">Cheapest: €{cheapestFlight.price}</span>
                                        </div>
                                    )}
                                    {fastestFlight && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                                            <Zap className="w-3.5 h-3.5 text-blue-400" />
                                            <span className="text-blue-400 font-medium">Fastest: {fastestFlight.duration}</span>
                                        </div>
                                    )}
                                    <div className="text-slate-300 dark:text-white/50">{sortedAndFilteredFlights.length} flights</div>
                                </div>

                                {/* Filters */}
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <FilterIcon className="w-3.5 h-3.5 text-slate-300 dark:text-white/50" />
                                        <button
                                            onClick={() => setFilterStops('all')}
                                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${filterStops === 'all'
                                                ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                                                : 'bg-white/5 text-slate-400 dark:text-white/60 hover:bg-slate-200 dark:bg-white/10 border border-white/10'
                                                }`}
                                        >
                                            All
                                        </button>
                                        <button
                                            onClick={() => setFilterStops('direct')}
                                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${filterStops === 'direct'
                                                ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                                                : 'bg-white/5 text-slate-400 dark:text-white/60 hover:bg-slate-200 dark:bg-white/10 border border-white/10'
                                                }`}
                                        >
                                            Direct
                                        </button>
                                        <button
                                            onClick={() => setFilterStops('1stop')}
                                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${filterStops === '1stop'
                                                ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                                                : 'bg-white/5 text-slate-400 dark:text-white/60 hover:bg-slate-200 dark:bg-white/10 border border-white/10'
                                                }`}
                                        >
                                            1 Stop
                                        </button>
                                    </div>

                                    <div className="h-4 w-px bg-slate-200 dark:bg-white/20" />

                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                        className="px-2.5 py-1 rounded text-xs bg-ink-800 border border-slate-300 dark:border-white/20 text-white focus:outline-none focus:border-accent-500"
                                    >
                                        <option value="price">Cheapest</option>
                                        <option value="duration">Fastest</option>
                                        <option value="departure">Earliest</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Flight List */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                            {sortedAndFilteredFlights.map((flight, idx) => {
                                const isCheapest = cheapestFlight?.id === flight.id;
                                const isFastest = fastestFlight?.id === flight.id;

                                return (
                                    <div
                                        key={flight.id}
                                        className={`bg-dark-800/40 rounded-lg border transition-all hover:border-accent-500/40 hover:bg-dark-800/60 cursor-pointer ${selectedFlight === flight.id
                                            ? 'border-accent-500/50 bg-dark-800/60'
                                            : 'border-white/10'
                                            }`}
                                        onClick={() => setSelectedFlight(flight.id)}
                                    >
                                        <div className="p-4">
                                            <div className="flex items-center justify-between">
                                                {/* Left: Carrier & Times */}
                                                <div className="flex items-center gap-6 flex-1">
                                                    {/* Carrier */}
                                                    <div className="w-20">
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{flight.carrier}</div>
                                                        <div className="text-xs text-slate-300 dark:text-white/50">{flight.flightNumber}</div>
                                                    </div>

                                                    {/* Route */}
                                                    <div className="flex items-center gap-4 flex-1 max-w-md">
                                                        <div className="text-right">
                                                            <div className="text-lg font-semibold text-white tabular-nums">{flight.departure}</div>
                                                            <div className="text-xs text-slate-300 dark:text-white/50">{origin.toUpperCase()}</div>
                                                        </div>

                                                        <div className="flex-1 flex flex-col items-center">
                                                            <div className="text-xs text-slate-400 dark:text-white/40 mb-1">{flight.duration}</div>
                                                            <div className="w-full relative h-0.5 bg-slate-200 dark:bg-white/10">
                                                                <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 dark:text-white/60 rotate-90" />
                                                            </div>
                                                            <div className="text-xs text-slate-400 dark:text-white/40 mt-1">
                                                                {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                                                            </div>
                                                        </div>

                                                        <div className="text-left">
                                                            <div className="text-lg font-semibold text-white tabular-nums">{flight.arrival}</div>
                                                            <div className="text-xs text-slate-300 dark:text-white/50">{dest.toUpperCase()}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: Price & CTA */}
                                                <div className="flex items-center gap-4">
                                                    {/* Features */}
                                                    <div className="flex flex-wrap gap-1 max-w-[120px]">
                                                        {flight.features.slice(0, 2).map((feature, i) => (
                                                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/60">
                                                                {feature}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* Price */}
                                                    <div className="text-right min-w-[100px]">
                                                        <div className="text-xl font-bold text-slate-900 dark:text-white">€{flight.price}</div>
                                                        <div className="text-[10px] text-slate-300 dark:text-white/40">{flight.available} seats left</div>
                                                    </div>

                                                    {/* Badges */}
                                                    <div className="flex flex-col gap-1 min-w-[60px]">
                                                        {isCheapest && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 text-center">
                                                                Cheapest
                                                            </span>
                                                        )}
                                                        {isFastest && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-center">
                                                                Fastest
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Compact Footer */}
                        <div className="px-6 py-3 border-t border-slate-200 dark:border-white/10 bg-gradient-to-r from-ink-900 to-ink-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleOpenGoogleFlights}
                                        className="px-3 py-1.5 rounded-md bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/15 text-white border border-slate-200 dark:border-white/10 transition-colors text-xs flex items-center gap-1.5"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        <span>Google Flights</span>
                                    </button>
                                    <button
                                        onClick={handleOpenSkyscanner}
                                        className="px-3 py-1.5 rounded-md bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/15 text-white border border-slate-200 dark:border-white/10 transition-colors text-xs flex items-center gap-1.5"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        <span>Skyscanner</span>
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-300 dark:text-white/50">
                                    <Info className="w-3.5 h-3.5" />
                                    <span>Compare prices • Book directly with airlines</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
