/**
 * Test Factories - Generate realistic test data for unit and integration tests
 * Usage: const show = await showFactory.create({ title: 'Custom Title' })
 */

import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { AppDataSource } from '../../database/datasource.js';
import { Show } from '../../database/entities/Show.js';
import { FinanceRecord } from '../../database/entities/FinanceRecord.js';
import { Itinerary } from '../../database/entities/Itinerary.js';
import { Settlement } from '../../database/entities/Settlement.js';

export interface FactoryDefaults {
  orgId?: string;
  userId?: string;
}

let factoryDefaults: FactoryDefaults = {
  orgId: uuidv4(),
  userId: uuidv4(),
};

/**
 * Set default values for all factories (organization and user IDs)
 */
export function setFactoryDefaults(defaults: FactoryDefaults) {
  factoryDefaults = { ...factoryDefaults, ...defaults };
}

/**
 * Get current factory defaults
 */
export function getFactoryDefaults(): FactoryDefaults {
  return { ...factoryDefaults };
}

/**
 * Show Factory - Create test shows with realistic data
 */
export const showFactory = {
  /**
   * Build show data without persisting
   */
  build(overrides?: Partial<Show>): Partial<Show> {
    const showTypes = ['festival', 'conference', 'concert', 'workshop', 'seminar', 'expo', 'gala', 'retreat'];
    const statuses = ['draft', 'scheduled', 'active', 'completed', 'cancelled'];
    const type = faker.helpers.arrayElement(showTypes);
    const startDate = faker.date.future({ years: 1 });
    const endDate = new Date(startDate.getTime() + faker.number.int({ min: 1, max: 10 }) * 24 * 60 * 60 * 1000);

    return {
      id: uuidv4(),
      title: faker.music.songName() + ' ' + type,
      description: faker.lorem.paragraph(2),
      status: faker.helpers.arrayElement(statuses) as any,
      startDate,
      endDate,
      type,
      location: faker.location.city() + ', ' + faker.location.state(),
      capacity: faker.number.int({ min: 100, max: 50000 }),
      budget: faker.number.int({ min: 50000, max: 500000 }),
      currency: 'USD',
      organizationId: factoryDefaults.orgId!,
      createdBy: factoryDefaults.userId!,
      ...overrides,
    };
  },

  /**
   * Create and persist a show
   */
  async create(overrides?: Partial<Show>): Promise<Show> {
    const showRepository = AppDataSource.getRepository(Show);
    const data = this.build(overrides);
    return showRepository.save(data as Show);
  },

  /**
   * Create multiple shows
   */
  async createMany(count: number, overrides?: Partial<Show>): Promise<Show[]> {
    const showRepository = AppDataSource.getRepository(Show);
    const shows = Array.from({ length: count }, () => this.build(overrides) as Show);
    return showRepository.save(shows);
  },
};

/**
 * Finance Record Factory - Create test finance records
 */
export const financeFactory = {
  /**
   * Build finance record data
   */
  build(showId: string, overrides?: Partial<FinanceRecord>): Partial<FinanceRecord> {
    const categories = [
      'Artist Fees', 'Venue Rental', 'Production Equipment', 'Marketing',
      'Staffing', 'Catering', 'Insurance', 'Permits', 'Transportation',
      'Accommodation', 'Tech Setup', 'Security', 'Lighting', 'Sound System'
    ];
    const types = ['income', 'expense'] as const;
    const statuses = ['approved', 'pending', 'rejected'] as const;

    const category = faker.helpers.arrayElement(categories);
    const type = faker.helpers.arrayElement(types);
    const isIncome = type === 'income';
    const amount = isIncome
      ? faker.number.int({ min: 10000, max: 200000 })
      : faker.number.int({ min: 5000, max: 100000 });

    return {
      id: uuidv4(),
      showId,
      category,
      amount,
      currency: 'USD',
      type,
      description: faker.lorem.sentence(),
      status: faker.helpers.arrayElement(statuses) as any,
      transactionDate: faker.date.past({ years: 1 }),
      approvedBy: type === 'income' ? factoryDefaults.userId : undefined,
      ...overrides,
    };
  },

  /**
   * Create and persist a finance record
   */
  async create(showId: string, overrides?: Partial<FinanceRecord>): Promise<FinanceRecord> {
    const financeRepository = AppDataSource.getRepository(FinanceRecord);
    const data = this.build(showId, overrides);
    return financeRepository.save(data as FinanceRecord);
  },

  /**
   * Create multiple finance records for a show
   */
  async createForShow(showId: string, count: number, overrides?: Partial<FinanceRecord>): Promise<FinanceRecord[]> {
    const financeRepository = AppDataSource.getRepository(FinanceRecord);
    const records = Array.from({ length: count }, () =>
      this.build(showId, overrides) as FinanceRecord
    );
    return financeRepository.save(records);
  },
};

