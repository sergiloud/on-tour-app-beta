import React from 'react';
import { t } from '../../../lib/i18n';

const OverviewHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm opacity-80">{t('finance.overview') || 'Finance overview'}</div>
    </div>
  );
};

export default OverviewHeader;
