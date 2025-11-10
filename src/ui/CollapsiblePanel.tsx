import React from 'react';
import { Card } from './Card';

type Props = {
  id: string; // persistence key
  title: string;
  children: React.ReactNode;
  className?: string;
  defaultCollapsed?: boolean;
  actions?: React.ReactNode; // right-aligned header actions
};

export const CollapsiblePanel: React.FC<Props> = ({ id, title, children, className, defaultCollapsed = false, actions }) => {
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('panel:' + id);
      if (raw === 'collapsed') return true;
    } catch {}
    return defaultCollapsed;
  });

  const toggle = () => {
    setCollapsed((v) => {
      const next = !v;
      try { localStorage.setItem('panel:' + id, next ? 'collapsed' : 'open'); } catch {}
      return next;
    });
  };

  return (
    <Card className={(className ? className + ' ' : '') + 'flex flex-col gap-3'} aria-roledescription="dashboard panel" aria-label={title}>
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <div className="flex items-center gap-2">
          {actions}
          <button
            type="button"
            className="text-[11px] px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-slate-200 dark:bg-white/20"
            aria-expanded={!collapsed}
            aria-controls={`panel-${id}-content`}
            onClick={toggle}
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </header>
      <section id={`panel-${id}-content`} hidden={collapsed} className="contents">
        {children}
      </section>
    </Card>
  );
};

export default CollapsiblePanel;
