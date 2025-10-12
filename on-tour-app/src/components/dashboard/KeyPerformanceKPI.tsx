import React from 'react';
import { motion } from 'framer-motion';
import { t } from '../../lib/i18n';
import { AnimatedCounter, AnimatedSparkline } from './AnimatedCounter';

interface KeyPerformanceKPIProps {
  title: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'poor';
  trendData?: number[]; // Array of historical values for sparkline
}

export const KeyPerformanceKPI: React.FC<KeyPerformanceKPIProps> = ({
  title,
  value,
  target,
  unit,
  trend,
  status,
  trendData = []
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'warning': return 'text-amber-400';
      case 'poor': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case 'excellent': return 'bg-green-500/10 border-green-500/20';
      case 'good': return 'bg-blue-500/10 border-blue-500/20';
      case 'warning': return 'bg-amber-500/10 border-amber-500/20';
      case 'poor': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      default: return '→';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      case 'stable': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  const progressPercentage = Math.min((value / target) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={`p-6 rounded-xl border backdrop-blur-sm ${getStatusBg()}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="flex items-center gap-2">
          <span className={`text-lg ${getTrendColor()}`}>{getTrendIcon()}</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()} bg-current/10`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-end gap-2">
          <span className={`text-3xl font-bold ${getStatusColor()}`}>
            <AnimatedCounter value={value} duration={1.2} formatValue={(val) => val.toLocaleString()} />
          </span>
          <span className="text-lg text-slate-400 mb-1">{unit}</span>
          {trendData.length > 0 && (
            <AnimatedSparkline
              data={trendData}
              width={50}
              height={20}
              strokeColor={status === 'excellent' ? '#10b981' : status === 'good' ? '#3b82f6' : status === 'warning' ? '#f59e0b' : '#ef4444'}
              className="ml-2"
            />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">
              {t('dashboard.kpi.performance.target') || 'Target'}: {target.toLocaleString()} {unit}
            </span>
            <span className={`font-medium ${getStatusColor()}`}>
              {progressPercentage.toFixed(0)}%
            </span>
          </div>

          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${getStatusColor().replace('text-', 'bg-')}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          </div>
        </div>

        <div className="text-xs text-slate-400 text-center">
          {value >= target
            ? t('dashboard.kpi.performance.achieved') || 'Target achieved'
            : `${t('dashboard.kpi.performance.remaining') || 'Remaining'}: ${(target - value).toLocaleString()} ${unit}`
          }
        </div>
      </div>
    </motion.div>
  );
};