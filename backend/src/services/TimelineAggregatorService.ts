import { Repository } from 'typeorm';
import { AppDataSource } from '../database/datasource.js';
import { Show } from '../database/entities/Show.js';
import { FinanceRecord } from '../database/entities/FinanceRecord.js';
import { Itinerary } from '../database/entities/Itinerary.js';
import { Task } from '../database/entities/Task.js';
import { Release } from '../database/entities/Release.js';
import { 
  TimelineItem,
  TimelineQuery,
  TimelineResponse,
  ShowTimelineItem,
  TravelTimelineItem,
  FinanceTimelineItem,
  TaskTimelineItem,
  ReleaseTimelineItem,
  TimelinePermissions,
} from '../types/timeline.js';
import { logger } from '../utils/logger.js';

export class TimelineAggregatorService {
  private showRepository: Repository<Show>;
  private financeRepository: Repository<FinanceRecord>;
  private itineraryRepository: Repository<Itinerary>;
  private taskRepository: Repository<Task>;
  private releaseRepository: Repository<Release>;

  constructor() {
    this.showRepository = AppDataSource.getRepository(Show);
    this.financeRepository = AppDataSource.getRepository(FinanceRecord);
    this.itineraryRepository = AppDataSource.getRepository(Itinerary);
    this.taskRepository = AppDataSource.getRepository(Task);
    this.releaseRepository = AppDataSource.getRepository(Release);
  }

