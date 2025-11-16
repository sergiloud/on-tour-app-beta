/**
 * Roadmap Store (Zustand) - Completely Rewritten
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

// Calculate financial impact using WASM or fallback
async function calculateFinancialImpact(
  originalNodes: RoadmapNode[],
  modifiedNodes: RoadmapNode[]
): Promise<FinancialImpact> {
  const engine = await initWasmEngine();
  
  if (engine && engine.calculate_roadmap_financial_impact) {
    try {
      // Use WASM for high-performance calculation
      const originalCost = originalNodes.reduce((sum, node) => sum + (node.metadata.cost || 0), 0);
      const modifiedCost = modifiedNodes.reduce((sum, node) => sum + (node.metadata.cost || 0), 0);
      
      const result = engine.calculate_roadmap_financial_impact({
        original_nodes: originalNodes,
        modified_nodes: modifiedNodes,
        currency: 'USD'
      });
      
      return {
        totalCostChange: modifiedCost - originalCost,
        affectedNodes: modifiedNodes.filter(node => 
          !originalNodes.find(orig => orig.id === node.id && orig.startDate === node.startDate)
        ).length,
        impactLevel: Math.abs(modifiedCost - originalCost) > 10000 ? 'high' : 'medium',
        calculationTime: result.calculation_time || 0
      };
    } catch (error) {
      console.warn('WASM calculation failed, using fallback:', error);
    }
  }
  
  // JavaScript fallback
  const originalCost = originalNodes.reduce((sum, node) => sum + (node.metadata.cost || 0), 0);
  const modifiedCost = modifiedNodes.reduce((sum, node) => sum + (node.metadata.cost || 0), 0);
  
  return {
    totalCostChange: modifiedCost - originalCost,
    affectedNodes: modifiedNodes.filter(node => 
      !originalNodes.find(orig => orig.id === node.id && orig.startDate === node.startDate)
    ).length,
    impactLevel: Math.abs(modifiedCost - originalCost) > 10000 ? 'high' : 'medium',
    calculationTime: 0
  };
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
  
  // Basic actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNodes: (nodes: RoadmapNode[]) => void;
  setDependencies: (dependencies: Dependency[]) => void;
  setFilters: (filters: Partial<RoadmapFilters>) => void;
  setViewConfig: (config: Partial<RoadmapViewConfig>) => void;
  applyFilters: () => void;
  
  // Data fetching
  fetchRoadmap: (request?: RoadmapRequest) => Promise<void>;
  
  // Simulation actions - The Heart of the Feature
  startSimulation: () => void;
  endSimulation: () => void;
  simulateNodeMove: (nodeId: string, newStartDate: string, newEndDate?: string) => Promise<void>;
  confirmSimulation: () => Promise<void>;
  discardSimulation: () => void;
  
  // Node management
  createNode: (nodeData: Partial<RoadmapNode>) => Promise<void>;
  updateNode: (nodeId: string, updates: Partial<RoadmapNode>) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  
  // Dependency management
  createDependency: (fromNodeId: string, toNodeId: string) => Promise<void>;
  deleteDependency: (dependencyId: string) => Promise<void>;
}

// ============================================================================
// INITIAL VALUES
// ============================================================================

const initialFilters: RoadmapFilters = {
  types: null,
  status: null,
  priority: null,
  assignedTo: null,
  dateRange: {
    start: null,
    end: null
  },
  searchQuery: ''
};

const initialViewConfig: RoadmapViewConfig = {
  viewType: 'gantt',
  zoom: 'week',
  showDependencies: true,
  showCriticalPath: false,
  groupBy: 'none'
};

// ============================================================================
// ZUSTAND STORE CREATION
// ============================================================================

export const useRoadmapStore = create<RoadmapStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // ========================================================================
      // INITIAL STATE
      // ========================================================================
      
      nodes: [],
      dependencies: [],
      filteredNodes: [],
      isLoading: false,
      error: null,
      filters: initialFilters,
      viewConfig: initialViewConfig,
      
      // Simulation state
      isSimulationMode: false,
      simulationNodes: [],
      originalNodes: [],
      financialImpact: null,
      
      users: [],
      
      // ========================================================================
      // BASIC ACTIONS
      // ========================================================================
      
      setLoading: (loading) => set((state) => {
        state.isLoading = loading;
      }),
      
      setError: (error) => set((state) => {
        state.error = error;
      }),
      
      setNodes: (nodes) => {
        set((state) => {
          state.nodes = nodes;
          state.filteredNodes = nodes; // Inicialmente mostrar todos
        });
        get().applyFilters();
      },
      
      setDependencies: (dependencies) => set((state) => {
        state.dependencies = dependencies;
      }),
      
      setFilters: (newFilters) => {
        set((state) => {
          Object.assign(state.filters, newFilters);
        });
        get().applyFilters();
      },
      
      setViewConfig: (config) => set((state) => {
        Object.assign(state.viewConfig, config);
      }),
      
      applyFilters: () => set((state) => {
        const { filters } = state;
        let filtered = [...state.nodes];
        
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
        
        // Filter by assigned user
        if (filters.assignedTo && filters.assignedTo.length > 0) {
          filtered = filtered.filter(node => {
            if (Array.isArray(node.assignedTo)) {
              return node.assignedTo.some(userId => filters.assignedTo!.includes(userId));
            }
            return filters.assignedTo!.includes(node.assignedTo || '');
          });
        }
        
        // Filter by date range
        if (filters.dateRange.start || filters.dateRange.end) {
          filtered = filtered.filter(node => {
            const nodeDate = new Date(node.startDate);
            const start = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
            const end = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
            
            if (start && nodeDate < start) return false;
            if (end && nodeDate > end) return false;
            return true;
          });
        }
        
        // Filter by search query
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filtered = filtered.filter(node =>
            node.title.toLowerCase().includes(query) ||
            (node.description && node.description.toLowerCase().includes(query))
          );
        }
        
        state.filteredNodes = filtered;
        console.log('🔍 Filters applied:', {
          totalNodes: state.nodes.length,
          filteredNodes: filtered.length,
          activeFilters: state.filters
        });
      }),
      
      // ========================================================================
      // DATA FETCHING (REAL USER DATA + DEMO FALLBACK)
      // ========================================================================
      
      fetchRoadmap: async (request) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          console.log('🔄 Loading roadmap data:', request);
          
          // Primero intentar cargar datos reales del usuario
          const { RoadmapDataService } = await import('../services/roadmapDataService');
          const hasUserData = await RoadmapDataService.hasUserData();
          
          if (hasUserData) {
            console.log('📊 Loading real user data for roadmap...');
            const data = await RoadmapDataService.loadUserRoadmapData();
            
            set((state) => {
              state.nodes = data.nodes;
              state.dependencies = data.dependencies;
              state.users = data.users || [];
              state.filteredNodes = data.nodes; // Inicialmente mostrar todos los nodos
              state.isLoading = false;
            });
            
            // Aplicar filtros después del set
            get().applyFilters();
            
            return;
          }
          
          // Fallback: usar API demo si no hay datos reales
          console.log('🎭 No real user data found, using demo API...');
          
          const response = await fetch('/api/roadmap', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch roadmap: ${response.statusText}`);
          }
          
          const data: RoadmapResponse = await response.json();
          
          set((state) => {
            state.nodes = data.nodes;
            state.dependencies = data.dependencies;
            state.users = data.users || [];
            state.filteredNodes = data.nodes; // Inicialmente mostrar todos los nodos
            state.isLoading = false;
          });
          
          // Aplicar filtros después del set
          get().applyFilters();
          
        } catch (error) {
          console.error('❌ Failed to load roadmap data:', error);
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Unknown error';
            state.isLoading = false;
          });
        }
      },
      
      // ========================================================================
      // SIMULATION ACTIONS - THE HEART OF THE FEATURE 🎯
      // ========================================================================
      
      startSimulation: () => set((state) => {
        console.log('🎬 Starting simulation mode...');
        state.isSimulationMode = true;
        state.originalNodes = JSON.parse(JSON.stringify(state.nodes)); // Deep copy
        state.simulationNodes = JSON.parse(JSON.stringify(state.nodes)); // Deep copy
        state.financialImpact = null;
      }),
      
      endSimulation: () => set((state) => {
        console.log('🛑 Ending simulation mode...');
        state.isSimulationMode = false;
        state.simulationNodes = [];
        state.originalNodes = [];
        state.financialImpact = null;
      }),
      
      simulateNodeMove: async (nodeId, newStartDate, newEndDate) => {
        const { isSimulationMode, simulationNodes, originalNodes } = get();
        
        if (!isSimulationMode) {
          console.warn('Cannot simulate node move: simulation mode not active');
          return;
        }
        
        console.log('🎯 Simulating node move:', { nodeId, newStartDate, newEndDate });
        
        // Update the simulated node
        set((state) => {
          const nodeIndex = state.simulationNodes.findIndex(n => n.id === nodeId);
          if (nodeIndex >= 0 && state.simulationNodes[nodeIndex]) {
            state.simulationNodes[nodeIndex].startDate = newStartDate;
            if (newEndDate) {
              state.simulationNodes[nodeIndex].endDate = newEndDate;
            }
          }
        });
        
        // Calculate financial impact using WASM
        try {
          const impact = await calculateFinancialImpact(originalNodes, get().simulationNodes);
          
          set((state) => {
            state.financialImpact = impact;
          });
          
          console.log('💰 Financial impact calculated:', impact);
        } catch (error) {
          console.error('❌ Failed to calculate financial impact:', error);
        }
      },
      
      confirmSimulation: async () => {
        const { simulationNodes, originalNodes, isSimulationMode } = get();
        
        if (!isSimulationMode || simulationNodes.length === 0) {
          console.warn('Cannot confirm simulation: no active simulation');
          return;
        }
        
        console.log('✅ Confirming simulation changes...');
        
        set((state) => {
          state.isLoading = true;
        });
        
        try {
          // Find nodes that were actually modified
          const modifiedNodes = simulationNodes.filter(simNode => {
            const original = originalNodes.find(orig => orig.id === simNode.id);
            return original && (
              original.startDate !== simNode.startDate ||
              original.endDate !== simNode.endDate
            );
          });
          
          console.log(`🔄 Applying ${modifiedNodes.length} changes to backend...`);
          
          // Apply changes to backend
          for (const node of modifiedNodes) {
            const response = await fetch(`/api/roadmap/nodes/${node.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                startDate: node.startDate,
                endDate: node.endDate
              }),
            });
            
            if (!response.ok) {
              throw new Error(`Failed to update node ${node.id}`);
            }
          }
          
          // Update the store with confirmed changes
          set((state) => {
            state.nodes = [...state.simulationNodes];
            state.filteredNodes = [...state.simulationNodes];
            state.isSimulationMode = false;
            state.simulationNodes = [];
            state.originalNodes = [];
            state.financialImpact = null;
            state.isLoading = false;
          });
          
          get().applyFilters();
          
          console.log('✨ Simulation confirmed successfully!');
          
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to confirm changes';
            state.isLoading = false;
          });
          
          console.error('❌ Failed to confirm simulation:', error);
        }
      },
      
      discardSimulation: () => set((state) => {
        console.log('🗑️ Discarding simulation changes...');
        state.isSimulationMode = false;
        state.simulationNodes = [];
        state.originalNodes = [];
        state.financialImpact = null;
      }),
      
      // ========================================================================
      // NODE MANAGEMENT
      // ========================================================================
      
      createNode: async (nodeData) => {
        console.log('➕ Creating new node:', nodeData);
        
        set((state) => {
          state.isLoading = true;
        });
        
        try {
          const response = await fetch('/api/roadmap/nodes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(nodeData),
          });
          
          if (!response.ok) {
            throw new Error('Failed to create node');
          }
          
          const newNode: RoadmapNode = await response.json();
          
          set((state) => {
            state.nodes.push(newNode);
            state.isLoading = false;
          });
          
          get().applyFilters();
          
          console.log('✅ Node created successfully:', newNode.id);
          
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to create node';
            state.isLoading = false;
          });
        }
      },
      
      updateNode: async (nodeId, updates) => {
        try {
          const response = await fetch(`/api/roadmap/nodes/${nodeId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update node');
          }
          
          const updatedNode: RoadmapNode = await response.json();
          
          set((state) => {
            const index = state.nodes.findIndex(n => n.id === nodeId);
            if (index >= 0) {
              state.nodes[index] = updatedNode;
            }
          });
          
          get().applyFilters();
          
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to update node';
          });
        }
      },
      
      deleteNode: async (nodeId) => {
        try {
          const response = await fetch(`/api/roadmap/nodes/${nodeId}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete node');
          }
          
          set((state) => {
            state.nodes = state.nodes.filter(n => n.id !== nodeId);
          });
          
          get().applyFilters();
          
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to delete node';
          });
        }
      },
      
      // ========================================================================
      // DEPENDENCY MANAGEMENT
      // ========================================================================
      
      createDependency: async (fromNodeId, toNodeId) => {
        console.log('🔗 Creating dependency:', { fromNodeId, toNodeId });
        
        try {
          const response = await fetch('/api/roadmap/dependencies', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fromNodeId,
              toNodeId,
              type: 'finish_to_start'
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to create dependency');
          }
          
          const newDependency: Dependency = await response.json();
          
          set((state) => {
            state.dependencies.push(newDependency);
          });
          
          console.log('✅ Dependency created successfully:', newDependency.id);
          
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to create dependency';
          });
        }
      },
      
      deleteDependency: async (dependencyId) => {
        try {
          const response = await fetch(`/api/roadmap/dependencies/${dependencyId}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete dependency');
          }
          
          set((state) => {
            state.dependencies = state.dependencies.filter(d => d.id !== dependencyId);
          });
          
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to delete dependency';
          });
        }
      }
    }))
  )
);

// ============================================================================
// SELECTOR HOOKS
// ============================================================================

export const useRoadmapNodes = () => useRoadmapStore((state) => 
  state.isSimulationMode ? state.simulationNodes : state.filteredNodes
);

export const useRoadmapDependencies = () => useRoadmapStore((state) => state.dependencies);

export const useRoadmapFilters = () => useRoadmapStore((state) => ({
  filters: state.filters,
  setFilters: state.setFilters,
  applyFilters: state.applyFilters
}));

export const useRoadmapSimulation = () => useRoadmapStore((state) => ({
  isSimulationMode: state.isSimulationMode,
  financialImpact: state.financialImpact,
  startSimulation: state.startSimulation,
  endSimulation: state.endSimulation,
  simulateNodeMove: state.simulateNodeMove,
  confirmSimulation: state.confirmSimulation,
  discardSimulation: state.discardSimulation
}));

export const useRoadmapViewConfig = () => useRoadmapStore((state) => ({
  viewConfig: state.viewConfig,
  setViewConfig: state.setViewConfig
}));

console.log('🗺️ Advanced Roadmap Store with WASM integration initialized');