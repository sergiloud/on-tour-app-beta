import React from 'react';
import clsx from 'clsx';

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-1
  tone?: 'accent'|'rose'|'amber'|'emerald'|'info';
  height?: 'xs'|'sm'|'md';
  showValue?: boolean;
  label?: string;
}

const toneMap: Record<string,{bg:string;grad:string}> = {
  accent:{ bg:'bg-accent-500/20', grad:'from-accent-400/80 to-accent-500/70' },
  rose:{ bg:'bg-rose-500/20', grad:'from-rose-400/70 to-rose-500/60' },
  amber:{ bg:'bg-amber-400/25', grad:'from-amber-400/70 to-amber-500/60' },
  emerald:{ bg:'bg-emerald-400/25', grad:'from-emerald-400/70 to-emerald-500/60' },
  info:{ bg:'bg-sky-400/25', grad:'from-sky-400/70 to-sky-500/60' }
};

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, tone='accent', height='xs', showValue=false, label, className, ...rest }) => {
  const pct = Math.min(1, Math.max(0, value));
  const h = height==='md' ? 'h-3' : height==='sm' ? 'h-2' : 'h-1.5';
  const toneDef = toneMap[tone] ?? toneMap['accent'];
  return (
    <div className={clsx('w-full flex flex-col gap-1', className)} {...rest}>
      {label && <span className="text-[10px] uppercase tracking-wide opacity-70" aria-hidden>{label}</span>}
      <div className={clsx('w-full rounded-full overflow-hidden', toneDef!.bg, h)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct*100)} aria-label={label||'progress'}>
        <div className={clsx('h-full bg-gradient-to-r transition-all duration-700', toneDef!.grad)} style={{ width: `${Math.max(pct*100,4)}%` }} />
      </div>
      {showValue && <span className="text-[10px] tabular-nums opacity-70">{Math.round(pct*100)}%</span>}
    </div>
  );
};

export default ProgressBar;