  /**
   * Main method: Aggregates all timeline entities for an organization
   * Applies RBAC filtering and date range constraints
   */
  async getTimelineData(
    query: TimelineQuery,
    permissions: TimelinePermissions
  ): Promise<TimelineResponse> {
    const {
      startDate,
      endDate,
      types = ['show', 'travel', 'finance', 'task', 'release'],
      status,
      organizationId,
      userId,
      showId,
      limit = 100,
      offset = 0
    } = query;

    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    logger.info(`Aggregating timeline data for org: ${organizationId}`);

    try {
      // Filter types based on permissions
      const allowedTypes = types.filter(type => 
        permissions.visibleTypes.includes(type)
      );

      const items: TimelineItem[] = [];
      
      // Fetch each entity type in parallel
      const fetchPromises = [];

      // Shows
      if (allowedTypes.includes('show') && permissions.canView) {
        fetchPromises.push(this.fetchShows(organizationId, startDate, endDate, status, showId));
      }

      // Travel (Itineraries)
      if (allowedTypes.includes('travel') && permissions.canView) {
        fetchPromises.push(this.fetchTravel(organizationId, startDate, endDate, status, showId));
      }

      // Finances
      if (allowedTypes.includes('finance') && permissions.canViewFinances) {
        fetchPromises.push(this.fetchFinances(organizationId, startDate, endDate, showId));
      }

      // Tasks
      if (allowedTypes.includes('task') && permissions.canView) {
        fetchPromises.push(this.fetchTasks(organizationId, startDate, endDate, status, showId, userId));
      }

      // Releases
      if (allowedTypes.includes('release') && permissions.canView) {
        fetchPromises.push(this.fetchReleases(organizationId, startDate, endDate, status, showId));
      }

      // Execute all fetches concurrently
      const results = await Promise.allSettled(fetchPromises);
      
      // Collect successful results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          items.push(...result.value);
        } else {
          logger.error(result.reason, `Failed to fetch timeline data for type ${allowedTypes[index]}`);
        }
      });

      // Sort by start date
      items.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

      // Apply pagination
      const total = items.length;
      const paginatedItems = items.slice(offset, offset + limit);

      return {
        items: paginatedItems,
        total,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < total
        },
        filters: {
          dateRange: {
            start: startDate ? new Date(startDate) : new Date(Math.min(...items.map(i => new Date(i.startDate).getTime()))),
            end: endDate ? new Date(endDate) : new Date(Math.max(...items.map(i => new Date(i.endDate || i.startDate).getTime())))
          },
          appliedFilters: query
        }
      };

    } catch (error) {
      logger.error(error, 'Failed to aggregate timeline data');
      throw error;
    }
  }

  /**
   * Fetch Shows as timeline items
   */
  private async fetchShows(
    organizationId: string,
    startDate?: string,
    endDate?: string,
    status?: string[],
    showId?: string
  ): Promise<ShowTimelineItem[]> {
    const query = this.showRepository.createQueryBuilder('show')
      .where('show.organizationId = :organizationId', { organizationId });

    if (startDate) {
      query.andWhere('show.startDate >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('show.endDate <= :endDate', { endDate });
    }
    if (status && status.length > 0) {
      query.andWhere('show.status IN (:...status)', { status });
    }
    if (showId) {
      query.andWhere('show.id = :showId', { showId });
    }

    const shows = await query.getMany();
    
    return shows.map(show => ({
      id: show.id,
      type: 'show',
      title: show.title,
      description: show.description,
      startDate: show.startDate,
      endDate: show.endDate,
      status: show.status as any,
      organizationId: show.organizationId,
      createdBy: show.createdBy || 'system',
      location: show.location,
      venue: show.location, // Use location as venue fallback
      budget: show.budget ? parseFloat(show.budget.toString()) : undefined,
      expectedRevenue: undefined, // Not in current schema
      metadata: {
        capacity: show.capacity,
        ticketsSold: undefined, // Not in current schema
        genre: show.type, // Use type field as genre
        originalShow: show
      }
    }));
  }

  /**
   * Fetch Travel (Itineraries) as timeline items
   */
  private async fetchTravel(
    organizationId: string,
    startDate?: string,
    endDate?: string,
    status?: string[],
    showId?: string
  ): Promise<TravelTimelineItem[]> {
    // Note: Current Itinerary schema doesn't have organizationId, so we need to join with Show
    const query = this.itineraryRepository.createQueryBuilder('itinerary')
      .innerJoin('itinerary.show', 'show')
      .where('show.organizationId = :organizationId', { organizationId });

    if (startDate) {
      query.andWhere('itinerary.startDate >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('itinerary.endDate <= :endDate', { endDate });
    }
    if (status && status.length > 0) {
      query.andWhere('itinerary.status IN (:...status)', { status });
    }
    if (showId) {
      query.andWhere('itinerary.showId = :showId', { showId });
    }

    const itineraries = await query.getMany();
    
    return itineraries.map(itinerary => ({
      id: itinerary.id,
      type: 'travel',
      title: `Travel to ${itinerary.destination}`,
      description: itinerary.description,
      startDate: itinerary.startDate,
      endDate: itinerary.endDate,
      status: itinerary.status as any,
      organizationId: '', // Will be filled via Show relation
      createdBy: 'system',
      origin: 'TBD', // Not in current schema
      destination: itinerary.destination,
      transportType: 'other' as any, // Not in current schema
      cost: itinerary.estimatedCost ? parseFloat(itinerary.estimatedCost.toString()) : undefined,
      bookingReference: undefined, // Not in current schema
      metadata: {
        showId: itinerary.showId,
        numberOfDays: itinerary.numberOfDays,
        activities: itinerary.activities,
        currency: itinerary.currency,
        originalItinerary: itinerary
      }
    }));
  }

  /**
   * Fetch Finances as timeline items
   */
  private async fetchFinances(
    organizationId: string,
    startDate?: string,
    endDate?: string,
    showId?: string
  ): Promise<FinanceTimelineItem[]> {
    // Note: Current FinanceRecord schema doesn't have organizationId, so we join with Show
    const query = this.financeRepository.createQueryBuilder('finance')
      .innerJoin('finance.show', 'show')
      .where('show.organizationId = :organizationId', { organizationId });

    if (startDate) {
      query.andWhere('finance.transactionDate >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('finance.transactionDate <= :endDate', { endDate });
    }
    if (showId) {
      query.andWhere('finance.showId = :showId', { showId });
    }

    const finances = await query.getMany();
    
    return finances.map(finance => ({
      id: finance.id,
      type: 'finance',
      title: finance.description || finance.category,
      description: finance.description,
      startDate: finance.transactionDate,
      endDate: finance.transactionDate, // Finances are point-in-time
      status: finance.status as any,
      organizationId: '', // Will be filled via Show relation
      createdBy: 'system',
      amount: parseFloat(finance.amount.toString()),
      category: finance.type as any, // 'income' | 'expense'
      subcategory: finance.category, // Use category as subcategory
      paymentMethod: undefined, // Not in current schema
      isRecurring: false, // Not in current schema
      metadata: {
        showId: finance.showId,
        currency: finance.currency,
        approvedBy: finance.approvedBy,
        originalFinance: finance
      }
    }));
  }

  /**
   * Fetch Tasks as timeline items
   */
  private async fetchTasks(
    organizationId: string,
    startDate?: string,
    endDate?: string,
    status?: string[],
    showId?: string,
    userId?: string
  ): Promise<TaskTimelineItem[]> {
    const query = this.taskRepository.createQueryBuilder('task')
      .where('task.organizationId = :organizationId', { organizationId });

    if (startDate) {
      query.andWhere('task.deadline >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('task.startDate <= :endDate', { endDate });
    }
    if (status && status.length > 0) {
      query.andWhere('task.status IN (:...status)', { status });
    }
    if (showId) {
      query.andWhere('task.showId = :showId', { showId });
    }
    if (userId) {
      query.andWhere('task.assignedTo = :userId', { userId });
    }

    const tasks = await query.getMany();
    
    return tasks.map(task => ({
      id: task.id,
      type: 'task',
      title: task.title,
      description: task.description,
      startDate: task.startDate || task.createdAt,
      endDate: task.deadline,
      status: task.status as any,
      organizationId: task.organizationId,
      createdBy: task.createdBy,
      taskType: task.type,
      priority: task.priority,
      assignedTo: task.assignedTo,
      estimatedHours: task.estimatedHours,
      deadline: task.deadline,
      showId: task.showId,
      metadata: {
        actualHours: task.actualHours,
        completedAt: task.completedAt,
        originalTask: task
      }
    }));
  }

  /**
   * Fetch Releases as timeline items
   */
  private async fetchReleases(
    organizationId: string,
    startDate?: string,
    endDate?: string,
    status?: string[],
    showId?: string
  ): Promise<ReleaseTimelineItem[]> {
    const query = this.releaseRepository.createQueryBuilder('release')
      .where('release.organizationId = :organizationId', { organizationId });

    if (startDate) {
      query.andWhere('release.releaseDate >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('release.releaseDate <= :endDate', { endDate });
    }
    if (status && status.length > 0) {
      query.andWhere('release.status IN (:...status)', { status });
    }
    if (showId) {
      query.andWhere('release.showId = :showId', { showId });
    }

    const releases = await query.getMany();
    
    return releases.map(release => ({
      id: release.id,
      type: 'release',
      title: release.title,
      description: release.description,
      startDate: release.announcementDate || release.createdAt,
      endDate: release.releaseDate,
      status: release.status as any,
      organizationId: release.organizationId,
      createdBy: release.createdBy,
      releaseType: release.type,
      platforms: release.platforms,
      budget: release.budget ? parseFloat(release.budget.toString()) : undefined,
      expectedRevenue: release.expectedRevenue ? parseFloat(release.expectedRevenue.toString()) : undefined,
      announcementDate: release.announcementDate,
      productionDeadline: release.productionDeadline,
      showId: release.showId,
      metadata: {
        actualRevenue: release.actualRevenue ? parseFloat(release.actualRevenue.toString()) : undefined,
        dependencies: release.dependencies,
        originalRelease: release
      }
    }));
  }

  /**
   * Get timeline permissions based on user role and context
   */
  static getTimelinePermissions(
    userRole: string,
    organizationContext: any
  ): TimelinePermissions {
    // Base permissions
    let permissions: TimelinePermissions = {
      canView: false,
      canEdit: false,
      canDelete: false,
      canSimulate: false,
      canViewFinances: false,
      canCreateTasks: false,
      canManageReleases: false,
      visibleTypes: [],
      editableTypes: []
    };

    switch (userRole.toLowerCase()) {
      case 'artist':
        permissions = {
          canView: true,
          canEdit: true,
          canDelete: false,
          canSimulate: false,
          canViewFinances: true,
          canCreateTasks: true,
          canManageReleases: true,
          visibleTypes: ['show', 'travel', 'finance', 'task', 'release'],
          editableTypes: ['show', 'task', 'release']
        };
        break;

      case 'manager':
        permissions = {
          canView: true,
          canEdit: true,
          canDelete: true,
          canSimulate: true,
          canViewFinances: true,
          canCreateTasks: true,
          canManageReleases: true,
          visibleTypes: ['show', 'travel', 'finance', 'task', 'release'],
          editableTypes: ['show', 'travel', 'finance', 'task', 'release']
        };
        break;

      case 'venue':
        permissions = {
          canView: true,
          canEdit: false,
          canDelete: false,
          canSimulate: false,
          canViewFinances: false,
          canCreateTasks: true,
          canManageReleases: false,
          visibleTypes: ['show', 'task'],
          editableTypes: ['task']
        };
        break;

      case 'agency':
        permissions = {
          canView: true,
          canEdit: true,
          canDelete: false,
          canSimulate: true,
          canViewFinances: true,
          canCreateTasks: true,
          canManageReleases: false,
          visibleTypes: ['show', 'travel', 'finance', 'task'],
          editableTypes: ['show', 'travel', 'task']
        };
        break;

      default:
        // Minimal permissions for unknown roles
        permissions = {
          canView: true,
          canEdit: false,
          canDelete: false,
          canSimulate: false,
          canViewFinances: false,
          canCreateTasks: false,
          canManageReleases: false,
          visibleTypes: ['show'],
          editableTypes: []
        };
    }

    return permissions;
  }
}