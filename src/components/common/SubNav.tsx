import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { prefetchByPath } from '../../routes/prefetch';
import { t } from '../../lib/i18n';

export type SubNavItem = {
  to: string;
  labelKey: string;
  badge?: React.ReactNode;
  end?: boolean;
};

type Props = {
  items: SubNavItem[];
};

// Accessible horizontal sub-navigation with roving tabindex and prefetch on intent
const SubNav: React.FC<Props> = ({ items }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const refs = React.useRef<Array<HTMLAnchorElement | null>>([]);
  const activeIdx = React.useMemo(() => {
    const idx = items.findIndex((it) => location.pathname.startsWith(it.to));
    return idx >= 0 ? idx : 0;
  }, [items, location.pathname]);
  const [focusIdx, setFocusIdx] = React.useState<number>(activeIdx);
  React.useEffect(() => setFocusIdx(activeIdx), [activeIdx]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    const max = items.length - 1;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = Math.min(max, focusIdx + 1);
      setFocusIdx(next);
      refs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = Math.max(0, focusIdx - 1);
      setFocusIdx(prev);
      refs.current[prev]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFocusIdx(0);
      refs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      setFocusIdx(max);
      refs.current[max]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      // Activate focused
      const it = items[focusIdx];
      if (it) navigate(it.to);
    }
  };

  return (
    <nav
      className="px-3 md:px-5 border-b border-white/6 bg-ink-900/15 backdrop-blur supports-backdrop-blur:backdrop-blur-md sticky top-0 z-[var(--z-nav,20)]"
      role="navigation"
      aria-label={t('subnav.ariaLabel') || 'Sections'}
      onKeyDown={onKeyDown}
    >
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-2">
        {items.map((it, i) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end as any}
            ref={(el) => {
              refs.current[i] = el;
            }}
            tabIndex={i === focusIdx ? 0 : -1}
            aria-current={location.pathname.startsWith(it.to) ? 'page' : undefined}
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 text-[12px] md:text-sm font-medium flex items-center gap-2 motion-safe:transition-colors whitespace-nowrap ${
                isActive ? 'bg-accent-500 text-black shadow-glow' : 'opacity-85 hover:opacity-100 hover:bg-white/8'
              }`
            }
            onMouseEnter={() => prefetchByPath(it.to)}
            onFocus={() => prefetchByPath(it.to)}
          >
            <span>{t(it.labelKey)}</span>
            {it.badge}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default SubNav;
