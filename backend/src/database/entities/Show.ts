import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { FinanceRecord } from "./FinanceRecord.js";
import { Itinerary } from "./Itinerary.js";

@Entity("shows")
export class Show {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("varchar", { length: 255 })
  title!: string;

  @Column("text", { nullable: true })
  description?: string;

  @Column("varchar", { length: 50 })
  status!: "draft" | "scheduled" | "active" | "completed" | "cancelled";

  @Column("date")
  startDate!: Date;

  @Column("date")
  endDate!: Date;

  @Column("varchar", { length: 50 })
  type!: string;

  @Column("varchar", { length: 100 })
  location!: string;

  @Column("integer")
  capacity!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  budget!: number;

  @Column("varchar", { length: 50 })
  currency!: string;

  @Column("uuid")
  organizationId!: string;

  @Column("uuid", { nullable: true })
  createdBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => FinanceRecord, (finance) => finance.show)
  finances?: FinanceRecord[];

  @OneToMany(() => Itinerary, (itinerary) => itinerary.show)
  itineraries?: Itinerary[];
}
