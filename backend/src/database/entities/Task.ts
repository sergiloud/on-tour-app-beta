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
import { Organization } from "./Organization.js";

export type TaskType = 'technical' | 'promotional' | 'administrative' | 'logistics';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

@Entity("tasks")
export class Task {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("varchar", { length: 255 })
  title!: string;

  @Column("text", { nullable: true })
  description?: string;

  @Column("varchar", { length: 20 })
  type!: TaskType;

  @Column("varchar", { length: 20 })
  status!: TaskStatus;

  @Column("varchar", { length: 10, default: 'medium' })
  priority!: TaskPriority;

  @Column("timestamptz")
  deadline!: Date;

  @Column("timestamptz", { nullable: true })
  startDate?: Date;

  @Column("timestamptz", { nullable: true })
  completedAt?: Date;

  @Column("varchar", { length: 255, nullable: true })
  assignedTo?: string; // User ID

  @Column("int", { default: 0, nullable: true })
  estimatedHours?: number;

  @Column("int", { default: 0, nullable: true })
  actualHours?: number;

  // Relationship with Show (optional)
  @Column("uuid", { nullable: true })
  showId?: string;

  @ManyToOne(() => Show, { nullable: true })
  @JoinColumn({ name: 'showId' })
  show?: Show;

  // Multi-tenant support
  @Column("uuid")
  organizationId!: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization;

  // Metadata
  @Column("jsonb", { nullable: true })
  metadata?: {
    tags?: string[];
    attachments?: string[];
    dependencies?: string[];
    customFields?: Record<string, any>;
  };

  @Column("varchar", { length: 255 })
  createdBy!: string; // User ID

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}