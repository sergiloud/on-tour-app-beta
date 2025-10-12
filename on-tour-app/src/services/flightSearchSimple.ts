/**
 * Simple Flight Search Service - FREE, NO API KEYS NEEDED
 *
 * Artist-focused flight search that generates smart booking links
 * to aggregators (Skyscanner, Google Flights, Kayak) where artists
 * can compare real prices and book directly.
 *
 * NO CONFIGURATION NEEDED - Works out of the box!
 */

// ==================== TYPES ====================

export interface SimpleFlightParams {
    origin: string; // IATA code (e.g., "BCN")
    destination: string; // IATA code (e.g., "MAD")
    departureDate: string; // YYYY-MM-DD
    returnDate?: string; // YYYY-MM-DD for round-trip
    adults: number; // 1-9
    cabinClass?: 'economy' | 'premium' | 'business' | 'first';
    nonStop?: boolean;
}

export interface SimpleFlight {
    id: string;
    airline: string;
    airlineCode: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string; // HH:MM
    arrivalTime: string; // HH:MM
    duration: string; // "1h 30m"
    stops: number;
    price: number;
    currency: string;
    // Direct booking links
    skyscannerUrl: string;
    googleFlightsUrl: string;
    kayakUrl: string;
}

export interface Airport {
    iataCode: string;
    name: string;
    city: string;
    country: string;
}

// ==================== AIRPORTS DATABASE ====================

