/**
 * API Client - Comunicación con Backend
 * Maneja todas las llamadas REST al servidor
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  statusCode: number;
  data?: T;
  error?: string;
  message?: string;
}

interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message?: string;
  details?: Record<string, any>;
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Setup interceptors
    this.setupInterceptors();

    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
    if (this.token) {
      this.setAuthToken(this.token);
    }
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.status === 401) {
          // Token expired - clear and redirect to login
          this.clearAuth();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authentication token
   */
  public setAuthToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
    this.client.defaults.headers.Authorization = `Bearer ${token}`;
  }

  /**
   * Clear authentication
   */
  public clearAuth(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
    delete this.client.defaults.headers.Authorization;
  }

  /**
   * GET request
   */
  public async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * POST request
   */
  public async post<T>(url: string, data?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * PATCH request
   */
  public async patch<T>(url: string, data?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  public async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): ApiResponse<any> {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      const errorData = error.response?.data as ApiErrorResponse;

      return {
        statusCode,
        error: errorData?.error || 'Unknown error',
        message: errorData?.message || error.message
      };
    }

    return {
      statusCode: 500,
      error: 'Network error',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  /**
   * Check if response is successful
   */
  public isSuccess<T>(response: ApiResponse<T>): boolean {
    return response.statusCode >= 200 && response.statusCode < 300;
  }
}

export const apiClient = new ApiClient();
export type { ApiResponse, ApiErrorResponse };
