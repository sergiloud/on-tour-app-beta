import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const status = (err as ApiError).status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error({ error: err, status }, 'Request failed');

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  res.status(status).json({
    error: message,
    code: (err as ApiError).code,
    status,
  });
}
