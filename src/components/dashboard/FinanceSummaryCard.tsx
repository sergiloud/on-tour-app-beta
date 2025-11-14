import React from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../../lib/i18n';

interface FinanceSummaryCardProps {
  netProfit: number;
  currency: string;
  trend: number[]; // Array of last 7 days/weeks values
  status: 'positive' | 'negative' | 'neutral';
}

export const FinanceSummaryCard: React.FC<FinanceSummaryCardProps> = ({
  netProfit,
  currency,
  trend,
  status
}) => {
  const navigate = useNavigate();
  
  const getStatusColor = () => {
    switch (status) {
      case 'positive': return 'text-green-400 border-green-500/20 bg-green-500/5';
      case 'negative': return 'text-red-400 border-red-500/20 bg-red-500/5';
      case 'neutral': return 'text-slate-400 border-slate-500/20 bg-slate-500/5';
      default: return 'text-slate-400 border-slate-500/20 bg-slate-500/5';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      case 'neutral': return '➡️';
      default: return '➡️';
    }
  };

  // Calculate min/max for sparkline scaling
  const minValue = Math.min(...trend);
  const maxValue = Math.max(...trend);
  const range = maxValue - minValue || 1;

  // Create sparkline path
  const sparklinePoints = trend.map((value, index) => {
    const x = (index / (trend.length - 1)) * 100;
    const y = 100 - ((value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const isPositive = netProfit >= 0;

  return (
    <div
      className={`p-6 rounded-xl border backdrop-blur-sm hover-scale transition-transform duration-200 cursor-pointer animate-slide-up ${getStatusColor()}`}
      onClick={() => navigate('/dashboard/finance')}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <span className="text-lg">💰</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('dashboard.card.finance.title') || 'Finance'}
            </h3>
            <p className="text-sm text-slate-400">
              {t('dashboard.card.finance.subtitle') || 'Revenue & expenses'}
            </p>
          </div>
        </div>
        <span className="text-xl">{getStatusIcon()}</span>
      </div>

      <div className="space-y-4">
        <div>
          <div className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(netProfit)}
          </div>
          <div className="text-sm text-slate-400">
            {t('dashboard.card.finance.net') || 'Net Profit'}
          </div>
        </div>

        {/* Sparkline */}
        <div className="h-12 flex items-end">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              points={sparklinePoints}
              className={getStatusColor().replace('text-', 'stroke-').replace('/20', '/60')}
            />
          </svg>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {t('dashboard.card.finance.trend') || '7-day trend'}
          </span>
          <button
            className="px-3 py-1 text-xs font-medium bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/20 rounded-full transition-colors hover-lift active-scale"
          >
            {t('dashboard.card.viewAll') || 'View All'}
          </button>
        </div>
      </div>
    </div>
  );
};