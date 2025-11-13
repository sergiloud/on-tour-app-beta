/**
 * Vercel Serverless Function - Disable Calendar Sync
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDB } from '../utils/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const db = getDB();
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
