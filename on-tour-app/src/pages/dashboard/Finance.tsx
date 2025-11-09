import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { trackPageView } from '../../lib/activityTracker';
import FinanceV2 from './FinanceV2';

const Finance: React.FC = () => {
  const { userId } = useAuth();

  React.useEffect(() => {
    trackPageView('finance');
  }, [userId]);

  return <FinanceV2 />;
};

export default Finance;
