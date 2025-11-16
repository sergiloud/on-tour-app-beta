import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  TimelineState, 
  TimelineActions, 
  TimelineItem,
  TimelineQuery,
  TimelineResponse,
  TimelinePermissions,
  TimelineViewSettings,
  TimelineFilterState,
  TimelineChange,
  SimulationResults,
  TimelineItemType 
} from '../features/timeline/types';
import { fetchTimelineData } from '../lib/timelineApi';

// WASM-compatible types for Timeline Simulation Worker
export interface TimelineData {
  tasks: Array<{
    id: string;
    task_type: string;
    status: string;
    priority: string;
    deadline: string;
    estimated_hours: number;
    completion_percentage: number;
    cost_impact: number;
    revenue_impact: number;
    dependencies: string[];
  }>;
  releases: Array<{
    id: string;
    release_type: string;
    release_date: string;
    budget: number;
    projected_revenue: number;
    platforms: string[];
    marketing_spend: number;
    dependencies: string[];
  }>;
  shows: Array<{
    id: string;
    date: string;
    revenue: number;
    expenses: number;
    status: string;
    venue_capacity: number;
    expected_attendance: number;
  }>;
}

export interface TimelineSimulationResult {
  financial_impact: number;
  affected_entities: string[];
  cascade_effects: string[];
  new_deadlines: Record<string, string>;
  risk_score: number;
  revenue_change: number;
  expense_change: number;
  critical_path: string[];
}

export interface TimelineMetrics {
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  total_releases: number;
  released_count: number;
  overdue_tasks: number;
  total_revenue_impact: number;
  total_cost_impact: number;
  net_impact: number;
  efficiency_score: number;
}

// Re-export TimelineChange for worker
export type { TimelineChange };

// Default view settings
const defaultViewSettings: TimelineViewSettings = {
  zoom: 'month',
  groupBy: 'type',
  showDependencies: true,
  showConflicts: true,
  swimlanes: ['show', 'travel', 'finance', 'task', 'release'],
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),   // 90 days ahead
  },
};

// Default filter state
const defaultFilters: TimelineFilterState = {
  types: new Set<TimelineItemType>(['show', 'travel', 'finance', 'task', 'release']),
  statuses: new Set(['draft', 'scheduled', 'active', 'completed']),
  assignees: new Set(),
  showIds: new Set(),
  searchQuery: '',
};

interface TimelineStore extends TimelineState, TimelineActions {}

