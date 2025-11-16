/**
 * Universal Timeline Data Hook
 * 
 * Integrates data from all application modules:
 * - Shows from useShows()
 * - Contracts from useContractsQuery()
 * - Travel data (when available)
 * - Finance events (when available)
 * - Tasks/reminders (future implementation)
 */

import { useMemo } from 'react';
import { useShows } from '../../../hooks/useShows';
import { useContractsQuery } from '../../../hooks/useContractsQuery';
import { UniversalTimelineEvent } from '../components/UniversalTimeline';

/**
 * Transform shows data to timeline events
 */
const transformShowsToEvents = (shows: any[]): UniversalTimelineEvent[] => {
  return shows.map((show) => ({
    id: `show-${show.id}`,
    type: 'show' as const,
    title: show.name || show.title || 'Untitled Show',
    subtitle: show.venue ? `${show.city}, ${show.country}` : `${show.city || 'Unknown City'}`,
    date: new Date(show.date),
    status: show.status === 'confirmed' ? 'confirmed' : 
           show.status === 'cancelled' ? 'cancelled' : 'planned',
    priority: show.fee && show.fee > 10000 ? 'high' : 'medium',
    location: show.venue || `${show.city}, ${show.country}`,
    amount: show.fee,
    currency: show.currency || 'EUR',
    metadata: {
      venue: show.venue,
      promoter: show.promoter,
      agency: show.agency,
      originalData: show
    },
    actions: [
      {
        id: 'view',
        label: 'View Details',
        onClick: () => {
          // Navigate to show details
          try {
            window.dispatchEvent(new CustomEvent('navigate', { 
              detail: { to: `/dashboard/shows?edit=${encodeURIComponent(show.id)}` } 
            } as any));
          } catch (error) {
            console.warn('Navigation failed:', error);
          }
        },
        variant: 'primary'
      },
      {
        id: 'edit',
        label: 'Edit',
        onClick: () => {
          // Navigate to show editor
          try {
            window.dispatchEvent(new CustomEvent('navigate', { 
              detail: { to: `/dashboard/shows?edit=${encodeURIComponent(show.id)}` } 
            } as any));
          } catch (error) {
            console.warn('Navigation failed:', error);
          }
        },
        variant: 'secondary'
      }
    ]
  }));
};

/**
 * Transform contracts data to timeline events
 */
const transformContractsToEvents = (contracts: any[]): UniversalTimelineEvent[] => {
  if (!contracts || !Array.isArray(contracts)) return [];
  
  return contracts.map((contract) => ({
    id: `contract-${contract.id}`,
    type: 'contract' as const,
    title: contract.title || contract.name || 'Contract',
    subtitle: contract.client || contract.company || 'Unknown Client',
    date: new Date(contract.signedDate || contract.createdAt || contract.date || Date.now()),
    endDate: contract.endDate ? new Date(contract.endDate) : undefined,
    status: contract.status === 'signed' ? 'completed' :
           contract.status === 'pending' ? 'in-progress' :
           contract.status === 'cancelled' ? 'cancelled' : 'planned',
    priority: contract.value && contract.value > 50000 ? 'high' : 'medium',
    location: contract.location || contract.venue,
    amount: contract.value || contract.amount,
    currency: contract.currency || 'EUR',
    metadata: {
      client: contract.client,
      company: contract.company,
      originalData: contract
    },
    actions: [
      {
        id: 'view',
        label: 'View Contract',
        onClick: () => {
          // Navigate to contract details
          try {
            window.dispatchEvent(new CustomEvent('navigate', { 
              detail: { to: `/dashboard/contracts?id=${encodeURIComponent(contract.id)}` } 
            } as any));
          } catch (error) {
            console.warn('Navigation failed:', error);
          }
        },
        variant: 'primary'
      }
    ]
  }));
};

/**
 * Generate sample finance events (until real finance integration)
 */
