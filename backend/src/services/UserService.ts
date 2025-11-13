import { getFirestore, isFirebaseAvailable } from '../config/firebase.js';
import { logger } from '../utils/logger.js';
import admin from 'firebase-admin';

/**
 * User Service with Firestore Integration
 * 
 * Maneja datos de usuario extendidos en Firestore
 * complementando la autenticación de Firebase Auth
 */

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  organizationName?: string;
  role?: 'user' | 'admin' | 'superadmin';
  preferences?: {
    theme?: 'light' | 'dark';
    language?: 'en' | 'es';
    notifications?: boolean;
  };
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  lastLoginAt?: admin.firestore.Timestamp;
}

const USERS_COLLECTION = 'users';

/**
 * Crear perfil de usuario en Firestore
 */
export async function createUserProfile(userData: {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  organizationName?: string;
}): Promise<UserProfile | null> {
  try {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not available');
    }

    const db = getFirestore();
    const now = admin.firestore.Timestamp.now();

    const userProfile: UserProfile = {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      organizationName: userData.organizationName,
      role: 'user',
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: true
      },
      createdAt: now,
      updatedAt: now
    };

    await db.collection(USERS_COLLECTION).doc(userData.uid).set(userProfile);

    logger.info({
      uid: userData.uid,
      email: userData.email
    }, 'User profile created in Firestore');

    return userProfile;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({
      uid: userData.uid,
      error: errorMessage
    }, 'Failed to create user profile');
    return null;
  }
}

/**
 * Obtener perfil de usuario desde Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not available');
    }

    const db = getFirestore();
    const userDoc = await db.collection(USERS_COLLECTION).doc(uid).get();

    if (!userDoc.exists) {
      logger.warn({ uid }, 'User profile not found in Firestore');
      return null;
    }

    const userData = userDoc.data() as UserProfile;
    
    logger.debug({ uid }, 'User profile retrieved from Firestore');
    return userData;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({
      uid,
      error: errorMessage
    }, 'Failed to get user profile');
    return null;
  }
}

/**
 * Actualizar perfil de usuario en Firestore
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>>
): Promise<UserProfile | null> {
  try {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not available');
    }

    const db = getFirestore();
    const now = admin.firestore.Timestamp.now();

    const updateData = {
      ...updates,
      updatedAt: now
    };

    await db.collection(USERS_COLLECTION).doc(uid).update(updateData);

    // Obtener el perfil actualizado
    const updatedProfile = await getUserProfile(uid);

    logger.info({
      uid,
      updatedFields: Object.keys(updates)
    }, 'User profile updated in Firestore');

    return updatedProfile;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({
      uid,
      updates,
      error: errorMessage
    }, 'Failed to update user profile');
    return null;
  }
}

/**
 * Registrar último login del usuario
 */
export async function updateLastLogin(uid: string): Promise<boolean> {
  try {
    if (!isFirebaseAvailable()) {
      return false;
    }

    const db = getFirestore();
    const now = admin.firestore.Timestamp.now();

    await db.collection(USERS_COLLECTION).doc(uid).update({
      lastLoginAt: now,
      updatedAt: now
    });

    logger.debug({ uid }, 'Last login updated');
    return true;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn({
      uid,
      error: errorMessage
    }, 'Failed to update last login');
    return false;
  }
}

/**
 * Eliminar perfil de usuario de Firestore
 */
export async function deleteUserProfile(uid: string): Promise<boolean> {
  try {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not available');
    }

    const db = getFirestore();
    await db.collection(USERS_COLLECTION).doc(uid).delete();

    logger.info({ uid }, 'User profile deleted from Firestore');
    return true;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({
      uid,
      error: errorMessage
    }, 'Failed to delete user profile');
    return false;
  }
}

/**
 * Listar usuarios con paginación
 */
export async function listUsers(
  limit: number = 10,
  startAfter?: string
): Promise<{ users: UserProfile[]; hasMore: boolean; lastDoc?: string }> {
  try {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not available');
    }

    const db = getFirestore();
    let query = db.collection(USERS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .limit(limit + 1); // +1 para saber si hay más

    if (startAfter) {
      const startDoc = await db.collection(USERS_COLLECTION).doc(startAfter).get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    const snapshot = await query.get();
    const users: UserProfile[] = [];
    
    snapshot.docs.forEach((doc, index) => {
      if (index < limit) { // Solo tomar el límite solicitado
        users.push(doc.data() as UserProfile);
      }
    });

    const hasMore = snapshot.docs.length > limit;
    const lastDoc = users.length > 0 ? users[users.length - 1].uid : undefined;

    logger.debug({
      count: users.length,
      hasMore,
      limit
    }, 'Users listed from Firestore');

    return { users, hasMore, lastDoc };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({
      limit,
      startAfter,
      error: errorMessage
    }, 'Failed to list users');
    return { users: [], hasMore: false };
  }
}

/**
 * Buscar usuarios por email
 */
export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  try {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not available');
    }

    const db = getFirestore();
    const snapshot = await db.collection(USERS_COLLECTION)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const userDoc = snapshot.docs[0];
    return userDoc.data() as UserProfile;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({
      email,
      error: errorMessage
    }, 'Failed to find user by email');
    return null;
  }
}

/**
 * Contar total de usuarios
 */
export async function getUsersCount(): Promise<number> {
  try {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not available');
    }

    const db = getFirestore();
    const snapshot = await db.collection(USERS_COLLECTION).count().get();
    return snapshot.data().count;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ error: errorMessage }, 'Failed to get users count');
    return 0;
  }
}