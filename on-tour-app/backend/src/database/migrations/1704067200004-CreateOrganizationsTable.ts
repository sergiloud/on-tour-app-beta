import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

/**
 * Migration: Create Organizations Table
 * 
 * Purpose: Create multi-tenant organization table with:
 * - UUID primary key
 * - Unique slug for URL-friendly identification
 * - Soft delete via deletedAt column
 * - Audit timestamps (createdAt, updatedAt)
 * - Indices for query performance
 * 
 * PHASE 1 (This): Nullable organizationId columns
 * Later phases: Add FK constraints and make NOT NULL
 */
export class CreateOrganizationsTable1699209600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create organizations table
    await queryRunner.createTable(
      new Table({
        name: "organizations",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
            default: "uuid_generate_v4()",
          },
          {
            name: "name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "slug",
            type: "varchar",
            length: "255",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "websiteUrl",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "logoUrl",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "ownerId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "deletedAt",
            type: "timestamp",
            isNullable: true, // Soft delete
          },
        ],
        indices: [
          {
            name: "idx_organizations_slug",
            columnNames: ["slug"],
            isUnique: true,
          },
          {
            name: "idx_organizations_ownerId",
            columnNames: ["ownerId"],
          },
          {
            name: "idx_organizations_createdAt",
            columnNames: ["createdAt"],
          },
          {
            name: "idx_organizations_deletedAt",
            columnNames: ["deletedAt"], // Optimize soft delete queries
          },
        ],
      }),
      true // ifNotExists
    );

    console.log("✅ Organizations table created");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("organizations", true); // ifExists
    console.log("✅ Organizations table dropped");
  }
}
