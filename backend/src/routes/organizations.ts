import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { tenantMiddleware } from "../middleware/tenantMiddleware.js";
import { organizationService } from "../services/OrganizationService.js";
import { seedProphecyShows, isProphecySeeded } from '../scripts/seedProphecyData.js';
import { logger } from "../utils/logger.js";

const router = Router();

/**
 * Organization API Routes
 *
 * 5 REST endpoints for multi-tenant organization management
 *
 * Security:
 * - All endpoints require authentication (authMiddleware)
 * - Regular users: access to their own org only
 * - Superadmin: cross-org access
 */

/**
 * POST /api/organizations
 * Create new organization
 *
 * Request Body:
 * {
 *   "name": "Broadway Company",
 *   "description": "Optional description",
 *   "websiteUrl": "https://example.com",
 *   "logoUrl": "https://..."
 * }
 */
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, description, websiteUrl, logoUrl } = req.body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({
        error: "Bad request",
        message: "Organization name is required and must be a non-empty string",
      });
    }

    // Create organization
    const organization = await organizationService.create({
      name: name.trim(),
      description,
      websiteUrl,
      logoUrl,
      ownerId: req.context?.userId || req.user?.userId || "",
    });

    logger.info(
      { orgId: organization.id, userId: req.user!.userId },
      "Organization created via API"
    );

    res.status(201).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    logger.error(error, "Failed to create organization");
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create organization",
    });
  }
});

/**
 * GET /api/organizations
 * List organizations
 *
 * Query Params:
 * - limit: Results per page (default: 20)
 * - offset: Pagination offset (default: 0)
 *
 * Behavior:
 * - Superadmin: lists ALL organizations
 * - Regular user: lists THEIR organizations
 */
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

    let result;

    if (req.context?.isSuperAdmin) {
      // Superadmin: all organizations
      result = await organizationService.listAll(limit, offset);
    } else {
      // Regular user: their organizations
      const organizations = await organizationService.listByOwner(
        req.user!.userId
      );
      result = {
        data: organizations.slice(offset, offset + limit),
        total: organizations.length,
      };
    }

    logger.debug(
      {
        userId: req.user!.userId,
        count: result.data.length,
        total: result.total,
      },
      "Organizations listed"
    );

    res.json({
      success: true,
      data: result.data,
      pagination: {
        limit,
        offset,
        total: result.total,
      },
    });
  } catch (error) {
    logger.error(error, "Failed to list organizations");
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to list organizations",
    });
  }
});

/**
 * GET /api/organizations/:id
 * Get specific organization
 *
 * Security:
 * - Superadmin: can access any org
 * - Regular user: can only access their own
 */
router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const organization = await organizationService.getById(id);

    if (!organization) {
      return res.status(404).json({
        error: "Not found",
        message: "Organization not found",
      });
    }

    // Check tenant access
    if (
      !req.context?.isSuperAdmin &&
      organization.ownerId !== req.user!.userId
    ) {
      logger.warn(
        {
          userId: req.user!.userId,
          orgId: id,
          owner: organization.ownerId,
        },
        "Unauthorized organization access attempt"
      );
      return res.status(403).json({
        error: "Forbidden",
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    logger.error(error, "Failed to get organization");
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to get organization",
    });
  }
});

/**
 * PUT /api/organizations/:id
 * Update organization
 *
 * Request Body:
 * {
 *   "name": "New Name",
 *   "description": "...",
 *   "websiteUrl": "...",
 *   "logoUrl": "..."
 * }
 *
 * Note: organizationId cannot be changed (immutable)
 */
router.put("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, websiteUrl, logoUrl } = req.body;

    const organization = await organizationService.getById(id);

    if (!organization) {
      return res.status(404).json({
        error: "Not found",
        message: "Organization not found",
      });
    }

    // Check tenant access
    if (
      !req.context?.isSuperAdmin &&
      organization.ownerId !== req.user!.userId
    ) {
      logger.warn(
        {
          userId: req.user!.userId,
          orgId: id,
        },
        "Unauthorized organization update attempt"
      );
      return res.status(403).json({
        error: "Forbidden",
        message: "Access denied",
      });
    }

    // Update organization
    const updated = await organizationService.update(id, {
      name,
      description,
      websiteUrl,
      logoUrl,
    });

    logger.info(
      { orgId: id, userId: req.user!.userId },
      "Organization updated via API"
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    logger.error(error, "Failed to update organization");
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update organization",
    });
  }
});

/**
 * DELETE /api/organizations/:id
 * Delete organization (soft delete)
 *
 * Data is preserved (soft delete via deletedAt)
 */
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const organization = await organizationService.getById(id);

    if (!organization) {
      return res.status(404).json({
        error: "Not found",
        message: "Organization not found",
      });
    }

    // Check tenant access (only owner or superadmin can delete)
    if (
      !req.context?.isSuperAdmin &&
      organization.ownerId !== req.user!.userId
    ) {
      logger.warn(
        {
          userId: req.user!.userId,
          orgId: id,
        },
        "Unauthorized organization delete attempt"
      );
      return res.status(403).json({
        error: "Forbidden",
        message: "Access denied",
      });
    }

    await organizationService.delete(id);

    logger.info(
      { orgId: id, userId: req.user!.userId },
      "Organization deleted via API"
    );

    res.json({
      success: true,
      message: "Organization deleted",
    });
  } catch (error) {
    logger.error(error, "Failed to delete organization");
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to delete organization",
    });
  }
});

/**
 * POST /api/organizations/:id/seed-prophecy
 * Seed Prophecy shows data for organization
 */
router.post('/:id/seed-prophecy', authMiddleware, async (req: Request, res: Response) => {
  try {
    const organizationId = req.params.id;

    // Check if already seeded
    const alreadySeeded = await isProphecySeeded(organizationId);
    if (alreadySeeded) {
      res.json({ 
        success: true, 
        message: 'Prophecy data already exists',
        seededCount: 0
      });
      return;
    }

    // Seed the data
    const seededCount = await seedProphecyShows(organizationId);

    res.json({
      success: true,
      message: `Successfully seeded ${seededCount} Prophecy shows`,
      seededCount
    });
  } catch (error) {
    logger.error({ error, organizationId: req.params.id }, 'Failed to seed Prophecy data');
    res.status(500).json({ 
      success: false, 
      error: 'Failed to seed Prophecy data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/organizations/:id/prophecy-status
 * Check Prophecy seeding status for organization
 */
router.get('/:id/prophecy-status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const organizationId = req.params.id;
    const isSeeded = await isProphecySeeded(organizationId);

    res.json({
      organizationId,
      isProphecySeeded: isSeeded
    });
  } catch (error) {
    logger.error({ error, organizationId: req.params.id }, 'Failed to check Prophecy status');
    res.status(500).json({ 
      error: 'Failed to check Prophecy status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
