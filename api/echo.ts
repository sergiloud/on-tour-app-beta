export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    bodyType: typeof req.body,
    body: req.body,
    headers: req.headers,
    query: req.query
  });
}
