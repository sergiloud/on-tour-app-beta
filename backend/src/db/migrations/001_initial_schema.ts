import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Users table
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('email', 'varchar(255)', (col) => col.unique().notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('avatar_url', 'text')
    .addColumn('oauth_provider', 'varchar(50)', (col) => col.notNull())
    .addColumn('oauth_id', 'varchar(255)', (col) => col.notNull())
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true).notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  await db.schema
    .createIndex('users_email')
    .on('users')
    .column('email')
    .execute();

  // Organizations table
  await db.schema
    .createTable('organizations')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('owner_id', 'uuid', (col) =>
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('description', 'text')
    .addColumn('logo_url', 'text')
    .addColumn('settings', 'jsonb', (col) => col.defaultTo(sql`'{}'`))
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Organization members table (many-to-many with roles)
  await db.schema
    .createTable('organization_members')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('organization_id', 'uuid', (col) =>
      col.references('organizations.id').onDelete('cascade').notNull()
    )
    .addColumn('user_id', 'uuid', (col) =>
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('role', 'varchar(50)', (col) =>
      col.defaultTo('member').notNull()
    ) // owner, manager, member, viewer
    .addColumn('joined_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addUniqueConstraint('org_members_unique', [
      'organization_id',
      'user_id',
    ])
    .execute();

  // Shows table
  await db.schema
    .createTable('shows')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('organization_id', 'uuid', (col) =>
      col.references('organizations.id').onDelete('cascade').notNull()
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('venue', 'varchar(255)')
    .addColumn('city', 'varchar(255)')
    .addColumn('country', 'varchar(2)')
    .addColumn('show_date', 'date', (col) => col.notNull())
    .addColumn('door_time', 'time')
    .addColumn('show_time', 'time')
    .addColumn('end_time', 'time')
    .addColumn('notes', 'text')
    .addColumn('ticket_url', 'text')
    .addColumn('status', 'varchar(50)', (col) => col.defaultTo('scheduled'))
    // scheduled, cancelled, completed
    .addColumn('metadata', 'jsonb', (col) => col.defaultTo(sql`'{}'`))
    .addColumn('created_by', 'uuid', (col) =>
      col.references('users.id').onDelete('set null')
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  await db.schema
    .createIndex('shows_organization')
    .on('shows')
    .column('organization_id')
    .execute();

  await db.schema
    .createIndex('shows_date')
    .on('shows')
    .column('show_date')
    .execute();

  // Finance table
  await db.schema
    .createTable('finance_records')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('show_id', 'uuid', (col) =>
      col.references('shows.id').onDelete('cascade').notNull()
    )
    .addColumn('organization_id', 'uuid', (col) =>
      col.references('organizations.id').onDelete('cascade').notNull()
    )
    .addColumn('amount', 'decimal(12, 2)', (col) => col.notNull())
    .addColumn('currency', 'varchar(3)', (col) => col.defaultTo('USD'))
    .addColumn('category', 'varchar(50)', (col) => col.notNull())
    // venue_fee, ticket_sales, expenses, settlement
    .addColumn('description', 'text')
    .addColumn('status', 'varchar(50)', (col) => col.defaultTo('pending'))
    // pending, confirmed, settled
    .addColumn('recorded_by', 'uuid', (col) =>
      col.references('users.id').onDelete('set null')
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Activity audit log
  await db.schema
    .createTable('audit_logs')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('organization_id', 'uuid', (col) =>
      col.references('organizations.id').onDelete('cascade').notNull()
    )
    .addColumn('user_id', 'uuid', (col) =>
      col.references('users.id').onDelete('set null')
    )
    .addColumn('action', 'varchar(255)', (col) => col.notNull())
    // create_show, update_show, delete_show, etc
    .addColumn('entity_type', 'varchar(50)', (col) => col.notNull())
    // show, finance, user, organization
    .addColumn('entity_id', 'uuid')
    .addColumn('changes', 'jsonb', (col) => col.defaultTo(sql`'{}'`))
    .addColumn('ip_address', 'varchar(45)')
    .addColumn('user_agent', 'text')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  await db.schema
    .createIndex('audit_logs_org')
    .on('audit_logs')
    .column('organization_id')
    .execute();

  await db.schema
    .createIndex('audit_logs_created')
    .on('audit_logs')
    .column('created_at')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('audit_logs').ifExists().execute();
  await db.schema.dropTable('finance_records').ifExists().execute();
  await db.schema.dropTable('shows').ifExists().execute();
  await db.schema.dropTable('organization_members').ifExists().execute();
  await db.schema.dropTable('organizations').ifExists().execute();
  await db.schema.dropTable('users').ifExists().execute();
}
