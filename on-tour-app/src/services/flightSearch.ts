/**
 * Real Flight Search Service
 * Integrates with real flight APIs to provide live data
 * Using Amadeus Self-Service APIs (free tier: 2000 calls/month)
 */

import { logger } from '../lib/logger';

export interface FlightSearchParams {
    origin: string; // IATA code (e.g., "BCN")
    destination: string; // IATA code (e.g., "MAD")
    departureDate: string; // YYYY-MM-DD
    returnDate?: string; // YYYY-MM-DD for round-trip
    adults?: number;
    children?: number;
    infants?: number;
    cabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
    nonStop?: boolean;
    maxPrice?: number;
    currency?: string;
}

export interface FlightOffer {
    id: string;
    source: string;
    instantTicketingRequired: boolean;
    nonStop: boolean;
    validatingAirlineCodes: string[];
    price: {
        total: string;
        currency: string;
        grandTotal: string;
    };
    itineraries: FlightItinerary[];
    travelerPricings: TravelerPricing[];
    bookingUrl: string; // Direct airline booking link
}

export interface FlightItinerary {
    duration: string;
    segments: FlightSegment[];
}

export interface FlightSegment {
    departure: {
        iataCode: string;
        terminal?: string;
        at: string; // ISO datetime
    };
    arrival: {
        iataCode: string;
        terminal?: string;
        at: string; // ISO datetime
    };
    carrierCode: string;
    number: string;
    aircraft: {
        code: string;
    };
    operating?: {
        carrierCode: string;
    };
    duration: string;
    id: string;
    numberOfStops: number;
}

export interface TravelerPricing {
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
        total: string;
        currency: string;
    };
    fareDetailsBySegment: FareDetails[];
}

export interface FareDetails {
    segmentId: string;
    cabin: string;
    fareBasis: string;
    class: string;
    includedCheckedBags?: {
        quantity: number;
    };
}

export interface Airport {
    iataCode: string;
    name: string;
    city: string;
    country: string;
}

// Airline names mapping
const AIRLINE_NAMES: Record<string, string> = {
    'AA': 'American Airlines',
    'UA': 'United Airlines',
    'DL': 'Delta Air Lines',
    'BA': 'British Airways',
    'LH': 'Lufthansa',
    'AF': 'Air France',
    'KL': 'KLM Royal Dutch Airlines',
    'IB': 'Iberia',
    'VY': 'Vueling',
    'FR': 'Ryanair',
    'U2': 'easyJet',
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    'TK': 'Turkish Airlines',
    'UX': 'Air Europa',
    'TP': 'TAP Air Portugal',
    'AZ': 'ITA Airways',
    'SN': 'Brussels Airlines',
    'LX': 'Swiss International',
    'OS': 'Austrian Airlines',
};

