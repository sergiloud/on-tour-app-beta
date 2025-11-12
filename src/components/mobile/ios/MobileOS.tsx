import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HomeScreen } from './HomeScreen';
import { Dock } from './Dock';
import { AppModal } from './AppModal';
import { NotificationCenter } from './NotificationCenter';
import { SpotlightSearch } from './SpotlightSearch';
import { ControlCenter } from './ControlCenter';
import { useDeviceInfo } from '../../../hooks/useDeviceInfo';
import { useAppBadges } from '../../../hooks/useAppBadges';
import { APP_REGISTRY, getDefaultLayout, updateAppBadges } from '../../../config/appRegistry';
import { NotificationProvider, useNotifications } from '../../../stores/notificationStore';
import { ThemeProvider } from '../../../stores/themeStore';
import type { AppDefinition, AppLayout, MobileOSState } from '../../../types/mobileOS';
import { Bell, Search } from 'lucide-react';

const STORAGE_KEY = 'mobileOS:layout';
const WIDGETS_KEY = 'mobileOS:widgets';

// Default widgets configuration
const DEFAULT_WIDGETS = {
  whatsNext: true,
  quickStats: false,
  tasks: false,
  financeStats: false,
  nearbyShows: false,
  quickActions: false,
};

const MobileOSContent: React.FC = () => {
  const deviceInfo = useDeviceInfo();
  const { unreadCount } = useNotifications();
  const badges = useAppBadges();

  // Update global badges state for app registry
  useEffect(() => {
    updateAppBadges(badges);
  }, [badges]);
  
  // Load layout from localStorage or use default
  const [layout, setLayout] = useState<AppLayout>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : getDefaultLayout();
    } catch {
      return getDefaultLayout();
    }
  });

  // Load widgets configuration
  const [enabledWidgets, setEnabledWidgets] = useState(() => {
    try {
      const stored = localStorage.getItem(WIDGETS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  });

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showControlCenter, setShowControlCenter] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openApp, setOpenApp] = useState<AppDefinition | null>(null);
  const [recentApps, setRecentApps] = useState<string[]>([]);

  // Persist layout to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  }, [layout]);

  // Persist widgets configuration
  useEffect(() => {
    try {
      localStorage.setItem(WIDGETS_KEY, JSON.stringify(enabledWidgets));
    } catch (error) {
      console.error('Failed to save widgets config:', error);
    }
  }, [enabledWidgets]);

  // Listen for widget changes from Settings app
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === WIDGETS_KEY && e.newValue) {
        try {
          setEnabledWidgets(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Failed to parse widgets config:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get dock apps
  const dockApps = layout.dock
    .map(id => APP_REGISTRY[id])
    .filter(Boolean) as AppDefinition[];

  // Handle app open
  const handleAppOpen = (app: AppDefinition) => {
    setOpenApp(app);
    
    // Add to recent apps (max 10)
    setRecentApps(prev => {
      const filtered = prev.filter(id => id !== app.id);
      return [app.id, ...filtered].slice(0, 10);
    });

    // Exit edit mode if active
    if (isEditMode) {
      setIsEditMode(false);
    }
  };

  // Handle app close
  const handleAppClose = () => {
    setOpenApp(null);
  };

  // Handle enter edit mode
  const handleEnterEditMode = () => {
    setIsEditMode(true);
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Handle exit edit mode
  const handleExitEditMode = () => {
    setIsEditMode(false);
  };

  // Handle layout change (drag & drop)
  const handleLayoutChange = (newPages: AppLayout['pages']) => {
    setLayout(prev => ({
      ...prev,
      pages: newPages,
    }));
  };

  return (
    <div className="fixed inset-0 bg-dark-900 overflow-hidden">
      {/* Animated Background - Zen & Dynamic */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 20%, #16202c 0%, #0b1118 55%, #05070a 100%)',
            'radial-gradient(circle at 80% 30%, #14202b 0%, #0a1017 55%, #05070a 100%)',
            'radial-gradient(circle at 50% 80%, #15212c 0%, #0b1118 55%, #050709 100%)',
            'radial-gradient(circle at 20% 20%, #16202c 0%, #0b1118 55%, #05070a 100%)',
          ]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Subtle accent glow */}
      <motion.div
        className="absolute inset-0 opacity-5"
        animate={{
          background: [
            'radial-gradient(circle at 30% 40%, rgba(191, 255, 0, 0.08), transparent 60%)',
            'radial-gradient(circle at 70% 60%, rgba(191, 255, 0, 0.08), transparent 60%)',
            'radial-gradient(circle at 30% 40%, rgba(191, 255, 0, 0.08), transparent 60%)',
          ]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Top Action Buttons */}
      {!openApp && !showNotifications && !showSearch && !showControlCenter && (
        <>
          {/* Search Button - Top Left */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setShowSearch(true)}
            className="absolute top-4 left-4 z-30 p-2 rounded-full bg-white/20 dark:bg-neutral-800/40 backdrop-blur-md shadow-lg"
          >
            <Search className="w-5 h-5 text-white dark:text-neutral-200" />
          </motion.button>

          {/* Control Center Button - Top Right Corner */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setShowControlCenter(true)}
            className="absolute top-4 right-16 z-30 p-2 rounded-full bg-white/20 dark:bg-neutral-800/40 backdrop-blur-md shadow-lg"
          >
            <svg className="w-5 h-5 text-white dark:text-neutral-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </motion.button>

          {/* Notification Bell - Top Right */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setShowNotifications(true)}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/20 dark:bg-neutral-800/40 backdrop-blur-md shadow-lg"
          >
            <Bell className="w-5 h-5 text-white dark:text-neutral-200" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </motion.button>
        </>
      )}

      {/* Home Screen */}
      <HomeScreen
        pages={layout.pages}
        apps={APP_REGISTRY}
        currentPage={currentPage}
        isEditMode={isEditMode}
        enabledWidgets={enabledWidgets}
        onPageChange={setCurrentPage}
        onAppOpen={handleAppOpen}
        onEnterEditMode={handleEnterEditMode}
        onExitEditMode={handleExitEditMode}
        onLayoutChange={handleLayoutChange}
      />

      {/* Dock */}
      {!openApp && (
        <Dock
          apps={dockApps}
          maxApps={5}
          onAppOpen={handleAppOpen}
        />
      )}

      {/* App Modal */}
      <AppModal
        app={openApp}
        isOpen={!!openApp}
        onClose={handleAppClose}
      />

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Spotlight Search */}
      <SpotlightSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />

      {/* Control Center */}
      <ControlCenter
        isOpen={showControlCenter}
        onClose={() => setShowControlCenter(false)}
      />
    </div>
  );
};

export const MobileOS: React.FC = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <MobileOSContent />
      </NotificationProvider>
    </ThemeProvider>
  );
};
