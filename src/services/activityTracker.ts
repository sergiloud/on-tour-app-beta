import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { User } from 'firebase/auth';

export type ActivityModule = 'shows' | 'contacts' | 'contracts' | 'venues' | 'finance' | 'crm';
export type ActivityAction = 'create' | 'update' | 'delete' | 'status_change' | 'payment' | 'note_add';
export type ActivityImportance = 'low' | 'medium' | 'high' | 'critical';

interface ActivityData {
  organizationId: string;
  module: ActivityModule;
  action: ActivityAction;
  userId: string;
  userName: string;
  userEmail?: string;
  title: string;
  description?: string;
  importance?: ActivityImportance;
  relatedId?: string; // ID del show/contact/contract relacionado
  relatedName?: string; // Nombre del elemento relacionado para búsqueda rápida
  metadata?: Record<string, any>; // Datos adicionales específicos del módulo
}

/**
 * Servicio centralizado para tracking de actividades
 * Automáticamente crea eventos en Timeline cuando se realizan acciones en la app
 */
export const activityTracker = {
  /**
   * Registra una nueva actividad en Firestore
   */
  async track(data: ActivityData): Promise<void> {
    try {
      if (!db) {
        console.warn('[ActivityTracker] Firestore not initialized, skipping tracking');
        return;
      }

      const activitiesRef = collection(db, 'activities');
      
      await addDoc(activitiesRef, {
        ...data,
        importance: data.importance || 'medium',
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      console.log('[ActivityTracker] ✓ Event tracked:', {
        module: data.module,
        action: data.action,
        title: data.title,
      });
    } catch (error) {
      console.error('[ActivityTracker] ✗ Failed to track activity:', error);
      // No lanzamos error para no romper el flujo principal
    }
  },

  /**
   * Helper: Tracking para Shows
   */
  async trackShow(
    action: ActivityAction,
    show: any,
    user: User,
    organizationId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    let title = '';
    let importance: ActivityImportance = 'medium';

    switch (action) {
      case 'create':
        title = `Nuevo show creado: ${show.artist || 'Sin artista'} - ${show.venue || 'Sin venue'}`;
        importance = 'high';
        break;
      case 'update':
        title = `Show actualizado: ${show.artist || 'Sin artista'}`;
        importance = 'low';
        break;
      case 'delete':
        title = `Show eliminado: ${show.artist || 'Sin artista'}`;
        importance = 'medium';
        break;
      case 'status_change':
        title = `Show ${show.artist}: estado cambió a ${show.status}`;
        importance = show.status === 'confirmed' ? 'high' : 'medium';
        break;
    }

    await this.track({
      organizationId,
      module: 'shows',
      action,
      userId: user.uid,
      userName: user.displayName || user.email || 'Usuario',
      userEmail: user.email || undefined,
      title,
      description: metadata?.description,
      importance,
      relatedId: show.id,
      relatedName: `${show.artist} - ${show.venue}`,
      metadata: {
        showDate: show.date,
        venue: show.venue,
        artist: show.artist,
        status: show.status,
        ...metadata,
      },
    });
  },

  /**
   * Helper: Tracking para Contacts
   */
  async trackContact(
    action: ActivityAction,
    contact: any,
    user: User,
    organizationId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    let title = '';
    const contactName = contact.name || 'Sin nombre';

    switch (action) {
      case 'create':
        title = `Nuevo contacto: ${contactName}`;
        break;
      case 'update':
        title = `Contacto actualizado: ${contactName}`;
        break;
      case 'delete':
        title = `Contacto eliminado: ${contactName}`;
        break;
    }

    await this.track({
      organizationId,
      module: 'contacts',
      action,
      userId: user.uid,
      userName: user.displayName || user.email || 'Usuario',
      userEmail: user.email || undefined,
      title,
      importance: 'medium',
      relatedId: contact.id,
      relatedName: contactName,
      metadata: {
        type: contact.type,
        email: contact.email,
        phone: contact.phone,
        ...metadata,
      },
    });
  },

  /**
   * Helper: Tracking para Contracts
   */
  async trackContract(
    action: ActivityAction,
    contract: any,
    user: User,
    organizationId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    let title = '';
    let importance: ActivityImportance = 'medium';

    switch (action) {
      case 'create':
        title = `Nuevo contrato: ${contract.title || 'Sin título'}`;
        importance = 'high';
        break;
      case 'update':
        title = `Contrato actualizado: ${contract.title}`;
        break;
      case 'status_change':
        title = `Contrato ${contract.title}: ${contract.status}`;
        importance = contract.status === 'signed' ? 'high' : 'medium';
        break;
    }

    await this.track({
      organizationId,
      module: 'contracts',
      action,
      userId: user.uid,
      userName: user.displayName || user.email || 'Usuario',
      userEmail: user.email || undefined,
      title,
      importance,
      relatedId: contract.id,
      relatedName: contract.title,
      metadata: {
        status: contract.status,
        amount: contract.amount,
        ...metadata,
      },
    });
  },

  /**
   * Helper: Tracking para Venues
   */
  async trackVenue(
    action: ActivityAction,
    venue: any,
    user: User,
    organizationId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    let title = '';
    const venueName = venue.name || 'Sin nombre';

    switch (action) {
      case 'create':
        title = `Nuevo venue: ${venueName}`;
        break;
      case 'update':
        title = `Venue actualizado: ${venueName}`;
        break;
      case 'delete':
        title = `Venue eliminado: ${venueName}`;
        break;
    }

    await this.track({
      organizationId,
      module: 'venues',
      action,
      userId: user.uid,
      userName: user.displayName || user.email || 'Usuario',
      userEmail: user.email || undefined,
      title,
      importance: 'low',
      relatedId: venue.id,
      relatedName: venueName,
      metadata: {
        city: venue.city,
        country: venue.country,
        capacity: venue.capacity,
        ...metadata,
      },
    });
  },

  /**
   * Helper: Tracking para Finance
   */
  async trackFinance(
    action: ActivityAction,
    transaction: any,
    user: User,
    organizationId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    let title = '';
    let importance: ActivityImportance = 'medium';

    switch (action) {
      case 'payment':
        title = `Pago registrado: ${transaction.amount} ${transaction.currency || '€'}`;
        importance = 'high';
        break;
      case 'create':
        title = `Nueva transacción: ${transaction.concept}`;
        break;
      case 'update':
        title = `Transacción actualizada: ${transaction.concept}`;
        break;
    }

    await this.track({
      organizationId,
      module: 'finance',
      action,
      userId: user.uid,
      userName: user.displayName || user.email || 'Usuario',
      userEmail: user.email || undefined,
      title,
      importance,
      relatedId: transaction.id,
      relatedName: transaction.concept,
      metadata: {
        amount: transaction.amount,
        currency: transaction.currency,
        type: transaction.type,
        ...metadata,
      },
    });
  },
};
