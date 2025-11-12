import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { AppIcon } from './AppIcon';
import { useDeviceInfo } from '../../../hooks/useDeviceInfo';
import type { AppDefinition } from '../../../types/mobileOS';

interface DockProps {
  apps: AppDefinition[];
  maxApps?: number;
  onAppOpen: (app: AppDefinition) => void;
  onReorder?: (apps: string[]) => void;
}

export const Dock: React.FC<DockProps> = ({
  apps,
  maxApps = 5,
  onAppOpen,
  onReorder,
}) => {
  const displayApps = apps.slice(0, maxApps);
  const deviceInfo = useDeviceInfo();

  // Calcular padding bottom según dispositivo
  const bottomPadding = deviceInfo.hasNotch ? '34px' : '8px';

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 gpu-accelerate-full pointer-events-none"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)',
      }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        duration: 0.3,
        ease: 'easeOut',
        delay: 0.05
      }}
    >
      <div className="mx-4 mb-2 pointer-events-auto">
        {/* Dock Container with glass effect matching desktop sidebar */}
        <motion.div 
          className="relative rounded-3xl overflow-hidden bg-ink-900/40 backdrop-blur-2xl glass border border-white/10 gpu-accelerate shadow-2xl contain-layout-paint"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-around px-4 py-3 gap-2">
            {displayApps.map((app, index) => {
              const badgeValue = app.badge ? app.badge() : null;
              
              return (
                <motion.div
                  key={app.id}
                  className="gpu-accelerate dock-icon"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.25,
                    ease: 'backOut',
                    delay: 0.1 + index * 0.03,
                  }}
                >
                  <AppIcon
                    app={app}
                    size="medium"
                    badge={badgeValue}
                    onPress={() => onAppOpen(app)}
                  />
                </motion.div>
              );
            })}

            {/* More indicator if apps exceed max */}
            {apps.length > maxApps && (
              <motion.div 
                className="flex flex-col items-center gap-1.5 gpu-accelerate"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.25,
                  ease: 'backOut',
                  delay: 0.2
                }}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-200 dark:bg-white/10 opacity-80">
                  <MoreHorizontal className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <span className="text-[11px] font-medium text-white/80">Más</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
