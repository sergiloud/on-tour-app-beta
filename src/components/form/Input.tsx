import React, { ReactNode } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'subtle';
}

/**
 * Input Component - Unified text input styling
 * Features:
 * - Optional icons (left/right)
 * - Multiple variants
 * - Consistent spacing
 * - Glassmorphism styling
 * - Accessible focus states
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      icon,
      iconPosition = 'left',
      variant = 'default',
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClass = `
      w-full rounded-lg text-sm transition-all duration-300
      focus:outline-none
      disabled:opacity-50 disabled:cursor-not-allowed
      placeholder:text-slate-400 dark:placeholder:text-white/40
    `;

    const variantClass =
      variant === 'default'
        ? `
          bg-slate-900/40 border border-slate-200 dark:border-white/10 text-white
          hover:border-white/20
          focus:border-accent-500/40 focus:ring-2 focus:ring-accent-500/20
        `
        : `
          bg-white/5 border border-slate-100 dark:border-white/5 text-white
          hover:bg-slate-200 dark:bg-white/10 hover:border-white/10
          focus:bg-slate-300 dark:bg-white/15 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30
        `;

    const paddingClass = icon
      ? iconPosition === 'left'
        ? 'pl-10 pr-3 py-2'
        : 'pl-3 pr-10 py-2'
      : 'px-3 py-2';

    return (
      <div className="relative w-full">
        {icon && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-white/50 pointer-events-none flex items-center justify-center ${
              iconPosition === 'left' ? 'left-3' : 'right-3'
            }`}
          >
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`${baseClass} ${variantClass} ${paddingClass} ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
