/**
 * Travel API Service
 * Gestión de viajes, itinerarios y movilidad
 */

import { apiClient, ApiResponse } from '../client';

export interface TravelItinerary {
  id: string;
  showId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Accommodation {
  id: string;
  itineraryId: string;
  name: string;
  address: string;
  city: string;
  country: string;
  checkIn: Date;
  checkOut: Date;
  roomType: string;
  cost: number;
  currency: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transportation {
  id: string;
  itineraryId: string;
  type: 'flight' | 'train' | 'car' | 'bus' | 'boat';
  from: string;
  to: string;
  departureTime: Date;
  arrivalTime: Date;
  provider: string;
  confirmationNumber?: string;
  cost: number;
  currency: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TravelFilters {
  page?: number;
  limit?: number;
  showId?: string;
  status?: 'active' | 'completed' | 'cancelled';
  search?: string;
}

class TravelService {
  /**
   * Get itineraries with optional filtering
   */
  public async getItineraries(filters?: TravelFilters): Promise<ApiResponse<{
    data: TravelItinerary[];
    total: number;
    page: number;
    limit: number;
  }>> {
    const params = {
      page: filters?.page || 1,
      limit: filters?.limit || 10,
      ...(filters?.showId && { showId: filters.showId }),
      ...(filters?.search && { search: filters.search })
    };

    return apiClient.get<{
      data: TravelItinerary[];
      total: number;
      page: number;
      limit: number;
    }>('/travel/itineraries', params);
  }

  /**
   * Get single itinerary
   */
  public async getItinerary(itineraryId: string): Promise<ApiResponse<TravelItinerary>> {
    return apiClient.get<TravelItinerary>(`/travel/itineraries/${itineraryId}`);
  }

  /**
   * Create new itinerary
   */
  public async createItinerary(data: Omit<TravelItinerary, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<TravelItinerary>> {
    return apiClient.post<TravelItinerary>('/travel/itineraries', data);
  }

  /**
   * Update itinerary
   */
  public async updateItinerary(
    itineraryId: string,
    data: Partial<TravelItinerary>
  ): Promise<ApiResponse<TravelItinerary>> {
    return apiClient.patch<TravelItinerary>(
      `/travel/itineraries/${itineraryId}`,
      data
    );
  }

  /**
   * Delete itinerary
   */
  public async deleteItinerary(itineraryId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/travel/itineraries/${itineraryId}`);
  }

  /**
   * Get accommodations for itinerary
   */
  public async getAccommodations(itineraryId: string): Promise<ApiResponse<Accommodation[]>> {
    return apiClient.get<Accommodation[]>(`/travel/itineraries/${itineraryId}/accommodations`);
  }

  /**
   * Add accommodation
   */
  public async addAccommodation(
    itineraryId: string,
    data: Omit<Accommodation, 'id' | 'itineraryId' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Accommodation>> {
    return apiClient.post<Accommodation>(
      `/travel/itineraries/${itineraryId}/accommodations`,
      data
    );
  }

  /**
   * Update accommodation
   */
  public async updateAccommodation(
    itineraryId: string,
    accommodationId: string,
    data: Partial<Accommodation>
  ): Promise<ApiResponse<Accommodation>> {
    return apiClient.patch<Accommodation>(
      `/travel/itineraries/${itineraryId}/accommodations/${accommodationId}`,
      data
    );
  }

  /**
   * Delete accommodation
   */
  public async deleteAccommodation(
    itineraryId: string,
    accommodationId: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(
      `/travel/itineraries/${itineraryId}/accommodations/${accommodationId}`
    );
  }

  /**
   * Get transportation options for itinerary
   */
  public async getTransportation(itineraryId: string): Promise<ApiResponse<Transportation[]>> {
    return apiClient.get<Transportation[]>(`/travel/itineraries/${itineraryId}/transportation`);
  }

  /**
   * Add transportation
   */
  public async addTransportation(
    itineraryId: string,
    data: Omit<Transportation, 'id' | 'itineraryId' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Transportation>> {
    return apiClient.post<Transportation>(
      `/travel/itineraries/${itineraryId}/transportation`,
      data
    );
  }

  /**
   * Update transportation
   */
  public async updateTransportation(
    itineraryId: string,
    transportationId: string,
    data: Partial<Transportation>
  ): Promise<ApiResponse<Transportation>> {
    return apiClient.patch<Transportation>(
      `/travel/itineraries/${itineraryId}/transportation/${transportationId}`,
      data
    );
  }

  /**
   * Delete transportation
   */
  public async deleteTransportation(
    itineraryId: string,
    transportationId: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(
      `/travel/itineraries/${itineraryId}/transportation/${transportationId}`
    );
  }

  /**
   * Get travel summary
   */
  public async getTravelSummary(itineraryId: string): Promise<ApiResponse<{
    accommodations: number;
    transportation: number;
    totalCost: number;
    currency: string;
    duration: number;
  }>> {
    return apiClient.get<{
      accommodations: number;
      transportation: number;
      totalCost: number;
      currency: string;
      duration: number;
    }>(`/travel/itineraries/${itineraryId}/summary`);
  }
}

export const travelService = new TravelService();
