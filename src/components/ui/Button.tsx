/**
 * Button Component - Reutilizable con variantes
 * Basado en Design System Tokens
 */

import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { buttonVariants, animationPresets } from '@/lib/designSystem/tokens';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'icon' | 'small' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  animated?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  animated = true,
  children,
  className,
  ...props
}, ref) => {
  const baseClasses = buttonVariants[variant];
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled || loading ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg';
  const finalClass = `${baseClasses} ${widthClass} ${disabledClass} ${className || ''}`;

  const buttonContent = (
    <span className="flex items-center justify-center gap-2">
      {iconPosition === 'left' && icon && <span>{icon}</span>}
      {children}
      {iconPosition === 'right' && icon && <span>{icon}</span>}
      {loading && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
    </span>
  );

  if (!animated) {
    return (
      <button
        ref={ref}
        className={finalClass}
        disabled={disabled || loading}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }

  return (
    <motion.button
      ref={ref as any}
      className={finalClass}
      disabled={disabled || loading}
      whileHover={{ scale: 1.02 } as any}
      whileTap={{ scale: 0.95 } as any}
      transition={{ duration: 0.2 }}
      {...(props as any)}
    >
      {buttonContent}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
