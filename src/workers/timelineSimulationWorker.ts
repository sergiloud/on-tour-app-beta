// Timeline Maestro v3.0 - Web Worker for Real-time Timeline Simulation
// Uses WASM TimelineSimulator for high-performance calculations

import type { 
  TimelineData, 
  TimelineChange, 
  TimelineSimulationResult,
  TimelineMetrics 
} from '../shared/timelineStore';

// Message types for worker communication
interface WorkerMessage {
  id: string;
  type: 'init' | 'loadData' | 'simulate' | 'getMetrics';
  payload?: any;
}

interface WorkerResponse {
  id: string;
  type: 'success' | 'error';
  result?: any;
  error?: string;
}

class TimelineSimulationWorker {
  private wasmModule: any = null;
  private simulator: any = null;

  async initialize() {
    try {
      // Import WASM module dynamically
      const wasmModule = await import('../../wasm-financial-engine/pkg/wasm_financial_engine');
      await wasmModule.default(); // Initialize WASM
      
      this.wasmModule = wasmModule;
      this.simulator = new wasmModule.TimelineSimulator();
      
      console.log('🦀 Timeline Simulation Worker initialized with WASM');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to initialize WASM:', error);
      throw error;
    }
  }

  async loadTimelineData(data: TimelineData) {
    if (!this.simulator) {
      throw new Error('Simulator not initialized');
    }

    try {
      const dataJson = JSON.stringify(data);
      this.simulator.load_timeline_data(dataJson);
      
      console.log('📊 Timeline data loaded into WASM simulator');
      return { success: true, entitiesCount: data.tasks.length + data.releases.length + data.shows.length };
    } catch (error) {
      console.error('❌ Failed to load timeline data:', error);
      throw error;
    }
  }

  async simulateChange(change: TimelineChange): Promise<TimelineSimulationResult> {
    if (!this.simulator) {
      throw new Error('Simulator not initialized');
    }

    try {
      const changeJson = JSON.stringify(change);
      const resultJson = this.simulator.simulate_timeline_change(changeJson);
      const result = JSON.parse(resultJson);
      
      console.log('🔄 Simulation completed:', result.financial_impact);
      return result;
    } catch (error) {
      console.error('❌ Simulation failed:', error);
      throw error;
    }
  }

  async getMetrics(): Promise<TimelineMetrics> {
    if (!this.simulator) {
      throw new Error('Simulator not initialized');
    }

    try {
      const metricsJson = this.simulator.get_timeline_metrics();
      const metrics = JSON.parse(metricsJson);
      
      return metrics;
    } catch (error) {
      console.error('❌ Failed to get metrics:', error);
      throw error;
    }
  }
}

// Initialize worker instance
const worker = new TimelineSimulationWorker();

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = event.data;
  
  try {
    let result: any;

    switch (type) {
      case 'init':
        result = await worker.initialize();
        break;

      case 'loadData':
        result = await worker.loadTimelineData(payload);
        break;

      case 'simulate':
        result = await worker.simulateChange(payload);
        break;

      case 'getMetrics':
        result = await worker.getMetrics();
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    const response: WorkerResponse = {
      id,
      type: 'success',
      result
    };

    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      id,
      type: 'error',
      error: error instanceof Error ? error.message : String(error)
    };

    self.postMessage(response);
  }
};

// Export types for main thread
export type { WorkerMessage, WorkerResponse };