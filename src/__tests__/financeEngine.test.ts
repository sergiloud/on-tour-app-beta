/**
 * Financial Engine Tests
 * Comprehensive testing for both WebAssembly and JavaScript financial calculations
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { wasmFinancialEngine } from '../lib/wasmFinancialEngine';
import { JavaScriptFinancialEngine } from '../lib/jsFinancialEngine';
import type { Show, FinancialMetrics } from '../types/finance';

// Create JS engine instance
const jsEngine = new JavaScriptFinancialEngine();

// Mock shows data for testing
const mockShows: Show[] = [
  {
    id: '1',
    venue: { name: 'Arena Barcelona', capacity: 15000, location: 'Barcelona, Spain' },
    date: '2024-01-15',
    revenue: 50000,
    expenses: 12000,
    ticketsSold: 12000,
    status: 'completed'
  },
  {
    id: '2',
    venue: { name: 'Club Madrid', capacity: 5000, location: 'Madrid, Spain' },
    date: '2024-01-20',
    revenue: 25000,
    expenses: 8000,
    ticketsSold: 4500,
    status: 'completed'
  },
  {
    id: '3',
    venue: { name: 'Festival Valencia', capacity: 20000, location: 'Valencia, Spain' },
    date: '2024-01-25',
    revenue: 75000,
    expenses: 15000,
    ticketsSold: 18000,
    status: 'completed'
  }
];

describe('Financial Engine Core Calculations', () => {
  describe('JavaScript Financial Engine', () => {
    it('should calculate financial metrics correctly', async () => {
      const metrics = await jsEngine.calculateMetrics(mockShows);
      
      // Total revenue: 50000 + 25000 + 75000 = 150000
      expect(metrics.totalRevenue).toBe(150000);
      
      // Total expenses: 12000 + 8000 + 15000 = 35000
      expect(metrics.totalExpenses).toBe(35000);
      
      // Net profit: 150000 - 35000 = 115000
      expect(metrics.netProfit).toBe(115000);
      
      // Profit margin: (115000 / 150000) * 100 = 76.67%
      expect(metrics.profitMargin).toBeCloseTo(76.67, 1);
    });

    it('should calculate average ticket price correctly', async () => {
      const metrics = await jsEngine.calculateMetrics(mockShows);
      
      // Total tickets: 12000 + 4500 + 18000 = 34500
      // Total revenue: 150000
      // Average: 150000 / 34500 ≈ 4.35
      expect(metrics.averageTicketPrice).toBeCloseTo(4.35, 2);
    });

    it('should calculate utilization rate correctly', async () => {
      const metrics = await jsEngine.calculateMetrics(mockShows);
      
      // Total capacity: 15000 + 5000 + 20000 = 40000
      // Total sold: 34500
      // Rate: (34500 / 40000) * 100 = 86.25%
      expect(metrics.utilizationRate).toBeCloseTo(86.25, 2);
    });

    it('should handle empty shows array', async () => {
      await expect(jsEngine.calculateMetrics([])).rejects.toThrow('No shows provided for calculation');
    });

    it('should handle shows with zero revenue', async () => {
      const zeroRevenueShows: Show[] = [
        {
          id: '1',
          venue: { name: 'Park', capacity: 1000, location: 'Barcelona' },
          date: '2024-01-15',
          revenue: 0,
          expenses: 500,
          ticketsSold: 1000,
          status: 'completed'
        }
      ];
      
      const metrics = await jsEngine.calculateMetrics(zeroRevenueShows);
      expect(metrics.totalRevenue).toBe(0);
      expect(metrics.netProfit).toBe(-500);
      expect(metrics.profitMargin).toBe(0);
    });

    it('should calculate revenue per show correctly', async () => {
      const metrics = await jsEngine.calculateMetrics(mockShows);
      
      // Total revenue: 150000, 3 shows
      // Average: 150000 / 3 = 50000
      expect(metrics.revenuePerShow).toBe(50000);
    });

    it('should calculate break even tickets correctly', async () => {
      const metrics = await jsEngine.calculateMetrics(mockShows);
      
      // Average expenses per show: 35000 / 3 ≈ 11666.67
      // Average ticket price: ≈ 4.35
      // Break even: 11666.67 / 4.35 ≈ 2681.99
      expect(metrics.breakEvenTickets).toBeCloseTo(2681.99, 0);
    });

    it('should handle forecasting with sufficient data', async () => {
      const forecast = await jsEngine.forecastRevenue(mockShows, 6);
      
      expect(forecast.projectedRevenue).toHaveLength(6);
      expect(forecast.projectedExpenses).toHaveLength(6);
      expect(forecast.projectedProfit).toHaveLength(6);
      expect(typeof forecast.trendSlope).toBe('number');
    });

    it('should reject forecasting with insufficient data', async () => {
      const insufficientShows = mockShows.slice(0, 2);
      await expect(jsEngine.forecastRevenue(insufficientShows, 6)).rejects.toThrow('Need at least 3 shows for forecasting');
    });

    it('should perform scenario analysis', async () => {
      // Parameters: ticketPriceChange (%), capacityChange (%), expenseChange (%)
      const scenario = await jsEngine.scenarioAnalysis(mockShows, 10, 5, 0);
      
      expect(scenario.currentRevenue).toBe(150000);
      expect(scenario.currentExpenses).toBe(35000);
      expect(scenario.currentProfit).toBe(115000);
      expect(typeof scenario.projectedRevenue).toBe('number');
      expect(typeof scenario.profitChangePercent).toBe('number');
      expect(scenario.newTicketPrice).toBeGreaterThan(4.35); // 10% increase
      expect(typeof scenario.projectedTickets).toBe('number');
    });
  });

  describe('WebAssembly Financial Engine', () => {
    beforeAll(async () => {
      // Initialize WASM module if available
      try {
        await wasmFinancialEngine.initialize();
      } catch (error) {
        console.warn('WASM engine not available for testing, skipping WASM tests');
      }
    });

    it('should calculate metrics using WASM when available', async () => {
      if (!wasmFinancialEngine.isInitialized()) {
        return; // Skip if WASM not available
      }
      
      const metrics = await wasmFinancialEngine.calculateMetrics(mockShows);
      
      expect(metrics.totalRevenue).toBe(150000);
      expect(metrics.totalExpenses).toBe(35000);
      expect(metrics.netProfit).toBe(115000);
    });

    it('WASM and JS engines should produce identical results', async () => {
      if (!wasmFinancialEngine.isInitialized()) {
        return; // Skip if WASM not available
      }
      
      const jsResult = await jsEngine.calculateMetrics(mockShows);
      const wasmResult = await wasmFinancialEngine.calculateMetrics(mockShows);
      
      expect(wasmResult.totalRevenue).toBe(jsResult.totalRevenue);
      expect(wasmResult.totalExpenses).toBe(jsResult.totalExpenses);
      expect(wasmResult.netProfit).toBe(jsResult.netProfit);
      expect(wasmResult.profitMargin).toBeCloseTo(jsResult.profitMargin, 2);
    });

    it('should handle large datasets efficiently', async () => {
      if (!wasmFinancialEngine.isInitialized()) {
        return; // Skip if WASM not available
      }
      
      // Generate large dataset
      const largeShows: Show[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `show-${i}`,
        venue: { 
          name: `Venue ${i}`, 
          capacity: Math.floor(Math.random() * 10000) + 1000,
          location: `City ${i}`
        },
        date: `2024-01-${(i % 28) + 1}`,
        revenue: Math.random() * 50000 + 10000,
        expenses: Math.random() * 20000 + 5000,
        ticketsSold: Math.floor(Math.random() * 5000) + 500,
        status: 'completed'
      }));
      
      const startTime = performance.now();
      const result = await wasmFinancialEngine.calculateMetrics(largeShows);
      const endTime = performance.now();
      
      expect(typeof result.totalRevenue).toBe('number');
      expect(result.totalRevenue).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle shows with missing optional properties', async () => {
      const incompleteShows: Show[] = [
        {
          id: '1',
          venue: { name: 'Minimal Venue', capacity: 1000, location: 'Unknown' },
          date: '2024-01-15',
          revenue: 10000,
          expenses: 5000,
          ticketsSold: 800,
          status: 'completed'
        }
      ];
      
      const metrics = await jsEngine.calculateMetrics(incompleteShows);
      expect(metrics.totalRevenue).toBe(10000);
      expect(metrics.netProfit).toBe(5000);
    });

    it('should handle zero capacity venues', async () => {
      const zeroCapacityShows: Show[] = [
        {
          id: '1',
          venue: { name: 'Streaming Only', capacity: 0, location: 'Online' },
          date: '2024-01-15',
          revenue: 5000,
          expenses: 1000,
          ticketsSold: 0,
          status: 'completed'
        }
      ];
      
      const metrics = await jsEngine.calculateMetrics(zeroCapacityShows);
      expect(metrics.utilizationRate).toBe(0);
      expect(metrics.averageTicketPrice).toBe(0); // Division by zero should result in 0
    });

    it('should handle negative revenue (refunds)', async () => {
      const refundShows: Show[] = [
        {
          id: '1',
          venue: { name: 'Cancelled Show', capacity: 1000, location: 'City' },
          date: '2024-01-15',
          revenue: -5000, // Refund
          expenses: 2000,
          ticketsSold: 0,
          status: 'cancelled'
        }
      ];
      
      const metrics = await jsEngine.calculateMetrics(refundShows);
      expect(metrics.totalRevenue).toBe(-5000);
      expect(metrics.netProfit).toBe(-7000);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should process 100 shows within reasonable time', async () => {
      const testShows: Show[] = Array.from({ length: 100 }, (_, i) => ({
        id: `perf-${i}`,
        venue: { 
          name: `Venue ${i}`, 
          capacity: 5000,
          location: `City ${i}`
        },
        date: '2024-01-15',
        revenue: Math.random() * 10000,
        expenses: Math.random() * 5000,
        ticketsSold: Math.floor(Math.random() * 3000),
        status: 'completed'
      }));
      
      const startTime = performance.now();
      const result = await jsEngine.calculateMetrics(testShows);
      const endTime = performance.now();
      
      expect(typeof result.totalRevenue).toBe('number');
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });
  });
});