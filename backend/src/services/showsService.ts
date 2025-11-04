import { shows as showsDb } from '../db/mockDb.js';
import { logger } from '../utils/logger.js';
import type { CreateShowRequest, UpdateShowRequest } from '../types/shows.js';

export class ShowsService {
  static async listShows(org_id: string) {
    try {
      const shows = showsDb.findByOrganization(org_id);
      logger.info(`Listed ${shows.length} shows for org ${org_id}`);
      return shows;
    } catch (error) {
      logger.error('Error listing shows:', error);
      throw error;
    }
  }

  static async createShow(org_id: string, user_id: string, data: CreateShowRequest) {
    try {
      const show = showsDb.create({
        organization_id: org_id,
        created_by: user_id,
        status: 'scheduled',
        metadata: {},
        ...data,
      });
      logger.info(`Created show: ${show.id}`);
      return show;
    } catch (error) {
      logger.error('Error creating show:', error);
      throw error;
    }
  }

  static async getShow(id: string) {
    try {
      const show = showsDb.findById(id);
      if (!show) {
        throw new Error('Show not found');
      }
      return show;
    } catch (error) {
      logger.error(`Error getting show ${id}:`, error);
      throw error;
    }
  }

  static async updateShow(id: string, data: UpdateShowRequest) {
    try {
      const show = showsDb.findById(id);
      if (!show) {
        throw new Error('Show not found');
      }
      const updated = showsDb.update(id, data);
      logger.info(`Updated show: ${id}`);
      return updated;
    } catch (error) {
      logger.error(`Error updating show ${id}:`, error);
      throw error;
    }
  }

  static async deleteShow(id: string) {
    try {
      const show = showsDb.findById(id);
      if (!show) {
        throw new Error('Show not found');
      }
      showsDb.delete(id);
      logger.info(`Deleted show: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error(`Error deleting show ${id}:`, error);
      throw error;
    }
  }
}
