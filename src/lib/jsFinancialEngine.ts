import { Show, FinancialMetrics, ForecastResult, ScenarioAnalysis, WasmFinancialEngineInterface } from '../types/finance';

export class JavaScriptFinancialEngine implements WasmFinancialEngineInterface {
  private initialized = true; // JavaScript version is always "initialized"

  isInitialized(): boolean {
    return this.initialized;
  }

  async calculateMetrics(shows: Show[]): Promise<FinancialMetrics> {
    if (shows.length === 0) {
      throw new Error('No shows provided for calculation');
    }

    const totalRevenue = shows.reduce((sum, show) => sum + (show.revenue || 0), 0);
    const totalExpenses = shows.reduce((sum, show) => sum + (show.expenses || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const totalTickets = shows.reduce((sum, show) => sum + (show.ticketsSold || 0), 0);
    const totalCapacity = shows.reduce((sum, show) => sum + (show.venue?.capacity || 0), 0);

    const averageTicketPrice = totalTickets > 0 ? totalRevenue / totalTickets : 0;
    const utilizationRate = totalCapacity > 0 ? (totalTickets / totalCapacity) * 100 : 0;
    const revenuePerShow = shows.length > 0 ? totalRevenue / shows.length : 0;

    const avgExpensesPerShow = shows.length > 0 ? totalExpenses / shows.length : 0;
    const breakEvenTickets = averageTicketPrice > 0 ? avgExpensesPerShow / averageTicketPrice : 0;

    console.log('📊 JavaScript metrics calculation completed (fallback mode)');
    
    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      averageTicketPrice,
      utilizationRate,
      revenuePerShow,
      breakEvenTickets,
    };
  }

  async forecastRevenue(shows: Show[], monthsAhead: number): Promise<ForecastResult> {
    if (shows.length < 3) {
      throw new Error('Need at least 3 shows for forecasting');
    }

    // Simple linear regression
    const revenues = shows.map(show => show.revenue || 0);
    const n = revenues.length;
    const sumX = revenues.reduce((sum, _, i) => sum + i, 0);
    const sumY = revenues.reduce((sum, revenue) => sum + revenue, 0);
    const sumXY = revenues.reduce((sum, revenue, i) => sum + i * revenue, 0);
    const sumX2 = revenues.reduce((sum, _, i) => sum + i * i, 0);

    const trendSlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - trendSlope * sumX) / n;

    // Calculate seasonality
    const avgRevenue = sumY / n;
    const variance = revenues.reduce((sum, revenue) => sum + Math.pow(revenue - avgRevenue, 2), 0) / n;
    const seasonalityFactor = (Math.sqrt(variance) / avgRevenue) * 100;

    // Generate forecasts
    const projectedRevenue: number[] = [];
    const projectedExpenses: number[] = [];
    const projectedProfit: number[] = [];
    const confidenceInterval: number[] = [];

    const avgExpenseRatio = sumY > 0 
      ? shows.reduce((sum, show) => sum + (show.expenses || 0), 0) / sumY 
      : 0.7;

    for (let i = 0; i < monthsAhead; i++) {
      const x = n + i;
      const baseRevenue = intercept + trendSlope * x;
      
      // Add seasonality
      const seasonalAdjustment = 1 + (seasonalityFactor / 100) * 
        Math.sin(2 * Math.PI * i / 12);
      
      const revenue = Math.max(0, baseRevenue * seasonalAdjustment);
      const expenses = Math.max(0, revenue * avgExpenseRatio);
      const profit = revenue - expenses;
      const confidence = revenue * 0.15;
      
      projectedRevenue.push(revenue);
      projectedExpenses.push(expenses);
      projectedProfit.push(profit);
      confidenceInterval.push(confidence);
    }

    console.log('📈 JavaScript revenue forecast completed (fallback mode)');
    
    return {
      projectedRevenue,
      projectedExpenses,
      projectedProfit,
      confidenceInterval,
      trendSlope,
      seasonalityFactor,
    };
  }

  async scenarioAnalysis(
    shows: Show[], 
    ticketPriceChange: number, 
    capacityChange: number, 
    expenseChange: number
  ): Promise<ScenarioAnalysis> {
    if (shows.length === 0) {
      throw new Error('No shows provided for scenario analysis');
    }

    const currentRevenue = shows.reduce((sum, show) => sum + (show.revenue || 0), 0);
    const currentExpenses = shows.reduce((sum, show) => sum + (show.expenses || 0), 0);
    const currentProfit = currentRevenue - currentExpenses;
    const currentTickets = shows.reduce((sum, show) => sum + (show.ticketsSold || 0), 0);

    const avgTicketPrice = currentTickets > 0 ? currentRevenue / currentTickets : 50;
    const newTicketPrice = avgTicketPrice * (1 + ticketPriceChange / 100);
    
    // Simple demand elasticity model
    const demandChange = ticketPriceChange * -0.5;
    const newDemandMultiplier = 1 + demandChange / 100;
    const newCapacityMultiplier = 1 + capacityChange / 100;
    
    const projectedTickets = Math.round(currentTickets * newDemandMultiplier * newCapacityMultiplier);
    const projectedRevenue = projectedTickets * newTicketPrice;
    const projectedExpenses = currentExpenses * (1 + expenseChange / 100);
    const projectedProfit = projectedRevenue - projectedExpenses;
    
    const profitChangePercent = currentProfit !== 0 
      ? ((projectedProfit - currentProfit) / Math.abs(currentProfit)) * 100
      : projectedProfit > 0 ? 100 : -100;

    console.log('🎯 JavaScript scenario analysis completed (fallback mode)');
    
    return {
      currentRevenue,
      currentExpenses,
      currentProfit,
      projectedRevenue,
      projectedExpenses,
      projectedProfit,
      profitChangePercent,
      newTicketPrice,
      projectedTickets,
    };
  }
}