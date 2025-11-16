/**
 * WebAssembly Performance Metrics Integration
 * 
 * Professional real-time performance monitoring system that integrates
 * WebAssembly performance data with React Query, Memory Management,
 * and Virtualization systems for comprehensive performance insights.
 */

import { memoryMonitor } from './memoryManagement';
import { logger } from './logger';

// ============================================================================
// PERFORMANCE METRICS TYPES
// ============================================================================

export interface WAsmPerformanceMetrics {
  // WebAssembly execution metrics
  wasmExecutionTime: number;
  wasmMemoryUsage: number;
  wasmFunctionCalls: number;
  
  // React performance metrics
  reactRenderTime: number;
  reactComponentCount: number;
  reactRerenderCount: number;
  
  // Network performance metrics
  networkLatency: number;
  queryResponseTime: number;
  firestoreLatency: number;
  
  // Memory performance metrics
  jsHeapSize: number;
  memoryLeakScore: number;
  gcFrequency: number;
  
  // Virtualization metrics
  virtualizedItemsRendered: number;
  scrollPerformance: number;
  listRenderTime: number;
  
  // Overall performance score (0-100)
  overallScore: number;
  timestamp: number;
}

export interface PerformanceAlert {
  id: string;
  type: 'memory-leak' | 'slow-render' | 'network-issue' | 'wasm-error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metrics: Partial<WAsmPerformanceMetrics>;
  timestamp: number;
  resolved: boolean;
}

export interface PerformanceTrend {
  metric: keyof WAsmPerformanceMetrics;
  values: number[];
  trend: 'improving' | 'degrading' | 'stable';
  changePercent: number;
}

// ============================================================================
// WEBASSEMBLY PERFORMANCE MONITOR
// ============================================================================

class WebAssemblyPerformanceMonitor {
  private metrics: WAsmPerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private wasmModule: any = null;
  
  // Performance thresholds
  private readonly thresholds = {
    maxRenderTime: 16, // 60fps = 16.67ms per frame
    maxMemoryGrowth: 50 * 1024 * 1024, // 50MB
    maxNetworkLatency: 1000, // 1 second
    minPerformanceScore: 70, // Below 70 is concerning
  };
  
  // Observers and listeners
  private observers = {
    performanceObserver: null as PerformanceObserver | null,
    mutationObserver: null as MutationObserver | null,
    resizeObserver: null as ResizeObserver | null,
  };
  
  constructor() {
    this.setupPerformanceObservers();
    this.loadWasmModule();
  }
  
  // ========================================================================
  // WEBASSEMBLY MODULE LOADING & INTEGRATION
  // ========================================================================
  
  private async loadWasmModule() {
    try {
      // Import our existing WASM financial engine
      // Try to import WASM module - fallback gracefully if not available
      const wasmModule = await import('../wasm/jsFinancialEngine').catch(() => null);
      if (!wasmModule) {
        logger.warn('WASM financial engine not available, using fallback monitoring');
        return;
      }
      await wasmModule.default();
      
      this.wasmModule = wasmModule;
      
      // Hook into WASM function calls for monitoring
      this.instrumentWasmFunctions();
      
      logger.info('WebAssembly performance monitoring initialized');
    } catch (error) {
      logger.error('Failed to load WASM module for performance monitoring', error as Error);
      // Continue without WASM monitoring
    }
  }
  
  private instrumentWasmFunctions() {
    if (!this.wasmModule) return;
    
    const originalFunctions = {
      calculate_financial_metrics: this.wasmModule.calculate_financial_metrics,
      process_transactions: this.wasmModule.process_transactions,
      generate_reports: this.wasmModule.generate_reports,
    };
    
    // Wrap each function to measure performance
    Object.entries(originalFunctions).forEach(([name, originalFn]) => {
      if (typeof originalFn === 'function') {
        this.wasmModule[name] = (...args: any[]) => {
          const startTime = performance.now();
          const startMemory = this.getWasmMemoryUsage();
          
          try {
            const result = originalFn.apply(this.wasmModule, args);
            
            const endTime = performance.now();
            const endMemory = this.getWasmMemoryUsage();
            
            this.recordWasmMetrics({
              functionName: name,
              executionTime: endTime - startTime,
              memoryDelta: endMemory - startMemory,
              success: true,
            });
            
            return result;
          } catch (error) {
            this.recordWasmMetrics({
              functionName: name,
              executionTime: performance.now() - startTime,
              memoryDelta: 0,
              success: false,
              error: error as Error,
            });
            throw error;
          }
        };
      }
    });
  }
  
  private getWasmMemoryUsage(): number {
    if (!this.wasmModule?.memory) return 0;
    return this.wasmModule.memory.buffer.byteLength;
  }
  
