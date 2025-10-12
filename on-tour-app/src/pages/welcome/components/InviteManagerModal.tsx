import React, { useEffect, useRef, useState } from 'react';
import { t } from '../../../lib/i18n';
import { inviteMember } from '../../../lib/tenants';
import { Events } from '../../../lib/telemetry';

export const InviteManagerModal: React.FC<{ orgId: string; open: boolean; onClose: () => void; onSuccess?: () => void }> = ({ orgId, open, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'manager'|'owner'>('manager');
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(()=>{ if (open) setTimeout(()=> titleRef.current?.focus(), 0); }, [open]);
  useEffect(()=>{ if (open) { try { Events.welcomeCta('invite'); } catch {} } }, [open]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="inv-title" className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[92vw] max-w-md glass rounded-lg border border-white/15 shadow-2xl p-4">
        <h2 id="inv-title" ref={titleRef} tabIndex={-1} className="text-base font-semibold mb-2">{t('welcome.inviteManager')||'Invite manager'}</h2>
        <div className="space-y-2">
          <label className="block text-xs opacity-80">
            {t('profile.name')||'Name'}
            <input className="mt-1 w-full bg-white/10 rounded px-2 py-1" value={name} onChange={e=> setName(e.target.value)} />
          </label>
          <label className="block text-xs opacity-80">
            {t('profile.role')||'Role'}
            <select className="mt-1 w-full bg-white/10 rounded px-2 py-1" value={role} onChange={e=> setRole(e.target.value as any)}>
              <option value="manager">{t('role.agencyManager')||'Manager'}</option>
              <option value="owner">{t('role.artistOwner')||'Owner'}</option>
            </select>
          </label>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2 text-sm">
          <button className="btn-ghost" onClick={onClose}>{t('common.cancel')||'Cancel'}</button>
          <button className="px-3 py-1.5 rounded bg-accent-500 text-black" onClick={()=>{
            const trimmed = name.trim(); if (!trimmed) return;
            const res = inviteMember(orgId, trimmed, role);
            if (res) { try { Events.welcomeChecklistCompleted('inviteManager'); } catch {} onSuccess?.(); onClose(); }
          }}>{t('common.invite')||'Invite'}</button>
        </div>
      </div>
    </div>
  );
};

export default InviteManagerModal;
