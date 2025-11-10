/**
 * Flight Lookup Service
 * Simulates fetching flight data from booking reference or flight number
 * In production, this would call airline APIs or flight data providers
 */

export interface FlightLookupResult {
    type: 'booking' | 'flight';
    flightNumber: string;
    carrierCode: string;
    carrierName: string;
    origin: string;
    originCity: string;
    dest: string;
    destCity: string;
    depDate: string;
    depTime: string;
    arrDate: string;
    arrTime: string;
    duration: string;
    bookingRef?: string;
    price?: number;
    currency?: string;
    class?: string;
    aircraft?: string;
    bookingUrl?: string; // Direct link to airline booking page
}

// Airline booking URLs - Real airline websites
const getAirlineBookingUrl = (carrierCode: string, flightNumber: string, date: string): string => {
    const urls: Record<string, string> = {
        'KL': `https://www.klm.com/search/offers?origin=&destination=&flightNumber=${flightNumber}&departureDate=${date}`,
        'LH': `https://www.lufthansa.com/es/en/flight-search?flightNumber=${flightNumber}&date=${date}`,
        'IB': `https://www.iberia.com/es/vuelos/buscar-vuelos/?flightNumber=${flightNumber}&date=${date}`,
        'AA': `https://www.aa.com/booking/search?flightNumber=${flightNumber}&date=${date}`,
        'BA': `https://www.britishairways.com/travel/book/public/en_gb?flightNumber=${flightNumber}&date=${date}`,
        'AF': `https://www.airfrance.es/ES/es/search-flights?flightNumber=${flightNumber}&date=${date}`,
        'DL': `https://www.delta.com/flight-search?flightNumber=${flightNumber}&date=${date}`,
        'UA': `https://www.united.com/ual/es/us/flight-search/book-a-flight?flightNumber=${flightNumber}&date=${date}`,
        'EK': `https://www.emirates.com/es/spanish/book/flights/?flightNumber=${flightNumber}&date=${date}`,
        'VY': `https://www.vueling.com/es/vuelos?flightNumber=${flightNumber}&date=${date}`,
        'UX': `https://www.aireuropa.com/es/vuelos/?flightNumber=${flightNumber}&date=${date}`,
        'FR': `https://www.ryanair.com/es/es/reservar-vuelos?flightNumber=${flightNumber}&date=${date}`
    };
    return urls[carrierCode] || `https://www.google.com/flights?q=${flightNumber}`;
};

