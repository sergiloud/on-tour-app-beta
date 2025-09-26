// Interactive Forecasting Tools with Advanced Scenario Modeling
let IF_BROWSER = (typeof window !== 'undefined' && typeof document !== 'undefined');

// Main engine class (DOM-touching logic guarded by IF_BROWSER checks)
class InteractiveForecastingEngine {
  constructor() {
    this.scenarios = new Map();
    this.forecastModels = {
      linear: this.linearForecast.bind(this),
      exponential: this.exponentialForecast.bind(this),
      seasonal: this.seasonalForecast.bind(this),
      arima: this.arimaForecast.bind(this),
      monteCarlo: this.monteCarloForecast.bind(this)
    };
    
    this.dragState = {
      isDragging: false,
      draggedPoint: null,
      originalValue: null,
      chart: null
    };
    
    this.forecastParameters = {
      confidence: 0.95,
      periods: 12,
      seasonality: 'auto',
      growth: 'linear',
      holidays: [],
      changepoints: []
    };
    
    this.isInitialized = false;
    this.init();
  }

  async init() {
    console.log('📊 Initializing Interactive Forecasting Engine...');
    
    try {
      // Initialize chart containers
      this.initializeChartContainers();
      
      // Setup drag and drop interactions
      this.setupDragInteractions();
      
      // Initialize scenario templates
      this.initializeScenarioTemplates();
      
      // Setup event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('✅ Interactive Forecasting Engine initialized');
      
    } catch (error) {
      console.error('❌ Forecasting Engine initialization failed:', error);
    }
  }

  initializeChartContainers() {
    const forecastContainer = document.createElement('div');
    forecastContainer.id = 'interactive-forecast-container';
    forecastContainer.className = 'forecast-container';
    
    forecastContainer.innerHTML = `
      <div class="forecast-header">
        <h3>📈 Interactive Financial Forecasting</h3>
        <div class="forecast-controls">
          <select id="forecast-model" class="forecast-select">
            <option value="linear">Linear Trend</option>
            <option value="exponential">Exponential Growth</option>
            <option value="seasonal">Seasonal ARIMA</option>
            <option value="monteCarlo">Monte Carlo</option>
          </select>
          <input type="range" id="forecast-periods" min="6" max="36" value="12" class="forecast-slider">
          <span id="periods-label">12 months</span>
          <button id="add-scenario" class="forecast-btn primary">+ New Scenario</button>
        </div>
      </div>
      
      <div class="forecast-main">
        <div class="forecast-chart-container">
          <canvas id="interactive-forecast-chart" width="800" height="400"></canvas>
          <div class="forecast-overlay">
            <div class="drag-instructions">
              💡 Drag forecast points to adjust predictions
            </div>
          </div>
        </div>
        
        <div class="forecast-sidebar">
          <div class="scenario-panel">
            <h4>📋 Scenarios</h4>
            <div id="scenarios-list" class="scenarios-list"></div>
          </div>
          
          <div class="forecast-metrics">
            <h4>📊 Forecast Metrics</h4>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-label">Confidence</div>
                <div class="metric-value" id="forecast-confidence">85%</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Growth Rate</div>
                <div class="metric-value" id="forecast-growth">+12.5%</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Volatility</div>
                <div class="metric-value" id="forecast-volatility">Medium</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Seasonality</div>
                <div class="metric-value" id="forecast-seasonality">Strong</div>
              </div>
            </div>
          </div>
          
          <div class="forecast-adjustments">
            <h4>🎛️ Manual Adjustments</h4>
            <div class="adjustment-controls">
              <label>Growth Factor: <input type="range" id="growth-factor" min="0.5" max="2" step="0.1" value="1"></label>
              <label>Seasonality: <input type="range" id="seasonality-factor" min="0" max="2" step="0.1" value="1"></label>
              <label>Volatility: <input type="range" id="volatility-factor" min="0.1" max="3" step="0.1" value="1"></label>
            </div>
          </div>
        </div>
      </div>
      
      <div class="forecast-scenarios-comparison">
        <h4>🔄 Scenario Comparison</h4>
        <canvas id="scenarios-comparison-chart" width="800" height="200"></canvas>
      </div>
    `;
    
    // Insert into the page
    let targetContainer = document.querySelector('.finance-dashboard');
    if(!targetContainer){
      targetContainer = document.getElementById('finance-breakdown-view') || document.body;
    }
    targetContainer.appendChild(forecastContainer);
  }