/**
 * Itinerary Factory - Create test itineraries
 */
export const itineraryFactory = {
  /**
   * Build itinerary data
   */
  build(showId: string, overrides?: Partial<Itinerary>): Partial<Itinerary> {
    const startDate = faker.date.future({ years: 1 });
    const endDate = new Date(startDate.getTime() + faker.number.int({ min: 0, max: 7 }) * 24 * 60 * 60 * 1000);
    const activityTypes = [
      ['Travel', 'Hotel Check-in', 'Welcome Reception'],
      ['Site Preparation', 'Sound Check', 'Technical Setup'],
      ['Main Event', 'Performances', 'Networking'],
      ['Breakdown', 'Wrap-up Meeting', 'Departure'],
    ];

    return {
      id: uuidv4(),
      showId,
      title: faker.lorem.sentence(3),
      description: faker.lorem.paragraph(),
      startDate,
      endDate,
      destination: faker.location.city(),
      activities: JSON.stringify(faker.helpers.arrayElement(activityTypes)),
      status: faker.helpers.arrayElement(['confirmed', 'draft', 'in_progress']) as any,
      numberOfDays: faker.number.int({ min: 1, max: 7 }),
      estimatedCost: faker.number.int({ min: 5000, max: 100000 }),
      currency: 'USD',
      ...overrides,
    };
  },

  /**
   * Create and persist an itinerary
   */
  async create(showId: string, overrides?: Partial<Itinerary>): Promise<Itinerary> {
    const itineraryRepository = AppDataSource.getRepository(Itinerary);
    const data = this.build(showId, overrides);
    return itineraryRepository.save(data as Itinerary);
  },

  /**
   * Create multiple itineraries for a show
   */
  async createForShow(showId: string, count: number, overrides?: Partial<Itinerary>): Promise<Itinerary[]> {
    const itineraryRepository = AppDataSource.getRepository(Itinerary);
    const itineraries = Array.from({ length: count }, () =>
      this.build(showId, overrides) as Itinerary
    );
    return itineraryRepository.save(itineraries);
  },
};

/**
 * Settlement Factory - Create test settlements
 */
export const settlementFactory = {
  /**
   * Build settlement data
   */
  build(overrides?: Partial<Settlement>): Partial<Settlement> {
    const settlementMonths = ['January', 'April', 'July', 'October'];
    const month = faker.helpers.arrayElement(settlementMonths);
    const year = 2025;
    const settlementDate = new Date(`${month} 1, ${year}`);

    return {
      id: uuidv4(),
      name: `${month} ${year} Settlement`,
      settlementDate,
      totalAmount: faker.number.int({ min: 50000, max: 300000 }),
      currency: 'USD',
      status: faker.helpers.arrayElement(['completed', 'in_progress', 'pending']) as any,
      notes: faker.lorem.sentence(),
      organizationId: factoryDefaults.orgId!,
      createdBy: factoryDefaults.userId!,
      bankAccountNumber: '****' + faker.string.numeric(4),
      bankRoutingNumber: '021000021',
      ...overrides,
    };
  },

  /**
   * Create and persist a settlement
   */
  async create(overrides?: Partial<Settlement>): Promise<Settlement> {
    const settlementRepository = AppDataSource.getRepository(Settlement);
    const data = this.build(overrides);
    return settlementRepository.save(data as Settlement);
  },

  /**
   * Create multiple settlements
   */
  async createMany(count: number, overrides?: Partial<Settlement>): Promise<Settlement[]> {
    const settlementRepository = AppDataSource.getRepository(Settlement);
    const settlements = Array.from({ length: count }, () => this.build(overrides) as Settlement);
    return settlementRepository.save(settlements);
  },
};

/**
 * Complete Fixture - Create a full set of related data
 */