// Mock flight data - In a real app, this would come from an API
const MOCK_FLIGHTS: Record<string, FlightLookupResult[]> = {
    // KLM flights
    'KL1662': [
        {
            type: 'flight',
            flightNumber: 'KL1662',
            carrierCode: 'KL',
            carrierName: 'KLM Royal Dutch Airlines',
            origin: 'BCN',
            originCity: 'Barcelona',
            dest: 'AMS',
            destCity: 'Amsterdam',
            depDate: '2025-10-15',
            depTime: '14:30',
            arrDate: '2025-10-15',
            arrTime: '16:45',
            duration: '2h 15m',
            aircraft: 'Boeing 737-800',
            class: 'Economy',
            price: 189,
            currency: 'EUR',
            bookingUrl: getAirlineBookingUrl('KL', 'KL1662', '2025-10-15')
        },
        {
            type: 'flight',
            flightNumber: 'KL1662',
            carrierCode: 'KL',
            carrierName: 'KLM Royal Dutch Airlines',
            origin: 'BCN',
            originCity: 'Barcelona',
            dest: 'AMS',
            destCity: 'Amsterdam',
            depDate: '2025-10-22',
            depTime: '14:30',
            arrDate: '2025-10-22',
            arrTime: '16:45',
            duration: '2h 15m',
            aircraft: 'Boeing 737-800',
            class: 'Economy',
            price: 195,
            currency: 'EUR',
            bookingUrl: getAirlineBookingUrl('KL', 'KL1662', '2025-10-22')
        }
    ],
    'KL643': [
        {
            type: 'flight',
            flightNumber: 'KL643',
            carrierCode: 'KL',
            carrierName: 'KLM Royal Dutch Airlines',
            origin: 'AMS',
            originCity: 'Amsterdam',
            dest: 'MIA',
            destCity: 'Miami',
            depDate: '2025-10-20',
            depTime: '10:15',
            arrDate: '2025-10-20',
            arrTime: '14:30',
            duration: '10h 15m',
            aircraft: 'Boeing 787-9',
            class: 'Economy',
            price: 649,
            currency: 'EUR',
            bookingUrl: getAirlineBookingUrl('KL', 'KL643', '2025-10-20')
        }
    ],
    // Lufthansa
    'LH1120': [
        {
            type: 'flight',
            flightNumber: 'LH1120',
            carrierCode: 'LH',
            carrierName: 'Lufthansa',
            origin: 'BCN',
            originCity: 'Barcelona',
            dest: 'FRA',
            destCity: 'Frankfurt',
            depDate: '2025-11-05',
            depTime: '06:30',
            arrDate: '2025-11-05',
            arrTime: '08:45',
            duration: '2h 15m',
            aircraft: 'Airbus A320',
            class: 'Economy',
            price: 149,
            currency: 'EUR',
            bookingUrl: getAirlineBookingUrl('LH', 'LH1120', '2025-11-05')
        }
    ],
    // Iberia
    'IB3201': [
        {
            type: 'flight',
            flightNumber: 'IB3201',
            carrierCode: 'IB',
            carrierName: 'Iberia',
            origin: 'MAD',
            originCity: 'Madrid',
            dest: 'BCN',
            destCity: 'Barcelona',
            depDate: '2025-10-12',
            depTime: '08:00',
            arrDate: '2025-10-12',
            arrTime: '09:15',
            duration: '1h 15m',
            aircraft: 'Airbus A320',
            class: 'Economy',
            price: 79,
            currency: 'EUR',
            bookingUrl: getAirlineBookingUrl('IB', 'IB3201', '2025-10-12')
        }
    ],
    // American Airlines
    'AA100': [
        {
            type: 'flight',
            flightNumber: 'AA100',
            carrierCode: 'AA',
            carrierName: 'American Airlines',
            origin: 'JFK',
            originCity: 'New York',
            dest: 'LHR',
            destCity: 'London',
            depDate: '2025-10-25',
            depTime: '22:00',
            arrDate: '2025-10-26',
            arrTime: '10:15',
            duration: '7h 15m',
            aircraft: 'Boeing 777-300ER',
            class: 'Economy',
            price: 599,
            currency: 'USD',
            bookingUrl: getAirlineBookingUrl('AA', 'AA100', '2025-10-25')
        }
    ],
    // British Airways
    'BA492': [
        {
            type: 'flight',
            flightNumber: 'BA492',
            carrierCode: 'BA',
            carrierName: 'British Airways',
            origin: 'LHR',
            originCity: 'London',
            dest: 'BCN',
            destCity: 'Barcelona',
            depDate: '2025-10-18',
            depTime: '11:40',
            arrDate: '2025-10-18',
            arrTime: '14:55',
            duration: '2h 15m',
            aircraft: 'Airbus A320',
            class: 'Economy',
            price: 129,
            currency: 'GBP',
            bookingUrl: getAirlineBookingUrl('BA', 'BA492', '2025-10-18')
        }
    ],
    // Air France
    'AF1149': [
        {
            type: 'flight',
            flightNumber: 'AF1149',
            carrierCode: 'AF',
            carrierName: 'Air France',
            origin: 'CDG',
            originCity: 'Paris',
            dest: 'BCN',
            destCity: 'Barcelona',
            depDate: '2025-10-30',
            depTime: '13:10',
            arrDate: '2025-10-30',
            arrTime: '14:55',
            duration: '1h 45m',
            aircraft: 'Airbus A321',
            class: 'Economy',
            price: 159,
            currency: 'EUR',
            bookingUrl: getAirlineBookingUrl('AF', 'AF1149', '2025-10-30')
        }
    ],
    // Vueling
    'VY2105': [
        {
            type: 'flight',
            flightNumber: 'VY2105',
            carrierCode: 'VY',
            carrierName: 'Vueling',
            origin: 'BCN',
            originCity: 'Barcelona',
            dest: 'MAD',
            destCity: 'Madrid',
            depDate: '2025-10-14',
            depTime: '17:30',
            arrDate: '2025-10-14',
            arrTime: '18:45',
            duration: '1h 15m',
            aircraft: 'Airbus A320',
            class: 'Economy',
            price: 59,
            currency: 'EUR',
            bookingUrl: getAirlineBookingUrl('VY', 'VY2105', '2025-10-14')
        }
    ]
};

