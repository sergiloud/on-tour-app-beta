import React, { useEffect, useRef, useState } from 'react';
import { useOrg } from '../../../context/OrgContext';
import { t } from '../../../lib/i18n';

type Props = { open: boolean; onClose: () => void };

const BrandingModal: React.FC<Props> = ({ open, onClose }) => {
  const { settings, updateSettings, org } = useOrg();
  const [color, setColor] = useState<string>(settings.branding?.color || '#9ae6b4');
  const [logoUrl, setLogoUrl] = useState<string>(settings.branding?.logoUrl || '');
  const [shortBio, setShortBio] = useState<string>(settings.branding?.shortBio || '');
  const firstRef = useRef<HTMLInputElement>(null);
  useEffect(()=>{ if (open) { setTimeout(()=> firstRef.current?.focus(), 10); } }, [open]);
  useEffect(()=>{
    if (open) {
      setColor(settings.branding?.color || '#9ae6b4');
      setLogoUrl(settings.branding?.logoUrl || '');
      setShortBio(settings.branding?.shortBio || '');
    }
  }, [open, settings.branding?.color, settings.branding?.logoUrl, settings.branding?.shortBio]);
  if (!open) return null;
  const onSave = () => {
    updateSettings({ branding: { color, logoUrl, shortBio } });
    onClose();
  };
  return (
    <div role="dialog" aria-modal className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative glass rounded-lg border border-slate-200 dark:border-white/10 w-full max-w-lg p-4 space-y-3">
        <div className="text-sm opacity-70">{t('welcome.cta.completeBranding')||'Complete branding'}</div>
        <div className="text-xs opacity-70">{org?.name}</div>
        <div className="grid grid-cols-1 gap-3">
          <label className="text-sm">
            <span className="block text-[11px] opacity-70 mb-1">Primary color</span>
            <input ref={firstRef} type="color" value={color} onChange={e=>setColor(e.target.value)} className="h-9 w-16 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded border border-white/10" />
          </label>
          <label className="text-sm">
            <span className="block text-[11px] opacity-70 mb-1">Logo URL</span>
            <input type="url" value={logoUrl} onChange={e=>setLogoUrl(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded px-2 py-1.5" placeholder="https://..." />
          </label>
          <label className="text-sm">
            <span className="block text-[11px] opacity-70 mb-1">Short bio</span>
            <textarea value={shortBio} onChange={e=>setShortBio(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded px-2 py-1.5 min-h-[80px]" placeholder="Artist tagline or short description" />
          </label>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button className="btn-ghost text-xs" onClick={onClose}>{t('common.cancel')||'Cancel'}</button>
          <button className="btn-ghost text-xs" onClick={onSave}>{t('common.save')||'Save'}</button>
        </div>
      </div>
    </div>
  );
};

export default BrandingModal;
