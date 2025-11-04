import { Logger } from 'pino';
import axios, { AxiosInstance } from 'axios';

// Amadeus API Response Types
export interface AmadeusFlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: { code: string };
      operating?: { carrierCode: string };
      stops?: number;
      stopCount?: number;
    }>;
  }>;
  price: {
    currency: string;
    total: string;
    base: string;
    fee: string;
    grandTotal: string;
  };
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: Array<{
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
      currency: string;
      total: string;
      base: string;
    };
    fareDetailsBySegment: Array<{
      segmentId: string;
      cabin: string;
      fareBasis: string;
      class: string;
      includedCheckedBags: {
        weight: number;
        weightUnit: string;
      };
    }>;
  }>;
}

export interface FlightSearchParams {
  origin: string; // IATA code
  destination: string; // IATA code
  departureDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  currencyCode?: string;
  maxResults?: number;
}

export interface FlightBookingRequest {
  flightOfferId: string;
  travelers: Array<{
    id: string;
    dateOfBirth: string;
    name: {
      firstName: string;
      lastName: string;
    };
    gender: 'MALE' | 'FEMALE';
    contact: {
      emailAddress: string;
      phones: Array<{
        deviceType: 'MOBILE' | 'HOME' | 'WORK';
        countryCallingCode: string;
        number: string;
      }>;
    };
    documents: Array<{
      documentType: 'PASSPORT' | 'VISA' | 'ID';
      birthPlace: string;
      issuanceLocation: string;
      issuanceDate: string;
      number: string;
      issuanceCountry: string;
      validityCountry: string;
      nationality: string;
      validityEndDate: string;
    }>;
  }>;
  remarks?: {
    general?: Array<{ subType: string; text: string }>;
  };
  contacts: Array<{
    addresseeName: {
      firstName: string;
      lastName: string;
    };
    address: {
      cityName: string;
      countryCode: string;
      line1: string;
      postalCode: string;
    };
    emailAddress: string;
    phones: Array<{
      deviceType: 'MOBILE' | 'HOME' | 'WORK';
      countryCallingCode: string;
      number: string;
    }>;
  }>;
}

export interface BookingConfirmation {
  id: string;
  queuingOfficeId?: string;
  associatedRecords?: Array<{
    reference: string;
    creationDate: string;
  }>;
  flightOffers?: AmadeusFlightOffer[];
  travelers?: Array<{
    id: string;
    dateOfBirth: string;
    name: { firstName: string; lastName: string };
  }>;
  type: string;
}

export interface FlightStatusResponse {
  flightStatus: string;
  departure: {
    iataCode: string;
    terminal?: string;
    scheduledTime: string;
    estimatedTime?: string;
    actualTime?: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    scheduledTime: string;
    estimatedTime?: string;
    actualTime?: string;
  };
  carrierCode: string;
  number: string;
  aircraft?: {
    code: string;
  };
}

export interface PriceCheckResponse {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carrierCode: string;
      number: string;
    }>;
  }>;
  price: {
    currency: string;
    total: string;
    base: string;
  };
}

export class AmadeusService {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly baseUrl = 'https://api.amadeus.com/v2';
  private readonly authUrl = 'https://api.amadeus.com/v1/security/oauth2/token';

