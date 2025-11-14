import React from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../../lib/i18n';

interface NextCriticalEventKPIProps {
  eventName: string;
  location: string;
  daysUntil: number;
  timeUntil?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export const NextCriticalEventKPI: React.FC<NextCriticalEventKPIProps> = ({
  eventName,
  location,
  daysUntil,
  timeUntil,
  urgency
}) => {
  const navigate = useNavigate();
  
  const getUrgencyColor = () => {
    switch (urgency) {
      case 'critical': return 'text-red-400 border-red-500/20 bg-red-500/10';
      case 'high': return 'text-orange-400 border-orange-500/20 bg-orange-500/10';
      case 'medium': return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
      case 'low': return 'text-green-400 border-green-500/20 bg-green-500/10';
      default: return 'text-slate-400 border-slate-500/20 bg-slate-500/10';
    }
  };

  const getUrgencyIcon = () => {
    switch (urgency) {
      case 'critical': return '🚨';
      case 'high': return '⚡';
      case 'medium': return '⏰';
      case 'low': return '📅';
      default: return '📅';
    }
  };

  const getTimeText = () => {
    if (daysUntil === 0) {
      return timeUntil || t('dashboard.kpi.event.today') || 'Today';
    } else if (daysUntil === 1) {
      return t('dashboard.kpi.event.tomorrow') || 'Tomorrow';
    } else if (daysUntil < 7) {
      return `${t('dashboard.kpi.event.in') || 'In'} ${daysUntil} ${t('dashboard.kpi.event.days') || 'days'}`;
    } else {
      return `${t('dashboard.kpi.event.in') || 'In'} ${Math.ceil(daysUntil / 7)} ${t('dashboard.kpi.event.weeks') || 'weeks'}`;
    }
  };

  return (
    <div
      className={`p-6 rounded-xl border backdrop-blur-sm cursor-pointer hover-scale transition-transform duration-200 animate-scale-in ${getUrgencyColor()}`}
      style={{ animationDelay: '100ms' }}
      onClick={() => navigate('/dashboard/calendar')}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          {t('dashboard.kpi.event.title') || 'Next Critical Event'}
        </h3>
        <span className="text-2xl">{getUrgencyIcon()}</span>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-xl font-bold text-white mb-1">{eventName}</h4>
          <p className="text-slate-300 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {getTimeText()}
          </div>
          <button
            className="px-3 py-1 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-full transition-colors hover-lift active-scale"
          >
            {t('dashboard.kpi.event.view') || 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};