import { AppDataSource } from '../database/datasource.js';
import { Show } from '../database/entities/Show.js';
import { FinanceRecord } from '../database/entities/FinanceRecord.js';
import { Itinerary } from '../database/entities/Itinerary.js';
import { Settlement } from '../database/entities/Settlement.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';
import { faker } from '@faker-js/faker';

interface SeedOptions {
  showCount?: number;
  financePerShow?: number;
  itinerariesPerShow?: number;
  settlementsCount?: number;
}

async function seedDatabase(options: SeedOptions = {}) {
  const {
    showCount = 8,
    financePerShow = 5,
    itinerariesPerShow = 3,
    settlementsCount = 4,
  } = options;

  try {
    // Initialize database
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      await AppDataSource.runMigrations();
      logger.info('✅ Database initialized and migrated');
    }

    const showRepository = AppDataSource.getRepository(Show);
    const financeRepository = AppDataSource.getRepository(FinanceRecord);
    const itineraryRepository = AppDataSource.getRepository(Itinerary);
    const settlementRepository = AppDataSource.getRepository(Settlement);

    // Clear existing data in correct order (foreign key dependencies)
    await settlementRepository.delete({});
    await itineraryRepository.delete({});
    await financeRepository.delete({});
    await showRepository.delete({});
    logger.info('🗑️  Cleared existing data');

    const orgId = uuidv4();
    const userId = uuidv4();

    // Helper function to generate realistic show data
    const generateShow = (index: number) => {
      const showTypes = ['festival', 'conference', 'concert', 'workshop', 'seminar', 'expo', 'gala', 'retreat'];
      const statuses = ['draft', 'scheduled', 'active', 'completed', 'cancelled'];
      const type = showTypes[index % showTypes.length];
      const startDate = faker.date.future({ years: 1 });
      const endDate = new Date(startDate.getTime() + faker.number.int({ min: 1, max: 10 }) * 24 * 60 * 60 * 1000);

      return {
        id: uuidv4(),
        title: faker.music.songName() + ' ' + type.charAt(0).toUpperCase() + type.slice(1),
        description: faker.lorem.paragraph(2),
        status: statuses[index % statuses.length] as any,
        startDate,
        endDate,
        type,
        location: faker.location.city() + ', ' + faker.location.state(),
        capacity: faker.number.int({ min: 100, max: 50000 }),
        budget: faker.number.int({ min: 50000, max: 500000 }),
        currency: 'USD',
        organizationId: orgId,
        createdBy: userId,
      };
    };

    // Generate shows with realistic data
    const shows = Array.from({ length: showCount }, (_, i) => generateShow(i));
    const savedShows = await showRepository.save(shows);
    logger.info(`✅ Created ${savedShows.length} shows with realistic data`);

    // Generate finance records for each show with realistic data
    const financeRecords: any[] = [];
    for (const show of savedShows) {
      const recordsForShow = Array.from({ length: financePerShow }, (_, i) => {
        const categories = [
          'Artist Fees', 'Venue Rental', 'Production Equipment', 'Marketing',
          'Staffing', 'Catering', 'Insurance', 'Permits', 'Transportation',
          'Accommodation', 'Tech Setup', 'Security', 'Lighting', 'Sound System'
        ];
        const types = ['income', 'expense'] as const;
        const statuses = ['approved', 'pending', 'rejected'] as const;

        const category = categories[i % categories.length];
        const type = types[i % types.length];
        const isIncome = type === 'income';
        const amount = isIncome
          ? faker.number.int({ min: 10000, max: 200000 })
          : faker.number.int({ min: 5000, max: 100000 });

        return {
          id: uuidv4(),
          showId: show.id,
          category,
          amount,
          currency: 'USD',
          type,
          description: faker.lorem.sentence(),
          status: statuses[i % statuses.length] as any,
          transactionDate: faker.date.past({ years: 1 }),
          approvedBy: type === 'income' ? userId : undefined,
        };
      });
      financeRecords.push(...recordsForShow);
    }

    await financeRepository.save(financeRecords);
    logger.info(`✅ Created ${financeRecords.length} finance records (${financePerShow} per show)`);

    // Generate itineraries for each show with realistic data
    const itineraries: any[] = [];
    for (const show of savedShows) {
      const itinerariesForShow = Array.from({ length: itinerariesPerShow }, (_, i) => {
        const activityTypes = [
          ['Travel', 'Hotel Check-in', 'Welcome Reception'],
          ['Site Preparation', 'Sound Check', 'Technical Setup'],
          ['Main Event', 'Performances', 'Networking'],
          ['Breakdown', 'Wrap-up Meeting', 'Departure'],
        ];

        const startDate = new Date(show.startDate);
        startDate.setDate(startDate.getDate() - i - 1);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + faker.number.int({ min: 0, max: 3 }));

        return {
          id: uuidv4(),
          showId: show.id,
          title: faker.lorem.sentence(3),
          description: faker.lorem.paragraph(),
          startDate,
          endDate,
          destination: faker.location.city(),
          activities: JSON.stringify(activityTypes[i % activityTypes.length]),
          status: ['confirmed', 'draft', 'in_progress'][i % 3] as any,
          numberOfDays: faker.number.int({ min: 1, max: 7 }),
          estimatedCost: faker.number.int({ min: 5000, max: 100000 }),
          currency: 'USD',
        };
      });
      itineraries.push(...itinerariesForShow);
    }

    await itineraryRepository.save(itineraries);
    logger.info(`✅ Created ${itineraries.length} itineraries (${itinerariesPerShow} per show)`);

    // Generate settlements with realistic data
    const settlements: any[] = [];
    const settlementMonths = ['January', 'April', 'July', 'October'];

    for (let i = 0; i < settlementsCount; i++) {
      const month = settlementMonths[i % settlementMonths.length];
      const year = 2025;
      const settlementDate = new Date(`${month} 1, ${year}`);

      settlements.push({
        id: uuidv4(),
        name: `${month} ${year} Settlement`,
        settlementDate,
        totalAmount: faker.number.int({ min: 50000, max: 300000 }),
        currency: 'USD',
        status: ['completed', 'in_progress', 'pending'][i % 3] as any,
        notes: faker.lorem.sentence(),
        organizationId: orgId,
        createdBy: userId,
        bankAccountNumber: '****' + faker.string.numeric(4),
        bankRoutingNumber: '021000021',
      });
    }

    await settlementRepository.save(settlements);
    logger.info(`✅ Created ${settlements.length} settlements`);

    logger.info(`
    ╔════════════════════════════════════════╗
    ║  🌱 Database Seeding Complete!        ║
    ╚════════════════════════════════════════╝

    📊 Data Generated:
      • Shows: ${savedShows.length}
      • Finance Records: ${financeRecords.length}
      • Itineraries: ${itineraries.length}
      • Settlements: ${settlements.length}
      • Organization ID: ${orgId}
      • User ID: ${userId}

    Ready to test with: npm run db:reset
    `);
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Parse command line arguments for seed options
const args = process.argv.slice(2);
const options: SeedOptions = {
  showCount: 8,
  financePerShow: 5,
  itinerariesPerShow: 3,
  settlementsCount: 4,
};

// Allow customization via CLI: npm run seed -- --shows=10 --finance=8
args.forEach(arg => {
  const [key, value] = arg.split('=');
  if (key === '--shows') options.showCount = parseInt(value);
  if (key === '--finance') options.financePerShow = parseInt(value);
  if (key === '--itineraries') options.itinerariesPerShow = parseInt(value);
  if (key === '--settlements') options.settlementsCount = parseInt(value);
});

seedDatabase(options);
