import type { CalEvent } from '../components/calendar/types';

/**
 * Detecta riesgos potenciales en eventos de viaje
 */
export function detectTravelRisks(
  travelEvent: CalEvent,
  allEvents: CalEvent[],
  shows: Array<{ id: string; date: string; city: string; country: string; status: string }>
): 'overlap' | 'isolated' | 'pending' | null {
  const eventDate = new Date(travelEvent.date);
  const dayEvents = allEvents.filter(e => e.date === travelEvent.date);

  // Riesgo 1: Superposición con shows en el mismo día
  const hasShowOnSameDay = dayEvents.some(e => e.kind === 'show');
  if (hasShowOnSameDay) {
    return 'overlap';
  }

  // Riesgo 2: Viaje aislado (sin shows en ±2 días)
  const nearbyDates = [-2, -1, 1, 2].map(offset => {
    const d = new Date(eventDate);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  });

  const hasNearbyShows = shows.some(show =>
    nearbyDates.includes(show.date) || show.date === travelEvent.date
  );

  if (!hasNearbyShows) {
    return 'isolated';
  }

  // Riesgo 3: Viaje pendiente sin confirmación
  if (travelEvent.status === 'pending') {
    return 'pending';
  }

  return null;
}

/**
 * Obtiene el icono y tooltip para un riesgo de viaje
 */
export function getTravelRiskIndicator(risk: 'overlap' | 'isolated' | 'pending' | null): {
  icon: string;
  tooltip: string;
  color: string;
} | null {
  switch (risk) {
    case 'overlap':
      return {
        icon: '⚠️',
        tooltip: 'Possible scheduling conflict with show on same day',
        color: 'text-amber-400'
      };
    case 'isolated':
      return {
        icon: '🚫',
        tooltip: 'Travel without nearby shows - check itinerary',
        color: 'text-red-400'
      };
    case 'pending':
      return {
        icon: '⏳',
        tooltip: 'Pending travel booking - confirm details',
        color: 'text-blue-400'
      };
    default:
      return null;
  }
}