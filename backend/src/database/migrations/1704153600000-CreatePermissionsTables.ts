import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique } from 'typeorm';

export class CreatePermissionsTables1704153600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create permissions table
    await queryRunner.createTable(
      new Table({
        name: 'permissions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Add index on code for faster lookups
    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'idx_permission_code',
        columnNames: ['code'],
      })
    );

    // Create role_permissions table (join table)
    await queryRunner.createTable(
      new Table({
        name: 'role_permissions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'roleId',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'permissionId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['permissionId'],
            referencedTableName: 'permissions',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
      true
    );

    // Add unique constraint on roleId + permissionId
    await queryRunner.createUniqueConstraint(
      'role_permissions',
      new TableUnique({
        name: 'idx_role_permission_composite',
        columnNames: ['roleId', 'permissionId'],
      })
    );

    // Add index for faster lookups
    await queryRunner.createIndex(
      'role_permissions',
      new TableIndex({
        name: 'idx_role_permission_roleId',
        columnNames: ['roleId'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop role_permissions table
    await queryRunner.dropTable('role_permissions');

    // Drop permissions table
    await queryRunner.dropTable('permissions');
  }
}
