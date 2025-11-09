import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import clsx from 'clsx';

interface OrgCardProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  role?: string;
  ariaLabel?: string;
}

/**
 * OrgCard - Reusable glass card component for org pages
 *
 * Features:
 * - Glass-morphism design with gradient background
 * - Optional hover scale animation
 * - Responsive padding (p-3 md:p-4)
 * - Consistent border and styling
 *
 * Usage:
 * ```tsx
 * <OrgCard hover>
 *   <h2 className="text-sm font-semibold text-slate-700 dark:text-white/90">Title</h2>
 *   <p className="text-xs text-slate-500 dark:text-white/70">Content</p>
 * </OrgCard>
 * ```
 */
export const OrgCard = React.forwardRef<
  HTMLDivElement,
  OrgCardProps
>(({
  children,
  className,
  hover = true,
  onClick,
  role,
  ariaLabel,
  ...motionProps
}, ref) => {
  const baseClasses = clsx(
    'glass rounded-lg border border-slate-200 dark:border-white/10 p-3 md:p-4 bg-gradient-to-r from-slate-100 dark:from-white/6 to-white/3',
    hover && 'hover:border-slate-300 dark:border-white/20 transition-all duration-300',
    onClick && 'cursor-pointer',
    className
  );

  return (
    <motion.div
      ref={ref}
      className={baseClasses}
      onClick={onClick}
      role={role}
      aria-label={ariaLabel}
      whileHover={hover && !motionProps.whileHover ? { scale: 1.02 } : motionProps.whileHover}
      whileTap={motionProps.whileTap || (onClick ? { scale: 0.98 } : undefined)}
      transition={{ duration: 0.3 }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
});

OrgCard.displayName = 'OrgCard';

export default OrgCard;
