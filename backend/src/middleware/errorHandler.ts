import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { verifyToken } from '../utils/jwt.js';
import type { AuthPayload } from '../types/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error({ err, path: (req as any).path }, 'Error handler invoked');

  if (err instanceof AppError) {
    (res as any).status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  (res as any).status(500).json({
    error: {
      message: err.message || 'Internal Server Error',
      statusCode: 500,
    },
  });
};

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// JWT authentication middleware
export const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = (req as any).headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Missing or invalid authorization header', 401);
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    (req as any).user = payload;
    next();
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
});
