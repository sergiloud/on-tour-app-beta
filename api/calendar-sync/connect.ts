/**
 * Vercel Serverless Function - Calendar Sync Connect
 */

import { createDAVClient } from 'tsdav';

export default async function handler(req: any, res: any) {
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

    // Fetch calendars using the client's built-in method
    const calendars = await client.fetchCalendars();

    // Filter out reminder/task calendars (only show event calendars)
    const eventCalendars = calendars.filter((cal: any) => {
      const url = cal.url?.toLowerCase() || '';
      const displayName = cal.displayName?.toLowerCase() || '';
      const description = cal.description?.toLowerCase() || '';
      
      // Exclude reminder/task calendars by URL patterns
      const isReminder = url.includes('/reminders/') || 
                        url.includes('/tasks/') ||
                        displayName.includes('reminder') ||
                        displayName.includes('task') ||
                        description.includes('reminder') ||
                        description.includes('task');
      
      return !isReminder;
    });

    // Return calendars and credentials
    return res.status(200).json({
      calendars: eventCalendars.map((cal: any) => ({
        url: cal.url,
        displayName: cal.displayName,
        description: cal.description,
        ctag: cal.ctag,
      })),
      credentials: {
        provider,
        email,
        password, // Will be encrypted when enabling sync
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
