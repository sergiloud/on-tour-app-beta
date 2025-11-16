/**
 * Roadmap Store (Zustand)
 * 
 * Estado centralizado para el roadmap con WASM integration completa:
 * - Nodos y dependencias del roadmap
 * - Filtros activos
 * - Modo simulación con cálculos financieros en tiempo real
 * - Estados de carga y errores
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
  RoadmapNode, 
  Dependency, 
  RoadmapResponse,
  RoadmapRequest,
  RoadmapFilters,
  FinancialImpact,
  RoadmapViewConfig,
  UserInfo
} from '../types';

// ============================================================================
// WASM INTEGRATION
// ============================================================================

let wasmEngine: any = null;

async function initWasmEngine() {
  if (!wasmEngine) {
    try {
      const wasmModule = await import('../../../lib/wasmFinancialEngine');
      wasmEngine = wasmModule;
      console.log('🚀 WASM Financial Engine loaded for roadmap calculations');
    } catch (error) {
      console.warn('⚠️ WASM not available, using JavaScript fallback:', error);
    }
  }
  return wasmEngine;
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface RoadmapStore {
  // Data state
  nodes: RoadmapNode[];
  dependencies: Dependency[];
  filteredNodes: RoadmapNode[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  filters: RoadmapFilters;
  viewConfig: RoadmapViewConfig;
  
  // Simulation state
  isSimulationMode: boolean;
  simulationNodes: RoadmapNode[];
  originalNodes: RoadmapNode[]; // Backup for discard
  financialImpact: FinancialImpact | null;
  
  // User data for filters
  users: UserInfo[];
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setData: (response: RoadmapResponse) => void;
  setFilters: (filters: Partial<RoadmapFilters>) => void;
  setViewConfig: (config: Partial<RoadmapViewConfig>) => void;
  
  // Simulation actions
  startSimulation: () => void;
  endSimulation: () => void;
  updateSimulationNode: (nodeId: string, changes: Partial<RoadmapNode>) => void;
  setFinancialImpact: (impact: FinancialImpact) => void;
  
  // API actions
  fetchRoadmap: (request?: RoadmapRequest) => Promise<void>;
  simulateChanges: () => Promise<void>;
  
  // Utils
  getNodeById: (id: string) => RoadmapNode | undefined;
  getNodesByType: (type: RoadmapNode['type']) => RoadmapNode[];
  getNodesByAssignee: (userId: string) => RoadmapNode[];
  applyFilters: () => void;
}

// ============================================================================
// INITIAL STATE  
// ============================================================================

const initialFilters: RoadmapFilters = {
  assignedTo: null,
  types: null,
  status: null,
  priority: null,
  dateRange: {
    start: null,
    end: null
  }
};

const initialViewConfig: RoadmapViewConfig = {
  viewType: 'gantt',
  zoom: 'week',
  showDependencies: true,
  showCriticalPath: false,
  groupBy: 'type'
};

const initialSimulation: SimulationState = {
  isActive: false,
  modifiedNodes: [],
  originalNodes: [],
  financialImpact: null,
  simulationId: null
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useRoadmapStore = create<RoadmapStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      nodes: [],
      dependencies: [],
      filteredNodes: [],
      isLoading: false,
      error: null,
      filters: initialFilters,
      viewConfig: initialViewConfig,
      simulation: initialSimulation,
      users: [],

      // Basic setters
      setLoading: (loading) => 
        set((state) => { state.isLoading = loading; }),

      setError: (error) => 
        set((state) => { state.error = error; }),

      setData: (response) =>
        set((state) => {
          state.nodes = response.nodes;
          state.dependencies = response.dependencies;
          state.filteredNodes = response.nodes; // Apply filters after
          state.isLoading = false;
          state.error = null;
        }),

      setFilters: (newFilters) =>
        set((state) => {
          state.filters = { ...state.filters, ...newFilters };
        }),

      setViewConfig: (config) =>
        set((state) => {
          state.viewConfig = { ...state.viewConfig, ...config };
        }),

      // Simulation actions
      startSimulation: () =>
        set((state) => {
          state.simulation.isActive = true;
          state.simulation.originalNodes = [...state.nodes];
          state.simulation.modifiedNodes = [...state.nodes];
          state.simulation.financialImpact = null;
          state.simulation.simulationId = `sim_${Date.now()}`;
        }),

      endSimulation: () =>
        set((state) => {
          state.simulation.isActive = false;
          state.simulation.modifiedNodes = [];
          state.simulation.originalNodes = [];
          state.simulation.financialImpact = null;
          state.simulation.simulationId = null;
          // Restore original nodes
          state.nodes = [...state.simulation.originalNodes];
        }),

      updateSimulationNode: (nodeId, changes) =>
        set((state) => {
          if (!state.simulation.isActive) return;
          
          const nodeIndex = state.simulation.modifiedNodes.findIndex((n: RoadmapNode) => n.id === nodeId);
          if (nodeIndex !== -1) {
            Object.assign(state.simulation.modifiedNodes[nodeIndex], changes);
          }
        }),

      setFinancialImpact: (impact) =>
        set((state) => {
          state.simulation.financialImpact = impact;
        }),

      // API actions
      fetchRoadmap: async (request = {}) => {
        set((state) => { 
          state.isLoading = true; 
          state.error = null; 
        });

        try {
          const params = new URLSearchParams();
          
          if (request.startDate) params.set('startDate', request.startDate);
          if (request.endDate) params.set('endDate', request.endDate);
          if (request.types) params.set('types', request.types.join(','));
          if (request.status) params.set('status', request.status.join(','));
          if (request.priority) params.set('priority', request.priority.join(','));
          if (request.assignedTo) params.set('assignedTo', request.assignedTo.join(','));

          const response = await fetch(`/api/roadmap?${params}`, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data: RoadmapResponse = await response.json();
          
          set((state) => {
            state.nodes = data.nodes;
            state.dependencies = data.dependencies;
            state.isLoading = false;
            state.error = null;
          });

          // Apply filters after setting data
          get().applyFilters();

        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.error = error instanceof Error ? error.message : 'Unknown error occurred';
          });
        }
      },

      simulateChanges: async () => {
        const { simulation } = get();
        if (!simulation.isActive || simulation.modifiedNodes.length === 0) {
          return;
        }

        try {
          const response = await fetch('/api/roadmap/simulate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              simulationNodes: simulation.modifiedNodes
            })
          });

          if (!response.ok) {
            throw new Error(`Simulation failed: ${response.statusText}`);
          }

          const data = await response.json();
          
          set((state) => {
            state.simulation.financialImpact = data.financialImpact;
          });

        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Simulation failed';
          });
        }
      },

      // Utility functions
      getNodeById: (id) => {
        return get().nodes.find(node => node.id === id);
      },

      getNodesByType: (type) => {
        return get().nodes.filter(node => node.type === type);
      },

      getNodesByAssignee: (userId) => {
        return get().nodes.filter(node => 
          node.assignedTo && node.assignedTo.includes(userId)
        );
      },

      applyFilters: () => {
        set((state) => {
          const { nodes, filters } = state;
          
          let filtered = [...nodes];

          // Filter by types
          if (filters.types && filters.types.length > 0) {
            filtered = filtered.filter(node => filters.types!.includes(node.type));
          }

          // Filter by status
          if (filters.status && filters.status.length > 0) {
            filtered = filtered.filter(node => filters.status!.includes(node.status));
          }

          // Filter by priority
          if (filters.priority && filters.priority.length > 0) {
            filtered = filtered.filter(node => filters.priority!.includes(node.priority));
          }

          // Filter by assigned users
          if (filters.assignedTo && filters.assignedTo.length > 0) {
            filtered = filtered.filter(node => {
              if (!node.assignedTo) return false;
              return filters.assignedTo!.some((userId: string) => node.assignedTo!.includes(userId));
            });
          }

          // Filter by date range
          if (filters.dateRange.start) {
            filtered = filtered.filter(node => node.startDate >= filters.dateRange.start!);
          }
          if (filters.dateRange.end) {
            filtered = filtered.filter(node => node.startDate <= filters.dateRange.end!);
          }

          state.filteredNodes = filtered;
        });
      }
    }))
  )
);

// ============================================================================
// SELECTORS & SUBSCRIPTIONS
// ============================================================================

// Subscribe to filter changes to automatically re-apply filters
useRoadmapStore.subscribe(
  (state) => state.filters,
  () => {
    useRoadmapStore.getState().applyFilters();
  },
  {
    equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b)
  }
);

// Derived selectors
export const useRoadmapNodes = () => useRoadmapStore((state) => state.filteredNodes);
export const useRoadmapDependencies = () => useRoadmapStore((state) => state.dependencies);
export const useRoadmapLoading = () => useRoadmapStore((state) => state.isLoading);
export const useRoadmapError = () => useRoadmapStore((state) => state.error);
export const useRoadmapFilters = () => useRoadmapStore((state) => state.filters);
export const useRoadmapSimulation = () => useRoadmapStore((state) => state.simulation);
export const useRoadmapViewConfig = () => useRoadmapStore((state) => state.viewConfig);

// Action selectors  
export const useRoadmapActions = () => useRoadmapStore((state) => ({
  fetchRoadmap: state.fetchRoadmap,
  setFilters: state.setFilters,
  setViewConfig: state.setViewConfig,
  startSimulation: state.startSimulation,
  endSimulation: state.endSimulation,
  updateSimulationNode: state.updateSimulationNode,
  simulateChanges: state.simulateChanges
}));