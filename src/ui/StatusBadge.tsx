import React from 'react';
import clsx from 'clsx';

type Status = 'confirmed'|'pending'|'offer'|'canceled'|'archived'|'risk'|'postponed';

const tone: Record<Status, string> = {
  confirmed: 'bg-emerald-500/18 text-emerald-300 border-emerald-400/30',
  pending: 'bg-amber-500/18 text-amber-200 border-amber-400/30',
  offer: 'bg-white/8 text-white/75 border-white/15',
  canceled: 'bg-rose-500/18 text-rose-200 border-rose-400/30',
  archived: 'bg-white/4 text-slate-300 dark:text-white/50 border-white/12',
  risk: 'bg-red-600/20 text-red-200 border-red-400/30',
  postponed: 'bg-indigo-500/18 text-indigo-200 border-indigo-400/30'
};

export const StatusBadge: React.FC<{ status: Status; className?: string; children?: React.ReactNode }>=({ status, className, children })=>{
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border', tone[status], className)}>
      {children ?? status}
    </span>
  );
};

export default StatusBadge;
