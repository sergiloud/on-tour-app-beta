import React, { useEffect, useRef } from 'react';
import { getOrgs, setCurrentOrgId } from '../../../lib/tenants';
import { useOrg } from '../../../context/OrgContext';
import { t } from '../../../lib/i18n';
import { Events } from '../../../lib/telemetry';

export const OrgSwitcher: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { orgId, refresh } = useOrg();
  const ref = useRef<HTMLSelectElement>(null);
  useEffect(()=>{ if (open) setTimeout(()=> ref.current?.focus(), 0); }, [open]);
  if (!open) return null;
  const orgs = getOrgs();
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="org-switch-title" className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[92vw] max-w-sm glass rounded-lg border border-white/15 shadow-2xl p-4">
        <h2 id="org-switch-title" className="text-base font-semibold mb-2">{t('nav.changeOrg')||'Change organization'}</h2>
        <select ref={ref} className="w-full bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded px-2 py-2" value={orgId} onChange={(e)=>{
          setCurrentOrgId(e.target.value);
          try { Events.welcomeCta('switchOrg'); } catch {}
          refresh();
          onClose();
        }}>
          {orgs.map(o => (<option key={o.id} value={o.id}>{o.name}</option>))}
        </select>
        <div className="mt-3 text-right">
          <button className="btn-ghost" onClick={onClose}>{t('common.close')||'Close'}</button>
        </div>
      </div>
    </div>
  );
};

export default OrgSwitcher;
