import { Router } from 'express';
import { 
  authRateLimit, 
  registrationRateLimit, 
  passwordResetRateLimit 
} from '../middleware/rateLimiting.js';
import {
  validateLogin,
  validateRegistration,
  validatePasswordReset,
  validatePasswordChange,
  handleValidationErrors
} from '../middleware/validation.js';
import { asyncErrorHandler, AppError, CommonErrors } from '../middleware/errorHandler.js';
import { 
  firebaseAuthMiddleware, 
  requireEmailVerified,
  requireAdmin,
  FirebaseAuthRequest
} from '../middleware/firebaseAuth.js';
import { 
  createFirebaseUser, 
  getFirebaseUser,
  isFirebaseAvailable,
  getAuth as getFirebaseAuth,
  getFirestore
} from '../config/firebase.js';
import admin from 'firebase-admin';
import { logger } from '../utils/logger.js';
import { EmailService } from '../services/EmailService.js';

const router = Router();

/**
 * Authentication Routes with Enhanced Security
 * 
 * Features:
 * - Rate limiting per endpoint type
 * - Input validation with express-validator  
 * - Centralized error handling
 * - Comprehensive logging
 * - Standardized responses
 */

/**
 * POST /api/auth/login
 * User authentication with maximum security
 */
router.post('/login',
  // 1. Rate limiting: 5 intentos cada 15 minutos por IP
  authRateLimit,
  
  // 2. Validación de entrada: email válido + contraseña fuerte
  ...validateLogin,
  handleValidationErrors,
  
  // 3. Controlador con Firebase Auth
  asyncErrorHandler(async (req, res) => {
    const { email, password } = req.body;
    
    logger.info({ email, ip: req.ip }, 'Login attempt via backend');
    
    // NOTA: En Firebase Auth, el login normalmente se hace desde el frontend
    // Este endpoint es principalmente para casos especiales o administración
    
    if (!isFirebaseAvailable()) {
      throw CommonErrors.UnauthorizedError('Authentication service unavailable');
    }

    // Para login backend, necesitarías crear un custom token
    // o usar Firebase Admin SDK para verificar credenciales
    
    // Por seguridad, recomendamos hacer login desde el frontend
    // y solo usar este endpoint para verificar el estado del usuario
    
    res.json({
      success: true,
      message: 'Login should be performed on the frontend using Firebase Auth SDK',
      hint: 'Use signInWithEmailAndPassword() from firebase/auth on the client side'
    });
    
    logger.info({ email }, 'Login guidance provided');
  })
);

/**
 * POST /api/auth/register
 * User registration with protection against spam
 */
router.post('/register',
  // 1. Rate limiting: 5 registros por hora por IP
  registrationRateLimit,
  
  // 2. Validación completa de registro
  ...validateRegistration,
  handleValidationErrors,
  
  // 3. Controlador con Firebase User Creation
  asyncErrorHandler(async (req, res) => {
    const { email, password, name, organizationName } = req.body;
    
    logger.info({ email, ip: req.ip }, 'Backend registration attempt');
    
    if (!isFirebaseAvailable()) {
      throw CommonErrors.UnauthorizedError('Authentication service unavailable');
    }

    // Crear usuario en Firebase
    const userRecord = await createFirebaseUser({
      email,
      password,
      displayName: name,
      disabled: false
    });

    if (!userRecord) {
      throw CommonErrors.ConflictError('Failed to create user - email may already exist');
    }

    // Crear documento de usuario en Firestore con datos adicionales
    try {
      const firestore = getFirestore();
      await firestore.collection('users').doc(userRecord.uid).set({
        email: userRecord.email,
        displayName: name || email.split('@')[0],
        organizationName: organizationName || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        emailVerified: false,
        role: 'user',
        settings: {
          language: 'en',
          currency: 'USD',
          theme: 'dark'
        },
        metadata: {
          signupIp: req.ip,
          userAgent: req.headers['user-agent'] || 'unknown'
        }
      });
      logger.info({ uid: userRecord.uid }, 'User document created in Firestore');
    } catch (firestoreError) {
      logger.error({ uid: userRecord.uid, error: firestoreError }, 'Failed to create Firestore document');
      // No fallar el registro si Firestore falla, ya que el usuario Auth está creado
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully. Please verify your email.',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified
      }
    });
    
    logger.info({ 
      uid: userRecord.uid, 
      email: userRecord.email 
    }, 'Firebase user created successfully');
  })
);

