/**
 * Test Firebase import
 */

import { getDB } from './utils/firebase.js';

export default async function handler(req: any, res: any) {
  try {
    const db = getDB();
    return res.status(200).json({ success: true, message: 'Firebase initialized' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
}
