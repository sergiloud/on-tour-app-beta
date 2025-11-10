import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

export const travelRouter = Router();

const flightSearchSchema = z.object({
  departure: z.string().min(3).max(3),
  arrival: z.string().min(3).max(3),
  departureDate: z.string().datetime(),
  returnDate: z.string().datetime().optional(),
  passengers: z.number().int().min(1).max(9).optional(),
  showId: z.string().optional(),
});

const itinerarySchema = z.object({
  showId: z.string(),
  tripName: z.string().min(1).max(255),
  flights: z.object({
    id: z.string(),
    departure: z.string(),
    arrival: z.string(),
    departureTime: z.string(),
    arrivalTime: z.string(),
    price: z.number().positive(),
  }).array().min(1),
  hotel: z.object({
    name: z.string(),
    checkIn: z.string().datetime(),
    checkOut: z.string().datetime(),
    price: z.number().positive(),
  }).optional(),
  notes: z.string().optional(),
});

// POST /api/travel/search-flights - Search for flights
travelRouter.post('/search-flights', async (req: Request, res: Response) => {
  try {
    const validated = flightSearchSchema.parse(req.body);

    // Mock flight search (will integrate with Amadeus API later)
    const flights = [
      {
        id: 'flight_1',
        airline: 'United Airlines',
        departure: validated.departure,
        arrival: validated.arrival,
        departureTime: new Date(validated.departureDate).toISOString(),
        arrivalTime: new Date(new Date(validated.departureDate).getTime() + 5 * 3600000).toISOString(),
        duration: '5h 00m',
        stops: 0,
        price: 450,
        currency: 'USD',
      },
      {
        id: 'flight_2',
        airline: 'Delta Airlines',
        departure: validated.departure,
        arrival: validated.arrival,
        departureTime: new Date(new Date(validated.departureDate).getTime() + 3600000).toISOString(),
        arrivalTime: new Date(new Date(validated.departureDate).getTime() + 9 * 3600000).toISOString(),
        duration: '7h 30m',
        stops: 1,
        price: 380,
        currency: 'USD',
      },
    ];

    res.json({
      data: flights,
      search: {
        departure: validated.departure,
        arrival: validated.arrival,
        departureDate: validated.departureDate,
        passengers: validated.passengers || 1,
      },
    });
  } catch (error) {
    logger.error(error, 'Failed to search flights');
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
      return;
    }
    res.status(500).json({ error: 'Failed to search flights' });
  }
});

// POST /api/travel/itineraries - Create a travel itinerary
travelRouter.post('/itineraries', async (req: Request, res: Response) => {
  try {
    const validated = itinerarySchema.parse(req.body);

    const itinerary = {
      id: `itin_${Date.now()}`,
      organizationId: req.organizationId!,
      ...validated,
      status: 'draft',
      totalCost: validated.flights.reduce((sum, f) => sum + f.price, 0) +
        (validated.hotel?.price || 0),
      createdAt: new Date().toISOString(),
      createdBy: req.user!.userId,
    };

    res.status(201).json({ data: itinerary });
  } catch (error) {
    logger.error(error, 'Failed to create itinerary');
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
      return;
    }
    res.status(500).json({ error: 'Failed to create itinerary' });
  }
});

// GET /api/travel/itineraries - List itineraries
travelRouter.get('/itineraries', async (req: Request, res: Response) => {
  try {
    const showId = (req.query.showId as string) || undefined;

    // This will be populated from database later
    const itineraries: any[] = [];

    res.json({
      data: itineraries,
      pagination: { total: 0, limit: 50, offset: 0 },
    });
  } catch (error) {
    logger.error(error, 'Failed to list itineraries');
    res.status(500).json({ error: 'Failed to list itineraries' });
  }
});

// GET /api/travel/itineraries/:id - Get an itinerary
travelRouter.get('/itineraries/:id', async (req: Request, res: Response) => {
  try {
    // This will be populated from database later
    res.status(404).json({ error: 'Itinerary not found' });
  } catch (error) {
    logger.error(error, 'Failed to get itinerary');
    res.status(500).json({ error: 'Failed to get itinerary' });
  }
});
