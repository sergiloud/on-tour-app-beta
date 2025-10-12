/**
 * Representa un único evento en el itinerario de un día.
 * Ej: "Prueba de sonido", "Vuelo", "Concierto".
 */
export type ItineraryEvent = {
  id: string; // Identificador único del evento (ej: 'evt_123')
  time: string; // Hora en formato ISO 8601 (ej: "2024-08-15T11:30:00.000Z")
  title: string; // Título del evento (ej: "Prueba de Sonido")
  location?: string; // Ubicación opcional (ej: "Main Stage, Arena")
  description?: string; // Detalles adicionales opcionales.
};

/**
 * Agrupa todos los eventos de un día específico.
 */
export type DailyItinerary = {
  date: string; // Fecha en formato ISO 8601 (ej: "2024-08-15")
  city: string; // Ciudad principal para ese día.
  events: ItineraryEvent[]; // Lista de eventos para ese día, ordenados cronológicamente.
};

/**
 * La estructura de datos completa para el widget "Hoy y Mañana".
 * La API devolverá un objeto con esta forma.
 */
export type ItineraryWidgetData = {
  today: DailyItinerary;
  tomorrow: DailyItinerary;
};
