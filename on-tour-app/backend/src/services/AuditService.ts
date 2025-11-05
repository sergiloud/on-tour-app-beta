import { Repository } from 'typeorm';
import { AuditLog } from '../database/entities/AuditLog.js';
import { AppDataSource } from '../database/datasource.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * AuditService
 *
 * Comprehensive audit trail management service.
 * Tracks all system operations for compliance, debugging, and security.
 */
export class AuditService {
  private auditLogRepository: Repository<AuditLog>;

  constructor() {
    this.auditLogRepository = AppDataSource.getRepository(AuditLog);
  }

  /**
   * Log an audit event
   */
  async log(params: {
    userId: string;
    organizationId: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    changes?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    status?: 'success' | 'error' | 'partial';
    errorMessage?: string;
    duration?: number;
    metadata?: Record<string, any>;
    description?: string;
    severity?: 'info' | 'warning' | 'critical';
    isSystemOperation?: boolean;
  }): Promise<AuditLog> {
    const auditLog = new AuditLog({
      id: uuidv4(),
      userId: params.userId,
      organizationId: params.organizationId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      changes: params.changes,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      status: params.status || 'success',
      errorMessage: params.errorMessage,
      duration: params.duration,
      metadata: params.metadata,
      description: params.description,
      severity: params.severity || 'info',
      isSystemOperation: params.isSystemOperation || false,
    });

    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Get audit log by ID
   */
  async getById(id: string): Promise<AuditLog | null> {
    return this.auditLogRepository.findOne({ where: { id } });
  }

  /**
   * Get all audit logs with optional filtering
   */
  async getAuditLog(options?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    severity?: string;
  }): Promise<{ data: AuditLog[]; total: number }> {
    let query = this.auditLogRepository.createQueryBuilder('audit');

    if (options?.startDate) {
      query = query.andWhere('audit.createdAt >= :startDate', {
        startDate: options.startDate,
      });
    }

    if (options?.endDate) {
      query = query.andWhere('audit.createdAt <= :endDate', {
        endDate: options.endDate,
      });
    }

    if (options?.status) {
      query = query.andWhere('audit.status = :status', { status: options.status });
    }

    if (options?.severity) {
      query = query.andWhere('audit.severity = :severity', {
        severity: options.severity,
      });
    }

    const total = await query.getCount();
    const data = await query
      .orderBy('audit.createdAt', 'DESC')
      .limit(options?.limit || 100)
      .offset(options?.offset || 0)
      .getMany();

    return { data, total };
  }

  /**
   * Get user-specific audit logs
   */
  async getUserAuditLog(
    userId: string,
    organizationId: string,
    options?: {
      limit?: number;
      offset?: number;
      action?: string;
    }
  ): Promise<{ data: AuditLog[]; total: number }> {
    let query = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.userId = :userId', { userId })
      .andWhere('audit.organizationId = :organizationId', { organizationId });

    if (options?.action) {
      query = query.andWhere('audit.action = :action', { action: options.action });
    }

    const total = await query.getCount();
    const data = await query
      .orderBy('audit.createdAt', 'DESC')
      .limit(options?.limit || 50)
      .offset(options?.offset || 0)
      .getMany();

    return { data, total };
  }