// Airline booking URLs with proper search parameters
const getAirlineBookingUrl = (
    carrierCode: string,
    origin: string,
    destination: string,
    departureDate: string,
    returnDate?: string
): string => {
    const isRoundTrip = !!returnDate;
    const tripType = isRoundTrip ? 'round-trip' : 'one-way';

    const urls: Record<string, string> = {
        'KL': `https://www.klm.com/search/offers?departureDate=${departureDate}${returnDate ? `&returnDate=${returnDate}` : ''}&origin=${origin}&destination=${destination}`,
        'LH': `https://www.lufthansa.com/es/en/book-a-flight?origin=${origin}&destination=${destination}&outboundDate=${departureDate}${returnDate ? `&inboundDate=${returnDate}` : ''}`,
        'IB': `https://www.iberia.com/es/vuelos/${origin}-${destination}/?dates=${departureDate}${returnDate ? `_${returnDate}` : ''}`,
        'AA': `https://www.aa.com/booking/find-flights?tripType=${tripType}&origin=${origin}&destination=${destination}&departDate=${departureDate}${returnDate ? `&returnDate=${returnDate}` : ''}`,
        'BA': `https://www.britishairways.com/travel/book/public/en_gb?eId=106019&bookingType=${isRoundTrip ? 'RT' : 'OW'}&origin=${origin}&destination=${destination}&departureDate=${departureDate}${returnDate ? `&returnDate=${returnDate}` : ''}`,
        'AF': `https://www.airfrance.es/ES/es/search-flights?connections=direct&departure=${departureDate}&destinations=${destination}&origins=${origin}${returnDate ? `&return=${returnDate}` : ''}`,
        'DL': `https://www.delta.com/flight-search/book-a-flight?tripType=${tripType}&origin=${origin}&destination=${destination}&departureDate=${departureDate}${returnDate ? `&returnDate=${returnDate}` : ''}`,
        'UA': `https://www.united.com/en/us/fsr/choose-flights?f=${origin}&t=${destination}&d=${departureDate}${returnDate ? `&r=${returnDate}` : ''}&tt=${isRoundTrip ? '1' : '2'}`,
        'EK': `https://www.emirates.com/es/spanish/book/flights/?orig=${origin}&dest=${destination}&departdate=${departureDate}${returnDate ? `&returndate=${returnDate}` : ''}`,
        'VY': `https://www.vueling.com/es/vuelos/${origin}/${destination}/${departureDate}${returnDate ? `/${returnDate}` : ''}`,
        'UX': `https://www.aireuropa.com/es/vuelos/${origin}-${destination}?fecha_salida=${departureDate}${returnDate ? `&fecha_vuelta=${returnDate}` : ''}`,
        'FR': `https://www.ryanair.com/es/es/booking/home/${origin}/${destination}/${departureDate}${returnDate ? `/${returnDate}` : ''}`,
        'U2': `https://www.easyjet.com/en/flights/${origin}/${destination}?adults=1&children=0&infants=0&outbound_date=${departureDate}${returnDate ? `&return_date=${returnDate}` : ''}`,
        'TP': `https://www.flytap.com/es-es/flights/flight-search?origin=${origin}&destination=${destination}&outboundDate=${departureDate}${returnDate ? `&inboundDate=${returnDate}` : ''}`,
    };

    return urls[carrierCode] || `https://www.google.com/flights?hl=es#flt=${origin}.${destination}.${departureDate}${returnDate ? `*${destination}.${origin}.${returnDate}` : ''};c:EUR`;
};

/**
 * Get Amadeus API Access Token
 * Uses client credentials flow
 */
