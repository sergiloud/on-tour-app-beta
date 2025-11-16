// Timeline API utilities and mock data for development

interface TimelineItem {
  id: string;
  type: 'show' | 'travel' | 'finance' | 'task' | 'release';
  title: string;
  startDate: Date;
  endDate?: Date;
  status: 'planned' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  costImpact?: number;
  revenueImpact?: number;
  dependencies?: string[];
  assignee?: string;
  tags?: string[];
}

interface TimelineResponse {
  items: TimelineItem[];
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canSimulate: boolean;
    canViewFinances: boolean;
    canCreateTasks: boolean;
    canManageReleases: boolean;
    visibleTypes: TimelineItem['type'][];
    editableTypes: TimelineItem['type'][];
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  total: number;
}

// Mock timeline data for development
export function generateMockTimelineData(): TimelineItem[] {
  const now = new Date();
  const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'show-1',
      type: 'show',
      title: 'Barcelona Concert',
      startDate: addDays(now, 14),
      endDate: addDays(now, 14),
      status: 'confirmed',
      priority: 'high',
      description: 'Major concert at Palau de la Música Catalana',
      revenueImpact: 25000,
      costImpact: 12000,
      assignee: 'production-manager',
      tags: ['concert', 'venue', 'high-revenue']
    },
    {
      id: 'travel-1',
      type: 'travel',
      title: 'Barcelona Flight',
      startDate: addDays(now, 13),
      endDate: addDays(now, 13),
      status: 'confirmed',
      priority: 'medium',
      description: 'Flight to Barcelona for concert',
      costImpact: 800,
      dependencies: ['show-1'],
      assignee: 'tour-manager',
      tags: ['flight', 'travel']
    },
    {
      id: 'task-1',
      type: 'task',
      title: 'Sound Check Setup',
      startDate: addDays(now, 14),
      status: 'planned',
      priority: 'high',
      description: 'Set up and test sound equipment',
      dependencies: ['show-1'],
      assignee: 'sound-engineer',
      tags: ['setup', 'technical']
    },
    {
      id: 'finance-1',
      type: 'finance',
      title: 'Venue Payment',
      startDate: addDays(now, 7),
      status: 'completed',
      priority: 'critical',
      description: 'Payment to venue for concert booking',
      costImpact: 8000,
      dependencies: ['show-1'],
      assignee: 'finance-manager',
      tags: ['payment', 'venue']
    },
    {
      id: 'show-2',
      type: 'show',
      title: 'Madrid Concert',
      startDate: addDays(now, 21),
      endDate: addDays(now, 21),
      status: 'planned',
      priority: 'high',
      description: 'Concert at WiZink Center Madrid',
      revenueImpact: 35000,
      costImpact: 18000,
      assignee: 'production-manager',
      tags: ['concert', 'venue', 'high-revenue']
    },
    {
      id: 'release-1',
      type: 'release',
      title: 'New Single Release',
      startDate: addDays(now, 3),
      status: 'in-progress',
      priority: 'medium',
      description: 'Digital release of new single',
      revenueImpact: 5000,
      assignee: 'marketing-manager',
      tags: ['music', 'digital', 'release']
    }
  ];
}

// Development API mock
export async function mockTimelineAPI(searchParams: URLSearchParams): Promise<any> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const allItems = generateMockTimelineData();
  let items = [...allItems];

  // Apply filters
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const types = searchParams.get('types');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '100', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  if (startDate) {
    const filterStart = new Date(startDate);
    items = items.filter(item => item.startDate >= filterStart);
  }

  if (endDate) {
    const filterEnd = new Date(endDate);
    items = items.filter(item => item.startDate <= filterEnd);
  }

  if (types) {
    const typeArray = types.split(',') as TimelineItem['type'][];
    items = items.filter(item => typeArray.includes(item.type));
  }

  if (status) {
    const statusArray = status.split(',') as TimelineItem['status'][];
    items = items.filter(item => statusArray.includes(item.status));
  }

  // Apply pagination
  const paginatedItems = items.slice(offset, offset + limit);

  const timelineData: TimelineResponse = {
    items: paginatedItems,
    permissions: {
      canView: true,
      canEdit: true,
      canDelete: true,
      canSimulate: true,
      canViewFinances: true,
      canCreateTasks: true,
      canManageReleases: true,
      visibleTypes: ['show', 'travel', 'finance', 'task', 'release'],
      editableTypes: ['show', 'travel', 'finance', 'task', 'release']
    },
    pagination: {
      total: items.length,
      limit,
      offset,
      hasMore: offset + limit < items.length
    },
    total: items.length
  };

  return {
    success: true,
    data: timelineData,
    meta: {
      permissions: {
        canView: true,
        canEdit: true,
        canDelete: true,
        canSimulate: true,
        canViewFinances: true,
        canCreateTasks: true,
        canManageReleases: true,
        visibleTypes: ['show', 'travel', 'finance', 'task', 'release'],
        editableTypes: ['show', 'travel', 'finance', 'task', 'release']
      }
    }
  };
}

// Check if running in development mode
export function isDevelopment(): boolean {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
}

// Unified API function that uses mock in development, real API in production
export async function fetchTimelineData(searchParams: URLSearchParams): Promise<any> {
  if (isDevelopment()) {
    console.log('🔧 Using mock Timeline API for development');
    return mockTimelineAPI(searchParams);
  } else {
    // Production API call
    const response = await fetch(`/api/timeline?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch timeline: ${response.status}`);
    }

    return response.json();
  }
}