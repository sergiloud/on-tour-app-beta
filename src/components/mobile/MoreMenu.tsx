import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../../lib/i18n';
import {
  Cog6ToothIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  LinkIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface MoreMenuProps {
  onClose?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  onClick?: () => void;
  section?: string;
  divider?: boolean;
}

export const MoreMenu: React.FC<MoreMenuProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout clicked');
    onClose?.();
  };

  const menuItems: MenuItem[] = [
    {
      id: 'calendar',
      label: t('nav.calendar'),
      icon: CalendarDaysIcon,
      path: '/dashboard/calendar',
      section: 'main',
    },
    {
      id: 'contacts',
      label: t('nav.contacts'),
      icon: UsersIcon,
      path: '/dashboard/contacts',
      section: 'main',
    },
    { id: 'divider1', label: '', icon: () => null, divider: true },
    {
      id: 'org',
      label: t('nav.overview'),
      icon: BuildingOfficeIcon,
      path: '/dashboard/org',
      section: 'org',
    },
    {
      id: 'members',
      label: t('nav.members'),
      icon: UserGroupIcon,
      path: '/dashboard/org/members',
      section: 'org',
    },
    {
      id: 'clients',
      label: t('nav.clients'),
      icon: SparklesIcon,
      path: '/dashboard/org/clients',
      section: 'org',
    },
    {
      id: 'documents',
      label: t('nav.documents'),
      icon: DocumentTextIcon,
      path: '/dashboard/org/documents',
      section: 'org',
    },
    {
      id: 'reports',
      label: t('nav.reports'),
      icon: ChartBarIcon,
      path: '/dashboard/org/reports',
      section: 'org',
    },
    {
      id: 'links',
      label: t('nav.links'),
      icon: LinkIcon,
      path: '/dashboard/org/links',
      section: 'org',
    },
    { id: 'divider2', label: '', icon: () => null, divider: true },
    {
      id: 'profile',
      label: t('settings.profile'),
      icon: UserCircleIcon,
      path: '/dashboard/settings/profile',
      section: 'settings',
    },
    {
      id: 'settings',
      label: t('settings.title'),
      icon: Cog6ToothIcon,
      path: '/dashboard/settings',
      section: 'settings',
    },
    { id: 'divider3', label: '', icon: () => null, divider: true },
    {
      id: 'logout',
      label: t('auth.logout'),
      icon: ArrowRightOnRectangleIcon,
      onClick: handleLogout,
      section: 'auth',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 bg-ink-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 rounded-t-2xl overflow-hidden shadow-2xl"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-3">
          <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full opacity-50" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-lg font-semibold tracking-tight text-white">
            {t('mobile.more')}
          </h2>
        </div>

        {/* Menu items */}
        <div className="max-h-[70vh] overflow-y-auto overscroll-contain">
          {menuItems.map((item) => {
            if (item.divider) {
              return (
                <div
                  key={item.id}
                  className="h-px bg-slate-200 dark:border-white/10 my-2"
                />
              );
            }

            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else if (item.path) {
                    handleNavigation(item.path);
                  }
                }}
                className="w-full flex items-center gap-4 px-6 py-3 text-left hover:bg-white/6 active:bg-white/10 motion-safe:transition-colors min-h-[52px]"
              >
                <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px] uppercase flex-shrink-0">
                  {item.label.charAt(0)}
                </span>
                <span className="text-base font-medium opacity-90">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};
