import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

export interface Show {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'draft' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  budget?: number;
  revenue?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateShowInput {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  budget?: number;
}

export interface UpdateShowInput {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  status?: Show['status'];
  budget?: number;
  revenue?: number;
}

// In-memory database for now (will migrate to PostgreSQL)
const mockDb: Map<string, Show[]> = new Map();

export class ShowsService {
  static async listShows(
    organizationId: string,
    options?: { status?: string; limit?: number; offset?: number }
  ): Promise<{ shows: Show[]; total: number }> {
    logger.debug({ organizationId, options }, 'Listing shows');

    let shows = mockDb.get(organizationId) || [];

    if (options?.status) {
      shows = shows.filter(s => s.status === options.status);
    }

    const total = shows.length;
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;

    shows = shows.slice(offset, offset + limit);

    return { shows, total };
  }

  static async createShow(
    organizationId: string,
    userId: string,
    input: CreateShowInput
  ): Promise<Show> {
    logger.debug({ organizationId, userId, input }, 'Creating show');

    const show: Show = {
      id: uuidv4(),
      organizationId,
      title: input.title,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      location: input.location,
      status: 'draft',
      budget: input.budget,
      revenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
    };

    const shows = mockDb.get(organizationId) || [];
    shows.push(show);
    mockDb.set(organizationId, shows);

    logger.info({ showId: show.id, organizationId }, 'Show created');
    return show;
  }

  static async getShow(organizationId: string, showId: string): Promise<Show | null> {
    logger.debug({ organizationId, showId }, 'Getting show');

    const shows = mockDb.get(organizationId) || [];
    return shows.find(s => s.id === showId) || null;
  }

  static async updateShow(
    organizationId: string,
    showId: string,
    input: UpdateShowInput
  ): Promise<Show> {
    logger.debug({ organizationId, showId, input }, 'Updating show');

    const shows = mockDb.get(organizationId) || [];
    const show = shows.find(s => s.id === showId);

    if (!show) {
      throw new Error('Show not found');
    }

    const updated: Show = {
      ...show,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    const index = shows.findIndex(s => s.id === showId);
    shows[index] = updated;
    mockDb.set(organizationId, shows);

    logger.info({ showId }, 'Show updated');
    return updated;
  }

  static async deleteShow(organizationId: string, showId: string): Promise<void> {
    logger.debug({ organizationId, showId }, 'Deleting show');

    const shows = mockDb.get(organizationId) || [];
    const index = shows.findIndex(s => s.id === showId);

    if (index === -1) {
      throw new Error('Show not found');
    }

    shows.splice(index, 1);
    mockDb.set(organizationId, shows);

    logger.info({ showId }, 'Show deleted');
  }
}
