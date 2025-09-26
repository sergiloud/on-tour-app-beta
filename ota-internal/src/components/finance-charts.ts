// DEPRECATED: Legacy placeholder/DOM chart utilities.
// Replaced by React + Recharts professional components (finance-charts-professional.js).
// Keep until all references removed, then delete.
// Professional finance charts using Recharts
// Replaces basic canvas charts with modern, interactive visualizations

import type { Money, ExpenseCategory, FinancialEntity } from '../types/finance';

export interface CashflowDataPoint {
  month: string;
  income: number;
  expenses: number;
  net: number;
  forecast?: boolean;
  confidence?: number;
}

export interface WaterfallDataPoint {
  name: string;
  value: number;
  cumulative: number;
  type: 'positive' | 'negative' | 'total';
  color?: string;
}

export interface ExpenseBreakdownData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface ProfitabilityData {
  showId: string;
  venue: string;
  city: string;
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
  attendance?: number;
}

/**
 * Cashflow Waterfall Chart Component
 * Shows how income flows through various expense categories to net profit
 */
export function createWaterfallChart(containerId: string, data: WaterfallDataPoint[]) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Clear existing content
  container.innerHTML = '';

  // Create chart using Recharts via CDN (for now, until bundled properly)
  const chartHtml = `
    <div class="waterfall-chart-container" style="width: 100%; height: 400px;">
      <div class="chart-title">
        <h3>Revenue Flow Analysis</h3>
        <p class="chart-subtitle">How income flows through expenses to net profit</p>
      </div>
      <div id="${containerId}-recharts" style="width: 100%; height: 320px;"></div>
    </div>
  `;

  container.innerHTML = chartHtml;

  // Initialize with placeholder for now - will be replaced with actual Recharts when bundled
  const placeholder = document.getElementById(`${containerId}-recharts`);
  if (placeholder) {
    placeholder.innerHTML = `
      <div class="chart-placeholder" style="display: flex; align-items: center; justify-content: center; height: 100%; background: var(--color-surface-secondary); border-radius: 12px;">
        <div style="text-align: center; color: var(--color-text-secondary);">
          <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
          <div>Waterfall Chart</div>
          <div style="font-size: 12px; opacity: 0.7;">Revenue → Expenses → Net</div>
        </div>
      </div>
    `;
  }
}

/**
 * Enhanced Cashflow Forecast Chart
 * Shows historical and projected cashflow with confidence intervals
 */
export function createCashflowChart(containerId: string, data: CashflowDataPoint[]) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  const chartHtml = `
    <div class="cashflow-chart-container" style="width: 100%; height: 400px;">
      <div class="chart-controls" style="display: flex; justify-content: space-between; margin-bottom: 16px;">
        <div class="chart-legend">
          <span class="legend-item">
            <span class="legend-color" style="background: #22c55e;"></span>
            Income
          </span>
          <span class="legend-item">
            <span class="legend-color" style="background: #ef4444;"></span>
            Expenses
          </span>
          <span class="legend-item">
            <span class="legend-color" style="background: #3b82f6;"></span>
            Net Cashflow
          </span>
        </div>
        <div class="chart-actions">
          <button class="ghost tiny" onclick="toggleForecast('${containerId}')">
            <i data-lucide="eye"></i> Toggle Forecast
          </button>
        </div>
      </div>
      <div id="${containerId}-recharts" style="width: 100%; height: 320px;"></div>
    </div>
  `;

  container.innerHTML = chartHtml;

  // Enhanced placeholder with sample data visualization
  const placeholder = document.getElementById(`${containerId}-recharts`);
  if (placeholder) {
    const sampleData = data.slice(0, 12); // Show 12 months
    const maxValue = Math.max(...sampleData.map(d => Math.max(d.income, Math.abs(d.expenses), Math.abs(d.net))));
    
    let barsHtml = '';
    sampleData.forEach((point, index) => {
      const incomeHeight = (point.income / maxValue) * 200;
      const expensesHeight = (Math.abs(point.expenses) / maxValue) * 200;
      const netHeight = (Math.abs(point.net) / maxValue) * 200;
      const netColor = point.net >= 0 ? '#22c55e' : '#ef4444';
      
      barsHtml += `
        <div class="chart-month" style="display: flex; flex-direction: column; align-items: center; flex: 1;">
          <div class="chart-bars" style="display: flex; align-items: end; height: 200px; gap: 2px;">
            <div style="width: 12px; height: ${incomeHeight}px; background: #22c55e; border-radius: 2px 2px 0 0;" title="Income: €${point.income.toLocaleString()}"></div>
            <div style="width: 12px; height: ${expensesHeight}px; background: #ef4444; border-radius: 2px 2px 0 0;" title="Expenses: €${Math.abs(point.expenses).toLocaleString()}"></div>
            <div style="width: 12px; height: ${netHeight}px; background: ${netColor}; border-radius: 2px 2px 0 0;" title="Net: €${point.net.toLocaleString()}"></div>
          </div>
          <div class="chart-label" style="font-size: 10px; margin-top: 4px; color: var(--color-text-secondary);">
            ${point.month}
          </div>
        </div>
      `;
    });

    placeholder.innerHTML = `
      <div style="display: flex; height: 100%; padding: 16px; align-items: end;">
        ${barsHtml}
      </div>
    `;
  }
}

