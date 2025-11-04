import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateShowsTable implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "shows",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "title",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "status",
            type: "varchar",
            length: "50",
            isNullable: false,
            default: "'draft'",
          },
          {
            name: "startDate",
            type: "date",
            isNullable: false,
          },
          {
            name: "endDate",
            type: "date",
            isNullable: false,
          },
          {
            name: "type",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "location",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "capacity",
            type: "integer",
            isNullable: false,
          },
          {
            name: "budget",
            type: "decimal",
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: "currency",
            type: "varchar",
            length: "50",
            isNullable: false,
            default: "'USD'",
          },
          {
            name: "organizationId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "createdBy",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
        indices: [
          {
            columnNames: ["organizationId"],
          },
          {
            columnNames: ["status"],
          },
          {
            columnNames: ["startDate"],
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("shows");
  }
}
