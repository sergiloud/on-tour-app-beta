import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractToken, JwtPayload } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      organizationId?: string;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      res.status(401).json({ error: 'Missing authorization token' });
      return;
    }

    const payload = verifyToken(token);
    req.user = payload;
    req.organizationId = payload.organizationId;

    logger.debug({ userId: payload.userId, organizationId: payload.organizationId }, 'User authenticated');
    next();
  } catch (error) {
    logger.error(error, 'Authentication failed');
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req.headers.authorization);

    if (token) {
      const payload = verifyToken(token);
      req.user = payload;
      req.organizationId = payload.organizationId;
    }

    next();
  } catch (error) {
    logger.warn(error, 'Optional authentication failed, continuing without auth');
    next();
  }
}
