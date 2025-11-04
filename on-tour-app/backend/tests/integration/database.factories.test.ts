/**
 * Database Integration Tests - Test factories and database utilities
 */

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { AppDataSource } from '../../src/database/datasource.js';
import { Show } from '../../src/database/entities/Show.js';
import { FinanceRecord } from '../../src/database/entities/FinanceRecord.js';
import { Itinerary } from '../../src/database/entities/Itinerary.js';
import { Settlement } from '../../src/database/entities/Settlement.js';
import {
  showFactory,
  financeFactory,
  itineraryFactory,
  settlementFactory,
  fixtureFactory,
  databaseUtils,
  setFactoryDefaults,
  getFactoryDefaults,
} from '../../src/tests/factories/index.js';
import {
  testDatabase,
  testFixtures,
  DatabaseTestContext,
  testUtils,
} from '../../src/tests/utilities/database.js';

describe('Database Factories & Utilities', () => {
  let context: DatabaseTestContext;

  beforeAll(async () => {
    context = new DatabaseTestContext();
    await context.setup();
  });

  afterEach(async () => {
    await context.reset();
  });

  afterAll(async () => {
    await context.teardown();
  });

  describe('Factory Defaults', () => {
    it('should set and get factory defaults', () => {
      const defaults = {
        orgId: 'org-test-123',
        userId: 'user-test-123',
      };

      setFactoryDefaults(defaults);
      const retrieved = getFactoryDefaults();

      expect(retrieved.orgId).toBe(defaults.orgId);
      expect(retrieved.userId).toBe(defaults.userId);
    });

    it('should merge defaults with existing values', () => {
      const defaults = { orgId: 'org-123' };
      setFactoryDefaults(defaults);
      const retrieved = getFactoryDefaults();

      expect(retrieved).toHaveProperty('orgId');
      expect(retrieved).toHaveProperty('userId');
    });
  });

  describe('Show Factory', () => {
    it('should build show without persisting', () => {
      const show = showFactory.build();

      expect(show.id).toBeDefined();
      expect(show.title).toBeDefined();
      expect(show.description).toBeDefined();
      expect(show.startDate).toBeInstanceOf(Date);
      expect(show.endDate).toBeInstanceOf(Date);
    });

    it('should build show with overrides', () => {
      const custom = { title: 'Custom Title', capacity: 999 };
      const show = showFactory.build(custom);

      expect(show.title).toBe('Custom Title');
      expect(show.capacity).toBe(999);
    });

    it('should create and persist show', async () => {
      const show = await showFactory.create();

      expect(show.id).toBeDefined();
      const repository = AppDataSource.getRepository(Show);
      const saved = await repository.findOne({ where: { id: show.id } });

      expect(saved).toBeDefined();
      expect(saved?.title).toBe(show.title);
    });

    it('should create multiple shows', async () => {
      const shows = await showFactory.createMany(3);

      expect(shows).toHaveLength(3);
      expect(shows[0].id).not.toEqual(shows[1].id);

      const repository = AppDataSource.getRepository(Show);
      const count = await repository.count();
      expect(count).toBe(3);
    });

    it('should generate unique data for each show', async () => {
      const shows = await showFactory.createMany(5);
      const titles = shows.map((s: Show) => s.title);

      // Should have variety in data
      expect(new Set(titles).size).toBeGreaterThan(1);
    });
  });

  describe('Finance Factory', () => {
    let show: Show;

    beforeAll(async () => {
      show = await showFactory.create();
    });

    it('should build finance record', () => {
      const finance = financeFactory.build(show.id);

      expect(finance.id).toBeDefined();
      expect(finance.showId).toBe(show.id);
      expect(['income', 'expense']).toContain(finance.type);
      expect(['approved', 'pending', 'rejected']).toContain(finance.status);
    });

    it('should create finance record', async () => {
      const finance = await financeFactory.create(show.id);

      expect(finance.showId).toBe(show.id);
      const repository = AppDataSource.getRepository(FinanceRecord);
      const saved = await repository.findOne({ where: { id: finance.id } });

      expect(saved).toBeDefined();
    });

    it('should create multiple finance records for show', async () => {
      const records = await financeFactory.createForShow(show.id, 5);

      expect(records).toHaveLength(5);
      expect(records.every((r: FinanceRecord) => r.showId === show.id)).toBe(true);
    });

    it('income records should not have approvedBy undefined', async () => {
      const record = await financeFactory.create(show.id, { type: 'income' });
      expect(record.approvedBy).toBeDefined();
    });
  });

  describe('Itinerary Factory', () => {
    let show: Show;

    beforeAll(async () => {
      show = await showFactory.create();
    });

    it('should build itinerary', () => {
      const itinerary = itineraryFactory.build(show.id);

      expect(itinerary.id).toBeDefined();
      expect(itinerary.showId).toBe(show.id);
      expect(itinerary.activities).toBeDefined();
    });

    it('should create itinerary', async () => {
      const itinerary = await itineraryFactory.create(show.id);

      expect(itinerary.showId).toBe(show.id);
      const repository = AppDataSource.getRepository(Itinerary);
      const saved = await repository.findOne({ where: { id: itinerary.id } });

      expect(saved).toBeDefined();
    });

    it('should create multiple itineraries for show', async () => {
      const itineraries = await itineraryFactory.createForShow(show.id, 3);

      expect(itineraries).toHaveLength(3);
      expect(itineraries.every((i: Itinerary) => i.showId === show.id)).toBe(true);
    });
  });

  describe('Settlement Factory', () => {
    it('should build settlement', () => {
      const settlement = settlementFactory.build();

      expect(settlement.id).toBeDefined();
      expect(settlement.name).toBeDefined();
      expect(['completed', 'in_progress', 'pending']).toContain(settlement.status);
    });

    it('should create settlement', async () => {
      const settlement = await settlementFactory.create();

      expect(settlement.id).toBeDefined();
      const repository = AppDataSource.getRepository(Settlement);
      const saved = await repository.findOne({ where: { id: settlement.id } });

      expect(saved).toBeDefined();
    });

    it('should create multiple settlements', async () => {
      const settlements = await settlementFactory.createMany(2);

      expect(settlements).toHaveLength(2);
      const repository = AppDataSource.getRepository(Settlement);
      const count = await repository.count();

      expect(count).toBe(2);
    });
  });

  describe('Fixture Factory', () => {
    it('should create complete show with related data', async () => {
      const { show, finances, itineraries } = await fixtureFactory.createCompleteShow(
        {},
        2,
        2
      );

      expect(show.id).toBeDefined();
      expect(finances).toHaveLength(2);
      expect(itineraries).toHaveLength(2);
      expect(finances.every((f: FinanceRecord) => f.showId === show.id)).toBe(true);
      expect(itineraries.every((i: Itinerary) => i.showId === show.id)).toBe(true);
    });

    it('should create multiple complete shows', async () => {
      const { shows, finances, itineraries } = await fixtureFactory.createCompleteShows(
        3,
        {},
        2,
        1
      );

      expect(shows).toHaveLength(3);
      expect(finances).toHaveLength(6); // 3 shows * 2 finances
      expect(itineraries).toHaveLength(3); // 3 shows * 1 itinerary
    });

    it('should create complete scenario', async () => {
      const { shows, finances, itineraries, settlements } =
        await fixtureFactory.createCompleteScenario(2, 2, 1, 2);

      expect(shows).toHaveLength(2);
      expect(finances).toHaveLength(4); // 2 shows * 2 finances
      expect(itineraries).toHaveLength(2); // 2 shows * 1 itinerary
      expect(settlements).toHaveLength(2);
    });
  });

  describe('Database Utils', () => {
    it('should truncate all tables', async () => {
      await fixtureFactory.createCompleteScenario(2, 2, 1, 1);

      let stats = await testDatabase.getStats();
      expect(stats.tableCount['Show']).toBeGreaterThan(0);

      await databaseUtils.truncateAll();

      stats = await testDatabase.getStats();
      expect(stats.tableCount['Show']).toBe(0);
      expect(stats.tableCount['FinanceRecord']).toBe(0);
      expect(stats.tableCount['Itinerary']).toBe(0);
    });

    it('should verify data integrity', async () => {
      await fixtureFactory.createCompleteScenario(2, 2, 1, 1);

      const integrity = await databaseUtils.verifyIntegrity();

      expect(integrity.valid).toBe(true);
      expect(integrity.showsCount).toBe(2);
      expect(integrity.financesCount).toBe(4);
    });
  });

  describe('Test Database', () => {
    it('should get database statistics', async () => {
      await fixtureFactory.createCompleteShow({}, 2, 1);

      const stats = await testDatabase.getStats();

      expect(stats.connected).toBe(true);
      expect(stats.entities).toContain('Show');
      expect(stats.tableCount['Show']).toBeGreaterThan(0);
    });

    it('should verify schema validity', async () => {
      const schema = await testDatabase.verifySchema();

      expect(schema.valid).toBe(true);
      expect(schema.tables.length).toBeGreaterThan(0);
      expect(schema.errors).toHaveLength(0);
    });
  });

  describe('Test Utils', () => {
    it('should assert table is empty', async () => {
      await testUtils.assertTableEmpty('Show');
    });

    it('should assert table count', async () => {
      await showFactory.createMany(3);
      await testUtils.assertTableCount('Show', 3);
    });

    it('should throw on incorrect count', async () => {
      await showFactory.create();

      await expect(testUtils.assertTableCount('Show', 5)).rejects.toThrow();
    });

    it('should wait for async operation', async () => {
      let count = 0;
      const result = await testUtils.waitFor(
        async () => {
          count++;
          if (count < 3) throw new Error('Not ready');
          return 'success';
        },
        { interval: 10, timeout: 1000 }
      );

      expect(result).toBe('success');
      expect(count).toBeGreaterThan(1);
    });

    it('should timeout on wait', async () => {
      await expect(
        testUtils.waitFor(
          async () => {
            throw new Error('Always fails');
          },
          { timeout: 100, interval: 50 }
        )
      ).rejects.toThrow('timed out');
    });
  });

  describe('Data Relationship Integrity', () => {
    it('should maintain foreign key relationships', async () => {
      const { show, finances, itineraries } = await fixtureFactory.createCompleteShow(
        {},
        3,
        2
      );

      // Verify all finances reference the show
      const financeRepository = AppDataSource.getRepository(FinanceRecord);
      const orphanedFinances = await financeRepository
        .createQueryBuilder('finance')
        .leftJoin('finance.show', 'show')
        .where('show.id IS NULL')
        .getCount();

      expect(orphanedFinances).toBe(0);

      // Verify all itineraries reference the show
      const itineraryRepository = AppDataSource.getRepository(Itinerary);
      const orphanedItineraries = await itineraryRepository
        .createQueryBuilder('itinerary')
        .leftJoin('itinerary.show', 'show')
        .where('show.id IS NULL')
        .getCount();

      expect(orphanedItineraries).toBe(0);
    });

    it('should cascade delete properly', async () => {
      const { show, finances, itineraries } = await fixtureFactory.createCompleteShow(
        {},
        2,
        2
      );

      const showRepository = AppDataSource.getRepository(Show);
      await showRepository.delete(show.id);

      const financeRepository = AppDataSource.getRepository(FinanceRecord);
      const itineraryRepository = AppDataSource.getRepository(Itinerary);

      const orphanedFinances = await financeRepository.count();
      const orphanedItineraries = await itineraryRepository.count();

      expect(orphanedFinances).toBe(0);
      expect(orphanedItineraries).toBe(0);
    });
  });

  describe('Test Fixtures', () => {
    it('should provide minimal show fixture', () => {
      const show = testFixtures.scenarios.minimalShow;

      expect(show.title).toBe('Test Show');
      expect(show.status).toBe('draft');
    });

    it('should provide complete show fixture', () => {
      const show = testFixtures.scenarios.completeShow;

      expect(show.title).toBe('Complete Test Show');
      expect(show.capacity).toBe(5000);
    });

    it('should provide finance record fixtures', () => {
      const income = testFixtures.scenarios.financeRecords.income;
      const expense = testFixtures.scenarios.financeRecords.expense;

      expect(income.type).toBe('income');
      expect(expense.type).toBe('expense');
      expect(income.status).toBe('approved');
      expect(expense.status).toBe('pending');
    });
  });
});
