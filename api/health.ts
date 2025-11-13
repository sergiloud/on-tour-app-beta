/**
 * Vercel Serverless Function - Health Check for Encryption
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const checks = {
    firebaseProjectId: !!process.env.FIREBASE_PROJECT_ID,
    firebaseClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    firebasePrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    calendarEncryptionKey: !!process.env.CALENDAR_ENCRYPTION_KEY,
    encryptionKeyLength: process.env.CALENDAR_ENCRYPTION_KEY?.length || 0,
  };

  const allGood = checks.firebaseProjectId && 
                  checks.firebaseClientEmail && 
                  checks.firebasePrivateKey && 
                  checks.calendarEncryptionKey &&
                  checks.encryptionKeyLength === 64;

  return res.status(allGood ? 200 : 500).json({
    status: allGood ? 'healthy' : 'unhealthy',
    checks,
    message: allGood 
      ? 'All environment variables configured correctly' 
      : 'Missing or invalid environment variables',
  });
}
