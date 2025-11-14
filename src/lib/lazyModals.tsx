/**
 * Lazy-loaded modal components wrapper
 * Loads modals only when needed to reduce initial bundle size
 */

import { lazy, Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load calendar modals
export const CalendarEventModal = lazy(() => import('../components/calendar/CalendarEventModal'));
export const EventCreationModal = lazy(() => import('../components/calendar/EventCreationModal'));
export const EventEditorModal = lazy(() => import('../components/calendar/EventEditorModal'));
export const DayDetailsModal = lazy(() => import('../components/calendar/DayDetailsModal'));
export const TravelFlightModal = lazy(() => import('../components/calendar/TravelFlightModal'));
export const ShowEventModal = lazy(() => import('../components/calendar/ShowEventModal'));

// Finance modals
export const AddTransactionModal = lazy(() => import('../components/finance/AddTransactionModal'));

// Org modals
export const InviteManagerModal = lazy(() => import('../pages/welcome/components/InviteManagerModal'));
export const BrandingModal = lazy(() => import('../pages/welcome/components/BrandingModal'));
export const IntegrationsModal = lazy(() => import('../pages/welcome/components/IntegrationsModal'));

// Modal loading fallback
const ModalLoader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="rounded-lg bg-gray-900 p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  </div>
);

// HOC to wrap modals with Suspense
export function withModalSuspense<P extends object>(
  Component: ComponentType<P>
) {
  return (props: P) => (
    <Suspense fallback={<ModalLoader />}>
      <Component {...props} />
    </Suspense>
  );
}
