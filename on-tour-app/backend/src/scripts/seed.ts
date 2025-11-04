import { AppDataSource } from '../database/datasource.js';
import { Show } from '../database/entities/Show.js';
import { FinanceRecord } from '../database/entities/FinanceRecord.js';
import { Itinerary } from '../database/entities/Itinerary.js';
import { Settlement } from '../database/entities/Settlement.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

async function seedDatabase() {
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

    // Clear existing data
    await settlementRepository.delete({});
    await itineraryRepository.delete({});
    await financeRepository.delete({});
    await showRepository.delete({});
    logger.info('🗑️  Cleared existing data');

    const orgId = 'org-123456';
    const userId = 'user-123456';

    // Create sample shows
    const shows = [
      {
        id: uuidv4(),
        title: 'Summer Music Festival 2025',
        description: 'Annual summer music festival featuring international artists',
        status: 'active' as const,
        startDate: new Date('2025-06-15'),
        endDate: new Date('2025-06-17'),
        type: 'festival',
        location: 'Central Park, New York',
        capacity: 10000,
        budget: 250000,
        currency: 'USD',
        organizationId: orgId,
        createdBy: userId,
      },
      {
        id: uuidv4(),
        title: 'Winter Tech Conference 2025',
        description: 'Premier technology conference with keynotes and workshops',
        status: 'scheduled' as const,
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-03'),
        type: 'conference',
        location: 'San Francisco Convention Center',
        capacity: 5000,
        budget: 500000,
        currency: 'USD',
        organizationId: orgId,
        createdBy: userId,
      },
      {
        id: uuidv4(),
        title: 'Jazz Night Gala',
        description: 'Intimate jazz performance with dinner',
        status: 'draft' as const,
        startDate: new Date('2025-07-20'),
        endDate: new Date('2025-07-20'),
        type: 'concert',
        location: 'Lincoln Center, NYC',
        capacity: 500,
        budget: 50000,
        currency: 'USD',
        organizationId: orgId,
        createdBy: userId,
      },
    ];

    const savedShows = await showRepository.save(shows);
    logger.info(`✅ Created ${savedShows.length} sample shows`);

    // Create sample finance records
    const financeRecords = [
      {
        id: uuidv4(),
        showId: savedShows[0].id,
        category: 'Artist Fees',
        amount: 100000,
        currency: 'USD',
        type: 'expense' as const,
        description: 'International artist performances',
        status: 'approved' as const,
        transactionDate: new Date('2025-05-01'),
        approvedBy: userId,
      },
      {
        id: uuidv4(),
        showId: savedShows[0].id,
        category: 'Ticket Sales',
        amount: 150000,
        currency: 'USD',
        type: 'income' as const,
        description: 'Early bird ticket sales',
        status: 'approved' as const,
        transactionDate: new Date('2025-05-15'),
        approvedBy: userId,
      },
      {
        id: uuidv4(),
        showId: savedShows[1].id,
        category: 'Venue Rental',
        amount: 75000,
        currency: 'USD',
        type: 'expense' as const,
        description: 'Convention center rental for 3 days',
        status: 'pending' as const,
        transactionDate: new Date('2025-11-01'),
      },
    ];

    await financeRepository.save(financeRecords);
    logger.info(`✅ Created ${financeRecords.length} sample finance records`);

    // Create sample itineraries
    const itineraries = [
      {
        id: uuidv4(),
        showId: savedShows[0].id,
        title: 'Arrival & Accommodation',
        description: 'Artist arrival and hotel check-in logistics',
        startDate: new Date('2025-06-14'),
        endDate: new Date('2025-06-14'),
        destination: 'New York',
        activities: JSON.stringify([
          'Airport pickup',
          'Hotel check-in',
          'Welcome dinner',
        ]),
        status: 'confirmed' as const,
        numberOfDays: 1,
        estimatedCost: 5000,
        currency: 'USD',
      },
      {
        id: uuidv4(),
        showId: savedShows[0].id,
        title: 'Festival Days',
        description: 'Main festival performance and activities',
        startDate: new Date('2025-06-15'),
        endDate: new Date('2025-06-17'),
        destination: 'Central Park',
        activities: JSON.stringify([
          'Stage setup',
          'Sound check',
          'Main performances',
          'After-party',
        ]),
        status: 'confirmed' as const,
        numberOfDays: 3,
        estimatedCost: 50000,
        currency: 'USD',
      },
      {
        id: uuidv4(),
        showId: savedShows[1].id,
        title: 'Conference Tour',
        description: 'Tech conference trip planning',
        startDate: new Date('2025-11-25'),
        endDate: new Date('2025-12-05'),
        destination: 'San Francisco',
        activities: JSON.stringify(['Keynotes', 'Workshops', 'Networking', 'Tours']),
        status: 'draft' as const,
        numberOfDays: 11,
        estimatedCost: 100000,
        currency: 'USD',
      },
    ];

    await itineraryRepository.save(itineraries);
    logger.info(`✅ Created ${itineraries.length} sample itineraries`);

    // Create sample settlements
    const settlements = [
      {
        id: uuidv4(),
        name: 'June 2025 Settlement',
        settlementDate: new Date('2025-07-01'),
        totalAmount: 50000,
        currency: 'USD',
        status: 'completed' as const,
        notes: 'Settled for June events',
        organizationId: orgId,
        createdBy: userId,
        bankAccountNumber: '****1234',
        bankRoutingNumber: '021000021',
      },
      {
        id: uuidv4(),
        name: 'Q3 2025 Settlement',
        settlementDate: new Date('2025-10-01'),
        totalAmount: 150000,
        currency: 'USD',
        status: 'in_progress' as const,
        notes: 'Q3 settlement processing',
        organizationId: orgId,
        createdBy: userId,
        bankAccountNumber: '****1234',
        bankRoutingNumber: '021000021',
      },
    ];

    await settlementRepository.save(settlements);
    logger.info(`✅ Created ${settlements.length} sample settlements`);

    logger.info('🌱 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
