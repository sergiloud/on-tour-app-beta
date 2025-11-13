import { Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken, getFirebaseUser, isFirebaseAvailable } from '../config/firebase.js';
import { AppError, CommonErrors } from './errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Extended Request interface with Firebase user context
 */
export interface FirebaseAuthRequest extends Request {
  firebaseUser?: {
    uid: string;
    email?: string;
    emailVerified?: boolean;
    displayName?: string;
    photoURL?: string;
    customClaims?: Record<string, any>;
  };
}

/**
 * Middleware de autenticación con Firebase Auth
 * 
 * Verifica el token JWT de Firebase y añade la información del usuario al request
 */
export async function firebaseAuthMiddleware(
  req: FirebaseAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Verificar si Firebase está disponible
    if (!isFirebaseAvailable()) {
      logger.warn('Firebase not available - authentication disabled');
      throw CommonErrors.UnauthorizedError('Authentication service unavailable');
    }

    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw CommonErrors.UnauthorizedError('Authorization header missing');
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!token) {
      throw CommonErrors.UnauthorizedError('Token missing');
    }

    // Verificar token con Firebase
    const decodedToken = await verifyFirebaseToken(token);
    if (!decodedToken) {
      throw CommonErrors.UnauthorizedError('Invalid or expired token');
    }

    // Obtener información completa del usuario
    const userRecord = await getFirebaseUser(decodedToken.uid);
    if (!userRecord) {
      throw CommonErrors.UnauthorizedError('User not found');
    }

    // Verificar si el usuario está habilitado
    if (userRecord.disabled) {
      throw CommonErrors.ForbiddenError('User account is disabled');
    }

    // Añadir información del usuario al request
    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified || false,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      customClaims: decodedToken.custom_claims || {}
    };

    // Log de autenticación exitosa
    logger.debug({
      uid: decodedToken.uid,
      email: decodedToken.email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl
    }, 'Firebase authentication successful');

    next();

  } catch (error) {
    // Si es un error conocido, pasarlo tal como está
    if (error instanceof AppError) {
      next(error);
      return;
    }

    // Log del error de autenticación
    logger.warn({
      error: error instanceof Error ? error.message : String(error),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      authHeader: req.headers.authorization ? 'present' : 'missing'
    }, 'Firebase authentication failed');

    // Error genérico de autenticación
    next(CommonErrors.UnauthorizedError('Authentication failed'));
  }
}

/**
 * Middleware opcional de autenticación Firebase
 * No falla si no hay token, pero lo verifica si está presente
 */
export async function optionalFirebaseAuth(
  req: FirebaseAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  
  // Si no hay token, continuar sin autenticación
  if (!authHeader || !isFirebaseAvailable()) {
    next();
    return;
  }

  // Si hay token, intentar verificarlo
  try {
    await firebaseAuthMiddleware(req, res, next);
  } catch (error) {
    // En modo opcional, continuar incluso si la autenticación falla
    logger.debug('Optional Firebase auth failed, continuing without auth');
    next();
  }
}

/**
 * Middleware que requiere email verificado
 */
export function requireEmailVerified(
  req: FirebaseAuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.firebaseUser) {
    next(CommonErrors.UnauthorizedError('Authentication required'));
    return;
  }

  if (!req.firebaseUser.emailVerified) {
    next(CommonErrors.ForbiddenError('Email verification required'));
    return;
  }

  next();
}

/**
 * Middleware que requiere claims específicos
 */
export function requireCustomClaims(requiredClaims: string[]) {
  return (req: FirebaseAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.firebaseUser) {
      next(CommonErrors.UnauthorizedError('Authentication required'));
      return;
    }

    const userClaims = req.firebaseUser.customClaims || {};
    
    for (const claim of requiredClaims) {
      if (!userClaims[claim]) {
        logger.warn({
          uid: req.firebaseUser.uid,
          requiredClaim: claim,
          userClaims: Object.keys(userClaims)
        }, 'User missing required custom claim');
        
        next(CommonErrors.ForbiddenError(`Missing required permission: ${claim}`));
        return;
      }
    }

    next();
  };
}

/**
 * Middleware que requiere rol de admin
 */
export function requireAdmin(
  req: FirebaseAuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.firebaseUser) {
    next(CommonErrors.UnauthorizedError('Authentication required'));
    return;
  }

  const customClaims = req.firebaseUser.customClaims || {};
  
  if (!customClaims.admin && !customClaims.superAdmin) {
    logger.warn({
      uid: req.firebaseUser.uid,
      claims: Object.keys(customClaims)
    }, 'Non-admin user attempted to access admin endpoint');
    
    next(CommonErrors.ForbiddenError('Admin access required'));
    return;
  }

  next();
}

/**
 * Helper para obtener el usuario Firebase del request
 */
export function getFirebaseUserFromRequest(req: FirebaseAuthRequest) {
  return req.firebaseUser || null;
}

/**
 * Helper para verificar si el usuario está autenticado
 */
export function isAuthenticated(req: FirebaseAuthRequest): boolean {
  return !!req.firebaseUser;
}

/**
 * Helper para verificar si el usuario es admin
 */
export function isAdmin(req: FirebaseAuthRequest): boolean {
  if (!req.firebaseUser) return false;
  
  const claims = req.firebaseUser.customClaims || {};
  return !!(claims.admin || claims.superAdmin);
}

/**
 * Helper para verificar si el usuario es el mismo o es admin
 */
export function isOwnerOrAdmin(req: FirebaseAuthRequest, resourceUserId: string): boolean {
  if (!req.firebaseUser) return false;
  
  // Es el propietario del recurso
  if (req.firebaseUser.uid === resourceUserId) return true;
  
  // Es admin
  return isAdmin(req);
}