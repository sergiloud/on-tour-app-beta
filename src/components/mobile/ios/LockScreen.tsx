import React, { useState, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useNotifications } from '../../../stores/notificationStore';

interface LockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ isLocked, onUnlock }) => {
  const { unreadCount } = useNotifications();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dragY, setDragY] = useState(0);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time (HH:MM)
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Format date (Weekday, Day Month)
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 200) {
      onUnlock();
    } else {
      setDragY(0);
    }
  };

  if (!isLocked) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] overflow-hidden"
    >
      {/* Lock screen background with blur */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-ink-900 via-dark-900 to-ink-950"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 40%, rgba(191, 255, 0, 0.05), transparent 60%)`,
        }}
      />

      {/* Lock screen content */}
      <div className="relative h-full flex flex-col items-center justify-center py-12 px-6">
        {/* Time & Date - Center */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            {/* Time */}
            <div className="text-8xl font-light text-white mb-2 tracking-tight">
              {formatTime(currentTime)}
            </div>

            {/* Date */}
            <div className="text-xl text-white/70 font-light capitalize">
              {formatDate(currentTime)}
            </div>
          </motion.div>

          {/* Notification badge */}
          {unreadCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12 bg-white/20 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/30"
            >
              <div className="text-white text-sm">
                {unreadCount} {unreadCount === 1 ? 'notificación' : 'notificaciones'}
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center">
          {/* Swipe up indicator */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="flex flex-col items-center cursor-grab active:cursor-grabbing"
            style={{ y: dragY }}
          >
            <Lock className="w-8 h-8 text-white/70 mb-2" />
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-white/50 text-sm font-medium"
            >
              Desliza para abrir
            </motion.div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="mt-2"
            >
              <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};