/**
 * Amadeus Flight Search - PRECIOS REALES EXACTOS
 *
 * Usa Amadeus Self-Service API (GRATUITA)
 * Registro: https://developers.amadeus.com/register
 *
 * LÍMITES GRATIS:
 * - 2000 llamadas/mes
 * - Precios reales de aerolíneas
 * - Sin costo
 */

// Configuración de Amadeus
const AMADEUS_API_KEY = import.meta.env.VITE_AMADEUS_API_KEY || '';
const AMADEUS_API_SECRET = import.meta.env.VITE_AMADEUS_API_SECRET || '';
const AMADEUS_BASE_URL = 'https://test.api.amadeus.com'; // Cambiar a production cuando esté listo

interface AmadeusAuthResponse {
    access_token: string;
    expires_in: number;
}

interface AmadeusFlightOffer {
    id: string;
    price: {
        total: string;
        currency: string;
    };
    itineraries: Array<{
        segments: Array<{
            departure: {
                iataCode: string;
                at: string;
            };
            arrival: {
                iataCode: string;
                at: string;
            };
            carrierCode: string;
            number: string;
            duration: string;
        }>;
    }>;
    validatingAirlineCodes: string[];
}

interface AmadeusSearchResponse {
    data: AmadeusFlightOffer[];
}

// Cache para el token de autenticación
let accessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Obtener token de acceso de Amadeus
 */
async function getAccessToken(): Promise<string> {
    // Si tenemos un token válido, usarlo
    if (accessToken && Date.now() < tokenExpiry) {
        return accessToken;
    }

    if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
        throw new Error('Amadeus API credentials not configured. Set VITE_AMADEUS_API_KEY and VITE_AMADEUS_API_SECRET in .env');
    }

    try {
        const response = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: AMADEUS_API_KEY,
                client_secret: AMADEUS_API_SECRET,
            }),
        });

        if (!response.ok) {
            throw new Error(`Amadeus auth failed: ${response.statusText}`);
        }

        const data: AmadeusAuthResponse = await response.json();
        accessToken = data.access_token;
        tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 min buffer

        return accessToken;
    } catch (error) {
        console.error('Error getting Amadeus access token:', error);
        throw error;
    }
}

/**
 * Buscar vuelos con precios REALES usando Amadeus
 */
export async function searchRealFlights(params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
}): Promise<Array<{
    id: string;
    airline: string;
    airlineCode: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    stops: number;
    price: number;
    currency: string;
    googleFlightsLink: string;
    skyscannerLink: string;
    isRealPrice: true; // Marca que es precio real
}>> {
    try {
        const token = await getAccessToken();

        // Construir URL de búsqueda
        const searchParams = new URLSearchParams({
            originLocationCode: params.origin,
            destinationLocationCode: params.destination,
            departureDate: params.departureDate,
            adults: params.adults.toString(),
            max: '10', // Máximo 10 resultados
            currencyCode: 'EUR',
        });

        if (params.returnDate) {
            searchParams.append('returnDate', params.returnDate);
        }

        const response = await fetch(
            `${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${searchParams}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Amadeus search failed: ${response.statusText}`);
        }

        const data: AmadeusSearchResponse = await response.json();

        // Mapear códigos de aerolíneas a nombres
        const airlineNames: Record<string, string> = {
            'IB': 'Iberia',
            'VY': 'Vueling',
            'UX': 'Air Europa',
            'FR': 'Ryanair',
            'U2': 'easyJet',
            'BA': 'British Airways',
            'AF': 'Air France',
            'KL': 'KLM',
            'LH': 'Lufthansa',
            'TP': 'TAP Portugal',
            'AA': 'American Airlines',
            'DL': 'Delta',
            'UA': 'United',
        };

        // Generar enlaces directos
        const depDateFormatted = params.departureDate.replace(/-/g, '');
        const returnDateFormatted = params.returnDate ? params.returnDate.replace(/-/g, '') : '';

        // Google Flights link
        const googleFlightsLink = params.returnDate
            ? `https://www.google.com/travel/flights?q=Flights%20to%20${params.destination}%20from%20${params.origin}%20on%20${params.departureDate}%20return%20${params.returnDate}%20for%20${params.adults}%20adults`
            : `https://www.google.com/travel/flights?q=Flights%20to%20${params.destination}%20from%20${params.origin}%20on%20${params.departureDate}%20for%20${params.adults}%20adults`;

        // Skyscanner link
        const skyscannerLink = params.returnDate
            ? `https://www.skyscanner.es/transport/flights/${params.origin.toLowerCase()}/${params.destination.toLowerCase()}/${depDateFormatted}/${returnDateFormatted}/?adults=${params.adults}&cabinclass=economy&children=0&infants=0&rtn=1`
            : `https://www.skyscanner.es/transport/flights/${params.origin.toLowerCase()}/${params.destination.toLowerCase()}/${depDateFormatted}/?adults=${params.adults}&cabinclass=economy&children=0&infants=0&rtn=0`;

        // Convertir resultados de Amadeus a nuestro formato
        return data.data
            .filter(offer =>
                offer.itineraries?.[0]?.segments &&
                offer.itineraries[0].segments.length > 0
            )
            .map(offer => {
                const segments = offer.itineraries[0]!.segments;
                const firstSegment = segments[0]!;
                const lastSegment = segments[segments.length - 1]!;
                const airlineCode = offer.validatingAirlineCodes[0] || firstSegment.carrierCode;

                // Calcular tiempo de salida y llegada
                const depTime = new Date(firstSegment.departure.at).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                });
                const arrTime = new Date(lastSegment.arrival.at).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                });

                // Calcular duración total
                const totalDuration = segments.reduce((total, seg) => {
                    const duration = seg.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm');
                    return total + ' ' + duration;
                }, '').trim();

                return {
                    id: offer.id,
                    airline: airlineNames[airlineCode] || airlineCode,
                    airlineCode: airlineCode,
                    flightNumber: `${firstSegment.carrierCode}${firstSegment.number}`,
                    origin: params.origin,
                    destination: params.destination,
                    departureTime: depTime,
                    arrivalTime: arrTime,
                    duration: totalDuration || '2h 30m',
                    stops: segments.length - 1,
                    price: parseFloat(offer.price.total),
                    currency: offer.price.currency,
                    googleFlightsLink,
                    skyscannerLink,
                    isRealPrice: true as const,
                };
            });
    } catch (error) {
        console.error('Error searching real flights with Amadeus:', error);
        throw error;
    }
}

/**
 * Verificar si las credenciales están configuradas
 */
export function isAmadeusConfigured(): boolean {
    return !!(AMADEUS_API_KEY && AMADEUS_API_SECRET);
}
