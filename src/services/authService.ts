// Hybrid auth service: Firebase (production) + Demo (development)
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  setPersistence,
  updatePassword,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  auth, 
  isFirebaseConfigured, 
  browserLocalPersistence, 
  browserSessionPersistence 
} from '../lib/firebase';
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

/**
 * Set auth persistence based on "Remember Me" preference
 * - LOCAL: Session persists even after browser/tab close (remember me = true)
 * - SESSION: Session only persists until tab/window close (remember me = false)
 */
export const setAuthPersistence = async (rememberMe: boolean): Promise<void> => {
  if (useFirebase() && auth) {
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    try {
      await setPersistence(auth, persistence);
      console.log(`[AUTH] Persistence set to: ${rememberMe ? 'LOCAL (persistent)' : 'SESSION (temporary)'}`);
    } catch (error) {
      console.error('[AUTH] Error setting persistence:', error);
      throw error;
    }
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string, rememberMe: boolean = true): Promise<AuthUser> => {
  if (useFirebase() && auth) {
    try {
      // Set persistence BEFORE sign-in
      await setAuthPersistence(rememberMe);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      const authUser = toAuthUser(result.user);

      // Sync with local storage
      secureStorage.setItem('auth:userId', authUser.uid);
      secureStorage.setItem('auth:email', authUser.email || '');
      secureStorage.setItem('auth:rememberMe', rememberMe);

      return authUser;
    } catch (error) {
      console.error('[AUTH] Firebase sign-in error:', error);
      throw error;
    }
  } else {
    // Demo mode - fallback to existing demo auth
    setAuthed(true);
    setCurrentUserId(email);
    secureStorage.setItem('auth:rememberMe', rememberMe);
    return {
      uid: 'demo_' + email,
      email,
      displayName: email.split('@')[0] || 'User',
      photoURL: null
    };
  }
};

// Register new user
export const signUp = async (email: string, password: string, displayName?: string, rememberMe: boolean = true): Promise<AuthUser> => {
  if (useFirebase() && auth) {
    // Set persistence BEFORE sign-up
    await setAuthPersistence(rememberMe);
    
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile with displayName if provided
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }

    const authUser = toAuthUser(result.user);

    // Sync with local storage
    secureStorage.setItem('auth:userId', authUser.uid);
    secureStorage.setItem('auth:email', authUser.email || '');
    secureStorage.setItem('auth:rememberMe', rememberMe);

    return authUser;
  } else {
    // Demo mode
    setAuthed(true);
    setCurrentUserId(email);
    secureStorage.setItem('auth:rememberMe', rememberMe);
    return {
      uid: 'demo_' + email,
      email,
      displayName: displayName || email.split('@')[0] || 'User',
      photoURL: null
    };
  }
};

// Sign in with Google
export const signInWithGoogle = async (rememberMe: boolean = true): Promise<AuthUser> => {
  if (useFirebase() && auth) {
    // Set persistence BEFORE sign-in
    await setAuthPersistence(rememberMe);
    
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const authUser = toAuthUser(result.user);

    secureStorage.setItem('auth:userId', authUser.uid);
    secureStorage.setItem('auth:email', authUser.email || '');
    secureStorage.setItem('auth:rememberMe', rememberMe);

    return authUser;
  } else {
    // Demo mode
    const demoEmail = 'demo@google.com';
    setAuthed(true);
    setCurrentUserId(demoEmail);
    secureStorage.setItem('auth:rememberMe', rememberMe);
    return {
      uid: 'demo_google',
      email: demoEmail,
      displayName: 'Demo User (Google)',
      photoURL: null
    };
  }
};

// Sign in with Apple
export const signInWithApple = async (rememberMe: boolean = true): Promise<AuthUser> => {
  if (useFirebase() && auth) {
    // Set persistence BEFORE sign-in
    await setAuthPersistence(rememberMe);
    
    const provider = new OAuthProvider('apple.com');
    const result = await signInWithPopup(auth, provider);
    const authUser = toAuthUser(result.user);

    secureStorage.setItem('auth:userId', authUser.uid);
    secureStorage.setItem('auth:email', authUser.email || '');
    secureStorage.setItem('auth:rememberMe', rememberMe);

    return authUser;
  } else {
    // Demo mode
    const demoEmail = 'demo@apple.com';
    setAuthed(true);
    setCurrentUserId(demoEmail);
    secureStorage.setItem('auth:rememberMe', rememberMe);
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
  secureStorage.removeItem('auth:rememberMe');
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

// Change password (requires re-authentication)
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  if (!useFirebase() || !auth || !auth.currentUser) {
    throw new Error('Firebase auth not available or user not logged in');
  }

  const user = auth.currentUser;
  const email = user.email;

  if (!email) {
    throw new Error('No email associated with this account');
  }

  // Re-authenticate user with current password
  const credential = EmailAuthProvider.credential(email, currentPassword);
  
  try {
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
  } catch (error: any) {
    // Provide more user-friendly error messages
    if (error.code === 'auth/wrong-password') {
      throw new Error('Current password is incorrect');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('New password is too weak. Use at least 6 characters');
    } else if (error.code === 'auth/requires-recent-login') {
      throw new Error('For security, please log out and log in again before changing your password');
    } else {
      throw new Error(error.message || 'Failed to change password');
    }
  }
};

/**
 * Delete user account
 * Requires recent re-authentication with password
 */
export const deleteAccount = async (currentPassword: string): Promise<void> => {
  if (!useFirebase() || !auth) {
    // Demo mode - just clear local data
    secureStorage.clear();
    setAuthed(false);
    setCurrentUserId('');
    setCurrentOrgId('');
    return;
  }

  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('No authenticated user');
  }

  try {
    // Re-authenticate before deleting (required by Firebase)
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Delete the user
    await deleteUser(user);

    // Clear local data
    secureStorage.clear();
    setAuthed(false);
    setCurrentUserId('');
    setCurrentOrgId('');
  } catch (error: any) {
    // Provide user-friendly error messages
    if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password');
    } else if (error.code === 'auth/requires-recent-login') {
      throw new Error('Please log out and log in again before deleting your account');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many attempts. Please try again later');
    } else {
      throw new Error(error.message || 'Failed to delete account');
    }
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
