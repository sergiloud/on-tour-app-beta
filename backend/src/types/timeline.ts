// Timeline Maestro v3.0 - Type Definitions
// Base interface for all timeline items

export type TimelineItemType = 'show' | 'travel' | 'finance' | 'task' | 'release';
export type TimelineStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';

// Base Timeline Item interface
export interface BaseTimelineItem {
  id: string;
  type: TimelineItemType;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  status: TimelineStatus;
  organizationId: string;
  createdBy: string;
  metadata?: Record<string, any>;
}

// Extended interfaces for each entity type
export interface ShowTimelineItem extends BaseTimelineItem {
  type: 'show';
  location: string;
  venue?: string;
  budget?: number;
  expectedRevenue?: number;
  ticketsSold?: number;
  capacity?: number;
}

export interface TravelTimelineItem extends BaseTimelineItem {
  type: 'travel';
  origin: string;
  destination: string;
  transportType: 'flight' | 'bus' | 'train' | 'car' | 'other';
  cost?: number;
  bookingReference?: string;
}

export interface FinanceTimelineItem extends BaseTimelineItem {
  type: 'finance';
  amount: number;
  category: 'income' | 'expense';
  subcategory?: string;
  paymentMethod?: string;
  isRecurring?: boolean;
}

export interface TaskTimelineItem extends BaseTimelineItem {
  type: 'task';
  taskType: 'technical' | 'promotional' | 'administrative' | 'logistics';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  estimatedHours?: number;
  deadline: Date;
  showId?: string; // Optional relation to show
}

export interface ReleaseTimelineItem extends BaseTimelineItem {
  type: 'release';
  releaseType: 'single' | 'album' | 'ep' | 'video' | 'merchandise' | 'promotional';
  platforms: string[];
  budget?: number;
  expectedRevenue?: number;
  announcementDate?: Date;
  productionDeadline?: Date;
  showId?: string; // Optional relation to show
}

// Union type for all timeline items
export type TimelineItem = 
  | ShowTimelineItem 
  | TravelTimelineItem 
  | FinanceTimelineItem 
  | TaskTimelineItem 
  | ReleaseTimelineItem;

// Timeline query parameters
export interface TimelineQuery {
  startDate?: string;
  endDate?: string;
  types?: TimelineItemType[];
  status?: TimelineStatus[];
  organizationId?: string;
  userId?: string;
  showId?: string;
  limit?: number;
  offset?: number;
}

// Timeline response
export interface TimelineResponse {
  items: TimelineItem[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: {
    dateRange: { start: Date; end: Date };
    appliedFilters: TimelineQuery;
  };
}

// Dependency relationship
export interface TimelineDependency {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'blocks' | 'prerequisite' | 'related' | 'financial';
  description?: string;
  createdAt: Date;
}

// Simulation-specific types
export interface TimelineSimulation {
  id: string;
  name: string;
  baselineId: string; // Original timeline snapshot
  changes: TimelineChange[];
  results: SimulationResults;
  createdAt: Date;
}

export interface TimelineChange {
  id: string;
  itemId: string;
  changeType: 'move' | 'update' | 'create' | 'delete';
  originalData?: Partial<TimelineItem>;
  newData: Partial<TimelineItem>;
  timestamp: Date;
}

export interface SimulationResults {
  financialImpact: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    variance: number; // Compared to baseline
  };
  scheduleImpact: {
    conflictCount: number;
    conflicts: TimelineConflict[];
    criticalPathAffected: boolean;
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    recommendations: string[];
  };
}

export interface TimelineConflict {
  id: string;
  type: 'date_overlap' | 'resource_conflict' | 'dependency_violation';
  items: string[]; // IDs of conflicting items
  severity: 'warning' | 'error' | 'critical';
  description: string;
  suggestions: string[];
}

// Permission and RBAC types
export interface TimelinePermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSimulate: boolean;
  canViewFinances: boolean;
  canCreateTasks: boolean;
  canManageReleases: boolean;
  visibleTypes: TimelineItemType[];
  editableTypes: TimelineItemType[];
}

// UI-specific types
export interface TimelineViewSettings {
  zoom: 'day' | 'week' | 'month' | 'quarter';
  groupBy: 'type' | 'status' | 'assignee' | 'none';
  showDependencies: boolean;
  showConflicts: boolean;
  swimlanes: TimelineItemType[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

export interface TimelineFilterState {
  types: Set<TimelineItemType>;
  statuses: Set<TimelineStatus>;
  assignees: Set<string>;
  showIds: Set<string>;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

// All types are already exported above via export interface/type declarations