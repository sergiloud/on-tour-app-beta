/**
 * Vercel Serverless Function - Manual Sync Trigger
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createDAVClient, fetchCalendarObjects, createCalendarObject } from 'tsdav';

let db: any;
try {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  db = getFirestore();
} catch (error) {
  console.error('Firebase init error:', error);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    // Get sync configuration
    const configDoc = await db
      .collection('users')
      .doc(userId)
      .collection('calendarSync')
      .doc('config')
      .get();

    if (!configDoc.exists || !configDoc.data().enabled) {
      return res.status(400).json({ error: 'Calendar sync not enabled' });
    }

    const config = configDoc.data();
    const { calendarUrl, direction, credentials } = config;

    // Decode password
    const password = Buffer.from(credentials.password, 'base64').toString('utf-8');

    // Create DAV client
    const client = await createDAVClient({
      serverUrl: credentials.serverUrl,
      credentials: {
        username: credentials.email,
        password: password,
      },
      authMethod: 'Basic',
      defaultAccountType: 'caldav',
    });

    let imported = 0;
    let exported = 0;
    const errors: string[] = [];

    // Import from CalDAV to Firestore
    if (direction === 'import' || direction === 'bidirectional') {
      try {
        const calendarObjects = await fetchCalendarObjects({
          client: client as any,
          calendar: { url: calendarUrl } as any,
        });

        for (const obj of calendarObjects) {
          try {
            const event = parseICSToEvent(obj.data);
            if (event) {
              await db
                .collection('users')
                .doc(userId)
                .collection('calendarEvents')
                .doc(event.id)
                .set({
                  ...event,
                  syncedFrom: 'caldav',
                  syncedAt: new Date().toISOString(),
                });
              imported++;
            }
          } catch (err) {
            errors.push(`Import error: ${err instanceof Error ? err.message : 'Unknown'}`);
          }
        }
      } catch (err) {
        errors.push(`Fetch error: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    }

    // Export from Firestore to CalDAV
    if (direction === 'export' || direction === 'bidirectional') {
      try {
        const eventsSnapshot = await db
          .collection('users')
          .doc(userId)
          .collection('calendarEvents')
          .where('syncedFrom', '!=', 'caldav')
          .get();

        for (const doc of eventsSnapshot.docs) {
          try {
            const event = doc.data();
            const icsData = convertToICS(event);
            
            await createCalendarObject({
              client: client as any,
              calendar: { url: calendarUrl } as any,
              filename: `${event.id}.ics`,
              iCalString: icsData,
            } as any);
            
            exported++;
          } catch (err) {
            errors.push(`Export error: ${err instanceof Error ? err.message : 'Unknown'}`);
          }
        }
      } catch (err) {
        errors.push(`Export fetch error: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    }

    // Update last sync time
    await db
      .collection('users')
      .doc(userId)
      .collection('calendarSync')
      .doc('config')
      .update({ lastSync: new Date().toISOString() });

    return res.status(200).json({
      result: {
        imported,
        exported,
        errors,
      },
    });
  } catch (error) {
    console.error('Sync now error:', error);
    return res.status(500).json({
      error: 'Sync failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Helper: Parse ICS to event object
function parseICSToEvent(icsString: string): any | null {
  try {
    const uidMatch = icsString.match(/UID:(.*)/);
    const summaryMatch = icsString.match(/SUMMARY:(.*)/);
    const dtStartMatch = icsString.match(/DTSTART[^:]*:(.*)/);
    const dtEndMatch = icsString.match(/DTEND[^:]*:(.*)/);
    const locationMatch = icsString.match(/LOCATION:(.*)/);
    const descriptionMatch = icsString.match(/DESCRIPTION:(.*)/);

    if (!uidMatch || !summaryMatch || !dtStartMatch) return null;

    return {
      id: uidMatch[1].trim(),
      title: summaryMatch[1].trim(),
      startDate: parseDateString(dtStartMatch[1].trim()),
      endDate: dtEndMatch ? parseDateString(dtEndMatch[1].trim()) : null,
      location: locationMatch ? locationMatch[1].trim() : undefined,
      notes: descriptionMatch ? descriptionMatch[1].trim() : undefined,
    };
  } catch {
    return null;
  }
}

// Helper: Convert event to ICS
function convertToICS(event: any): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//On Tour App//Calendar Sync//EN
BEGIN:VEVENT
UID:${event.id}
DTSTAMP:${now}
DTSTART:${formatDate(event.startDate)}
DTEND:${formatDate(event.endDate || event.startDate)}
SUMMARY:${escapeText(event.title)}
${event.location ? `LOCATION:${escapeText(event.location)}` : ''}
${event.notes ? `DESCRIPTION:${escapeText(event.notes)}` : ''}
END:VEVENT
END:VCALENDAR`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function parseDateString(dateStr: string): string {
  if (dateStr.length === 8) {
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  }
  return dateStr.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6');
}

function escapeText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}
