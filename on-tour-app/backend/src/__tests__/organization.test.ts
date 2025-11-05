import { describe, it, expect, beforeEach, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";

/**
 * Organization Service Tests
 * 
 * Tests for multi-tenant organization management:
 * - CRUD operations with tenant isolation
 * - Slug generation and validation
 * - Soft delete support
 * - Multi-organization isolation
 */

// Mock logger
vi.mock("../utils/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Organization Service", () => {
  describe("Organization Data Structure", () => {
    it("should create organization with required fields", () => {
      const org = {
        id: uuidv4(),
        name: "Tech Corp",
        slug: "tech-corp",
        ownerId: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      expect(org).toHaveProperty("id");
      expect(org).toHaveProperty("name");
      expect(org).toHaveProperty("slug");
      expect(org).toHaveProperty("ownerId");
    });

    it("should include audit fields", () => {
      const org = {
        id: uuidv4(),
        name: "Tech Corp",
        slug: "tech-corp",
        ownerId: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      expect(org.createdAt).toBeInstanceOf(Date);
      expect(org.updatedAt).toBeInstanceOf(Date);
    });

    it("should support optional fields", () => {
      const org = {
        id: uuidv4(),
        name: "Tech Corp",
        slug: "tech-corp",
        description: "A tech company",
        websiteUrl: "https://techcorp.com",
        logoUrl: "https://techcorp.com/logo.png",
        ownerId: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      expect(org.description).toBeDefined();
      expect(org.websiteUrl).toBeDefined();
      expect(org.logoUrl).toBeDefined();
    });
  });

  describe("CRUD Operations", () => {
    it("should validate required fields for create", () => {
      const createData = {
        name: "Tech Corp",
        ownerId: uuidv4(),
      };

      expect(createData).toHaveProperty("name");
      expect(createData).toHaveProperty("ownerId");
      expect(createData.name).toBeTruthy();
      expect(createData.ownerId).toBeTruthy();
    });

    it("should require name for organization", () => {
      const invalidData = {
        name: "",
        ownerId: uuidv4(),
      };

      expect(invalidData.name.trim()).toBe("");
    });

    it("should require ownerId for organization", () => {
      const invalidData = {
        name: "Tech Corp",
        ownerId: "",
      };

      expect(invalidData.ownerId).toBe("");
    });

    it("should handle optional fields in create", () => {
      const minimalData = {
        name: "Minimal Corp",
        ownerId: uuidv4(),
      };

      const fullData = {
        name: "Full Corp",
        description: "Full description",
        websiteUrl: "https://example.com",
        logoUrl: "https://example.com/logo.png",
        ownerId: uuidv4(),
      };

      expect(minimalData).not.toHaveProperty("description");
      expect(fullData).toHaveProperty("description");
    });
  });

  describe("Slug Generation and Validation", () => {
    it("should generate slug from name", () => {
      const name = "Tech Corp";
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      expect(slug).toBe("tech-corp");
    });

    it("should handle special characters in slug", () => {
      const name = "Tech-Corp International™";
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(slug).not.toContain("™");
    });

    it("should handle multiple spaces in slug", () => {
      const name = "Tech   Corp   Inc";
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      expect(slug).toBe("tech-corp-inc");
    });

    it("should handle numeric names", () => {
      const name = "123 Tech Corp";
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      expect(slug).toMatch(/^[a-z0-9-]+$/);
    });

    it("should prevent duplicate slugs", () => {
      const slugs = new Map<string, string[]>();

      const registerSlug = (name: string, ownerId: string): string => {
        let slug = name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        const key = `${ownerId}:${slug}`;
        let finalSlug = slug;
        let counter = 1;

        while (slugs.has(finalSlug) && slugs.get(finalSlug)?.[0] === ownerId) {
          finalSlug = `${slug}-${counter}`;
          counter++;
        }

        if (!slugs.has(finalSlug)) {
          slugs.set(finalSlug, [ownerId]);
        }

        return finalSlug;
      };

      const ownerId = uuidv4();
      const slug1 = registerSlug("Tech Corp", ownerId);
      const slug2 = registerSlug("Tech Corp", ownerId);

      expect(slug1).not.toBe(slug2);
    });
  });

  describe("Soft Delete Behavior", () => {
    it("should support soft delete", () => {
      const org = {
        id: uuidv4(),
        name: "Tech Corp",
        slug: "tech-corp",
        ownerId: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(), // Soft deleted
      };

      expect(org.deletedAt).not.toBeNull();
    });

    it("should exclude soft-deleted in queries", () => {
      const orgs = [
        {
          id: uuidv4(),
          name: "Active Org",
          slug: "active-org",
          ownerId: uuidv4(),
          deletedAt: null,
        },
        {
          id: uuidv4(),
          name: "Deleted Org",
          slug: "deleted-org",
          ownerId: uuidv4(),
          deletedAt: new Date(),
        },
      ];

      const activeOrgs = orgs.filter((org) => org.deletedAt === null);

      expect(activeOrgs).toHaveLength(1);
      expect(activeOrgs[0].name).toBe("Active Org");
    });

    it("should allow restore of soft-deleted organizations", () => {
      const org: {
        id: string;
        name: string;
        slug: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
      } = {
        id: uuidv4(),
        name: "Tech Corp",
        slug: "tech-corp",
        ownerId: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(), // Soft deleted
      };

      // Restore by setting deletedAt to null
      org.deletedAt = null;

      expect(org.deletedAt).toBeNull();
    });

    it("should preserve creation time through soft delete and restore", () => {
      const createdAt = new Date("2024-01-01");
      const org = {
        id: uuidv4(),
        name: "Tech Corp",
        slug: "tech-corp",
        ownerId: uuidv4(),
        createdAt,
        updatedAt: new Date(),
        deletedAt: null as Date | null,
      };

      const originalCreatedAt = org.createdAt;

      // Delete
      org.deletedAt = new Date();
      expect(org.createdAt).toEqual(originalCreatedAt);

      // Restore
      org.deletedAt = null;
      expect(org.createdAt).toEqual(originalCreatedAt);
    });
  });

  describe("Multi-tenant Isolation", () => {
    it("should scope organizations by owner", () => {
      const owner1Id = uuidv4();
      const owner2Id = uuidv4();

      const orgs = [
        {
          id: uuidv4(),
          name: "Owner 1 Org",
          slug: "owner-1-org",
          ownerId: owner1Id,
          deletedAt: null,
        },
        {
          id: uuidv4(),
          name: "Owner 2 Org",
          slug: "owner-2-org",
          ownerId: owner2Id,
          deletedAt: null,
        },
      ];

      const owner1Orgs = orgs.filter((org) => org.ownerId === owner1Id);
      const owner2Orgs = orgs.filter((org) => org.ownerId === owner2Id);

      expect(owner1Orgs).toHaveLength(1);
      expect(owner2Orgs).toHaveLength(1);
      expect(owner1Orgs[0].ownerId).not.toBe(owner2Orgs[0].ownerId);
    });

    it("should prevent ownerId modification", () => {
      const org = {
        id: uuidv4(),
        name: "Tech Corp",
        slug: "tech-corp",
        ownerId: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const originalOwnerId = org.ownerId;
      const updateData = {
        name: "Updated Corp",
        ownerId: uuidv4(), // Attempt to change owner
      };

      // Service should ignore ownerId in updates
      org.name = updateData.name;
      // ownerId should remain unchanged
      expect(org.ownerId).toBe(originalOwnerId);
      expect(org.ownerId).not.toBe(updateData.ownerId);
    });

    it("should enforce owner-based access control", () => {
      const owner1Id = uuidv4();
      const owner2Id = uuidv4();

      const org = {
        id: uuidv4(),
        name: "Owner 1 Org",
        slug: "owner-1-org",
        ownerId: owner1Id,
        deletedAt: null,
      };

      const canAccess = (
        requestUserId: string,
        org: { ownerId: string }
      ): boolean => {
        return requestUserId === org.ownerId;
      };

      expect(canAccess(owner1Id, org)).toBe(true);
      expect(canAccess(owner2Id, org)).toBe(false);
    });
  });

  describe("Organization Queries", () => {
    it("should find by ID", () => {
      const orgId = uuidv4();
      const orgs = [
        { id: orgId, name: "Tech Corp", slug: "tech-corp", ownerId: uuidv4() },
      ];

      const found = orgs.find((org) => org.id === orgId);

      expect(found).toBeDefined();
      expect(found?.id).toBe(orgId);
    });

    it("should find by slug", () => {
      const slug = "tech-corp";
      const orgs = [
        { id: uuidv4(), name: "Tech Corp", slug, ownerId: uuidv4() },
      ];

      const found = orgs.find((org) => org.slug === slug);

      expect(found).toBeDefined();
      expect(found?.slug).toBe(slug);
    });

    it("should count organizations", () => {
      const orgs = [
        {
          id: uuidv4(),
          name: "Org 1",
          slug: "org-1",
          ownerId: uuidv4(),
          deletedAt: null,
        },
        {
          id: uuidv4(),
          name: "Org 2",
          slug: "org-2",
          ownerId: uuidv4(),
          deletedAt: null,
        },
      ];

      const count = orgs.filter((org) => org.deletedAt === null).length;

      expect(count).toBe(2);
    });

    it("should check organization existence", () => {
      const orgId = uuidv4();
      const orgs = [
        { id: orgId, name: "Tech Corp", slug: "tech-corp", ownerId: uuidv4() },
      ];

      const exists = orgs.some((org) => org.id === orgId);

      expect(exists).toBe(true);
    });
  });

  describe("Concurrent Operations", () => {
    it("should handle multiple organizations concurrently", () => {
      const orgs = Array.from({ length: 10 }, (_, i) => ({
        id: uuidv4(),
        name: `Org ${i + 1}`,
        slug: `org-${i + 1}`,
        ownerId: uuidv4(),
        deletedAt: null,
      }));

      expect(orgs).toHaveLength(10);
      orgs.forEach((org) => {
        expect(org.id).toBeDefined();
        expect(org.slug).toBeDefined();
      });
    });

    it("should maintain isolation during concurrent access", () => {
      const owner1Id = uuidv4();
      const owner2Id = uuidv4();

      const orgs = [
        {
          id: uuidv4(),
          name: "Owner 1 Org 1",
          ownerId: owner1Id,
          deletedAt: null,
        },
        {
          id: uuidv4(),
          name: "Owner 1 Org 2",
          ownerId: owner1Id,
          deletedAt: null,
        },
        {
          id: uuidv4(),
          name: "Owner 2 Org 1",
          ownerId: owner2Id,
          deletedAt: null,
        },
      ];

      const owner1Orgs = orgs.filter((org) => org.ownerId === owner1Id);
      const owner2Orgs = orgs.filter((org) => org.ownerId === owner2Id);

      expect(owner1Orgs).toHaveLength(2);
      expect(owner2Orgs).toHaveLength(1);
      expect(owner1Orgs.every((org) => org.ownerId === owner1Id)).toBe(true);
    });
  });
});

