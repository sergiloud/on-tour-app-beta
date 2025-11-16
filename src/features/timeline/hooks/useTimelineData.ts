import { useMemo } from 'react';
import { useTimelineStore } from '../../../shared/timelineStore';
import { 
  TimelineItem, 
  TimelineQuery, 
  TimelineChange, 
  TimelineItemType,
  TimelineStatus 
} from '../types';

/**
 * Main hook for timeline data management
 */
export const useTimelineData = () => {
  const {
    fetchTimeline,
    refreshTimeline,
    loading,
    error,
    items,
    permissions,
    pagination
  } = useTimelineStore();

  return {
    // Data
    items,
    permissions,
    pagination,
    
    // State
    loading,
    error,
    
    // Actions
    fetchTimeline,
    refreshTimeline,
  };
};

/**
 * Hook for timeline simulation functionality
 */
export const useTimelineSimulation = () => {
  const {
    isSimulationMode,
    simulationItems,
    pendingChanges,
    simulationResults,
    enterSimulationMode,
    exitSimulationMode,
    simulateChange,
    commitSimulation,
    discardSimulation
  } = useTimelineStore();

  const hasChanges = pendingChanges.length > 0;
  const activeItems = isSimulationMode ? simulationItems : useTimelineStore.getState().items;

  return {
    // State
    isSimulationMode,
    simulationItems,
    activeItems,
    pendingChanges,
    simulationResults,
    hasChanges,
    
    // Actions
    enterSimulationMode,
    exitSimulationMode,
    simulateChange,
    commitSimulation,
    discardSimulation,
  };
};

/**
 * Hook for timeline filtering and view settings
 */
export const useTimelineFilters = () => {
  const {
    filters,
    viewSettings,
    updateFilters,
    updateViewSettings,
    resetFilters
  } = useTimelineStore();

  // Helper functions for common filter operations
  const toggleType = (type: TimelineItemType) => {
    const newTypes = new Set(filters.types);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    updateFilters({ types: newTypes });
  };

  const toggleStatus = (status: TimelineStatus) => {
    const newStatuses = new Set(filters.statuses);
    if (newStatuses.has(status)) {
      newStatuses.delete(status);
    } else {
      newStatuses.add(status);
    }
    updateFilters({ statuses: newStatuses });
  };

  const setDateRange = (start: Date, end: Date) => {
    updateFilters({ dateRange: { start, end } });
  };

  const setSearchQuery = (query: string) => {
    updateFilters({ searchQuery: query });
  };

  return {
    // Current state
    filters,
    viewSettings,
    
    // Helper actions
    toggleType,
    toggleStatus,
    setDateRange,
    setSearchQuery,
    resetFilters,
    
    // Raw actions
    updateFilters,
    updateViewSettings,
  };
};

/**
 * Hook for timeline item selection and editing
 */
export const useTimelineSelection = () => {
  const {
    selectedItem,
    selectItem,
    updateItem,
    deleteItem
  } = useTimelineStore();

  const items = useTimelineStore((state) => 
    state.isSimulationMode ? state.simulationItems : state.items
  );

  const selectedItemData = useMemo(() => 
    selectedItem ? items.find(item => item.id === selectedItem) : null,
    [selectedItem, items]
  );

  return {
    selectedItem,
    selectedItemData,
    selectItem,
    updateItem,
    deleteItem,
  };
};

/**
 * Hook for filtered and sorted timeline items
 */
