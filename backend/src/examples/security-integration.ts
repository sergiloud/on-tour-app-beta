/**
 * EJEMPLO DE USO - Middlewares de Seguridad
 * 
 * Este archivo muestra cómo integrar los nuevos middlewares de seguridad
 * en las rutas del backend para máxima protección.
 * 
 * ⚠️  IMPORTANTE: Este archivo contiene ejemplos con funciones dummy
 * Los errores de TypeScript son esperados. Para implementación real,
 * ver: src/routes/auth.ts
 * 
 * ORDEN CORRECTO de middlewares:
 * 1. Rate limiting (por IP)
 * 2. Validación de entrada
 * 3. Manejo de errores de validación
 * 4. Rate limiting organizacional (existente)
 * 5. Autenticación/autorización
 * 6. Lógica de negocio
 * 7. Manejo de errores global
 */

import express from 'express';
import {
  authRateLimit,
  registrationRateLimit,
  passwordResetRateLimit,
  generalRateLimit
} from '../middleware/rateLimiting.js';

import {
  validateLogin,
  validateRegistration,
  validatePasswordReset,
  validatePasswordChange,
  validateId,
  handleValidationErrors
} from '../middleware/validation.js';

import { errorHandler, notFoundHandler, AppError, CommonErrors } from '../middleware/errorHandler.js';

const router = express.Router();

// EJEMPLO 1: Endpoint de Login con máxima seguridad
router.post('/auth/login',
  // 1. Rate limiting estricto para login
  authRateLimit,
  
  // 2. Validación de entrada
  ...validateLogin,
  
  // 3. Manejo de errores de validación
  handleValidationErrors,
  
  // 4. Controlador principal
  async (req, res, next) => {
    try {
      // Lógica de login aquí...
      const { email, password } = req.body;
      
      // Ejemplo de uso del nuevo sistema de errores
      const user = await findUserByEmail(email);
      if (!user) {
        throw CommonErrors.UnauthorizedError('Credenciales inválidas');
      }
      
      const isValidPassword = await validatePassword(password, user.password);
      if (!isValidPassword) {
        throw CommonErrors.UnauthorizedError('Credenciales inválidas');
      }
      
      // Generar JWT y responder
      const token = generateJWT(user);
      res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
      
    } catch (error) {
      next(error); // El errorHandler se encarga del resto
    }
  }
);

// EJEMPLO 2: Endpoint de Registro
router.post('/auth/register',
  // 1. Rate limiting para registro
  registrationRateLimit,
  
  // 2. Validación completa de datos
  ...validateRegistration,
  
  // 3. Manejo de errores de validación
  handleValidationErrors,
  
  // 4. Controlador
  async (req, res, next) => {
    try {
      const { email, password, name, organizationName } = req.body;
      
      // Verificar si el usuario ya existe
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        throw CommonErrors.ConflictError('El email ya está registrado');
      }
      
      // Crear usuario...
      const user = await createUser({ email, password, name, organizationName });
      
      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: { id: user.id, email: user.email, name: user.name }
      });
      
    } catch (error) {
      next(error);
    }
  }
);

// EJEMPLO 3: Endpoint de Recuperación de Contraseña
router.post('/auth/forgot-password',
  // Rate limiting muy estricto
  passwordResetRateLimit,
  
  // Validación de email
  ...validatePasswordReset,
  handleValidationErrors,
  
  async (req, res, next) => {
    try {
      const { email } = req.body;
      
      // Buscar usuario (no revelar si existe o no por seguridad)
      const user = await findUserByEmail(email);
      if (user) {
        await sendPasswordResetEmail(user);
      }
      
      // Respuesta genérica por seguridad
      res.json({
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
      });
      
    } catch (error) {
      next(error);
    }
  }
);

// EJEMPLO 4: Endpoint protegido con validación de ID
router.get('/shows/:id',
  // Rate limiting general
  generalRateLimit,
  
  // Validación de parámetro ID
  ...validateId('id'),
  handleValidationErrors,
  
  // Middleware de autenticación (existente)
  authenticate,
  
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const show = await findShowById(id);
      if (!show) {
        throw CommonErrors.NotFoundError('Show');
      }
      
      // Verificar permisos organizacionales
      if (show.organizationId !== req.context?.organizationId && !req.context?.isSuperAdmin) {
        throw CommonErrors.ForbiddenError('No tienes permisos para acceder a este show');
      }
      
      res.json(show);
      
    } catch (error) {
      next(error);
    }
  }
);

// EJEMPLO 5: Integración en el app principal
export function setupSecurityMiddlewares(app: express.Application) {
  // 1. Rate limiting global como fallback
  app.use(generalRateLimit);
  
  // 2. Middlewares específicos en rutas
  app.use('/api', router);
  
  // 3. Manejo de rutas no encontradas
  app.use(notFoundHandler);
  
  // 4. Manejo de errores global (DEBE SER EL ÚLTIMO)
  app.use(errorHandler);
}

// Funciones dummy para el ejemplo (reemplazar con implementaciones reales)
async function findUserByEmail(email: string) { /* ... */ }
async function validatePassword(password: string, hash: string) { /* ... */ }
async function createUser(userData: any) { /* ... */ }
async function sendPasswordResetEmail(user: any) { /* ... */ }
async function findShowById(id: string) { /* ... */ }
function generateJWT(user: any) { /* ... */ }
function authenticate(req: any, res: any, next: any) { /* ... */ }

export default router;