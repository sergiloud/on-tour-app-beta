import { ReactNode, useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { getSafeBottom } from '../../../lib/safeArea';
import { useHaptic } from '../../../lib/haptics';

interface IOSBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Sheet height ('auto', 'half', 'full', or specific px value) */
  height?: 'auto' | 'half' | 'full' | number;
  /** Enable drag to dismiss (default: true) */
  dismissible?: boolean;
  /** Show handle indicator at top (default: true) */
  showHandle?: boolean;
  /** Custom header */
  header?: ReactNode;
  /** Snap points for draggable sheet [0-1] */
  snapPoints?: number[];
}

/**
 * iOS-style Bottom Sheet with drag-to-dismiss
 * Perfect for actions, filters, secondary menus
 * 
 * @example
 * ```tsx
 * <IOSBottomSheet 
 *   isOpen={showFilters} 
 *   onClose={() => setShowFilters(false)}
 *   height="half"
 * >
 *   <FilterOptions />
 * </IOSBottomSheet>
 * ```
 */
export const IOSBottomSheet = ({
  isOpen,
  onClose,
  children,
  height = 'auto',
  dismissible = true,
  showHandle = true,
  header,
  snapPoints = [0, 0.5, 1],
}: IOSBottomSheetProps) => {
  const { impact, dragEnd } = useHaptic();
  const y = useMotionValue(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate sheet height
  const getSheetHeight = () => {
    if (height === 'auto') return 'auto';
    if (height === 'half') return '50vh';
    if (height === 'full') return '90vh';
    return `${height}px`;
  };

  // Background opacity based on drag position
  const backgroundOpacity = useTransform(
    y,
    [0, 300],
    [0.4, 0]
  );

  // Handle drag end
  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    
    const threshold = 150; // Drag down 150px to dismiss
    
    if (info.offset.y > threshold && dismissible) {
      dragEnd();
      onClose();
    } else {
      // Snap back
      impact();
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && dismissible) {
      onClose();
    }
  };

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black"
        style={{ opacity: backgroundOpacity }}
      />

      {/* Sheet */}
      <motion.div
        ref={sheetRef}
        className="relative w-full bg-gray-900 rounded-t-3xl shadow-2xl overflow-hidden"
        style={{
          height: getSheetHeight(),
          paddingBottom: getSafeBottom(),
          y,
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 300,
        }}
        drag={dismissible ? 'y' : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
      >
        {/* Handle */}
        {showHandle && (
          <div className="flex justify-center py-3">
            <div className="w-10 h-1 bg-white/30 rounded-full" />
          </div>
        )}

        {/* Header */}
        {header && (
          <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
            {header}
            {dismissible && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-full px-5 py-4">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

interface IOSFloatingActionButtonProps {
  icon: ReactNode;
  label?: string;
  onClick: () => void;
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'accent';
  /** Show label text beside icon (default: false) */
  extended?: boolean;
  /** Custom position (default: bottom-right with safe area) */
  position?: {
    bottom?: number;
    right?: number;
    left?: number;
  };
}

/**
 * iOS-style Floating Action Button
 * Primary action button positioned in thumb zone
 * 
 * @example
 * ```tsx
 * <IOSFloatingActionButton
 *   icon={<Plus />}
 *   label="Add Show"
 *   onClick={handleAddShow}
 *   extended
 * />
 * ```
 */
export const IOSFloatingActionButton = ({
  icon,
  label,
  onClick,
  variant = 'primary',
  extended = false,
  position = { bottom: 80, right: 20 },
}: IOSFloatingActionButtonProps) => {
  const { tap } = useHaptic();

  const handleClick = () => {
    tap();
    onClick();
  };

  const variantStyles = {
    primary: 'bg-accent-500 text-black shadow-glow',
    secondary: 'bg-white/10 text-white backdrop-blur-xl border border-white/20',
    accent: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`
        fixed z-40 
        ${extended ? 'px-5 py-3' : 'p-4'}
        ${variantStyles[variant]}
        rounded-full
        font-semibold text-sm
        shadow-2xl
        flex items-center gap-2
        transition-all duration-200
      `}
      style={{
        bottom: position.bottom,
        right: position.right,
        left: position.left,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
    >
      <span className="flex-shrink-0">{icon}</span>
      {extended && label && <span>{label}</span>}
    </motion.button>
  );
};
