/**
 * useCalendarModals
 * Centralizes all modal state management for the calendar
 * 
 * Responsibilities:
 * - Manage open/close state for all modals
 * - Track modal-specific data (editing IDs, dates, initial data)
 * - Provide type-safe modal operations
 * - Reduce useState clutter in parent component
 * 
 * @module hooks/useCalendarModals
 */

import { useState, useCallback } from 'react';
import type { Show } from '../lib/shows';
import type { Itinerary } from '../services/travelApi';
import type { EventType, EventData } from '../components/calendar/EventCreationModal';

export interface ModalState {
  // Event Creation Modal
  eventCreation: {
    isOpen: boolean;
    date?: string;
    type: EventType | null;
    initialData?: EventData;
  };
  
  // Day Details Modal
  dayDetails: {
    isOpen: boolean;
    date?: string;
  };
  
  // Show Event Modal
  showEvent: {
    isOpen: boolean;
    data?: any;
  };
  
  // Travel/Flight Modal
  travelFlight: {
    isOpen: boolean;
    data?: any;
    editingId?: string;
  };
  
  // Event Editor Modal
  eventEditor: {
    isOpen: boolean;
    event: (Show & { kind: 'show' }) | (Itinerary & { kind: 'travel' }) | null;
  };
  
  // Go To Date Modal
  gotoDate: {
    isOpen: boolean;
  };
}

export interface UseCalendarModalsReturn {
  state: ModalState;
  
  // Event Creation Modal
  openEventCreation: (date?: string, type?: EventType, initialData?: EventData) => void;
  closeEventCreation: () => void;
  
  // Day Details Modal
  openDayDetails: (date: string) => void;
  closeDayDetails: () => void;
  
  // Show Event Modal
  openShowEvent: (data: any) => void;
  closeShowEvent: () => void;
  
  // Travel/Flight Modal
  openTravelFlight: (data?: any, editingId?: string) => void;
  closeTravelFlight: () => void;
  
  // Event Editor Modal
  openEventEditor: (event: (Show & { kind: 'show' }) | (Itinerary & { kind: 'travel' })) => void;
  closeEventEditor: () => void;
  
  // Go To Date Modal
  openGotoDate: () => void;
  closeGotoDate: () => void;
  
  // Utility
  closeAll: () => void;
}

const INITIAL_STATE: ModalState = {
  eventCreation: {
    isOpen: false,
    date: undefined,
    type: null,
    initialData: undefined,
  },
  dayDetails: {
    isOpen: false,
    date: undefined,
  },
  showEvent: {
    isOpen: false,
    data: undefined,
  },
  travelFlight: {
    isOpen: false,
    data: undefined,
    editingId: undefined,
  },
  eventEditor: {
    isOpen: false,
    event: null,
  },
  gotoDate: {
    isOpen: false,
  },
};

/**
 * Custom hook that manages all calendar modal states
 * Replaces 15+ useState declarations from Calendar.tsx
 */
export function useCalendarModals(): UseCalendarModalsReturn {
  const [state, setState] = useState<ModalState>(INITIAL_STATE);
  
  // Event Creation Modal
  const openEventCreation = useCallback((date?: string, type?: EventType, initialData?: EventData) => {
    setState(prev => ({
      ...prev,
      eventCreation: {
        isOpen: true,
        date,
        type: type || null,
        initialData,
      },
    }));
  }, []);
  
  const closeEventCreation = useCallback(() => {
    setState(prev => ({
      ...prev,
      eventCreation: {
        isOpen: false,
        date: undefined,
        type: null,
        initialData: undefined,
      },
    }));
  }, []);
  
  // Day Details Modal
  const openDayDetails = useCallback((date: string) => {
    setState(prev => ({
      ...prev,
      dayDetails: {
        isOpen: true,
        date,
      },
    }));
  }, []);
  
  const closeDayDetails = useCallback(() => {
    setState(prev => ({
      ...prev,
      dayDetails: {
        isOpen: false,
        date: undefined,
      },
    }));
  }, []);
  
  // Show Event Modal
  const openShowEvent = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      showEvent: {
        isOpen: true,
        data,
      },
    }));
  }, []);
  
  const closeShowEvent = useCallback(() => {
    setState(prev => ({
      ...prev,
      showEvent: {
        isOpen: false,
        data: undefined,
      },
    }));
  }, []);
  
  // Travel/Flight Modal
  const openTravelFlight = useCallback((data?: any, editingId?: string) => {
    setState(prev => ({
      ...prev,
      travelFlight: {
        isOpen: true,
        data,
        editingId,
      },
    }));
  }, []);
  
  const closeTravelFlight = useCallback(() => {
    setState(prev => ({
      ...prev,
      travelFlight: {
        isOpen: false,
        data: undefined,
        editingId: undefined,
      },
    }));
  }, []);
  
  // Event Editor Modal
  const openEventEditor = useCallback((event: (Show & { kind: 'show' }) | (Itinerary & { kind: 'travel' })) => {
    setState(prev => ({
      ...prev,
      eventEditor: {
        isOpen: true,
        event,
      },
    }));
  }, []);
  
  const closeEventEditor = useCallback(() => {
    setState(prev => ({
      ...prev,
      eventEditor: {
        isOpen: false,
        event: null,
      },
    }));
  }, []);
  
  // Go To Date Modal
  const openGotoDate = useCallback(() => {
    setState(prev => ({
      ...prev,
      gotoDate: {
        isOpen: true,
      },
    }));
  }, []);
  
  const closeGotoDate = useCallback(() => {
    setState(prev => ({
      ...prev,
      gotoDate: {
        isOpen: false,
      },
    }));
  }, []);
  
  // Close all modals
  const closeAll = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);
  
  return {
    state,
    openEventCreation,
    closeEventCreation,
    openDayDetails,
    closeDayDetails,
    openShowEvent,
    closeShowEvent,
    openTravelFlight,
    closeTravelFlight,
    openEventEditor,
    closeEventEditor,
    openGotoDate,
    closeGotoDate,
    closeAll,
  };
}
