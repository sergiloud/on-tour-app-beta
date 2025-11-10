import React, { useEffect, useRef, useState } from 'react';
import { useOrg } from '../../../context/OrgContext';
import { t } from '../../../lib/i18n';

type Props = { open: boolean; onClose: () => void };

const IntegrationsModal: React.FC<Props> = ({ open, onClose }) => {
  const { settings, updateSettings } = useOrg();
  const [calendarKey, setCalendarKey] = useState<string>(settings.api?.calendarKey || '');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(()=>{ if (open) setTimeout(()=> inputRef.current?.focus(), 10); }, [open]);
  useEffect(()=>{ if (open) setCalendarKey(settings.api?.calendarKey || ''); }, [open, settings.api?.calendarKey]);
  if (!open) return null;
  const onConnect = () => { updateSettings({ api: { calendarKey } }); onClose(); };
  return (
    <div role="dialog" aria-modal className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative glass rounded-lg border border-slate-200 dark:border-white/10 w-full max-w-md p-4 space-y-3">
        <div className="text-sm font-medium">{t('welcome.cta.connectCalendar')||'Connect calendar'}</div>
        <p className="text-xs opacity-70">Paste your demo API key to simulate a calendar connection.</p>
        <input ref={inputRef} type="text" value={calendarKey} onChange={e=>setCalendarKey(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded px-2 py-1.5" placeholder="cal_demo_..." />
        <div className="flex items-center justify-end gap-2 pt-2">
          <button className="btn-ghost text-xs" onClick={onClose}>{t('common.cancel')||'Cancel'}</button>
          <button className="btn-ghost text-xs" onClick={onConnect}>{t('common.save')||'Save'}</button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsModal;
