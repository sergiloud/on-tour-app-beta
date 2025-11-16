use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

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

// Timeline Maestro v3.0 - Timeline Simulation Types
#[derive(Serialize, Deserialize, Clone)]
pub struct TimelineTask {
    pub id: String,
    pub task_type: String,
    pub status: String,
    pub priority: String,
    pub deadline: String,
    pub estimated_hours: f64,
    pub completion_percentage: f64,
    pub cost_impact: f64,
    pub revenue_impact: f64,
    pub dependencies: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TimelineRelease {
    pub id: String,
    pub release_type: String,
    pub release_date: String,
    pub budget: f64,
    pub projected_revenue: f64,
    pub platforms: Vec<String>,
    pub marketing_spend: f64,
    pub dependencies: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TimelineShow {
    pub id: String,
    pub date: String,
    pub revenue: f64,
    pub expenses: f64,
    pub status: String,
    pub venue_capacity: u32,
    pub expected_attendance: u32,
}

#[derive(Serialize, Deserialize)]
pub struct TimelineData {
    pub tasks: Vec<TimelineTask>,
    pub releases: Vec<TimelineRelease>,
    pub shows: Vec<TimelineShow>,
}

#[derive(Serialize, Deserialize)]
pub struct TimelineChange {
    pub change_type: String, // "delay", "complete", "reschedule", "cancel"
    pub entity_type: String, // "task", "release", "show"
    pub entity_id: String,
    pub new_date: Option<String>,
    pub new_status: Option<String>,
    pub new_completion: Option<f64>,
}

#[derive(Serialize, Deserialize)]
pub struct TimelineSimulationResult {
    pub financial_impact: f64,
    pub affected_entities: Vec<String>,
    pub cascade_effects: Vec<String>,
    pub new_deadlines: HashMap<String, String>,
    pub risk_score: f64,
    pub revenue_change: f64,
    pub expense_change: f64,
    pub critical_path: Vec<String>,
}

#[wasm_bindgen]
pub struct FinancialEngine {
    shows: Vec<Show>,
}

#[wasm_bindgen]
pub struct TimelineSimulator {
    timeline_data: Option<TimelineData>,
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

#[wasm_bindgen]
impl TimelineSimulator {
    /// Create a new TimelineSimulator instance
    #[wasm_bindgen(constructor)]
    pub fn new() -> TimelineSimulator {
        console_log!("🎯 Timeline Simulator initialized");
        TimelineSimulator {
            timeline_data: None,
        }
    }

    /// Load timeline data into the simulator
    #[wasm_bindgen]
    pub fn load_timeline_data(&mut self, data_json: &str) -> Result<(), JsValue> {
        let timeline_data: TimelineData = serde_json::from_str(data_json)
            .map_err(|e| JsValue::from_str(&format!("Parse error: {}", e)))?;
        
        console_log!("📊 Timeline data loaded: {} tasks, {} releases, {} shows", 
            timeline_data.tasks.len(), 
            timeline_data.releases.len(), 
            timeline_data.shows.len());
        
        self.timeline_data = Some(timeline_data);
        Ok(())
    }

    /// Simulate the financial and operational impact of a timeline change
    #[wasm_bindgen]
    pub fn simulate_timeline_change(&self, change_json: &str) -> Result<String, JsValue> {
        let timeline_data = self.timeline_data.as_ref()
            .ok_or_else(|| JsValue::from_str("Timeline data not loaded"))?;

        let change: TimelineChange = serde_json::from_str(change_json)
            .map_err(|e| JsValue::from_str(&format!("Change parse error: {}", e)))?;

        console_log!("🔄 Simulating {} on {} {}", change.change_type, change.entity_type, change.entity_id);

        // Calculate financial impact
        let financial_impact = self.calculate_financial_impact(&change, timeline_data)?;
        
        // Find cascade effects (dependent tasks/releases)
        let affected_entities = self.find_affected_entities(&change, timeline_data);
        
        // Calculate new deadlines for dependent items
        let new_deadlines = self.calculate_new_deadlines(&change, timeline_data)?;
        
        // Calculate risk score (0-100)
        let risk_score = self.calculate_risk_score(&change, timeline_data, &affected_entities);
        
        // Find critical path items
        let critical_path = self.find_critical_path(&change, timeline_data);

        let result = TimelineSimulationResult {
            financial_impact,
            affected_entities: affected_entities.clone(),
            cascade_effects: self.generate_cascade_effects(&change, &affected_entities),
            new_deadlines,
            risk_score,
            revenue_change: if financial_impact > 0.0 { financial_impact } else { 0.0 },
            expense_change: if financial_impact < 0.0 { financial_impact.abs() } else { 0.0 },
            critical_path,
        };

        serde_json::to_string(&result)
            .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
    }

    /// Get real-time performance metrics for the timeline
    #[wasm_bindgen]
    pub fn get_timeline_metrics(&self) -> Result<String, JsValue> {
        let timeline_data = self.timeline_data.as_ref()
            .ok_or_else(|| JsValue::from_str("Timeline data not loaded"))?;

        let total_tasks = timeline_data.tasks.len();
        let completed_tasks = timeline_data.tasks.iter()
            .filter(|t| t.status == "completed")
            .count();
        
        let total_releases = timeline_data.releases.len();
        let released = timeline_data.releases.iter()
            .filter(|r| r.release_type == "released") // Assume status is in type for simplicity
            .count();

        let overdue_tasks = timeline_data.tasks.iter()
            .filter(|t| self.is_overdue(&t.deadline) && t.status != "completed")
            .count();

        let total_revenue_impact: f64 = timeline_data.tasks.iter()
            .map(|t| t.revenue_impact)
            .sum::<f64>() + 
            timeline_data.releases.iter()
            .map(|r| r.projected_revenue)
            .sum::<f64>() +
            timeline_data.shows.iter()
            .map(|s| s.revenue)
            .sum::<f64>();

        let total_cost_impact: f64 = timeline_data.tasks.iter()
            .map(|t| t.cost_impact)
            .sum::<f64>() + 
            timeline_data.releases.iter()
            .map(|r| r.budget + r.marketing_spend)
            .sum::<f64>() +
            timeline_data.shows.iter()
            .map(|s| s.expenses)
            .sum::<f64>();

        #[derive(Serialize)]
        struct TimelineMetrics {
            total_tasks: usize,
            completed_tasks: usize,
            completion_rate: f64,
            total_releases: usize,
            released_count: usize,
            overdue_tasks: usize,
            total_revenue_impact: f64,
            total_cost_impact: f64,
            net_impact: f64,
            efficiency_score: f64,
        }

        let completion_rate = if total_tasks > 0 { 
            (completed_tasks as f64 / total_tasks as f64) * 100.0 
        } else { 0.0 };

        let efficiency_score = if total_tasks > 0 {
            ((completed_tasks as f64 / total_tasks as f64) * 0.6 + 
             (1.0 - (overdue_tasks as f64 / total_tasks as f64)) * 0.4) * 100.0
        } else { 0.0 };

        let metrics = TimelineMetrics {
            total_tasks,
            completed_tasks,
            completion_rate,
            total_releases,
            released_count: released,
            overdue_tasks,
            total_revenue_impact,
            total_cost_impact,
            net_impact: total_revenue_impact - total_cost_impact,
            efficiency_score,
        };

        serde_json::to_string(&metrics)
            .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
    }
}

// Private helper methods for TimelineSimulator
impl TimelineSimulator {
    fn calculate_financial_impact(&self, change: &TimelineChange, timeline_data: &TimelineData) -> Result<f64, JsValue> {
        match change.entity_type.as_str() {
            "task" => {
                if let Some(task) = timeline_data.tasks.iter().find(|t| t.id == change.entity_id) {
                    match change.change_type.as_str() {
                        "delay" => Ok(-task.revenue_impact * 0.1), // 10% revenue loss for delays
                        "complete" => Ok(task.revenue_impact),
                        "cancel" => Ok(-task.revenue_impact - task.cost_impact),
                        _ => Ok(0.0),
                    }
                } else {
                    Err(JsValue::from_str("Task not found"))
                }
            },
            "release" => {
                if let Some(release) = timeline_data.releases.iter().find(|r| r.id == change.entity_id) {
                    match change.change_type.as_str() {
                        "delay" => Ok(-release.projected_revenue * 0.2), // 20% revenue loss for release delays
                        "complete" => Ok(release.projected_revenue - release.budget - release.marketing_spend),
                        "cancel" => Ok(-release.budget - release.marketing_spend),
                        _ => Ok(0.0),
                    }
                } else {
                    Err(JsValue::from_str("Release not found"))
                }
            },
            "show" => {
                if let Some(show) = timeline_data.shows.iter().find(|s| s.id == change.entity_id) {
                    match change.change_type.as_str() {
                        "delay" => Ok(-show.revenue * 0.15), // 15% revenue loss for show reschedules
                        "cancel" => Ok(-show.revenue + show.expenses * 0.5), // Lose revenue but save some costs
                        _ => Ok(0.0),
                    }
                } else {
                    Err(JsValue::from_str("Show not found"))
                }
            },
            _ => Ok(0.0),
        }
    }

    fn find_affected_entities(&self, change: &TimelineChange, timeline_data: &TimelineData) -> Vec<String> {
        let mut affected = Vec::new();

        // Find tasks that depend on the changed entity
        for task in &timeline_data.tasks {
            if task.dependencies.contains(&change.entity_id) {
                affected.push(format!("task:{}", task.id));
            }
        }

        // Find releases that depend on the changed entity
        for release in &timeline_data.releases {
            if release.dependencies.contains(&change.entity_id) {
                affected.push(format!("release:{}", release.id));
            }
        }

        affected
    }

    fn calculate_new_deadlines(&self, change: &TimelineChange, timeline_data: &TimelineData) -> Result<HashMap<String, String>, JsValue> {
        let mut new_deadlines = HashMap::new();

        if change.change_type == "delay" {
            if let Some(new_date) = &change.new_date {
                // Cascade delay to dependent items (simplified - add 1 day)
                let affected = self.find_affected_entities(change, timeline_data);
                for entity in affected {
                    new_deadlines.insert(entity, format!("{}", new_date)); // Simplified
                }
            }
        }

        Ok(new_deadlines)
    }

    fn calculate_risk_score(&self, change: &TimelineChange, timeline_data: &TimelineData, affected_entities: &[String]) -> f64 {
        let base_risk = match change.change_type.as_str() {
            "delay" => 40.0,
            "cancel" => 80.0,
            "complete" => 0.0,
            _ => 20.0,
        };

        let cascade_risk = (affected_entities.len() as f64) * 5.0; // 5 points per affected entity
        let total_risk = base_risk + cascade_risk;
        
        if total_risk > 100.0 { 100.0 } else { total_risk }
    }

    fn find_critical_path(&self, _change: &TimelineChange, timeline_data: &TimelineData) -> Vec<String> {
        // Simplified critical path: tasks with highest revenue impact + dependencies
        let mut critical_tasks: Vec<_> = timeline_data.tasks.iter()
            .filter(|t| t.revenue_impact > 1000.0 || !t.dependencies.is_empty())
            .map(|t| t.id.clone())
            .collect();
        
        critical_tasks.sort();
        critical_tasks
    }

    fn generate_cascade_effects(&self, change: &TimelineChange, affected_entities: &[String]) -> Vec<String> {
        let mut effects = Vec::new();

        match change.change_type.as_str() {
            "delay" => {
                effects.push("Timeline compression for dependent items".to_string());
                if affected_entities.len() > 0 {
                    effects.push(format!("{} dependent items require rescheduling", affected_entities.len()));
                }
            },
            "cancel" => {
                effects.push("Resource reallocation required".to_string());
                effects.push("Budget impact on dependent items".to_string());
            },
            "complete" => {
                effects.push("Accelerated timeline for dependent items".to_string());
            },
            _ => {}
        }

        effects
    }

    fn is_overdue(&self, deadline: &str) -> bool {
        // Simplified: assume current date is "2024-01-15" for demo
        deadline < "2024-01-15"
    }
}

// Initialize the WASM module
#[wasm_bindgen(start)]
pub fn main() {
    console_log!("🦀 WASM Financial Engine + Timeline Simulator loaded - Ready for 10x performance!");
}