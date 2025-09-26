import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary'|'ghost'|'outline'|'soft';
  size?: 'sm'|'md'|'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({variant='primary',size='md',loading=false,className,children,...rest})=>{
  const base = 'relative inline-flex items-center justify-center font-semibold rounded-full focus-ring motion-safe:transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.98]';
  const sizes = { sm:'text-[11px] px-3 py-1.5', md:'text-sm px-5 py-2.5', lg:'text-base px-6 py-3' };
  const variants: Record<string,string> = {
    primary:'bg-accent-500 text-black shadow-glow hover:brightness-110',
    ghost:'bg-transparent hover:bg-white/7 text-white/90',
    outline:'border border-white/12 hover:border-white/25 text-white/90',
    soft:'bg-white/8 hover:bg-white/12 text-white/90'
  };
  return (
    <button className={clsx(base, sizes[size], variants[variant], className)} {...rest}>
      {loading && <span className="absolute inset-0 flex items-center justify-center"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"/></span>}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>{children}</span>
    </button>
  );
};

export default Button;
