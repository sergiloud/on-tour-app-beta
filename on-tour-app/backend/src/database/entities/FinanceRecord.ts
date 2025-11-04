import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Show } from "./Show.js";

@Entity("finance_records")
export class FinanceRecord {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("uuid")
  showId!: string;

  @ManyToOne(() => Show, (show) => show.finances)
  @JoinColumn({ name: "showId" })
  show!: Show;

  @Column("varchar", { length: 100 })
  category!: string;

  @Column("decimal", { precision: 12, scale: 2 })
  amount!: number;

  @Column("varchar", { length: 50 })
  currency!: string;

  @Column("varchar", { length: 50 })
  type!: "income" | "expense";

  @Column("text", { nullable: true })
  description?: string;

  @Column("varchar", { length: 50 })
  status!: "pending" | "approved" | "rejected";

  @Column("date")
  transactionDate!: Date;

  @Column("uuid", { nullable: true })
  approvedBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
