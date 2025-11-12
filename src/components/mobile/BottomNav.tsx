import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { t } from '../../lib/i18n';
import {
  HomeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MapIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CalendarIcon as CalendarIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  MapIcon as MapIconSolid,
  EllipsisHorizontalIcon as EllipsisHorizontalIconSolid,
} from '@heroicons/react/24/solid';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconSolid: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: t('nav.dashboard'),
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
    path: '/dashboard',
  },
  {
    id: 'shows',
    label: t('nav.shows'),
    icon: CalendarIcon,
    iconSolid: CalendarIconSolid,
    path: '/dashboard/shows',
  },
  {
    id: 'finance',
    label: t('nav.finance'),
    icon: CurrencyDollarIcon,
    iconSolid: CurrencyDollarIconSolid,
    path: '/dashboard/finance',
  },
  {
    id: 'travel',
    label: t('nav.travel'),
    icon: MapIcon,
    iconSolid: MapIconSolid,
    path: '/dashboard/travel',
  },
  {
    id: 'more',
    label: t('mobile.more'),
    icon: EllipsisHorizontalIcon,
    iconSolid: EllipsisHorizontalIconSolid,
    path: '/dashboard/more',
  },
];

interface BottomNavProps {
  className?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ className = '' }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleTap = () => {
    // Haptic feedback on supported devices
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-[21]
        border-t border-slate-100 dark:border-white/5
        bg-ink-900/95 backdrop-blur-xl shadow-2xl
        ${className}
      `}
      role="navigation"
      aria-label="Primary mobile navigation"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 0.25rem)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);

          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.id === 'home'}
              onClick={handleTap}
              className={({ isActive: linkActive }) => `
                flex-1 flex flex-col items-center gap-1 
                min-h-[44px] min-w-[44px]
                rounded-md px-2 py-2
                motion-safe:transition-all
                active:scale-95
                ${active || linkActive 
                  ? 'bg-accent-500 text-black shadow-glow' 
                  : 'opacity-80 hover:opacity-100 hover:bg-white/6'
                }
              `}
            >
              {/* Icon with first letter fallback (matching desktop style) */}
              <span className={`
                w-5 h-5 rounded-md 
                flex items-center justify-center 
                text-[10px] uppercase font-semibold
                ${active || location.pathname.startsWith(item.path)
                  ? 'bg-black/10 text-black'
                  : 'bg-slate-200 dark:bg-white/10'
                }
              `}>
                {item.label.charAt(0)}
              </span>

              {/* Label */}
              <span className="text-[10px] font-medium leading-tight">
                {item.label}
              </span>

              {/* Badge */}
              {item.badge && item.badge > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[8px] font-semibold text-white bg-red-500 rounded-full">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
