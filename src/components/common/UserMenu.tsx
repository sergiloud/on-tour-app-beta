import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { t } from '../../lib/i18n';
import { setAuthed } from '../../lib/demoAuth';
import { trackEvent } from '../../lib/telemetry';

const UserMenu: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuId = 'user-menu';
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  // Extract first grapheme for avatar initial (CJK/emoji aware best-effort)
  const firstGrapheme = (s: string): string => {
    try {
      // @ts-ignore
      const Seg = (Intl as any).Segmenter; if (Seg) { const it = new Seg(undefined, { granularity: 'grapheme' }).segment(s)[Symbol.iterator](); const n = it.next(); return n && n.value ? n.value.segment : Array.from(s)[0] || ''; }
    } catch {}
    try { return Array.from(s)[0] || ''; } catch { return s.slice(0,1); }
  };

  // Calculate menu position when opening
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right
      });
    }
  }, [open]);

  useEffect(()=>{
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!ref.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return ()=> document.removeEventListener('mousedown', onDoc);
  }, []);

  // Focus first menuitem when menu opens; return focus to button on close
  useEffect(()=>{
    if (open) {
      const first = menuRef.current?.querySelector('[role="menuitem"]') as HTMLElement | null;
      first?.focus();
    } else {
      btnRef.current?.focus();
    }
  }, [open]);

  const onMenuKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!open) return;
    const items = Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]') || []) as HTMLElement[];
    const idx = items.findIndex(el => el === document.activeElement);
    const focusAt = (i: number) => { if (i >=0 && i < items.length) items[i]!.focus(); };
    switch (e.key) {
      case 'Escape':
        e.preventDefault(); setOpen(false); break;
      case 'ArrowDown':
        e.preventDefault(); focusAt(idx < 0 ? 0 : Math.min(idx + 1, items.length - 1)); break;
      case 'ArrowUp':
        e.preventDefault(); focusAt(idx <= 0 ? 0 : idx - 1); break;
      case 'Home':
        e.preventDefault(); focusAt(0); break;
      case 'End':
        e.preventDefault(); focusAt(items.length - 1); break;
    }
  };

  return (
    <div className="relative" ref={ref} onKeyDown={onMenuKeyDown}>
      <button ref={btnRef} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-200 dark:bg-white/10" onClick={()=> setOpen(o=>!o)} aria-haspopup="menu" aria-expanded={open} aria-controls={menuId} aria-label={t('nav.profile')||'Profile'}>
        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[11px]" aria-hidden>{firstGrapheme(profile.name)}</span>
        <span className="hidden md:inline text-xs opacity-85">{profile.name}</span>
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          className="fixed min-w-[220px] glass rounded border border-white/12 p-1 text-sm shadow-2xl"
          style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px`, zIndex: 99999 }}
          onKeyDown={onMenuKeyDown}
        >
          {/* Profile Section */}
          <div className="px-3 py-2 border-b border-slate-200 dark:border-white/10 mb-1">
            <div className="text-sm font-medium">{profile.name}</div>
            <div className="text-xs opacity-60">{profile.email}</div>
          </div>

          {/* Main Actions */}
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 focus:outline-none focus-ring transition-colors"
            role="menuitem"
            onClick={()=> setOpen(false)}
          >
            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{t('profile.title')||'Profile & Settings'}</span>
          </Link>

          <button
            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 focus:outline-none focus-ring transition-colors"
            role="menuitem"
            onClick={()=>{
              try {
                const el = document.getElementById('org-switcher') as HTMLSelectElement | null;
                el?.focus();
                el?.scrollIntoView({ block: 'nearest' });
              } catch {}
              setOpen(false);
            }}
          >
            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>{t('nav.changeOrg')||'Change organization'}</span>
          </button>

          <div className="h-px bg-slate-200 dark:bg-slate-200 dark:bg-white/10 my-1" />

          {/* Logout */}
          <button
            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-red-500/10 text-red-300 hover:text-red-200 focus:outline-none focus-ring transition-colors"
            role="menuitem"
            onClick={()=>{
              // Demo logout: clear current user and authed flag, then go to login
               try { localStorage.removeItem('demo:currentUser'); } catch {}
               try { setAuthed(false); } catch {}
               try { trackEvent('auth.logout', {}); } catch {}
               setOpen(false);
               navigate('/login');
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{t('nav.logout')||'Logout'}</span>
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UserMenu;
