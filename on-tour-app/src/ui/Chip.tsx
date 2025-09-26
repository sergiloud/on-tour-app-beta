import React from 'react';
import clsx from 'clsx';

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: 'sm'|'md';
  variant?: 'solid'|'ghost';
  tone?: 'default'|'accent'|'danger'|'warn';
}

export const Chip: React.FC<ChipProps> = ({active=false,size='md',variant='ghost',tone='default',className,children,...rest})=>{
  const base = 'inline-flex items-center font-medium rounded-[8px] focus-ring transition select-none';
  const sz = size==='sm' ? 'text-[11px] px-2 py-1 gap-1' : 'text-xs px-3 py-1.5 gap-1.5';
  const tones: Record<string,string> = {
    default: variant==='solid' ? 'bg-white/12 text-white hover:bg-white/16' : 'bg-white/6 hover:bg-white/10 text-white/85',
    accent: variant==='solid' ? 'bg-accent-500 text-black hover:brightness-110' : 'text-accent-400 hover:bg-accent-500/12',
    danger: variant==='solid' ? 'bg-rose-500 text-black' : 'text-rose-400 hover:bg-rose-500/12',
    warn: variant==='solid' ? 'bg-amber-400 text-black' : 'text-amber-300 hover:bg-amber-400/12'
  };
  const activeStyles = active ? (variant==='solid' ? 'ring-2 ring-accent-500/60' : 'bg-accent-500 text-black') : '';
  return (
    <button className={clsx(base, sz, tones[tone], activeStyles, className)} {...rest}>{children}</button>
  );
};

export default Chip;
