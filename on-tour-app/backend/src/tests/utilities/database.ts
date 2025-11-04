/**
 * Database Testing Utilities - Reset, fixtures, and helper functions for tests
 */

import { AppDataSource } from '../../database/datasource.js';
import { logger } from '../../utils/logger.js';

/**
 * Test database setup and teardown
 */
export const testDatabase = {
  /**
   * Initialize test database connection
   */
  async connect(): Promise<void> {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('✅ Test database connection initialized');
    }
  },

  /**
   * Disconnect from test database
   */
  async disconnect(): Promise<void> {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('✅ Test database connection closed');
    }
  },

  /**
   * Run all pending migrations
   */
  async migrate(): Promise<void> {
    try {
      const migrations = await AppDataSource.runMigrations();
      logger.info(`✅ Ran ${migrations.length} migrations`);
    } catch (error) {
      logger.error('❌ Migration failed:', error);
      throw error;
    }
  },

  /**
   * Revert all migrations
   */
  async revertMigrations(): Promise<void> {
    try {
      let result = await AppDataSource.undoLastMigration();
      while (result !== null && result !== undefined) {
        logger.info(`↩️  Reverted migrations`);
        result = await AppDataSource.undoLastMigration();
      }
    } catch (error) {
      logger.info('ℹ️  No migrations to revert');
    }
  },

  /**
   * Reset database to clean state (truncate all tables)
   */
  async reset(): Promise<void> {
    try {
      const entities = AppDataSource.entityMetadatas;

      // Disable foreign key constraints
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Delete data in reverse order of dependencies
        for (const entity of entities.reverse()) {
          const repository = AppDataSource.getRepository(entity.name);
          await repository.delete({});
        }

        await queryRunner.commitTransaction();
        logger.info('✅ Database reset successfully');
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      logger.error('❌ Database reset failed:', error);
      throw error;
    }
  },

  /**
   * Reset and re-migrate database to fresh state
   */
  async resetWithMigrations(): Promise<void> {
    try {
      await this.reset();
      await this.revertMigrations();
      await this.migrate();
      logger.info('✅ Database reset and re-migrated');
    } catch (error) {
      logger.error('❌ Reset with migrations failed:', error);
      throw error;
    }
  },

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    connected: boolean;
    entities: string[];
    tableCount: Record<string, number>;
  }> {
    const entities = AppDataSource.entityMetadatas.map(e => e.name);
    const tableCount: Record<string, number> = {};

    for (const entity of entities) {
      const repository = AppDataSource.getRepository(entity);
      tableCount[entity] = await repository.count();
    }

    return {
      connected: AppDataSource.isInitialized,
      entities,
      tableCount,
    };
  },

  /**
   * Verify all tables exist and have correct schema
   */
  async verifySchema(): Promise<{
    valid: boolean;
    tables: string[];
    errors: string[];
  }> {
    const errors: string[] = [];
    const tables: string[] = [];

    try {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();

      try {
        for (const entity of AppDataSource.entityMetadatas) {
          const table = await queryRunner.getTable(entity.tableName);
          if (table) {
            tables.push(entity.tableName);
          } else {
            errors.push(`Table not found: ${entity.tableName}`);
          }
        }
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      errors.push(`Schema verification failed: ${error}`);
    }

    return {
      valid: errors.length === 0,
      tables,
      errors,
    };
  },
};

/**
 * Test fixtures and scenarios
 */
