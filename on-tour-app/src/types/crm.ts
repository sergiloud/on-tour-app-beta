/**
 * CRM Types - Gestión de Contactos Profesionales
 * Tipos de datos para el módulo de CRM de On Tour App
 */

export type ContactType =
  | 'promoter'      // Promotor
  | 'venue_manager' // Manager de sala
  | 'press_agent'   // Agente de prensa
  | 'booking_agent' // Agente de booking
  | 'label_rep'     // Representante de sello
  | 'festival_org'  // Organizador de festival
  | 'radio_dj'      // DJ de radio
  | 'journalist'    // Periodista
  | 'photographer'  // Fotógrafo
  | 'videographer'  // Videógrafo
  | 'sound_tech'    // Técnico de sonido
  | 'other';        // Otro

export type ContactPriority = 'high' | 'medium' | 'low';

export type ContactStatus = 'active' | 'inactive' | 'pending';

export interface ContactNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy?: string;
}

export interface ContactInteraction {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'message' | 'other';
  subject?: string;
  notes: string;
  date: string;
  createdAt: string;
}

export interface Contact {
  id: string;

  // Información básica
  firstName: string;
  lastName: string;
  company?: string;
  position?: string;
  type: ContactType;

  // Datos de contacto
  email?: string;
  phone?: string;
  website?: string;

  // Redes sociales
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  facebook?: string;

  // Ubicación
  city?: string;
  country?: string;
  timezone?: string;

  // Clasificación
  priority: ContactPriority;
  status: ContactStatus;
  tags: string[];

  // Relaciones
  venues?: string[];      // IDs de salas asociadas
  shows?: string[];       // IDs de shows asociados

  // Notas e interacciones
  notes: ContactNote[];
  interactions: ContactInteraction[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;

  // Campos personalizados
  customFields?: Record<string, string | number | boolean>;
}

export interface ContactFilters {
  search: string;
  type: ContactType | 'all';
  priority: ContactPriority | 'all';
  status: ContactStatus | 'all';
  tags: string[];
  city?: string;
  country?: string;
}

export interface ContactStats {
  total: number;
  byType: Record<ContactType, number>;
  byPriority: Record<ContactPriority, number>;
  byStatus: Record<ContactStatus, number>;
  recentInteractions: number;
}

// Etiquetas predefinidas comunes
export const COMMON_TAGS = [
  'VIP',
  'Influencer',
  'Confiable',
  'Nuevo',
  'Colaborador frecuente',
  'Internacional',
  'Local',
  'Premium',
  'Económico',
] as const;

// Labels de UI para los tipos de contacto
export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  promoter: 'Promotor',
  venue_manager: 'Manager de Sala',
  press_agent: 'Agente de Prensa',
  booking_agent: 'Agente de Booking',
  label_rep: 'Rep. de Sello',
  festival_org: 'Org. Festival',
  radio_dj: 'DJ de Radio',
  journalist: 'Periodista',
  photographer: 'Fotógrafo',
  videographer: 'Videógrafo',
  sound_tech: 'Téc. Sonido',
  other: 'Otro',
};

// Iconos sugeridos para cada tipo (usando lucide-react)
export const CONTACT_TYPE_ICONS: Record<ContactType, string> = {
  promoter: 'Megaphone',
  venue_manager: 'Building',
  press_agent: 'Newspaper',
  booking_agent: 'Calendar',
  label_rep: 'Disc',
  festival_org: 'Music',
  radio_dj: 'Radio',
  journalist: 'PenTool',
  photographer: 'Camera',
  videographer: 'Video',
  sound_tech: 'Headphones',
  other: 'User',
};