/**
 * POST /api/auth/forgot-password
 * Password reset request with strict limiting
 */
router.post('/forgot-password',
  // 1. Rate limiting: 3 solicitudes por hora por IP
  passwordResetRateLimit,
  
  // 2. Validación de email
  ...validatePasswordReset,
  handleValidationErrors,
  
  // 3. Controlador Firebase Password Reset
  asyncErrorHandler(async (req, res) => {
    const { email } = req.body;
    
    logger.info({ email, ip: req.ip }, 'Password reset request');
    
    if (!isFirebaseAvailable()) {
      throw CommonErrors.UnauthorizedError('Authentication service unavailable');
    }

    try {
      // Generar link de reset de contraseña con Firebase
      const auth = getFirebaseAuth();
      const resetLink = await auth.generatePasswordResetLink(email);
      
      // Enviar email con el link personalizado
      const emailService = new EmailService(logger as any);
      await emailService.sendPasswordResetEmail(email, resetLink);
      
      logger.info({ email }, 'Password reset email sent');
      
    } catch (error) {
      // No revelar si el usuario existe o no por seguridad
      logger.warn({ 
        email, 
        error: error instanceof Error ? error.message : String(error) 
      }, 'Password reset failed (user may not exist)');
    }
    
    // Siempre responder lo mismo por seguridad
    res.json({
      success: true,
      message: 'If the email exists, you will receive password reset instructions'
    });
  })
);

/**
 * POST /api/auth/change-password
 * Change password for authenticated users
 */
router.post('/change-password',
  // 1. Requiere autenticación
  firebaseAuthMiddleware,
  
  // 2. Validación de contraseñas
  ...validatePasswordChange,
  handleValidationErrors,
  
  // 3. Controlador Firebase Password Change  
  asyncErrorHandler(async (req: FirebaseAuthRequest, res) => {
    const { newPassword } = req.body;
    const firebaseUser = req.firebaseUser;
    
    if (!firebaseUser) {
      throw CommonErrors.UnauthorizedError();
    }
    
    logger.info({ uid: firebaseUser.uid, ip: req.ip }, 'Password change attempt');
    
    if (!isFirebaseAvailable()) {
      throw CommonErrors.UnauthorizedError('Authentication service unavailable');
    }

    // Actualizar contraseña en Firebase
    const auth = getFirebaseAuth();
    await auth.updateUser(firebaseUser.uid, {
      password: newPassword
    });
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
    logger.info({ uid: firebaseUser.uid }, 'Firebase password updated successfully');
  })
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me',
  firebaseAuthMiddleware,
  asyncErrorHandler(async (req: FirebaseAuthRequest, res) => {
    const firebaseUser = req.firebaseUser;
    
    if (!firebaseUser) {
      throw CommonErrors.UnauthorizedError();
    }
    
    // Obtener información completa del usuario desde Firebase
    const userRecord = await getFirebaseUser(firebaseUser.uid);
    if (!userRecord) {
      throw CommonErrors.NotFoundError('User not found in Firebase');
    }

    // TODO: Obtener datos adicionales desde Firestore
    // const userDoc = await firestore.collection('users').doc(firebaseUser.uid).get();
    // const userData = userDoc.exists ? userDoc.data() : {};
    
    res.json({
      success: true,
      data: {
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
          photoURL: firebaseUser.photoURL,
          customClaims: firebaseUser.customClaims,
          // Información adicional de Firebase
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime,
          // ...userData // Datos adicionales de Firestore
        }
      }
    });
  })
);

/**
 * POST /api/auth/logout
 * User logout (si usas tokens en blacklist)
 */
router.post('/logout',
  firebaseAuthMiddleware,
  asyncErrorHandler(async (req: FirebaseAuthRequest, res) => {
    const firebaseUser = req.firebaseUser;
    
    if (!firebaseUser) {
      throw CommonErrors.UnauthorizedError();
    }

    // En Firebase, el logout se maneja principalmente en el frontend
    // Aquí solo registramos el evento para auditoría
    
    logger.info({ 
      uid: firebaseUser.uid,
      email: firebaseUser.email 
    }, 'User logout recorded');
    
    res.json({
      success: true,
      message: 'Logout recorded. Clear token on client side.',
      hint: 'Use signOut() from firebase/auth on the client side'
    });
  })
);

export { router as authRouter };