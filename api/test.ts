/**
 * Simple test endpoint to verify Vercel functions work
 */

export default async function handler(req: any, res: any) {
  return res.status(200).json({ 
    message: 'Hello from Vercel!',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