const generateSampleFinanceEvents = (): UniversalTimelineEvent[] => {
  const now = new Date();
  const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  
  return [
    {
      id: 'finance-1',
      type: 'finance',
      title: 'Venue Payment Due',
      subtitle: 'Palau de la Música Catalana',
      date: addDays(now, 3),
      status: 'planned',
      priority: 'high',
      amount: 8500,
      currency: 'EUR',
      actions: [
        {
          id: 'pay',
          label: 'Process Payment',
          onClick: () => console.log('Process payment'),
          variant: 'primary'
        }
      ]
    },
    {
      id: 'finance-2',
      type: 'finance',
      title: 'Artist Fee Payment',
      subtitle: 'March Tour Payment',
      date: addDays(now, -2),
      status: 'completed',
      priority: 'medium',
      amount: 15000,
      currency: 'EUR',
      actions: [
        {
          id: 'receipt',
          label: 'View Receipt',
          onClick: () => console.log('View receipt'),
          variant: 'secondary'
        }
      ]
    }
  ];
};

/**
 * Generate sample travel events (until real travel integration)
 */
const generateSampleTravelEvents = (): UniversalTimelineEvent[] => {
  const now = new Date();
  const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  
  return [
    {
      id: 'travel-1',
      type: 'travel',
      title: 'Flight to Barcelona',
      subtitle: 'MAD → BCN',
      date: addDays(now, 12),
      status: 'confirmed',
      priority: 'medium',
      location: 'Madrid → Barcelona',
      actions: [
        {
          id: 'checkin',
          label: 'Check In',
          onClick: () => console.log('Check in'),
          variant: 'primary'
        },
        {
          id: 'details',
          label: 'Flight Details',
          onClick: () => console.log('Flight details'),
          variant: 'secondary'
        }
      ]
    },
    {
      id: 'travel-2',
      type: 'travel',
      title: 'Hotel Booking',
      subtitle: 'Hotel Arts Barcelona',
      date: addDays(now, 12),
      endDate: addDays(now, 15),
      status: 'confirmed',
      priority: 'low',
      location: 'Barcelona, Spain',
      actions: [
        {
          id: 'confirm',
          label: 'View Booking',
          onClick: () => console.log('View booking'),
          variant: 'secondary'
        }
      ]
    }
  ];
};

/**
 * Generate sample task events (future functionality)
 */
const generateSampleTaskEvents = (): UniversalTimelineEvent[] => {
  const now = new Date();
  const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  
  return [
    {
      id: 'task-1',
      type: 'task',
      title: 'Sound Check Preparation',
      subtitle: 'Technical rider review',
      date: addDays(now, 13),
      status: 'planned',
      priority: 'high',
      actions: [
        {
          id: 'complete',
          label: 'Mark Complete',
          onClick: () => console.log('Mark complete'),
          variant: 'primary'
        }
      ]
    },
    {
      id: 'task-2',
      type: 'task',
      title: 'Contract Review',
      subtitle: 'Legal team review required',
      date: addDays(now, 1),
      status: 'overdue',
      priority: 'critical',
      actions: [
        {
          id: 'urgent',
          label: 'Mark Urgent',
          onClick: () => console.log('Mark urgent'),
          variant: 'danger'
        }
      ]
    }
  ];
};

/**
 * Hook to fetch and combine all timeline data
 */
export const useUniversalTimelineData = () => {
  // Real data hooks
  const { shows } = useShows();
  const contractsQuery = useContractsQuery();
  const contracts = contractsQuery.data || [];

  // Combine all events
  const events = useMemo<UniversalTimelineEvent[]>(() => {
    const allEvents: UniversalTimelineEvent[] = [
      ...transformShowsToEvents(shows || []),
      ...transformContractsToEvents(contracts),
      ...generateSampleFinanceEvents(),
      ...generateSampleTravelEvents(),
      ...generateSampleTaskEvents()
    ];

    // Sort by date (ascending)
    return allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [shows, contracts]);

  // Loading state
  const loading = contractsQuery.isLoading;

  // Error state
  const error = contractsQuery.error;

  return {
    events,
    loading,
    error,
    refetch: contractsQuery.refetch
  };
};

export default useUniversalTimelineData;