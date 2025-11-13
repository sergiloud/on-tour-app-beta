import { logger } from '../lib/logger';

// Service to handle Prophecy backend integration
export class ProphecyBackendService {
  private static baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  /**
   * Seeds Prophecy shows data in the backend for the specified organization
   */
  static async seedProphecyData(organizationId: string): Promise<{ success: boolean; seededCount: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/organizations/${organizationId}/seed-prophecy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to seed Prophecy data: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: result.success,
        seededCount: result.seededCount || 0
      };
    } catch (error) {
      logger.error('[ProphecyBackendService] Failed to seed Prophecy data', error as Error, { organizationId });
      return { success: false, seededCount: 0 };
    }
  }

  /**
   * Checks if Prophecy data is already seeded for the organization
   */
  static async checkProphecyStatus(organizationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/organizations/${organizationId}/prophecy-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check Prophecy status: ${response.status}`);
      }

      const result = await response.json();
      return result.isProphecySeeded;
    } catch (error) {
      logger.error('[ProphecyBackendService] Failed to check Prophecy status', error as Error, { organizationId });
      return false;
    }
  }

  /**
   * Fetches shows from the backend for the specified organization
   */
  static async getShows(organizationId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/shows?organizationId=${organizationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch shows: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      logger.error('[ProphecyBackendService] Failed to fetch shows', error as Error, { organizationId });
      return [];
    }
  }

  /**
   * Gets auth token from localStorage or returns dummy token for demo
   */
  private static getAuthToken(): string {
    // For demo purposes, return a dummy token
    // In production, this would get the real JWT token
    return 'demo-token-prophecy-user';
  }

  /**
   * Initializes Prophecy data when user logs in
   */
  static async initializeProphecyUser(organizationId: string): Promise<void> {
    try {
      logger.info('[ProphecyBackendService] Initializing Prophecy backend data', { organizationId });

      // Check if already seeded
      const isSeeded = await this.checkProphecyStatus(organizationId);
      
      if (isSeeded) {
        logger.info('[ProphecyBackendService] Prophecy data already exists in backend', { organizationId });
        return;
      }

      // Seed the data
      const result = await this.seedProphecyData(organizationId);
      
      if (result.success) {
        logger.info('[ProphecyBackendService] Successfully seeded Prophecy shows', { organizationId, count: result.seededCount });
      } else {
        logger.warn('[ProphecyBackendService] Failed to seed Prophecy data', { organizationId });
      }
    } catch (error) {
      logger.error('[ProphecyBackendService] Error initializing Prophecy backend', error as Error, { organizationId });
    }
  }
}