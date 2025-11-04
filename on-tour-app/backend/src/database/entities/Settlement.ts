import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("settlements")
export class Settlement {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("varchar", { length: 100 })
  name!: string;

  @Column("date")
  settlementDate!: Date;

  @Column("decimal", { precision: 15, scale: 2 })
  totalAmount!: number;

  @Column("varchar", { length: 50 })
  currency!: string;

  @Column("varchar", { length: 50 })
  status!: "pending" | "in_progress" | "completed" | "failed";

  @Column("text", { nullable: true })
  notes?: string;

  @Column("uuid")
  organizationId!: string;

  @Column("uuid")
  createdBy!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column("varchar", { length: 100, nullable: true })
  bankAccountNumber?: string;

  @Column("varchar", { length: 100, nullable: true })
  bankRoutingNumber?: string;
}
