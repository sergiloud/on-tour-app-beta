import React from 'react';
import { t } from '../../../lib/i18n';
import StatusBadge from '../../../ui/StatusBadge';

export type ShowStatus = 'offer' | 'pending' | 'confirmed' | 'postponed' | 'canceled' | 'archived';

export interface StatusSelectorProps {
  value: ShowStatus;
  onChange: (status: ShowStatus) => void;
  label?: string;
  help?: string;
  disabled?: boolean;
}

/**
 * Interactive Status Selector with clickable StatusBadges
 * - Visual selection with StatusBadge components
 * - Much faster and clearer than dropdown selects
 * - Header color changes based on selected status
 */
export const StatusSelector: React.FC<StatusSelectorProps> = ({
  value,
  onChange,
  label,
  help,
  disabled = false,
}) => {
  const statuses: ShowStatus[] = ['offer', 'pending', 'confirmed', 'postponed', 'canceled', 'archived'];

  // Status colors for header background
  const statusColors: Record<ShowStatus, string> = {
    offer: 'from-amber-500/20 via-amber-500/10 to-amber-500/5',
    pending: 'from-blue-500/20 via-blue-500/10 to-blue-500/5',
    confirmed: 'from-green-500/20 via-green-500/10 to-green-500/5',
    postponed: 'from-orange-500/20 via-orange-500/10 to-orange-500/5',
    canceled: 'from-red-500/20 via-red-500/10 to-red-500/5',
    archived: 'from-slate-500/20 via-slate-500/10 to-slate-500/5',
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
            {label}
          </label>
          {help && (
            <span className="text-[9px] lowercase tracking-normal opacity-50 font-normal">
              {help}
            </span>
          )}
        </div>
      )}

      {/* Status Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {statuses.map(status => {
          // Get tooltip description for each status
          const tooltipKey = `shows.status.${status}.tooltip`;
          const tooltipDesc = t(tooltipKey);
          const titleAttr = tooltipDesc && tooltipDesc !== tooltipKey ? tooltipDesc : undefined;

          return (
          <button
            key={status}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(status)}
            title={titleAttr}
            className={`relative p-2.5 rounded-md border-2 transition-all duration-200 flex flex-col items-center gap-1 hover:scale-105 active:scale-95 ${
              value === status
                ? 'border-accent-400 bg-accent-500/20 shadow-lg shadow-accent-500/30'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {/* Status Badge */}
            <StatusBadge status={status as any} />

            {/* Label */}
            <span className="text-xs font-medium text-white/70">
              {t(`shows.status.${status}`) || status.charAt(0).toUpperCase() + status.slice(1)}
            </span>

            {/* Checkmark when selected */}
            {value === status && (
              <svg className="w-3 h-3 text-accent-300 absolute top-0.5 right-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            )}
          </button>
          );
        })}
      </div>

      {/* Description */}
      <p className="text-[10px] text-white/60 italic">
        {t('shows.editor.status.hint') || 'Click to change status'}
      </p>
    </div>
  );
};

export default StatusSelector;