/**
 * Expense Breakdown Donut Chart
 * Shows expense distribution by category with drill-down capability
 */
export function createExpenseBreakdownChart(containerId: string, data: ExpenseBreakdownData[]) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  const total = data.reduce((sum, item) => sum + item.amount, 0);
  
  const chartHtml = `
    <div class="expense-breakdown-container" style="width: 100%; height: 400px; position: relative;">
      <div class="chart-center-info" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; z-index: 10;">
        <div style="font-size: 24px; font-weight: 600; color: var(--color-text-primary);">€${total.toLocaleString()}</div>
        <div style="font-size: 12px; color: var(--color-text-secondary);">Total Expenses</div>
      </div>
      <div id="${containerId}-donut" style="width: 100%; height: 280px;"></div>
      <div class="expense-legend" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; margin-top: 16px;">
        ${data.map(item => `
          <div class="legend-item" style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
            <div style="width: 12px; height: 12px; border-radius: 2px; background: ${item.color};"></div>
            <span style="flex: 1; color: var(--color-text-secondary);">${item.category}</span>
            <span style="font-weight: 600;">${item.percentage.toFixed(1)}%</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = chartHtml;

  // Create a simple CSS-based donut chart
  const donutContainer = document.getElementById(`${containerId}-donut`);
  if (donutContainer) {
    let cumulativePercentage = 0;
    const segments = data.map(item => {
      const percentage = (item.amount / total) * 100;
      const startAngle = (cumulativePercentage / 100) * 360;
      const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
      cumulativePercentage += percentage;
      
      return { ...item, startAngle, endAngle, percentage };
    });

    // SVG donut chart
    const svgContent = `
      <svg width="100%" height="100%" viewBox="0 0 200 200" style="transform: rotate(-90deg);">
        <circle cx="100" cy="100" r="70" fill="none" stroke="var(--color-surface-secondary)" stroke-width="40"/>
        ${segments.map(segment => {
          const radius = 70;
          const strokeWidth = 40;
          const normalizedRadius = radius - strokeWidth * 0.5;
          const circumference = normalizedRadius * 2 * Math.PI;
          const strokeDasharray = `${circumference * segment.percentage / 100} ${circumference}`;
          const rotate = segment.startAngle;
          
          return `
            <circle 
              cx="100" 
              cy="100" 
              r="${normalizedRadius}"
              fill="none" 
              stroke="${segment.color}" 
              stroke-width="${strokeWidth}"
              stroke-dasharray="${strokeDasharray}"
              stroke-dashoffset="0"
              transform="rotate(${rotate} 100 100)"
              opacity="0.8"
              class="expense-segment"
              data-category="${segment.category}"
              data-amount="${segment.amount}"
            />
          `;
        }).join('')}
      </svg>
    `;
    
    donutContainer.innerHTML = svgContent;
  }
}

/**
 * Profitability Heatmap
 * Shows profitability by venue/city with color coding
 */
