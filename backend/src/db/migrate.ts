import 'dotenv/config';
import { Pool } from 'pg';
import { FileMigrationProvider, Migrator } from 'kysely';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './client.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, 'migrations'),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      logger.info(`✓ Migration "${it.migrationName}" executed successfully`);
    } else if (it.status === 'Error') {
      logger.error(`✗ Migration "${it.migrationName}" failed`);
    }
  });

  if (error) {
    logger.error('Failed to migrate:', error);
    process.exit(1);
  }

  logger.info('All migrations completed');
  process.exit(0);
}

migrate().catch((error) => {
  logger.error('Migration failed:', error);
  process.exit(1);
});
