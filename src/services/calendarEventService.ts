/**
 * 📅 CALENDAR EVENT SERVICE - Firebase Integration
 * 
 * Servicio para gestionar eventos de calendario con Firebase
 * Diferencia entre shows y eventos regulares de calendario
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { generateId } from '../lib/id';

// Tipos de eventos de calendario
export type CalendarEventType = 'meeting' | 'rehearsal' | 'break' | 'other' | 'travel';

// Interface para eventos de calendario (NO shows)
export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  dateEnd?: string; // Para eventos multi-día
  time?: string; // HH:mm
  timeEnd?: string; // HH:mm
  location?: string;
  color?: 'accent' | 'green' | 'red' | 'blue' | 'yellow' | 'purple';
  allDay?: boolean;
  attendees?: string[];
  notes?: string;
  
  // Firebase metadata
  organizationId: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Data transfer object para crear/actualizar eventos
export interface CalendarEventInput {
  type: CalendarEventType;
  title: string;
  description?: string;
  date: string;
  dateEnd?: string;
  time?: string;
  timeEnd?: string;
  location?: string;
  color?: 'accent' | 'green' | 'red' | 'blue' | 'yellow' | 'purple';
  allDay?: boolean;
  attendees?: string[];
  notes?: string;
}

class CalendarEventService {
  private collectionPath = 'calendar-events';

  /**
   * Verifica si Firebase está disponible
   */
  private checkFirebaseAvailable() {
    if (!db) {
      throw new Error('Firebase not configured. Please set up Firebase environment variables.');
    }
  }

  /**
   * Obtiene la colección de eventos para una organización
   */
  private getCollectionRef(organizationId: string) {
    this.checkFirebaseAvailable();
    return collection(db!, this.collectionPath);
  }

  /**
   * Crear un nuevo evento de calendario
   */
  async createEvent(
    organizationId: string, 
    userId: string, 
    eventData: CalendarEventInput
  ): Promise<string> {
    const collectionRef = this.getCollectionRef(organizationId);
    
    const newEvent: Omit<CalendarEvent, 'id'> = {
      ...eventData,
      organizationId,
      createdBy: userId,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collectionRef, newEvent);
    return docRef.id;
  }

  /**
   * Actualizar un evento existente
   */
  async updateEvent(
    eventId: string, 
    updates: Partial<CalendarEventInput>
  ): Promise<void> {
    this.checkFirebaseAvailable();
    const docRef = doc(db!, this.collectionPath, eventId);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Eliminar un evento
   */
  async deleteEvent(eventId: string): Promise<void> {
    this.checkFirebaseAvailable();
    const docRef = doc(db!, this.collectionPath, eventId);
    await deleteDoc(docRef);
  }

  /**
   * Obtener todos los eventos de una organización
   */
  async getEvents(organizationId: string): Promise<CalendarEvent[]> {
    const collectionRef = this.getCollectionRef(organizationId);
    const q = query(
      collectionRef,
      where('organizationId', '==', organizationId),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CalendarEvent));
  }

  /**
   * Obtener eventos en un rango de fechas
   */
  async getEventsByDateRange(
    organizationId: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarEvent[]> {
    const collectionRef = this.getCollectionRef(organizationId);
    const q = query(
      collectionRef,
      where('organizationId', '==', organizationId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CalendarEvent));
  }

  /**
   * Suscribirse a cambios en tiempo real
   */
  subscribeToEvents(
    organizationId: string,
    callback: (events: CalendarEvent[]) => void
  ): () => void {
    const collectionRef = this.getCollectionRef(organizationId);
    const q = query(
      collectionRef,
      where('organizationId', '==', organizationId),
      orderBy('date', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CalendarEvent));
      callback(events);
    });
  }

  /**
   * Mover evento a otra fecha
   */
  async moveEvent(eventId: string, newDate: string): Promise<void> {
    await this.updateEvent(eventId, { date: newDate });
  }

  /**
   * Duplicar evento
   */
  async duplicateEvent(
    originalEventId: string,
    organizationId: string,
    userId: string,
    newDate: string
  ): Promise<string> {
    // Obtener el evento original
    const events = await this.getEvents(organizationId);
    const originalEvent = events.find(e => e.id === originalEventId);
    
    if (!originalEvent) {
      throw new Error('Event not found');
    }

    // Crear copia con nueva fecha
    const duplicatedEventData: CalendarEventInput = {
      type: originalEvent.type,
      title: `${originalEvent.title} (Copy)`,
      description: originalEvent.description,
      date: newDate,
      dateEnd: originalEvent.dateEnd,
      time: originalEvent.time,
      timeEnd: originalEvent.timeEnd,
      location: originalEvent.location,
      color: originalEvent.color,
      allDay: originalEvent.allDay,
      attendees: originalEvent.attendees,
      notes: originalEvent.notes,
    };

    return await this.createEvent(organizationId, userId, duplicatedEventData);
  }
}

// Instancia singleton del servicio
export const calendarEventService = new CalendarEventService();

// Hook personalizado para usar el servicio
export function useCalendarEvents(organizationId: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    const unsubscribe = calendarEventService.subscribeToEvents(
      organizationId,
      (newEvents) => {
        setEvents(newEvents);
        setLoading(false);
        setError(null);
      }
    );

    return unsubscribe;
  }, [organizationId]);

  const createEvent = useCallback(async (
    eventData: CalendarEventInput,
    userId: string
  ) => {
    try {
      setError(null);
      const eventId = await calendarEventService.createEvent(organizationId, userId, eventData);
      return eventId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      throw err;
    }
  }, [organizationId]);

  const updateEvent = useCallback(async (
    eventId: string,
    updates: Partial<CalendarEventInput>
  ) => {
    try {
      setError(null);
      await calendarEventService.updateEvent(eventId, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      throw err;
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      setError(null);
      await calendarEventService.deleteEvent(eventId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      throw err;
    }
  }, []);

  const moveEvent = useCallback(async (eventId: string, newDate: string) => {
    try {
      setError(null);
      await calendarEventService.moveEvent(eventId, newDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move event');
      throw err;
    }
  }, []);

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
  };
}

export default calendarEventService;