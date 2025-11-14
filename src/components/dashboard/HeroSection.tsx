import React from 'react';
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
    <div
      className="text-center mb-8 animate-slide-down"
    >
      {/* Saludo Personalizado */}
      <div
        className="mb-4 animate-scale-in"
        style={{ animationDelay: '50ms' }}
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
          {getGreeting()}, {userName}
        </h1>
        <p className="text-lg text-slate-400">
          {t('hero.subtitle') || 'Your tour command center awaits'}
        </p>
      </div>

      {/* Titular del Día */}
      <div
        className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-sm animate-slide-up ${getHeadlineBgColor()} ${
          todaysHeadline.pulse ? 'animate-pulse' : ''
        }`}
        style={{ animationDelay: '150ms' }}
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
      </div>

      {/* Decorative Elements */}
      <div
        className="mt-6 flex justify-center animate-scale-in"
        style={{ animationDelay: '250ms' }}
      >
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rounded-full" />
      </div>
    </div>
  );
};