import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { logger } from '../utils/logger.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Database {
  users: any;
  organizations: any;
  organization_members: any;
  shows: any;
  finance_records: any;
  audit_logs: any;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DATABASE_POOL_SIZE || '10'),
});

pool.on('error', (err) => {
  logger.error('Unexpected connection pool error:', err);
});

pool.on('connect', () => {
  logger.debug('Database connection established');
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
});

export async function testConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    logger.info('✓ Database connection successful');
    return true;
  } catch (error) {
    logger.error('✗ Database connection failed:', error);
    return false;
  }
}

export async function closeConnection(): Promise<void> {
  await pool.end();
  logger.info('Database connection closed');
}
