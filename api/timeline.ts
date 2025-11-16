// Timeline Maestro v3.0 - API Endpoint
// Vercel serverless function

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface TimelineItem {
  id: string;
  type: 'show' | 'travel' | 'finance' | 'task' | 'release';
  title: string;
  startDate: string;
  endDate?: string;
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

// Demo timeline data
const generateDemoTimelineData = (): TimelineItem[] => {
  const now = new Date();
  const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'show-1',
      type: 'show',
      title: 'Barcelona Concert',
      startDate: addDays(now, 14).toISOString(),
      endDate: addDays(now, 14).toISOString(),
      status: 'confirmed',
      priority: 'high',
      description: 'Main tour date at Palau de Pedralbes',
      costImpact: 15000,
      revenueImpact: 45000,
      dependencies: [],
      assignee: 'tour-manager',
      tags: ['concert', 'spain', 'main-tour']
    },
    {
      id: 'travel-1', 
      type: 'travel',
      title: 'Flight to Barcelona',
      startDate: addDays(now, 13).toISOString(),
      endDate: addDays(now, 13).toISOString(),
      status: 'confirmed',
      priority: 'high',
      description: 'Flight BCN-MAD IB6754',
      costImpact: 2500,
      dependencies: ['show-1'],
      assignee: 'travel-coordinator',
      tags: ['flight', 'logistics']
    },
    {
      id: 'task-1',
      type: 'task', 
      title: 'Sound Check Rehearsal',
      startDate: addDays(now, 13).toISOString(),
      endDate: addDays(now, 14).toISOString(),
      status: 'in-progress',
      priority: 'medium',
      description: 'Technical rehearsal and sound setup',
      costImpact: 3000,
      dependencies: ['travel-1'],
      assignee: 'sound-engineer',
      tags: ['technical', 'rehearsal']
    },
    {
      id: 'release-1',
      type: 'release',
      title: 'New Single Release',
      startDate: addDays(now, 7).toISOString(),
      status: 'planned',
      priority: 'high',
      description: 'Digital release on all platforms',
      costImpact: 5000,
      revenueImpact: 20000,
      dependencies: [],
      assignee: 'marketing-manager', 
      tags: ['music', 'promotion']
    },
    {
      id: 'finance-1',
      type: 'finance',
      title: 'Venue Payment Due',
      startDate: addDays(now, 10).toISOString(),
      status: 'planned', 
      priority: 'critical',
      description: 'Final payment to venue (50% balance)',
      costImpact: 22500,
      dependencies: ['show-1'],
      assignee: 'finance-manager',
      tags: ['payment', 'venue']
    }
  ];
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Extract query parameters
    const { 
      startDate,
      endDate,
      types, 
      status,
      limit = '100',
      offset = '0'
    } = req.query;

    // Generate demo data
    let items = generateDemoTimelineData();

    // Apply filters
    if (startDate && typeof startDate === 'string') {
      const filterStart = new Date(startDate);
      items = items.filter(item => new Date(item.startDate) >= filterStart);
    }

    if (endDate && typeof endDate === 'string') {
      const filterEnd = new Date(endDate);
      items = items.filter(item => new Date(item.startDate) <= filterEnd);
    }

    if (types && typeof types === 'string') {
      const typeArray = types.split(',') as TimelineItem['type'][];
      items = items.filter(item => typeArray.includes(item.type));
    }

    if (status && typeof status === 'string') {
      const statusArray = status.split(',') as TimelineItem['status'][];
      items = items.filter(item => statusArray.includes(item.status));
    }

    // Apply pagination
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);
    const paginatedItems = items.slice(offsetNum, offsetNum + limitNum);

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
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < items.length
      },
      total: items.length
    };

    // Format response to match what the store expects
    const response = {
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

    console.log(`📊 Timeline API: Returning ${paginatedItems.length} items (${items.length} total)`);
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('Timeline API error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}