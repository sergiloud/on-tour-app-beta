import { Router } from 'express';
import { ShowsService } from '../services/showsService.js';
import { authMiddleware, asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import type { AuthPayload } from '../types/auth.js';

const router = Router();

// Extend Express Request type for auth context
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// GET /api/shows - List all shows for authenticated user's organization
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req: any, res: any) => {
    const org_id = req.user?.org_id;
    if (!org_id) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    const shows = await ShowsService.listShows(org_id);
    logger.info(`GET /shows - Retrieved ${shows.length} shows for org ${org_id}`);
    return res.json({
      success: true,
      count: shows.length,
      shows,
    });
  })
);

// POST /api/shows - Create a new show
router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: any, res: any) => {
    const org_id = req.user?.org_id;
    const user_id = req.user?.sub;

    if (!org_id || !user_id) {
      return res.status(400).json({ error: 'Organization and user ID required' });
    }

    const { name, venue, city, country, show_date, door_time, show_time, end_time, notes, ticket_url } = req.body;

    if (!name || !show_date) {
      return res.status(400).json({ error: 'Name and show_date are required' });
    }

    const show = await ShowsService.createShow(org_id, user_id, {
      name,
      venue,
      city,
      country,
      show_date,
      door_time,
      show_time,
      end_time,
      notes,
      ticket_url,
    });

    logger.info(`POST /shows - Created show ${show.id}`);
    return res.status(201).json({
      success: true,
      show,
    });
  })
);

// GET /api/shows/:id - Get a specific show
router.get(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;

    const show = await ShowsService.getShow(id);
    logger.info(`GET /shows/${id} - Retrieved show`);
    return res.json({
      success: true,
      show,
    });
  })
);

// PUT /api/shows/:id - Update a show
router.put(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const updates = req.body;

    const show = await ShowsService.updateShow(id, updates);
    logger.info(`PUT /shows/${id} - Updated show`);
    return res.json({
      success: true,
      show,
    });
  })
);

// DELETE /api/shows/:id - Delete a show
router.delete(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;

    await ShowsService.deleteShow(id);
    logger.info(`DELETE /shows/${id} - Deleted show`);
    return res.json({
      success: true,
      message: `Show ${id} deleted successfully`,
    });
  })
);

export const showsRoutes = router;
