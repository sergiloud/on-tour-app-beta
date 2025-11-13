import admin from 'firebase-admin';
import { logger } from '../utils/logger.js';

/**
 * Firebase Admin SDK Configuration
 * 
 * Inicializa Firebase Admin para autenticación backend y acceso a Firestore
 */

let adminApp: admin.app.App | null = null;
let db: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;

/**
 * Inicializar Firebase Admin SDK
 */
export function initializeFirebaseAdmin(): boolean {
  try {
    // Evitar reinicialización
    if (adminApp) {
      logger.info('Firebase Admin already initialized');
      return true;
    }

    // Verificar variables de entorno
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    
    if (!projectId) {
      logger.warn('FIREBASE_PROJECT_ID not set - Firebase Admin disabled');
      return false;
    }

    // Configuración según entorno
    let credential: admin.credential.Credential;
    
    if (serviceAccountPath) {
      // Producción: usar service account key file
      credential = admin.credential.cert(serviceAccountPath);
      logger.info('Firebase Admin: Using service account key file');
    } else {
      // Desarrollo: usar Application Default Credentials
      credential = admin.credential.applicationDefault();
      logger.info('Firebase Admin: Using Application Default Credentials');
    }

    // Inicializar Firebase Admin
    adminApp = admin.initializeApp({
      credential,
      projectId,
    });

    // Obtener servicios
    db = admin.firestore(adminApp);
    auth = admin.auth(adminApp);

    // Configurar Firestore
    db.settings({
      ignoreUndefinedProperties: true
    });

    logger.info({
      projectId,
      hasAuth: !!auth,
      hasFirestore: !!db
    }, '🔥 Firebase Admin initialized successfully');

    return true;

  } catch (error) {
    logger.error({ error }, 'Failed to initialize Firebase Admin');
    adminApp = null;
    db = null;
    auth = null;
    return false;
  }
}

/**
 * Verificar si Firebase Admin está disponible
 */
export function isFirebaseAvailable(): boolean {
  return !!(adminApp && db && auth);
}

/**
 * Obtener instancia de Firestore
 */
export function getFirestore(): admin.firestore.Firestore {
  if (!db) {
    throw new Error('Firebase Admin not initialized. Call initializeFirebaseAdmin() first.');
  }
  return db;
}

/**
 * Obtener instancia de Auth
 */
export function getAuth(): admin.auth.Auth {
  if (!auth) {
    throw new Error('Firebase Admin not initialized. Call initializeFirebaseAdmin() first.');
  }
  return auth;
}

/**
 * Obtener instancia de la app
 */
export function getAdminApp(): admin.app.App {
  if (!adminApp) {
    throw new Error('Firebase Admin not initialized. Call initializeFirebaseAdmin() first.');
  }
  return adminApp;
}

/**
 * Verificar token de Firebase Auth
 */
export async function verifyFirebaseToken(token: string): Promise<admin.auth.DecodedIdToken | null> {
  try {
    if (!auth) {
      throw new Error('Firebase Auth not available');
    }

    const decodedToken = await auth.verifyIdToken(token);
    
    logger.debug({
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    }, 'Firebase token verified');

    return decodedToken;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn({ error: errorMessage }, 'Firebase token verification failed');
    return null;
  }
}

/**
 * Obtener usuario de Firebase por UID
 */
export async function getFirebaseUser(uid: string): Promise<admin.auth.UserRecord | null> {
  try {
    if (!auth) {
      throw new Error('Firebase Auth not available');
    }

    const userRecord = await auth.getUser(uid);
    return userRecord;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn({ uid, error: errorMessage }, 'Failed to get Firebase user');
    return null;
  }
}

/**
 * Crear usuario en Firebase (para registro desde backend)
 */
export async function createFirebaseUser(userData: {
  email: string;
  password: string;
  displayName?: string;
  disabled?: boolean;
}): Promise<admin.auth.UserRecord | null> {
  try {
    if (!auth) {
      throw new Error('Firebase Auth not available');
    }

    const userRecord = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.displayName,
      disabled: userData.disabled || false,
      emailVerified: false
    });

    logger.info({
      uid: userRecord.uid,
      email: userRecord.email
    }, 'Firebase user created');

    return userRecord;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ 
      email: userData.email, 
      error: errorMessage 
    }, 'Failed to create Firebase user');
    return null;
  }
}

/**
 * Actualizar usuario en Firebase
 */
export async function updateFirebaseUser(
  uid: string, 
  updates: admin.auth.UpdateRequest
): Promise<admin.auth.UserRecord | null> {
  try {
    if (!auth) {
      throw new Error('Firebase Auth not available');
    }

    const userRecord = await auth.updateUser(uid, updates);
    
    logger.info({ uid, updates }, 'Firebase user updated');
    return userRecord;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ uid, updates, error: errorMessage }, 'Failed to update Firebase user');
    return null;
  }
}

/**
 * Eliminar usuario de Firebase
 */
export async function deleteFirebaseUser(uid: string): Promise<boolean> {
  try {
    if (!auth) {
      throw new Error('Firebase Auth not available');
    }

    await auth.deleteUser(uid);
    
    logger.info({ uid }, 'Firebase user deleted');
    return true;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ uid, error: errorMessage }, 'Failed to delete Firebase user');
    return false;
  }
}

// Exportar instancias para uso directo (pueden ser null)
export { adminApp, db as firestore, auth as firebaseAuth };