export const useTimelineStore = create<TimelineStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      items: [],
      permissions: null,
      simulationItems: [],
      isSimulationMode: false,
      simulationResults: null,
      pendingChanges: [],
      viewSettings: defaultViewSettings,
      filters: defaultFilters,
      selectedItem: null,
      loading: false,
      error: null,
      pagination: {
        total: 0,
        limit: 100,
        offset: 0,
        hasMore: false,
      },

      // Data actions
      fetchTimeline: async (query?: TimelineQuery) => {
        set({ loading: true, error: null });
        
        try {
          const currentState = get();
          
          // Build query parameters
          const searchParams = new URLSearchParams();
          
          if (query?.startDate) {
            searchParams.append('startDate', query.startDate);
          } else {
            searchParams.append('startDate', currentState.viewSettings.dateRange.start.toISOString());
          }
          
          if (query?.endDate) {
            searchParams.append('endDate', query.endDate);
          } else {
            searchParams.append('endDate', currentState.viewSettings.dateRange.end.toISOString());
          }
          
          if (query?.types) {
            searchParams.append('types', query.types.join(','));
          } else {
            searchParams.append('types', Array.from(currentState.filters.types).join(','));
          }
          
          if (query?.status) {
            searchParams.append('status', query.status.join(','));
          } else {
            searchParams.append('status', Array.from(currentState.filters.statuses).join(','));
          }
          
          if (query?.limit) {
            searchParams.append('limit', query.limit.toString());
          }
          
          if (query?.offset) {
            searchParams.append('offset', query.offset.toString());
          }

          // Fetch from API (mock in development, real in production)
          const data = await fetchTimelineData(searchParams);
          
          if (!data.success) {
            throw new Error(data.error || 'Failed to fetch timeline data');
          }

          const timelineData: TimelineResponse = data.data;
          const permissions: TimelinePermissions = data.meta?.permissions;

          // Convert date strings to Date objects
          const processedItems = timelineData.items.map(item => ({
            ...item,
            startDate: new Date(item.startDate),
            endDate: item.endDate ? new Date(item.endDate) : undefined,
          }));

          set({
            items: processedItems,
            permissions,
            pagination: {
              ...timelineData.pagination,
              total: timelineData.total,
            },
            loading: false,
          });

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          console.error('Timeline fetch error:', error);
          
          set({
            loading: false,
            error: errorMessage,
            items: [],
          });
        }
      },

      refreshTimeline: async () => {
        const currentState = get();
        await currentState.fetchTimeline();
      },

      // Simulation actions
      enterSimulationMode: () => {
        const currentItems = get().items;
        set({
          isSimulationMode: true,
          simulationItems: [...currentItems], // Deep copy for simulation
          pendingChanges: [],
          simulationResults: null,
        });
      },

      exitSimulationMode: () => {
        set({
          isSimulationMode: false,
          simulationItems: [],
          pendingChanges: [],
          simulationResults: null,
        });
      },

      simulateChange: (change: TimelineChange) => {
        const state = get();
        
        // Add to pending changes
        const newChanges = [...state.pendingChanges, change];
        
        // Apply change to simulation items
        let simulationItems = [...state.simulationItems];
        
        switch (change.changeType) {
          case 'move':
          case 'update':
            simulationItems = simulationItems.map(item => 
              item.id === change.itemId 
                ? { ...item, ...change.newData } as TimelineItem
                : item
            );
            break;
            
          case 'create':
            if (change.newData) {
              simulationItems.push(change.newData as TimelineItem);
            }
            break;
            
          case 'delete':
            simulationItems = simulationItems.filter(item => item.id !== change.itemId);
            break;
        }
        
        set({
          simulationItems,
          pendingChanges: newChanges,
        });

        // TODO: Trigger WASM simulation calculation here
        // This will be implemented in the next phase
      },

      commitSimulation: async () => {
        const state = get();
        
        if (state.pendingChanges.length === 0) {
          return;
        }

        set({ loading: true });

        try {
          // TODO: Send pending changes to backend
          // For now, just apply changes to main items
          set({
            items: [...state.simulationItems],
            isSimulationMode: false,
            simulationItems: [],
            pendingChanges: [],
            simulationResults: null,
            loading: false,
          });
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to commit simulation';
          set({
            loading: false,
            error: errorMessage,
          });
        }
      },

      discardSimulation: () => {
        set({
          isSimulationMode: false,
          simulationItems: [],
          pendingChanges: [],
          simulationResults: null,
        });
      },

      // Item actions
      selectItem: (itemId: string | null) => {
        set({ selectedItem: itemId });
      },

      updateItem: async (itemId: string, updates: Partial<TimelineItem>) => {
        set({ loading: true });
        
        try {
          // TODO: Send update to backend API
          // For now, just update locally
          const state = get();
          const updatedItems = state.items.map(item => 
            item.id === itemId ? { ...item, ...updates } as TimelineItem : item
          );
          
          set({
            items: updatedItems,
            loading: false,
          });
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update item';
          set({
            loading: false,
            error: errorMessage,
          });
        }
      },

      deleteItem: async (itemId: string) => {
        set({ loading: true });
        
        try {
          // TODO: Send delete to backend API
          // For now, just remove locally
          const state = get();
          const filteredItems = state.items.filter(item => item.id !== itemId);
          
          set({
            items: filteredItems,
            selectedItem: state.selectedItem === itemId ? null : state.selectedItem,
            loading: false,
          });
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
          set({
            loading: false,
            error: errorMessage,
          });
        }
      },

      // View actions
      updateViewSettings: (newSettings: Partial<TimelineViewSettings>) => {
        const currentSettings = get().viewSettings;
        const updatedSettings = { ...currentSettings, ...newSettings };
        
        set({ viewSettings: updatedSettings });
        
        // Auto-refresh if date range changed
        if (newSettings.dateRange) {
          get().fetchTimeline();
        }
      },

      updateFilters: (newFilters: Partial<TimelineFilterState>) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        
        set({ filters: updatedFilters });
        
        // Auto-refresh with new filters
        get().fetchTimeline();
      },

      resetFilters: () => {
        set({ filters: defaultFilters });
        get().fetchTimeline();
      },
    }),
    {
      name: 'timeline-store',
      partialize: (state: TimelineStore) => ({
        viewSettings: state.viewSettings,
        filters: {
          ...state.filters,
          types: Array.from(state.filters.types),
          statuses: Array.from(state.filters.statuses),
          assignees: Array.from(state.filters.assignees),
          showIds: Array.from(state.filters.showIds),
        },
      }),
    }
  )
);

// Selector hooks for performance
export const useTimelineItems = () => useTimelineStore((state) => 
  state.isSimulationMode ? state.simulationItems : state.items
);

export const useTimelinePermissions = () => useTimelineStore((state) => state.permissions);

export const useTimelineLoading = () => useTimelineStore((state) => state.loading);

export const useTimelineError = () => useTimelineStore((state) => state.error);

export const useSimulationMode = () => useTimelineStore((state) => ({
  isSimulationMode: state.isSimulationMode,
  pendingChanges: state.pendingChanges,
  simulationResults: state.simulationResults,
}));

export const useTimelineViewSettings = () => useTimelineStore((state) => state.viewSettings);

export const useTimelineFilters = () => useTimelineStore((state) => state.filters);

export const useSelectedTimelineItem = () => useTimelineStore((state) => {
  const items = state.isSimulationMode ? state.simulationItems : state.items;
  return state.selectedItem ? items.find(item => item.id === state.selectedItem) : null;
});