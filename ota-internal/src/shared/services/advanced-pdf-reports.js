// Advanced PDF Report Generation System with jsPDF (optional)
// Removed top-level dynamic import (was causing 500 in some environments without ESM top-level await support)
// Replaced with lazy loader accessed only when PDF generation is invoked.
let jsPDFLib = null;
let autoTableLoaded = false;
let pdfLoadPromise = null;

async function ensurePDFLib() {
  if (jsPDFLib && autoTableLoaded) return jsPDFLib;
  if (pdfLoadPromise) return pdfLoadPromise;
  pdfLoadPromise = (async () => {
    try {
  const jspdfPkg = 'jspdf';
  const autotablePkg = 'jspdf-autotable';
  const mod = await import(/* @vite-ignore */ jspdfPkg);
  await import(/* @vite-ignore */ autotablePkg);
      jsPDFLib = mod;
      autoTableLoaded = true;
    } catch (e) {
      console.warn('[advanced-pdf-reports] jspdf/jspdf-autotable not installed – PDF generation disabled. Install with: npm i jspdf jspdf-autotable');
    }
    return jsPDFLib;
  })();
  return pdfLoadPromise;
}

class AdvancedPDFReportEngine {
  constructor() {
    this.reportTemplates = {
      financial: this.generateFinancialReport.bind(this),
      tax: this.generateTaxReport.bind(this),
      performance: this.generatePerformanceReport.bind(this),
      forecast: this.generateForecastReport.bind(this),
      expense: this.generateExpenseReport.bind(this),
      custom: this.generateCustomReport.bind(this)
    };
    
    this.brandConfig = {
      primaryColor: [41, 128, 185],
      secondaryColor: [52, 73, 94],
      accentColor: [230, 126, 34],
      lightGray: [236, 240, 241],
      darkGray: [127, 140, 141],
      
      fonts: {
        title: 'helvetica',
        heading: 'helvetica',
        body: 'helvetica',
        mono: 'courier'
      },
      
      logo: null, // Will be loaded
      companyInfo: {
        name: 'On Tour Music Management',
        address: '123 Music Street, Los Angeles, CA 90210',
        phone: '+1 (555) 123-4567',
        email: 'contact@ontour.com',
        website: 'www.ontour.com'
      }
    };
    
    this.chartCache = new Map();
    this.isInitialized = false;
    
    // Defer init until DOM is ready (avoid errors in non-browser contexts)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
      } else {
        this.init();
      }
    }
  }

  async init() {
    console.log('📄 Initializing Advanced PDF Report Engine...');
    
    try {
      // Setup report UI
      if (typeof document !== 'undefined') {
        this.createReportInterface();
      }
      
      // Load brand assets
  await this.loadBrandAssets();
      
      // Setup event listeners
      if (typeof document !== 'undefined') {
        this.setupEventListeners();
      }
      
      this.isInitialized = true;
      console.log('✅ PDF Report Engine initialized');
      
    } catch (error) {
      console.error('❌ PDF Report Engine initialization failed:', error);
    }
  }

  createReportInterface() {
    const reportContainer = document.createElement('div');
    reportContainer.id = 'pdf-report-container';
    reportContainer.className = 'report-container';
    
    reportContainer.innerHTML = `
      <div class="report-header">
        <h3>📄 Professional PDF Reports</h3>
        <div class="report-controls">
          <select id="report-type" class="report-select">
            <option value="financial">Financial Summary</option>
            <option value="tax">Tax Report</option>
            <option value="performance">Performance Analysis</option>
            <option value="forecast">Forecast Report</option>
            <option value="expense">Expense Analysis</option>
            <option value="custom">Custom Report</option>
          </select>
          
          <select id="report-period" class="report-select">
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="ytd">Year to Date</option>
            <option value="custom">Custom Period</option>
          </select>
          
          <div id="custom-period" class="custom-period" style="display: none;">
            <input type="date" id="period-start" class="report-input">
            <input type="date" id="period-end" class="report-input">
          </div>
          
          <button id="generate-report" class="report-btn primary">
            📊 Generate Report
          </button>
        </div>
      </div>
      
      <div class="report-main">
        <div class="report-templates">
          <h4>📋 Quick Templates</h4>
          <div class="template-grid">
            <div class="template-card" data-template="monthly-summary">
              <div class="template-icon">📈</div>
              <div class="template-name">Monthly Summary</div>
              <div class="template-desc">Revenue, expenses, and profit analysis</div>
            </div>
            
            <div class="template-card" data-template="tax-preparation">
              <div class="template-icon">🧾</div>
              <div class="template-name">Tax Preparation</div>
              <div class="template-desc">Organized expenses by category</div>
            </div>
            
            <div class="template-card" data-template="investor-report">
              <div class="template-icon">💼</div>
              <div class="template-name">Investor Report</div>
              <div class="template-desc">Professional financial overview</div>
            </div>
            
            <div class="template-card" data-template="venue-analysis">
              <div class="template-icon">🎭</div>
              <div class="template-name">Venue Analysis</div>
              <div class="template-desc">Performance by venue comparison</div>
            </div>
            
            <div class="template-card" data-template="tour-report">
              <div class="template-icon">🚌</div>
              <div class="template-name">Tour Report</div>
              <div class="template-desc">Complete tour financial breakdown</div>
            </div>
            
            <div class="template-card" data-template="forecast-presentation">
              <div class="template-icon">🔮</div>
              <div class="template-name">Forecast Presentation</div>
              <div class="template-desc">Future projections and scenarios</div>
            </div>
          </div>
        </div>
        
        <div class="report-customization">
          <h4>🎨 Customization Options</h4>
          <div class="customization-options">
            <div class="option-group">
              <label class="option-label">Include Charts:</label>
              <div class="checkbox-group">
                <label><input type="checkbox" id="include-revenue-chart" checked> Revenue Trends</label>
                <label><input type="checkbox" id="include-expense-chart" checked> Expense Breakdown</label>
                <label><input type="checkbox" id="include-profit-chart" checked> Profit Analysis</label>
                <label><input type="checkbox" id="include-forecast-chart"> Forecast Charts</label>
              </div>
            </div>
            
            <div class="option-group">
              <label class="option-label">Data Sections:</label>
              <div class="checkbox-group">
                <label><input type="checkbox" id="include-summary" checked> Executive Summary</label>
                <label><input type="checkbox" id="include-detailed-tables" checked> Detailed Tables</label>
                <label><input type="checkbox" id="include-comparisons"> Period Comparisons</label>
                <label><input type="checkbox" id="include-recommendations"> Recommendations</label>
              </div>
            </div>
            
            <div class="option-group">
              <label class="option-label">Report Style:</label>
              <select id="report-style" class="report-select">
                <option value="professional">Professional</option>
                <option value="creative">Creative</option>
                <option value="minimal">Minimal</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
            
            <div class="option-group">
              <label class="option-label">Page Orientation:</label>
              <select id="page-orientation" class="report-select">
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div class="report-preview">
        <h4>👁️ Report Preview</h4>
        <div id="report-preview-container" class="preview-container">
          <div class="preview-placeholder">
            Select a template or generate a report to see preview
          </div>
        </div>
      </div>
      
      <div class="report-generation-status" id="report-status" style="display: none;">
        <div class="status-content">
          <div class="status-spinner"></div>
          <div class="status-text">Generating professional PDF report...</div>
          <div class="status-progress">
            <div class="progress-bar" id="report-progress"></div>
          </div>
        </div>
      </div>
    `;
    
    // Insert into the page
    const targetContainer = document.querySelector('.finance-dashboard') || document.body;
    targetContainer.appendChild(reportContainer);
  }

  async loadBrandAssets() {
    // In a real implementation, load actual logo and brand assets
    console.log('🎨 Loading brand assets...');
    
    // For now, create a simple text-based logo
    this.brandConfig.logo = {
      text: 'On Tour',
      width: 60,
      height: 20
    };
  }

  setupEventListeners() {
    // Report type selection
    document.getElementById('report-type')?.addEventListener('change', (e) => {
      this.updateReportPreview(e.target.value);
    });
    
    // Period selection
    document.getElementById('report-period')?.addEventListener('change', (e) => {
      const customPeriod = document.getElementById('custom-period');
      if (e.target.value === 'custom') {
        customPeriod.style.display = 'block';
      } else {
        customPeriod.style.display = 'none';
      }
    });
    
    // Generate report button
    document.getElementById('generate-report')?.addEventListener('click', () => {
      this.generateSelectedReport();
    });
    
    // Template cards
    document.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        const template = card.dataset.template;
        this.generateFromTemplate(template);
      });
    });
    
    // Customization options
    ['include-revenue-chart', 'include-expense-chart', 'include-profit-chart', 
     'include-forecast-chart', 'include-summary', 'include-detailed-tables',
     'include-comparisons', 'include-recommendations'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => {
        this.updateReportPreview();
      });
    });
  }

  async generateSelectedReport() {
    await ensurePDFLib();
    const reportType = document.getElementById('report-type')?.value || 'financial';
    const period = document.getElementById('report-period')?.value || 'month';
    
    const customOptions = this.getCustomizationOptions();
    const reportData = await this.prepareReportData(period);
    
    await this.generateReport(reportType, reportData, customOptions);
  }

  getCustomizationOptions() {
    return {
      includeCharts: {
        revenue: document.getElementById('include-revenue-chart')?.checked || false,
        expense: document.getElementById('include-expense-chart')?.checked || false,
        profit: document.getElementById('include-profit-chart')?.checked || false,
        forecast: document.getElementById('include-forecast-chart')?.checked || false
      },
      includeSections: {
        summary: document.getElementById('include-summary')?.checked || false,
        detailedTables: document.getElementById('include-detailed-tables')?.checked || false,
        comparisons: document.getElementById('include-comparisons')?.checked || false,
        recommendations: document.getElementById('include-recommendations')?.checked || false
      },
      style: document.getElementById('report-style')?.value || 'professional',
      orientation: document.getElementById('page-orientation')?.value || 'portrait'
    };
  }

  async prepareReportData(period) {
    // Mock data preparation - in real app, fetch from data service
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'ytd':
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      case 'custom':
        const startInput = document.getElementById('period-start')?.value;
        const endInput = document.getElementById('period-end')?.value;
        if (startInput) startDate = new Date(startInput);
        if (endInput) endDate = new Date(endInput);
        break;
    }
    
    return {
      period: {
        start: startDate,
        end: endDate,
        type: period
      },
      financial: {
        totalRevenue: 125000,
        totalExpenses: 87500,
        netProfit: 37500,
        profitMargin: 0.3,
        growthRate: 0.125,
        showCount: 18,
        averageRevenue: 6944
      },
      expenses: [
        { category: 'Travel', amount: 25000, percentage: 28.6 },
        { category: 'Accommodation', amount: 18500, percentage: 21.1 },
        { category: 'Equipment', amount: 15000, percentage: 17.1 },
        { category: 'Marketing', amount: 12000, percentage: 13.7 },
        { category: 'Food', amount: 8500, percentage: 9.7 },
        { category: 'Other', amount: 8500, percentage: 9.7 }
      ],
      revenue: [
        { source: 'Show Revenue', amount: 95000, percentage: 76.0 },
        { source: 'Merchandise', amount: 18000, percentage: 14.4 },
        { source: 'Streaming', amount: 7500, percentage: 6.0 },
        { source: 'Other', amount: 4500, percentage: 3.6 }
      ],
      shows: this.generateShowData(),
      trends: this.generateTrendData(),
      forecast: this.generateForecastData()
    };
  }

  generateShowData() {
    const shows = [];
    const venues = ['Madison Square Garden', 'The Fillmore', 'Red Rocks', 'House of Blues', 'The Roxy'];
    const cities = ['New York', 'San Francisco', 'Denver', 'Los Angeles', 'Boston'];
    
    for (let i = 0; i < 18; i++) {
      shows.push({
        date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        venue: venues[Math.floor(Math.random() * venues.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        attendance: Math.floor(Math.random() * 2000) + 500,
        revenue: Math.floor(Math.random() * 15000) + 3000,
        expenses: Math.floor(Math.random() * 8000) + 2000
      });
    }
    
    return shows.sort((a, b) => a.date - b.date);
  }

  generateTrendData() {
    const months = 12;
    const trends = [];
    
    for (let i = 0; i < months; i++) {
      const baseRevenue = 8000;
      const seasonalityFactor = Math.sin(i * Math.PI / 6) * 2000;
      const growthFactor = i * 200;
      const randomFactor = (Math.random() - 0.5) * 1000;
      
      const revenue = Math.max(0, baseRevenue + seasonalityFactor + growthFactor + randomFactor);
      const expenses = revenue * (0.6 + Math.random() * 0.2);
      
      trends.push({
        month: i,
        monthName: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        revenue: revenue,
        expenses: expenses,
        profit: revenue - expenses
      });
    }
    
    return trends;
  }

  generateForecastData() {
    const periods = 6;
    const forecast = [];
    
    for (let i = 0; i < periods; i++) {
      forecast.push({
        period: i + 1,
        revenue: 9000 + i * 300 + (Math.random() - 0.5) * 1000,
        expenses: 6200 + i * 150 + (Math.random() - 0.5) * 800,
        confidence: 0.85 - i * 0.05
      });
    }
    
    return forecast;
  }

  async generateReport(type, data, options) {
    await ensurePDFLib();
    this.showGenerationStatus(true);
    this.updateProgress(0);
    
    try {
      console.log(`📄 Generating ${type} report...`);
      
      const generator = this.reportTemplates[type];
      if (!generator) {
        throw new Error(`Unknown report type: ${type}`);
      }
      
      this.updateProgress(20);
      
      // Generate the report
      const pdf = await generator(data, options);
      
      this.updateProgress(80);
      
      // Generate filename
      const filename = this.generateFilename(type, data.period);
      
      this.updateProgress(100);
      
      // Save the PDF
      pdf.save(filename);
      
      console.log(`✅ Report generated successfully: ${filename}`);
      
      // Show success message
      this.showSuccessMessage(filename);
      
    } catch (error) {
      console.error('❌ Report generation failed:', error);
      this.showErrorMessage(error.message);
    } finally {
      setTimeout(() => this.showGenerationStatus(false), 2000);
    }
  }

  async generateFinancialReport(data, options) {
  if(!jsPDFLib){ console.warn('[pdf] generateFinancialReport skipped'); return { save(){}, output:()=>'' }; }
  const { default: jsPDF } = jsPDFLib;
  const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: 'a4'
    });
    
    let yPosition = 20;
    
    // Header
    yPosition = this.addReportHeader(pdf, 'Financial Summary Report', data.period, yPosition);
    
    // Executive Summary
    if (options.includeSections.summary) {
      yPosition = this.addExecutiveSummary(pdf, data, yPosition);
    }
    
    // Financial Overview
    yPosition = this.addFinancialOverview(pdf, data, yPosition);
    
    // Charts
    if (options.includeCharts.revenue || options.includeCharts.expense || options.includeCharts.profit) {
      yPosition = await this.addFinancialCharts(pdf, data, options.includeCharts, yPosition);
    }
    
    // Detailed Tables
    if (options.includeSections.detailedTables) {
      yPosition = this.addDetailedTables(pdf, data, yPosition);
    }
    
    // Period Comparisons
    if (options.includeSections.comparisons) {
      yPosition = this.addPeriodComparisons(pdf, data, yPosition);
    }
    
    // Recommendations
    if (options.includeSections.recommendations) {
      yPosition = this.addRecommendations(pdf, data, yPosition);
    }
    
    // Footer
    this.addReportFooter(pdf);
    
    return pdf;
  }

  async generateTaxReport(data, options) {
  if(!jsPDFLib){ console.warn('[pdf] generateTaxReport skipped'); return { save(){}, output:()=>'' }; }
  const { default: jsPDF } = jsPDFLib;
  const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: 'a4'
    });
    
    let yPosition = 20;
    
    // Header
    yPosition = this.addReportHeader(pdf, 'Tax Preparation Report', data.period, yPosition);
    
    // Tax Summary
    yPosition = this.addTaxSummary(pdf, data, yPosition);
    
    // Expense Categories for Tax
    yPosition = this.addTaxExpenseCategories(pdf, data, yPosition);
    
    // Deduction Analysis
    yPosition = this.addDeductionAnalysis(pdf, data, yPosition);
    
    // Supporting Documentation
    yPosition = this.addSupportingDocumentation(pdf, data, yPosition);
    
    this.addReportFooter(pdf);
    return pdf;
  }

  async generatePerformanceReport(data, options) {
  if(!jsPDFLib){ console.warn('[pdf] generatePerformanceReport skipped'); return { save(){}, output:()=>'' }; }
  const { default: jsPDF } = jsPDFLib;
  const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: 'a4'
    });
    
    let yPosition = 20;
    
    // Header
    yPosition = this.addReportHeader(pdf, 'Performance Analysis Report', data.period, yPosition);
    
    // Performance Metrics
    yPosition = this.addPerformanceMetrics(pdf, data, yPosition);
    
    // Show Analysis
    yPosition = this.addShowAnalysis(pdf, data, yPosition);
    
    // Venue Performance
    yPosition = this.addVenuePerformance(pdf, data, yPosition);
    
    // Trend Analysis
    if (options.includeCharts.revenue) {
      yPosition = await this.addTrendCharts(pdf, data, yPosition);
    }
    
    this.addReportFooter(pdf);
    return pdf;
  }

  async generateForecastReport(data, options) {
  if(!jsPDFLib){ console.warn('[pdf] generateForecastReport skipped'); return { save(){}, output:()=>'' }; }
  const { default: jsPDF } = jsPDFLib;
  const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: 'a4'
    });
    
    let yPosition = 20;
    
    // Header
    yPosition = this.addReportHeader(pdf, 'Financial Forecast Report', data.period, yPosition);
    
    // Forecast Summary
    yPosition = this.addForecastSummary(pdf, data, yPosition);
    
    // Forecast Charts
    if (options.includeCharts.forecast) {
      yPosition = await this.addForecastCharts(pdf, data, yPosition);
    }
    
    // Scenario Analysis
    yPosition = this.addScenarioAnalysis(pdf, data, yPosition);
    
    // Risk Assessment
    yPosition = this.addRiskAssessment(pdf, data, yPosition);
    
    this.addReportFooter(pdf);
    return pdf;
  }

  async generateExpenseReport(data, options) {
  if(!jsPDFLib){ console.warn('[pdf] generateExpenseReport skipped'); return { save(){}, output:()=>'' }; }
  const { default: jsPDF } = jsPDFLib;
  const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: 'a4'
    });
    
    let yPosition = 20;
    
    // Header
    yPosition = this.addReportHeader(pdf, 'Expense Analysis Report', data.period, yPosition);
    
    // Expense Overview
    yPosition = this.addExpenseOverview(pdf, data, yPosition);
    
    // Category Breakdown
    if (options.includeCharts.expense) {
      yPosition = await this.addExpenseBreakdownChart(pdf, data, yPosition);
    }
    
    // Detailed Expense Analysis
    yPosition = this.addDetailedExpenseAnalysis(pdf, data, yPosition);
    
    // Cost Optimization Suggestions
    yPosition = this.addCostOptimization(pdf, data, yPosition);
    
    this.addReportFooter(pdf);
    return pdf;
  }

  // PDF Layout Helper Methods
  addReportHeader(pdf, title, period, yPosition) {
    const pageWidth = pdf.internal.pageSize.width;
    
    // Brand Header
    pdf.setFillColor(...this.brandConfig.primaryColor);
    pdf.rect(0, 0, pageWidth, 25, 'F');
    
    // Logo/Company Name
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont(this.brandConfig.fonts.title, 'bold');
    pdf.text(this.brandConfig.companyInfo.name, 20, 15);
    
    // Date
    pdf.setFontSize(10);
    pdf.text(new Date().toLocaleDateString(), pageWidth - 40, 15);
    
    // Report Title
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(18);
    pdf.setFont(this.brandConfig.fonts.heading, 'bold');
    pdf.text(title, 20, yPosition + 15);
    
    // Period
    pdf.setFontSize(12);
    pdf.setFont(this.brandConfig.fonts.body, 'normal');
    const periodText = `Period: ${period.start.toLocaleDateString()} - ${period.end.toLocaleDateString()}`;
    pdf.text(periodText, 20, yPosition + 25);
    
    return yPosition + 40;
  }

  addExecutiveSummary(pdf, data, yPosition) {
    // Section Header
    yPosition = this.addSectionHeader(pdf, 'Executive Summary', yPosition);
    
    // Key Metrics Grid
    const metrics = [
      { label: 'Total Revenue', value: this.formatCurrency(data.financial.totalRevenue), color: [46, 204, 113] },
      { label: 'Total Expenses', value: this.formatCurrency(data.financial.totalExpenses), color: [231, 76, 60] },
      { label: 'Net Profit', value: this.formatCurrency(data.financial.netProfit), color: [52, 152, 219] },
      { label: 'Profit Margin', value: `${(data.financial.profitMargin * 100).toFixed(1)}%`, color: [155, 89, 182] }
    ];
    
    const boxWidth = 40;
    const boxHeight = 20;
    const spacing = 5;
    let xPosition = 20;
    
    metrics.forEach((metric, index) => {
      // Metric Box
      pdf.setFillColor(...metric.color);
      pdf.rect(xPosition, yPosition, boxWidth, boxHeight, 'F');
      
      // Value
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont(this.brandConfig.fonts.heading, 'bold');
      pdf.text(metric.value, xPosition + boxWidth/2, yPosition + 8, { align: 'center' });
      
      // Label
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.setFont(this.brandConfig.fonts.body, 'normal');
      pdf.text(metric.label, xPosition + boxWidth/2, yPosition + boxHeight + 5, { align: 'center' });
      
      xPosition += boxWidth + spacing;
    });
    
    yPosition += boxHeight + 15;
    
    // Summary Text
    pdf.setFontSize(10);
    pdf.setFont(this.brandConfig.fonts.body, 'normal');
    const summaryText = `During this period, we achieved a total revenue of ${this.formatCurrency(data.financial.totalRevenue)} ` +
      `with ${data.financial.showCount} shows performed. Our profit margin of ${(data.financial.profitMargin * 100).toFixed(1)}% ` +
      `demonstrates strong financial performance with a growth rate of ${(data.financial.growthRate * 100).toFixed(1)}%.`;
    
    const splitText = pdf.splitTextToSize(summaryText, 170);
    pdf.text(splitText, 20, yPosition);
    
    return yPosition + splitText.length * 4 + 10;
  }

  addFinancialOverview(pdf, data, yPosition) {
    yPosition = this.addSectionHeader(pdf, 'Financial Overview', yPosition);
    
    // Revenue Table
    const revenueData = data.revenue.map(item => [
      item.source,
      this.formatCurrency(item.amount),
      `${item.percentage.toFixed(1)}%`
    ]);
    
    pdf.autoTable({
      startY: yPosition,
      head: [['Revenue Source', 'Amount', 'Percentage']],
      body: revenueData,
      theme: 'grid',
      headStyles: { fillColor: this.brandConfig.primaryColor },
      styles: { fontSize: 9 },
      margin: { left: 20 }
    });
    
    yPosition = pdf.lastAutoTable.finalY + 10;
    
    // Expense Table
    const expenseData = data.expenses.map(item => [
      item.category,
      this.formatCurrency(item.amount),
      `${item.percentage.toFixed(1)}%`
    ]);
    
    pdf.autoTable({
      startY: yPosition,
      head: [['Expense Category', 'Amount', 'Percentage']],
      body: expenseData,
      theme: 'grid',
      headStyles: { fillColor: this.brandConfig.accentColor },
      styles: { fontSize: 9 },
      margin: { left: 20 }
    });
    
    return pdf.lastAutoTable.finalY + 15;
  }

  async addFinancialCharts(pdf, data, chartOptions, yPosition) {
    yPosition = this.addSectionHeader(pdf, 'Financial Charts', yPosition);
    
    // Check if we need a new page
    if (yPosition > 200) {
      pdf.addPage();
      yPosition = 20;
    }
    
    if (chartOptions.revenue) {
      // Revenue Pie Chart (simplified representation)
      yPosition = this.addSimplePieChart(pdf, 'Revenue Breakdown', data.revenue, yPosition);
    }
    
    if (chartOptions.expense) {
      // Expense Pie Chart
      yPosition = this.addSimplePieChart(pdf, 'Expense Breakdown', data.expenses, yPosition, 100);
    }
    
    return yPosition + 10;
  }

  addSimplePieChart(pdf, title, data, yPosition, xOffset = 20) {
    // Chart Title
    pdf.setFontSize(12);
    pdf.setFont(this.brandConfig.fonts.heading, 'bold');
    pdf.text(title, xOffset, yPosition);
    yPosition += 10;
    
    // Chart Legend
    const colors = [
      [52, 152, 219], [46, 204, 113], [155, 89, 182], 
      [241, 196, 15], [230, 126, 34], [231, 76, 60]
    ];
    
    data.forEach((item, index) => {
      const color = colors[index % colors.length];
      
      // Color box
      pdf.setFillColor(...color);
      pdf.rect(xOffset, yPosition, 4, 4, 'F');
      
      // Label and value
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.text(`${item.category || item.source}: ${item.percentage.toFixed(1)}%`, xOffset + 8, yPosition + 3);
      
      yPosition += 6;
    });
    
    return yPosition + 5;
  }

  addDetailedTables(pdf, data, yPosition) {
    yPosition = this.addSectionHeader(pdf, 'Detailed Analysis', yPosition);
    
    // Show Performance Table
    const showData = data.shows.slice(0, 10).map(show => [
      show.date.toLocaleDateString(),
      show.venue,
      show.city,
      show.attendance.toString(),
      this.formatCurrency(show.revenue),
      this.formatCurrency(show.expenses),
      this.formatCurrency(show.revenue - show.expenses)
    ]);
    
    pdf.autoTable({
      startY: yPosition,
      head: [['Date', 'Venue', 'City', 'Attendance', 'Revenue', 'Expenses', 'Profit']],
      body: showData,
      theme: 'striped',
      headStyles: { fillColor: this.brandConfig.primaryColor },
      styles: { fontSize: 8 },
      columnStyles: {
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' }
      },
      margin: { left: 20 }
    });
    
    return pdf.lastAutoTable.finalY + 15;
  }

  addRecommendations(pdf, data, yPosition) {
    yPosition = this.addSectionHeader(pdf, 'Recommendations', yPosition);
    
    const recommendations = [
      '• Consider increasing marketing spend for higher-performing venues',
      '• Optimize travel routes to reduce transportation costs',
      '• Negotiate better rates with frequently used accommodation providers',
      '• Explore merchandise opportunities at shows with high attendance',
      '• Monitor seasonal trends for better show scheduling'
    ];
    
    pdf.setFontSize(10);
    pdf.setFont(this.brandConfig.fonts.body, 'normal');
    
    recommendations.forEach(rec => {
      pdf.text(rec, 20, yPosition);
      yPosition += 6;
    });
    
    return yPosition + 10;
  }

  addSectionHeader(pdf, title, yPosition) {
    // Check if we need a new page
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFillColor(...this.brandConfig.lightGray);
    pdf.rect(20, yPosition - 2, 170, 8, 'F');
    
    pdf.setTextColor(...this.brandConfig.secondaryColor);
    pdf.setFontSize(14);
    pdf.setFont(this.brandConfig.fonts.heading, 'bold');
    pdf.text(title, 22, yPosition + 4);
    
    pdf.setTextColor(0, 0, 0);
    
    return yPosition + 15;
  }

  addReportFooter(pdf) {
    const pageCount = pdf.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      const pageHeight = pdf.internal.pageSize.height;
      const pageWidth = pdf.internal.pageSize.width;
      
      // Footer line
      pdf.setDrawColor(...this.brandConfig.lightGray);
      pdf.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
      
      // Company info
      pdf.setTextColor(...this.brandConfig.darkGray);
      pdf.setFontSize(8);
      pdf.text(this.brandConfig.companyInfo.name, 20, pageHeight - 12);
      pdf.text(this.brandConfig.companyInfo.email, 20, pageHeight - 7);
      
      // Page number
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 40, pageHeight - 12);
    }
  }

  // Specialized report sections
  addTaxSummary(pdf, data, yPosition) {
    yPosition = this.addSectionHeader(pdf, 'Tax Summary', yPosition);
    
    const taxData = [
      ['Total Business Income', this.formatCurrency(data.financial.totalRevenue)],
      ['Total Business Expenses', this.formatCurrency(data.financial.totalExpenses)],
      ['Net Business Income', this.formatCurrency(data.financial.netProfit)],
      ['Estimated Tax Liability', this.formatCurrency(data.financial.netProfit * 0.25)]
    ];
    
    pdf.autoTable({
      startY: yPosition,
      body: taxData,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 20 }
    });
    
    return pdf.lastAutoTable.finalY + 15;
  }

  addPerformanceMetrics(pdf, data, yPosition) {
    yPosition = this.addSectionHeader(pdf, 'Performance Metrics', yPosition);
    
    const metrics = [
      ['Total Shows Performed', data.financial.showCount.toString()],
      ['Average Revenue per Show', this.formatCurrency(data.financial.averageRevenue)],
      ['Best Performing Month', 'August'],
      ['Revenue Growth Rate', `${(data.financial.growthRate * 100).toFixed(1)}%`],
      ['Cost per Attendee', '$12.50']
    ];
    
    pdf.autoTable({
      startY: yPosition,
      body: metrics,
      theme: 'striped',
      styles: { fontSize: 10 },
      margin: { left: 20 }
    });
    
    return pdf.lastAutoTable.finalY + 15;
  }

  // Utility methods
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  generateFilename(type, period) {
    const dateStr = new Date().toISOString().split('T')[0];
    const periodStr = `${period.start.toISOString().split('T')[0]}_to_${period.end.toISOString().split('T')[0]}`;
    return `${type}_report_${periodStr}_generated_${dateStr}.pdf`;
  }

  showGenerationStatus(show) {
    const statusEl = document.getElementById('report-status');
    if (statusEl) {
      statusEl.style.display = show ? 'block' : 'none';
    }
  }

  updateProgress(percentage) {
    const progressEl = document.getElementById('report-progress');
    if (progressEl) {
      progressEl.style.width = `${percentage}%`;
    }
  }

  showSuccessMessage(filename) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'report-notification success';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">✅</span>
        <span class="notification-text">Report generated successfully: ${filename}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  showErrorMessage(error) {
    const notification = document.createElement('div');
    notification.className = 'report-notification error';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">❌</span>
        <span class="notification-text">Report generation failed: ${error}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
  }

  updateReportPreview(reportType) {
    const previewContainer = document.getElementById('report-preview-container');
    if (!previewContainer) return;
    
    const previews = {
      financial: 'Executive Summary • Financial Overview • Revenue/Expense Charts • Detailed Tables • Recommendations',
      tax: 'Tax Summary • Expense Categories • Deduction Analysis • Supporting Documentation',
      performance: 'Performance Metrics • Show Analysis • Venue Performance • Trend Charts',
      forecast: 'Forecast Summary • Projection Charts • Scenario Analysis • Risk Assessment',
      expense: 'Expense Overview • Category Breakdown • Detailed Analysis • Cost Optimization',
      custom: 'Custom sections based on your selections'
    };
    
    previewContainer.innerHTML = `
      <div class="preview-content">
        <h5>📋 ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h5>
        <p>${previews[reportType] || 'Preview not available'}</p>
      </div>
    `;
  }

  generateFromTemplate(template) {
    const templateConfigs = {
      'monthly-summary': { type: 'financial', period: 'month' },
      'tax-preparation': { type: 'tax', period: 'year' },
      'investor-report': { type: 'performance', period: 'quarter' },
      'venue-analysis': { type: 'performance', period: 'year' },
      'tour-report': { type: 'financial', period: 'custom' },
      'forecast-presentation': { type: 'forecast', period: 'month' }
    };
    
    const config = templateConfigs[template];
    if (config) {
      // Set form values
      document.getElementById('report-type').value = config.type;
      document.getElementById('report-period').value = config.period;
      
      // Generate report
      this.generateSelectedReport();
    }
  }
}

// Make it globally available (browser only)
if (typeof window !== 'undefined') {
  window.AdvancedPDFReportEngine = AdvancedPDFReportEngine;
}

export default AdvancedPDFReportEngine;
