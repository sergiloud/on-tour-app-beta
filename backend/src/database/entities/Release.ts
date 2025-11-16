import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Show } from "./Show.js";
import { Organization } from "./Organization.js";
import { Task } from "./Task.js";

export type ReleaseType = 'single' | 'album' | 'ep' | 'video' | 'merchandise' | 'promotional';
export type ReleaseStatus = 'planning' | 'production' | 'ready' | 'released' | 'cancelled';
export type ReleasePlatform = 'spotify' | 'apple_music' | 'youtube' | 'physical' | 'streaming' | 'digital';

@Entity("releases")
export class Release {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("varchar", { length: 255 })
  title!: string;

  @Column("text", { nullable: true })
  description?: string;

  @Column("varchar", { length: 20 })
  type!: ReleaseType;

  @Column("varchar", { length: 20 })
  status!: ReleaseStatus;

  @Column("timestamptz")
  releaseDate!: Date;

  @Column("timestamptz", { nullable: true })
  announcementDate?: Date;

  @Column("timestamptz", { nullable: true })
  productionDeadline?: Date;

  // Platforms where this will be released
  @Column("jsonb", { default: [] })
  platforms!: ReleasePlatform[];

  // Dependencies - IDs of other entities that must be completed first
  @Column("jsonb", { default: [] })
  dependencies!: string[];

  // Financial information
  @Column("decimal", { precision: 12, scale: 2, nullable: true })
  budget?: number;

  @Column("decimal", { precision: 12, scale: 2, nullable: true })
  expectedRevenue?: number;

  @Column("decimal", { precision: 12, scale: 2, nullable: true })
  actualRevenue?: number;

  // Relationship with Show (optional - releases can be independent)
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

  // Related tasks
  @OneToMany(() => Task, task => task.show)
  tasks?: Task[];

  // Marketing and promotion metadata
  @Column("jsonb", { nullable: true })
  metadata?: {
    genre?: string;
    collaborators?: string[];
    recordLabel?: string;
    distributor?: string;
    artwork?: {
      url?: string;
      artist?: string;
      status?: 'pending' | 'approved' | 'revision';
    };
    promotion?: {
      teaserDate?: string;
      fullReleaseDate?: string;
      pressReleaseDate?: string;
      socialMediaCampaign?: string[];
    };
    analytics?: {
      preOrderCount?: number;
      socialEngagement?: number;
      streamingProjections?: number;
    };
    customFields?: Record<string, any>;
  };

  @Column("varchar", { length: 255 })
  createdBy!: string; // User ID

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}