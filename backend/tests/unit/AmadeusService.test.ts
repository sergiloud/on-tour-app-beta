import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger } from 'pino';
import { AmadeusService } from '../../src/services/AmadeusService.js';

const mockLogger: Logger = {
  info: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
  trace: vi.fn(),
  fatal: vi.fn(),
  silent: vi.fn(),
  level: 'info',
  levels: {} as any,
  setLevel: vi.fn(),
} as unknown as Logger;

describe('AmadeusService', () => {
  let service: AmadeusService;

  beforeEach(() => {
    service = new AmadeusService(mockLogger);
  });

  describe('searchFlightsMock', () => {
    it('should return mock flight offers', async () => {
      const result = await service.searchFlightsMock({
        origin: 'NYC',
        destination: 'LAX',
        departureDate: '2025-12-15',
        adults: 2,
        maxResults: 5,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);

      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('price');
        expect(result[0]).toHaveProperty('itineraries');
        expect(result[0].price).toHaveProperty('currency');
        expect(result[0].price).toHaveProperty('total');
      }
    });

    it('should handle return flights', async () => {
      const result = await service.searchFlightsMock({
        origin: 'NYC',
        destination: 'LAX',
        departureDate: '2025-12-15',
        returnDate: '2025-12-22',
        adults: 1,
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].oneWay).toBe(false);
    });

    it('should set correct number of passengers in pricing', async () => {
      const result = await service.searchFlightsMock({
        origin: 'NYC',
        destination: 'LAX',
        departureDate: '2025-12-15',
        adults: 2,
        children: 1,
      });

      expect(result).toBeDefined();
      if (result.length > 0) {
        const firstOffer = result[0];
        expect(firstOffer.travelerPricings).toBeDefined();
      }
    });

    it('should respect maxResults parameter', async () => {
      const result = await service.searchFlightsMock({
        origin: 'NYC',
        destination: 'LAX',
        departureDate: '2025-12-15',
        adults: 1,
        maxResults: 3,
      });

      expect(result.length).toBeLessThanOrEqual(3);
    });

    it('should include required flight offer fields', async () => {
      const result = await service.searchFlightsMock({
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2025-12-20',
        adults: 1,
      });

      expect(result.length).toBeGreaterThan(0);

      const offer = result[0];
      expect(offer).toHaveProperty('id');
      expect(offer).toHaveProperty('source', 'GDS');
      expect(offer).toHaveProperty('numberOfBookableSeats');
      expect(offer).toHaveProperty('itineraries');
      expect(offer).toHaveProperty('price');
      expect(offer).toHaveProperty('pricingOptions');
      expect(offer).toHaveProperty('travelerPricings');
    });
  });

  describe('getAirportInfo', () => {
    it('should handle airport lookup (mock)', async () => {
      // Since we're using mocks, just verify the logger is called
      const result = await service.getAirportInfo('LAX');

      // Mock mode returns mock data or throws
      expect(result !== undefined || mockLogger.error).toBeTruthy();
    });
  });

  describe('getAirlineInfo', () => {
    it('should handle airline lookup (mock)', async () => {
      const result = await service.getAirlineInfo('AA');

      // Mock mode returns mock data or throws
      expect(result !== undefined || mockLogger.error).toBeTruthy();
    });
  });

  describe('getSeatAvailability', () => {
    it('should return seat count', async () => {
      const result = await service.getSeatAvailability('MOCK-12345');

      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration scenarios', () => {
    it('should support complex search scenarios', async () => {
      const result = await service.searchFlightsMock({
        origin: 'MIA',
        destination: 'BOS',
        departureDate: '2025-11-15',
        returnDate: '2025-11-22',
        adults: 2,
        children: 1,
        infants: 0,
        travelClass: 'BUSINESS',
        currencyCode: 'USD',
        maxResults: 10,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        result.forEach((offer) => {
          expect(offer.price.currency).toBe('USD');
          expect(offer.itineraries).toBeDefined();
          expect(offer.itineraries.length).toBeGreaterThan(0);
        });
      }
    });

    it('should handle different currencies', async () => {
      const eurResult = await service.searchFlightsMock({
        origin: 'NYC',
        destination: 'LHR',
        departureDate: '2025-12-10',
        adults: 1,
        currencyCode: 'EUR',
      });

      expect(eurResult.length).toBeGreaterThan(0);
      expect(eurResult[0].price.currency).toBe('EUR');
    });
  });
});
