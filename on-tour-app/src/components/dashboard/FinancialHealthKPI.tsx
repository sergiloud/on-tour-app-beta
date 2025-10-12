import React from 'react';
import { motion } from 'framer-motion';
import { t } from '../../lib/i18n';
import { AnimatedCounter, AnimatedSparkline } from './AnimatedCounter';

interface FinancialHealthKPIProps {
  value: number; // 0-100
  status: 'critical' | 'warning' | 'good';
  amount: number;
  currency: string;
  trend?: number[]; // Array of historical values for sparkline
}

export const FinancialHealthKPI: React.FC<FinancialHealthKPIProps> = ({
  value,
  status,
  amount,
  currency,
  trend = []
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-amber-400';
      case 'good': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case 'critical': return 'bg-red-500/10 border-red-500/20';
      case 'warning': return 'bg-amber-500/10 border-amber-500/20';
      case 'good': return 'bg-green-500/10 border-green-500/20';
      default: return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'critical': return t('dashboard.kpi.financial.critical') || 'Critical';
      case 'warning': return t('dashboard.kpi.financial.warning') || 'At Risk';
      case 'good': return t('dashboard.kpi.financial.good') || 'On Target';
      default: return t('dashboard.kpi.financial.unknown') || 'Unknown';
    }
  };

  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`p-6 rounded-xl border backdrop-blur-sm ${getStatusBg()}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          {t('dashboard.kpi.financial.title') || 'Financial Health'}
        </h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()} bg-current/10`}>
          {getStatusText()}
        </span>
      </div>

      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <svg width="100" height="100" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-white/10"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, delay: 0.2 }}
              className={getStatusColor()}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getStatusColor()}`}>
                <AnimatedCounter value={value} duration={1.2} formatValue={(val) => `${val}%`} />
              </div>
              <div className="text-xs text-slate-400">
                {t('dashboard.kpi.financial.health') || 'Health'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="text-xl font-semibold text-white">
            <AnimatedCounter
              value={amount}
              duration={1.5}
              formatValue={(val) => new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(val)}
            />
          </div>
          {trend.length > 0 && (
            <AnimatedSparkline
              data={trend}
              width={60}
              height={24}
              strokeColor={status === 'good' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444'}
              className="ml-2"
            />
          )}
        </div>
        <div className="text-sm text-slate-400">
          {t('dashboard.kpi.financial.net') || 'Net Profit'}
        </div>
      </div>
    </motion.div>
  );
};