// Mock booking references
const MOCK_BOOKINGS: Record<string, FlightLookupResult> = {
    'ABC123': {
        type: 'booking',
        flightNumber: 'KL1662',
        carrierCode: 'KL',
        carrierName: 'KLM Royal Dutch Airlines',
        origin: 'BCN',
        originCity: 'Barcelona',
        dest: 'AMS',
        destCity: 'Amsterdam',
        depDate: '2025-10-15',
        depTime: '14:30',
        arrDate: '2025-10-15',
        arrTime: '16:45',
        duration: '2h 15m',
        aircraft: 'Boeing 737-800',
        bookingRef: 'ABC123',
        price: 189,
        currency: 'EUR',
        class: 'Economy',
        bookingUrl: getAirlineBookingUrl('KL', 'KL1662', '2025-10-15')
    },
    'XYZ789': {
        type: 'booking',
        flightNumber: 'KL643',
        carrierCode: 'KL',
        carrierName: 'KLM Royal Dutch Airlines',
        origin: 'AMS',
        originCity: 'Amsterdam',
        dest: 'MIA',
        destCity: 'Miami',
        depDate: '2025-10-20',
        depTime: '10:15',
        arrDate: '2025-10-20',
        arrTime: '14:30',
        duration: '10h 15m',
        aircraft: 'Boeing 787-9',
        bookingRef: 'XYZ789',
        price: 650,
        currency: 'EUR',
        class: 'Business',
        bookingUrl: getAirlineBookingUrl('KL', 'KL643', '2025-10-20')
    }
};

/**
 * Lookup flight by booking reference
 */
export async function lookupByBookingRef(bookingRef: string): Promise<FlightLookupResult | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = MOCK_BOOKINGS[bookingRef.toUpperCase()];
    return result || null;
}

/**
 * Lookup flights by flight number
 * Returns multiple results if flight operates on different dates
 */
export async function lookupByFlightNumber(flightNumber: string, date?: string): Promise<FlightLookupResult[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const normalized = flightNumber.toUpperCase().replace(/\s+/g, '');
    const flights = MOCK_FLIGHTS[normalized] || [];

    // Filter by date if provided
    if (date) {
        return flights.filter(f => f.depDate === date);
    }

    return flights;
}

/**
 * Smart lookup - tries to determine if input is booking ref or flight number
 */
export async function smartLookup(input: string, date?: string): Promise<{
    type: 'booking' | 'flight';
    results: FlightLookupResult[];
}> {
    const normalized = input.toUpperCase().replace(/\s+/g, '');

    // Check if it looks like a booking reference (typically 6 alphanumeric chars)
    const isBookingRef = /^[A-Z0-9]{6}$/.test(normalized);

    if (isBookingRef) {
        const result = await lookupByBookingRef(normalized);
        return {
            type: 'booking',
            results: result ? [result] : []
        };
    } else {
        // Assume it's a flight number
        const results = await lookupByFlightNumber(normalized, date);
        return {
            type: 'flight',
            results
        };
    }
}
