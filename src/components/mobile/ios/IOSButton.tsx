import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { hapticButton, hapticSelection } from '../../../lib/haptics';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface IOSButtonProps extends Omit<HTMLMotionProps<'button'>, 'size' | 'children'> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  hapticType?: 'button' | 'selection';
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent-500 text-black font-semibold shadow-glow hover:bg-accent-400 active:bg-accent-600',
  secondary: 'bg-white/10 text-white font-medium border border-white/20 hover:bg-white/15 active:bg-white/5',
  tertiary: 'bg-transparent text-accent-500 font-medium hover:bg-accent-500/10 active:bg-accent-500/20',
  destructive: 'bg-red-500/20 text-red-400 font-medium border border-red-500/30 hover:bg-red-500/30 active:bg-red-500/10',
  ghost: 'bg-transparent text-white/70 font-medium hover:bg-white/5 active:bg-white/10',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm rounded-lg',
  md: 'h-10 px-4 text-base rounded-xl',
  lg: 'h-12 px-6 text-lg rounded-2xl',
};

/**
 * iOS-style button with haptic feedback and visual states
 * Matches native iOS button interactions
 */
export const IOSButton: React.FC<IOSButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  hapticType = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    
    // Trigger haptic feedback
    if (hapticType === 'button') {
      hapticButton();
    } else {
      hapticSelection();
    }
    
    onClick?.(e);
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center gap-2
        font-sf-text transition-all duration-150
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
      }}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}

      {/* Content */}
      <span className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </span>
    </motion.button>
  );
};
