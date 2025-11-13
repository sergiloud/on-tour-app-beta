import { body, param, query, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';

/**
 * Middleware de Validación de Entrada
 * 
 * Proporciona validaciones robustas para endpoints críticos
 * Usa express-validator para sanitización y validación
 */

/**
 * Middleware para manejar errores de validación
 * Debe ser usado después de las reglas de validación
 */
export const handleValidationErrors = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));

    logger.warn({
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      errors: formattedErrors,
      body: req.body // Log del body para debug (cuidado con datos sensibles)
    }, 'Validation errors');

    res.status(400).json({
      error: 'Validation Error',
      message: 'Los datos proporcionados no son válidos',
      details: formattedErrors
    });
    return;
  }

  next();
};

/**
 * Validaciones para autenticación (login)
 */
export const validateLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('El email no puede exceder 255 caracteres'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
];

/**
 * Validaciones para registro de usuario
 */
export const validateRegistration: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('El email no puede exceder 255 caracteres'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('organizationName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre de la organización debe tener entre 2 y 100 caracteres'),
];

/**
 * Validaciones para recuperación de contraseña
 */
export const validatePasswordReset: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('El email no puede exceder 255 caracteres'),
];

/**
 * Validaciones para cambio de contraseña
 */
export const validatePasswordChange: ValidationChain[] = [
  body('currentPassword')
    .isLength({ min: 1 })
    .withMessage('Debe proporcionar la contraseña actual'),
  
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('La nueva contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('La nueva contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
];

/**
 * Validaciones para parámetros de ID
 */
export const validateId = (paramName: string = 'id'): ValidationChain[] => [
  param(paramName)
    .isUUID()
    .withMessage(`El parámetro ${paramName} debe ser un UUID válido`),
];

/**
 * Validaciones para datos de show/evento
 */
export const validateShowData: ValidationChain[] = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('El título debe tener entre 1 y 200 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  
  body('date')
    .isISO8601()
    .withMessage('La fecha debe estar en formato ISO 8601'),
  
  body('venue')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('El venue debe tener entre 1 y 200 caracteres'),
  
  body('ticketPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio del ticket debe ser un número positivo'),
  
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La capacidad debe ser un número entero positivo'),
];

/**
 * Validaciones para datos financieros
 */
export const validateFinancialData: ValidationChain[] = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('El monto debe ser un número positivo'),
  
  body('currency')
    .isLength({ min: 3, max: 3 })
    .withMessage('La moneda debe ser un código de 3 letras')
    .matches(/^[A-Z]{3}$/)
    .withMessage('La moneda debe estar en mayúsculas'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('La descripción debe tener entre 1 y 500 caracteres'),
  
  body('category')
    .isIn(['income', 'expense', 'investment'])
    .withMessage('La categoría debe ser income, expense o investment'),
];

/**
 * Validaciones para paginación
 */
export const validatePagination: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),
  
  query('sort')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('El orden debe ser asc o desc'),
];

/**
 * Validaciones para filtros de fecha
 */
export const validateDateFilters: ValidationChain[] = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe estar en formato ISO 8601'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fin debe estar en formato ISO 8601')
    .custom((value, { req }) => {
      if (value && req.query?.startDate && new Date(value) < new Date(req.query.startDate as string)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
];

/**
 * Sanitización general para prevenir XSS
 */
export const sanitizeHtml: ValidationChain[] = [
  body('*')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        // Escapar caracteres HTML peligrosos
        return value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      }
      return value;
    }),
];