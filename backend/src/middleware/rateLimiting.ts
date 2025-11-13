import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Rate Limiter Security Middleware
 * 
 * Protege endpoints críticos contra ataques de fuerza bruta y DoS
 * Complementa al orgRateLimiter existente con protecciones específicas
 */

/**
 * Rate limiter para endpoints de autenticación
 * Más estricto para prevenir ataques de fuerza bruta en login/registro
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP cada 15 minutos
  message: {
    error: 'Demasiados intentos de autenticación',
    message: 'Has excedido el límite de intentos. Intenta de nuevo en 15 minutos.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Incluir headers de rate limit estándar
  legacyHeaders: false, // Desactivar headers X-RateLimit-*
  handler: (req: Request, res: Response) => {
    logger.warn({
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      message: 'Auth rate limit exceeded'
    }, 'Rate limit exceeded on auth endpoint');

    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Has excedido el límite de intentos de autenticación. Intenta de nuevo en 15 minutos.',
      retryAfter: '15 minutes'
    });
  },
  skip: (req) => {
    // Saltar para IPs whitelistadas (opcional)
    const whitelistIPs = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
    return whitelistIPs.includes(req.ip || '');
  }
});

/**
 * Rate limiter general para API endpoints
 * Más permisivo que el auth, para uso general
 */
export const generalRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requests por IP por minuto
  message: {
    error: 'Rate limit exceeded',
    message: 'Has excedido el límite de peticiones por minuto.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn({
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      message: 'General rate limit exceeded'
    }, 'Rate limit exceeded');

    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Has excedido el límite de peticiones por minuto.',
      retryAfter: '1 minute'
    });
  }
});

/**
 * Rate limiter para endpoints de recuperación de contraseña
 * Muy estricto para prevenir spam y ataques
 */
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Solo 3 intentos por hora por IP
  message: {
    error: 'Password reset limit exceeded',
    message: 'Has excedido el límite de solicitudes de recuperación de contraseña. Intenta de nuevo en 1 hora.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn({
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body?.email, // Log email si está disponible
      message: 'Password reset rate limit exceeded'
    }, 'Password reset rate limit exceeded');

    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Has excedido el límite de solicitudes de recuperación de contraseña. Intenta de nuevo en 1 hora.',
      retryAfter: '1 hour'
    });
  }
});

/**
 * Rate limiter para endpoints de registro
 * Previene creación masiva de cuentas
 */
export const registrationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 registros por IP por hora
  message: {
    error: 'Registration limit exceeded',
    message: 'Has excedido el límite de registros por hora. Intenta de nuevo más tarde.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn({
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body?.email,
      message: 'Registration rate limit exceeded'
    }, 'Registration rate limit exceeded');

    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Has excedido el límite de registros por hora. Intenta de nuevo más tarde.',
      retryAfter: '1 hour'
    });
  }
});

/**
 * Configuración global por defecto para rate limiting
 * Puede ser sobrescrita por middlewares específicos
 */
export const defaultRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 requests por IP cada 15 minutos (muy permisivo)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Rate limit exceeded',
    message: 'Has excedido el límite de peticiones. Intenta de nuevo más tarde.'
  }
});