import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { wasmFinancialEngine, createFinancialEngine } from '../lib/wasmFinancialEngine';
import type { Show } from '../types/finance';
import './__mocks__/wasm-and-pwa';

// Mock data for testing
const mockShows: Show[] = [
  {
    id: 'show1',
    date: '2024-01-15',
    venue: { name: 'Arena A', capacity: 5000, location: 'City A' },
    revenue: 75000,
    expenses: 25000,
    ticketsSold: 4500,
    status: 'scheduled'
  },
  {
    id: 'show2', 
    date: '2024-01-20',
    venue: { name: 'Hall B', capacity: 3000, location: 'City B' },
    revenue: 45000,
    expenses: 15000,
    ticketsSold: 2800,
    status: 'scheduled'
  },
  {
    id: 'show3',
    date: '2024-01-25', 
    venue: { name: 'Theater C', capacity: 1500, location: 'City C' },
    revenue: 22500,
    expenses: 8000,
    ticketsSold: 1450,
    status: 'scheduled'
  }
];

describe('WASM Financial Engine', () => {
  beforeEach(() => {
    // Reset any state before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const engine = wasmFinancialEngine;
      
      // Should not throw
      await expect(engine.initialize()).resolves.not.toThrow();
      
      // Should be marked as initialized
      expect(engine.isInitialized()).toBe(true);
    });

    it('should handle multiple initialization calls gracefully', async () => {
      const engine = wasmFinancialEngine;
      
      // Initialize multiple times
      await engine.initialize();
      await engine.initialize();
      await engine.initialize();
      
      expect(engine.isInitialized()).toBe(true);
    });

    it('should create financial engine with factory method', async () => {
      const engine = await createFinancialEngine();
      expect(engine).toBeDefined();
      expect(typeof engine.calculateMetrics).toBe('function');
    });
  });

  describe('Financial Metrics Calculation', () => {
    it('should calculate comprehensive financial metrics', async () => {
      const engine = wasmFinancialEngine;
      await engine.initialize();
      
      const metrics = await engine.calculateMetrics(mockShows);
      
      // Verify structure
      expect(metrics).toHaveProperty('totalRevenue');
      expect(metrics).toHaveProperty('totalExpenses');
      expect(metrics).toHaveProperty('netProfit');
      expect(metrics).toHaveProperty('profitMargin');
      expect(metrics).toHaveProperty('averageTicketPrice');
      expect(metrics).toHaveProperty('utilizationRate');
      expect(metrics).toHaveProperty('revenuePerShow');
      expect(metrics).toHaveProperty('breakEvenTickets');
      
      // Verify calculations (using mock data expectations)
      expect(metrics.totalRevenue).toBe(142500); // 75000 + 45000 + 22500
      expect(metrics.totalExpenses).toBe(48000); // 25000 + 15000 + 8000
      expect(metrics.netProfit).toBe(94500); // 142500 - 48000
      expect(metrics.profitMargin).toBeCloseTo(66.32, 1); // (94500/142500) * 100
      expect(metrics.revenuePerShow).toBe(47500); // 142500 / 3
      
      // Verify utilization rate calculation
      const expectedUtilization = ((4500 + 2800 + 1450) / (5000 + 3000 + 1500)) * 100;
      expect(metrics.utilizationRate).toBeCloseTo(expectedUtilization, 1);
    });

    it('should handle empty shows array', async () => {
      const engine = wasmFinancialEngine;
      await engine.initialize();
      
      const metrics = await engine.calculateMetrics([]);
      
      expect(metrics.totalRevenue).toBe(0);
      expect(metrics.totalExpenses).toBe(0);
      expect(metrics.netProfit).toBe(0);
      expect(metrics.profitMargin).toBe(0);
    });

    it('should handle shows with missing data', async () => {
      const engine = wasmFinancialEngine;
      await engine.initialize();
      
      const incompleteShows: Show[] = [
        {
          id: 'incomplete',
          date: '2024-01-30',
          venue: { name: 'Venue', capacity: 100, location: 'Location' },
          revenue: 0,
          expenses: 0,
          ticketsSold: 0,
          status: 'scheduled'
        }
      ];
      
      // Should not throw and should handle missing values as 0
      const metrics = await engine.calculateMetrics(incompleteShows);
      expect(metrics).toBeDefined();
      expect(metrics.totalRevenue).toBe(0);
      expect(metrics.totalExpenses).toBe(0);
    });

    it('should validate calculation accuracy with edge cases', async () => {
      const engine = wasmFinancialEngine;
      await engine.initialize();
      
      const edgeCaseShows: Show[] = [
        {
          id: 'edge1',
          date: '2024-01-01',
          venue: { name: 'Small Venue', capacity: 1, location: 'Location' },
          revenue: 0.01, // Very small revenue
          expenses: 0.005, // Very small expenses
          ticketsSold: 1,
          status: 'scheduled'
        }
      ];
      
      const metrics = await engine.calculateMetrics(edgeCaseShows);
      
      expect(metrics.totalRevenue).toBe(0.01);
      expect(metrics.totalExpenses).toBe(0.005);
      expect(metrics.netProfit).toBe(0.005);
      expect(metrics.utilizationRate).toBe(100); // 1/1 * 100
    });
  });

  describe('Revenue Forecasting', () => {
    it('should generate revenue forecast', async () => {
      const engine = wasmFinancialEngine;
      await engine.initialize();
      
      const forecast = await engine.forecastRevenue(mockShows, 6);
      
      expect(forecast).toHaveProperty('projectedRevenue');
      expect(forecast).toHaveProperty('projectedExpenses');
      expect(forecast).toHaveProperty('projectedProfit');
      expect(forecast).toHaveProperty('confidenceInterval');
      expect(forecast).toHaveProperty('trendSlope');
      expect(forecast).toHaveProperty('seasonalityFactor');
      
      // Verify numeric properties
      expect(typeof forecast.projectedRevenue).toBe('number');
      expect(typeof forecast.projectedExpenses).toBe('number');
      expect(typeof forecast.projectedProfit).toBe('number');
      expect(Array.isArray(forecast.confidenceInterval)).toBe(true);
      expect(forecast.confidenceInterval).toHaveLength(2);
    });

    it('should handle different forecast periods', async () => {
      const engine = wasmFinancialEngine;
      await engine.initialize();
      
      const shortTerm = await engine.forecastRevenue(mockShows, 1);
      const longTerm = await engine.forecastRevenue(mockShows, 12);
      
      expect(shortTerm.projectedRevenue).toBeDefined();
      expect(longTerm.projectedRevenue).toBeDefined();
      
      // Generally, longer term forecasts should have wider confidence intervals
      const shortConfidenceRange = shortTerm.confidenceInterval[1] - shortTerm.confidenceInterval[0];
      const longConfidenceRange = longTerm.confidenceInterval[1] - longTerm.confidenceInterval[0];
      expect(longConfidenceRange).toBeGreaterThanOrEqual(shortConfidenceRange);
    });

    it('should handle zero months forecast', async () => {
      const engine = wasmFinancialEngine;
      await engine.initialize();
      
      await expect(engine.forecastRevenue(mockShows, 0)).resolves.toBeDefined();
    });
  });

  describe('Scenario Analysis', () => {
    it('should perform comprehensive scenario analysis', async () => {
      const engine = wasmFinancialEngine;
      await engine.initialize();
      
      // Scenario: 10% price increase, 5% capacity increase, 15% expense increase
      const scenario = await engine.scenarioAnalysis(mockShows, 0.10, 0.05, 0.15);
      
      expect(scenario).toHaveProperty('currentRevenue');
      expect(scenario).toHaveProperty('currentExpenses');
      expect(scenario).toHaveProperty('currentProfit');
      expect(scenario).toHaveProperty('projectedRevenue');
      expect(scenario).toHaveProperty('projectedExpenses');
      expect(scenario).toHaveProperty('projectedProfit');
      expect(scenario).toHaveProperty('profitChangePercent');
      expect(scenario).toHaveProperty('newTicketPrice');
      expect(scenario).toHaveProperty('projectedTickets');
      
      // Verify current values match our mock data
      expect(scenario.currentRevenue).toBe(142500);
      expect(scenario.currentExpenses).toBe(48000);
      expect(scenario.currentProfit).toBe(94500);
      
      // With 15% expense increase, projected expenses should be higher
      expect(scenario.projectedExpenses).toBeGreaterThan(scenario.currentExpenses);
    });

    it('should handle negative scenario changes', async () => {
      const engine = wasmFinancialEngine;
      await engine.initialize();
      
      // Scenario: 20% price decrease, 10% capacity decrease, 25% expense reduction
      const scenario = await engine.scenarioAnalysis(mockShows, -0.20, -0.10, -0.25);
      
      expect(scenario.projectedExpenses).toBeLessThan(scenario.currentExpenses);
      expect(scenario.profitChangePercent).toBeDefined();
      expect(typeof scenario.profitChangePercent).toBe('number');
    });

    it('should handle extreme scenario values', async () => {
      const engine = wasmFinancialEngine;
      await engine.initialize();
      
      // Extreme scenario: 200% changes
      const extremeScenario = await engine.scenarioAnalysis(mockShows, 2.0, 2.0, 2.0);
      
      expect(extremeScenario.projectedRevenue).toBeGreaterThan(extremeScenario.currentRevenue);
      expect(extremeScenario.projectedExpenses).toBeGreaterThan(extremeScenario.currentExpenses);
    });
  });

  describe('Engine Statistics & Utilities', () => {
    it('should provide engine statistics', async () => {
      const engine = wasmFinancialEngine;
      await engine.initialize();
      
      // Load some data first
      await engine.calculateMetrics(mockShows);
      
      const stats = await engine.getEngineStats();
      
      expect(stats).toHaveProperty('showsLoaded');
      expect(stats).toHaveProperty('engineVersion');
      expect(typeof stats.showsLoaded).toBe('number');
      expect(typeof stats.engineVersion).toBe('string');
      expect(stats.showsLoaded).toBe(3); // mockShows.length
    });

    it('should track shows loaded correctly', async () => {
      const engine = wasmFinancialEngine;
      await engine.initialize();
      
      // Load different sized datasets
      await engine.calculateMetrics([mockShows[0]]);
      let stats = await engine.getEngineStats();
      expect(stats.showsLoaded).toBe(1);
      
      await engine.calculateMetrics(mockShows);
      stats = await engine.getEngineStats();
      expect(stats.showsLoaded).toBe(3);
    });
  });

  describe('Error Handling & Robustness', () => {
    it('should handle initialization state correctly', async () => {
      const engine = wasmFinancialEngine;
      
      // Ensure engine is initialized
      await engine.initialize();
      
      // Test that initialized engine works properly
      await expect(engine.calculateMetrics([])).resolves.toBeDefined();
      expect(engine.isInitialized()).toBe(true);
    });

    it('should handle malformed show data gracefully', async () => {
      const engine = wasmFinancialEngine;
      await engine.initialize();
      
      const malformedShows = [
        null,
        undefined,
        {},
        { id: 'test' }, // Missing required fields
      ] as any;
      
      // Should not crash but may produce empty/zero results
      await expect(engine.calculateMetrics(malformedShows)).resolves.toBeDefined();
    });

    it('should maintain performance with large datasets', async () => {
      const engine = wasmFinancialEngine;
      await engine.initialize();
      
      // Generate large dataset
      const largeDataset: Show[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `show-${i}`,
        date: `2024-${String((i % 12) + 1).padStart(2, '0')}-15`,
        venue: { 
          name: `Venue ${i}`, 
          capacity: 1000 + (i % 5000),
          location: `City ${i % 50}`
        },
        revenue: Math.random() * 100000,
        expenses: Math.random() * 30000,
        ticketsSold: Math.floor(Math.random() * 5000),
        status: 'scheduled'
      }));
      
      const startTime = performance.now();
      const metrics = await engine.calculateMetrics(largeDataset);
      const endTime = performance.now();
      
      expect(metrics).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle memory management correctly', async () => {
      const engine = wasmFinancialEngine;
      await engine.initialize();
      
      // Run multiple calculations to test memory management
      for (let i = 0; i < 50; i++) {
        await engine.calculateMetrics(mockShows);
        await engine.forecastRevenue(mockShows, 3);
        await engine.scenarioAnalysis(mockShows, 0.1, 0.1, 0.1);
      }
      
      // Should still be functional after many operations
      const finalMetrics = await engine.calculateMetrics(mockShows);
      expect(finalMetrics.totalRevenue).toBe(142500);
    });
  });

  describe('Factory Method & Fallback', () => {
    it('should create engine instance via factory', async () => {
      const engine = await createFinancialEngine();
      expect(engine).toBeDefined();
      
      const metrics = await engine.calculateMetrics(mockShows);
      expect(metrics).toBeDefined();
      expect(metrics.totalRevenue).toBeGreaterThan(0);
    });

    it('should provide consistent interface between WASM and JS fallback', async () => {
      const engine = await createFinancialEngine();
      
      // Test that all required methods exist
      expect(typeof engine.calculateMetrics).toBe('function');
      expect(typeof engine.forecastRevenue).toBe('function');  
      expect(typeof engine.scenarioAnalysis).toBe('function');
      
      // Test that methods return expected structure
      const metrics = await engine.calculateMetrics(mockShows);
      expect(metrics).toHaveProperty('totalRevenue');
      expect(metrics).toHaveProperty('netProfit');
    });
  });
});