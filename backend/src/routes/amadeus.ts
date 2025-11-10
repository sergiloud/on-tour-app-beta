import { Router, Request, Response } from 'express';
import { Logger } from 'pino';
import { AmadeusService } from '../services/AmadeusService.js';
import {
  FlightSearchParamsSchema,
  BookingConfirmationSchema,
  FlightStatusSchema,
  GetAirportInfoSchema,
  GetAirlineInfoSchema,
} from '../schemas/integrations.schemas.js';
import { authMiddleware } from '../middleware/auth.js';

export function createAmadeusRouter(logger: Logger): Router {
  const router = Router();
  const amadeusService = new AmadeusService(logger);

  /**
   * POST /api/amadeus/search
   * Search for flights
   */
  router.post('/search', authMiddleware, async (req: Request, res: Response) => {
    try {
      const validated = FlightSearchParamsSchema.parse(req.body);

      // Check if we should use mock mode
      const useMock = process.env.AMADEUS_MOCK === 'true' || !process.env.AMADEUS_CLIENT_ID;

      let flights;
      if (useMock) {
        flights = await amadeusService.searchFlightsMock(validated);
      } else {
        flights = await amadeusService.searchFlights(validated);
      }

      res.json({
        success: true,
        data: flights,
        count: flights.length,
      });
    } catch (error) {
      logger.error({ error, body: req.body }, 'Flight search failed');

      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid search parameters',
          details: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Flight search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/amadeus/confirm
   * Confirm a flight offer (check availability and price)
   */
  router.post('/confirm', authMiddleware, async (req: Request, res: Response) => {
    try {
      const { flightOfferId } = req.body;

      if (!flightOfferId || typeof flightOfferId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Flight offer ID is required',
        });
      }

      const useMock = process.env.AMADEUS_MOCK === 'true' || !process.env.AMADEUS_CLIENT_ID;

      let priceCheck;
      if (useMock) {
        // Return mock confirmation
        priceCheck = {
          id: flightOfferId,
          source: 'GDS',
          instantTicketingRequired: false,
          nonHomogeneous: false,
          oneWay: true,
          lastTicketingDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          numberOfBookableSeats: 15,
          itineraries: [],
          price: {
            currency: 'USD',
            total: '250.00',
            base: '200.00',
            fee: '50.00',
          },
        };
      } else {
        priceCheck = await amadeusService.confirmFlightOffer(flightOfferId);
      }

      res.json({
        success: true,
        data: priceCheck,
      });
    } catch (error) {
      logger.error({ error, flightOfferId: req.body.flightOfferId }, 'Flight confirmation failed');

      res.status(500).json({
        success: false,
        error: 'Flight confirmation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/amadeus/book
   * Create a booking (requires full traveler details)
   */
  router.post('/book', authMiddleware, async (req: Request, res: Response) => {
    try {
      const validated = BookingConfirmationSchema.parse(req.body);

      const useMock = process.env.AMADEUS_MOCK === 'true' || !process.env.AMADEUS_CLIENT_ID;

      let booking;
      if (useMock) {
        // Return mock booking
        booking = {
          id: `BK${Date.now()}`,
          queuingOfficeId: 'MOCK',
          type: 'flight-order',
        };
      } else {
        // This would require actual booking request structure
        booking = await amadeusService.createBooking({
          flightOfferId: validated.flightOfferId,
          travelers: validated.travelers,
        } as any);
      }

      res.json({
        success: true,
        data: booking,
        message: 'Booking created successfully',
      });
    } catch (error) {
      logger.error({ error, body: req.body }, 'Booking creation failed');

      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid booking details',
          details: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Booking creation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/amadeus/status/:carrierCode/:flightNumber/:date
   * Get flight status
   */
  router.get('/status/:carrierCode/:flightNumber/:date', authMiddleware, async (req: Request, res: Response) => {
    try {
      const validated = FlightStatusSchema.parse({
        carrierCode: req.params.carrierCode,
        flightNumber: req.params.flightNumber,
        scheduledDepartureDate: req.params.date,
      });

      const useMock = process.env.AMADEUS_MOCK === 'true' || !process.env.AMADEUS_CLIENT_ID;

      let status;
      if (useMock) {
        // Return mock status
        status = [
          {
            flightStatus: 'SCHEDULED',
            departure: {
              iataCode: validated.carrierCode,
              scheduledTime: new Date().toISOString(),
              estimatedTime: new Date().toISOString(),
            },
            arrival: {
              iataCode: 'LAX',
              scheduledTime: new Date(Date.now() + 28800000).toISOString(),
              estimatedTime: new Date(Date.now() + 28800000).toISOString(),
            },
            carrierCode: validated.carrierCode,
            number: validated.flightNumber,
          },
        ];
      } else {
        status = await amadeusService.getFlightStatus(
          validated.carrierCode,
          validated.flightNumber,
          validated.scheduledDepartureDate
        );
      }

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      logger.error({ error, params: req.params }, 'Flight status retrieval failed');

      res.status(500).json({
        success: false,
        error: 'Flight status retrieval failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/amadeus/airport/:iataCode
   * Get airport information
   */
  router.get('/airport/:iataCode', authMiddleware, async (req: Request, res: Response) => {
    try {
      const validated = GetAirportInfoSchema.parse({
        iataCode: req.params.iataCode,
      });

      const useMock = process.env.AMADEUS_MOCK === 'true' || !process.env.AMADEUS_CLIENT_ID;

      let airport;
      if (useMock) {
        // Return mock airport info
        airport = {
          id: validated.iataCode,
          type: 'AIRPORT',
          name: `Airport ${validated.iataCode}`,
          iataCode: validated.iataCode,
          city: {
            iataCode: 'NYC',
            name: 'New York',
          },
          country: {
            iataCode: 'US',
            name: 'United States',
          },
          timezone: 'America/New_York',
        };
      } else {
        airport = await amadeusService.getAirportInfo(validated.iataCode);
      }

      res.json({
        success: true,
        data: airport,
      });
    } catch (error) {
      logger.error({ error, iataCode: req.params.iataCode }, 'Airport info retrieval failed');

      res.status(500).json({
        success: false,
        error: 'Airport info retrieval failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/amadeus/airline/:carrierCode
   * Get airline information
   */
  router.get('/airline/:carrierCode', authMiddleware, async (req: Request, res: Response) => {
    try {
      const validated = GetAirlineInfoSchema.parse({
        carrierCode: req.params.carrierCode,
      });

      const useMock = process.env.AMADEUS_MOCK === 'true' || !process.env.AMADEUS_CLIENT_ID;

      let airline;
      if (useMock) {
        // Return mock airline info
        airline = {
          iataCode: validated.carrierCode,
          icaoCode: `IC${validated.carrierCode}`,
          businessName: `Airline ${validated.carrierCode}`,
          commonName: `${validated.carrierCode} Airlines`,
        };
      } else {
        airline = await amadeusService.getAirlineInfo(validated.carrierCode);
      }

      res.json({
        success: true,
        data: airline,
      });
    } catch (error) {
      logger.error({ error, carrierCode: req.params.carrierCode }, 'Airline info retrieval failed');

      res.status(500).json({
        success: false,
        error: 'Airline info retrieval failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/amadeus/seat-availability/:flightOfferId
   * Get seat availability for a flight
   */
  router.post('/seat-availability/:flightOfferId', authMiddleware, async (req: Request, res: Response) => {
    try {
      const { flightOfferId } = req.params;

      const useMock = process.env.AMADEUS_MOCK === 'true' || !process.env.AMADEUS_CLIENT_ID;

      let seats;
      if (useMock) {
        // Return mock seats
        seats = {
          flightOfferId,
          available: Math.floor(Math.random() * 50) + 10,
          total: 150,
        };
      } else {
        const availableSeats = await amadeusService.getSeatAvailability(flightOfferId);
        seats = {
          flightOfferId,
          available: availableSeats,
          total: 150,
        };
      }

      res.json({
        success: true,
        data: seats,
      });
    } catch (error) {
      logger.error({ error, flightOfferId: req.params.flightOfferId }, 'Seat availability retrieval failed');

      res.status(500).json({
        success: false,
        error: 'Seat availability retrieval failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}
