import { Router } from 'express';
import { getAuth } from '../config/firebase.js';
import { 
  firebaseAuthMiddleware,
  requireAdmin,
  requireEmailVerified,
  FirebaseAuthRequest
} from '../middleware/firebaseAuth.js';
import { asyncErrorHandler, CommonErrors } from '../middleware/errorHandler.js';
import { generalRateLimit } from '../middleware/rateLimiting.js';
import { validatePagination, handleValidationErrors } from '../middleware/validation.js';
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  listUsers,
  findUserByEmail,
  getUsersCount,
  updateLastLogin
} from '../services/UserService.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * User Management Routes with Firebase + Firestore
 * 
 * Todas las rutas requieren autenticación Firebase
 * Las rutas administrativas requieren rol de admin
 */

/**
 * GET /api/users/profile
 * Obtener perfil del usuario actual
 */
router.get('/profile',
  firebaseAuthMiddleware,
  asyncErrorHandler(async (req: FirebaseAuthRequest, res) => {
    const firebaseUser = req.firebaseUser!;
    
    // Registrar último login
    updateLastLogin(firebaseUser.uid).catch(err => 
      logger.warn({ uid: firebaseUser.uid, error: err }, 'Failed to update last login')
    );

    // Obtener perfil desde Firestore
    let profile = await getUserProfile(firebaseUser.uid);
    
    // Si no existe, crear uno básico
    if (!profile) {
      profile = await createUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined
      });
    }

    res.json({
      success: true,
      data: {
        // Datos de Firebase Auth
        firebase: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          customClaims: firebaseUser.customClaims
        },
        // Datos extendidos de Firestore
        profile
      }
    });
  })
);

/**
 * PUT /api/users/profile  
 * Actualizar perfil del usuario actual
 */
router.put('/profile',
  firebaseAuthMiddleware,
  requireEmailVerified,
  asyncErrorHandler(async (req: FirebaseAuthRequest, res) => {
    const firebaseUser = req.firebaseUser!;
    const { displayName, organizationName, preferences } = req.body;

    // Validar datos de entrada
    const updateData: any = {};
    
    if (displayName !== undefined) {
      updateData.displayName = displayName;
    }
    if (organizationName !== undefined) {
      updateData.organizationName = organizationName;
    }
    if (preferences !== undefined) {
      updateData.preferences = preferences;
    }

    // Actualizar perfil en Firestore
    const updatedProfile = await updateUserProfile(firebaseUser.uid, updateData);
    
    if (!updatedProfile) {
      throw CommonErrors.DatabaseError();
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile: updatedProfile }
    });

    logger.info({
      uid: firebaseUser.uid,
      updatedFields: Object.keys(updateData)
    }, 'User profile updated');
  })
);

/**
 * DELETE /api/users/profile
 * Eliminar cuenta del usuario actual
 */
router.delete('/profile',
  firebaseAuthMiddleware,
  requireEmailVerified,
  asyncErrorHandler(async (req: FirebaseAuthRequest, res) => {
    const firebaseUser = req.firebaseUser!;

    try {
      // Eliminar perfil de Firestore
      await deleteUserProfile(firebaseUser.uid);

      // Eliminar usuario de Firebase Auth
      const auth = getAuth();
      await auth.deleteUser(firebaseUser.uid);

      res.json({
        success: true,
        message: 'User account completely deleted from Firebase Auth and Firestore'
      });

      logger.info({ uid: firebaseUser.uid }, 'User account fully deleted');
    } catch (error: any) {
      logger.error({ uid: firebaseUser.uid, error }, 'Failed to delete user account');
      throw CommonErrors.DatabaseError();
    }
  })
);

/**
 * GET /api/users
 * Listar usuarios (solo admins)
 */
router.get('/',
  firebaseAuthMiddleware,
  requireAdmin,
  ...validatePagination,
  handleValidationErrors,
  asyncErrorHandler(async (req: FirebaseAuthRequest, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const startAfter = req.query.startAfter as string;

    const result = await listUsers(limit, startAfter);
    const totalCount = await getUsersCount();

    res.json({
      success: true,
      data: {
        users: result.users,
        pagination: {
          limit,
          hasMore: result.hasMore,
          lastDoc: result.lastDoc,
          totalCount
        }
      }
    });

    logger.info({
      adminUid: req.firebaseUser!.uid,
      count: result.users.length,
      totalCount
    }, 'Users listed by admin');
  })
);

/**
 * GET /api/users/:uid
 * Obtener usuario específico (solo admins)
 */
router.get('/:uid',
  firebaseAuthMiddleware,
  requireAdmin,
  asyncErrorHandler(async (req: FirebaseAuthRequest, res) => {
    const { uid } = req.params;

    const profile = await getUserProfile(uid);
    if (!profile) {
      throw CommonErrors.NotFoundError('User profile');
    }

    res.json({
      success: true,
      data: { profile }
    });
  })
);

/**
 * PUT /api/users/:uid/role
 * Actualizar rol de usuario (solo admins)
 */
router.put('/:uid/role',
  firebaseAuthMiddleware,
  requireAdmin,
  asyncErrorHandler(async (req: FirebaseAuthRequest, res) => {
    const { uid } = req.params;
    const { role } = req.body;

    // Validar rol
    const validRoles = ['user', 'admin', 'superadmin'];
    if (!validRoles.includes(role)) {
      throw CommonErrors.ValidationError({
        field: 'role',
        message: `Role must be one of: ${validRoles.join(', ')}`
      });
    }

    // Actualizar rol en Firestore
    const updatedProfile = await updateUserProfile(uid, { role });
    
    if (!updatedProfile) {
      throw CommonErrors.NotFoundError('User profile');
    }

    // Actualizar custom claims en Firebase Auth
    try {
      const auth = getAuth();
      await auth.setCustomUserClaims(uid, { role });
      logger.info({ uid, role }, 'Custom claims updated in Firebase Auth');
    } catch (error: any) {
      logger.error({ uid, role, error }, 'Failed to update custom claims');
      // No lanzamos error aquí porque el rol ya se actualizó en Firestore
      // El claim se actualizará en el próximo login del usuario
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { profile: updatedProfile }
    });

    logger.info({
      adminUid: req.firebaseUser!.uid,
      targetUid: uid,
      newRole: role
    }, 'User role updated by admin');
  })
);

/**
 * GET /api/users/search/email/:email
 * Buscar usuario por email (solo admins)
 */
router.get('/search/email/:email',
  firebaseAuthMiddleware,
  requireAdmin,
  asyncErrorHandler(async (req: FirebaseAuthRequest, res) => {
    const { email } = req.params;

    const profile = await findUserByEmail(email);
    
    res.json({
      success: true,
      data: { profile }
    });
  })
);

export { router as usersRouter };