async function getAmadeusToken(): Promise<string> {
    // Get credentials from environment variables
    const clientId = import.meta.env.VITE_AMADEUS_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_AMADEUS_CLIENT_SECRET;
    const apiUrl = import.meta.env.VITE_AMADEUS_API_URL || 'https://test.api.amadeus.com';

    if (!clientId || !clientSecret) {
        logger.warn('Amadeus API credentials not configured. Using fallback mock data.', {
            service: 'flightSearch',
            action: 'getAccessToken'
        });
        logger.info('To use real flight data:', {
            steps: [
                'Visit https://developers.amadeus.com/register',
                'Create a free account and app',
                'Copy .env.example to .env',
                'Add your API credentials to .env'
            ]
        });
        throw new Error('Amadeus credentials not configured');
    }

    // Check if we have cached token
    const cached = sessionStorage.getItem('amadeus_token');
    const expiry = sessionStorage.getItem('amadeus_token_expiry');

    if (cached && expiry && Date.now() < parseInt(expiry)) {
        return cached;
    }

    try {
        const response = await fetch(`${apiUrl}/v1/security/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            logger.error('Amadeus authentication failed', new Error('Auth failed'), {
                service: 'flightSearch',
                errorData
            });
            throw new Error('Failed to get Amadeus token');
        }

        const data = await response.json();
        const token = data.access_token;
        const expiresIn = data.expires_in * 1000; // Convert to ms

        // Cache token
        sessionStorage.setItem('amadeus_token', token);
        sessionStorage.setItem('amadeus_token_expiry', (Date.now() + expiresIn).toString());

        logger.info('Amadeus API authenticated successfully', { service: 'flightSearch' });
        return token;
    } catch (error) {
        logger.error('Amadeus auth error', error as Error, { service: 'flightSearch' });
        throw error;
    }
}

/**
 * Search for real flights using Amadeus API
 */
export async function searchRealFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
    const apiUrl = import.meta.env.VITE_AMADEUS_API_URL || 'https://test.api.amadeus.com';

    try {
        const token = await getAmadeusToken();

        const queryParams = new URLSearchParams({
            originLocationCode: params.origin,
            destinationLocationCode: params.destination,
            departureDate: params.departureDate,
            adults: (params.adults || 1).toString(),
            ...(params.returnDate && { returnDate: params.returnDate }),
            ...(params.children && params.children > 0 && { children: params.children.toString() }),
            ...(params.infants && params.infants > 0 && { infants: params.infants.toString() }),
            ...(params.cabinClass && { travelClass: params.cabinClass }),
            ...(params.nonStop !== undefined && { nonStop: params.nonStop.toString() }),
            ...(params.maxPrice && { maxPrice: params.maxPrice.toString() }),
            currencyCode: params.currency || 'EUR',
            max: '50', // Limit results
        });

        logger.info('Searching flights via Amadeus API', {
            service: 'flightSearch',
            route: `${params.origin} → ${params.destination}`,
            date: params.departureDate,
            passengers: params.adults || 1,
        });

        const response = await fetch(
            `${apiUrl}/v2/shopping/flight-offers?${queryParams}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            logger.error('Amadeus API error', new Error(`Status ${response.status}`), {
                service: 'flightSearch',
                errorData
            });
            throw new Error(`Flight search failed: ${response.status}`);
        }

        const data = await response.json();

        logger.info(`Found ${data.data?.length || 0} real flights from Amadeus`, {
            service: 'flightSearch',
            count: data.data?.length || 0
        });

        // Transform Amadeus format to our format with booking URLs
        const offers: FlightOffer[] = data.data.map((offer: any) => {
            const firstSegment = offer.itineraries[0].segments[0];
            const carrierCode = firstSegment.carrierCode;

            return {
                ...offer,
                bookingUrl: getAirlineBookingUrl(
                    carrierCode,
                    params.origin,
                    params.destination,
                    params.departureDate,
                    params.returnDate
                ),
            };
        });

        return offers;
    } catch (error) {
        logger.error('Error searching flights via Amadeus', error as Error, {
            service: 'flightSearch',
            params
        });

        // Fallback to mock data if API fails
        logger.warn('Using fallback mock data with realistic prices and times', {
            service: 'flightSearch'
        });
        return generateMockFlights(params);
    }
}

/**
 * Fallback: Generate realistic mock flights if API fails
 */
function generateMockFlights(params: FlightSearchParams): FlightOffer[] {
    const carriers = ['IB', 'VY', 'FR', 'U2', 'UX'];
    const now = new Date();
    const basePrice = 50 + Math.random() * 200;

    return carriers.map((carrier, index) => {
        const depHour = 8 + index * 3;
        const duration = 60 + Math.random() * 60; // 1-2 hours

        const departure = new Date(params.departureDate);
        departure.setHours(depHour, 0, 0, 0);

        const arrival = new Date(departure);
        arrival.setMinutes(arrival.getMinutes() + duration);

        const price = (basePrice + index * 20).toFixed(2);

        return {
            id: `MOCK_${carrier}_${index}`,
            source: 'MOCK',
            instantTicketingRequired: false,
            nonStop: true,
            validatingAirlineCodes: [carrier],
            price: {
                total: price,
                currency: params.currency || 'EUR',
                grandTotal: price,
            },
            itineraries: [{
                duration: `PT${Math.floor(duration / 60)}H${duration % 60}M`,
                segments: [{
                    departure: {
                        iataCode: params.origin,
                        at: departure.toISOString(),
                    },
                    arrival: {
                        iataCode: params.destination,
                        at: arrival.toISOString(),
                    },
                    carrierCode: carrier,
                    number: `${carrier}${1000 + index}`,
                    aircraft: {
                        code: '320',
                    },
                    duration: `PT${Math.floor(duration / 60)}H${duration % 60}M`,
                    id: `${index + 1}`,
                    numberOfStops: 0,
                }],
            }],
            travelerPricings: [{
                travelerId: '1',
                fareOption: 'STANDARD',
                travelerType: 'ADULT',
                price: {
                    total: price,
                    currency: params.currency || 'EUR',
                },
                fareDetailsBySegment: [{
                    segmentId: '1',
                    cabin: params.cabinClass || 'ECONOMY',
                    fareBasis: 'TECO',
                    class: 'T',
                    includedCheckedBags: {
                        quantity: 1,
                    },
                }],
            }],
            bookingUrl: getAirlineBookingUrl(
                carrier,
                params.origin,
                params.destination,
                params.departureDate,
                params.returnDate
            ),
        };
    });
}

