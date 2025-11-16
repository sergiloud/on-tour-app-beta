import React, { Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { trackPageView } from '../../lib/activityTracker';

// Lazy load FinanceV2 to reduce main bundle size
const FinanceV2 = React.lazy(() => import('./FinanceV2'));

const Finance: React.FC = () => {
  const { userId } = useAuth();

  React.useEffect(() => {
    trackPageView('finance');
  }, [userId]);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
      </div>
    }>
      <FinanceV2 />
    </Suspense>
  );
};

export default Finance;
