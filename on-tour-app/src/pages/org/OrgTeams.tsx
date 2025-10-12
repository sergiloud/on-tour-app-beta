import React from 'react';
import { useOrg } from '../../context/OrgContext';
import { t } from '../../lib/i18n';

const OrgTeams: React.FC = () => {
  const { org, teams } = useOrg();
  if (!org) return null;
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('org.teams.title')||'Teams'}</h2>
      {teams.length === 0 && <div className="text-xs opacity-70">No teams yet</div>}
      <ul className="glass rounded border border-white/10 divide-y divide-white/10">
        {teams.map(team => (
          <li key={team.id} className="px-3 py-2">
            <div className="font-medium text-sm">{team.name}</div>
            <div className="text-xs opacity-70">{team.members.length} members</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrgTeams;