/**
 * Get airline name from code
 */
export function getAirlineName(code: string): string {
    return AIRLINE_NAMES[code] || code;
}

/**
 * Format duration from ISO 8601 (PT2H30M) to readable format (2h 30m)
 */
export function formatDuration(isoDuration: string): string {
    const matches = isoDuration.match(/PT(\d+H)?(\d+M)?/);
    if (!matches) return isoDuration;

    const hours = matches[1] ? matches[1].replace('H', 'h ') : '';
    const minutes = matches[2] ? matches[2].replace('M', 'm') : '';

    return `${hours}${minutes}`.trim();
}

/**
 * Format datetime for display
 */
export function formatFlightTime(isoDateTime: string): { date: string; time: string } {
    const date = new Date(isoDateTime);
    return {
        date: date.toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        }),
        time: date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
        }),
    };
}

/**
 * Calculate total duration across all segments
 */
export function calculateTotalDuration(segments: FlightSegment[]): string {
    if (segments.length === 0) return '0h 0m';
    const firstSeg = segments[0];
    const lastSeg = segments[segments.length - 1];
    if (!firstSeg || !lastSeg) return '0h 0m';

    const firstDep = new Date(firstSeg.departure.at);
    const lastArr = new Date(lastSeg.arrival.at);
    const diffMs = lastArr.getTime() - firstDep.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return `${hours}h ${minutes}m`;
}

/**
 * Search airports by query
 */
export async function searchAirports(query: string): Promise<Airport[]> {
    if (query.length < 2) return [];

    const apiUrl = import.meta.env.VITE_AMADEUS_API_URL || 'https://test.api.amadeus.com';

    try {
        const token = await getAmadeusToken();

        const response = await fetch(
            `${apiUrl}/v1/reference-data/locations?subType=AIRPORT&keyword=${encodeURIComponent(query)}&page[limit]=10`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Airport search failed');
        }

        const data = await response.json();

        return data.data.map((airport: any) => ({
            iataCode: airport.iataCode,
            name: airport.name,
            city: airport.address?.cityName || '',
            country: airport.address?.countryName || '',
        }));
    } catch (error) {
        logger.error('Airport search error', error as Error, {
            service: 'flightSearch',
            query
        });
        return getFallbackAirports(query);
    }
}

/**
 * Fallback airport data for common airports
 */
function getFallbackAirports(query: string): Airport[] {
    const airports: Airport[] = [
        { iataCode: 'BCN', name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain' },
        { iataCode: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain' },
        { iataCode: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands' },
        { iataCode: 'LHR', name: 'London Heathrow', city: 'London', country: 'United Kingdom' },
        { iataCode: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France' },
        { iataCode: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
        { iataCode: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany' },
        { iataCode: 'FCO', name: 'Rome Fiumicino', city: 'Rome', country: 'Italy' },
        { iataCode: 'LIS', name: 'Lisbon Portela Airport', city: 'Lisbon', country: 'Portugal' },
        { iataCode: 'VLC', name: 'Valencia Airport', city: 'Valencia', country: 'Spain' },
        { iataCode: 'AGP', name: 'Málaga-Costa del Sol Airport', city: 'Málaga', country: 'Spain' },
        { iataCode: 'SVQ', name: 'Seville Airport', city: 'Seville', country: 'Spain' },
        { iataCode: 'BIO', name: 'Bilbao Airport', city: 'Bilbao', country: 'Spain' },
        { iataCode: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
        { iataCode: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
        { iataCode: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'USA' },
    ];

    const lowerQuery = query.toLowerCase();
    return airports.filter(airport =>
        airport.iataCode.toLowerCase().includes(lowerQuery) ||
        airport.name.toLowerCase().includes(lowerQuery) ||
        airport.city.toLowerCase().includes(lowerQuery)
    );
}
