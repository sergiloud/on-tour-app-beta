/**
 * Vercel Serverless Function - Get Sync Status
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
let db: any;
try {
  if (getApps().length === 0) {
    const app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    db = getFirestore(app);
  } else {
    db = getFirestore();
  }
} catch (error) {
  console.error('Firebase init error:', error);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const configDoc = await db
      .collection('users')
      .doc(userId)
      .collection('calendarSync')
      .doc('config')
      .get();

    if (!configDoc.exists) {
      return res.status(200).json({ enabled: false });
    }

    const config = configDoc.data();
    
    return res.status(200).json({
      enabled: config.enabled || false,
      lastSync: config.lastSync,
      calendarName: config.calendarName,
      direction: config.direction,
    });
  } catch (error) {
    console.error('Get status error:', error);
    return res.status(500).json({
      error: 'Failed to get sync status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
