/**
 * Amadeus API Service
 * Integración con Amadeus para búsqueda y gestión de vuelos
 */

import { apiClient, ApiResponse } from '../client';

export interface FlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: FlightItinerary[];
  price: {
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
  travelerPricings: TravelerPricing[];
}

export interface FlightItinerary {
  duration: string;
  segments: FlightSegment[];
}

export interface FlightSegment {
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
  aircraft: {
    code: string;
  };
  operating?: {
    carrierCode: string;
  };
  stops?: number;
  class?: string;
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: {
    total: string;
    base: string;
  };
  fareDetailsBySegment: any[];
}

export interface FlightSearchRequest {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  includedAirlineCodes?: string[];
  excludedAirlineCodes?: string[];
  nonStop?: boolean;
  maxPrice?: number;
  currencyCode?: string;
}

export interface FlightSearchResponse {
  data: FlightOffer[];
  dictionaries: {
    locations: Record<string, any>;
    aircraft: Record<string, any>;
    currencies: Record<string, any>;
    carriers: Record<string, any>;
  };
}

export interface SeatMap {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  data: {
    decks: SeatDeck[];
  };
}

export interface SeatDeck {
  deckType: string;
  deckConfiguration: {
    width: number;
    length: number;
  };
  seats: Seat[];
}

export interface Seat {
  seatNumber: string;
  cabin: string;
  number: number;
  isAvailable: boolean;
  isRestricted?: boolean;
  amenities?: string[];
  travelerPricing?: {
    travelerId: string;
    price?: {
      total: string;
    };
  }[];
}

export interface AirportInfo {
  iataCode: string;
  name: string;
  cityCode: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  timeZone: string;
}

export interface FlightFilters {
  page?: number;
  limit?: number;
  maxPrice?: number;
  nonStop?: boolean;
  minPrice?: number;
}

class AmadeusService {
  /**
   * Search for flights
   */
  public async searchFlights(
    request: FlightSearchRequest
  ): Promise<ApiResponse<FlightSearchResponse>> {
    return apiClient.post<FlightSearchResponse>('/amadeus/search', request);
  }

  /**
   * Get flight details
   */
  public async getFlightDetails(
    flightId: string
  ): Promise<ApiResponse<FlightOffer>> {
    return apiClient.get<FlightOffer>(`/amadeus/flights/${flightId}`);
  }

  /**
   * Get seat map for flight
   */
  public async getSeatMap(
    flightId: string,
    departDate: string,
    segments?: number
  ): Promise<ApiResponse<SeatMap[]>> {
    const params: Record<string, any> = { flightId, departDate };
    if (segments) {
      params.segments = segments;
    }
    return apiClient.get<SeatMap[]>(`/amadeus/seat-maps`, params);
  }

  /**
   * Get airport information
   */
  public async getAirportInfo(
    iataCode: string
  ): Promise<ApiResponse<AirportInfo>> {
    return apiClient.get<AirportInfo>(`/amadeus/airports/${iataCode}`);
  }

  /**
   * Search airports
   */
  public async searchAirports(
    keyword: string
  ): Promise<ApiResponse<AirportInfo[]>> {
    return apiClient.get<AirportInfo[]>('/amadeus/airports/search', { keyword });
  }

  /**
   * Get flight inspiration destinations
   */
  public async getFlightInspirations(
    origin: string,
    maxPrice?: number
  ): Promise<ApiResponse<{
    data: Array<{
      type: string;
      destination: string;
      departureDate: string;
      returnDate: string;
      price: {
        total: string;
      };
      departureDateTime: string;
      returnDateTime: string;
    }>;
  }>> {
    const params: Record<string, any> = { origin };
    if (maxPrice) {
      params.maxPrice = maxPrice;
    }
    return apiClient.get<any>('/amadeus/flight-inspirations', params);
  }

  /**
   * Get price check for flight
   */
  public async priceCheck(
    flightId: string
  ): Promise<ApiResponse<{
    data: Array<{
      type: string;
      id: string;
      source: string;
      instantTicketingRequired: boolean;
      nonHomogeneous: boolean;
      oneWay: boolean;
      lastTicketingDate: string;
      numberOfBookableSeats: number;
      itineraries: FlightItinerary[];
      price: {
        total: string;
        base: string;
        fee: string;
        grandTotal: string;
      };
    }>;
  }>> {
    return apiClient.post<any>('/amadeus/price-check', { flightId });
  }

  /**
   * Create booking
   */
  public async createBooking(
    flightId: string,
    travelers: Array<{
      id: string;
      dateOfBirth: string;
      name: {
        firstName: string;
        lastName: string;
      };
      gender: string;
      contact: {
        emailAddress: string;
        phones: Array<{
          deviceType: string;
          countryCallingCode: string;
          number: string;
        }>;
      };
      documents: Array<{
        documentType: string;
        birthPlace: string;
        issuanceLocation: string;
        issuanceDate: string;
        number: string;
        expiryDate: string;
        issuanceCountry: string;
        validityCountry: string;
        nationality: string;
        holder: boolean;
      }>;
    }>,
    remarks?: string
  ): Promise<ApiResponse<{
    type: string;
    id: string;
    queuingOfficeId: string;
    associated: Array<{ reference: string; creationDate: string }>;
    passengers: any[];
    ticketingAgreement: {
      option: string;
      date: string;
    };
    automatedProcess: boolean;
  }>> {
    return apiClient.post<any>('/amadeus/bookings', {
      flightId,
      travelers,
      remarks
    });
  }

  /**
   * Get booking details
   */
  public async getBooking(
    bookingId: string
  ): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/amadeus/bookings/${bookingId}`);
  }

  /**
   * Cancel booking
   */
  public async cancelBooking(
    bookingId: string
  ): Promise<ApiResponse<{ success: boolean; refund?: { amount: string; currency: string } }>> {
    return apiClient.delete<any>(`/amadeus/bookings/${bookingId}`);
  }
}

export const amadeusService = new AmadeusService();
