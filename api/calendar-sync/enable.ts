/**
 * Vercel Serverless Function - Enable Calendar Sync
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
let db: any;
try {
  if (!db) {
    const app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    db = getFirestore(app);
  }
} catch (error) {
  console.error('Firebase init error:', error);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { calendarUrl, direction, credentials, userId } = req.body;

    if (!calendarUrl || !direction || !credentials || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    // Save sync configuration to Firestore
    await db
      .collection('users')
      .doc(userId)
      .collection('calendarSync')
      .doc('config')
      .set({
        enabled: true,
        calendarUrl,
        direction,
        credentials: {
          ...credentials,
          password: Buffer.from(credentials.password).toString('base64'), // Simple encoding for now
        },
        lastSync: null,
        createdAt: new Date().toISOString(),
      });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Enable sync error:', error);
    return res.status(500).json({
      error: 'Failed to enable sync',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
