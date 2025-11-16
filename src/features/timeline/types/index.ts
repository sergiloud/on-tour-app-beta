// Timeline Maestro v3.0 - Frontend Types
// Replicamos los tipos del backend más tipos específicos del UI

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
  showId?: string;
}

export interface ReleaseTimelineItem extends BaseTimelineItem {
  type: 'release';
  releaseType: 'single' | 'album' | 'ep' | 'video' | 'merchandise' | 'promotional';
  platforms: string[];
  budget?: number;
  expectedRevenue?: number;
  announcementDate?: Date;
  productionDeadline?: Date;
  showId?: string;
}

// Union type for all timeline items
export type TimelineItem = 
  | ShowTimelineItem 
  | TravelTimelineItem 
  | FinanceTimelineItem 
  | TaskTimelineItem 
  | ReleaseTimelineItem;

// API types
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

// Simulation types
export interface TimelineSimulation {
  id: string;
  name: string;
  baselineId: string;
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
    variance: number;
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
  items: string[];
  severity: 'warning' | 'error' | 'critical';
  description: string;
  suggestions: string[];
}

// Drag & Drop types
export interface DragData {
  itemId: string;
  itemType: TimelineItemType;
  originalStartDate: Date;
  originalEndDate?: Date;
}

export interface DropResult {
  newStartDate: Date;
  newEndDate?: Date;
  hasConflict: boolean;
  conflicts?: TimelineConflict[];
}

// Timeline UI Component Props
export interface TimelineItemProps {
  item: TimelineItem;
  onEdit: (item: TimelineItem) => void;
  onDelete: (itemId: string) => void;
  onDragStart: (dragData: DragData) => void;
  onDragEnd: (dropResult: DropResult) => void;
  isSimulation?: boolean;
  isSelected?: boolean;
  conflicts?: TimelineConflict[];
}

// Timeline colors and styling
export const TIMELINE_COLORS: Record<TimelineItemType, string> = {
  show: 'var(--accent-500)',      // Verde accent
  travel: 'var(--sky-500)',       // Azul cielo
  finance: 'var(--emerald-500)',  // Verde
  task: 'var(--amber-500)',       // Amarillo
  release: 'var(--purple-500)',   // Púrpura
};

export const TIMELINE_ICONS: Record<TimelineItemType, string> = {
  show: '🎤',
  travel: '✈️',
  finance: '💰',
  task: '📋',
  release: '🎵',
};

// Store state interfaces
export interface TimelineState {
  // Data
  items: TimelineItem[];
  permissions: TimelinePermissions | null;
  
  // Simulation state
  simulationItems: TimelineItem[];
  isSimulationMode: boolean;
  simulationResults: SimulationResults | null;
  pendingChanges: TimelineChange[];
  
  // UI state
  viewSettings: TimelineViewSettings;
  filters: TimelineFilterState;
  selectedItem: string | null;
  loading: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface TimelineActions {
  // Data actions
  fetchTimeline: (query?: TimelineQuery) => Promise<void>;
  refreshTimeline: () => Promise<void>;
  
  // Simulation actions
  enterSimulationMode: () => void;
  exitSimulationMode: () => void;
  simulateChange: (change: TimelineChange) => void;
  commitSimulation: () => Promise<void>;
  discardSimulation: () => void;
  
  // Item actions
  selectItem: (itemId: string | null) => void;
  updateItem: (itemId: string, updates: Partial<TimelineItem>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  
  // View actions
  updateViewSettings: (settings: Partial<TimelineViewSettings>) => void;
  updateFilters: (filters: Partial<TimelineFilterState>) => void;
  resetFilters: () => void;
}