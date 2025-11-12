import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HomeScreen } from './HomeScreen';
import { Dock } from './Dock';
import { AppModal } from './AppModal';
import { StatusBar } from './StatusBar';
import { useDeviceInfo } from '../../../hooks/useDeviceInfo';
import { APP_REGISTRY, getDefaultLayout } from '../../../config/appRegistry';
import type { AppDefinition, AppLayout, MobileOSState } from '../../../types/mobileOS';

const STORAGE_KEY = 'mobileOS:layout';

export const MobileOS: React.FC = () => {
  const deviceInfo = useDeviceInfo();
  
  // Load layout from localStorage or use default
  const [layout, setLayout] = useState<AppLayout>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : getDefaultLayout();
    } catch {
      return getDefaultLayout();
    }
  });

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

      {/* Status Bar */}
      {!openApp && <StatusBar />}

      {/* Home Screen */}
      <HomeScreen
        pages={layout.pages}
        apps={APP_REGISTRY}
        currentPage={currentPage}
        isEditMode={isEditMode}
        onPageChange={setCurrentPage}
        onAppOpen={handleAppOpen}
        onEnterEditMode={handleEnterEditMode}
        onExitEditMode={handleExitEditMode}
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
    </div>
  );
};
