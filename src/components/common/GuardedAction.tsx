import React from 'react';
import { useNavigate } from 'react-router-dom';
import { can } from '../../lib/tenants';
import { t } from '../../lib/i18n';
import { AnimatedButton } from './animations';

type Props = {
  scope: 'finance:export' | 'shows:write' | 'travel:book';
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
};

const GuardedAction: React.FC<Props> = ({ scope, onClick, className, children }) => {
  const allowed = can(scope);
  const navigate = useNavigate();
  if (allowed) {
    return (
      <AnimatedButton className={className} onClick={onClick}>
        {children}
      </AnimatedButton>
    );
  }
  const title = t('access.readOnly.tooltip') || 'Read-only: disabled by link policy';
  return (
    <span className="inline-flex items-center gap-1" title={title} aria-label={title} aria-live="polite">
      <button className={`${className||''} opacity-60 cursor-not-allowed`} disabled aria-disabled>
        {children}
      </button>
      <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/15 text-amber-300 border border-amber-400/25">
        {t('access.readOnly') || 'read-only'}
      </span>
      <button
        type="button"
        className="text-[11px] underline decoration-dotted opacity-80 hover:opacity-100"
        onClick={() => navigate('/dashboard/org/links')}
      >
        {t('common.learnMore') || 'Learn more'}
      </button>
    </span>
  );
};

export default GuardedAction;
