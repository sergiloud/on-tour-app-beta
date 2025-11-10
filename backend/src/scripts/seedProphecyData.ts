import { ShowsService } from '../services/showsService.js';
import { logger } from '../utils/logger.js';

// Prophecy dataset for backend migration
const PROPHECY_SHOWS_DATA = [
  // 2022
  { title: 'PROPHECY | Danny Avila pres. Mainstage Techno', startDate: '2022-07-31', endDate: '2022-07-31', location: 'Guaba Beach Bar, Limassol, CY', budget: 0 },
  { title: 'PROPHECY | Mainstage Techno daytime session (tbc)', startDate: '2022-08-14', endDate: '2022-08-14', location: 'Sel Octagon Tokyo, Tokyo, JP', budget: 0 },
  { title: 'PROPHECY | S2O Taiwan Songkran Music Festival 2022', startDate: '2022-08-27', endDate: '2022-08-27', location: 'Dajia Riverside Park, Taipei City, TW', budget: 0 },
  { title: 'PROPHECY | S2O Taiwan Songkran Music Festival 2022', startDate: '2022-08-28', endDate: '2022-08-28', location: 'Dajia Riverside Park, Taipei City, TW', budget: 0 },
  { title: 'PROPHECY | S2O Taiwan Songkran Music Festival 2022 AFTERPARTY', startDate: '2022-08-28', endDate: '2022-08-28', location: 'Wave, Taipei, TW', budget: 0 },
  { title: 'PROPHECY | Fairground', startDate: '2022-12-03', endDate: '2022-12-03', location: 'Hannover Exhibition Grounds - Hall 2, 3 & 4, Hannover, DE', budget: 1500 },
  { title: 'PROPHECY | Festival of Lights', startDate: '2022-12-31', endDate: '2022-12-31', location: 'Maria Theresia Bastion, Timișoara, RO', budget: 0 },

  // 2023
  { title: 'PROPHECY | Pool Sessions', startDate: '2023-05-20', endDate: '2023-05-20', location: 'Marmarela Club, Alicante, ES', budget: 2000 },
  { title: 'PROPHECY | Future Rave at Hï Ibiza', startDate: '2023-06-23', endDate: '2023-06-23', location: 'Hï Ibiza, Ibiza, ES', budget: 1215 },
  { title: 'PROPHECY | Future Rave at Hï Ibiza', startDate: '2023-06-24', endDate: '2023-06-24', location: 'Hï Ibiza, Ibiza, ES', budget: 1215 },
  { title: 'PROPHECY | Marmarela Club', startDate: '2023-07-08', endDate: '2023-07-08', location: 'Marmarela Club, Alicante, ES', budget: 2000 },
  { title: 'PROPHECY | Airbeat One 2023', startDate: '2023-07-15', endDate: '2023-07-15', location: 'Flugplatz Neustadt-Glewe, Neustadt-Glewe, DE', budget: 1000 },
  { title: 'PROPHECY | Docks', startDate: '2023-11-11', endDate: '2023-11-11', location: 'Docks, Hamburg, DE', budget: 0 },

  // 2024
  { title: 'PROPHECY | Und draußen tanzt der Bär', startDate: '2024-05-09', endDate: '2024-05-09', location: 'Freilichtbühne Schwerin, Schwerin, DE', budget: 1000 },
  { title: 'PROPHECY | FUTURE X TEK Pres. DANNY AVILA', startDate: '2024-05-31', endDate: '2024-05-31', location: 'Ministry Of Sound Club, London, GB', budget: 750 },
  { title: 'PROPHECY | El Ajo 2024', startDate: '2024-07-05', endDate: '2024-07-05', location: 'Peña El Ajo, Teruel, ES', budget: 2000 },
  { title: 'PROPHECY | Future Rave at Hï Ibiza', startDate: '2024-07-26', endDate: '2024-07-26', location: 'Hï Ibiza, Ibiza, ES', budget: 1215 },
  { title: 'PROPHECY | Future Rave at Hï Ibiza', startDate: '2024-07-27', endDate: '2024-07-27', location: 'Hï Ibiza, Ibiza, ES', budget: 1215 },
  { title: 'PROPHECY | Playa Padre', startDate: '2024-08-07', endDate: '2024-08-07', location: 'Playa Padre, Marbella, ES', budget: 0 },
  { title: 'PROPHECY | Momento', startDate: '2024-08-07', endDate: '2024-08-07', location: 'Momento Marbella, Marbella, ES', budget: 0 },
  { title: 'PROPHECY | Epic', startDate: '2024-10-12', endDate: '2024-10-12', location: 'Epic, Prague, CZ', budget: 500 },
  { title: 'PROPHECY | Bassmnt Madrid', startDate: '2024-11-01', endDate: '2024-11-01', location: 'Bassmnt Madrid, Madrid, ES', budget: 500 },
  { title: 'PROPHECY | Ultra Taiwan Resistance', startDate: '2024-11-16', endDate: '2024-11-16', location: 'Dajia Riverside Park, Taipei, TW', budget: 2000 },
  { title: 'PROPHECY | Ultra Official Afterparty', startDate: '2024-11-16', endDate: '2024-11-16', location: 'Ai Nightclub, Xinyi District, TW', budget: 1500 },
  { title: 'PROPHECY | Docks w/ Oliver Heldens', startDate: '2024-11-22', endDate: '2024-11-22', location: 'Docks, Hamburg, DE', budget: 1000 },
  { title: 'PROPHECY | Docks w/ Oliver Heldens', startDate: '2024-11-23', endDate: '2024-11-23', location: 'Docks, Hamburg, DE', budget: 1000 },
  { title: 'PROPHECY | Verti Music Hall w/ Timmy Trumpet', startDate: '2024-11-23', endDate: '2024-11-23', location: 'Verti Music Hall, Berlin, DE', budget: 750 },
  { title: 'PROPHECY | Fairground Festival 2024', startDate: '2024-11-30', endDate: '2024-11-30', location: 'Hannover Exhibition Grounds - Hall 2, 3 & 4, Hannover, DE', budget: 1500 },

  // 2025
  { title: 'PROPHECY | Bootshaus w/ Morten', startDate: '2025-01-10', endDate: '2025-01-10', location: 'Bootshaus, Cologne, DE', budget: 1000 },
  { title: 'PROPHECY | Marchica', startDate: '2025-02-07', endDate: '2025-02-07', location: 'Formigal, Formigal, ES', budget: 3500 },
  { title: 'PROPHECY | S2O Festival Thailand', startDate: '2025-04-13', endDate: '2025-04-13', location: 'Rajamangala National Stadium, Bangkok, TH', budget: 4000 },
  { title: 'PROPHECY | Beats For Love Festival', startDate: '2025-07-03', endDate: '2025-07-03', location: 'DOV Industrial site, Ostrava, CZ', budget: 2425 },
];

