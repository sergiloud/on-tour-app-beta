import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  tone?: 'default' | 'accent' | 'danger' | 'soft';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, tone='default', padding='md', interactive=false, ...rest }) => {
  const pad = padding==='none' ? '' : padding==='sm' ? 'p-2' : padding==='lg' ? 'p-6' : 'p-4';
  const palette: Record<string,string> = {
    default: 'glass',
    accent: 'glass bg-gradient-to-br from-accent-500/15 to-accent-500/5',
    danger: 'glass bg-gradient-to-br from-rose-500/15 to-rose-500/5',
    soft: 'glass bg-white/2'
  };
  return (
    <div
      className={clsx(
        'rounded-[10px] relative flex flex-col gap-4',
        'border',
        '[border-color:var(--card-border)]',
        '[box-shadow:var(--card-shadow)]',
        palette[tone],
        pad,
        interactive && 'motion-safe:transition-transform motion-safe:duration-200 focus-ring cursor-pointer hover:brightness-[1.02] hover:scale-[1.01]',
        className
      )}
      {...rest}
    />
  );
};

export default Card;