  setupDragInteractions() {
    const canvas = document.getElementById('interactive-forecast-chart');
    if (!canvas) return;
    
    let isDragging = false;
    let draggedPoint = null;
    let originalValue = null;
    
  canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const point = this.findNearestForecastPoint(x, y);
      if (point && point.distance < 15) {
        isDragging = true;
        draggedPoint = point;
        originalValue = point.value;
        canvas.style.cursor = 'grabbing';
      }
      if (isDragging && draggedPoint) {
        // Update the forecast point value based on mouse position
        const newValue = this.convertPixelToValue(y);
        this.updateForecastPoint(draggedPoint.index, newValue);
        this.redrawForecastChart();
      } else {
        // Check if hovering over a forecast point
        const point = this.findNearestForecastPoint(x, y);
        canvas.style.cursor = point && point.distance < 15 ? 'grab' : 'default';
      }
    });
    
    canvas.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        canvas.style.cursor = 'default';
        
        // Trigger forecast recalculation with manual adjustment
        this.onForecastAdjusted(draggedPoint, originalValue);
        draggedPoint = null;
        originalValue = null;
      }
    });
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      const mouseEvent = new MouseEvent('mouseup', {});
      canvas.dispatchEvent(mouseEvent);
    });
  }

  initializeScenarioTemplates() {
    this.scenarioTemplates = {
      optimistic: {
        name: 'Optimistic Growth',
        icon: '📈',
        growthFactor: 1.5,
        seasonalityFactor: 1.2,
        volatilityFactor: 0.8,
        description: 'High growth scenario with reduced volatility'
      },
      pessimistic: {
        name: 'Conservative Forecast',
        icon: '📉',
        growthFactor: 0.7,
        seasonalityFactor: 0.8,
        volatilityFactor: 1.3,
        description: 'Slower growth with increased uncertainty'
      },
      seasonal: {
        name: 'Seasonal Focus',
        icon: '🎭',
        growthFactor: 1.0,
        seasonalityFactor: 1.8,
        volatilityFactor: 1.0,
        description: 'Strong seasonal patterns maintained'
      },
      disruption: {
        name: 'Market Disruption',
        icon: '⚡',
        growthFactor: 0.5,
        seasonalityFactor: 0.6,
        volatilityFactor: 2.0,
        description: 'High volatility disruption scenario'
      },
      recovery: {
        name: 'Post-Crisis Recovery',
        icon: '🔄',
        growthFactor: 1.8,
        seasonalityFactor: 1.1,
        volatilityFactor: 1.4,
        description: 'Strong recovery with initial volatility'
      }
    };
    
    // Create default scenarios
    Object.entries(this.scenarioTemplates).forEach(([key, template]) => {
      this.createScenario(key, template);
    });
  }

  setupEventListeners() {
    // Model selection
    document.getElementById('forecast-model')?.addEventListener('change', (e) => {
      this.updateForecastModel(e.target.value);
    });
    
    // Periods slider
    document.getElementById('forecast-periods')?.addEventListener('input', (e) => {
      const periods = parseInt(e.target.value);
      document.getElementById('periods-label').textContent = `${periods} months`;
      this.updateForecastPeriods(periods);
    });
    
    // Add scenario button
    document.getElementById('add-scenario')?.addEventListener('click', () => {
      this.showScenarioDialog();
    });
    
    // Manual adjustment controls
    ['growth-factor', 'seasonality-factor', 'volatility-factor'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', (e) => {
        this.updateManualAdjustments();
      });
    });
  }

  // Forecasting Models
  async generateForecast(historicalData, model = 'linear', periods = 12) {
    console.log(`📊 Generating ${model} forecast for ${periods} periods...`);
    
    if (!historicalData || historicalData.length < 3) {
      throw new Error('Insufficient historical data for forecasting');
    }
    
    const forecastFunction = this.forecastModels[model];
    if (!forecastFunction) {
      throw new Error(`Unknown forecast model: ${model}`);
    }
    
    try {
      const forecast = await forecastFunction(historicalData, periods);
      
      return {
        model: model,
        periods: periods,
        forecast: forecast.values,
        confidence: forecast.confidence,
        metrics: this.calculateForecastMetrics(historicalData, forecast.values),
        generated: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`❌ ${model} forecast failed:`, error);
      throw error;
    }
  }

  linearForecast(data, periods) {
    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data.map(d => d.value || d);
    
    // Linear regression
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Generate forecast
    const forecast = [];
    for (let i = 0; i < periods; i++) {
      const futureX = n + i;
      const predictedY = slope * futureX + intercept;
      forecast.push(Math.max(0, predictedY));
    }
    
    // Calculate confidence based on residuals
    const residuals = y.map((yi, i) => yi - (slope * x[i] + intercept));
    const mse = residuals.reduce((sum, r) => sum + r * r, 0) / n;
    const confidence = Math.max(0.5, Math.min(0.95, 1 - Math.sqrt(mse) / (sumY / n)));
    
    return { values: forecast, confidence };
  }

  exponentialForecast(data, periods) {
    const values = data.map(d => d.value || d);
    const n = values.length;
    
    // Calculate growth rate
    const growthRates = [];
    for (let i = 1; i < n; i++) {
      if (values[i - 1] > 0) {
        growthRates.push(values[i] / values[i - 1]);
      }
    }
    
    const avgGrowthRate = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    const lastValue = values[n - 1];
    
    // Generate exponential forecast
    const forecast = [];
    for (let i = 0; i < periods; i++) {
      const predictedValue = lastValue * Math.pow(avgGrowthRate, i + 1);
      forecast.push(Math.max(0, predictedValue));
    }
    
    // Calculate confidence based on growth rate variance
    const growthVariance = growthRates.reduce((sum, rate) => sum + Math.pow(rate - avgGrowthRate, 2), 0) / growthRates.length;
    const confidence = Math.max(0.4, Math.min(0.9, 1 - growthVariance));
    
    return { values: forecast, confidence };
  }

  seasonalForecast(data, periods) {
    const values = data.map(d => d.value || d);
    const seasonLength = Math.min(12, Math.floor(data.length / 2));
    
    // Decompose into trend and seasonal components
    const { trend, seasonal } = this.decomposeSeries(values, seasonLength);
    
    // Extend trend
    const trendSlope = this.calculateTrendSlope(trend);
    const extendedTrend = [];
    const lastTrend = trend[trend.length - 1];
    
    for (let i = 0; i < periods; i++) {
      extendedTrend.push(lastTrend + trendSlope * (i + 1));
    }
    
    // Apply seasonal pattern
    const forecast = [];
    for (let i = 0; i < periods; i++) {
      const seasonIndex = i % seasonLength;
      const seasonalComponent = seasonal[seasonIndex] || 1;
      const forecastValue = extendedTrend[i] * seasonalComponent;
      forecast.push(Math.max(0, forecastValue));
    }
    
    return { values: forecast, confidence: 0.75 };
  }

  arimaForecast(data, periods) {
    // Simplified ARIMA implementation
    const values = data.map(d => d.value || d);
    const n = values.length;
    
    // Auto-regression parameters (AR(1))
    let correlation = 0;
    if (n > 1) {
      const x = values.slice(0, -1);
      const y = values.slice(1);
      correlation = this.calculateCorrelation(x, y);
    }
    
    // Moving average of residuals (MA(1))
    const predictions = [];
    let lastValue = values[n - 1];
    let lastError = 0;
    
    for (let i = 0; i < periods; i++) {
      const predicted = lastValue * correlation + lastError * 0.3;
      const noise = (Math.random() - 0.5) * (lastValue * 0.1);
      const forecastValue = predicted + noise;
      
      predictions.push(Math.max(0, forecastValue));
      lastValue = forecastValue;
      lastError = noise;
    }
    
    return { values: predictions, confidence: 0.65 };
  }

  monteCarloForecast(data, periods) {
    const values = data.map(d => d.value || d);
    const n = values.length;
    
    // Calculate historical statistics
    const returns = [];
    for (let i = 1; i < n; i++) {
      if (values[i - 1] > 0) {
        returns.push((values[i] - values[i - 1]) / values[i - 1]);
      }
    }
    
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const returnStd = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length);
    
    // Run Monte Carlo simulations
    const simulations = 1000;
    const allPaths = [];
    
    for (let sim = 0; sim < simulations; sim++) {
      const path = [];
      let currentValue = values[n - 1];
      
      for (let i = 0; i < periods; i++) {
        const randomReturn = this.normalRandom() * returnStd + meanReturn;
        currentValue = currentValue * (1 + randomReturn);
        path.push(Math.max(0, currentValue));
      }
      
      allPaths.push(path);
    }
    
    // Calculate mean forecast
    const forecast = [];
    for (let i = 0; i < periods; i++) {
      const periodValues = allPaths.map(path => path[i]);
      const mean = periodValues.reduce((a, b) => a + b, 0) / simulations;
      forecast.push(mean);
    }
    
    return { values: forecast, confidence: 0.8, paths: allPaths };
  }

  // Scenario Management
  createScenario(id, config) {
    const scenario = {
      id: id,
      name: config.name,
      icon: config.icon,
      parameters: {
        growthFactor: config.growthFactor,
        seasonalityFactor: config.seasonalityFactor,
        volatilityFactor: config.volatilityFactor
      },
      description: config.description,
      forecast: null,
      active: false,
      created: new Date().toISOString()
    };
    
    this.scenarios.set(id, scenario);
    this.renderScenarioItem(scenario);
    
    return scenario;
  }

  async updateScenario(id, historicalData) {
    const scenario = this.scenarios.get(id);
    if (!scenario) return;
    
    try {
      // Apply scenario parameters to historical data
      const adjustedData = this.applyScenarioParameters(historicalData, scenario.parameters);
      
      // Generate forecast
      const forecastResult = await this.generateForecast(adjustedData, 'seasonal', 12);
      scenario.forecast = forecastResult;
      
      // Update UI
      this.renderScenarioItem(scenario);
      
      if (scenario.active) {
        this.displayScenarioForecast(scenario);
      }
      
    } catch (error) {
      console.error(`❌ Failed to update scenario ${id}:`, error);
    }
  }

  applyScenarioParameters(data, parameters) {
    return data.map((point, index) => {
      const seasonalEffect = Math.sin(index * Math.PI / 6) * parameters.seasonalityFactor;
      const growthEffect = Math.pow(parameters.growthFactor, index / 12);
      const volatilityNoise = (Math.random() - 0.5) * parameters.volatilityFactor * 0.1;
      
      const adjustedValue = point.value * growthEffect * (1 + seasonalEffect + volatilityNoise);
      
      return {
        ...point,
        value: Math.max(0, adjustedValue)
      };
    });
  }

  // UI Rendering
  renderScenarioItem(scenario) {
    const container = document.getElementById('scenarios-list');
    if (!container) return;
    
    let item = document.getElementById(`scenario-${scenario.id}`);
    if (!item) {
      item = document.createElement('div');
      item.id = `scenario-${scenario.id}`;
      item.className = 'scenario-item';
      container.appendChild(item);
    }
    
    const confidencePercent = scenario.forecast ? Math.round(scenario.forecast.confidence * 100) : 0;
    const isActive = scenario.active ? 'active' : '';
    
    item.innerHTML = `
      <div class="scenario-header">
        <span class="scenario-icon">${scenario.icon}</span>
        <span class="scenario-name">${scenario.name}</span>
        <button class="scenario-toggle ${isActive}" onclick="forecastEngine.toggleScenario('${scenario.id}')">
          ${scenario.active ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>
      <div class="scenario-details">
        <div class="scenario-description">${scenario.description}</div>
        ${scenario.forecast ? `
          <div class="scenario-metrics">
            <span class="metric">Confidence: ${confidencePercent}%</span>
            <span class="metric">Growth: ${((scenario.parameters.growthFactor - 1) * 100).toFixed(1)}%</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  toggleScenario(id) {
    const scenario = this.scenarios.get(id);
    if (!scenario) return;
    
    scenario.active = !scenario.active;
    
    // Deactivate other scenarios if this one is being activated
    if (scenario.active) {
      this.scenarios.forEach((s, key) => {
        if (key !== id) s.active = false;
      });
    }
    
    // Re-render all scenarios
    this.scenarios.forEach(s => this.renderScenarioItem(s));
    
    // Update main chart
    this.updateMainForecastChart();
  }

  // Chart Rendering
  async updateMainForecastChart() {
    const canvas = document.getElementById('interactive-forecast-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Get active scenario or default forecast
    const activeScenario = Array.from(this.scenarios.values()).find(s => s.active);
    
    try {
      // Get historical data (mock for now)
      const historicalData = await this.getHistoricalData();
      
      let forecastData;
      if (activeScenario && activeScenario.forecast) {
        forecastData = activeScenario.forecast;
      } else {
        forecastData = await this.generateForecast(historicalData, 'linear', 12);
      }
      
      this.renderForecastChart(ctx, historicalData, forecastData);
      this.updateForecastMetrics(forecastData);
      
    } catch (error) {
      console.error('❌ Failed to update forecast chart:', error);
    }
  }

  renderForecastChart(ctx, historical, forecast) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Setup chart parameters
    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    const allValues = [...historical.map(d => d.value), ...forecast.forecast];
    const minValue = Math.min(...allValues) * 0.9;
    const maxValue = Math.max(...allValues) * 1.1;
    const valueRange = maxValue - minValue;
    
    // Helper functions
    const getX = (index) => padding + (index / (historical.length + forecast.forecast.length - 1)) * chartWidth;
    const getY = (value) => padding + (1 - (value - minValue) / valueRange) * chartHeight;
    
    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = padding + (i / 10) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Draw historical data
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    historical.forEach((point, index) => {
      const x = getX(index);
      const y = getY(point.value);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Draw historical points
    ctx.fillStyle = '#2196F3';
    historical.forEach((point, index) => {
      const x = getX(index);
      const y = getY(point.value);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Draw forecast
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    
    // Start from last historical point
    const lastHistoricalX = getX(historical.length - 1);
    const lastHistoricalY = getY(historical[historical.length - 1].value);
    ctx.moveTo(lastHistoricalX, lastHistoricalY);
    
    forecast.forecast.forEach((value, index) => {
      const x = getX(historical.length + index);
      const y = getY(value);
      ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw forecast points (draggable)
    ctx.fillStyle = '#FF9800';
    this.forecastPoints = [];
    forecast.forecast.forEach((value, index) => {
      const x = getX(historical.length + index);
      const y = getY(value);
      
      this.forecastPoints.push({
        x: x,
        y: y,
        value: value,
        index: index
      });
      
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add hover effect circle
      ctx.strokeStyle = '#FF9800';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.stroke();
    });
    
    // Draw confidence bands
    if (forecast.confidence) {
      const confidenceWidth = valueRange * (1 - forecast.confidence) * 0.5;
      
      ctx.fillStyle = 'rgba(255, 152, 0, 0.1)';
      ctx.beginPath();
      
      // Upper confidence bound
      ctx.moveTo(lastHistoricalX, lastHistoricalY);
      forecast.forecast.forEach((value, index) => {
        const x = getX(historical.length + index);
        const y = getY(value + confidenceWidth);
        ctx.lineTo(x, y);
      });
      
      // Lower confidence bound (reverse order)
      for (let i = forecast.forecast.length - 1; i >= 0; i--) {
        const x = getX(historical.length + i);
        const y = getY(forecast.forecast[i] - confidenceWidth);
        ctx.lineTo(x, y);
      }
      
      ctx.closePath();
      ctx.fill();
    }
    
    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (valueRange * i / 5);
      const y = getY(value);
      ctx.fillText(this.formatCurrency(value), padding - 10, y + 4);
    }
    
    // X-axis labels (months)
    ctx.textAlign = 'center';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const totalPoints = historical.length + forecast.forecast.length;
    
    for (let i = 0; i < totalPoints; i += Math.max(1, Math.floor(totalPoints / 12))) {
      const x = getX(i);
      const monthIndex = i % 12;
      ctx.fillText(months[monthIndex], x, height - padding + 20);
    }
    
    // Add legend
    this.drawChartLegend(ctx, width, height, padding);
  }

  drawChartLegend(ctx, width, height, padding) {
    const legendY = height - padding + 40;
    
    // Historical data legend
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(padding, legendY, 20, 3);
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Historical Data', padding + 30, legendY + 8);
    
    // Forecast legend
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding + 150, legendY + 1);
    ctx.lineTo(padding + 170, legendY + 1);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#333';
    ctx.fillText('Forecast', padding + 180, legendY + 8);
    
    // Confidence band legend
    ctx.fillStyle = 'rgba(255, 152, 0, 0.3)';
    ctx.fillRect(padding + 250, legendY - 2, 20, 8);
    ctx.fillStyle = '#333';
    ctx.fillText('Confidence Band', padding + 280, legendY + 8);
  }

  // Utility methods
  findNearestForecastPoint(x, y) {
    if (!this.forecastPoints) return null;
    
    let nearest = null;
    let minDistance = Infinity;
    
    this.forecastPoints.forEach((point, index) => {
      const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { ...point, index, distance };
      }
    });
    
    return nearest;
  }

  convertPixelToValue(y) {
    const canvas = document.getElementById('interactive-forecast-chart');
    const padding = 60;
    const chartHeight = canvas.height - 2 * padding;
    
    // This would need the current chart's value range
    // For now, return a placeholder calculation
    const normalizedY = (y - padding) / chartHeight;
    return (1 - normalizedY) * 10000; // Placeholder range
  }

  updateForecastPoint(index, newValue) {
    if (this.forecastPoints && this.forecastPoints[index]) {
      this.forecastPoints[index].value = newValue;
    }
  }

  onForecastAdjusted(point, originalValue) {
    console.log(`📊 Forecast point ${point.index} adjusted from ${originalValue} to ${point.value}`);
    
    // Trigger recalculation of dependent forecast points
    this.propagateManualAdjustment(point.index, point.value, originalValue);
    
    // Update metrics
    this.updateForecastMetrics();
  }

  propagateManualAdjustment(index, newValue, originalValue) {
    // Propagate the adjustment to subsequent points
    const adjustmentRatio = newValue / originalValue;
    
    for (let i = index + 1; i < this.forecastPoints.length; i++) {
      const currentPoint = this.forecastPoints[i];
      const weight = Math.exp(-(i - index) * 0.3); // Exponential decay
      const adjustment = (adjustmentRatio - 1) * weight;
      
      currentPoint.value = currentPoint.value * (1 + adjustment);
    }
  }

  updateForecastMetrics(forecastData) {
    if (!forecastData) return;
    
    const confidenceEl = document.getElementById('forecast-confidence');
    const growthEl = document.getElementById('forecast-growth');
    const volatilityEl = document.getElementById('forecast-volatility');
    const seasonalityEl = document.getElementById('forecast-seasonality');
    
    if (confidenceEl) {
      confidenceEl.textContent = `${Math.round(forecastData.confidence * 100)}%`;
    }
    
    if (growthEl && forecastData.metrics) {
      growthEl.textContent = `${forecastData.metrics.growthRate > 0 ? '+' : ''}${forecastData.metrics.growthRate.toFixed(1)}%`;
    }
    
    if (volatilityEl && forecastData.metrics) {
      const volatility = forecastData.metrics.volatility;
      const volatilityText = volatility < 0.1 ? 'Low' : volatility < 0.3 ? 'Medium' : 'High';
      volatilityEl.textContent = volatilityText;
    }
    
    if (seasonalityEl && forecastData.metrics) {
      const seasonality = forecastData.metrics.seasonality;
      const seasonalityText = seasonality < 0.2 ? 'Weak' : seasonality < 0.5 ? 'Moderate' : 'Strong';
      seasonalityEl.textContent = seasonalityText;
    }
  }

  calculateForecastMetrics(historical, forecast) {
    const historicalValues = historical.map(d => d.value);
    
    // Growth rate calculation
    const initialValue = historicalValues[0];
    const finalForecast = forecast[forecast.length - 1];
    const periods = historical.length + forecast.length;
    const annualGrowthRate = (Math.pow(finalForecast / initialValue, 12 / periods) - 1) * 100;
    
    // Volatility calculation
    const allValues = [...historicalValues, ...forecast];
    const returns = [];
    for (let i = 1; i < allValues.length; i++) {
      returns.push((allValues[i] - allValues[i - 1]) / allValues[i - 1]);
    }
    const volatility = Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / returns.length);
    
    // Seasonality detection
    const seasonality = this.detectSeasonality(allValues);
    
    return {
      growthRate: annualGrowthRate,
      volatility: volatility,
      seasonality: seasonality,
      trend: annualGrowthRate > 0 ? 'positive' : 'negative'
    };
  }

  detectSeasonality(values) {
    const n = values.length;
    if (n < 24) return 0;
    
    // Calculate autocorrelation at lag 12 (annual seasonality)
    const correlation12 = this.calculateAutocorrelation(values, 12);
    return Math.abs(correlation12);
  }

  calculateAutocorrelation(values, lag) {
    const n = values.length;
    if (lag >= n) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n - lag; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
    }
    
    for (let i = 0; i < n; i++) {
      denominator += Math.pow(values[i] - mean, 2);
    }
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  calculateCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  decomposeSeries(values, seasonLength) {
    const n = values.length;
    const trend = new Array(n);
    const seasonal = new Array(seasonLength).fill(0);
    
    // Simple moving average for trend
    const halfSeason = Math.floor(seasonLength / 2);
    for (let i = halfSeason; i < n - halfSeason; i++) {
      let sum = 0;
      for (let j = i - halfSeason; j <= i + halfSeason; j++) {
        sum += values[j];
      }
      trend[i] = sum / (2 * halfSeason + 1);
    }
    
    // Fill trend edges
    for (let i = 0; i < halfSeason; i++) {
      trend[i] = trend[halfSeason];
      trend[n - 1 - i] = trend[n - 1 - halfSeason];
    }
    
    // Calculate seasonal components
    const seasonalSums = new Array(seasonLength).fill(0);
    const seasonalCounts = new Array(seasonLength).fill(0);
    
    for (let i = 0; i < n; i++) {
      const seasonIndex = i % seasonLength;
      if (trend[i] > 0) {
        seasonalSums[seasonIndex] += values[i] / trend[i];
        seasonalCounts[seasonIndex]++;
      }
    }
    
    for (let i = 0; i < seasonLength; i++) {
      seasonal[i] = seasonalCounts[i] > 0 ? seasonalSums[i] / seasonalCounts[i] : 1;
    }
    
    return { trend, seasonal };
  }

  calculateTrendSlope(trend) {
    const n = trend.length;
    const x = Array.from({ length: n }, (_, i) => i);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = trend.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * trend[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  normalRandom() {
    // Box-Muller transformation for normal distribution
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  async getHistoricalData() {
    // Mock historical data - in real app, fetch from data service
    const months = 24;
    const data = [];
    
    for (let i = 0; i < months; i++) {
      const baseValue = 8000;
      const trend = i * 200;
      const seasonal = Math.sin(i * Math.PI / 6) * 2000;
      const noise = (Math.random() - 0.5) * 1000;
      
      data.push({
        month: i,
        value: Math.max(0, baseValue + trend + seasonal + noise),
        date: new Date(2024, i % 12, 1)
      });
    }
    
    return data;
  }

  // Public API
  showScenarioDialog() {
    // Create custom scenario dialog
    const dialog = document.createElement('div');
    dialog.className = 'scenario-dialog-overlay';
    
    dialog.innerHTML = `
      <div class="scenario-dialog">
        <h3>Create New Scenario</h3>
        <form id="scenario-form">
          <label>Scenario Name: <input type="text" id="scenario-name" required></label>
          <label>Icon: <input type="text" id="scenario-icon" value="📊" maxlength="2"></label>
          <label>Growth Factor: <input type="range" id="dialog-growth" min="0.5" max="2" step="0.1" value="1"></label>
          <label>Seasonality: <input type="range" id="dialog-seasonality" min="0" max="2" step="0.1" value="1"></label>
          <label>Volatility: <input type="range" id="dialog-volatility" min="0.1" max="3" step="0.1" value="1"></label>
          <label>Description: <textarea id="scenario-description" rows="3"></textarea></label>
          
          <div class="dialog-buttons">
            <button type="button" onclick="this.closest('.scenario-dialog-overlay').remove()">Cancel</button>
            <button type="submit">Create Scenario</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Handle form submission
    document.getElementById('scenario-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('scenario-name').value;
      const icon = document.getElementById('scenario-icon').value;
      const growth = parseFloat(document.getElementById('dialog-growth').value);
      const seasonality = parseFloat(document.getElementById('dialog-seasonality').value);
      const volatility = parseFloat(document.getElementById('dialog-volatility').value);
      const description = document.getElementById('scenario-description').value;
      
      const scenarioId = `custom-${Date.now()}`;
      this.createScenario(scenarioId, {
        name, icon, description,
        growthFactor: growth,
        seasonalityFactor: seasonality,
        volatilityFactor: volatility
      });
      
      dialog.remove();
    });
  }

  updateForecastModel(model) {
    this.currentModel = model;
    this.updateMainForecastChart();
  }

  updateForecastPeriods(periods) {
    this.forecastParameters.periods = periods;
    this.updateMainForecastChart();
  }

  updateManualAdjustments() {
    const growth = parseFloat(document.getElementById('growth-factor')?.value || 1);
    const seasonality = parseFloat(document.getElementById('seasonality-factor')?.value || 1);
    const volatility = parseFloat(document.getElementById('volatility-factor')?.value || 1);
    
    // Create temporary scenario with manual adjustments
    const manualScenario = {
      id: 'manual-adjustment',
      name: 'Manual Adjustment',
      icon: '🎛️',
      parameters: {
        growthFactor: growth,
        seasonalityFactor: seasonality,
        volatilityFactor: volatility
      },
      active: true
    };
    
    // Deactivate other scenarios
    this.scenarios.forEach(s => s.active = false);
    this.scenarios.set('manual-adjustment', manualScenario);
    
    this.updateMainForecastChart();
  }
} // end class definition

// Singleton holder
let __forecastInstance = null;

function getForecastInstance(){
  if(!IF_BROWSER) return null;
  if(!__forecastInstance){
    try { __forecastInstance = new InteractiveForecastingEngine(); }
    catch(e){ console.warn('[interactive-forecasting] init failed', e); return null; }
  }
  return __forecastInstance;
}

export function initForecastEngine(){
  return getForecastInstance() !== null;
}

export function generateScenarios(){
  const inst = getForecastInstance();
  if(!inst){
    // minimal fallback scenario data
    const months = 6;
    const now = new Date();
    const series = Array.from({length: months}, (_,i)=> ({ month: `${now.getFullYear()}-${String(now.getMonth()+1+i).padStart(2,'0')}`, label: `${i+1}`, value: 1000 + i*120 }));
    return [{ id:'baseline', name:'Baseline', icon:'📊', series }];
  }
  return Array.from(inst.scenarios.values());
}

export default { initForecastEngine, generateScenarios };
