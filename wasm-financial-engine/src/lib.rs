use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

// Import the `console.log` function from the browser
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// Define a macro for easier console logging
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[derive(Serialize, Deserialize)]
pub struct Show {
    pub date: String,
    pub revenue: f64,
    pub expenses: f64,
    pub capacity: u32,
    pub tickets_sold: u32,
}

#[derive(Serialize, Deserialize)]
pub struct FinancialMetrics {
    pub total_revenue: f64,
    pub total_expenses: f64,
    pub net_profit: f64,
    pub profit_margin: f64,
    pub average_ticket_price: f64,
    pub utilization_rate: f64,
    pub revenue_per_show: f64,
    pub break_even_tickets: f64,
}

#[derive(Serialize, Deserialize)]
pub struct ForecastResult {
    pub projected_revenue: Vec<f64>,
    pub projected_expenses: Vec<f64>,
    pub projected_profit: Vec<f64>,
    pub confidence_interval: Vec<f64>,
    pub trend_slope: f64,
    pub seasonality_factor: f64,
}

#[wasm_bindgen]
pub struct FinancialEngine {
    shows: Vec<Show>,
}

#[wasm_bindgen]
impl FinancialEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> FinancialEngine {
        console_log!("🚀 WASM Financial Engine initialized");
        FinancialEngine {
            shows: Vec::new(),
        }
    }

    /// Add show data to the engine
    #[wasm_bindgen]
    pub fn add_show(&mut self, show_json: &str) -> Result<(), JsValue> {
        let show: Show = serde_json::from_str(show_json)
            .map_err(|e| JsValue::from_str(&format!("Parse error: {}", e)))?;
        self.shows.push(show);
        Ok(())
    }

    /// Load multiple shows from JSON array
    #[wasm_bindgen]
    pub fn load_shows(&mut self, shows_json: &str) -> Result<(), JsValue> {
        let shows: Vec<Show> = serde_json::from_str(shows_json)
            .map_err(|e| JsValue::from_str(&format!("Parse error: {}", e)))?;
        self.shows = shows;
        console_log!("📊 Loaded {} shows into WASM engine", self.shows.len());
        Ok(())
    }

    /// Calculate comprehensive financial metrics
    #[wasm_bindgen]
    pub fn calculate_metrics(&self) -> Result<String, JsValue> {
        if self.shows.is_empty() {
            return Err(JsValue::from_str("No shows loaded"));
        }

        let total_revenue: f64 = self.shows.iter().map(|s| s.revenue).sum::<f64>();
        let total_expenses: f64 = self.shows.iter().map(|s| s.expenses).sum::<f64>();
        let net_profit = total_revenue - total_expenses;
        let profit_margin = if total_revenue > 0.0 {
            (net_profit / total_revenue) * 100.0
        } else {
            0.0
        };

        let total_tickets: u32 = self.shows.iter().map(|s| s.tickets_sold).sum::<u32>();
        let total_capacity: u32 = self.shows.iter().map(|s| s.capacity).sum::<u32>();

        let average_ticket_price = if total_tickets > 0 {
            total_revenue / total_tickets as f64
        } else {
            0.0
        };

        let utilization_rate = if total_capacity > 0 {
            (total_tickets as f64 / total_capacity as f64) * 100.0
        } else {
            0.0
        };

        let revenue_per_show = if !self.shows.is_empty() {
            total_revenue / self.shows.len() as f64
        } else {
            0.0
        };

        // Calculate break-even point per show
        let avg_expenses_per_show = if !self.shows.is_empty() {
            total_expenses / self.shows.len() as f64
        } else {
            0.0
        };

        let break_even_tickets = if average_ticket_price > 0.0 {
            avg_expenses_per_show / average_ticket_price
        } else {
            0.0
        };

        let metrics = FinancialMetrics {
            total_revenue,
            total_expenses,
            net_profit,
            profit_margin,
            average_ticket_price,
            utilization_rate,
            revenue_per_show,
            break_even_tickets,
        };

        serde_json::to_string(&metrics)
            .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
    }

    /// Advanced forecasting using linear regression and seasonality analysis
    #[wasm_bindgen]
    pub fn forecast_revenue(&self, months_ahead: u32) -> Result<String, JsValue> {
        if self.shows.len() < 3 {
            return Err(JsValue::from_str("Need at least 3 shows for forecasting"));
        }

        // Simple linear regression for trend analysis
        let n = self.shows.len() as f64;
        let sum_x: f64 = (0..self.shows.len()).map(|i| i as f64).sum::<f64>();
        let sum_y: f64 = self.shows.iter().map(|s| s.revenue).sum::<f64>();
        let sum_xy: f64 = self.shows.iter().enumerate()
            .map(|(i, s)| i as f64 * s.revenue).sum::<f64>();
        let sum_x2: f64 = (0..self.shows.len()).map(|i| (i as f64).powi(2)).sum::<f64>();

        let trend_slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x.powi(2));
        let intercept = (sum_y - trend_slope * sum_x) / n;

        // Calculate seasonality factor (simplified)
        let avg_revenue = sum_y / n;
        let variance: f64 = self.shows.iter()
            .map(|s| (s.revenue - avg_revenue).powi(2))
            .sum::<f64>() / n;
        let seasonality_factor = (variance.sqrt() / avg_revenue) * 100.0;

        // Generate forecasts
        let mut projected_revenue = Vec::new();
        let mut projected_expenses = Vec::new();
        let mut projected_profit = Vec::new();
        let mut confidence_interval = Vec::new();

        let total_expenses_forecast: f64 = self.shows.iter().map(|s| s.expenses).sum::<f64>();
        let avg_expense_ratio = if sum_y > 0.0 {
            total_expenses_forecast / sum_y
        } else {
            0.7 // Default 70% expense ratio
        };

        for i in 0..months_ahead {
            let x = self.shows.len() as f64 + i as f64;
            let base_revenue = intercept + trend_slope * x;
            
            // Add seasonality (simplified sine wave)
            let seasonal_adjustment = 1.0 + (seasonality_factor / 100.0) * 
                ((2.0 * std::f64::consts::PI * i as f64 / 12.0).sin());
            
            let revenue = base_revenue * seasonal_adjustment;
            let expenses = revenue * avg_expense_ratio;
            let profit = revenue - expenses;
            
            // Confidence interval (±15% for simplicity)
            let confidence = revenue * 0.15;
            
            projected_revenue.push(revenue.max(0.0));
            projected_expenses.push(expenses.max(0.0));
            projected_profit.push(profit);
            confidence_interval.push(confidence);
        }

        let forecast = ForecastResult {
            projected_revenue,
            projected_expenses,
            projected_profit,
            confidence_interval,
            trend_slope,
            seasonality_factor,
        };

        serde_json::to_string(&forecast)
            .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
    }

    /// Calculate profitability analysis for different scenarios
    #[wasm_bindgen]
    pub fn scenario_analysis(&self, ticket_price_change: f64, capacity_change: f64, expense_change: f64) -> Result<String, JsValue> {
        if self.shows.is_empty() {
            return Err(JsValue::from_str("No shows loaded"));
        }

        // Calculate current totals
        let current_revenue: f64 = self.shows.iter().map(|s| s.revenue).sum::<f64>();
        let current_expenses: f64 = self.shows.iter().map(|s| s.expenses).sum::<f64>();
        let current_tickets: u32 = self.shows.iter().map(|s| s.tickets_sold).sum::<u32>();
        
        // Calculate average ticket price
        let avg_ticket_price = if current_tickets > 0 {
            current_revenue / current_tickets as f64
        } else {
            50.0 // Default
        };

        // Apply scenario changes
        let new_ticket_price = avg_ticket_price * (1.0 + ticket_price_change / 100.0);
        let new_capacity_multiplier = 1.0 + capacity_change / 100.0;
        let new_expense_multiplier = 1.0 + expense_change / 100.0;

        // Estimate demand elasticity (simple model: -0.5 elasticity)
        let demand_change = ticket_price_change * -0.5;
        let new_demand_multiplier = 1.0 + demand_change / 100.0;

        let projected_tickets = (current_tickets as f64 * new_demand_multiplier * new_capacity_multiplier) as u32;
        let projected_revenue = projected_tickets as f64 * new_ticket_price;
        let projected_expenses = current_expenses * new_expense_multiplier;
        let projected_profit = projected_revenue - projected_expenses;

        let current_profit = current_revenue - current_expenses;
        let profit_change = if current_profit != 0.0 {
            ((projected_profit - current_profit) / current_profit.abs()) * 100.0
        } else {
            if projected_profit > 0.0 { 100.0 } else { -100.0 }
        };

        #[derive(Serialize)]
        struct ScenarioResult {
            current_revenue: f64,
            current_expenses: f64,
            current_profit: f64,
            projected_revenue: f64,
            projected_expenses: f64,
            projected_profit: f64,
            profit_change_percent: f64,
            new_ticket_price: f64,
            projected_tickets: u32,
        }

        let result = ScenarioResult {
            current_revenue,
            current_expenses,
            current_profit,
            projected_revenue,
            projected_expenses,
            projected_profit,
            profit_change_percent: profit_change,
            new_ticket_price,
            projected_tickets,
        };

        serde_json::to_string(&result)
            .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
    }

    /// Get engine statistics
    #[wasm_bindgen]
    pub fn get_stats(&self) -> String {
        format!("{{\"shows_loaded\": {}, \"engine_version\": \"1.0.0\"}}", self.shows.len())
    }
}

// Initialize the WASM module
#[wasm_bindgen(start)]
pub fn main() {
    console_log!("🦀 WASM Financial Engine loaded - Ready for 10x performance!");
}