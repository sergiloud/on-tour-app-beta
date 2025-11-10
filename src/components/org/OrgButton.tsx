import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import clsx from 'clsx';

type OrgButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type OrgButtonSize = 'sm' | 'md' | 'lg';

interface OrgButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof MotionProps> {
  variant?: OrgButtonVariant;
  size?: OrgButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * OrgButton - Reusable button component for org pages
 *
 * Features:
 * - Multiple variants: primary (gradient), secondary (glass), ghost, danger
 * - Responsive sizes: sm, md, lg
 * - Icon support with positioning
 * - Loading state
 * - Full width option
 * - Smooth animations
 *
 * Variants:
 * - primary: Accent gradient button (main actions)
 * - secondary: Glass button (secondary actions)
 * - ghost: Text-only button
 * - danger: Red/warning button
 *
 * Usage:
 * ```tsx
 * <OrgButton variant="primary" size="md">Save</OrgButton>
 * <OrgButton variant="secondary" icon={<Icon />}>Action</OrgButton>
 * <OrgButton variant="ghost">Learn More</OrgButton>
 * ```
 */
export const OrgButton = React.forwardRef<
  HTMLButtonElement,
  OrgButtonProps
>(({
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}, ref) => {
  // Variant styles
  const variantClasses = {
    primary: 'bg-gradient-to-r from-accent-500/25 via-accent-500/15 to-accent-600/10 border border-accent-500/30 hover:border-accent-500/50 hover:from-accent-500/35 hover:via-accent-500/25 hover:to-accent-600/20 text-accent-200 shadow-lg shadow-accent-500/10',
    secondary: 'bg-white/8 border border-white/15 hover:border-slate-400 dark:hover:border-white/30 hover:bg-white/12 text-slate-700 dark:text-white/90',
    ghost: 'bg-transparent border-0 text-slate-700 dark:text-slate-700 dark:text-white/90 hover:text-white/100',
    danger: 'bg-red-500/15 border border-red-500/30 hover:border-red-500/50 hover:bg-red-500/25 text-red-200',
  };

  // Size styles
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs font-semibold rounded-md',
    md: 'px-3 py-1.5 text-xs font-semibold rounded-lg',
    lg: 'px-4 py-2 text-sm font-semibold rounded-lg',
  };

  const baseClasses = clsx(
    'inline-flex items-center justify-center gap-2',
    'transition-all duration-300',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className
  );

  return (
    <motion.button
      ref={ref}
      className={baseClasses}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2 }}
      {...(props as any)}
    >
      {loading ? (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </motion.button>
  );
});

OrgButton.displayName = 'OrgButton';

export default OrgButton;