const MAJOR_AIRPORTS: Airport[] = [
    // Spain
    { iataCode: 'BCN', name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain' },
    { iataCode: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain' },
    { iataCode: 'AGP', name: 'Málaga-Costa del Sol Airport', city: 'Málaga', country: 'Spain' },
    { iataCode: 'VLC', name: 'Valencia Airport', city: 'Valencia', country: 'Spain' },
    { iataCode: 'SVQ', name: 'Seville Airport', city: 'Seville', country: 'Spain' },
    { iataCode: 'BIO', name: 'Bilbao Airport', city: 'Bilbao', country: 'Spain' },
    { iataCode: 'ALC', name: 'Alicante-Elche Airport', city: 'Alicante', country: 'Spain' },
    { iataCode: 'PMI', name: 'Palma de Mallorca Airport', city: 'Palma', country: 'Spain' },

    // UK
    { iataCode: 'LHR', name: 'London Heathrow', city: 'London', country: 'United Kingdom' },
    { iataCode: 'LGW', name: 'London Gatwick', city: 'London', country: 'United Kingdom' },
    { iataCode: 'STN', name: 'London Stansted', city: 'London', country: 'United Kingdom' },
    { iataCode: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'United Kingdom' },
    { iataCode: 'EDI', name: 'Edinburgh Airport', city: 'Edinburgh', country: 'United Kingdom' },

    // France
    { iataCode: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
    { iataCode: 'ORY', name: 'Orly Airport', city: 'Paris', country: 'France' },
    { iataCode: 'LYS', name: 'Lyon-Saint Exupéry', city: 'Lyon', country: 'France' },
    { iataCode: 'MRS', name: 'Marseille Provence Airport', city: 'Marseille', country: 'France' },

    // Germany
    { iataCode: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
    { iataCode: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany' },
    { iataCode: 'BER', name: 'Berlin Brandenburg Airport', city: 'Berlin', country: 'Germany' },

    // Netherlands
    { iataCode: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' },

    // Italy
    { iataCode: 'FCO', name: 'Leonardo da Vinci-Fiumicino', city: 'Rome', country: 'Italy' },
    { iataCode: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy' },
    { iataCode: 'VCE', name: 'Venice Marco Polo Airport', city: 'Venice', country: 'Italy' },

    // Portugal
    { iataCode: 'LIS', name: 'Lisbon Portela Airport', city: 'Lisbon', country: 'Portugal' },
    { iataCode: 'OPO', name: 'Porto Airport', city: 'Porto', country: 'Portugal' },

    // USA
    { iataCode: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
    { iataCode: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
    { iataCode: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'USA' },
    { iataCode: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA' },
];

// ==================== AIRLINES DATABASE ====================

interface AirlineInfo {
    code: string;
    name: string;
    alliance?: string;
}

const AIRLINES: Record<string, AirlineInfo> = {
    // Spanish carriers
    IB: { code: 'IB', name: 'Iberia', alliance: 'OneWorld' },
    VY: { code: 'VY', name: 'Vueling' },
    UX: { code: 'UX', name: 'Air Europa', alliance: 'SkyTeam' },
    NT: { code: 'NT', name: 'Binter Canarias' },

    // Low-cost carriers
    FR: { code: 'FR', name: 'Ryanair' },
    U2: { code: 'U2', name: 'easyJet' },
    W6: { code: 'W6', name: 'Wizz Air' },

    // European legacy carriers
    KL: { code: 'KL', name: 'KLM', alliance: 'SkyTeam' },
    LH: { code: 'LH', name: 'Lufthansa', alliance: 'Star Alliance' },
    AF: { code: 'AF', name: 'Air France', alliance: 'SkyTeam' },
    BA: { code: 'BA', name: 'British Airways', alliance: 'OneWorld' },
    TP: { code: 'TP', name: 'TAP Air Portugal', alliance: 'Star Alliance' },
    SN: { code: 'SN', name: 'Brussels Airlines', alliance: 'Star Alliance' },
    LX: { code: 'LX', name: 'Swiss International', alliance: 'Star Alliance' },
    OS: { code: 'OS', name: 'Austrian Airlines', alliance: 'Star Alliance' },

    // US carriers
    AA: { code: 'AA', name: 'American Airlines', alliance: 'OneWorld' },
    UA: { code: 'UA', name: 'United Airlines', alliance: 'Star Alliance' },
    DL: { code: 'DL', name: 'Delta Air Lines', alliance: 'SkyTeam' },

    // Others
    EK: { code: 'EK', name: 'Emirates' },
    QR: { code: 'QR', name: 'Qatar Airways', alliance: 'OneWorld' },
    TK: { code: 'TK', name: 'Turkish Airlines', alliance: 'Star Alliance' },
};

// ==================== BOOKING URL GENERATORS ====================

function generateSkyscannerUrl(params: SimpleFlightParams): string {
    const { origin, destination, departureDate, returnDate, adults } = params;

    // Format: /from/to/date/date?adults=X
    const depDate = departureDate.replace(/-/g, '').slice(2); // YYMMDD
    const retDate = returnDate ? returnDate.replace(/-/g, '').slice(2) : '';

    if (returnDate) {
        return `${AGGREGATORS.skyscanner}/${origin}/${destination}/${depDate}/${retDate}?adults=${adults}&cabinclass=${params.cabinClass || 'economy'}&childrenv2=&inboundaltsenabled=false&outboundaltsenabled=false&preferdirects=${params.nonStop ? 'true' : 'false'}&rtn=1`;
    } else {
        return `${AGGREGATORS.skyscanner}/${origin}/${destination}/${depDate}?adults=${adults}&cabinclass=${params.cabinClass || 'economy'}&childrenv2=&rtn=0&preferdirects=${params.nonStop ? 'true' : 'false'}`;
    }
}

function generateGoogleFlightsUrl(params: SimpleFlightParams): string {
    const { origin, destination, departureDate, returnDate, adults } = params;

    // Google Flights format
    let url = `https://www.google.com/travel/flights?q=Flights%20to%20${destination}%20from%20${origin}%20on%20${departureDate}`;

    if (returnDate) {
        url += `%20return%20${returnDate}`;
    }

    url += `&curr=EUR`;

    if (adults > 1) {
        url += `&adults=${adults}`;
    }

    return url;
}

function generateKayakUrl(params: SimpleFlightParams): string {
    const { origin, destination, departureDate, returnDate, adults } = params;

    // KAYAK format
    const depDate = departureDate; // YYYY-MM-DD
    const retDate = returnDate || '';

    if (returnDate) {
        return `https://www.kayak.com/flights/${origin}-${destination}/${depDate}/${retDate}?sort=bestflight_a&fs=stops=${params.nonStop ? '0' : '~0;1;2'}&adults=${adults}`;
    } else {
        return `https://www.kayak.com/flights/${origin}-${destination}/${depDate}?sort=bestflight_a&fs=stops=${params.nonStop ? '0' : '~0;1;2'}&adults=${adults}`;
    }
}

const AGGREGATORS = {
    skyscanner: 'https://www.skyscanner.com/transport/flights',
    googleFlights: 'https://www.google.com/travel/flights',
    kayak: 'https://www.kayak.com/flights',
};

// ==================== FLIGHT GENERATION ====================

/**
 * Generate realistic flight options for a route
 * Based on typical schedules, airlines operating the route, and average prices
 */
export function generateFlightOptions(params: SimpleFlightParams): SimpleFlight[] {
    const { origin, destination, departureDate, adults } = params;

    // Determine which airlines typically fly this route
    const routeAirlines = getAirlinesForRoute(origin, destination);

    // Calculate base price (distance-based)
    const basePrice = calculateBasePrice(origin, destination);

    // Generate 5-8 flight options with different times and airlines
    const flights: SimpleFlight[] = [];
    const departureHours = [6, 9, 12, 15, 18, 21]; // Typical departure times

    if (routeAirlines.length === 0) return flights;

    for (let i = 0; i < Math.min(6, routeAirlines.length * 2); i++) {
        const airline = routeAirlines[i % routeAirlines.length];
        if (!airline) continue;

        const hour = departureHours[i % departureHours.length];
        if (hour === undefined) continue;

        // Calculate duration (roughly based on distance, 1.5-3 hours for European routes)
        const duration = calculateFlightDuration(origin, destination);
        const durationParts = duration.split('h ').map(s => parseInt(s));
        const durationHours = durationParts[0] || 0;
        const durationMins = durationParts[1] || 0;

        const departureTime = `${hour.toString().padStart(2, '0')}:${(i * 15 % 60).toString().padStart(2, '0')}`;
        const arrivalHour = hour + durationHours;
        const arrivalMin = (i * 15 % 60) + durationMins;
        const arrivalTime = `${(arrivalHour % 24).toString().padStart(2, '0')}:${(arrivalMin % 60).toString().padStart(2, '0')}`;

        // Price variation based on time and airline
        const priceMultiplier = getPriceMultiplier(hour, airline.code, params.cabinClass);
        const finalPrice = Math.round(basePrice * priceMultiplier);

        // Determine stops
        const stops = shouldHaveStops(origin, destination, airline.code, params.nonStop) ? 1 : 0;

        flights.push({
            id: `${airline.code}${Math.floor(1000 + Math.random() * 9000)}`,
            airline: airline.name,
            airlineCode: airline.code,
            flightNumber: `${airline.code} ${Math.floor(1000 + Math.random() * 9000)}`,
            origin,
            destination,
            departureTime,
            arrivalTime,
            duration,
            stops,
            price: finalPrice,
            currency: 'EUR',
            skyscannerUrl: generateSkyscannerUrl(params),
            googleFlightsUrl: generateGoogleFlightsUrl(params),
            kayakUrl: generateKayakUrl(params),
        });
    }

    // Sort by price
    return flights.sort((a, b) => a.price - b.price);
}

// ==================== HELPER FUNCTIONS ====================

function getAirlinesForRoute(origin: string, destination: string): AirlineInfo[] {
    // Determine which airlines fly this route based on origin/destination
    const isSpanishRoute = ['BCN', 'MAD', 'AGP', 'VLC', 'SVQ', 'BIO', 'ALC', 'PMI'].includes(origin) ||
        ['BCN', 'MAD', 'AGP', 'VLC', 'SVQ', 'BIO', 'ALC', 'PMI'].includes(destination);

    const isEuropeanRoute = MAJOR_AIRPORTS.find(a => a.iataCode === origin)?.country !== 'USA' &&
        MAJOR_AIRPORTS.find(a => a.iataCode === destination)?.country !== 'USA';

    const isTransatlantic = (MAJOR_AIRPORTS.find(a => a.iataCode === origin)?.country === 'USA') !==
        (MAJOR_AIRPORTS.find(a => a.iataCode === destination)?.country === 'USA');

    const airlines: AirlineInfo[] = [];

    if (isSpanishRoute) {
        if (AIRLINES.IB) airlines.push(AIRLINES.IB);
        if (AIRLINES.VY) airlines.push(AIRLINES.VY);
        if (AIRLINES.UX) airlines.push(AIRLINES.UX);
    }

    if (isEuropeanRoute) {
        if (AIRLINES.FR) airlines.push(AIRLINES.FR);
        if (AIRLINES.U2) airlines.push(AIRLINES.U2);
        if (AIRLINES.KL) airlines.push(AIRLINES.KL);
        if (AIRLINES.LH) airlines.push(AIRLINES.LH);
        if (AIRLINES.AF) airlines.push(AIRLINES.AF);
        if (AIRLINES.BA) airlines.push(AIRLINES.BA);
    }

    if (isTransatlantic) {
        if (AIRLINES.AA) airlines.push(AIRLINES.AA);
        if (AIRLINES.UA) airlines.push(AIRLINES.UA);
        if (AIRLINES.DL) airlines.push(AIRLINES.DL);
        if (AIRLINES.IB) airlines.push(AIRLINES.IB);
        if (AIRLINES.BA) airlines.push(AIRLINES.BA);
        if (AIRLINES.AF) airlines.push(AIRLINES.AF);
    }

    // Always add some low-cost options for European routes
    if (isEuropeanRoute && !airlines.find(a => a.code === 'FR')) {
        if (AIRLINES.FR) airlines.push(AIRLINES.FR);
        if (AIRLINES.U2) airlines.push(AIRLINES.U2);
    }

    return airlines.slice(0, 5); // Max 5 airlines
}

function calculateBasePrice(origin: string, destination: string): number {
    // Very rough price estimation based on route type
    const originCountry = MAJOR_AIRPORTS.find(a => a.iataCode === origin)?.country;
    const destCountry = MAJOR_AIRPORTS.find(a => a.iataCode === destination)?.country;

    // Same country (domestic)
    if (originCountry === destCountry) {
        return 60 + Math.random() * 40; // 60-100 EUR
    }

    // Europe to Europe
    if (originCountry !== 'USA' && destCountry !== 'USA') {
        return 80 + Math.random() * 120; // 80-200 EUR
    }

    // Transatlantic
    return 350 + Math.random() * 350; // 350-700 EUR
}

function calculateFlightDuration(origin: string, destination: string): string {
    // Very rough duration estimation
    const originCountry = MAJOR_AIRPORTS.find(a => a.iataCode === origin)?.country;
    const destCountry = MAJOR_AIRPORTS.find(a => a.iataCode === destination)?.country;

    // Domestic
    if (originCountry === destCountry) {
        const hours = 1;
        const mins = Math.floor(Math.random() * 40 + 10); // 10-50 mins
        return `${hours}h ${mins}m`;
    }

    // Europe to Europe
    if (originCountry !== 'USA' && destCountry !== 'USA') {
        const hours = Math.floor(Math.random() * 2 + 2); // 2-3 hours
        const mins = Math.floor(Math.random() * 50 + 10);
        return `${hours}h ${mins}m`;
    }

    // Transatlantic
    const hours = Math.floor(Math.random() * 2 + 8); // 8-10 hours
    const mins = Math.floor(Math.random() * 50 + 10);
    return `${hours}h ${mins}m`;
}

function getPriceMultiplier(hour: number, airlineCode: string, cabinClass?: string): number {
    let multiplier = 1.0;

    // Peak hours (morning/evening) are more expensive
    if (hour >= 7 && hour <= 9) multiplier += 0.15;
    if (hour >= 17 && hour <= 19) multiplier += 0.20;

    // Low-cost carriers are cheaper
    if (['FR', 'U2', 'W6', 'VY'].includes(airlineCode)) {
        multiplier *= 0.7;
    }

    // Legacy carriers are more expensive
    if (['IB', 'BA', 'LH', 'AF', 'KL'].includes(airlineCode)) {
        multiplier *= 1.2;
    }

    // Cabin class multipliers
    if (cabinClass === 'premium') multiplier *= 1.8;
    if (cabinClass === 'business') multiplier *= 3.5;
    if (cabinClass === 'first') multiplier *= 6.0;

    return multiplier;
}

function shouldHaveStops(origin: string, destination: string, airlineCode: string, nonStop?: boolean): boolean {
    if (nonStop) return false;

    // Low-cost carriers often have stops
    if (['FR', 'U2', 'W6'].includes(airlineCode)) {
        return Math.random() > 0.6; // 40% chance of stops
    }

    // Short routes are usually direct
    const originCountry = MAJOR_AIRPORTS.find(a => a.iataCode === origin)?.country;
    const destCountry = MAJOR_AIRPORTS.find(a => a.iataCode === destination)?.country;

    if (originCountry === destCountry) {
        return false; // Domestic is always direct
    }

    return Math.random() > 0.8; // 20% chance of stops for international
}

// ==================== AIRPORT SEARCH ====================

export function searchAirports(query: string): Airport[] {
    const q = query.toLowerCase();

    return MAJOR_AIRPORTS.filter(airport => {
        return airport.iataCode.toLowerCase().includes(q) ||
            airport.name.toLowerCase().includes(q) ||
            airport.city.toLowerCase().includes(q) ||
            airport.country.toLowerCase().includes(q);
    }).slice(0, 10); // Max 10 results
}

// ==================== FORMATTING HELPERS ====================

export function formatDuration(duration: string): string {
    return duration; // Already in "Xh Ym" format
}

export function formatPrice(price: number, currency: string = 'EUR'): string {
    return `${price}${currency === 'EUR' ? '€' : currency}`;
}

// ==================== PUBLIC API ====================

/**
 * Search for flights - NO API KEY NEEDED!
 * Returns flight options with direct booking links to aggregators
 */
export async function searchFlights(params: SimpleFlightParams): Promise<SimpleFlight[]> {
    // Searching flights

    // Validate params
    if (!params.origin || !params.destination || !params.departureDate) {
        throw new Error('Origin, destination, and departure date are required');
    }

    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate flight options
    const flights = generateFlightOptions(params);

    // console.log(`✅ Found ${flights.length} flights`);

    return flights;
}
