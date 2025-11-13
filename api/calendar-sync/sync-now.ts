/**
 * Vercel Serverless Function - Manual Sync Trigger
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createDAVClient } from 'tsdav';
import { createDecipheriv } from 'crypto';

// Firebase initialization
function getDB() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

// Decryption function
function decrypt(encryptedText: string): string {
  const key = process.env.CALENDAR_ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error('Invalid encryption key');
  }
  
  const parts = encryptedText.split(':');
  const [ivHex, authTagHex, encryptedHex] = parts;
  
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('Invalid encrypted text format');
  }
  
  const keyBuffer = Buffer.from(key, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  
  const decipher = createDecipheriv('aes-256-gcm', keyBuffer, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString('utf8');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const db = getDB();

    // Get sync configuration
    const configDoc = await db
      .collection('users')
      .doc(userId)
      .collection('calendarSync')
      .doc('config')
      .get();

    if (!configDoc.exists) {
      return res.status(400).json({ error: 'Calendar sync not enabled' });
    }

    const config = configDoc.data();
    if (!config || !config.enabled) {
      return res.status(400).json({ error: 'Calendar sync not enabled' });
    }

    const { calendarUrl, direction, credentials } = config;

    // Decrypt password using AES-256-GCM
    const password = decrypt(credentials.password);

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
        const calendars = await client.fetchCalendars();
        const targetCalendar = calendars.find((cal: any) => cal.url === calendarUrl);
        
        if (!targetCalendar) {
          errors.push('Calendar not found');
        } else {
          const calendarObjects = await client.fetchCalendarObjects({
            calendar: targetCalendar,
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
        }
      } catch (err) {
        errors.push(`Fetch error: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    }

    // Export from Firestore to CalDAV
    if (direction === 'export' || direction === 'bidirectional') {
      try {
        const calendars = await client.fetchCalendars();
        const targetCalendar = calendars.find((cal: any) => cal.url === calendarUrl);
        
        if (!targetCalendar) {
          errors.push('Calendar not found for export');
        } else {
          // Export calendar events (exclude those synced from CalDAV to avoid duplicates)
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
              
              await client.createCalendarObject({
                calendar: targetCalendar,
                filename: `${event.id}.ics`,
                iCalString: icsData,
              });
              
              exported++;
            } catch (err) {
              errors.push(`Export event error: ${err instanceof Error ? err.message : 'Unknown'}`);
            }
          }

          // Export shows as calendar events
          const showsSnapshot = await db
            .collection('shows')
            .get();

          for (const doc of showsSnapshot.docs) {
            try {
              const show = doc.data();
              // Convert show to calendar event format
              const event = {
                id: `show-${doc.id}`,
                title: `Show: ${show.city}, ${show.country}`,
                date: show.date?.slice(0, 10) || '', // YYYY-MM-DD
                endDate: show.endDate?.slice(0, 10),
                location: `${show.city}, ${show.country}`,
                description: `Status: ${show.status}\nFee: ${show.fee || 0}`,
              };
              
              const icsData = convertToICS(event);
              
              await client.createCalendarObject({
                calendar: targetCalendar,
                filename: `show-${doc.id}.ics`,
                iCalString: icsData,
              });
              
              exported++;
            } catch (err) {
              errors.push(`Export show error: ${err instanceof Error ? err.message : 'Unknown'}`);
            }
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

    if (!uidMatch?.[1] || !summaryMatch?.[1] || !dtStartMatch?.[1]) return null;

    return {
      id: uidMatch[1].trim(),
      title: summaryMatch[1].trim(),
      startDate: parseDateString(dtStartMatch[1].trim()),
      endDate: dtEndMatch?.[1] ? parseDateString(dtEndMatch[1].trim()) : null,
      location: locationMatch?.[1]?.trim() || undefined,
      notes: descriptionMatch?.[1]?.trim() || undefined,
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