  constructor(
    private logger: Logger,
    clientId?: string,
    clientSecret?: string
  ) {
    this.clientId = clientId || process.env.AMADEUS_CLIENT_ID || 'test-client-id';
    this.clientSecret = clientSecret || process.env.AMADEUS_CLIENT_SECRET || 'test-client-secret';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });

    // Add auth token to requests
    this.client.interceptors.request.use(
      async (config: any) => {
        const token = await this.getAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error: any) => Promise.reject(error)
    );
  }

  /**
   * Get or refresh OAuth2 access token
   */
  private async getAccessToken(): Promise<string> {
    // Return existing token if still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken as string;
    }

    try {
      const response = await axios.post(
        this.authUrl,
        {
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry 5 minutes before actual expiry for safety
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 300) * 1000);

      this.logger.info('Amadeus access token refreshed');
      return this.accessToken as string;
    } catch (error) {
      this.logger.error('Failed to get Amadeus access token', error);
      throw new Error('Failed to authenticate with Amadeus API');
    }
  }

  /**
   * Search for flights
   */
  async searchFlights(params: FlightSearchParams): Promise<AmadeusFlightOffer[]> {
    try {
      const searchParams = {
        originLocationCode: params.origin,
        destinationLocationCode: params.destination,
        departureDate: params.departureDate,
        ...(params.returnDate && { returnDate: params.returnDate }),
        adults: params.adults,
        ...(params.children && { children: params.children }),
        ...(params.infants && { infants: params.infants }),
        ...(params.travelClass && { travelClass: params.travelClass }),
        ...(params.currencyCode && { currencyCode: params.currencyCode }),
        ...(params.maxResults && { max: params.maxResults }),
      };

      const response = await this.client.get<{ data: AmadeusFlightOffer[] }>(
        '/shopping/flight-offers',
        { params: searchParams }
      );

      this.logger.info(
        {
          origin: params.origin,
          destination: params.destination,
          resultCount: response.data.data?.length || 0,
        },
        'Flight search completed'
      );

      return response.data.data || [];
    } catch (error) {
      this.logger.error({ params, error }, 'Flight search failed');
      throw new Error(`Flight search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Confirm flight offer (check if still available and get booking details)
   */
  async confirmFlightOffer(flightOfferId: string): Promise<PriceCheckResponse> {
    try {
      const response = await this.client.post<PriceCheckResponse>(
        '/shopping/flight-offers/pricing',
        {
          data: {
            type: 'flight-offers-pricing',
            flightOffers: [{ id: flightOfferId }],
          },
        }
      );

      this.logger.info({ flightOfferId }, 'Flight offer confirmed and priced');
      return response.data;
    } catch (error) {
      this.logger.error({ flightOfferId, error }, 'Flight offer confirmation failed');
      throw new Error(`Price check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a booking (Amadeus POST Booking API)
   * Note: This requires full traveler details and actual payment
   */
  async createBooking(request: FlightBookingRequest): Promise<BookingConfirmation> {
    try {
      const response = await this.client.post<BookingConfirmation>(
        '/booking/flight-orders',
        {
          data: {
            type: 'flight-order',
            flightOffers: request,
            travelers: request.travelers,
            remarks: request.remarks,
            contacts: request.contacts,
          },
        }
      );

      this.logger.info(
        {
          bookingId: response.data.id,
          travelerCount: request.travelers.length,
        },
        'Flight booking created'
      );

      return response.data;
    } catch (error) {
      this.logger.error({ request, error }, 'Booking creation failed');
      throw new Error(`Booking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get flight status
   */
  async getFlightStatus(
    carrierCode: string,
    flightNumber: string,
    scheduledDepartureDate: string
  ): Promise<FlightStatusResponse[]> {
    try {
      const response = await this.client.get<{ data: FlightStatusResponse[] }>(
        '/airport/predictions/flight-arrivals',
        {
          params: {
            carrierCode,
            flightNumber,
            scheduledDepartureDate,
          },
        }
      );

      this.logger.info(
        { carrierCode, flightNumber, scheduledDepartureDate },
        'Flight status retrieved'
      );

      return response.data.data || [];
    } catch (error) {
      this.logger.error(
        { carrierCode, flightNumber, scheduledDepartureDate, error },
        'Flight status retrieval failed'
      );
      throw new Error(`Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get airport information
   */
  async getAirportInfo(iataCode: string): Promise<any> {
    try {
      const response = await this.client.get('/reference-data/locations', {
        params: {
          keyword: iataCode,
          subType: 'AIRPORT',
        },
      });

      this.logger.info({ iataCode }, 'Airport info retrieved');
      return response.data.data?.[0];
    } catch (error) {
      this.logger.error({ iataCode, error }, 'Airport info retrieval failed');
      throw new Error(`Airport lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get airline information
   */
  async getAirlineInfo(carrierCode: string): Promise<any> {
    try {
      const response = await this.client.get('/reference-data/airlines', {
        params: {
          airlineCodes: carrierCode,
        },
      });

      this.logger.info({ carrierCode }, 'Airline info retrieved');
      return response.data.data?.[0];
    } catch (error) {
      this.logger.error({ carrierCode, error }, 'Airline info retrieval failed');
      throw new Error(`Airline lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get seat availability for a flight
   */
  async getSeatAvailability(flightOfferId: string): Promise<number> {
    try {
      // Parse flight offer to get seat count
      // This is a simplified mock - actual implementation depends on Amadeus POST Shopping API
      const response = await this.client.post(
        '/shopping/flight-offers/seat-maps',
        {
          data: {
            type: 'flight-offer',
            id: flightOfferId,
          },
        }
      );

      this.logger.info({ flightOfferId }, 'Seat availability retrieved');

      // Extract seat count from response
      return response.data?.data?.[0]?.decks?.[0]?.seats?.length || 0;
    } catch (error) {
      this.logger.error({ flightOfferId, error }, 'Seat availability retrieval failed');
      // Return default seats on error
      return 150;
    }
  }

  /**
   * Mock mode: For testing without real Amadeus credentials
   * Returns realistic mock flight data
   */
  async searchFlightsMock(params: FlightSearchParams): Promise<AmadeusFlightOffer[]> {
    this.logger.info({ params }, 'Running flight search in MOCK mode');

    // Generate mock flight offers
    const mockOffers: AmadeusFlightOffer[] = [];

    for (let i = 0; i < (params.maxResults || 5); i++) {
      const basePrice = 150 + Math.random() * 350;
      const totalPassengers = params.adults + (params.children || 0) + (params.infants || 0);
      const totalPrice = basePrice * totalPassengers;

      mockOffers.push({
        id: `MOCK-${Date.now()}-${i}`,
        source: 'GDS',
        instantTicketingRequired: Math.random() > 0.5,
        nonHomogeneous: false,
        oneWay: !params.returnDate,
        lastTicketingDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        numberOfBookableSeats: Math.floor(Math.random() * 50) + 10,
        itineraries: [
          {
            duration: params.returnDate ? 'PT20H30M' : 'PT8H45M',
            segments: [
              {
                departure: {
                  iataCode: params.origin,
                  at: new Date(params.departureDate + 'T' + String(6 + i).padStart(2, '0') + ':00:00')
                    .toISOString(),
                },
                arrival: {
                  iataCode: params.destination,
                  at: new Date(params.departureDate + 'T' + String(14 + i).padStart(2, '0') + ':45:00')
                    .toISOString(),
                },
                carrierCode: ['AA', 'DL', 'UA', 'SW', 'BA'][i % 5],
                number: String(1000 + i),
                aircraft: { code: ['77W', '78J', '320', '789', '380'][i % 5] },
                stops: 0,
              },
            ],
          },
        ],
        price: {
          currency: params.currencyCode || 'USD',
          total: totalPrice.toFixed(2),
          base: basePrice.toFixed(2),
          fee: '0.00',
          grandTotal: totalPrice.toFixed(2),
        },
        pricingOptions: {
          fareType: ['PUBLISHED'],
          includedCheckedBagsOnly: false,
        },
        validatingAirlineCodes: [['AA', 'DL', 'UA', 'SW', 'BA'][i % 5]],
        travelerPricings: [
          {
            travelerId: '1',
            fareOption: 'PUBLISHED',
            travelerType: 'ADULT',
            price: {
              currency: params.currencyCode || 'USD',
              total: basePrice.toFixed(2),
              base: basePrice.toFixed(2),
            },
            fareDetailsBySegment: [
              {
                segmentId: '1',
                cabin: params.travelClass || 'ECONOMY',
                fareBasis: 'YLXF2AOOW',
                class: 'Y',
                includedCheckedBags: {
                  weight: 23,
                  weightUnit: 'KG',
                },
              },
            ],
          },
        ],
      });
    }

    return mockOffers;
  }
}
