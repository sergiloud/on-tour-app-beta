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

@Entity("itineraries")
export class Itinerary {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("uuid")
  showId!: string;

  @ManyToOne(() => Show, (show) => show.itineraries)
  @JoinColumn({ name: "showId" })
  show!: Show;

  @Column("varchar", { length: 255 })
  title!: string;

  @Column("text", { nullable: true })
  description?: string;

  @Column("date")
  startDate!: Date;

  @Column("date")
  endDate!: Date;

  @Column("varchar", { length: 100 })
  destination!: string;

  @Column("text")
  activities!: string;

  @Column("varchar", { length: 50 })
  status!: "draft" | "confirmed" | "completed" | "cancelled";

  @Column("integer")
  numberOfDays!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  estimatedCost!: number;

  @Column("varchar", { length: 50 })
  currency!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
