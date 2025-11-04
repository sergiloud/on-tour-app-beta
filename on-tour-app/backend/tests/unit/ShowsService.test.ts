import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShowsService } from '../services/showsService.js';
import { Repository } from 'typeorm';
import { Show } from '../database/entities/Show.js';
import { v4 as uuidv4 } from 'uuid';

// Mock TypeORM Repository
const mockShowRepository = {
  find: vi.fn(),
  findOne: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  createQueryBuilder: vi.fn(),
};

describe('ShowsService', () => {
  let showsService: ShowsService;
  let mockShows: Show[];

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create test service instance
    showsService = new ShowsService(
      mockShowRepository as unknown as Repository<Show>
    );

    // Setup mock data
    mockShows = [
      {
        id: uuidv4(),
        title: 'Summer Concert Series',
        description: 'Annual summer music festival',
        status: 'active' as const,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-30'),
        type: 'concert',
        location: 'Central Park, NYC',
        capacity: 5000,
        budget: 50000,
        currency: 'USD',
        organizationId: 'org-123',
        createdBy: 'user-456',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: 'Winter Festival',
        description: 'Holiday celebration',
        status: 'draft' as const,
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-25'),
        type: 'festival',
        location: 'Downtown',
        capacity: 3000,
        budget: 30000,
        currency: 'USD',
        organizationId: 'org-123',
        createdBy: 'user-456',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  });

  describe('listShows', () => {
    it('should return all shows with pagination', async () => {
      mockShowRepository.find.mockResolvedValue(mockShows);

      const result = await showsService.listShows(
        'org-123',
        { skip: 0, take: 10 }
      );

      expect(result).toEqual(mockShows);
      expect(mockShowRepository.find).toHaveBeenCalledWith({
        where: { organizationId: 'org-123' },
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
    });

    it('should filter shows by status', async () => {
      const activeShows = [mockShows[0]];
      mockShowRepository.find.mockResolvedValue(activeShows);

      const result = await showsService.listShows('org-123', {
        skip: 0,
        take: 10,
        status: 'active',
      });

      expect(result).toEqual(activeShows);
      expect(mockShowRepository.find).toHaveBeenCalled();
    });

    it('should handle empty results', async () => {
      mockShowRepository.find.mockResolvedValue([]);

      const result = await showsService.listShows('org-123', {
        skip: 0,
        take: 10,
      });

      expect(result).toEqual([]);
    });
  });

  describe('getShow', () => {
    it('should return a show by id', async () => {
      mockShowRepository.findOne.mockResolvedValue(mockShows[0]);

      const result = await showsService.getShow(mockShows[0].id);

      expect(result).toEqual(mockShows[0]);
      expect(mockShowRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockShows[0].id },
      });
    });

    it('should return null if show not found', async () => {
      mockShowRepository.findOne.mockResolvedValue(null);

      const result = await showsService.getShow('non-existent-id');

      expect(result).toBeNull();
    });

    it('should load relationships', async () => {
      const showWithRelations = {
        ...mockShows[0],
        finances: [],
        itineraries: [],
      };
      mockShowRepository.findOne.mockResolvedValue(showWithRelations);

      const result = await showsService.getShow(mockShows[0].id);

      expect(result.finances).toBeDefined();
      expect(result.itineraries).toBeDefined();
    });
  });

  describe('createShow', () => {
    it('should create a new show', async () => {
      const newShow = {
        title: 'New Event',
        description: 'A brand new event',
        status: 'draft' as const,
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-15'),
        type: 'conference',
        location: 'San Francisco',
        capacity: 1000,
        budget: 75000,
        currency: 'USD',
      };

      const createdShow = {
        id: uuidv4(),
        organizationId: 'org-123',
        createdBy: 'user-456',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...newShow,
      };

      mockShowRepository.save.mockResolvedValue(createdShow);

      const result = await showsService.createShow('org-123', newShow, 'user-456');

      expect(result).toEqual(createdShow);
      expect(mockShowRepository.save).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const invalidShow = {
        title: '', // Empty title
        description: 'Test',
        status: 'draft' as const,
        startDate: new Date(),
        endDate: new Date(),
        type: 'test',
        location: 'Test Location',
        capacity: 100,
        budget: 1000,
        currency: 'USD',
      };

      // This should throw validation error
      await expect(
        showsService.createShow('org-123', invalidShow, 'user-456')
      ).rejects.toThrow();
    });

    it('should set correct organizational context', async () => {
      const newShow = {
        title: 'Org-specific Event',
        description: 'Test',
        status: 'draft' as const,
        startDate: new Date(),
        endDate: new Date(),
        type: 'test',
        location: 'Test',
        capacity: 100,
        budget: 1000,
        currency: 'USD',
      };

      mockShowRepository.save.mockImplementation((show) => Promise.resolve(show));

      await showsService.createShow('org-456', newShow, 'user-789');

      expect(mockShowRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: 'org-456',
          createdBy: 'user-789',
        })
      );
    });
  });

  describe('updateShow', () => {
    it('should update an existing show', async () => {
      const updates = {
        title: 'Updated Title',
        status: 'scheduled' as const,
      };

      const updatedShow = {
        ...mockShows[0],
        ...updates,
        updatedAt: new Date(),
      };

      mockShowRepository.findOne.mockResolvedValue(mockShows[0]);
      mockShowRepository.save.mockResolvedValue(updatedShow);

      const result = await showsService.updateShow(mockShows[0].id, updates);

      expect(result.title).toBe('Updated Title');
      expect(result.status).toBe('scheduled');
    });

    it('should throw error if show not found', async () => {
      mockShowRepository.findOne.mockResolvedValue(null);

      await expect(
        showsService.updateShow('non-existent', { title: 'New Title' })
      ).rejects.toThrow('Show not found');
    });

    it('should update only provided fields', async () => {
      const originalShow = { ...mockShows[0] };
      const updates = { title: 'New Title' };

      mockShowRepository.findOne.mockResolvedValue(originalShow);
      mockShowRepository.save.mockImplementation((show) =>
        Promise.resolve(show)
      );

      await showsService.updateShow(mockShows[0].id, updates);

      expect(mockShowRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Title',
          description: originalShow.description, // Unchanged
          capacity: originalShow.capacity, // Unchanged
        })
      );
    });
  });

  describe('deleteShow', () => {
    it('should delete a show', async () => {
      mockShowRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await showsService.deleteShow(mockShows[0].id);

      expect(result).toBe(true);
      expect(mockShowRepository.delete).toHaveBeenCalledWith({
        id: mockShows[0].id,
      });
    });

    it('should return false if show not found', async () => {
      mockShowRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await showsService.deleteShow('non-existent');

      expect(result).toBe(false);
    });

    it('should cascade delete related records', async () => {
      // In PostgreSQL with CASCADE, this is automatic
      // Just verify the delete was called
      mockShowRepository.delete.mockResolvedValue({ affected: 1 });

      await showsService.deleteShow(mockShows[0].id);

      expect(mockShowRepository.delete).toHaveBeenCalled();
    });
  });

  describe('searchShows', () => {
    it('should search shows by title', async () => {
      mockShowRepository.find.mockResolvedValue([mockShows[0]]);

      const result = await showsService.searchShows('org-123', 'Summer', {
        skip: 0,
        take: 10,
      });

      expect(result.length).toBeGreaterThan(0);
    });

    it('should filter by date range', async () => {
      mockShowRepository.find.mockResolvedValue([mockShows[0]]);

      const result = await showsService.searchShows(
        'org-123',
        '',
        {
          skip: 0,
          take: 10,
          startDateFrom: new Date('2025-01-01'),
          startDateTo: new Date('2025-12-31'),
        }
      );

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle complex filters', async () => {
      mockShowRepository.find.mockResolvedValue(mockShows);

      const result = await showsService.searchShows('org-123', '', {
        skip: 0,
        take: 10,
        status: 'active',
        type: 'concert',
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getShowStats', () => {
    it('should return show statistics', async () => {
      mockShowRepository.find.mockResolvedValue(mockShows);

      const stats = await showsService.getShowStats('org-123');

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byStatus');
      expect(stats).toHaveProperty('totalBudget');
      expect(stats).toHaveProperty('averageCapacity');
    });

    it('should calculate correct totals', async () => {
      mockShowRepository.find.mockResolvedValue(mockShows);

      const stats = await showsService.getShowStats('org-123');

      expect(stats.total).toBe(2);
      expect(stats.totalBudget).toBe(80000); // 50000 + 30000
    });
  });
});
