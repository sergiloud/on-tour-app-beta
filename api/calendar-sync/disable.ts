/**
 * Vercel Serverless Function - Disable Calendar Sync
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db: any;
try {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  db = getFirestore();
} catch (error) {
  console.error('Firebase init error:', error);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    await db
      .collection('users')
      .doc(userId)
      .collection('calendarSync')
      .doc('config')
      .update({ enabled: false });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Disable sync error:', error);
    return res.status(500).json({
      error: 'Failed to disable sync',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
