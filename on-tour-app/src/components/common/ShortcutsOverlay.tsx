import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { t } from '../../lib/i18n';

type Props = { open: boolean; onClose: () => void };

const ShortcutsOverlay: React.FC<Props> = ({ open, onClose }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const el = containerRef.current;
    if (!el) return;
    // Focus first heading for screen readers
    const h = el.querySelector('h2') as HTMLElement | null;
    if (h) { h.tabIndex = -1; h.focus(); }
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={t('shortcuts.dialog')} className="fixed inset-0 z-[var(--z-modal)]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div ref={containerRef} className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[92vw] max-w-xl glass rounded-lg border border-white/15 shadow-2xl p-4">
        <h2 className="text-lg font-semibold mb-2">{t('shortcuts.title')}</h2>
        <p className="text-[12px] opacity-75 mb-3">{t('shortcuts.desc')}</p>
        <ul className="text-sm space-y-2">
          <li className="flex items-center justify-between"><span>{t('shortcuts.openPalette')}</span><kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10">Cmd/Ctrl + K</kbd></li>
          <li className="flex items-center justify-between"><span>{t('shortcuts.showOverlay')}</span><kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10">?</kbd></li>
          <li className="flex items-center justify-between"><span>{t('shortcuts.closeDialogs')}</span><kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10">Esc</kbd></li>
          <li className="flex items-center justify-between"><span>{t('shortcuts.goTo')}</span><kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10">g then key</kbd></li>
        </ul>
      </div>
    </div>,
    document.body
  );
};

export default ShortcutsOverlay;
