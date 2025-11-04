/**
 * Email API Service
 * Envío y gestión de emails transaccionales y de marketing
 */

import { apiClient, ApiResponse } from '../client';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  htmlContent?: string;
  variables: string[];
  category: 'transactional' | 'marketing' | 'notification';
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailRecipient {
  email: string;
  name?: string;
  variables?: Record<string, string>;
}

export interface EmailAttachment {
  filename: string;
  content: string; // Base64 encoded
  contentType?: string;
}

export interface EmailRequest {
  to: EmailRecipient | EmailRecipient[];
  from?: {
    email: string;
    name?: string;
  };
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject: string;
  content?: string;
  htmlContent?: string;
  templateId?: string;
  templateVariables?: Record<string, string>;
  attachments?: EmailAttachment[];
  replyTo?: string;
  headers?: Record<string, string>;
  tags?: string[];
}

export interface EmailLog {
  id: string;
  to: string;
  from: string;
  subject: string;
  status: 'sent' | 'bounced' | 'spam' | 'delivered' | 'opened' | 'clicked' | 'unsubscribed';
  templateId?: string;
  sentAt: Date;
  deliveredAt?: Date;
  opens: number;
  clicks: number;
  bounceType?: 'soft' | 'hard';
  bounceReason?: string;
  messageId?: string;
}

export interface EmailStats {
  sent: number;
  delivered: number;
  bounced: number;
  spam: number;
  opens: number;
  clicks: number;
  openRate: number;
  clickRate: number;
  period?: {
    start: Date;
    end: Date;
  };
}

export interface EmailFilters {
  page?: number;
  limit?: number;
  status?: string;
  templateId?: string;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}

class EmailService {
  /**
   * Send email
   */
  public async sendEmail(request: EmailRequest): Promise<ApiResponse<{ messageId: string }>> {
    return apiClient.post<{ messageId: string }>('/email/send', request);
  }

  /**
   * Send batch emails
   */
  public async sendBatchEmail(
    requests: EmailRequest[]
  ): Promise<ApiResponse<{ messageIds: string[] }>> {
    return apiClient.post<{ messageIds: string[] }>('/email/send-batch', {
      emails: requests
    });
  }

  /**
   * Get email templates
   */
  public async getTemplates(
    category?: string
  ): Promise<ApiResponse<EmailTemplate[]>> {
    const params = category ? { category } : {};
    return apiClient.get<EmailTemplate[]>('/email/templates', params);
  }

  /**
   * Get template by ID
   */
  public async getTemplate(templateId: string): Promise<ApiResponse<EmailTemplate>> {
    return apiClient.get<EmailTemplate>(`/email/templates/${templateId}`);
  }

  /**
   * Create template
   */
  public async createTemplate(
    data: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<EmailTemplate>> {
    return apiClient.post<EmailTemplate>('/email/templates', data);
  }

  /**
   * Update template
   */
  public async updateTemplate(
    templateId: string,
    data: Partial<EmailTemplate>
  ): Promise<ApiResponse<EmailTemplate>> {
    return apiClient.patch<EmailTemplate>(`/email/templates/${templateId}`, data);
  }

  /**
   * Delete template
   */
  public async deleteTemplate(templateId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/email/templates/${templateId}`);
  }

  /**
   * Get email logs with filtering
   */
  public async getLogs(filters?: EmailFilters): Promise<ApiResponse<{
    data: EmailLog[];
    total: number;
    page: number;
    limit: number;
  }>> {
    const params = {
      page: filters?.page || 1,
      limit: filters?.limit || 20,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.templateId && { templateId: filters.templateId }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
      ...(filters?.searchTerm && { search: filters.searchTerm })
    };

    return apiClient.get<{
      data: EmailLog[];
      total: number;
      page: number;
      limit: number;
    }>('/email/logs', params);
  }

  /**
   * Get email log by ID
   */
  public async getLog(logId: string): Promise<ApiResponse<EmailLog>> {
    return apiClient.get<EmailLog>(`/email/logs/${logId}`);
  }

  /**
   * Get email statistics
   */
  public async getStats(
    templateId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiResponse<EmailStats>> {
    const params: Record<string, any> = {};
    if (templateId) params.templateId = templateId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return apiClient.get<EmailStats>('/email/stats', params);
  }

  /**
   * Resend email
   */
  public async resendEmail(logId: string): Promise<ApiResponse<{ messageId: string }>> {
    return apiClient.post<{ messageId: string }>(`/email/logs/${logId}/resend`, {});
  }

  /**
   * Verify email address
   */
  public async verifyEmail(email: string): Promise<ApiResponse<{
    email: string;
    valid: boolean;
    reason?: string;
  }>> {
    return apiClient.post<{
      email: string;
      valid: boolean;
      reason?: string;
    }>('/email/verify', { email });
  }

  /**
   * Manage email list subscription
   */
  public async manageSubscription(
    email: string,
    action: 'subscribe' | 'unsubscribe',
    listId?: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>('/email/subscription', {
      email,
      action,
      ...(listId && { listId })
    });
  }
}

export const emailService = new EmailService();
