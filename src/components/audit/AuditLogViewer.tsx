import React, { useState, useEffect, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { auditLogService } from '../../services/AuditLogService';
import { AuditEvent, AuditAction, AuditSeverity } from '../../types/auditLog';
import { t } from '../../lib/i18n';

interface AuditLogViewerProps {
  organizationId?: string;
  maxEntries?: number;
  showFilters?: boolean;
}

interface AuditFilters {
  action?: AuditAction;
  severity?: AuditSeverity;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export function AuditLogViewer({ 
  organizationId,
  maxEntries = 50,
  showFilters = true 
}: AuditLogViewerProps) {
  const { profile } = useAuth();
  const [entries, setEntries] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState<AuditFilters>({});
  const auditService = auditLogService;

  // Load audit entries
  const loadEntries = useCallback(async () => {
    if (!organizationId) return;
    
    setLoading(true);
    setError('');

    try {
      const auditFilters = {
        ...filters,
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        limit: maxEntries
      };

      const result = await auditService.query({ ...auditFilters, organizationId });
      setEntries(result);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError(t('audit.load_error') || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [organizationId, filters, maxEntries, auditService]);

  // Load entries on mount and filter changes
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Real-time updates
  useEffect(() => {
    if (!organizationId) return;

    const unsubscribe = auditService.subscribe(
      { organizationId, limit: maxEntries },
      (newEntries: AuditEvent[]) => {
        setEntries(newEntries);
      }
    );

    return unsubscribe;
  }, [organizationId, maxEntries, auditService]);

  const getSeverityColor = (severity: AuditSeverity) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'info': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getSeverityIcon = (severity: AuditSeverity) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  const getActionLabel = (action: AuditAction) => {
    // Convert action to human readable format
    const actionMap: Record<string, string> = {
      'member.invited': t('audit.action.member_invited') || 'Member invited',
      'member.joined': t('audit.action.member_joined') || 'Member joined',
      'member.removed': t('audit.action.member_removed') || 'Member removed',
      'member.role_changed': t('audit.action.member_role_changed') || 'Member role changed',
      'finance.transaction_created': t('audit.action.finance_transaction_created') || 'Transaction created',
      'finance.transaction_updated': t('audit.action.finance_transaction_updated') || 'Transaction updated',
      'finance.transaction_deleted': t('audit.action.finance_transaction_deleted') || 'Transaction deleted',
      'show.created': t('audit.action.show_created') || 'Show created',
      'show.updated': t('audit.action.show_updated') || 'Show updated',
      'show.deleted': t('audit.action.show_deleted') || 'Show deleted',
      'org.settings_changed': t('audit.action.org_settings_changed') || 'Organization settings changed',
      'org.deleted': t('audit.action.org_deleted') || 'Organization deleted',
    };

    return actionMap[action] || action.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const toDate = (timestamp: Date | Timestamp) => {
    return timestamp instanceof Date ? timestamp : timestamp.toDate();
  };

  const formatTimestamp = (timestamp: Date | Timestamp) => {
    const date = toDate(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return t('audit.time.just_now') || 'Just now';
    if (diffMins < 60) return t('audit.time.minutes_ago', { count: diffMins }) || `${diffMins}m ago`;
    if (diffHours < 24) return t('audit.time.hours_ago', { count: diffHours }) || `${diffHours}h ago`;
    if (diffDays < 7) return t('audit.time.days_ago', { count: diffDays }) || `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const exportLogs = async () => {
    if (!organizationId) return;

    try {
      // Simple CSV export
      const csvHeader = 'Timestamp,Action,User,Severity,Description\n';
      const csvData = entries.map(entry => {
        const timestamp = toDate(entry.timestamp).toISOString();
        return `"${timestamp}","${entry.action}","${entry.userEmail}","${entry.severity}","${getActionLabel(entry.action)}"`;
      }).join('\n');
      
      const csvContent = csvHeader + csvData;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-log-${organizationId}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export audit logs:', err);
      setError(t('audit.export_error') || 'Failed to export audit logs');
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (!organizationId) {
    return (
      <div className="glass rounded p-4 border border-slate-200 dark:border-white/10 text-center">
        <div className="text-slate-500 dark:text-white/70">
          {t('audit.no_org_selected') || 'No organization selected'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {t('audit.title') || 'Audit Log'}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={loadEntries}
            disabled={loading}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '🔄' : '🔄'} {t('common.refresh') || 'Refresh'}
          </button>
          <button
            onClick={exportLogs}
            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
          >
            📥 {t('audit.export') || 'Export'}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="glass rounded p-4 border border-slate-200 dark:border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <select
              value={filters.severity || ''}
              onChange={(e) => setFilters(f => ({ ...f, severity: e.target.value as AuditSeverity || undefined }))}
              className="px-3 py-2 text-sm rounded bg-slate-100 dark:bg-white/5 border border-white/12"
            >
              <option value="">{t('audit.filter.all_severities') || 'All severities'}</option>
              <option value="info">ℹ️ Info</option>
              <option value="warning">⚠️ Warning</option>
              <option value="critical">🔴 Critical</option>
            </select>

            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value || undefined }))}
              className="px-3 py-2 text-sm rounded bg-slate-100 dark:bg-white/5 border border-white/12"
              placeholder={t('audit.filter.start_date') || 'Start date'}
            />

            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value || undefined }))}
              className="px-3 py-2 text-sm rounded bg-slate-100 dark:bg-white/5 border border-white/12"
              placeholder={t('audit.filter.end_date') || 'End date'}
            />

            <input
              type="text"
              value={filters.userId || ''}
              onChange={(e) => setFilters(f => ({ ...f, userId: e.target.value || undefined }))}
              className="px-3 py-2 text-sm rounded bg-slate-100 dark:bg-white/5 border border-white/12"
              placeholder={t('audit.filter.user_email') || 'User email'}
            />

            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              {t('audit.filter.clear') || 'Clear'}
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded">
          {error}
        </div>
      )}

      {/* Audit Entries */}
      <div className="space-y-2">
        {loading && entries.length === 0 ? (
          <div className="glass rounded p-4 border border-slate-200 dark:border-white/10 text-center">
            <div className="text-slate-500 dark:text-white/70">
              {t('audit.loading') || 'Loading audit logs...'}
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="glass rounded p-4 border border-slate-200 dark:border-white/10 text-center">
            <div className="text-slate-500 dark:text-white/70">
              {t('audit.no_entries') || 'No audit entries found'}
            </div>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="glass rounded p-4 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Severity indicator */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border ${getSeverityColor(entry.severity)}`}>
                  {getSeverityIcon(entry.severity)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {getActionLabel(entry.action)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(entry.severity)}`}>
                        {entry.severity}
                      </span>
                    </div>
                    <time className="text-xs text-slate-500 dark:text-white/50" title={toDate(entry.timestamp).toLocaleString()}>
                      {formatTimestamp(entry.timestamp)}
                    </time>
                  </div>

                  <div className="text-sm text-slate-600 dark:text-white/70 mb-2">
                    {t('audit.by_user', { user: entry.userName || entry.userEmail }) || `By ${entry.userName || entry.userEmail}`}
                  </div>

                  {/* Metadata */}
                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/70">
                        {t('audit.show_details') || 'Show details'}
                      </summary>
                      <pre className="mt-2 p-2 bg-slate-100 dark:bg-white/5 rounded text-xs overflow-auto">
                        {JSON.stringify(entry.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load more */}
      {entries.length >= maxEntries && (
        <div className="text-center">
          <button
            onClick={() => {/* TODO: Implement pagination */}}
            className="px-4 py-2 text-sm bg-slate-500 text-white rounded hover:bg-slate-600"
          >
            {t('audit.load_more') || 'Load more entries'}
          </button>
        </div>
      )}
    </div>
  );
}