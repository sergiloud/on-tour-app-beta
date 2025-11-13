/**
 * Vercel Serverless Function - Get Sync Status
 */

import { getDB } from '../utils/firebase';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID required' });
    }

    const db = getDB();
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
    if (!config) {
      return res.status(200).json({ enabled: false });
    }
    
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
