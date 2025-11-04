/**
 * API Services Barrel Export
 * Centralizado para importaciones fáciles en toda la aplicación
 */

export { apiClient, type ApiResponse, type ApiErrorResponse } from './client';

export { showsService, type Show, type ShowFilters, type ShowStats } from './services/shows';
export { financeService, type FinanceRecord, type FinanceReport } from './services/finance';
export { travelService, type TravelItinerary, type Accommodation, type Transportation, type TravelFilters } from './services/travel';
export {
  amadeusService,
  type FlightOffer,
  type FlightItinerary as AmadeusFlightItinerary,
  type FlightSegment,
  type AirportInfo,
  type FlightSearchRequest,
  type FlightSearchResponse,
  type SeatMap
} from './services/amadeus';
export {
  stripeService,
  type PaymentIntent,
  type Charge,
  type Subscription,
  type SubscriptionItem,
  type PaymentIntentRequest,
  type SubscriptionCreateRequest
} from './services/stripe';
export {
  emailService,
  type EmailTemplate,
  type EmailRecipient,
  type EmailAttachment,
  type EmailRequest,
  type EmailLog,
  type EmailStats,
  type EmailFilters
} from './services/email';
