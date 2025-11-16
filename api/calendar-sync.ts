import type { VercelRequest, VercelResponse } from '@vercel/node';

// Unified Calendar Sync API
// Handles all calendar sync operations in a single function

interface CalendarSyncRequest {
  action: 'connect' | 'disconnect' | 'enable' | 'disable' | 'status' | 'sync-now';
  provider?: 'apple' | 'google';
  config?: any;
  userId?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action, provider, config, userId } = req.body as CalendarSyncRequest;

    if (!action) {
      return res.status(400).json({ 
        error: 'Missing action parameter',
        actions: ['connect', 'disconnect', 'enable', 'disable', 'status', 'sync-now']
      });
    }

    // Mock responses - replace with actual implementation
    switch (action) {
      case 'connect':
        return handleConnect(req, res, { provider, config, userId });
      
      case 'disconnect':
        return handleDisconnect(req, res, { provider, userId });
      
      case 'enable':
        return handleEnable(req, res, { provider, userId });
      
      case 'disable':
        return handleDisable(req, res, { provider, userId });
      
      case 'status':
        return handleStatus(req, res, { provider, userId });
      
      case 'sync-now':
        return handleSyncNow(req, res, { provider, userId });
      
      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          received: action,
          valid: ['connect', 'disconnect', 'enable', 'disable', 'status', 'sync-now']
        });
    }
  } catch (error) {
    console.error('Calendar sync API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleConnect(req: VercelRequest, res: VercelResponse, params: any) {
  const { provider, config, userId } = params;
  
  // Mock implementation
  return res.json({
    success: true,
    message: `Connected to ${provider || 'default'} calendar`,
    provider,
    userId,
    connectionId: `conn_${Date.now()}`,
    config: {
      autoSync: true,
      syncFrequency: '15m',
      lastSync: null
    }
  });
}

async function handleDisconnect(req: VercelRequest, res: VercelResponse, params: any) {
  const { provider, userId } = params;
  
  return res.json({
    success: true,
    message: `Disconnected from ${provider || 'default'} calendar`,
    provider,
    userId
  });
}

async function handleEnable(req: VercelRequest, res: VercelResponse, params: any) {
  const { provider, userId } = params;
  
  return res.json({
    success: true,
    message: `Enabled sync for ${provider || 'default'} calendar`,
    provider,
    userId,
    status: 'enabled',
    nextSync: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  });
}

async function handleDisable(req: VercelRequest, res: VercelResponse, params: any) {
  const { provider, userId } = params;
  
  return res.json({
    success: true,
    message: `Disabled sync for ${provider || 'default'} calendar`,
    provider,
    userId,
    status: 'disabled'
  });
}

async function handleStatus(req: VercelRequest, res: VercelResponse, params: any) {
  const { provider, userId } = params;
  
  return res.json({
    success: true,
    provider: provider || 'apple',
    userId,
    status: {
      connected: true,
      enabled: true,
      lastSync: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      nextSync: new Date(Date.now() + 13 * 60 * 1000).toISOString(),
      syncFrequency: '15m',
      eventsCount: 42,
      errors: 0
    }
  });
}

async function handleSyncNow(req: VercelRequest, res: VercelResponse, params: any) {
  const { provider, userId } = params;
  
  // Simulate sync operation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return res.json({
    success: true,
    message: `Manual sync completed for ${provider || 'default'} calendar`,
    provider,
    userId,
    syncResult: {
      eventsAdded: 3,
      eventsUpdated: 1,
      eventsRemoved: 0,
      syncTime: new Date().toISOString(),
      duration: '1.2s'
    }
  });
}