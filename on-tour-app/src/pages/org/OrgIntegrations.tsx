import React from 'react';
import { t } from '../../lib/i18n';

const OrgIntegrations: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('nav.integrations')||'Integrations'}</h2>
      <div className="glass rounded border border-white/10 p-4 text-sm opacity-80">
        Coming soon: API keys and third-party toggles.
      </div>
    </div>
  );
};

export default OrgIntegrations;