export const testFixtures = {
  /**
   * Common test data for various scenarios
   */
  scenarios: {
    /**
     * Minimal show for testing
     */
    minimalShow: {
      title: 'Test Show',
      description: 'Test Description',
      status: 'draft' as const,
      startDate: new Date('2025-06-15'),
      endDate: new Date('2025-06-17'),
      type: 'concert' as const,
      location: 'Test City',
      capacity: 1000,
      budget: 100000,
      currency: 'USD',
    },

    /**
     * Complete show with all fields
     */
    completeShow: {
      title: 'Complete Test Show',
      description: 'A comprehensive test show with all fields populated',
      status: 'active' as const,
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-07-05'),
      type: 'festival' as const,
      location: 'San Francisco, CA',
      capacity: 5000,
      budget: 500000,
      currency: 'USD',
    },

    /**
     * Finance record examples
     */
    financeRecords: {
      income: {
        category: 'Ticket Sales',
        amount: 100000,
        currency: 'USD',
        type: 'income' as const,
        description: 'Early bird ticket sales',
        status: 'approved' as const,
        transactionDate: new Date('2025-05-01'),
      },
      expense: {
        category: 'Artist Fees',
        amount: 50000,
        currency: 'USD',
        type: 'expense' as const,
        description: 'Main artist performance fee',
        status: 'pending' as const,
        transactionDate: new Date('2025-06-01'),
      },
    },

    /**
     * Itinerary examples
     */
    itinerary: {
      title: 'Arrival & Setup',
      description: 'Artist arrival and venue setup',
      startDate: new Date('2025-06-14'),
      endDate: new Date('2025-06-15'),
      destination: 'San Francisco',
      activities: JSON.stringify(['Travel', 'Hotel Check-in', 'Sound Check']),
      status: 'confirmed' as const,
      numberOfDays: 2,
      estimatedCost: 10000,
      currency: 'USD',
    },

    /**
     * Settlement examples
     */
    settlement: {
      name: 'Q2 2025 Settlement',
      settlementDate: new Date('2025-07-01'),
      totalAmount: 250000,
      currency: 'USD',
      status: 'completed' as const,
      notes: 'Q2 earnings settlement',
      bankAccountNumber: '****1234',
      bankRoutingNumber: '021000021',
    },
  },

  /**
   * Generate ID sets for testing relationships
   */
  ids: {
    orgId: 'org-test-12345',
    userId: 'user-test-12345',
    showId: 'show-test-12345',
  },
};

/**
 * Test database context manager
 */
export class DatabaseTestContext {
  private initialized = false;

  /**
   * Setup test database before tests
   */
  async setup(): Promise<void> {
    await testDatabase.connect();
    await testDatabase.reset();
    this.initialized = true;
  }

  /**
   * Teardown test database after tests
   */
  async teardown(): Promise<void> {
    if (this.initialized) {
      await testDatabase.disconnect();
      this.initialized = false;
    }
  }

  /**
   * Reset database between tests
   */
  async reset(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Database context not initialized. Call setup() first.');
    }
    await testDatabase.reset();
  }

  /**
   * Get database statistics for assertion
   */
  async getStats() {
    return testDatabase.getStats();
  }
}

/**
 * Test utilities for common operations
 */
export const testUtils = {
  /**
   * Wait for async operation with timeout
   */
  async waitFor<T>(
    fn: () => Promise<T>,
    options: { timeout?: number; interval?: number } = {}
  ): Promise<T> {
    const { timeout = 5000, interval = 100 } = options;
    const start = Date.now();

    while (Date.now() - start < timeout) {
      try {
        return await fn();
      } catch {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    throw new Error(`Operation timed out after ${timeout}ms`);
  },

  /**
   * Create a test scenario with multiple entities
   */
  async createTestScenario() {
    // Import at runtime to avoid circular dependency
    const factories = await import('../factories/index.js');
    return factories.fixtureFactory.createCompleteScenario(3, 2, 1, 2);
  },

  /**
   * Assert table is empty
   */
  async assertTableEmpty(entityName: string): Promise<void> {
    const repository = AppDataSource.getRepository(entityName);
    const count = await repository.count();
    if (count !== 0) {
      throw new Error(`Expected empty table ${entityName}, but found ${count} records`);
    }
  },

  /**
   * Assert table has N records
   */
  async assertTableCount(entityName: string, expected: number): Promise<void> {
    const repository = AppDataSource.getRepository(entityName);
    const count = await repository.count();
    if (count !== expected) {
      throw new Error(
        `Expected ${expected} records in ${entityName}, but found ${count}`
      );
    }
  },
};

/**
 * Jest/Vitest setup helpers
 */
export const setupTestDatabase = async () => {
  const context = new DatabaseTestContext();

  beforeAll(async () => {
    await context.setup();
  });

  afterEach(async () => {
    await context.reset();
  });

  afterAll(async () => {
    await context.teardown();
  });

  return context;
};

export default {
  testDatabase,
  testFixtures,
  DatabaseTestContext,
  testUtils,
  setupTestDatabase,
};
