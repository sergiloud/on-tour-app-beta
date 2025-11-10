/**
 * Finance API Service
 * Comunicación con backend para gestión de finanzas
 */

import { apiClient, ApiResponse } from '../client.js';

export interface FinanceRecord {
  id: string;
  showId: string;
  category: string;
  amount: number;
  currency: string;
  type: 'income' | 'expense';
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  transactionDate: Date;
  approvedBy?: string;
  createdAt: Date;
}

export interface FinanceReport {
  showId: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  feesCharged: number;
  profitAfterFees: number;
  recordCount: number;
  approvedCount: number;
  pendingCount: number;
  currency: string;
}

class FinanceService {
  /**
   * Get finance records for show
   */
  async getRecords(showId: string, filters?: { type?: string; status?: string; startDate?: Date; endDate?: Date }): Promise<ApiResponse<FinanceRecord[]>> {
    const params: any = {};
    if (filters?.type) params.type = filters.type;
    if (filters?.status) params.status = filters.status;
    if (filters?.startDate) params.startDate = filters.startDate.toISOString();
    if (filters?.endDate) params.endDate = filters.endDate.toISOString();

    return apiClient.get(`/finance/${showId}`, params);
  }

  /**
   * Create finance record
   */
  async createRecord(data: Partial<FinanceRecord>): Promise<ApiResponse<FinanceRecord>> {
    return apiClient.post('/finance', data);
  }

  /**
   * Approve finance record
   */
  async approveRecord(recordId: string): Promise<ApiResponse<FinanceRecord>> {
    return apiClient.patch(`/finance/${recordId}/approve`);
  }

  /**
   * Get finance report
   */
  async getReport(showId: string): Promise<ApiResponse<FinanceReport>> {
    return apiClient.get(`/finance/${showId}/report`);
  }

  /**
   * Create settlement
   */
  async createSettlement(data: {
    name: string;
    settlementDate: Date;
    totalAmount: number;
    currency: string;
    notes?: string;
    bankAccountNumber: string;
    bankRoutingNumber: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.post('/finance/settlements', data);
  }
}

export const financeService = new FinanceService();
