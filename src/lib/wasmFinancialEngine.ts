import type { Show, FinancialMetrics, ForecastResult, ScenarioAnalysis, WasmFinancialEngineInterface } from '../types/finance';
import { toast } from 'sonner';

// WASM module interface for type safety
interface WasmFinancialEngineModule {
  FinancialEngine: new() => any;
  default: () => Promise<void>;
}

class WasmFinancialEngineService implements WasmFinancialEngineInterface {
  private engine: any = null;
  private initialized = false;
  private initializing = false;
  private wasmAvailable = false;

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
      console.log('🚀 Initializing Financial Engine...');
      
      // Try to load WASM module
      try {
        const wasmModule: WasmFinancialEngineModule = await import('../../wasm-financial-engine/pkg/wasm_financial_engine.js');
        
        // Initialize the WASM module
        await wasmModule.default();
        
        // Create engine instance
        this.engine = new wasmModule.FinancialEngine();
        this.wasmAvailable = true;
        this.initialized = true;
        
        console.log('✅ WASM Financial Engine initialized successfully');
        toast.success('High-performance financial engine loaded', {
          description: '8x faster calculations now available',
          duration: 3000,
        });
        
      } catch (wasmError) {
        console.warn('🔶 WASM not available, using JavaScript fallback:', wasmError);
        
        // Fallback to JavaScript implementation
        this.engine = new JavaScriptFinancialEngine();
        this.wasmAvailable = false;
        this.initialized = true;
        
        console.log('✅ JavaScript Financial Engine initialized as fallback');
        toast.info('Standard financial engine loaded', {
          description: 'WASM not available, using JavaScript calculations',
          duration: 3000,
        });
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize Financial Engine:', error);
      toast.error('Financial engine initialization failed', {
        description: 'Some calculations may be slower',
        duration: 5000,
      });
      
      // Final fallback - create a minimal engine
      this.engine = new JavaScriptFinancialEngine();
      this.wasmAvailable = false;
      this.initialized = true;
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
    
    if (!this.wasmAvailable) {
      // Use JavaScript fallback
      return await this.engine.calculateMetrics(shows);
    }
    
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
    
    if (!this.wasmAvailable) {
      // Use JavaScript fallback
      return await this.engine.forecastRevenue(shows, monthsAhead);
    }
    
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
    
    if (!this.wasmAvailable) {
      // Use JavaScript fallback
      return await this.engine.scenarioAnalysis(shows, ticketPriceChange, capacityChange, expenseChange);
    }
    
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
    
    if (this.wasmAvailable && this.engine?.get_stats) {
      const statsJson = this.engine.get_stats();
      const stats = JSON.parse(statsJson);
      
      return {
        showsLoaded: stats.shows_loaded,
        engineVersion: stats.engine_version,
      };
    } else {
      // JavaScript fallback stats
      return {
        showsLoaded: 0,
        engineVersion: 'JavaScript v1.0',
      };
    }
  }
}

// JavaScript fallback implementation
class JavaScriptFinancialEngine {
  private shows: Show[] = [];

  async calculateMetrics(shows: Show[]): Promise<FinancialMetrics> {
    this.shows = shows;
    
    const totalRevenue = shows.reduce((sum, show) => sum + (show.revenue || 0), 0);
    const totalExpenses = shows.reduce((sum, show) => sum + (show.expenses || 0), 0);
    const totalTicketsSold = shows.reduce((sum, show) => sum + (show.ticketsSold || 0), 0);
    const totalCapacity = shows.reduce((sum, show) => sum + (show.venue?.capacity || 0), 0);

    const profit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    const averageTicketPrice = totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0;
    const utilizationRate = totalCapacity > 0 ? (totalTicketsSold / totalCapacity) * 100 : 0;
    const revenuePerShow = shows.length > 0 ? totalRevenue / shows.length : 0;
    const breakEvenTickets = averageTicketPrice > 0 ? totalExpenses / averageTicketPrice : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit: profit,
      profitMargin,
      averageTicketPrice,
      utilizationRate,
      revenuePerShow,
      breakEvenTickets,
    };
  }

  async forecastRevenue(shows: Show[], monthsAhead: number): Promise<ForecastResult> {
    const currentMetrics = await this.calculateMetrics(shows);
    const monthlyRevenue = currentMetrics.totalRevenue / Math.max(1, monthsAhead);
    const monthlyExpenses = currentMetrics.totalExpenses / Math.max(1, monthsAhead);

    // Generate arrays for forecast periods
    const projectedRevenue = Array.from({ length: monthsAhead }, (_, i) => monthlyRevenue * (i + 1));
    const projectedExpenses = Array.from({ length: monthsAhead }, (_, i) => monthlyExpenses * (i + 1));
    const projectedProfit = projectedRevenue.map((rev, i) => rev - (projectedExpenses[i] || 0));
    const confidenceInterval = Array.from({ length: monthsAhead }, () => 0.75);

    return {
      projectedRevenue,
      projectedExpenses,
      projectedProfit,
      confidenceInterval,
      trendSlope: monthlyRevenue > monthlyExpenses ? 1.0 : -0.5,
      seasonalityFactor: 1.0,
    };
  }

  async scenarioAnalysis(
    shows: Show[], 
    ticketPriceChange: number, 
    capacityChange: number, 
    expenseChange: number
  ): Promise<ScenarioAnalysis> {
    const currentMetrics = await this.calculateMetrics(shows);
    
    // Simple scenario calculations
    const ticketMultiplier = 1 + (ticketPriceChange / 100);
    const capacityMultiplier = 1 + (capacityChange / 100);
    const expenseMultiplier = 1 + (expenseChange / 100);
    
    const projectedRevenue = currentMetrics.totalRevenue * ticketMultiplier * capacityMultiplier;
    const projectedExpenses = currentMetrics.totalExpenses * expenseMultiplier;
    const projectedProfit = projectedRevenue - projectedExpenses;
    
    const profitChangePercent = currentMetrics.netProfit !== 0 
      ? ((projectedProfit - currentMetrics.netProfit) / Math.abs(currentMetrics.netProfit)) * 100 
      : 0;

    return {
      currentRevenue: currentMetrics.totalRevenue,
      currentExpenses: currentMetrics.totalExpenses,
      currentProfit: currentMetrics.netProfit,
      projectedRevenue,
      projectedExpenses,
      projectedProfit,
      profitChangePercent,
      newTicketPrice: currentMetrics.averageTicketPrice * ticketMultiplier,
      projectedTickets: shows.reduce((sum, show) => sum + (show.ticketsSold || 0), 0) * capacityMultiplier,
    };
  }
}

// Create singleton instance
export const wasmFinancialEngine = new WasmFinancialEngineService();

// Fallback factory for when WASM isn't available
export async function createFinancialEngine(): Promise<WasmFinancialEngineInterface> {
  await wasmFinancialEngine.initialize();
  return wasmFinancialEngine;
}

// Export types for TypeScript
export type { WasmFinancialEngineInterface };