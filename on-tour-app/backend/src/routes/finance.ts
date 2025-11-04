import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

export const financeRouter = Router();

const calculateFeesSchema = z.object({
  showIds: z.string().array().min(1),
  commissionRate: z.number().min(0).max(1).optional(),
  taxRate: z.number().min(0).max(1).optional(),
});

const settlementSchema = z.object({
  showId: z.string(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['bank_transfer', 'check', 'card']),
  notes: z.string().optional(),
});

// GET /api/finance/summary - Get financial summary
financeRouter.get('/summary', async (req: Request, res: Response) => {
  try {
    const organizationId = req.organizationId!;

    // This will be populated from database later
    const summary = {
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      pendingSettlements: 0,
      completedSettlements: 0,
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
    };

    res.json({ data: summary });
  } catch (error) {
    logger.error(error, 'Failed to get financial summary');
    res.status(500).json({ error: 'Failed to get financial summary' });
  }
});

// POST /api/finance/calculate-fees - Calculate fees and commissions
financeRouter.post('/calculate-fees', async (req: Request, res: Response) => {
  try {
    const validated = calculateFeesSchema.parse(req.body);

    // Mock calculation (will integrate with Shows data later)
    const commissionRate = validated.commissionRate || 0.15;
    const taxRate = validated.taxRate || 0.08;

    const calculation = {
      showIds: validated.showIds,
      commissionRate,
      taxRate,
      totalGross: 10000, // Mock value
      commission: 10000 * commissionRate,
      taxes: 10000 * taxRate,
      totalNet: 10000 * (1 - commissionRate) * (1 - taxRate),
      breakdown: validated.showIds.map(id => ({
        showId: id,
        gross: 1000,
        commission: 1000 * commissionRate,
        taxes: 1000 * taxRate,
        net: 1000 * (1 - commissionRate) * (1 - taxRate),
      })),
    };

    res.json({ data: calculation });
  } catch (error) {
    logger.error(error, 'Failed to calculate fees');
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
      return;
    }
    res.status(500).json({ error: 'Failed to calculate fees' });
  }
});

// POST /api/finance/settlement - Create a settlement
financeRouter.post('/settlement', async (req: Request, res: Response) => {
  try {
    const validated = settlementSchema.parse(req.body);

    const settlement = {
      id: `settle_${Date.now()}`,
      organizationId: req.organizationId!,
      ...validated,
      status: 'pending',
      createdAt: new Date().toISOString(),
      createdBy: req.user!.userId,
    };

    res.status(201).json({ data: settlement });
  } catch (error) {
    logger.error(error, 'Failed to create settlement');
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
      return;
    }
    res.status(500).json({ error: 'Failed to create settlement' });
  }
});

// GET /api/finance/settlements - List settlements
financeRouter.get('/settlements', async (req: Request, res: Response) => {
  try {
    const status = (req.query.status as string) || undefined;

    // This will be populated from database later
    const settlements = [];

    res.json({ data: settlements, pagination: { total: 0, limit: 50, offset: 0 } });
  } catch (error) {
    logger.error(error, 'Failed to list settlements');
    res.status(500).json({ error: 'Failed to list settlements' });
  }
});
