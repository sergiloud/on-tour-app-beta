import React from 'react';
import { motion } from 'framer-motion';
import { Music, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useShows } from '../../../../hooks/useShows';
import { useKpi } from '../../../../context/KPIDataContext';
import { useSettings } from '../../../../context/SettingsContext';
import { parseISO, isFuture, isThisMonth } from 'date-fns';

interface QuickStatsProps {
  className?: string;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ className = '' }) => {
  const { shows } = useShows();
  const { raw } = useKpi();
  const { fmtMoney } = useSettings();

  // Calcular estadísticas
  const confirmedShows = shows.filter(s => s.status === 'confirmed').length;
  const upcomingShows = shows.filter(s => {
    const showDate = typeof s.date === 'string' ? parseISO(s.date) : new Date(s.date);
    return isFuture(showDate) && s.status === 'confirmed';
  }).length;

  const thisMonthShows = shows.filter(s => {
    const showDate = typeof s.date === 'string' ? parseISO(s.date) : new Date(s.date);
    return isThisMonth(showDate) && s.status === 'confirmed';
  }).length;

  const totalRevenue = raw.yearNet;

  const stats = [
    {
      icon: Music,
      label: 'Total Shows',
      value: confirmedShows,
      iconColor: 'text-accent-500',
      bgColor: 'bg-accent-500/20',
    },
    {
      icon: Calendar,
      label: 'Próximos',
      value: upcomingShows,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      icon: TrendingUp,
      label: 'Este mes',
      value: thisMonthShows,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      icon: DollarSign,
      label: 'Revenue',
      value: totalRevenue >= 1000 ? fmtMoney(totalRevenue).replace(/\.\d+/, 'K') : fmtMoney(totalRevenue),
      iconColor: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
  ];

  return (
    <div className={`relative bg-white/5 backdrop-blur-md rounded-[28px] border border-white/10 overflow-hidden shadow-xl p-4 gpu-accelerate ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-accent-500/20 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-accent-500" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Quick Stats</h2>
          <p className="text-[10px] text-white/50 font-medium">Resumen rápido</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1],
              delay: index * 0.03,
            }}
            className="bg-white/5 backdrop-blur-sm rounded-[16px] p-3 border border-white/10"
            whileHover={{ scale: 1.02, borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.iconColor}`} strokeWidth={2.5} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
            <div className="text-[10px] text-white/60 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
