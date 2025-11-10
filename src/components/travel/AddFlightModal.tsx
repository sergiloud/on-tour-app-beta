import React, { useState } from 'react';
import { X, Plane, Search, Calendar, Loader2, CheckCircle2, AlertCircle, ArrowRight, Info } from 'lucide-react';
import { createTrip, addSegment } from '../../services/trips';
import { smartLookup, type FlightLookupResult } from '../../services/flightLookup';
import { t } from '../../lib/i18n';

interface AddFlightModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'input' | 'search' | 'select' | 'confirm';

export const AddFlightModal: React.FC<AddFlightModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<Step>('input');
    const [lookupInput, setLookupInput] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [lookupType, setLookupType] = useState<'booking' | 'flight'>('booking');
    const [results, setResults] = useState<FlightLookupResult[]>([]);
    const [selectedFlight, setSelectedFlight] = useState<FlightLookupResult | null>(null);
    const [error, setError] = useState('');
    const [tripTitle, setTripTitle] = useState('');

    if (!isOpen) return null; const handleSearch = async () => {
        if (!lookupInput.trim()) {
            setError('Please enter a booking reference or flight number');
            return;
        }

        setIsSearching(true);
        setError('');
        setStep('search');

        try {
            const lookup = await smartLookup(lookupInput.trim(), searchDate || undefined);
            setLookupType(lookup.type);
            setResults(lookup.results);

            if (lookup.results.length === 0) {
                setError('No flights found. Please check your booking reference or flight number.');
                setStep('input');
            } else if (lookup.results.length === 1 && lookup.results[0]) {
                // Auto-select if only one result
                setSelectedFlight(lookup.results[0]);
                setStep('confirm');
            } else {
                setStep('select');
            }
        } catch (err) {
            setError('Failed to lookup flight. Please try again.');
            setStep('input');
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectFlight = (flight: FlightLookupResult) => {
        setSelectedFlight(flight);
        setStep('confirm');
    };

    const handleConfirm = async () => {
        if (!selectedFlight) return;

        setIsSearching(true);
        try {
            // Create or find trip
            const title = tripTitle.trim() || `${selectedFlight.originCity} - ${selectedFlight.destCity}`;
            const trip = createTrip({
                title,
                status: 'booked'
            });

            // Add flight segment
            const depDateTime = new Date(`${selectedFlight.depDate}T${selectedFlight.depTime}`).toISOString();
            const arrDateTime = new Date(`${selectedFlight.arrDate}T${selectedFlight.arrTime}`).toISOString();

            await addSegment(trip.id, {
                type: 'flight',
                from: selectedFlight.origin,
                to: selectedFlight.dest,
                dep: depDateTime,
                arr: arrDateTime,
                carrier: selectedFlight.carrierName,
                pnr: selectedFlight.bookingRef || selectedFlight.flightNumber,
                price: selectedFlight.price,
                currency: (selectedFlight.currency as any) || 'EUR',
                fareClass: selectedFlight.class
            });

            // Reset and close
            handleReset();
            onClose();
        } catch (err) {
            setError('Failed to add flight. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleReset = () => {
        setStep('input');
        setLookupInput('');
        setSearchDate('');
        setResults([]);
        setSelectedFlight(null);
        setError('');
        setTripTitle('');
        setLookupType('booking');
    };

    const handleClose = () => {
        if (!isSearching) {
            handleReset();
            onClose();
        }
    };

    const renderInput = () => (
        <div className="p-6 space-y-6">
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-500/20 mb-4">
                    <Plane className="w-8 h-8 text-accent-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('travel.addPurchasedFlight')}</h3>
                <p className="text-sm text-slate-400 dark:text-white/60">{t('travel.addFlightDescription')}</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-white/70 mb-2">
                    Localizador o Número de Vuelo
                </label>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-white/40" />
                    <input
                        type="text"
                        value={lookupInput}
                        onChange={(e) => setLookupInput(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="ABC123 o KL1662"
                        autoFocus
                        className="w-full pl-12 pr-4 py-3.5 bg-ink-800 border border-accent-500/30 rounded-xl text-white text-lg placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30 transition-all"
                    />
                </div>
                <div className="flex items-start gap-2 mt-2">
                    <Info className="w-4 h-4 text-slate-400 dark:text-white/40 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-300 dark:text-white/40">
                        Lo encuentras en tu email de confirmación o billete electrónico
                    </p>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-white/70 mb-2">
                    Fecha del Vuelo (Opcional)
                </label>
                <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-white/40" />
                    <input
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-ink-800 border border-accent-500/20 rounded-xl text-white focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30 transition-all"
                    />
                </div>
                <p className="text-xs text-slate-400 dark:text-white/40 mt-2">
                    Ayuda a encontrar el vuelo correcto si hay múltiples opciones
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}

            <button
                onClick={handleSearch}
                disabled={!lookupInput.trim() || isSearching}
                className="w-full px-4 py-3.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-black font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSearching ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Buscando...</span>
                    </>
                ) : (
                    <>
                        <Search className="w-5 h-5" />
                        <span>{t('travel.search.searchMyFlight')}</span>
                    </>
                )}
            </button>
        </div>
    );

    const renderSearch = () => (
        <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-accent-400 animate-spin mb-4" />
            <p className="text-slate-900 dark:text-white font-medium">Looking up flight...</p>
            <p className="text-slate-300 dark:text-white/50 text-sm mt-1">{lookupInput}</p>
        </div>
    );

    const renderSelect = () => (
        <div className="p-6 space-y-4">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-1">Select Your Flight</h3>
                <p className="text-sm text-slate-400 dark:text-white/60">
                    {results.length} {lookupType === 'flight' ? 'flights' : 'bookings'} found for {lookupInput}
                </p>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {results.map((flight, index) => (
                    <div key={index} className="bg-dark-800/50 hover:bg-dark-800 border border-slate-200 dark:border-white/10 hover:border-accent-500/50 rounded-xl transition-all group">
                        <button
                            onClick={() => handleSelectFlight(flight)}
                            className="w-full p-5 text-left"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-accent-500/20 transition-colors">
                                        <Plane className="w-5 h-5 text-accent-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{flight.carrierName}</div>
                                        <div className="text-xs text-slate-300 dark:text-white/50">{flight.flightNumber}</div>
                                    </div>
                                </div>
                                {flight.bookingRef && (
                                    <div className="px-2 py-1 bg-accent-500/20 rounded text-xs font-medium text-accent-400">
                                        {flight.bookingRef}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="text-xl font-light text-slate-900 dark:text-white">{flight.depTime}</div>
                                    <div className="text-xs text-slate-300 dark:text-white/40">{flight.origin}</div>
                                    <div className="text-sm text-slate-400 dark:text-white/60">{flight.originCity}</div>
                                </div>

                                <div className="flex-shrink-0">
                                    <ArrowRight className="w-5 h-5 text-slate-200 dark:text-white/30" />
                                </div>

                                <div className="flex-1 text-right">
                                    <div className="text-xl font-light text-slate-900 dark:text-white">{flight.arrTime}</div>
                                    <div className="text-xs text-slate-300 dark:text-white/40">{flight.dest}</div>
                                    <div className="text-sm text-slate-400 dark:text-white/60">{flight.destCity}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                <div className="text-xs text-slate-300 dark:text-white/50">
                                    {new Date(flight.depDate).toLocaleDateString('es-ES', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                                <div className="text-xs text-slate-300 dark:text-white/50">{flight.duration}</div>
                                {flight.class && (
                                    <div className="text-xs text-slate-300 dark:text-white/50">{flight.class}</div>
                                )}
                                {flight.price && (
                                    <div className="text-xs font-medium text-accent-400">
                                        {flight.price} {flight.currency}
                                    </div>
                                )}
                            </div>
                        </button>

                        {/* Book Now Button */}
                        {flight.bookingUrl && (
                            <div className="px-5 pb-4">
                                <a
                                    href={flight.bookingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full px-4 py-2.5 bg-accent-500/20 hover:bg-accent-500 text-accent-400 hover:text-black border border-accent-500/30 rounded-lg text-sm font-medium transition-all text-center"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Reservar en {flight.carrierName} →
                                </a>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={() => setStep('input')}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/15 text-white border border-slate-200 dark:border-white/10 transition-colors font-medium"
            >
                Search Again
            </button>
        </div>
    );

    const renderConfirm = () => {
        if (!selectedFlight) return null;

        return (
            <div className="p-6 space-y-6">
                <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-3">
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">Flight Found!</h3>
                    <p className="text-sm text-slate-400 dark:text-white/60">Confirm the details below</p>
                </div>

                {/* Flight Details Card */}
                <div className="bg-dark-800/50 rounded-xl border border-accent-500/30 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-accent-500/20 flex items-center justify-center">
                            <Plane className="w-6 h-6 text-accent-400" />
                        </div>
                        <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{selectedFlight.carrierName}</div>
                            <div className="text-sm text-slate-300 dark:text-white/50">{selectedFlight.flightNumber}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                            <div className="text-2xl font-light text-slate-900 dark:text-white mb-1">{selectedFlight.depTime}</div>
                            <div className="text-sm text-slate-300 dark:text-white/40">{selectedFlight.origin}</div>
                            <div className="text-base text-slate-500 dark:text-white/70">{selectedFlight.originCity}</div>
                        </div>

                        <div className="flex-shrink-0">
                            <div className="text-xs text-slate-400 dark:text-white/40 mb-1 text-center">{selectedFlight.duration}</div>
                            <ArrowRight className="w-6 h-6 text-accent-400" />
                        </div>

                        <div className="flex-1 text-right">
                            <div className="text-2xl font-light text-slate-900 dark:text-white mb-1">{selectedFlight.arrTime}</div>
                            <div className="text-sm text-slate-300 dark:text-white/40">{selectedFlight.dest}</div>
                            <div className="text-base text-slate-500 dark:text-white/70">{selectedFlight.destCity}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                        <div>
                            <div className="text-xs text-slate-400 dark:text-white/40 mb-1">Date</div>
                            <div className="text-sm text-slate-900 dark:text-white">
                                {new Date(selectedFlight.depDate).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </div>
                        </div>
                        {selectedFlight.bookingRef && (
                            <div>
                                <div className="text-xs text-slate-400 dark:text-white/40 mb-1">Booking Ref</div>
                                <div className="text-sm text-white font-medium">{selectedFlight.bookingRef}</div>
                            </div>
                        )}
                        {selectedFlight.class && (
                            <div>
                                <div className="text-xs text-slate-400 dark:text-white/40 mb-1">Class</div>
                                <div className="text-sm text-slate-900 dark:text-white">{selectedFlight.class}</div>
                            </div>
                        )}
                        {selectedFlight.aircraft && (
                            <div>
                                <div className="text-xs text-slate-400 dark:text-white/40 mb-1">Aircraft</div>
                                <div className="text-sm text-slate-900 dark:text-white">{selectedFlight.aircraft}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Trip Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-white/70 mb-2">
                        Trip Name (Optional)
                    </label>
                    <input
                        type="text"
                        value={tripTitle}
                        onChange={(e) => setTripTitle(e.target.value)}
                        placeholder={`${selectedFlight.originCity} - ${selectedFlight.destCity}`}
                        className="w-full px-4 py-3 bg-ink-800 border border-accent-500/20 rounded-lg text-white placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30"
                    />
                </div>

                {/* Book on Airline Website */}
                {selectedFlight.bookingUrl && (
                    <a
                        href={selectedFlight.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full px-4 py-3 bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/30 rounded-lg text-sm font-medium transition-all text-center"
                    >
                        🌐 Reservar directamente en {selectedFlight.carrierName} →
                    </a>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={() => setStep('input')}
                        disabled={isSearching}
                        className="flex-1 px-4 py-3 rounded-lg bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/15 text-white border border-slate-200 dark:border-white/10 transition-colors disabled:opacity-50 font-medium"
                    >
                        {t('travel.search.searchAgain')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isSearching}
                        className="flex-1 px-4 py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-black transition-colors disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                    >
                        {isSearching ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Añadiendo...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                <span>{t('travel.addFlight')}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-ink-900 rounded-2xl border-2 border-accent-500/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-ink-900 border-b border-slate-200 dark:border-white/10 px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center">
                            <Plane className="w-4 h-4 text-accent-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {step === 'input' && 'Add Flight'}
                            {step === 'search' && 'Searching...'}
                            {step === 'select' && 'Select Flight'}
                            {step === 'confirm' && 'Confirm Flight'}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isSearching}
                        className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-white/70 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                {step === 'input' && renderInput()}
                {step === 'search' && renderSearch()}
                {step === 'select' && renderSelect()}
                {step === 'confirm' && renderConfirm()}
            </div>
        </div>
    );
};
