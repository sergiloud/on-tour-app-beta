import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrg } from '../../context/OrgContext';
import { startViewAs } from '../../lib/tenants';
import { t } from '../../lib/i18n';

const OrgClients: React.FC = () => {
  const { org, links } = useOrg();
  const navigate = useNavigate();
  if (!org || org.type !== 'agency') return <div className="text-xs opacity-70">{t('org.clients.title')||'Clients'}</div>;
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('org.clients.title')||'Clients'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {links.filter(l => l.agencyOrgId === org.id).map(l => (
          <div key={l.id} className="glass rounded border border-white/10 p-3">
            <div className="font-medium">Artist Link</div>
            <div className="text-xs opacity-70">Status: {l.status}</div>
            <div className="text-xs opacity-70">Finance: {l.scopes.finance}</div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <button
                className="btn-ghost"
                onClick={() => navigate(`/dashboard/clients/${l.artistOrgId}`)}
              >{t('welcome.openArtistDashboard')?.replace('{artist}','Artist')||'Open artist dashboard'}</button>
              <button className="btn-ghost" onClick={()=> navigate('/dashboard/org/links')}>{t('actions.editScopes')||'Edit scopes'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrgClients;
