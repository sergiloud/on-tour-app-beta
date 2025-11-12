import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HomeScreen } from './HomeScreen';
import { Dock } from './Dock';
import { AppModal } from './AppModal';
import { NotificationCenter } from './NotificationCenter';
import { SpotlightSearch } from './SpotlightSearch';
import { AppSwitcher } from './AppSwitcher';
import { useDeviceInfo } from '../../../hooks/useDeviceInfo';
import { useAppBadges } from '../../../hooks/useAppBadges';
import { useAppPreload } from '../../../hooks/useAppPreload';
import { useInstantDebounce } from '../../../hooks/useDebounce';
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
  weather: false,
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
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openApp, setOpenApp] = useState<AppDefinition | null>(null);
  const [recentApps, setRecentApps] = useState<string[]>([]);
  
  // Refs para prevenir múltiples aperturas simultáneas
  const isOpeningAppRef = useRef(false);
  const lastOpenedAppRef = useRef<string | null>(null);
  const openTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

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

  // Precargar apps del dock y recientes
  useAppPreload(dockApps, recentApps, APP_REGISTRY);

  // Handle app open - OPTIMIZADO para prevenir doble apertura y lag
  const handleAppOpen = useCallback((app: AppDefinition) => {
    // Validar que la app existe y es válida
    if (!app || !app.id || !app.component) {
      console.warn('Invalid app definition:', app);
      return;
    }

    // Si ya hay una app abriéndose o es la misma app, ignorar
    if (isOpeningAppRef.current || openApp?.id === app.id) {
      return;
    }

    // Si acabamos de abrir esta misma app hace menos de 500ms, ignorar (doble-click)
    if (lastOpenedAppRef.current === app.id) {
      return;
    }

    // Marcar como abriendo
    isOpeningAppRef.current = true;
    lastOpenedAppRef.current = app.id;

    // Limpiar timeout anterior si existe
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }

    // Haptic feedback suave
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    // Abrir app inmediatamente
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

    // Resetear flags después de un delay seguro
    openTimeoutRef.current = setTimeout(() => {
      isOpeningAppRef.current = false;
      lastOpenedAppRef.current = null;
    }, 500);
  }, [openApp, isEditMode]);

  // Handle app close - OPTIMIZADO
  const handleAppClose = useCallback(() => {
    // Limpiar timeouts
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }
    
    setOpenApp(null);
    
    // Resetear flags inmediatamente al cerrar
    isOpeningAppRef.current = false;
    
    // Permitir reabrir la misma app después de 200ms
    setTimeout(() => {
      lastOpenedAppRef.current = null;
    }, 200);
  }, []);

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
      }
    };
  }, []);

  // Handle enter edit mode
  const handleEnterEditMode = useCallback(() => {
    setIsEditMode(true);
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, []);

  // Handle exit edit mode
  const handleExitEditMode = useCallback(() => {
    setIsEditMode(false);
  }, []);

  // Handle layout change (drag & drop)
  const handleLayoutChange = useCallback((newPages: AppLayout['pages']) => {
    setLayout(prev => ({
      ...prev,
      pages: newPages,
    }));
  }, []);

  // Gesture detection for App Switcher (swipe up from bottom)
  useEffect(() => {
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch && touch.clientY > window.innerHeight - 100) {
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartY) return;
      
      const touch = e.touches[0];
      if (!touch) return;

      const deltaY = touchStartY - touch.clientY;
      const deltaTime = Date.now() - touchStartTime;

      // Swipe up from bottom edge (fast and long enough)
      if (deltaY > 100 && deltaTime < 300 && !openApp && !showSearch && !showNotifications) {
        setShowAppSwitcher(true);
        if (navigator.vibrate) navigator.vibrate(30);
        touchStartY = 0;
      }
    };

    const handleTouchEnd = () => {
      touchStartY = 0;
      touchStartTime = 0;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [openApp, showSearch, showNotifications]);

  return (
    <div className="fixed inset-0 bg-dark-900 overflow-hidden gpu-accelerate">
      {/* Animated Background - Zen & Dynamic */}
      <motion.div 
        className="absolute inset-0 prevent-repaint"
        animate={{
          background: [
            'radial-gradient(circle at 20% 20%, #16202c 0%, #0b1118 55%, #05070a 100%)',
            'radial-gradient(circle at 80% 30%, #14202b 0%, #0a1017 55%, #05070a 100%)',
            'radial-gradient(circle at 50% 80%, #15212c 0%, #0b1118 55%, #050709 100%)',
            'radial-gradient(circle at 20% 20%, #16202c 0%, #0b1118 55%, #05070a 100%)',
          ]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
          times: [0, 0.33, 0.66, 1]
        }}
      />

      {/* Subtle accent glow */}
      <motion.div
        className="absolute inset-0 opacity-5 prevent-repaint"
        animate={{
          background: [
            'radial-gradient(circle at 30% 40%, rgba(191, 255, 0, 0.08), transparent 60%)',
            'radial-gradient(circle at 70% 60%, rgba(191, 255, 0, 0.08), transparent 60%)',
            'radial-gradient(circle at 30% 40%, rgba(191, 255, 0, 0.08), transparent 60%)',
          ]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
          times: [0, 0.5, 1]
        }}
      />

      {/* Top Action Buttons */}
      {!openApp && !showNotifications && !showSearch && (
        <>
          {/* Search Button - Top Left */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.2, ease: 'easeOut' }}
            onClick={() => setShowSearch(true)}
            className="absolute top-4 left-4 z-30 p-2 rounded-full bg-white/20 dark:bg-neutral-800/40 backdrop-blur-md shadow-lg touch-optimized gpu-accelerate"
          >
            <Search className="w-5 h-5 text-white dark:text-neutral-200" />
          </motion.button>

          {/* Notification Bell - Top Right */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.2, ease: 'easeOut' }}
            onClick={() => setShowNotifications(true)}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/20 dark:bg-neutral-800/40 backdrop-blur-md shadow-lg touch-optimized gpu-accelerate"
          >
            <Bell className="w-5 h-5 text-white dark:text-neutral-200" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.15, ease: 'backOut' }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center gpu-accelerate"
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

      {/* App Switcher */}
      <AppSwitcher
        isOpen={showAppSwitcher}
        onClose={() => setShowAppSwitcher(false)}
        recentApps={recentApps.map(id => APP_REGISTRY[id]).filter((app): app is AppDefinition => !!app)}
        onAppSelect={(appId) => {
          const app = APP_REGISTRY[appId];
          if (app) {
            handleAppOpen(app);
            setShowAppSwitcher(false);
          }
        }}
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
