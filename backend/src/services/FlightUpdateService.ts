import { webSocketService, FlightUpdate } from './WebSocketService.js';
import { logger } from '../utils/logger.js';

/**
 * Real-time Flight Update Service
 * Monitors flights and broadcasts updates to subscribed clients
 */

export interface FlightTrackingData {
  flightId: string;
  carrierCode: string;
  flightNumber: string;
  departureCity: string;
  arrivalCity: string;
  scheduledDeparture: Date;
  scheduledArrival: Date;
}

class FlightUpdateService {
  private activeFlights: Map<string, FlightTrackingData> = new Map();
  private flightUpdateIntervals: Map<string, NodeJS.Timer> = new Map();
  private statusHistory: Map<string, FlightUpdate[]> = new Map();

  /**
   * Start tracking a flight
   */
  public startFlightTracking(flight: FlightTrackingData): void {
    const flightId = flight.flightId;
    this.activeFlights.set(flightId, flight);

    // Start polling for updates every 30 seconds
    const interval = setInterval(() => {
      this.checkFlightStatus(flightId);
    }, 30000);

    this.flightUpdateIntervals.set(flightId, interval);
    logger.info(`Started tracking flight: ${flight.carrierCode}${flight.flightNumber}`);
  }

  /**
   * Stop tracking a flight
   */
  public stopFlightTracking(flightId: string): void {
    const interval = this.flightUpdateIntervals.get(flightId);
    if (interval) {
      clearInterval(interval as NodeJS.Timeout);
      this.flightUpdateIntervals.delete(flightId);
    }
    this.activeFlights.delete(flightId);
    logger.info(`Stopped tracking flight: ${flightId}`);
  }

  /**
   * Check flight status and broadcast updates
   */
  private checkFlightStatus(flightId: string): void {
    const flight = this.activeFlights.get(flightId);
    if (!flight) return;

    // Simulate flight status updates (in production, call real API)
    const update = this.generateFlightUpdate(flight);

    // Broadcast to all subscribed clients
    webSocketService.updateFlight(update);

    // Store in history
    if (!this.statusHistory.has(flightId)) {
      this.statusHistory.set(flightId, []);
    }
    this.statusHistory.get(flightId)!.push(update);
  }

  /**
   * Generate flight update (mock implementation)
   */
  private generateFlightUpdate(flight: FlightTrackingData): FlightUpdate {
    const now = new Date().getTime();
    const scheduledDeparture = new Date(flight.scheduledDeparture).getTime();

    // Determine flight status based on time
    let status: 'on-time' | 'delayed' | 'cancelled' | 'boarding' | 'departed' | 'arrived';
    let delay = 0;
    let gate: string | undefined;
    let terminal: string | undefined;
    let arrivalTime: Date | undefined;

    if (now < scheduledDeparture - 3600000) {
      // More than 1 hour before departure
      status = 'on-time';
      gate = Math.floor(Math.random() * 50) + 'A';
      terminal = 'T' + (Math.floor(Math.random() * 4) + 1);
    } else if (now < scheduledDeparture - 600000) {
      // Within 10 minutes of departure
      status = 'boarding';
      gate = Math.floor(Math.random() * 50) + 'A';
      terminal = 'T' + (Math.floor(Math.random() * 4) + 1);
    } else if (now < scheduledDeparture) {
      // Close to departure
      const isDelayed = Math.random() > 0.7;
      status = isDelayed ? 'delayed' : 'on-time';
      delay = isDelayed ? Math.floor(Math.random() * 60) + 15 : 0;
      gate = Math.floor(Math.random() * 50) + 'A';
      terminal = 'T' + (Math.floor(Math.random() * 4) + 1);
    } else if (now < scheduledDeparture + 600000) {
      // Just departed
      status = 'departed';
      gate = undefined;
    } else {
      // Arrived
      status = 'arrived';
      const flightDuration = Math.floor((new Date(flight.scheduledArrival).getTime() - scheduledDeparture) / 60000);
      arrivalTime = new Date(now + flightDuration * 60000);
    }

    return {
      flightId: flight.flightId,
      carrierCode: flight.carrierCode,
      flightNumber: flight.flightNumber,
      status,
      departureTime: new Date(scheduledDeparture),
      arrivalTime: arrivalTime || new Date(flight.scheduledArrival),
      delay,
      gate,
      terminal,
      timestamp: new Date()
    };
  }

  /**
   * Get flight status history
   */
  public getFlightHistory(flightId: string): FlightUpdate[] {
    return this.statusHistory.get(flightId) || [];
  }

  /**
   * Manually trigger flight update (for testing/admin)
   */
  public manualFlightUpdate(flightId: string, update: Partial<FlightUpdate>): void {
    const flight = this.activeFlights.get(flightId);
    if (!flight) {
      logger.warn(`Flight not found: ${flightId}`);
      return;
    }

    const flightUpdate: FlightUpdate = {
      flightId,
      carrierCode: flight.carrierCode,
      flightNumber: flight.flightNumber,
      departureTime: new Date(flight.scheduledDeparture),
      timestamp: new Date(),
      ...update,
      status: update.status || 'on-time'
    };

    webSocketService.updateFlight(flightUpdate);

    if (!this.statusHistory.has(flightId)) {
      this.statusHistory.set(flightId, []);
    }
    this.statusHistory.get(flightId)!.push(flightUpdate);

    logger.info(`Manual flight update: ${flightId} - ${flightUpdate.status}`);
  }

  /**
   * Get active flights
   */
  public getActiveFlights(): FlightTrackingData[] {
    return Array.from(this.activeFlights.values());
  }

  /**
   * Get flight count
   */
  public getFlightCount(): number {
    return this.activeFlights.size;
  }
}

export const flightUpdateService = new FlightUpdateService();
