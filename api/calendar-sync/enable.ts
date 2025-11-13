/**
 * Vercel Serverless Function - Enable Calendar Sync
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createCipheriv, randomBytes } from 'crypto';

// Firebase initialization
function getDB() {
  if (getApps().length === 0) {
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

// Encryption function
function encrypt(text: string): string {
  const key = process.env.CALENDAR_ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error('Invalid encryption key');
  }
  
  const keyBuffer = Buffer.from(key, 'hex');
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', keyBuffer, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export default async function handler(req: any, res: any) {
  console.log('[ENABLE] Request received');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[ENABLE] Parsing request body');
    const { calendarUrl, direction, credentials, userId } = req.body;

    console.log('[ENABLE] Request data:', { 
      calendarUrl, 
      direction, 
      userId,
      hasCredentials: !!credentials,
      hasPassword: !!credentials?.password 
    });

    if (!calendarUrl || !direction || !credentials || !userId) {
      console.error('[ENABLE] Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Encrypt password
    console.log('[ENABLE] Starting encryption');
    let encryptedPassword: string;
    try {
      encryptedPassword = encrypt(credentials.password);
      console.log('[ENABLE] Encryption successful');
    } catch (encryptError) {
      console.error('[ENABLE] Encryption error:', encryptError);
      return res.status(500).json({
        error: 'Encryption failed',
        message: encryptError instanceof Error ? encryptError.message : 'Unknown encryption error',
      });
    }

    // Save sync configuration to Firestore
    console.log('[ENABLE] Saving to Firestore');
    const db = getDB();
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
          password: encryptedPassword,
        },
        lastSync: null,
        createdAt: new Date().toISOString(),
      });

    console.log('[ENABLE] Firestore save successful');
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[ENABLE] Unexpected error:', error);
    return res.status(500).json({
      error: 'Failed to enable sync',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
