import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Helper to check if Firebase is configured
export const isFirebaseConfigured = () => {
  const configured = !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_API_KEY !== 'your_api_key_here'
  );
  console.log('[FIREBASE] Configuration check:', {
    configured,
    hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
    hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
    apiKeyValue: import.meta.env.VITE_FIREBASE_API_KEY ? 'SET' : 'MISSING'
  });
  return configured;
};

// Mock Firebase app for development when env vars are missing
const createMockFirebaseApp = () => {
  console.warn('🔥 Firebase not configured - using mock mode. Set environment variables to enable authentication.');
  return null;
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

if (isFirebaseConfigured()) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };

  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize Firebase Auth with persistence
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Error setting persistence:', error);
    });

    // Initialize Firestore
    db = getFirestore(app);

    // Initialize Analytics (DISABLED to prevent 405 errors in SPA deployment)
    // analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
    analytics = null;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    app = null;
  }
} else {
  createMockFirebaseApp();
}

// Export the initialized services (may be null if not configured)
export { app, auth, db, analytics };
