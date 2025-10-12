import React, { useEffect } from 'react';
import { useOrg } from '../../context/OrgContext';
import { t } from '../../lib/i18n';
import PageHeader from '../../components/common/PageHeader';
import { trackEvent } from '../../lib/telemetry';

const OrgMembers: React.FC = () => {
  const { members, org } = useOrg();
  if (!org) return null;
  const isAgency = org.type === 'agency';
  useEffect(()=>{ try { trackEvent('org.section.view', { section: 'members' }); } catch {} }, []);
  return (
    <div className="space-y-4">
      <PageHeader
        title={t('org.members.title')||'Members'}
        subtitle={isAgency ? (t('members.seats.usage')||'Seat usage: 5/5 internal, 0/5 guests') : ''}
        actions={(
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 rounded bg-accent-500 text-black text-xs shadow-glow">{t('members.invite')||'Invite'}</button>
            <button className="btn-ghost text-xs" onClick={()=>{ try { navigator.clipboard.writeText(window.location.origin + '/invite/demo'); } catch {} }}>{t('common.copyLink')||'Copy link'}</button>
          </div>
        )}
      />
      <ul className="glass rounded border border-white/10 divide-y divide-white/10">
        {members.map((m, i)=> (
          <li key={i} className="px-3 py-2 flex items-center justify-between">
            <span className="text-sm">{m.user.name}</span>
            <span className="text-xs opacity-80">{m.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrgMembers;
