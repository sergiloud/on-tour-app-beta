/**
 * Vercel Serverless Function - Calendar Sync Connect
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createDAVClient, fetchCalendars } from 'tsdav';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { provider, email, password, serverUrl, userId } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Determine server URL based on provider
    let davServerUrl = serverUrl;
    if (provider === 'icloud') {
      davServerUrl = 'https://caldav.icloud.com';
    } else if (provider === 'google') {
      davServerUrl = 'https://caldav.google.com';
    }

    if (!davServerUrl) {
      return res.status(400).json({ error: 'Server URL required for caldav provider' });
    }

    // Create DAV client
    const client = await createDAVClient({
      serverUrl: davServerUrl,
      credentials: {
        username: email,
        password: password,
      },
      authMethod: 'Basic',
      defaultAccountType: 'caldav',
    });

    // Fetch calendars
    const calendars = await fetchCalendars({ 
      client: client as any,
    });

    // Return calendars and credentials
    return res.status(200).json({
      calendars: calendars.map((cal: any) => ({
        url: cal.url,
        displayName: cal.displayName,
        description: cal.description,
      })),
      credentials: {
        provider,
        email,
        password, // TODO: Encrypt this properly
        serverUrl: davServerUrl,
      },
    });
  } catch (error) {
    console.error('Calendar sync connect error:', error);
    return res.status(500).json({
      error: 'Failed to connect to calendar',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
