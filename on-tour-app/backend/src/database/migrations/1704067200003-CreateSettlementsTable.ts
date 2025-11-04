import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateSettlementsTable implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "settlements",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "settlementDate",
            type: "date",
            isNullable: false,
          },
          {
            name: "totalAmount",
            type: "decimal",
            precision: 15,
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
            name: "status",
            type: "varchar",
            length: "50",
            isNullable: false,
            default: "'pending'",
          },
          {
            name: "notes",
            type: "text",
            isNullable: true,
          },
          {
            name: "organizationId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "createdBy",
            type: "uuid",
            isNullable: false,
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
          {
            name: "bankAccountNumber",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "bankRoutingNumber",
            type: "varchar",
            length: "100",
            isNullable: true,
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
            columnNames: ["settlementDate"],
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("settlements");
  }
}