export const useFilteredTimelineItems = () => {
  const { filters, viewSettings } = useTimelineStore();
  const items = useTimelineStore((state) => 
    state.isSimulationMode ? state.simulationItems : state.items
  );

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by types
    if (filters.types.size > 0) {
      filtered = filtered.filter(item => filters.types.has(item.type));
    }

    // Filter by statuses
    if (filters.statuses.size > 0) {
      filtered = filtered.filter(item => filters.statuses.has(item.status));
    }

    // Filter by assignees (for tasks)
    if (filters.assignees.size > 0) {
      filtered = filtered.filter(item => {
        if (item.type === 'task' && 'assignedTo' in item) {
          return item.assignedTo ? filters.assignees.has(item.assignedTo) : false;
        }
        return true; // Non-task items pass through
      });
    }

    // Filter by showIds
    if (filters.showIds.size > 0) {
      filtered = filtered.filter(item => {
        if ('showId' in item && item.showId) {
          return filters.showIds.has(item.showId);
        }
        return true; // Items without showId pass through
      });
    }

    // Filter by date range
    if (filters.dateRange) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.startDate);
        return itemDate >= filters.dateRange!.start && itemDate <= filters.dateRange!.end;
      });
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }

    // Sort items
    filtered.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateA - dateB;
    });

    return filtered;
  }, [items, filters, viewSettings]);

  // Group items if needed
  const groupedItems = useMemo(() => {
    if (viewSettings.groupBy === 'none') {
      return { all: filteredItems };
    }

    const groups: Record<string, TimelineItem[]> = {};

    filteredItems.forEach(item => {
      let groupKey: string;

      switch (viewSettings.groupBy) {
        case 'type':
          groupKey = item.type;
          break;
        case 'status':
          groupKey = item.status;
          break;
        case 'assignee':
          if (item.type === 'task' && 'assignedTo' in item && item.assignedTo) {
            groupKey = item.assignedTo;
          } else {
            groupKey = 'Unassigned';
          }
          break;
        default:
          groupKey = 'all';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    return groups;
  }, [filteredItems, viewSettings.groupBy]);

  return {
    filteredItems,
    groupedItems,
    itemCount: filteredItems.length,
  };
};

/**
 * Hook for timeline drag and drop functionality
 */
export const useTimelineDragDrop = () => {
  const { simulateChange, isSimulationMode } = useTimelineStore();

  const handleItemMove = (
    itemId: string,
    newStartDate: Date,
    newEndDate?: Date
  ) => {
    if (!isSimulationMode) {
      console.warn('Drag and drop only available in simulation mode');
      return;
    }

    const change: TimelineChange = {
      id: `move-${itemId}-${Date.now()}`,
      itemId,
      changeType: 'move',
      newData: {
        startDate: newStartDate,
        endDate: newEndDate,
      },
      timestamp: new Date(),
    };

    simulateChange(change);
  };

  return {
    handleItemMove,
    canDrag: isSimulationMode,
  };
};

/**
 * Hook for timeline statistics and metrics
 */
export const useTimelineMetrics = () => {
  const items = useTimelineStore((state) => 
    state.isSimulationMode ? state.simulationItems : state.items
  );

  const metrics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalItems = items.length;
    const byType = items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<TimelineItemType, number>);

    const byStatus = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<TimelineStatus, number>);

    // Time-based metrics
    const upcoming = items.filter(item => 
      new Date(item.startDate) > now
    ).length;

    const recentPast = items.filter(item => {
      const itemDate = new Date(item.startDate);
      return itemDate >= thirtyDaysAgo && itemDate <= now;
    }).length;

    const nearFuture = items.filter(item => {
      const itemDate = new Date(item.startDate);
      return itemDate >= now && itemDate <= thirtyDaysAhead;
    }).length;

    // Task-specific metrics
    const tasks = items.filter(item => item.type === 'task') as any[];
    const overdueTasks = tasks.filter(task => 
      new Date(task.deadline || task.endDate || task.startDate) < now &&
      task.status !== 'completed'
    ).length;

    // Financial metrics (if finances are visible)
    const finances = items.filter(item => item.type === 'finance') as any[];
    const totalRevenue = finances
      .filter(f => f.category === 'income')
      .reduce((sum, f) => sum + (f.amount || 0), 0);
    
    const totalExpenses = finances
      .filter(f => f.category === 'expense')
      .reduce((sum, f) => sum + (f.amount || 0), 0);

    return {
      totalItems,
      byType,
      byStatus,
      upcoming,
      recentPast,
      nearFuture,
      overdueTasks,
      finances: {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
      },
    };
  }, [items]);

  return metrics;
};