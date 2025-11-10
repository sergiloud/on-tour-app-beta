import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { FinanceService } from '../services/FinanceService.js';
import { logger } from '../utils/logger.js';

export const financeRouter = Router();

const financeService = new FinanceService(logger);

const calculateFeesSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  artistPercentage: z.number().min(0).max(100),
  agencyPercentage: z.number().min(0).max(100),
  taxPercentage: z.number().min(0).max(100),
});

const currencyConversionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  from: z.string().min(1),
  to: z.string().min(1),
});

const settlementSchema = z.object({
  showId: z.string().uuid(),
  participants: z.array(z.object({
    participantId: z.string().uuid(),
    name: z.string().min(1),
    percentage: z.number().min(0).max(100),
  })).min(1),
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

    const breakdown = financeService.calculateFees(
      validated.amount,
      validated.artistPercentage,
      validated.agencyPercentage,
      validated.taxPercentage
    );

    res.json({ data: breakdown });
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

// POST /api/finance/convert-currency - Convert currency
financeRouter.post('/convert-currency', async (req: Request, res: Response) => {
  try {
    const validated = currencyConversionSchema.parse(req.body);

    const conversion = financeService.convertCurrency(
      validated.amount,
      validated.from,
      validated.to
    );

    res.json({ data: conversion });
  } catch (error) {
    logger.error(error, 'Failed to convert currency');
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
      return;
    }
    res.status(500).json({ error: 'Failed to convert currency' });
  }
});

// POST /api/finance/settlement - Create a settlement calculation
financeRouter.post('/settlement', async (req: Request, res: Response) => {
  try {
    const validated = settlementSchema.parse(req.body);

    const breakdown = await financeService.calculateSettlement(
      validated.showId,
      validated.participants
    );

    res.status(201).json({ data: breakdown });
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
    const settlements: any[] = [];

    res.json({ data: settlements, pagination: { total: 0, limit: 50, offset: 0 } });
  } catch (error) {
    logger.error(error, 'Failed to list settlements');
    res.status(500).json({ error: 'Failed to list settlements' });
  }
});
