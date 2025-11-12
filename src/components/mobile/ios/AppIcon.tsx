import React from 'react';
import { motion, PanInfo } from 'framer-motion';
import type { AppDefinition } from '../../../types/mobileOS';

interface AppIconProps {
  app: AppDefinition;
  size?: 'small' | 'medium' | 'large';
  isEditing?: boolean;
  isActive?: boolean;
  badge?: number | string | null;
  onPress?: () => void;
  onLongPress?: () => void;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
}

const SIZE_STYLES = {
  small: 'w-14 h-14 text-2xl',
  medium: 'w-16 h-16 text-3xl',
  large: 'w-20 h-20 text-4xl',
};

const LABEL_STYLES = {
  small: 'text-[10px]',
  medium: 'text-[11px]',
  large: 'text-xs',
};

export const AppIcon: React.FC<AppIconProps> = ({
  app,
  size = 'medium',
  isEditing = false,
  isActive = false,
  badge,
  onPress,
  onLongPress,
  isDragging = false,
  onDragStart,
  onDragEnd,
}) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const longPressTimer = React.useRef<number | null>(null);

  const handleTouchStart = () => {
    setIsPressed(true);
    if (onLongPress) {
      longPressTimer.current = window.setTimeout(() => {
        // Haptic feedback
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
    if (!isEditing && onPress) {
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      onPress();
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-1.5 relative"
      drag={isEditing}
      dragSnapToOrigin={false}
      dragElastic={0.2}
      dragMomentum={false}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      animate={isEditing ? { y: [0, -2, 0] } : {}}
      transition={isEditing ? { 
        repeat: Infinity, 
        duration: 2.5, 
        ease: 'easeInOut' 
      } : {}}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* App Icon */}
      <motion.button
        className={`
          ${SIZE_STYLES[size]}
          rounded-2xl
          relative
          overflow-hidden
          motion-safe:transition-all
          ${isDragging ? 'opacity-50' : ''}
          ${isActive 
            ? 'bg-accent-500 text-black shadow-glow' 
            : 'bg-slate-200 dark:bg-white/10 opacity-80 hover:opacity-100 hover:bg-white/6'
          }
        `}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        aria-label={app.name}
      >
        {/* Icon with native app accent colors */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <app.icon 
            className={`
              ${size === 'large' ? 'w-10 h-10' : size === 'medium' ? 'w-8 h-8' : 'w-6 h-6'}
              ${isActive ? 'text-black' : 'text-accent-500'}
            `}
            strokeWidth={2}
          />
        </div>

        {/* Badge */}
        {badge && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 rounded-full border-2 border-ink-900 shadow-lg"
          >
            <span className="text-[9px] font-bold text-white leading-none">
              {typeof badge === 'number' && badge > 99 ? '99+' : badge}
            </span>
          </motion.div>
        )}

        {/* Edit mode delete button */}
        {isEditing && app.isRemovable && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-20"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Handle delete
            }}
          >
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </motion.button>

      {/* App Label */}
      <span 
        className={`
          ${LABEL_STYLES[size]}
          font-medium
          text-white
          text-center
          leading-tight
          max-w-[72px]
          truncate
          drop-shadow-sm
        `}
      >
        {app.name}
      </span>
    </motion.div>
  );
};