  /**
   * Get resource-specific audit logs
   */
  async getResourceAuditLog(
    resourceType: string,
    resourceId: string,
    organizationId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<{ data: AuditLog[]; total: number }> {
    let query = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.resourceType = :resourceType', { resourceType })
      .andWhere('audit.resourceId = :resourceId', { resourceId })
      .andWhere('audit.organizationId = :organizationId', { organizationId });

    const total = await query.getCount();
    const data = await query
      .orderBy('audit.createdAt', 'DESC')
      .limit(options?.limit || 50)
      .offset(options?.offset || 0)
      .getMany();

    return { data, total };
  }

  /**
   * Get audit logs for an organization
   */
  async getOrganizationAuditLog(
    organizationId: string,
    options?: {
      limit?: number;
      offset?: number;
      resourceType?: string;
      status?: string;
    }
  ): Promise<{ data: AuditLog[]; total: number }> {
    let query = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.organizationId = :organizationId', { organizationId });

    if (options?.resourceType) {
      query = query.andWhere('audit.resourceType = :resourceType', {
        resourceType: options.resourceType,
      });
    }

    if (options?.status) {
      query = query.andWhere('audit.status = :status', { status: options.status });
    }

    const total = await query.getCount();
    const data = await query
      .orderBy('audit.createdAt', 'DESC')
      .limit(options?.limit || 100)
      .offset(options?.offset || 0)
      .getMany();

    return { data, total };
  }

  /**
   * Search audit logs with full-text capabilities
   */
  async search(
    organizationId: string,
    query: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<{ data: AuditLog[]; total: number }> {
    const qb = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.organizationId = :organizationId', { organizationId })
      .andWhere(
        '(audit.action ILIKE :query OR audit.description ILIKE :query OR audit.resourceType ILIKE :query)',
        { query: `%${query}%` }
      );

    const total = await qb.getCount();
    const data = await qb
      .orderBy('audit.createdAt', 'DESC')
      .limit(options?.limit || 50)
      .offset(options?.offset || 0)
      .getMany();

    return { data, total };
  }

  /**
   * Get audit statistics
   */
  async getStatistics(organizationId: string): Promise<Record<string, any>> {
    const query = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.organizationId = :organizationId', { organizationId });

    const total = await query.getCount();

    // Count by action
    const byAction = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where('audit.organizationId = :organizationId', { organizationId })
      .groupBy('audit.action')
      .getRawMany();

    // Count by status
    const byStatus = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('audit.organizationId = :organizationId', { organizationId })
      .groupBy('audit.status')
      .getRawMany();

    // Count by resource type
    const byResource = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.resourceType', 'resourceType')
      .addSelect('COUNT(*)', 'count')
      .where('audit.organizationId = :organizationId', { organizationId })
      .groupBy('audit.resourceType')
      .getRawMany();

    // Average duration
    const avgDuration = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('AVG(audit.duration)', 'avgDuration')
      .where('audit.organizationId = :organizationId', { organizationId })
      .getRawOne();

    return {
      total,
      byAction,
      byStatus,
      byResource,
      avgDuration: avgDuration?.avgDuration || 0,
    };
  }

  /**
   * Clear old audit logs (retention policy)
   */
  async clearOldLogs(organizationId: string, daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('organizationId = :organizationId', { organizationId })
      .andWhere('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * Generate audit report
   */
  async generateAuditReport(
    organizationId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      resourceType?: string;
    }
  ): Promise<Record<string, any>> {
    let query = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.organizationId = :organizationId', { organizationId });

    if (options?.startDate) {
      query = query.andWhere('audit.createdAt >= :startDate', {
        startDate: options.startDate,
      });
    }

    if (options?.endDate) {
      query = query.andWhere('audit.createdAt <= :endDate', {
        endDate: options.endDate,
      });
    }

    if (options?.resourceType) {
      query = query.andWhere('audit.resourceType = :resourceType', {
        resourceType: options.resourceType,
      });
    }

    const logs = await query.getMany();

    return {
      period: {
        startDate: options?.startDate,
        endDate: options?.endDate,
      },
      summary: {
        totalEvents: logs.length,
        resourceTypes: [...new Set(logs.map((l) => l.resourceType))],
        actions: [...new Set(logs.map((l) => l.action))],
        users: [...new Set(logs.map((l) => l.userId))],
      },
      logs,
    };
  }

  /**
   * Get total count of audit logs
   */
  async count(organizationId: string): Promise<number> {
    return this.auditLogRepository.count({
      where: { organizationId },
    });
  }

  /**
   * Delete audit log
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.auditLogRepository.delete(id);
    return (result.affected || 0) > 0;
  }

  /**
   * Clear all logs for organization (admin only)
   */
  async clearAllLogs(organizationId: string): Promise<number> {
    const result = await this.auditLogRepository.delete({ organizationId });
    return result.affected || 0;
  }
}

// Singleton export
export const auditService = new AuditService();
