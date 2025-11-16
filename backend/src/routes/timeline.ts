import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { TimelineAggregatorService } from '../services/TimelineAggregatorService.js';
import { logger } from '../utils/logger.js';
import { authMiddleware } from '../middleware/auth.js';

export const timelineRouter = Router();

// Apply auth middleware to all timeline routes
timelineRouter.use(authMiddleware);

// Timeline query schema validation
const timelineQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  types: z.array(z.enum(['show', 'travel', 'finance', 'task', 'release'])).optional(),
  status: z.array(z.enum(['draft', 'scheduled', 'active', 'completed', 'cancelled'])).optional(),
  userId: z.string().uuid().optional(),
  showId: z.string().uuid().optional(),
  limit: z.number().int().positive().max(500).optional().default(100),
  offset: z.number().int().min(0).optional().default(0)
});

/**
 * GET /api/timeline
 * Aggregates all timeline entities for the organization
 * Supports filtering by date range, types, status, user, show
 * Applies RBAC permissions based on user role
 */
timelineRouter.get('/', async (req: Request, res: Response) => {
  try {
    // Validate organization context
    if (!req.organizationId) {
      return res.status(400).json({ 
        error: 'Organization context required',
        code: 'MISSING_ORGANIZATION' 
      });
    }

    // Validate and parse query parameters
    let queryParams;
    try {
      queryParams = timelineQuerySchema.parse({
        ...req.query,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 100,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
        types: req.query.types ? (req.query.types as string).split(',') : undefined,
        status: req.query.status ? (req.query.status as string).split(',') : undefined
      });
    } catch (validationError) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: validationError instanceof z.ZodError ? validationError.errors : validationError,
        code: 'VALIDATION_ERROR'
      });
    }

    // Get user permissions based on role
    const userRole = req.user?.role || 'viewer';
    const permissions = TimelineAggregatorService.getTimelinePermissions(userRole, {
      organizationId: req.organizationId
    });

    // Check if user has basic view permissions
    if (!permissions.canView) {
      return res.status(403).json({ 
        error: 'Insufficient permissions to view timeline',
        code: 'ACCESS_DENIED' 
      });
    }

    // Build timeline query
    const timelineQuery = {
      ...queryParams,
      organizationId: req.organizationId,
      userId: queryParams.userId || req.user?.userId
    };

    logger.info('Fetching timeline data', {
      organizationId: req.organizationId,
      userId: req.user?.userId,
      role: userRole,
      query: timelineQuery,
      permissions: {
        visibleTypes: permissions.visibleTypes,
        canViewFinances: permissions.canViewFinances
      }
    });

    // Initialize service and fetch data
    const timelineService = new TimelineAggregatorService();
    const timelineData = await timelineService.getTimelineData(timelineQuery, permissions);

    // Log success metrics
    logger.info('Timeline data fetched successfully', {
      organizationId: req.organizationId,
      totalItems: timelineData.total,
      returnedItems: timelineData.items.length,
      hasMore: timelineData.pagination.hasMore
    });

    // Return enriched response
    res.json({
      success: true,
      data: timelineData,
      meta: {
        permissions,
        user: {
          id: req.user?.userId,
          role: userRole
        },
        organization: {
          id: req.organizationId
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error(error, 'Failed to fetch timeline data', {
      organizationId: req.organizationId,
      userId: req.user?.userId,
      query: req.query
    });

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Organization ID is required')) {
        return res.status(400).json({ 
          error: 'Invalid organization context',
          code: 'INVALID_ORGANIZATION' 
        });
      }
      
      if (error.message.includes('Permission denied')) {
        return res.status(403).json({ 
          error: 'Access denied',
          code: 'PERMISSION_DENIED' 
        });
      }
    }

    // Generic server error
    res.status(500).json({ 
      error: 'Failed to fetch timeline data',
      code: 'SERVER_ERROR',
      message: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : 'Internal server error'
    });
  }
});

/**
 * GET /api/timeline/permissions
 * Returns current user's timeline permissions
 */
timelineRouter.get('/permissions', async (req: Request, res: Response) => {
  try {
    if (!req.organizationId) {
      return res.status(400).json({ 
        error: 'Organization context required',
        code: 'MISSING_ORGANIZATION' 
      });
    }

    const userRole = req.user?.role || 'viewer';
    const permissions = TimelineAggregatorService.getTimelinePermissions(userRole, {
      organizationId: req.organizationId
    });

    res.json({
      success: true,
      data: {
        permissions,
        user: {
          id: req.user?.userId,
          role: userRole
        },
        organization: {
          id: req.organizationId
        }
      }
    });

  } catch (error) {
    logger.error(error, 'Failed to get timeline permissions');
    res.status(500).json({ 
      error: 'Failed to get permissions',
      code: 'SERVER_ERROR' 
    });
  }
});

/**
 * GET /api/timeline/summary
 * Returns timeline summary statistics
 */
timelineRouter.get('/summary', async (req: Request, res: Response) => {
  try {
    if (!req.organizationId) {
      return res.status(400).json({ 
        error: 'Organization context required',
        code: 'MISSING_ORGANIZATION' 
      });
    }

    const userRole = req.user?.role || 'viewer';
    const permissions = TimelineAggregatorService.getTimelinePermissions(userRole, {
      organizationId: req.organizationId
    });

    if (!permissions.canView) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'ACCESS_DENIED' 
      });
    }

    // Get last 30 days of data for summary
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);

    const timelineService = new TimelineAggregatorService();
    const timelineData = await timelineService.getTimelineData({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      organizationId: req.organizationId,
      limit: 1000
    }, permissions);

    // Calculate summary statistics
    const summary = {
      total: timelineData.total,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      upcoming: timelineData.items.filter(item => 
        new Date(item.startDate) > new Date()
      ).length,
      overdue: timelineData.items.filter(item => 
        item.type === 'task' && 
        new Date(item.endDate || item.startDate) < new Date() &&
        item.status !== 'completed'
      ).length,
      dateRange: timelineData.filters.dateRange
    };

    // Count by type
    timelineData.items.forEach(item => {
      summary.byType[item.type] = (summary.byType[item.type] || 0) + 1;
      summary.byStatus[item.status] = (summary.byStatus[item.status] || 0) + 1;
    });

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    logger.error(error, 'Failed to get timeline summary');
    res.status(500).json({ 
      error: 'Failed to get summary',
      code: 'SERVER_ERROR' 
    });
  }
});

export default timelineRouter;