  private recordWasmMetrics(data: {
    functionName: string;
    executionTime: number;
    memoryDelta: number;
    success: boolean;
    error?: Error;
  }) {
    // This will be aggregated into overall metrics
    logger.debug('WASM function performance', data);
    
    if (data.executionTime > 100) { // Function took more than 100ms
      this.createAlert({
        type: 'slow-render',
        severity: data.executionTime > 500 ? 'high' : 'medium',
        message: `Slow WASM function: ${data.functionName} took ${data.executionTime.toFixed(2)}ms`,
        metrics: { wasmExecutionTime: data.executionTime },
      });
    }
  }
  
  // ========================================================================
  // PERFORMANCE OBSERVERS SETUP
  // ========================================================================
  
  private setupPerformanceObservers() {
    // Performance Observer for measuring render performance
    if ('PerformanceObserver' in window) {
      this.observers.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' && entry.name.includes('React')) {
            this.recordReactMetrics({
              renderTime: entry.duration,
              componentName: entry.name,
            });
          }
        });
      });
      
      this.observers.performanceObserver.observe({
        entryTypes: ['measure', 'navigation', 'paint']
      });
    }
    
    // Mutation Observer for tracking DOM changes
    if (typeof MutationObserver !== 'undefined') {
      this.observers.mutationObserver = new MutationObserver((mutations) => {
        let componentChanges = 0;
        mutations.forEach((mutation) => {
          componentChanges += mutation.addedNodes.length + mutation.removedNodes.length;
        });
        
        if (componentChanges > 50) { // Excessive DOM changes
          this.createAlert({
            type: 'slow-render',
            severity: 'medium',
            message: `Excessive DOM changes detected: ${componentChanges} nodes modified`,
            metrics: { reactComponentCount: componentChanges },
          });
        }
      });
      
      this.observers.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false
      });
    }
  }
  
  // ========================================================================
  // METRICS COLLECTION & AGGREGATION
  // ========================================================================
  
  async collectMetrics(): Promise<WAsmPerformanceMetrics> {
    const timestamp = Date.now();
    
    // Collect all performance data
    const [
      wasmMetrics,
      reactMetrics,
      networkMetrics,
      memoryMetrics,
      virtualizationMetrics
    ] = await Promise.all([
      this.collectWasmMetrics(),
      this.collectReactMetrics(),
      this.collectNetworkMetrics(),
      this.collectMemoryMetrics(),
      this.collectVirtualizationMetrics(),
    ]);
    
    // Calculate overall performance score
    const overallScore = this.calculatePerformanceScore({
      ...wasmMetrics,
      ...reactMetrics,
      ...networkMetrics,
      ...memoryMetrics,
      ...virtualizationMetrics,
    });
    
    const metrics: WAsmPerformanceMetrics = {
      ...wasmMetrics,
      ...reactMetrics,
      ...networkMetrics,
      ...memoryMetrics,
      ...virtualizationMetrics,
      overallScore,
      timestamp,
    };
    
    // Store metrics
    this.metrics.push(metrics);
    
    // Keep only last 100 entries
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
    
    // Check for performance issues
    this.analyzeMetrics(metrics);
    
    return metrics;
  }
  
  private async collectWasmMetrics() {
    let wasmExecutionTime = 0;
    let wasmMemoryUsage = 0;
    let wasmFunctionCalls = 0;
    
    if (this.wasmModule) {
      wasmMemoryUsage = this.getWasmMemoryUsage();
      
      // Test WASM performance with a small calculation
      try {
        const start = performance.now();
        // Simple test calculation to measure WASM performance
        if (typeof this.wasmModule.test_performance === 'function') {
          this.wasmModule.test_performance();
        }
        wasmExecutionTime = performance.now() - start;
        wasmFunctionCalls = 1;
      } catch (error) {
        logger.warn('WASM performance test failed', error as Error);
      }
    }
    
    return { wasmExecutionTime, wasmMemoryUsage, wasmFunctionCalls };
  }
  
  private async collectReactMetrics() {
    const reactRenderTime = performance.getEntriesByType('measure')
      .filter(entry => entry.name.includes('React'))
      .reduce((sum, entry) => sum + entry.duration, 0);
    
    const reactComponentCount = document.querySelectorAll('[data-reactroot] *').length;
    
    // Estimate re-render count based on performance entries
    const reactRerenderCount = performance.getEntriesByType('measure')
      .filter(entry => entry.name.includes('React')).length;
    
    return { reactRenderTime, reactComponentCount, reactRerenderCount };
  }
  
  private async collectNetworkMetrics() {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
    const networkLatency = navigationEntry ? 
      navigationEntry.responseStart - navigationEntry.requestStart : 0;
    
    // Query response time from React Query metrics
    const queryResponseTime = (window as any).__REACT_QUERY_METRICS__?.averageResponseTime || 0;
    
    // Firestore latency estimation
    const firestoreLatency = (window as any).__FIRESTORE_METRICS__?.averageLatency || 0;
    
    return { networkLatency, queryResponseTime, firestoreLatency };
  }
  
  private async collectMemoryMetrics() {
    const memoryInfo = (performance as any).memory;
    const jsHeapSize = memoryInfo ? memoryInfo.usedJSHeapSize : 0;
    
    // Get memory leak score from memory monitor
    const currentMemory = memoryMonitor.getCurrentUsage();
    const memoryLeakScore = this.calculateMemoryLeakScore(currentMemory);
    
    // Estimate GC frequency based on memory changes
    const gcFrequency = this.estimateGCFrequency();
    
    return { jsHeapSize, memoryLeakScore, gcFrequency };
  }
  
  private async collectVirtualizationMetrics() {
    // Get metrics from virtualization system
    const virtualizedItemsRendered = (window as any).__VIRTUALIZATION_METRICS__?.itemsRendered || 0;
    const scrollPerformance = (window as any).__VIRTUALIZATION_METRICS__?.scrollPerformance || 100;
    const listRenderTime = (window as any).__VIRTUALIZATION_METRICS__?.renderTime || 0;
    
    return { virtualizedItemsRendered, scrollPerformance, listRenderTime };
  }
  
  // ========================================================================
  // PERFORMANCE ANALYSIS & SCORING
  // ========================================================================
  
  private calculatePerformanceScore(metrics: Partial<WAsmPerformanceMetrics>): number {
    let score = 100;
    
    // React performance (25% weight)
    if (metrics.reactRenderTime && metrics.reactRenderTime > this.thresholds.maxRenderTime) {
      score -= 25 * (metrics.reactRenderTime / this.thresholds.maxRenderTime - 1);
    }
    
    // Memory performance (25% weight)
    if (metrics.memoryLeakScore && metrics.memoryLeakScore > 50) {
      score -= 25 * (metrics.memoryLeakScore / 100);
    }
    
    // Network performance (25% weight)
    if (metrics.networkLatency && metrics.networkLatency > this.thresholds.maxNetworkLatency) {
      score -= 25 * (metrics.networkLatency / this.thresholds.maxNetworkLatency - 1);
    }
    
    // WASM performance (25% weight)
    if (metrics.wasmExecutionTime && metrics.wasmExecutionTime > 50) {
      score -= 25 * (metrics.wasmExecutionTime / 50 - 1);
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  private calculateMemoryLeakScore(currentMemory: number): number {
    if (this.metrics.length < 5) return 0;
    
    const recentMetrics = this.metrics.slice(-5);
    if (recentMetrics.length === 0) return 0;
    const memoryGrowth = currentMemory - recentMetrics[0]!.jsHeapSize;
    
    // Score based on memory growth rate
    if (memoryGrowth < 10 * 1024 * 1024) return 0; // < 10MB growth = good
    if (memoryGrowth < 25 * 1024 * 1024) return 25; // < 25MB growth = ok
    if (memoryGrowth < 50 * 1024 * 1024) return 50; // < 50MB growth = concerning
    return Math.min(100, (memoryGrowth / (100 * 1024 * 1024)) * 100); // > 50MB = bad
  }
  
  private estimateGCFrequency(): number {
    // Estimate based on memory fluctuations
    if (this.metrics.length < 10) return 0;
    
    let gcCount = 0;
    const recentMetrics = this.metrics.slice(-10);
    
    for (let i = 1; i < recentMetrics.length; i++) {
      const prevMetric = recentMetrics[i - 1];
      const currentMetric = recentMetrics[i];
      if (prevMetric && currentMetric) {
        const memoryDrop = prevMetric.jsHeapSize - currentMetric.jsHeapSize;
        if (memoryDrop > 5 * 1024 * 1024) { // 5MB drop indicates potential GC
          gcCount++;
        }
      }
    }
    
    return gcCount;
  }
  
  private analyzeMetrics(metrics: WAsmPerformanceMetrics) {
    // Check for performance issues and create alerts
    
    if (metrics.overallScore < this.thresholds.minPerformanceScore) {
      this.createAlert({
        type: 'slow-render',
        severity: metrics.overallScore < 50 ? 'critical' : 'high',
        message: `Low performance score: ${metrics.overallScore.toFixed(1)}`,
        metrics,
      });
    }
    
    if (metrics.memoryLeakScore > 75) {
      this.createAlert({
        type: 'memory-leak',
        severity: 'high',
        message: `High memory leak risk: ${metrics.memoryLeakScore.toFixed(1)}`,
        metrics,
      });
    }
    
    if (metrics.networkLatency > this.thresholds.maxNetworkLatency) {
      this.createAlert({
        type: 'network-issue',
        severity: 'medium',
        message: `High network latency: ${metrics.networkLatency.toFixed(0)}ms`,
        metrics,
      });
    }
  }
  
  // ========================================================================
  // ALERT MANAGEMENT
  // ========================================================================
  
  private createAlert(alertData: Omit<PerformanceAlert, 'id' | 'timestamp' | 'resolved'>) {
    const alert: PerformanceAlert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      resolved: false,
    };
    
    this.alerts.push(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts.shift();
    }
    
    // Log critical alerts
    if (alert.severity === 'critical') {
      logger.error('Critical performance alert', new Error(alert.message), alert.metrics);
    } else if (alert.severity === 'high') {
      logger.warn(`Performance alert: ${alert.message}`);
    }
    
    // Emit event for UI components
    window.dispatchEvent(new CustomEvent('performance-alert', {
      detail: alert
    }));
  }
  
  private recordReactMetrics(data: { renderTime: number; componentName: string }) {
    // Store for aggregation
    if (!this.reactMetricsBuffer) {
      this.reactMetricsBuffer = [];
    }
    
    this.reactMetricsBuffer.push(data);
    
    // Keep buffer manageable
    if (this.reactMetricsBuffer.length > 100) {
      this.reactMetricsBuffer.shift();
    }
  }
  
  private reactMetricsBuffer: Array<{ renderTime: number; componentName: string }> = [];
  
  // ========================================================================
  // PUBLIC API
  // ========================================================================
  
  startMonitoring(intervalMs = 5000) {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics().catch(error => {
        logger.error('Error collecting performance metrics', error as Error);
      });
    }, intervalMs);
    
    logger.info('WebAssembly performance monitoring started');
  }
  
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    // Cleanup observers
    Object.values(this.observers).forEach(observer => {
      if (observer) {
        observer.disconnect();
      }
    });
    
    logger.info('WebAssembly performance monitoring stopped');
  }
  
  getMetrics(): WAsmPerformanceMetrics[] {
    return [...this.metrics];
  }
  
  getLatestMetrics(): WAsmPerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }
  
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }
  
  getUnresolvedAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }
  
  resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }
  
  getPerformanceTrends(): PerformanceTrend[] {
    if (this.metrics.length < 10) return [];
    
    const trends: PerformanceTrend[] = [];
    const metricsKeys: (keyof WAsmPerformanceMetrics)[] = [
      'overallScore',
      'reactRenderTime',
      'wasmExecutionTime',
      'memoryLeakScore',
      'networkLatency'
    ];
    
    metricsKeys.forEach(key => {
      const values = this.metrics.slice(-10).map(m => m[key] as number);
      const trend = this.calculateTrend(values);
      
      trends.push({
        metric: key,
        values,
        trend: trend.direction,
        changePercent: trend.changePercent,
      });
    });
    
    return trends;
  }
  
  private calculateTrend(values: number[]): { direction: 'improving' | 'degrading' | 'stable'; changePercent: number } {
    if (values.length < 5) return { direction: 'stable', changePercent: 0 };
    
    const first = values.slice(0, Math.floor(values.length / 2)).reduce((a, b) => a + b) / Math.floor(values.length / 2);
    const last = values.slice(Math.ceil(values.length / 2)).reduce((a, b) => a + b) / Math.floor(values.length / 2);
    
    const changePercent = ((last - first) / first) * 100;
    
    if (Math.abs(changePercent) < 5) return { direction: 'stable', changePercent };
    return {
      direction: changePercent > 0 ? 'improving' : 'degrading',
      changePercent: Math.abs(changePercent),
    };
  }
  
  // Force a performance measurement right now
  async measureNow(): Promise<WAsmPerformanceMetrics> {
    return await this.collectMetrics();
  }
}

// ============================================================================
// SINGLETON INSTANCE & GLOBAL INTEGRATION
// ============================================================================

export const wasmPerformanceMonitor = new WebAssemblyPerformanceMonitor();

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  wasmPerformanceMonitor.startMonitoring(3000); // Every 3 seconds in dev
} else {
  wasmPerformanceMonitor.startMonitoring(10000); // Every 10 seconds in prod
}

// Global performance tracking integration
declare global {
  interface Window {
    __REACT_QUERY_METRICS__: {
      averageResponseTime: number;
    };
    __FIRESTORE_METRICS__: {
      averageLatency: number;
    };
    __VIRTUALIZATION_METRICS__: {
      itemsRendered: number;
      scrollPerformance: number;
      renderTime: number;
    };
    __WASM_PERFORMANCE_MONITOR__: WebAssemblyPerformanceMonitor;
  }
}

// Expose to global scope for debugging
window.__WASM_PERFORMANCE_MONITOR__ = wasmPerformanceMonitor;

logger.info('WebAssembly Performance Metrics Integration initialized');