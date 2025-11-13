/**
 * Firebase Admin initialization utility for Vercel Serverless Functions
 * Uses singleton pattern to avoid multiple initializations
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Get Firestore instance (initializes Firebase Admin if needed)
 * Uses singleton pattern - safe to call multiple times
 */
export function getDB() {
  // Check if Firebase is already initialized
  if (getApps().length === 0) {
    // Initialize Firebase Admin
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  
  return getFirestore();
}
