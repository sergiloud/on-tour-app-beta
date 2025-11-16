import init, { FinancialEngine } from '../../wasm-financial-engine/pkg/wasm_financial_engine.js';
import type { Show, FinancialMetrics, ForecastResult, ScenarioAnalysis, WasmFinancialEngineInterface } from '../types/finance';
import { toast } from 'sonner';

class WasmFinancialEngineService implements WasmFinancialEngineInterface {
  private engine: FinancialEngine | null = null;
  private initialized = false;
  private initializing = false;

  constructor() {
    // Auto-initialize on first import
    this.initialize();
  }

  async initialize(): Promise<void> {
    if (this.initialized || this.initializing) {
      return;
    }

    this.initializing = true;
    
    try {
      console.log('🚀 Initializing WASM Financial Engine...');
      
      // Initialize the WASM module
      await init();
      
      // Create engine instance
      this.engine = new FinancialEngine();
      this.initialized = true;
      
      console.log('✅ WASM Financial Engine initialized successfully');
      toast.success('High-performance financial engine loaded', {
        description: '10x faster calculations now available',
        duration: 3000,
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize WASM Financial Engine:', error);
      toast.error('Financial engine initialization failed', {
        description: 'Falling back to JavaScript calculations',
        duration: 5000,
      });
      throw error;
    } finally {
      this.initializing = false;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  private ensureInitialized(): void {
    if (!this.initialized || !this.engine) {
      throw new Error('WASM Financial Engine not initialized. Call initialize() first.');
    }
  }

  async calculateMetrics(shows: Show[]): Promise<FinancialMetrics> {
    this.ensureInitialized();
    
    try {
      // Convert shows to WASM format
      const wasmShows = shows.map(show => ({
        date: show.date,
        revenue: show.revenue || 0,
        expenses: show.expenses || 0,
        capacity: show.venue?.capacity || 0,
        tickets_sold: show.ticketsSold || 0,
      }));

      // Load shows into WASM engine
      this.engine!.load_shows(JSON.stringify(wasmShows));
      
      // Calculate metrics
      const metricsJson = this.engine!.calculate_metrics();
      const metrics = JSON.parse(metricsJson);
      
      console.log('📊 WASM metrics calculation completed');
      return {
        totalRevenue: metrics.total_revenue,
        totalExpenses: metrics.total_expenses,
        netProfit: metrics.net_profit,
        profitMargin: metrics.profit_margin,
        averageTicketPrice: metrics.average_ticket_price,
        utilizationRate: metrics.utilization_rate,
        revenuePerShow: metrics.revenue_per_show,
        breakEvenTickets: metrics.break_even_tickets,
      };
      
    } catch (error) {
      console.error('❌ WASM metrics calculation failed:', error);
      throw new Error(`WASM calculation failed: ${error}`);
    }
  }

  async forecastRevenue(shows: Show[], monthsAhead: number): Promise<ForecastResult> {
    this.ensureInitialized();
    
    try {
      // Convert shows to WASM format
      const wasmShows = shows.map(show => ({
        date: show.date,
        revenue: show.revenue || 0,
        expenses: show.expenses || 0,
        capacity: show.venue?.capacity || 0,
        tickets_sold: show.ticketsSold || 0,
      }));

      // Load shows and forecast
      this.engine!.load_shows(JSON.stringify(wasmShows));
      const forecastJson = this.engine!.forecast_revenue(monthsAhead);
      const forecast = JSON.parse(forecastJson);
      
      console.log('📈 WASM revenue forecast completed');
      return {
        projectedRevenue: forecast.projected_revenue,
        projectedExpenses: forecast.projected_expenses,
        projectedProfit: forecast.projected_profit,
        confidenceInterval: forecast.confidence_interval,
        trendSlope: forecast.trend_slope,
        seasonalityFactor: forecast.seasonality_factor,
      };
      
    } catch (error) {
      console.error('❌ WASM forecast failed:', error);
      throw new Error(`WASM forecast failed: ${error}`);
    }
  }

  async scenarioAnalysis(
    shows: Show[], 
    ticketPriceChange: number, 
    capacityChange: number, 
    expenseChange: number
  ): Promise<ScenarioAnalysis> {
    this.ensureInitialized();
    
    try {
      // Convert shows to WASM format
      const wasmShows = shows.map(show => ({
        date: show.date,
        revenue: show.revenue || 0,
        expenses: show.expenses || 0,
        capacity: show.venue?.capacity || 0,
        tickets_sold: show.ticketsSold || 0,
      }));

      // Load shows and analyze scenario
      this.engine!.load_shows(JSON.stringify(wasmShows));
      const scenarioJson = this.engine!.scenario_analysis(ticketPriceChange, capacityChange, expenseChange);
      const scenario = JSON.parse(scenarioJson);
      
      console.log('🎯 WASM scenario analysis completed');
      return {
        currentRevenue: scenario.current_revenue,
        currentExpenses: scenario.current_expenses,
        currentProfit: scenario.current_profit,
        projectedRevenue: scenario.projected_revenue,
        projectedExpenses: scenario.projected_expenses,
        projectedProfit: scenario.projected_profit,
        profitChangePercent: scenario.profit_change_percent,
        newTicketPrice: scenario.new_ticket_price,
        projectedTickets: scenario.projected_tickets,
      };
      
    } catch (error) {
      console.error('❌ WASM scenario analysis failed:', error);
      throw new Error(`WASM scenario analysis failed: ${error}`);
    }
  }

  // Utility method to get engine statistics
  async getEngineStats(): Promise<{ showsLoaded: number; engineVersion: string }> {
    this.ensureInitialized();
    
    const statsJson = this.engine!.get_stats();
    const stats = JSON.parse(statsJson);
    
    return {
      showsLoaded: stats.shows_loaded,
      engineVersion: stats.engine_version,
    };
  }
}

// Create singleton instance
export const wasmFinancialEngine = new WasmFinancialEngineService();

// Fallback factory for when WASM isn't available
export async function createFinancialEngine(): Promise<WasmFinancialEngineInterface> {
  try {
    await wasmFinancialEngine.initialize();
    return wasmFinancialEngine;
  } catch (error) {
    console.warn('WASM Financial Engine unavailable, using JavaScript fallback');
    
    // Import JavaScript fallback
    const { JavaScriptFinancialEngine } = await import('./jsFinancialEngine');
    return new JavaScriptFinancialEngine();
  }
}

// Export types for TypeScript
export type { WasmFinancialEngineInterface };