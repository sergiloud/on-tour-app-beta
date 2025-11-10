import React from 'react';
import { motion } from 'framer-motion';
import { t } from '../../lib/i18n';

interface HeroSectionProps {
  userName: string;
  todaysHeadline: {
    text: string;
    type: 'success' | 'warning' | 'critical' | 'info';
    pulse?: boolean;
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  userName,
  todaysHeadline
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('hero.greeting.morning') || 'Good morning';
    if (hour < 18) return t('hero.greeting.afternoon') || 'Good afternoon';
    return t('hero.greeting.evening') || 'Good evening';
  };

  const getHeadlineColor = () => {
    switch (todaysHeadline.type) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-amber-400';
      case 'success': return 'text-green-400';
      case 'info': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const getHeadlineBgColor = () => {
    switch (todaysHeadline.type) {
      case 'critical': return 'bg-red-500/10 border-red-500/20';
      case 'warning': return 'bg-amber-500/10 border-amber-500/20';
      case 'success': return 'bg-green-500/10 border-green-500/20';
      case 'info': return 'bg-blue-500/10 border-blue-500/20';
      default: return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="text-center mb-8"
    >
      {/* Saludo Personalizado */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="mb-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
          {getGreeting()}, {userName}
        </h1>
        <p className="text-lg text-slate-400">
          {t('hero.subtitle') || 'Your tour command center awaits'}
        </p>
      </motion.div>

      {/* Titular del Día */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-sm ${getHeadlineBgColor()} ${
          todaysHeadline.pulse ? 'animate-pulse' : ''
        }`}
      >
        <div className={`w-3 h-3 rounded-full ${getHeadlineColor()} ${
          todaysHeadline.pulse ? 'animate-ping' : ''
        }`} />
        <span className={`text-xl font-semibold ${getHeadlineColor()}`}>
          {todaysHeadline.text}
        </span>
        {todaysHeadline.pulse && (
          <div className={`w-3 h-3 rounded-full ${getHeadlineColor()} animate-ping`} />
        )}
      </motion.div>

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="mt-6 flex justify-center"
      >
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rounded-full" />
      </motion.div>
    </motion.div>
  );
};