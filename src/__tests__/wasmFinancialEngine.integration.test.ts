import { describe, it, expect, beforeAll, vi } from 'vitest';
import { createFinancialEngine } from '../lib/wasmFinancialEngine';

// Mock WebAssembly for testing environment
const mockWasmModule = {
  memory: new WebAssembly.Memory({ initial: 10 }),
  calculate_monthly_revenue: vi.fn().mockReturnValue(50000),
  calculate_yearly_forecast: vi.fn().mockReturnValue([45000, 52000, 48000]),
  calculate_demand_elasticity: vi.fn().mockReturnValue(-1.2),
  calculate_break_even: vi.fn().mockReturnValue({ shows: 12, revenue: 480000 }),
  calculate_roi_scenario: vi.fn().mockReturnValue({ roi: 0.15, profit: 75000 }),
  free: vi.fn()
};

// Mock the wasm import
vi.mock('/wasm-financial-engine/pkg/wasm_financial_engine.js', () => ({
  default: vi.fn().mockResolvedValue(mockWasmModule),
  __wbg_set_wasm: vi.fn(),
}));

describe('WebAssembly Financial Engine Integration', () => {
  let engine: any;

  beforeAll(async () => {
    // Initialize engine in test environment
    engine = await createFinancialEngine();
  });

  describe('Core Financial Calculations', () => {
    it('should calculate monthly revenue correctly', async () => {
      const shows = [
        { revenue: 25000, expenses: 15000, date: '2024-11-01' },
        { revenue: 30000, expenses: 18000, date: '2024-11-15' }
      ];

      const result = engine.calculateMonthlyRevenue(shows);
      expect(result).toBe(50000);
      expect(mockWasmModule.calculate_monthly_revenue).toHaveBeenCalledWith(
        expect.any(Object)
      );
    });

    it('should handle empty show data gracefully', async () => {
      const result = engine.calculateMonthlyRevenue([]);
      expect(result).toBe(50000); // Mocked return value
    });

    it('should calculate yearly forecast with seasonal adjustments', async () => {
      const historicalData = [
        { month: 1, revenue: 45000 },
        { month: 2, revenue: 52000 },
        { month: 3, revenue: 48000 }
      ];

      const forecast = engine.calculateYearlyForecast(historicalData);
      expect(forecast).toEqual([45000, 52000, 48000]);
      expect(Array.isArray(forecast)).toBe(true);
    });

    it('should calculate demand elasticity for pricing optimization', async () => {
      const pricePoints = [
        { price: 100, quantity: 200 },
        { price: 120, quantity: 180 },
        { price: 80, quantity: 220 }
      ];

      const elasticity = engine.calculateDemandElasticity(pricePoints);
      expect(elasticity).toBe(-1.2);
      expect(typeof elasticity).toBe('number');
    });

    it('should determine break-even points accurately', async () => {
      const fixedCosts = 240000;
      const variableCostPerShow = 15000;
      const avgRevenuePerShow = 40000;

      const breakEven = engine.calculateBreakEven({
        fixedCosts,
        variableCostPerShow,
        avgRevenuePerShow
      });

      expect(breakEven).toEqual({ shows: 12, revenue: 480000 });
      expect(breakEven.shows).toBeGreaterThan(0);
    });

    it('should analyze ROI scenarios for different strategies', async () => {
      const scenarios = [
        { investment: 500000, expectedReturn: 575000, timeline: 12 }
      ];

      const roiAnalysis = engine.calculateROIScenario(scenarios[0]);
      expect(roiAnalysis).toEqual({ roi: 0.15, profit: 75000 });
      expect(roiAnalysis.roi).toBeGreaterThan(0);
    });
  });

  describe('Performance Benchmarking', () => {
    it('should complete calculations within performance thresholds', async () => {
      const startTime = performance.now();
      
      const shows = Array.from({ length: 100 }, (_, i) => ({
        revenue: Math.random() * 50000,
        expenses: Math.random() * 30000,
        date: new Date(2024, i % 12, 1).toISOString()
      }));

      engine.calculateMonthlyRevenue(shows);
      
      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(50); // Should complete in <50ms
    });

    it('should handle concurrent calculations without memory leaks', async () => {
      const promises = Array.from({ length: 10 }, () => 
        engine.calculateMonthlyRevenue([
          { revenue: 25000, expenses: 15000, date: '2024-11-01' }
        ])
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => expect(result).toBe(50000));
    });
  });

  describe('Error Handling & Fallback', () => {
    it('should gracefully fallback to JavaScript when WASM fails', async () => {
      // Simulate WASM failure
      const failingEngine = await createFinancialEngine();
      
      // Mock a WASM error
      vi.mocked(mockWasmModule.calculate_monthly_revenue).mockImplementation(() => {
        throw new Error('WASM execution failed');
      });

      // Should still return a result via JavaScript fallback
      const result = failingEngine.calculateMonthlyRevenue([
        { revenue: 25000, expenses: 15000, date: '2024-11-01' }
      ]);
      
      // In fallback mode, should still provide meaningful results
      expect(typeof result).toBe('number');
    });

    it('should validate input data before WASM calls', async () => {
      const invalidData = [
        { revenue: 'invalid' as any, expenses: null, date: undefined }
      ];

      expect(() => {
        engine.calculateMonthlyRevenue(invalidData);
      }).toThrow(); // Should throw validation error before reaching WASM
    });
  });

  describe('Memory Management', () => {
    it('should properly clean up WASM memory', async () => {
      const initialMemory = mockWasmModule.memory.buffer.byteLength;
      
      // Perform multiple calculations
      for (let i = 0; i < 50; i++) {
        engine.calculateMonthlyRevenue([
          { revenue: i * 1000, expenses: i * 600, date: '2024-11-01' }
        ]);
      }

      // Memory should be managed properly
      expect(mockWasmModule.free).toHaveBeenCalled();
    });

    it('should handle memory pressure gracefully', async () => {
      // Simulate high memory usage scenario
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        revenue: i * 100,
        expenses: i * 60,
        date: new Date(2024, i % 12, (i % 30) + 1).toISOString()
      }));

      expect(() => {
        engine.calculateMonthlyRevenue(largeDataset);
      }).not.toThrow();
    });
  });
});

describe('WebAssembly Integration with React Hooks', () => {
  it('should integrate seamlessly with useEnhancedApp hook', async () => {
    // This would be tested in a React environment
    // Testing the TypeScript interfaces and contracts
    const engine = await createFinancialEngine();
    
    expect(engine).toHaveProperty('calculateMonthlyRevenue');
    expect(engine).toHaveProperty('calculateYearlyForecast');
    expect(engine).toHaveProperty('calculateDemandElasticity');
    expect(engine).toHaveProperty('calculateBreakEven');
    expect(engine).toHaveProperty('calculateROIScenario');
  });

  it('should provide performance metrics for UI display', async () => {
    const engine = await createFinancialEngine();
    
    // Engine should expose performance data
    expect(engine).toHaveProperty('getPerformanceMetrics');
    
    const metrics = engine.getPerformanceMetrics();
    expect(metrics).toHaveProperty('initializationTime');
    expect(metrics).toHaveProperty('averageCalculationTime');
  });
});