import { describe, it, expect, beforeAll } from 'vitest';
import { ShowsService } from '../services/showsService.js';
import { AuthService } from '../services/authService.js';
import { generateToken } from '../utils/jwt.js';

describe('Shows API', () => {
  let token: string;
  let userId: string;
  let orgId: string;
  let showId: string;

  beforeAll(async () => {
    // Create test user and generate token
    userId = 'test-user-123';
    orgId = 'test-org-123';

    token = generateToken({
      sub: userId,
      email: 'test@example.com',
      name: 'Test User',
      org_id: orgId,
      role: 'owner',
    });
  });

  describe('Create Show', () => {
    it('should create a new show', async () => {
      const showData = {
        name: 'Test Concert',
        venue: 'Test Venue',
        city: 'New York',
        country: 'USA',
        show_date: '2025-06-15',
        show_time: '19:00',
      };

      const show = await ShowsService.createShow(orgId, userId, showData);

      expect(show).toBeDefined();
      expect(show.id).toBeDefined();
      expect(show.name).toBe('Test Concert');
      expect(show.status).toBe('scheduled');
      expect(show.organization_id).toBe(orgId);

      showId = show.id;
    });

    it('should create show with minimal data', async () => {
      const showData = {
        name: 'Minimal Show',
        show_date: '2025-06-20',
      };

      const show = await ShowsService.createShow(orgId, userId, showData);

      expect(show).toBeDefined();
      expect(show.name).toBe('Minimal Show');
      expect(show.show_date).toBe('2025-06-20');
    });
  });

  describe('List Shows', () => {
    it('should list all shows for organization', async () => {
      const shows = await ShowsService.listShows(orgId);

      expect(Array.isArray(shows)).toBe(true);
      expect(shows.length).toBeGreaterThanOrEqual(1);
      expect(shows.every((s) => s.organization_id === orgId)).toBe(true);
    });

    it('should return empty array for new organization', async () => {
      const shows = await ShowsService.listShows('non-existent-org');

      expect(Array.isArray(shows)).toBe(true);
      expect(shows.length).toBe(0);
    });
  });

  describe('Get Show', () => {
    it('should retrieve a specific show', async () => {
      const show = await ShowsService.getShow(showId);

      expect(show).toBeDefined();
      expect(show.id).toBe(showId);
      expect(show.name).toBe('Test Concert');
    });

    it('should throw error for non-existent show', async () => {
      try {
        await ShowsService.getShow('non-existent-id');
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Show not found');
      }
    });
  });

  describe('Update Show', () => {
    it('should update show fields', async () => {
      const updates = {
        show_time: '20:00',
        end_time: '23:00',
      };

      const updated = await ShowsService.updateShow(showId, updates);

      expect(updated).toBeDefined();
      expect(updated.show_time).toBe('20:00');
      expect(updated.end_time).toBe('23:00');
      expect(updated.name).toBe('Test Concert'); // unchanged
    });

    it('should update show name', async () => {
      const updates = {
        name: 'Updated Concert Name',
      };

      const updated = await ShowsService.updateShow(showId, updates);

      expect(updated.name).toBe('Updated Concert Name');
    });

    it('should throw error when updating non-existent show', async () => {
      try {
        await ShowsService.updateShow('non-existent-id', { name: 'New Name' });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Show not found');
      }
    });
  });

  describe('Delete Show', () => {
    it('should delete a show', async () => {
      // Create a show to delete
      const showData = {
        name: 'Show to Delete',
        show_date: '2025-06-25',
      };
      const show = await ShowsService.createShow(orgId, userId, showData);
      const deleteId = show.id;

      // Delete it
      const result = await ShowsService.deleteShow(deleteId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);

      // Verify it's gone
      try {
        await ShowsService.getShow(deleteId);
        expect.fail('Show should have been deleted');
      } catch (error: any) {
        expect(error.message).toBe('Show not found');
      }
    });

    it('should throw error deleting non-existent show', async () => {
      try {
        await ShowsService.deleteShow('non-existent-id');
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Show not found');
      }
    });
  });
});
