/**
 * Test Data Fixtures for E2E Tests
 *
 * Provides realistic test data for E2E scenarios.
 */

export const testShows = {
  basic: {
    name: 'Test Show 001',
    date: '2025-12-15',
    venue: 'Test Venue 1',
    city: 'New York',
    status: 'confirmed' as const,
  },
  pending: {
    name: 'Pending Show',
    date: '2025-12-20',
    venue: 'Test Venue 2',
    city: 'Los Angeles',
    status: 'pending' as const,
  },
  archived: {
    name: 'Archived Show',
    date: '2025-10-01',
    venue: 'Test Venue 3',
    city: 'Chicago',
    status: 'archived' as const,
  },
};

export const testFinancials = {
  simple: {
    ticketPrice: 100,
    ticketsSold: 500,
    fees: 50,
    commission: 25,
    expectedNet: 20000, // (100 * 500) - (50 + 25)
  },
  withDeductions: {
    ticketPrice: 75,
    ticketsSold: 1000,
    fees: 150,
    commission: 100,
    withholding: 500,
    expectedNet: 72250, // (75 * 1000) - (150 + 100 + 500)
  },
  multiCurrency: {
    ticketPriceEUR: 50,
    ticketPriceUSD: 55,
    feeEUR: 25,
    exchangeRate: 1.1,
  },
};

export const testFilters = {
  dateRange: {
    from: '2025-11-01',
    to: '2025-12-31',
  },
  statusFilters: ['confirmed', 'pending'],
  searchTerm: 'Test Show',
};

export const testAgencies = {
  booking: {
    name: 'Test Booking Agency',
    type: 'booking' as const,
    commission: 15,
  },
  management: {
    name: 'Test Management Company',
    type: 'management' as const,
    commission: 20,
  },
};

/**
 * Generate a unique show name for isolated tests
 */
export function generateShowName(prefix = 'E2E Test Show'): string {
  const timestamp = new Date().getTime();
  return `${prefix} ${timestamp}`;
}

/**
 * Generate test data for bulk operations
 */
export function generateTestShows(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    name: `Test Show ${String(i + 1).padStart(3, '0')}`,
    date: new Date(2025, 11, 15 + i).toISOString().split('T')[0],
    venue: `Test Venue ${i + 1}`,
    city: ['New York', 'Los Angeles', 'Chicago', 'Houston'][i % 4],
    status: ['confirmed', 'pending', 'offer', 'archived'][i % 4],
  }));
}
