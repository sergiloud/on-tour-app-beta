import React from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../../lib/i18n';
import { sanitizeName } from '../../lib/sanitize';

interface Show {
  id: string;
  name: string;
  date: string;
  city: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface ShowsSummaryCardProps {
  upcomingShows: Show[];
  totalShows: number;
}

export const ShowsSummaryCard: React.FC<ShowsSummaryCardProps> = ({
  upcomingShows,
  totalShows
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: Show['status']) => {
    switch (status) {
      case 'confirmed': return 'text-green-400';
      case 'pending': return 'text-amber-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: Show['status']) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'pending': return '⏳';
      case 'cancelled': return '❌';
      default: return '📅';
    }
  };

  return (
    <div
      className="p-6 rounded-xl border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/5 backdrop-blur-sm hover-lift cursor-pointer animate-slide-up"
      style={{ animationDelay: '100ms' }}
      onClick={() => navigate('/dashboard/shows')}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <span className="text-lg">🎤</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('dashboard.card.shows.title') || 'Shows'}
            </h3>
            <p className="text-sm text-slate-400">
              {t('dashboard.card.shows.subtitle') || 'Tour schedule & venues'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalShows}</div>
          <div className="text-xs text-slate-400">
            {t('dashboard.card.shows.total') || 'Total'}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
            {t('dashboard.card.shows.upcoming') || 'Upcoming Shows'}
          </h4>
          <div className="space-y-2 animate-stagger">
            {upcomingShows.slice(0, 3).map((show) => (
              <div
                key={show.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {sanitizeName(show.name)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {sanitizeName(show.city)} • {new Date(show.date).toLocaleDateString()}
                  </div>
                </div>
                <span className="text-sm ml-2">
                  {getStatusIcon(show.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {upcomingShows.length > 3 && `+${upcomingShows.length - 3} ${t('dashboard.card.shows.more') || 'more'}`}
          </div>
          <button
            className="px-3 py-1 text-xs font-medium bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/20 rounded-full transition-colors hover-scale active-scale"
          >
            {t('dashboard.card.viewAll') || 'View All'}
          </button>
        </div>
      </div>
    </div>
  );
};