export const fixtureFactory = {
  /**
   * Create a complete show with finance records and itineraries
   */
  async createCompleteShow(
    showOverrides?: Partial<Show>,
    financeCount = 3,
    itineraryCount = 2
  ): Promise<{
    show: Show;
    finances: FinanceRecord[];
    itineraries: Itinerary[];
  }> {
    const show = await showFactory.create(showOverrides);
    const finances = await financeFactory.createForShow(show.id, financeCount);
    const itineraries = await itineraryFactory.createForShow(show.id, itineraryCount);

    return { show, finances, itineraries };
  },

  /**
   * Create multiple complete shows with all relationships
   */
  async createCompleteShows(
    count: number,
    showOverrides?: Partial<Show>,
    financePerShow = 3,
    itinerariesPerShow = 2
  ): Promise<{
    shows: Show[];
    finances: FinanceRecord[];
    itineraries: Itinerary[];
  }> {
    const shows = await showFactory.createMany(count, showOverrides);
    const finances: FinanceRecord[] = [];
    const itineraries: Itinerary[] = [];

    for (const show of shows) {
      const showFinances = await financeFactory.createForShow(show.id, financePerShow);
      const showItineraries = await itineraryFactory.createForShow(show.id, itinerariesPerShow);
      finances.push(...showFinances);
      itineraries.push(...showItineraries);
    }

    return { shows, finances, itineraries };
  },

  /**
   * Create complete test scenario with shows, finances, itineraries, and settlements
   */
  async createCompleteScenario(
    showCount = 3,
    financePerShow = 2,
    itinerariesPerShow = 2,
    settlementCount = 1
  ): Promise<{
    shows: Show[];
    finances: FinanceRecord[];
    itineraries: Itinerary[];
    settlements: Settlement[];
  }> {
    const { shows, finances, itineraries } = await this.createCompleteShows(
      showCount,
      {},
      financePerShow,
      itinerariesPerShow
    );
    const settlements = await settlementFactory.createMany(settlementCount);

    return { shows, finances, itineraries, settlements };
  },
};

/**
 * Database utilities for tests
 */
export const databaseUtils = {
  /**
   * Clear all tables in dependency order
   */
  async truncateAll(): Promise<void> {
    try {
      const settlementRepository = AppDataSource.getRepository(Settlement);
      const itineraryRepository = AppDataSource.getRepository(Itinerary);
      const financeRepository = AppDataSource.getRepository(FinanceRecord);
      const showRepository = AppDataSource.getRepository(Show);

      // Delete in reverse order of dependencies
      await settlementRepository.delete({});
      await itineraryRepository.delete({});
      await financeRepository.delete({});
      await showRepository.delete({});
    } catch (error) {
      console.error('Error truncating tables:', error);
      throw error;
    }
  },

  /**
   * Get count of records in a table
   */
  async getCount(repository: any): Promise<number> {
    return repository.count();
  },

  /**
   * Verify data integrity after operations
   */
  async verifyIntegrity(): Promise<{
    valid: boolean;
    showsCount: number;
    financesCount: number;
    itinerariesCount: number;
    settlementsCount: number;
  }> {
    const showRepository = AppDataSource.getRepository(Show);
    const financeRepository = AppDataSource.getRepository(FinanceRecord);
    const itineraryRepository = AppDataSource.getRepository(Itinerary);
    const settlementRepository = AppDataSource.getRepository(Settlement);

    const showsCount = await showRepository.count();
    const financesCount = await financeRepository.count();
    const itinerariesCount = await itineraryRepository.count();
    const settlementsCount = await settlementRepository.count();

    // Verify foreign keys
    const orphanedFinances = await financeRepository
      .createQueryBuilder('finance')
      .leftJoin('finance.show', 'show')
      .where('show.id IS NULL')
      .getCount();

    const orphanedItineraries = await itineraryRepository
      .createQueryBuilder('itinerary')
      .leftJoin('itinerary.show', 'show')
      .where('show.id IS NULL')
      .getCount();

    const valid = orphanedFinances === 0 && orphanedItineraries === 0;

    return {
      valid,
      showsCount,
      financesCount,
      itinerariesCount,
      settlementsCount,
    };
  },
};

export default {
  showFactory,
  financeFactory,
  itineraryFactory,
  settlementFactory,
  fixtureFactory,
  databaseUtils,
  setFactoryDefaults,
  getFactoryDefaults,
};
