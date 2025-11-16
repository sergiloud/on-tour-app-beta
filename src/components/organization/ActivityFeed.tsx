/**
 * ActivityFeed Component
 * 
 * Real-time activity feed showing audit logs with filtering.
 * Displays "who did what, when" for team collaboration visibility.
 */

import React, { useState, useMemo } from 'react';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { useOrganizationContext } from '../../context/OrganizationContext';
import type { AuditAction, AuditSeverity, AuditLogEntry } from '../../types/audit';
import { ACTION_LABELS, ACTION_SEVERITY } from '../../types/audit';
import { 
  Activity, 
  Users, 
  DollarSign, 
  Calendar, 
  Trash2, 
  Edit3, 
  Settings, 
  UserPlus, 
  UserMinus, 
  Shield,
  FileText,
  Plane,
  Filter,
  ChevronDown,
  AlertCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import { t } from '../../lib/i18n';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useSettings } from '../../context/SettingsContext';

interface ActivityFeedProps {
  /**
   * Maximum number of logs to display
   * @default 50
   */
  limit?: number;
  
  /**
   * Show filters UI
   * @default true
   */
  showFilters?: boolean;
  
  /**
   * Compact mode (smaller spacing)
   * @default false
   */
  compact?: boolean;
}

// Icon mapping by action category
const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'member': Users,
  'finance': DollarSign,
  'show': Calendar,
  'org': Settings,
  'calendar': Calendar,
  'contact': FileText,
  'travel': Plane,
};

// Severity icons and colors
const SEVERITY_CONFIG = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  critical: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
};

export function ActivityFeed({ 
  limit = 50, 
  showFilters = true,
  compact = false 
}: ActivityFeedProps) {
  const { currentOrg } = useOrganizationContext();
  const { lang } = useSettings();
  
  // Filters
  const [selectedSeverity, setSelectedSeverity] = useState<AuditSeverity | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  // Fetch logs
  const { logs, isLoading, error } = useAuditLogs(
    currentOrg?.id || '',
    {
      severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
      limit,
    }
  );
  
  // Filter by category
  const filteredLogs = useMemo(() => {
    if (selectedCategory === 'all') return logs;
    return logs.filter(log => log.action.startsWith(selectedCategory));
  }, [logs, selectedCategory]);
  
  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(logs.map(log => log.action.split('.')[0]));
    return ['all', ...Array.from(cats).sort()];
  }, [logs]);
  
  // Get icon for action
  const getActionIcon = (action: AuditAction) => {
    const category = action.split('.')[0];
    const Icon = ACTION_ICONS[category as keyof typeof ACTION_ICONS] || Activity;
    return Icon;
  };
  
  // Format timestamp with date-fns
  const formatTimestamp = (timestamp: Date) => {
    const locale = lang === 'es' ? es : enUS;
    return formatDistanceToNow(timestamp, { addSuffix: true, locale });
  };
  
  // Render metadata as readable text
  const renderMetadata = (log: AuditLogEntry) => {
    const { action, metadata } = log;
    
    if (action === 'member.role_changed') {
      return (
        <span className="text-sm text-white/50">
          {metadata.memberEmail || metadata.memberName} · {metadata.oldRole} → {metadata.newRole}
        </span>
      );
    }
    
    if (action === 'member.invited') {
      return (
        <span className="text-sm text-white/50">
          {metadata.inviteeEmail} · {metadata.role}
        </span>
      );
    }
    
    if (action === 'member.removed') {
      return (
        <span className="text-sm text-white/50">
          {metadata.memberEmail || metadata.memberName}
        </span>
      );
    }
    
    if (action.startsWith('finance.')) {
      return (
        <span className="text-sm text-white/50">
          {metadata.amount && `${metadata.currency || '€'} ${metadata.amount}`}
          {metadata.transactionId && ` · ID: ${metadata.transactionId.slice(0, 8)}`}
        </span>
      );
    }
    
    if (action.startsWith('show.')) {
      return (
        <span className="text-sm text-white/50">
          {metadata.showTitle || metadata.showName}
          {metadata.showDate && ` · ${new Date(metadata.showDate).toLocaleDateString()}`}
        </span>
      );
    }
    
    // Default: show first metadata value
    const firstValue = Object.values(metadata)[0];
    if (firstValue && typeof firstValue === 'string') {
      return <span className="text-sm text-white/50">{firstValue}</span>;
    }
    
    return null;
  };
  
  if (!currentOrg) {
    return (
      <div className="glass-panel p-8 text-center">
        <Activity className="h-12 w-12 text-white/30 mx-auto mb-3" />
        <p className="text-white/50">{t('organization.selectToViewActivity')}</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="glass-panel p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-400 font-medium mb-2">{t('common.error')}</p>
        <p className="text-white/50 text-sm">{error.message}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      {showFilters && (
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t('organization.activityFeed')}
            </h3>
            
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 
                         text-white/70 hover:text-white text-sm transition-colors"
            >
              <Filter className="h-4 w-4" />
              {t('common.filters')}
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {/* Filter Menu */}
          {showFilterMenu && (
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
              {/* Severity Filter */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">
                  {t('organization.severity')}
                </label>
                <div className="flex gap-2">
                  {(['all', 'info', 'warning', 'critical'] as const).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSelectedSeverity(sev)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedSeverity === sev
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {sev === 'all' ? t('common.all') : sev}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Category Filter */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">
                  {t('organization.category')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 
                             text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-gray-900">
                      {cat === 'all' ? t('common.all') : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Activity List */}
      <div className="glass-panel overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-purple-500" />
            <p className="mt-3 text-white/50">{t('common.loading')}</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="h-12 w-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/50">{t('organization.noActivityYet')}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredLogs.map((log) => {
              const Icon = getActionIcon(log.action);
              const severityConfig = SEVERITY_CONFIG[log.severity];
              const SeverityIcon = severityConfig.icon;
              
              return (
                <div
                  key={log.id}
                  className={`flex gap-4 hover:bg-white/5 transition-colors ${
                    compact ? 'p-3' : 'p-4'
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 ${severityConfig.bg} rounded-lg p-2.5 h-fit`}>
                    <Icon className={`h-5 w-5 ${severityConfig.color}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="text-white font-medium">
                        {ACTION_LABELS[log.action]}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <SeverityIcon className={`h-3.5 w-3.5 ${severityConfig.color}`} />
                        <span className="text-xs text-white/40">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
                      <span className="font-medium">{log.userName}</span>
                      <span className="text-white/30">·</span>
                      <span className="text-white/40">{log.userEmail}</span>
                    </div>
                    
                    {renderMetadata(log)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Stats Footer */}
      {!isLoading && filteredLogs.length > 0 && (
        <div className="glass-panel p-3 flex items-center justify-between text-xs text-white/50">
          <span>{t('organization.showingLogs', { count: filteredLogs.length, total: logs.length })}</span>
          <span>{t('organization.limit', { limit })}</span>
        </div>
      )}
    </div>
  );
}
