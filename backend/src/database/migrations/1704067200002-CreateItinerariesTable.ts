import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateItinerariesTable implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "itineraries",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "showId",
            type: "uuid",
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
            name: "destination",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "activities",
            type: "text",
            isNullable: false,
          },
          {
            name: "status",
            type: "varchar",
            length: "50",
            isNullable: false,
            default: "'draft'",
          },
          {
            name: "numberOfDays",
            type: "integer",
            isNullable: false,
          },
          {
            name: "estimatedCost",
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
            columnNames: ["showId"],
          },
          {
            columnNames: ["status"],
          },
        ],
        foreignKeys: [
          {
            columnNames: ["showId"],
            referencedTableName: "shows",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("itineraries");
  }
}
