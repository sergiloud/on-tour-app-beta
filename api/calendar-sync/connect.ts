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

    console.log('[CONNECT] Total calendars found:', calendars.length);
    console.log('[CONNECT] Calendar details:', calendars.map((c: any) => ({
      url: c.url,
      name: c.displayName,
      components: c.components,
      resourcetype: c.resourcetype
    })));

    // Filter to ONLY event calendars (VEVENT component)
    // iCloud returns both VEVENT (calendar events) and VTODO (reminders/tasks)
    const eventCalendars = calendars.filter((cal: any) => {
      // Check if calendar supports VEVENT component
      const components = cal.components || [];
      const supportsEvents = components.includes('VEVENT');
      const supportsTodos = components.includes('VTODO');
      
      // Only return calendars that support events but NOT exclusively todos
      // Some calendars support both, we want those too
      if (!supportsEvents) {
        console.log('[CONNECT] Filtering out (no VEVENT):', cal.displayName);
        return false;
      }
      
      // Additional URL-based filtering for safety
      const url = cal.url?.toLowerCase() || '';
      const displayName = cal.displayName?.toLowerCase() || '';
      
      const isReminderCalendar = url.includes('/reminders/') || 
                                  displayName === 'reminders' ||
                                  displayName === 'tasks';
      
      if (isReminderCalendar) {
        console.log('[CONNECT] Filtering out (reminder URL/name):', cal.displayName);
        return false;
      }
      
      console.log('[CONNECT] Keeping calendar:', cal.displayName, '(components:', components.join(', '), ')');
      return true;
    });

    console.log('[CONNECT] Event calendars after filter:', eventCalendars.length);

    // Return calendars and credentials
    return res.status(200).json({
      calendars: eventCalendars.map((cal: any) => ({
        url: cal.url,
        displayName: cal.displayName,
        description: cal.description,
        ctag: cal.ctag,
        components: cal.components, // Include components for debugging
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
