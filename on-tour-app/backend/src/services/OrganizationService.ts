import { Repository, IsNull } from "typeorm";
import { Organization } from "../database/entities/Organization.js";
import { AppDataSource } from "../database/datasource.js";
import { logger } from "../utils/logger.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Organization Service
 * 
 * Handles CRUD operations for organizations
 * Implements multi-tenant isolation
 * Provides utility methods for tenant management
 */
export class OrganizationService {
  private organizationRepository: Repository<Organization>;

  constructor() {
    this.organizationRepository = AppDataSource.getRepository(Organization);
  }

  /**
   * Create new organization
   * 
   * @param createData Organization data including ownerId
   * @returns Created organization
   */
  async create(createData: {
    name: string;
    description?: string;
    websiteUrl?: string;
    logoUrl?: string;
    ownerId: string;
  }): Promise<Organization> {
    try {
      const organization = new Organization();
      organization.id = uuidv4();
      organization.name = createData.name;
      organization.description = createData.description;
      organization.websiteUrl = createData.websiteUrl;
      organization.logoUrl = createData.logoUrl;
      organization.ownerId = createData.ownerId;
      
      // Hooks will generate and validate slug
      const saved = await this.organizationRepository.save(organization);

      logger.info(
        { orgId: saved.id, name: saved.name, slug: saved.slug },
        "Organization created"
      );

      return saved;
    } catch (error) {
      logger.error(error, "Failed to create organization");
      throw error;
    }
  }

  /**
   * Get organization by ID
   * 
   * @param id Organization ID
   * @param includeDeleted Include soft-deleted orgs (default: false)
   * @returns Organization or null
   */
  async getById(id: string, includeDeleted: boolean = false): Promise<Organization | null> {
    try {
      let query = this.organizationRepository.createQueryBuilder("org")
        .where("org.id = :id", { id });

      if (!includeDeleted) {
        query = query.andWhere("org.deletedAt IS NULL");
      }

      return await query.getOne() || null;
    } catch (error) {
      logger.error(error, "Failed to get organization");
      throw error;
    }
  }

  /**
   * Get organization by slug
   * 
   * @param slug Organization slug (URL-friendly name)
   * @returns Organization or null
   */
  async getBySlug(slug: string): Promise<Organization | null> {
    try {
      return await this.organizationRepository.findOne({
        where: {
          slug,
          deletedAt: IsNull(),
        },
      });
    } catch (error) {
      logger.error(error, "Failed to get organization by slug");
      throw error;
    }
  }

  /**
   * List all organizations (admin only)
   * 
   * @param limit Results per page
   * @param offset Pagination offset
   * @returns Organizations list
   */
  async listAll(
    limit: number = 20,
    offset: number = 0
  ): Promise<{ data: Organization[]; total: number }> {
    try {
      const [data, total] = await this.organizationRepository
        .createQueryBuilder("org")
        .where("org.deletedAt IS NULL")
        .orderBy("org.createdAt", "DESC")
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      return { data, total };
    } catch (error) {
      logger.error(error, "Failed to list organizations");
      throw error;
    }
  }

  /**
   * List organizations for owner (user's own organizations)
   * 
   * @param ownerId Owner user ID
   * @returns Organizations owned by user
   */
  async listByOwner(ownerId: string): Promise<Organization[]> {
    try {
      return await this.organizationRepository.find({
        where: {
          ownerId,
          deletedAt: IsNull(),
        },
        order: {
          createdAt: "DESC",
        },
      });
    } catch (error) {
      logger.error(error, "Failed to list organizations by owner");
      throw error;
    }
  }

  /**
   * Update organization
   * 
   * @param id Organization ID
   * @param data Fields to update
   * @returns Updated organization
   */
  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      websiteUrl?: string;
      logoUrl?: string;
    }
  ): Promise<Organization> {
    try {
      const organization = await this.getById(id);
      if (!organization) {
        throw new Error("Organization not found");
      }

      // Update fields
      if (data.name !== undefined) {
        organization.name = data.name;
        // Hook will regenerate slug
      }
      if (data.description !== undefined) {
        organization.description = data.description;
      }
      if (data.websiteUrl !== undefined) {
        organization.websiteUrl = data.websiteUrl;
      }
      if (data.logoUrl !== undefined) {
        organization.logoUrl = data.logoUrl;
      }

      const updated = await this.organizationRepository.save(organization);

      logger.info(
        { orgId: id, changes: Object.keys(data) },
        "Organization updated"
      );

      return updated;
    } catch (error) {
      logger.error(error, "Failed to update organization");
      throw error;
    }
  }

  /**
   * Delete organization (soft delete)
   * 
   * Data is preserved for recovery
   * CASCADE delete configured at DB level
   * 
   * @param id Organization ID
   */
  async delete(id: string): Promise<void> {
    try {
      const organization = await this.getById(id);
      if (!organization) {
        throw new Error("Organization not found");
      }

      organization.deletedAt = new Date();
      await this.organizationRepository.save(organization);

      logger.info({ orgId: id }, "Organization soft deleted");
    } catch (error) {
      logger.error(error, "Failed to delete organization");
      throw error;
    }
  }

  /**
   * Restore soft-deleted organization
   * 
   * @param id Organization ID
   * @returns Restored organization
   */
  async restore(id: string): Promise<Organization> {
    try {
      const organization = await this.getById(id, true); // include deleted
      if (!organization) {
        throw new Error("Organization not found");
      }

      organization.deletedAt = undefined;
      const restored = await this.organizationRepository.save(organization);

      logger.info({ orgId: id }, "Organization restored");

      return restored;
    } catch (error) {
      logger.error(error, "Failed to restore organization");
      throw error;
    }
  }

  /**
   * Count organizations (admin metrics)
   * 
   * @returns Total active organizations
   */
  async count(): Promise<number> {
    try {
      return await this.organizationRepository.count({
        where: { deletedAt: IsNull() },
      });
    } catch (error) {
      logger.error(error, "Failed to count organizations");
      throw error;
    }
  }

  /**
   * Verify organization exists and is active
   * 
   * @param id Organization ID
   * @returns true if exists and not deleted
   */
  async exists(id: string): Promise<boolean> {
    const org = await this.getById(id);
    return org !== null;
  }
}

// Singleton instance
export const organizationService = new OrganizationService();
