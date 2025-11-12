import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppIcon } from './AppIcon';
import { WhatsNext } from './widgets/WhatsNext';
import { useDeviceInfo } from '../../../hooks/useDeviceInfo';
import type { AppDefinition, AppPage } from '../../../types/mobileOS';

interface HomeScreenProps {
  pages: AppPage[];
  apps: Record<string, AppDefinition>;
  currentPage: number;
  isEditMode: boolean;
  onPageChange: (page: number) => void;
  onAppOpen: (app: AppDefinition) => void;
  onEnterEditMode: () => void;
  onExitEditMode: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  pages,
  apps,
  currentPage,
  isEditMode,
  onPageChange,
  onAppOpen,
  onEnterEditMode,
  onExitEditMode,
}) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const deviceInfo = useDeviceInfo();

  // Calcular espacio superior según dispositivo
  const topSpace = deviceInfo.hasNotch ? 'h-14' : 'h-10';

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    if (touch) {
      setTouchStart(touch.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    if (touch) {
      setTouchEnd(touch.clientX);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentPage < pages.length - 1) {
      onPageChange(currentPage + 1);
    }
    
    if (isRightSwipe && currentPage > 0) {
      onPageChange(currentPage - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const currentPageData = pages[currentPage];
  if (!currentPageData) return null;

  // Calcular padding top según dispositivo
  const topPadding = deviceInfo.hasNotch ? 'pt-16' : 'pt-12';

  return (
    <div className={`absolute inset-0 flex flex-col overflow-hidden ${topPadding}`}>
      {/* SECCIÓN 1: Apps Grid - 40% altura para 3 filas */}
      <div
        className="h-[40%] px-6 pt-6 overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ 
            type: 'spring', 
            stiffness: 350, 
            damping: 30,
            mass: 0.8
          }}
          className="grid grid-cols-4 gap-x-4 gap-y-5 auto-rows-min"
        >
          {currentPageData.apps.map((appId, index) => {
            if (!appId) {
              return <div key={`empty-${index}`} className="w-full aspect-square" />;
            }

            const app = apps[appId];
            if (!app) return null;

            const badgeValue = app.badge ? app.badge() : null;

            return (
              <motion.div 
                key={appId} 
                className="flex justify-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                  delay: index * 0.03,
                }}
              >
                <AppIcon
                  app={app}
                  size="medium"
                  isEditing={isEditMode}
                  badge={badgeValue}
                  onPress={() => onAppOpen(app)}
                  onLongPress={onEnterEditMode}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* SECCIÓN 2: Widgets Area - hasta el dock */}
      <div className="flex-1 px-6 pt-6 pb-24 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 350,
            damping: 30,
            delay: 0.4,
          }}
        >
          <WhatsNext />
        </motion.div>
      </div>

      {/* Edit mode overlay */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 flex items-end pb-safe-bottom"
          >
            <motion.div 
              className="w-full pb-32 px-6"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 350, 
                  damping: 30,
                  delay: 0.1
                }}
              >
                <motion.button
                  onClick={onExitEditMode}
                  className="w-full py-4 bg-accent-500 text-black font-bold rounded-2xl shadow-glow text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  Listo
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Page Indicators - More iOS-like */}
      {pages.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 pb-4 absolute bottom-0 left-0 right-0 z-20">
          {pages.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => onPageChange(index)}
              initial={false}
              animate={{
                width: index === currentPage ? 24 : 8,
                backgroundColor: index === currentPage ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="h-2 rounded-full"
              aria-label={`Página ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