/**
 * Seeds Prophecy shows data into the backend for the specified organization
 */
export async function seedProphecyShows(organizationId: string): Promise<number> {
  try {
    logger.info({ organizationId }, 'Starting Prophecy shows seeding');

    let seededCount = 0;

    for (const showData of PROPHECY_SHOWS_DATA) {
      try {
        // Convert dates to ISO strings if needed
        const startDateTime = new Date(showData.startDate + 'T20:00:00.000Z').toISOString();
        const endDateTime = new Date(showData.endDate + 'T23:59:59.000Z').toISOString();

        await ShowsService.createShow(
          organizationId,
          'user_prophecy_system', // System user for seeding
          {
            title: showData.title,
            description: `Prophecy show at ${showData.location}`,
            startDate: startDateTime,
            endDate: endDateTime,
            location: showData.location,
            budget: showData.budget,
          }
        );

        seededCount++;
        logger.debug({ title: showData.title }, 'Seeded Prophecy show');
      } catch (error) {
        logger.warn({ title: showData.title, error }, 'Failed to seed individual show');
      }
    }

    logger.info({ organizationId, seededCount }, 'Prophecy shows seeding completed');
    return seededCount;
  } catch (error) {
    logger.error({ organizationId, error }, 'Failed to seed Prophecy shows');
    throw error;
  }
}

/**
 * Checks if Prophecy shows are already seeded for the organization
 */
export async function isProphecySeeded(organizationId: string): Promise<boolean> {
  try {
    const result = await ShowsService.listShows(organizationId, { limit: 1 });
    return result.total > 0;
  } catch (error) {
    logger.warn({ organizationId, error }, 'Failed to check if Prophecy is seeded');
    return false;
  }
}