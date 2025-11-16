/**
 * Calendar Lazy Components - Performance Optimization
 * Dynamically load calendar components to reduce initial bundle size
 */

import { lazy } from 'react';

// Main calendar components
export const MonthGrid = lazy(() => import('../../components/calendar/MonthGrid'));
export const WeekGrid = lazy(() => import('../../components/calendar/WeekGrid'));  
export const DayGrid = lazy(() => import('../../components/calendar/DayGrid'));
export const AgendaList = lazy(() => import('../../components/calendar/AgendaList'));
export const TimelineView = lazy(() => import('../../components/calendar/TimelineView').then(m => ({ default: m.TimelineView })));

// Calendar modals - high impact lazy loading
export const DayDetailsModal = lazy(() => import('../../components/calendar/DayDetailsModal'));
export const TravelFlightModal = lazy(() => import('../../components/calendar/TravelFlightModal'));
export const EventCreationModal = lazy(() => import('../../components/calendar/EventCreationModal'));
export const CalendarEventModal = lazy(() => import('../../components/calendar/CalendarEventModal'));
export const EventDetailDrawer = lazy(() => import('../../components/dashboard/EventDetailDrawer'));

// Calendar utilities
export const CalendarToolbar = lazy(() => import('../../components/calendar/CalendarToolbar'));
export const BulkOperationsToolbar = lazy(() => import('../../components/calendar/BulkOperationsToolbar'));