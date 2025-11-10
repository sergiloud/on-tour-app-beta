// Hybrid auth service: Firebase (production) + Demo (development)
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { setAuthed, setCurrentUserId } from '../lib/demoAuth';
import { setCurrentOrgId } from '../lib/tenants';
import { secureStorage } from '../lib/secureStorage';

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

// Convert Firebase User to AuthUser
const toAuthUser = (user: FirebaseUser): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL
});

// Check if we should use Firebase or Demo auth
const useFirebase = () => isFirebaseConfigured();

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<AuthUser> => {
  console.log('[AUTH] signIn called:', { email, hasPassword: !!password, useFirebase: useFirebase(), hasAuth: !!auth });
  
  if (useFirebase() && auth) {
    console.log('[AUTH] Attempting Firebase signInWithEmailAndPassword...');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const authUser = toAuthUser(result.user);
      console.log('[AUTH] Firebase sign-in successful:', { uid: authUser.uid, email: authUser.email });

      // Sync with local storage
      secureStorage.setItem('auth:userId', authUser.uid);
      secureStorage.setItem('auth:email', authUser.email || '');

      return authUser;
    } catch (error) {
      console.error('[AUTH] Firebase sign-in error:', error);
      throw error;
    }
  } else {
    console.log('[AUTH] Using demo mode fallback');
    // Demo mode - fallback to existing demo auth
    setAuthed(true);
    setCurrentUserId(email);
    return {
      uid: 'demo_' + email,
      email,
      displayName: email.split('@')[0] || 'User',
      photoURL: null
    };
  }
};

// Register new user
export const signUp = async (email: string, password: string, displayName?: string): Promise<AuthUser> => {
  if (useFirebase() && auth) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const authUser = toAuthUser(result.user);

    // TODO: Update profile with displayName if provided
    // await updateProfile(result.user, { displayName });

    // Sync with local storage
    secureStorage.setItem('auth:userId', authUser.uid);
    secureStorage.setItem('auth:email', authUser.email || '');

    return authUser;
  } else {
    // Demo mode
    setAuthed(true);
    setCurrentUserId(email);
    return {
      uid: 'demo_' + email,
      email,
      displayName: displayName || email.split('@')[0] || 'User',
      photoURL: null
    };
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<AuthUser> => {
  if (useFirebase() && auth) {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const authUser = toAuthUser(result.user);

    secureStorage.setItem('auth:userId', authUser.uid);
    secureStorage.setItem('auth:email', authUser.email || '');

    return authUser;
  } else {
    // Demo mode
    const demoEmail = 'demo@google.com';
    setAuthed(true);
    setCurrentUserId(demoEmail);
    return {
      uid: 'demo_google',
      email: demoEmail,
      displayName: 'Demo User (Google)',
      photoURL: null
    };
  }
};

// Sign in with Apple
export const signInWithApple = async (): Promise<AuthUser> => {
  if (useFirebase() && auth) {
    const provider = new OAuthProvider('apple.com');
    const result = await signInWithPopup(auth, provider);
    const authUser = toAuthUser(result.user);

    secureStorage.setItem('auth:userId', authUser.uid);
    secureStorage.setItem('auth:email', authUser.email || '');

    return authUser;
  } else {
    // Demo mode
    const demoEmail = 'demo@apple.com';
    setAuthed(true);
    setCurrentUserId(demoEmail);
    return {
      uid: 'demo_apple',
      email: demoEmail,
      displayName: 'Demo User (Apple)',
      photoURL: null
    };
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  if (useFirebase() && auth) {
    await firebaseSignOut(auth);
  }

  // Clear local storage in both modes
  setAuthed(false);
  secureStorage.removeItem('auth:userId');
  secureStorage.removeItem('auth:email');
  secureStorage.removeItem('demo:lastUser');
  secureStorage.removeItem('demo:lastOrg');
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  if (useFirebase() && auth) {
    await sendPasswordResetEmail(auth, email);
  } else {
    // Demo mode - just simulate
    console.log('Demo mode: Password reset email would be sent to', email);
  }
};

// Get current user
export const getCurrentUser = (): AuthUser | null => {
  if (useFirebase() && auth && auth.currentUser) {
    return toAuthUser(auth.currentUser);
  }

  // Fallback to local storage
  const userId = secureStorage.getItem<string>('auth:userId');
  const email = secureStorage.getItem<string>('auth:email');

  if (userId && email) {
    return {
      uid: userId,
      email,
      displayName: email.split('@')[0] || 'User',
      photoURL: null
    };
  }

  return null;
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: AuthUser | null) => void): (() => void) => {
  if (useFirebase() && auth) {
    return auth.onAuthStateChanged((firebaseUser) => {
      callback(firebaseUser ? toAuthUser(firebaseUser) : null);
    });
  } else {
    // Demo mode - check periodically or on storage events
    const checkAuth = () => {
      const user = getCurrentUser();
      callback(user);
    };

    window.addEventListener('storage', checkAuth);
    checkAuth(); // Initial check

    return () => window.removeEventListener('storage', checkAuth);
  }
};
