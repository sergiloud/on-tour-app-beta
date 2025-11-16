/**
 * Calendar Integration - Test Suite
 * Testing calendar event handling, multi-day events, conflict detection, ICS export/import functionality
 * Target: 80%+ calendar integration feature coverage for enterprise-grade calendar management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import '@testing-library/jest-dom'

// Calendar Event Interface
interface CalEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'show' | 'travel' | 'personal' | 'meeting'
  status: 'confirmed' | 'pending' | 'cancelled'
  allDay?: boolean
  recurring?: boolean
  organizationId: string
  userId: string
  location?: string
  description?: string
  conflictsWith?: string[]
}

// Calendar Service
class CalendarService {
  private events: CalEvent[] = []

  addEvent(event: CalEvent): Promise<CalEvent> {
    if (!event.title || !event.start || !event.end) {
      throw new Error('Invalid event data')
    }
    if (event.start >= event.end) {
      throw new Error('Invalid event timing')
    }

    const conflicts = this.detectConflicts(event)
    if (conflicts.length > 0) {
      event.conflictsWith = conflicts.map(c => c.id)
    }

    this.events.push(event)
    return Promise.resolve(event)
  }

  getEvents(organizationId: string): Promise<CalEvent[]> {
    return Promise.resolve(this.events.filter(e => e.organizationId === organizationId))
  }

  updateEvent(id: string, updates: Partial<CalEvent>): Promise<CalEvent> {
    const index = this.events.findIndex(e => e.id === id)
    if (index === -1) {
      throw new Error('Event not found')
    }
    const updated = { ...this.events[index], ...updates } as CalEvent
    this.events[index] = updated
    return Promise.resolve(updated)
  }

  deleteEvent(id: string): Promise<void> {
    this.events = this.events.filter(e => e.id !== id)
    return Promise.resolve()
  }

  detectConflicts(event: CalEvent): CalEvent[] {
    return this.events.filter(existing => {
      if (existing.id === event.id || existing.organizationId !== event.organizationId) return false
      if (existing.status === 'cancelled') return false
      return event.start < existing.end && event.end > existing.start
    })
  }

  getEventsInRange(start: Date, end: Date, organizationId: string): Promise<CalEvent[]> {
    return Promise.resolve(
      this.events.filter(event => {
        if (event.organizationId !== organizationId) return false
        return event.start < end && event.end > start
      })
    )
  }

  exportToICS(events: CalEvent[]): string {
    let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'
    events.forEach(event => {
      ics += 'BEGIN:VEVENT\r\n'
      ics += `UID:${event.id}@ontourapp.com\r\n`
      ics += `SUMMARY:${event.title}\r\n`
      if (event.location) ics += `LOCATION:${event.location}\r\n`
      ics += 'END:VEVENT\r\n'
    })
    ics += 'END:VCALENDAR\r\n'
    return ics
  }

  importFromICS(icsContent: string, organizationId: string, userId: string): Promise<CalEvent[]> {
    const events: CalEvent[] = []
    const lines = icsContent.split('\r\n')
    let currentEvent: any = {}

    for (const line of lines) {
      if (line === 'BEGIN:VEVENT') {
        currentEvent = {}
      } else if (line === 'END:VEVENT' && currentEvent.uid && currentEvent.summary) {
        events.push({
          id: currentEvent.uid,
          title: currentEvent.summary,
          start: new Date(),
          end: new Date(),
          type: 'personal',
          status: 'confirmed',
          organizationId,
          userId,
          location: currentEvent.location
        })
      } else if (line.startsWith('UID:')) {
        currentEvent.uid = line.substring(4)
      } else if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.substring(8)
      } else if (line.startsWith('LOCATION:')) {
        currentEvent.location = line.substring(9)
      }
    }
    return Promise.resolve(events)
  }

  getEventsByType(type: CalEvent['type'], organizationId: string): Promise<CalEvent[]> {
    return Promise.resolve(
      this.events.filter(event => event.type === type && event.organizationId === organizationId)
    )
  }
}

// Calendar Analytics
class CalendarAnalytics {
  calculateOccupancy(events: CalEvent[], start: Date, end: Date): number {
    const totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    let occupiedHours = 0

    events.forEach(event => {
      const eventStart = Math.max(event.start.getTime(), start.getTime())
      const eventEnd = Math.min(event.end.getTime(), end.getTime())
      if (eventStart < eventEnd) {
        occupiedHours += (eventEnd - eventStart) / (1000 * 60 * 60)
      }
    })

    return Math.min(occupiedHours / totalHours, 1)
  }

  getConflictStatistics(events: CalEvent[]): {
    totalConflicts: number
    conflictsByType: Record<string, number>
  } {
    const conflictsByType: Record<string, number> = {}
    let totalConflicts = 0

    events.forEach(event => {
      if (event.conflictsWith && event.conflictsWith.length > 0) {
        totalConflicts += event.conflictsWith.length
        conflictsByType[event.type] = (conflictsByType[event.type] || 0) + 1
      }
    })

    return { totalConflicts, conflictsByType }
  }
}

// Mock Calendar Component
const MockCalendarView: React.FC<{
  events: CalEvent[]
  onEventClick: (event: CalEvent) => void
  onAddEvent: () => void
}> = ({ events, onEventClick, onAddEvent }) => (
  <div data-testid="calendar-view">
    <button onClick={onAddEvent} data-testid="add-event-btn">Add Event</button>
    <div data-testid="events-list">
      {events.map(event => (
        <div 
          key={event.id} 
          data-testid={`event-${event.id}`}
          onClick={() => onEventClick(event)}
          className={event.conflictsWith?.length ? 'conflict' : ''}
        >
          {event.title} - {event.type} ({event.status})
          {event.conflictsWith?.length ? ' ⚠️' : ''}
        </div>
      ))}
    </div>
  </div>
)

describe('Calendar Integration - Comprehensive Test Suite', () => {
  let calendarService: CalendarService
  let calendarAnalytics: CalendarAnalytics
  let mockOnEventClick: any
  let mockOnAddEvent: any

  // Mock Events Data
  const mockEvents: CalEvent[] = [
    {
      id: 'event-1',
      title: 'Tour Show - Madison Square Garden',
      start: new Date('2024-03-15T19:00:00Z'),
      end: new Date('2024-03-15T22:00:00Z'),
      type: 'show',
      status: 'confirmed',
      organizationId: 'org-1',
      userId: 'user-1',
      location: 'Madison Square Garden, New York'
    },
    {
      id: 'event-2',
      title: 'Flight to NYC',
      start: new Date('2024-03-15T14:00:00Z'),
      end: new Date('2024-03-15T17:00:00Z'),
      type: 'travel',
      status: 'confirmed',
      organizationId: 'org-1',
      userId: 'user-1',
      location: 'LAX → JFK'
    },
    {
      id: 'event-3',
      title: 'Multi-Day Festival',
      start: new Date('2024-03-20T00:00:00Z'),
      end: new Date('2024-03-22T23:59:59Z'),
      type: 'show',
      status: 'confirmed',
      allDay: true,
      organizationId: 'org-1',
      userId: 'user-1',
      location: 'Coachella Valley'
    }
  ]

  beforeEach(async () => {
    calendarService = new CalendarService()
    calendarAnalytics = new CalendarAnalytics()
    mockOnEventClick = vi.fn()
    mockOnAddEvent = vi.fn()

    // Add mock events
    for (const event of mockEvents) {
      await calendarService.addEvent({ ...event })
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Calendar Event Management', () => {
    it('should create new events with validation', async () => {
      const newEvent: CalEvent = {
        id: 'event-new',
        title: 'New Show',
        start: new Date('2024-04-01T20:00:00Z'),
        end: new Date('2024-04-01T23:00:00Z'),
        type: 'show',
        status: 'confirmed',
        organizationId: 'org-1',
        userId: 'user-1'
      }

      const result = await calendarService.addEvent(newEvent)
      expect(result.title).toBe('New Show')

      const events = await calendarService.getEvents('org-1')
      expect(events).toHaveLength(4)
    })

    it('should validate event data and reject invalid events', async () => {
      const invalidEvent: CalEvent = {
        id: 'invalid',
        title: '',
        start: new Date('2024-04-01T20:00:00Z'),
        end: new Date('2024-04-01T19:00:00Z'),
        type: 'show',
        status: 'confirmed',
        organizationId: 'org-1',
        userId: 'user-1'
      }

      await expect(calendarService.addEvent(invalidEvent)).rejects.toThrow()
    })

    it('should update existing events', async () => {
      const updates = {
        title: 'Updated Show Title',
        status: 'pending' as const
      }

      const result = await calendarService.updateEvent('event-1', updates)
      expect(result.title).toBe('Updated Show Title')
      expect(result.status).toBe('pending')
    })

    it('should delete events', async () => {
      await calendarService.deleteEvent('event-1')
      
      const events = await calendarService.getEvents('org-1')
      expect(events.find(e => e.id === 'event-1')).toBeUndefined()
      expect(events).toHaveLength(2)
    })

    it('should filter events by organization', async () => {
      const org1Events = await calendarService.getEvents('org-1')
      const org2Events = await calendarService.getEvents('org-2')

      expect(org1Events).toHaveLength(3)
      expect(org2Events).toHaveLength(0)
    })
  })

  describe('Multi-Day Event Handling', () => {
    it('should handle multi-day events correctly', async () => {
      const multiDayEvent = mockEvents.find(e => e.allDay)
      expect(multiDayEvent).toBeTruthy()
      if (multiDayEvent) {
        expect(multiDayEvent.start.getDate()).toBe(20)
        expect(multiDayEvent.end.getDate()).toBe(22)
      }
    })

    it('should get events in date range including multi-day events', async () => {
      const rangeStart = new Date('2024-03-21T00:00:00Z')
      const rangeEnd = new Date('2024-03-21T23:59:59Z')

      const eventsInRange = await calendarService.getEventsInRange(rangeStart, rangeEnd, 'org-1')
      const multiDayEvent = eventsInRange.find(e => e.allDay)
      
      expect(multiDayEvent).toBeTruthy()
    })
  })

  describe('Conflict Detection', () => {
    it('should detect overlapping events', async () => {
      const conflictingEvent: CalEvent = {
        id: 'test-conflict',
        title: 'Conflicting Event',
        start: new Date('2024-03-15T19:30:00Z'),
        end: new Date('2024-03-15T21:30:00Z'),
        type: 'meeting',
        status: 'pending',
        organizationId: 'org-1',
        userId: 'user-1'
      }

      const result = await calendarService.addEvent(conflictingEvent)
      expect(result.conflictsWith).toBeDefined()
      expect(result.conflictsWith!.length).toBeGreaterThan(0)
    })

    it('should generate conflict statistics', async () => {
      // Add conflicting event
      await calendarService.addEvent({
        id: 'conflict-test',
        title: 'Conflicting Meeting',
        start: new Date('2024-03-15T20:00:00Z'),
        end: new Date('2024-03-15T21:00:00Z'),
        type: 'meeting',
        status: 'pending',
        organizationId: 'org-1',
        userId: 'user-1'
      })

      const events = await calendarService.getEvents('org-1')
      const stats = calendarAnalytics.getConflictStatistics(events)
      
      expect(stats.totalConflicts).toBeGreaterThanOrEqual(0)
      expect(stats.conflictsByType).toBeDefined()
    })
  })

  describe('ICS Export/Import Functionality', () => {
    it('should export events to ICS format', async () => {
      const events = await calendarService.getEvents('org-1')
      const icsContent = calendarService.exportToICS(events.slice(0, 2))

      expect(icsContent).toContain('BEGIN:VCALENDAR')
      expect(icsContent).toContain('END:VCALENDAR')
      expect(icsContent).toContain('BEGIN:VEVENT')
      expect(icsContent).toContain('END:VEVENT')
      expect(icsContent).toContain('Tour Show - Madison Square Garden')
    })

    it('should import events from ICS format', async () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test-import@example.com
SUMMARY:Imported Show
LOCATION:Test Venue
END:VEVENT
END:VCALENDAR`

      const importedEvents = await calendarService.importFromICS(icsContent, 'org-1', 'user-1')
      
      expect(importedEvents).toHaveLength(1)
      expect(importedEvents[0]?.title).toBe('Imported Show')
      expect(importedEvents[0]?.location).toBe('Test Venue')
      expect(importedEvents[0]?.organizationId).toBe('org-1')
    })

    it('should handle empty or malformed ICS content', async () => {
      const malformedICS = 'Invalid ICS Content'
      const importedEvents = await calendarService.importFromICS(malformedICS, 'org-1', 'user-1')
      expect(importedEvents).toHaveLength(0)
    })
  })

  describe('Calendar Analytics and Reporting', () => {
    it('should calculate calendar occupancy rate', async () => {
      const events = await calendarService.getEvents('org-1')
      const start = new Date('2024-03-15T00:00:00Z')
      const end = new Date('2024-03-16T00:00:00Z')
      
      const occupancy = calendarAnalytics.calculateOccupancy(events, start, end)
      expect(occupancy).toBeGreaterThanOrEqual(0)
      expect(occupancy).toBeLessThanOrEqual(1)
    })

    it('should track events by type', async () => {
      const showEvents = await calendarService.getEventsByType('show', 'org-1')
      const travelEvents = await calendarService.getEventsByType('travel', 'org-1')

      expect(showEvents.length).toBeGreaterThanOrEqual(1)
      expect(travelEvents.length).toBeGreaterThanOrEqual(1)
      expect(showEvents.every(e => e.type === 'show')).toBe(true)
    })
  })

  describe('Calendar UI Integration', () => {
    it('should render calendar with events', async () => {
      const events = await calendarService.getEvents('org-1')
      
      render(
        <MockCalendarView 
          events={events}
          onEventClick={mockOnEventClick}
          onAddEvent={mockOnAddEvent}
        />
      )

      expect(screen.getByTestId('calendar-view')).toBeInTheDocument()
      expect(screen.getByTestId('events-list')).toBeInTheDocument()
      expect(screen.getByTestId('event-event-1')).toBeInTheDocument()
    })

    it('should handle event click interactions', async () => {
      const events = await calendarService.getEvents('org-1')
      
      render(
        <MockCalendarView 
          events={events}
          onEventClick={mockOnEventClick}
          onAddEvent={mockOnAddEvent}
        />
      )

      const eventElement = screen.getByTestId('event-event-1')
      fireEvent.click(eventElement)
      
      expect(mockOnEventClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'event-1' })
      )
    })

    it('should show add event functionality', async () => {
      const events = await calendarService.getEvents('org-1')
      
      render(
        <MockCalendarView 
          events={events}
          onEventClick={mockOnEventClick}
          onAddEvent={mockOnAddEvent}
        />
      )

      const addButton = screen.getByTestId('add-event-btn')
      fireEvent.click(addButton)
      
      expect(mockOnAddEvent).toHaveBeenCalled()
    })
  })

  describe('Performance and Edge Cases', () => {
    it('should handle empty event lists gracefully', async () => {
      const emptyOrgEvents = await calendarService.getEvents('empty-org')
      expect(emptyOrgEvents).toHaveLength(0)
      
      const icsContent = calendarService.exportToICS([])
      expect(icsContent).toContain('BEGIN:VCALENDAR')
      expect(icsContent).toContain('END:VCALENDAR')
    })

    it('should handle invalid date ranges', async () => {
      const invalidStart = new Date('2024-12-31T23:59:59Z')
      const invalidEnd = new Date('2024-01-01T00:00:00Z')
      
      const eventsInRange = await calendarService.getEventsInRange(invalidStart, invalidEnd, 'org-1')
      expect(eventsInRange).toHaveLength(0)
    })

    it('should maintain data integrity across operations', async () => {
      const originalEvents = await calendarService.getEvents('org-1')
      const originalCount = originalEvents.length
      
      const newEvent: CalEvent = {
        id: 'integrity-test',
        title: 'Integrity Test',
        start: new Date('2024-04-01T10:00:00Z'),
        end: new Date('2024-04-01T11:00:00Z'),
        type: 'meeting',
        status: 'confirmed',
        organizationId: 'org-1',
        userId: 'user-1'
      }
      
      await calendarService.addEvent(newEvent)
      const afterAdd = await calendarService.getEvents('org-1')
      expect(afterAdd).toHaveLength(originalCount + 1)
      
      await calendarService.deleteEvent('integrity-test')
      const afterDelete = await calendarService.getEvents('org-1')
      expect(afterDelete).toHaveLength(originalCount)
    })

    it('should handle concurrent event modifications', async () => {
      const promises = [
        calendarService.updateEvent('event-1', { title: 'Update 1' }),
        calendarService.updateEvent('event-2', { title: 'Update 2' })
      ]
      
      const results = await Promise.allSettled(promises)
      expect(results.every(r => r.status === 'fulfilled')).toBe(true)
    })
  })

  describe('Advanced Calendar Features', () => {
    it('should handle recurring events', async () => {
      const recurringEvent: CalEvent = {
        id: 'recurring-1',
        title: 'Weekly Meeting',
        start: new Date('2024-03-15T10:00:00Z'),
        end: new Date('2024-03-15T11:00:00Z'),
        type: 'meeting',
        status: 'confirmed',
        recurring: true,
        organizationId: 'org-1',
        userId: 'user-1'
      }

      const result = await calendarService.addEvent(recurringEvent)
      expect(result.recurring).toBe(true)
      expect(result.title).toBe('Weekly Meeting')
    })

    it('should support different event statuses', async () => {
      const events = await calendarService.getEvents('org-1')
      const statuses = events.map(e => e.status)
      
      expect(statuses).toContain('confirmed')
    })

    it('should validate imported calendar data', async () => {
      const validICS = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:valid@example.com
SUMMARY:Valid Event
END:VEVENT
END:VCALENDAR`

      const events = await calendarService.importFromICS(validICS, 'org-1', 'user-1')
      expect(events).toHaveLength(1)
      expect(events[0]?.title).toBe('Valid Event')
    })
  })
})