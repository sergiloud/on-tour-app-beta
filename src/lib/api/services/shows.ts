/**
 * Shows API Service
 * Comunicación con backend para gestión de shows
 */

import { apiClient, ApiResponse } from '../client.js';

export interface Show {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  type: string;
  location: string;
  capacity: number;
  budget: number;
  currency: string;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShowFilters {
  page?: number;
  limit?: number;
  status?: Show['status'];
  search?: string;
  type?: string;
}

export interface ShowStats {
  showId: string;
  title: string;
  totalBudget: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  attendeeCount: number;
  profitMargin: number;
  financialRecords: number;
  itineraryCount: number;
  avgTicketPrice: number;
}

class ShowsService {
  /**
   * Get all shows
   */
  async getShows(filters?: ShowFilters): Promise<ApiResponse<{ data: Show[]; total: number; page: number; limit: number }>> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type) params.append('type', filters.type);

    return apiClient.get('/shows', Object.fromEntries(params));
  }

  /**
   * Get show by ID
   */
  async getShow(id: string): Promise<ApiResponse<Show>> {
    return apiClient.get(`/shows/${id}`);
  }

  /**
   * Create show
   */
  async createShow(data: Partial<Show>): Promise<ApiResponse<Show>> {
    return apiClient.post('/shows', data);
  }

  /**
   * Update show
   */
  async updateShow(id: string, data: Partial<Show>): Promise<ApiResponse<Show>> {
    return apiClient.patch(`/shows/${id}`, data);
  }

  /**
   * Delete show
   */
  async deleteShow(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/shows/${id}`);
  }

  /**
   * Search shows
   */
  async searchShows(query: string, type?: string): Promise<ApiResponse<Show[]>> {
    const params: any = { query };
    if (type) params.type = type;
    return apiClient.get('/shows/search', params);
  }

  /**
   * Get show statistics
   */
  async getShowStats(id: string): Promise<ApiResponse<ShowStats>> {
    return apiClient.get(`/shows/${id}/stats`);
  }

  /**
   * Get related shows
   */
  async getRelatedShows(id: string): Promise<ApiResponse<Show[]>> {
    return apiClient.get(`/shows/${id}/related`);
  }
}

export const showsService = new ShowsService();
