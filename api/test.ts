/**
 * Simple test endpoint to verify Vercel functions work
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ 
    message: 'Hello from Vercel!',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
