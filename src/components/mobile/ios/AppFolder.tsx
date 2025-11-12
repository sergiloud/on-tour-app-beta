import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';
import { AppIcon } from './AppIcon';
import type { AppDefinition } from '../../../types/mobileOS';

interface AppFolderProps {
  name: string;
  apps: AppDefinition[];
  color?: string;
  isOpen: boolean;
  onClose: () => void;
  onAppOpen: (app: AppDefinition) => void;
  onRename?: (newName: string) => void;
}

export const AppFolder: React.FC<AppFolderProps> = ({
  name,
  apps,
  color = 'accent',
  isOpen,
  onClose,
  onAppOpen,
  onRename,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [folderName, setFolderName] = useState(name);

  const handleSaveName = () => {
    if (onRename && folderName.trim()) {
      onRename(folderName.trim());
    }
    setIsEditing(false);
  };

  const handleAppClick = (app: AppDefinition) => {
    onAppOpen(app);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md"
          />

          {/* Folder Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-x-4 top-20 z-[160] max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Folder container */}
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="p-6 pb-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                {/* Folder Name */}
                {isEditing ? (
                  <input
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') {
                        setFolderName(name);
                        setIsEditing(false);
                      }
                    }}
                    autoFocus
                    className="w-full bg-white/10 text-white text-2xl font-semibold text-center px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-accent-500"
                  />
                ) : (
                  <h2
                    onClick={() => setIsEditing(true)}
                    className="text-2xl font-semibold text-white text-center cursor-pointer hover:text-accent-400 transition-colors"
                  >
                    {name}
                  </h2>
                )}

                <div className="text-center text-white/50 text-sm mt-1">
                  {apps.length} {apps.length === 1 ? 'app' : 'apps'}
                </div>
              </div>

              {/* Apps Grid */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-3 gap-6">
                  {apps.map((app) => (
                    <div key={app.id} className="flex justify-center">
                      <AppIcon
                        app={app}
                        size="large"
                        onPress={() => handleAppClick(app)}
                      />
                    </div>
                  ))}
                </div>

                {/* Empty state */}
                {apps.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-white/30 text-lg mb-2">Carpeta vacía</div>
                    <div className="text-white/20 text-sm">
                      Arrastra apps aquí para organizarlas
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface FolderIconProps {
  name: string;
  apps: AppDefinition[];
  color?: string;
  onOpen: () => void;
  onLongPress?: () => void;
}

export const FolderIcon: React.FC<FolderIconProps> = ({
  name,
  apps,
  color = 'accent',
  onOpen,
  onLongPress,
}) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const longPressTimer = React.useRef<number | null>(null);

  const handleTouchStart = () => {
    setIsPressed(true);
    if (onLongPress) {
      longPressTimer.current = window.setTimeout(() => {
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        onLongPress();
      }, 500);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    onOpen();
  };

  // Get first 9 apps for preview
  const previewApps = apps.slice(0, 9);

  return (
    <motion.div
      className="flex flex-col items-center gap-1.5 relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Folder Icon */}
      <motion.button
        className="w-16 h-16 rounded-2xl relative overflow-hidden bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl border border-white/30"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {/* App preview grid */}
        <div className="absolute inset-0 p-1.5">
          <div className="grid grid-cols-3 gap-0.5 h-full">
            {previewApps.map((app, index) => (
              <div
                key={`${app.id}-${index}`}
                className="bg-accent-500/40 rounded-sm flex items-center justify-center"
              >
                <app.icon className="w-2.5 h-2.5 text-white/70" strokeWidth={2.5} />
              </div>
            ))}
            {/* Fill empty slots */}
            {Array.from({ length: Math.max(0, 9 - previewApps.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white/5 rounded-sm" />
            ))}
          </div>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </motion.button>

      {/* Folder Label */}
      <span className="text-[11px] font-medium text-white text-center leading-tight max-w-[72px] truncate drop-shadow-sm">
        {name}
      </span>
    </motion.div>
  );
};