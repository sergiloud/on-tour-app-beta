import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ShowsService, CreateShowInput, UpdateShowInput } from '../services/showsService.js';
import { logger } from '../utils/logger.js';

export const showsRouter = Router();

const createShowSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().min(1).max(255),
  budget: z.number().positive().optional(),
});

const updateShowSchema = createShowSchema.partial();

// GET /api/shows - List all shows
showsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const status = (req.query.status as string) || undefined;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    const result = await ShowsService.listShows(req.organizationId!, {
      status,
      limit,
      offset,
    });

    res.json({
      data: result.shows,
      pagination: { total: result.total, limit, offset },
    });
  } catch (error) {
    logger.error(error, 'Failed to list shows');
    res.status(500).json({ error: 'Failed to list shows' });
  }
});

// POST /api/shows - Create a new show
showsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validated = createShowSchema.parse(req.body);
    const show = await ShowsService.createShow(
      req.organizationId!,
      req.user!.userId,
      validated as CreateShowInput
    );

    res.status(201).json({ data: show });
  } catch (error) {
    logger.error(error, 'Failed to create show');
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }
    res.status(500).json({ error: 'Failed to create show' });
  }
});

// GET /api/shows/:id - Get a specific show
showsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const show = await ShowsService.getShow(req.organizationId!, req.params.id);

    if (!show) {
      res.status(404).json({ error: 'Show not found' });
      return;
    }

    res.json({ data: show });
  } catch (error) {
    logger.error(error, 'Failed to get show');
    res.status(500).json({ error: 'Failed to get show' });
  }
});

// PUT /api/shows/:id - Update a show
showsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const validated = updateShowSchema.parse(req.body);
    const show = await ShowsService.updateShow(
      req.organizationId!,
      req.params.id,
      validated as UpdateShowInput
    );

    res.json({ data: show });
  } catch (error) {
    logger.error(error, 'Failed to update show');
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }
    if ((error as Error).message === 'Show not found') {
      res.status(404).json({ error: 'Show not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to update show' });
  }
});

// DELETE /api/shows/:id - Delete a show
showsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await ShowsService.deleteShow(req.organizationId!, req.params.id);
    res.status(204).send();
  } catch (error) {
    logger.error(error, 'Failed to delete show');
    if ((error as Error).message === 'Show not found') {
      res.status(404).json({ error: 'Show not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete show' });
  }
});
