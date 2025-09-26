// API route for shows management
// /api/shows/index.ts
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    switch (req.method) {
      case 'GET':
        return await getShows(req, res, user.id);
      case 'POST':
        return await createShow(req, res, user.id);
      case 'PUT':
        return await updateShow(req, res, user.id);
      case 'DELETE':
        return await deleteShow(req, res, user.id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getShows(req: VercelRequest, res: VercelResponse, userId: string) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  const { data: shows, error } = await supabase
    .from('shows')
    .select(`
      *,
      venue:venues(*),
      financials:show_financials(*)
    `)
    .eq('organization_id', profile.organization_id)
    .order('date', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ shows });
}

async function createShow(req: VercelRequest, res: VercelResponse, userId: string) {
  const { show } = req.body;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  const { data: newShow, error } = await supabase
    .from('shows')
    .insert({
      ...show,
      organization_id: profile.organization_id,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ show: newShow });
}

async function updateShow(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id, updates } = req.body;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  const { data: updatedShow, error } = await supabase
    .from('shows')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('organization_id', profile.organization_id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ show: updatedShow });
}

async function deleteShow(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.body;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  const { error } = await supabase
    .from('shows')
    .delete()
    .eq('id', id)
    .eq('organization_id', profile.organization_id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
