// Timeline Maestro v3.0 - React Hook for Timeline Simulation
// Manages Web Worker for high-performance WASM simulation

import { useCallback, useEffect, useRef, useState } from 'react';
import type { 
  TimelineData, 
  TimelineChange, 
  TimelineSimulationResult,
  TimelineMetrics 
} from '../shared/timelineStore';
import type { WorkerMessage, WorkerResponse } from '../workers/timelineSimulationWorker';

interface UseTimelineSimulatorOptions {
  autoInitialize?: boolean;
}

interface SimulatorState {
  initialized: boolean;
  loading: boolean;
  error: string | null;
  metrics: TimelineMetrics | null;
  lastResult: TimelineSimulationResult | null;
}

export function useTimelineSimulator(options: UseTimelineSimulatorOptions = {}) {
  const { autoInitialize = true } = options;
  
  const [state, setState] = useState<SimulatorState>({
    initialized: false,
    loading: false,
    error: null,
    metrics: null,
    lastResult: null,
  });

  const workerRef = useRef<Worker | null>(null);
  const pendingRequests = useRef<Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }>>(new Map());

  // Initialize Web Worker
  const initializeWorker = useCallback(async () => {
    if (workerRef.current) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check if WASM is available
      if (typeof WebAssembly === 'undefined') {
        throw new Error('WebAssembly not supported in this environment');
      }
      // Create worker
      workerRef.current = new Worker(
        new URL('../workers/timelineSimulationWorker.ts', import.meta.url),
        { type: 'module' }
      );

      // Set up message handler
      workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const { id, type, result, error } = event.data;
        const pending = pendingRequests.current.get(id);

        if (pending) {
          pendingRequests.current.delete(id);
          
          if (type === 'success') {
            pending.resolve(result);
          } else {
            pending.reject(new Error(error || 'Worker error'));
          }
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('Timeline Simulation Worker error:', error);
        setState(prev => ({ ...prev, error: 'Worker initialization failed', loading: false }));
      };

      // Initialize WASM in worker
      await sendWorkerMessage('init');
      
      setState(prev => ({ 
        ...prev, 
        initialized: true, 
        loading: false, 
        error: null 
      }));

      console.log('🎯 Timeline Simulator initialized');
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Initialization failed',
        loading: false 
      }));
    }
  }, []);

  // Send message to worker with promise wrapper
  const sendWorkerMessage = useCallback((type: WorkerMessage['type'], payload?: any): Promise<any> => {
    if (!workerRef.current) {
      return Promise.reject(new Error('Worker not initialized'));
    }

    return new Promise((resolve, reject) => {
      const id = `${type}-${Date.now()}-${Math.random()}`;
      
      pendingRequests.current.set(id, { resolve, reject });
      
      const message: WorkerMessage = { id, type, payload };
      workerRef.current!.postMessage(message);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (pendingRequests.current.has(id)) {
          pendingRequests.current.delete(id);
          reject(new Error('Worker request timeout'));
        }
      }, 30000);
    });
  }, []);

  // Load timeline data into WASM simulator
  const loadTimelineData = useCallback(async (data: TimelineData) => {
    if (!state.initialized) {
      throw new Error('Simulator not initialized');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await sendWorkerMessage('loadData', data);
      
      // Get initial metrics
      const metrics = await sendWorkerMessage('getMetrics');
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        metrics,
        error: null 
      }));

      console.log('📊 Timeline data loaded into simulator');
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load data',
        loading: false 
      }));
      throw error;
    }
  }, [state.initialized, sendWorkerMessage]);

  // Simulate timeline change
  const simulateChange = useCallback(async (change: TimelineChange): Promise<TimelineSimulationResult> => {
    if (!state.initialized) {
      throw new Error('Simulator not initialized');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await sendWorkerMessage('simulate', change);
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        lastResult: result,
        error: null 
      }));

      console.log('🔄 Timeline simulation completed:', result);
      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Simulation failed',
        loading: false 
      }));
      throw error;
    }
  }, [state.initialized, sendWorkerMessage]);

  // Get current timeline metrics
  const getMetrics = useCallback(async (): Promise<TimelineMetrics> => {
    if (!state.initialized) {
      throw new Error('Simulator not initialized');
    }

    try {
      const metrics = await sendWorkerMessage('getMetrics');
      
      setState(prev => ({ ...prev, metrics }));
      return metrics;
    } catch (error) {
      console.error('Failed to get metrics:', error);
      throw error;
    }
  }, [state.initialized, sendWorkerMessage]);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      pendingRequests.current.clear();
    };
  }, []);

  // Auto-initialize if requested
  useEffect(() => {
    if (autoInitialize && !state.initialized && !state.loading) {
      initializeWorker();
    }
  }, [autoInitialize, state.initialized, state.loading, initializeWorker]);

  return {
    // State
    initialized: state.initialized,
    loading: state.loading,
    error: state.error,
    metrics: state.metrics,
    lastResult: state.lastResult,
    
    // Actions
    initialize: initializeWorker,
    loadTimelineData,
    simulateChange,
    getMetrics,
  };
}