import React from 'react';
import { useLocation } from 'react-router-dom';
import { t } from '../../lib/i18n';
import { useOrg } from '../../context/OrgContext';

type Tab = { id: string; labelKey: string };

type Props = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  tabs?: Tab[];
  currentTabId?: string;
  onTabChange?: (id: string) => void;
};

const PageHeader: React.FC<Props> = ({ title, subtitle, actions, tabs, currentTabId, onTabChange }) => {
  const { org } = useOrg();
  const location = useLocation();
  const parts = location.pathname.replace(/^\/+|\/+$/g, '').split('/');
  const section = parts.slice(1).join(' / ');
  const breadcrumb = `${org ? org.name : 'Org'} / ${section || (t('breadcrumb.home') || 'Home')}`;

  return (
    <div className="px-4 md:px-6 pt-2 md:pt-3 pb-2 border-b border-white/6">
      <div className="text-[11px] opacity-70 mb-1" role="navigation" aria-label="Breadcrumbs">{breadcrumb}</div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base md:text-lg font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs opacity-75 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {tabs && tabs.length > 0 && (
        <div className="flex gap-1.5 mt-2">
          {tabs.map((tb) => {
            const active = tb.id === currentTabId;
            return (
              <button
                key={tb.id}
                className={`px-3 py-1.5 rounded-md text-[12px] md:text-sm font-medium ${
                  active ? 'bg-accent-500 text-black shadow-glow' : 'opacity-85 hover:opacity-100 hover:bg-white/8'
                }`}
                aria-current={active ? 'page' : undefined}
                onClick={() => onTabChange && onTabChange(tb.id)}
              >
                {t(tb.labelKey)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
