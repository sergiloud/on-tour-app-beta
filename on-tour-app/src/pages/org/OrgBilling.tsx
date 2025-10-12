import React from 'react';
import { useOrg } from '../../context/OrgContext';
import { t } from '../../lib/i18n';

const OrgBilling: React.FC = () => {
  const { seats } = useOrg();
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('nav.billing')||'Billing'}</h2>
      <div className="glass rounded border border-white/10 p-4 text-sm space-y-2">
        <div>Seats: {seats.internalUsed}/{seats.internalLimit}</div>
        <button className="btn btn-primary">Upgrade (demo)</button>
      </div>
    </div>
  );
};

export default OrgBilling;