export function createProfitabilityHeatmap(containerId: string, data: ProfitabilityData[]) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  // Sort by profitability
  const sortedData = [...data].sort((a, b) => b.margin - a.margin);
  
  const chartHtml = `
    <div class="profitability-heatmap" style="width: 100%; height: 400px;">
      <div class="heatmap-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0;">Show Profitability Analysis</h3>
        <div class="heatmap-legend" style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
          <span>Loss</span>
          <div class="gradient-bar" style="width: 100px; height: 8px; background: linear-gradient(to right, #ef4444, #fbbf24, #22c55e); border-radius: 4px;"></div>
          <span>Profit</span>
        </div>
      </div>
      <div class="heatmap-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; max-height: 320px; overflow-y: auto;">
        ${sortedData.map(show => {
          const profitColor = show.margin >= 0 ? `hsl(142, ${Math.min(100, show.margin * 2)}%, 45%)` : `hsl(0, ${Math.min(100, Math.abs(show.margin) * 2)}%, 55%)`;
          
          return `
            <div class="heatmap-cell" style="
              background: ${profitColor}; 
              color: white; 
              padding: 12px; 
              border-radius: 8px; 
              cursor: pointer;
              transition: transform 0.2s;
            " onclick="showProfitabilityDetails('${show.showId}')" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
              <div style="font-weight: 600; font-size: 14px;">${show.venue}</div>
              <div style="font-size: 12px; opacity: 0.9; margin: 2px 0;">${show.city}</div>
              <div style="font-size: 12px; opacity: 0.8;">${new Date(show.date).toLocaleDateString()}</div>
              <div style="margin-top: 8px; display: flex; justify-content: space-between;">
                <span style="font-size: 11px;">Profit:</span>
                <span style="font-weight: 600;">€${show.profit.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 11px;">Margin:</span>
                <span style="font-weight: 600;">${show.margin.toFixed(1)}%</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  container.innerHTML = chartHtml;
}

/**
 * Revenue Trend Line Chart
 * Shows revenue trends over time with moving averages
 */
export function createRevenueTrendChart(containerId: string, data: Array<{date: string, revenue: number, movingAvg?: number}>) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const chartHeight = 200;

  const chartHtml = `
    <div class="revenue-trend-container" style="width: 100%; height: 300px;">
      <div class="trend-header" style="margin-bottom: 16px;">
        <h3 style="margin: 0;">Revenue Trend Analysis</h3>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: var(--color-text-secondary);">
          Monthly revenue with 3-month moving average
        </p>
      </div>
      <div class="trend-chart" style="position: relative; height: ${chartHeight}px; border-bottom: 1px solid var(--color-border); margin-bottom: 16px;">
        <svg width="100%" height="100%" style="overflow: visible;">
          <!-- Revenue bars -->
          ${data.map((point, index) => {
            const barHeight = (point.revenue / maxRevenue) * (chartHeight - 40);
            const x = (index / (data.length - 1)) * 100;
            return `
              <rect 
                x="${x}%" 
                y="${chartHeight - barHeight - 20}" 
                width="3" 
                height="${barHeight}" 
                fill="var(--color-accent)" 
                opacity="0.7"
                class="revenue-bar"
              />
            `;
          }).join('')}
          
          <!-- Moving average line -->
          <polyline 
            points="${data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = chartHeight - ((point.movingAvg || point.revenue) / maxRevenue) * (chartHeight - 40) - 20;
              return `${x},${y}`;
            }).join(' ')}"
            fill="none" 
            stroke="var(--color-success)" 
            stroke-width="2"
            opacity="0.8"
          />
        </svg>
        
        <!-- X-axis labels -->
        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: var(--color-text-secondary);">
          ${data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map(point => 
            `<span>${new Date(point.date).toLocaleDateString('en', {month: 'short'})}</span>`
          ).join('')}
        </div>
      </div>
      
      <div class="trend-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px;">
        <div class="stat-item">
          <div style="font-size: 18px; font-weight: 600; color: var(--color-text-primary);">€${Math.max(...data.map(d => d.revenue)).toLocaleString()}</div>
          <div style="font-size: 11px; color: var(--color-text-secondary);">Peak Month</div>
        </div>
        <div class="stat-item">
          <div style="font-size: 18px; font-weight: 600; color: var(--color-text-primary);">€${(data.reduce((sum, d) => sum + d.revenue, 0) / data.length).toLocaleString()}</div>
          <div style="font-size: 11px; color: var(--color-text-secondary);">Average</div>
        </div>
        <div class="stat-item">
          <div style="font-size: 18px; font-weight: 600; color: var(--color-success);">↗ 12%</div>
          <div style="font-size: 11px; color: var(--color-text-secondary);">Trend</div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = chartHtml;
}

// Global functions for interactivity
(window as any).toggleForecast = function(containerId: string) {
  console.log(`Toggle forecast for ${containerId}`);
  // Implementation for toggling forecast visibility
};

(window as any).showProfitabilityDetails = function(showId: string) {
  console.log(`Show profitability details for ${showId}`);
  // Implementation for showing detailed profitability modal
};
