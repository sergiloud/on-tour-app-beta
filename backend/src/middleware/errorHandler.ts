import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';
import { ValidationError } from 'express-validator';

/**
 * Interfaz extendida para errores de API con más metadatos
 */
export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
  isOperational?: boolean; // Distinguir errores operacionales de bugs
}

/**
 * Clase personalizada para errores de aplicación
 */
export class AppError extends Error implements ApiError {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly isOperational: boolean = true;

  constructor(
    message: string, 
    status: number = 500, 
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    
    // Mantener el stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Errores predefinidos comunes
 */
export const CommonErrors = {
  ValidationError: (details?: any) => new AppError(
    'Los datos proporcionados no son válidos', 
    400, 
    'VALIDATION_ERROR',
    details
  ),
  
  UnauthorizedError: (message = 'Acceso no autorizado') => new AppError(
    message,
    401,
    'UNAUTHORIZED'
  ),
  
  ForbiddenError: (message = 'Acceso prohibido') => new AppError(
    message,
    403,
    'FORBIDDEN'
  ),
  
  NotFoundError: (resource = 'Recurso') => new AppError(
    `${resource} no encontrado`,
    404,
    'NOT_FOUND'
  ),
  
  ConflictError: (message = 'Conflicto con el estado actual del recurso') => new AppError(
    message,
    409,
    'CONFLICT'
  ),
  
  RateLimitError: () => new AppError(
    'Demasiadas peticiones. Intenta de nuevo más tarde.',
    429,
    'RATE_LIMIT_EXCEEDED'
  ),
  
  DatabaseError: () => new AppError(
    'Error interno del servidor',
    500,
    'DATABASE_ERROR'
  )
};

/**
 * Determinar si es un error de producción (no mostrar stack trace)
 */
function isProductionError(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Sanitizar mensaje de error para producción
 */
function sanitizeErrorMessage(err: Error | ApiError, status: number): string {
  // En producción, no exponer detalles internos para errores 5xx
  if (isProductionError() && status >= 500) {
    return 'Error interno del servidor';
  }
  
  return err.message || 'Error interno del servidor';
}

/**
 * Formatear respuesta de error consistente
 */
function formatErrorResponse(
  err: Error | ApiError,
  req: Request,
  includeStack: boolean = false
) {
  const apiError = err as ApiError;
  const status = apiError.status || 500;
  const code = apiError.code || 'INTERNAL_ERROR';
  const message = sanitizeErrorMessage(err, status);

  const response: any = {
    error: {
      message,
      code,
      status,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    }
  };

  // Incluir detalles adicionales si están disponibles
  if (apiError.details) {
    response.error.details = apiError.details;
  }

  // Incluir stack trace solo en desarrollo
  if (includeStack && !isProductionError()) {
    response.error.stack = err.stack;
  }

  return response;
}

/**
 * Middleware principal de manejo de errores
 * Debe ser el último middleware en la cadena
 */
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Si la respuesta ya fue enviada, delegar a Express
  if (res.headersSent) {
    return next(err);
  }

  const apiError = err as ApiError;
  const status = apiError.status || 500;
  
  // Log del error con contexto completo
  const logContext = {
    error: {
      message: err.message,
      stack: err.stack,
      code: apiError.code,
      status,
      isOperational: apiError.isOperational
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.context?.userId,
      organizationId: req.context?.organizationId
    }
  };

  // Log según la severidad del error
  if (status >= 500) {
    logger.error(logContext, 'Server error occurred');
  } else if (status >= 400) {
    logger.warn(logContext, 'Client error occurred');
  } else {
    logger.info(logContext, 'Request completed with error');
  }

  // Manejo específico para diferentes tipos de error
  
  // Errores de validación con Zod
  if (err instanceof ZodError) {
    const validationDetails = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code
    }));

    res.status(400).json({
      error: {
        message: 'Los datos proporcionados no son válidos',
        code: 'VALIDATION_ERROR',
        status: 400,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method,
        details: validationDetails
      }
    });
    return;
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json(
      formatErrorResponse(
        new AppError('Token inválido', 401, 'INVALID_TOKEN'),
        req
      )
    );
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json(
      formatErrorResponse(
        new AppError('Token expirado', 401, 'TOKEN_EXPIRED'),
        req
      )
    );
    return;
  }

  // Errores de base de datos (no exponer en producción)
  if (err.message?.includes('duplicate key') || err.message?.includes('UNIQUE constraint')) {
    res.status(409).json(
      formatErrorResponse(
        new AppError('El recurso ya existe', 409, 'DUPLICATE_RESOURCE'),
        req
      )
    );
    return;
  }

  // Error genérico
  const response = formatErrorResponse(err, req, !isProductionError());
  res.status(status).json(response);
}

/**
 * Middleware para capturar errores 404 (rutas no encontradas)
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = new AppError(
    `Ruta ${req.originalUrl} no encontrada`,
    404,
    'ROUTE_NOT_FOUND'
  );
  
  next(error);
}

/**
 * Helper para crear errores async sin try-catch
 */
export function asyncErrorHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return (...args: T): Promise<R> => {
    const [req, res, next] = args as any[];
    return Promise.resolve(fn(...args)).catch(next);
  };
}
