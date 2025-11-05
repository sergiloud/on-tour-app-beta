import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";

/**
 * Organization Entity
 * 
 * Represents a multi-tenant organization with:
 * - Unique slug for URL-friendly identification
 * - Soft deletes for data recovery
 * - CASCADE delete relationships (data safety)
 * - Audit timestamps (createdAt, updatedAt, deletedAt)
 * 
 * SECURITY:
 * - Slug is auto-generated from name (immutable)
 * - organizationId in JWT ensures tenant isolation
 * - Soft delete allows recovery if needed
 */
@Entity("organizations")
export class Organization {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("varchar", { length: 255 })
  name!: string;

  @Column("varchar", { length: 255, unique: true })
  slug!: string;

  @Column("text", { nullable: true })
  description?: string;

  @Column("varchar", { length: 255, nullable: true })
  websiteUrl?: string;

  @Column("varchar", { length: 255, nullable: true })
  logoUrl?: string;

  /**
   * Owner user ID (first administrator)
   * Not a FK (user data in separate system)
   */
  @Column("uuid")
  ownerId!: string;

  // Relationships:
  // Shows, FinanceRecords, Itineraries reference organizationId
  // CASCADE delete configured at database level

  // Audit columns
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  /**
   * Soft delete column
   * Records with deletedAt !== null are considered deleted
   * but data is preserved for recovery/audit
   */
  @DeleteDateColumn()
  deletedAt?: Date;

  /**
   * Hook: Generate slug from name before insert
   * Ensures slug is always derived from name (no mismatches)
   */
  @BeforeInsert()
  generateSlug() {
    if (!this.slug) {
      this.slug = this.slugify(this.name);
    }
  }

  /**
   * Hook: Validate slug format before insert/update
   * Ensures slug can't be manually set to conflicting values
   */
  @BeforeInsert()
  @BeforeUpdate()
  validateSlug() {
    const expectedSlug = this.slugify(this.name);
    if (this.slug !== expectedSlug) {
      throw new Error(
        `Invalid slug. Expected: "${expectedSlug}", Got: "${this.slug}". Slug must be derived from organization name.`
      );
    }
  }

  /**
   * Convert organization name to URL-safe slug
   * 
   * Examples:
   * "Broadway Company" → "broadway-company"
   * "Off-Broadway Ltd." → "off-broadway-ltd"
   * "The BEST Productions!" → "the-best-productions"
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dash
      .replace(/(^-|-$)/g, ""); // Remove leading/trailing dashes
  }
}
