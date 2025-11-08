# External Calendar Sync & Export/Import Documentation

## Overview

The On Tour App now supports bidirectional synchronization with external calendars and professional export options. This enables seamless integration with your existing workflow and team collaboration.

## Features Implemented

### 1. Smart Calendar Sync (`SmartCalendarSync.tsx`)

Bidirectional integration with major calendar platforms:

#### Supported Services

- **Google Calendar** (OAuth 2.0)
  - Read/write access to calendar events
  - Automatic sync capabilities
  - Requires: `REACT_APP_GOOGLE_CLIENT_ID`

- **Apple Calendar / iCloud**
  - ICS feed integration
  - CalDAV support
  - Prompt-based URL entry for iCloud calendar sharing

- **Microsoft Outlook / Office 365**
  - OAuth 2.0 authentication
  - Microsoft Graph API integration
  - Requires: `REACT_APP_OUTLOOK_CLIENT_ID`

#### Sync Features

**Auto-Sync Modes:**

- Real-time (5-second intervals)
- Hourly
- Daily

**Connected Services Panel:**

- View which calendars are connected
- Connect/disconnect with single click
- Visual indicators for connection status
- Real-time sync status feedback

#### ICS Parsing

The component includes automatic ICS calendar file parsing for:

- Event UID and title extraction
- Date/time conversion
- Description and location parsing
- Automatic event categorization

#### Usage

```tsx
import SmartCalendarSync from './components/calendar/SmartCalendarSync';

<SmartCalendarSync
  events={calendarEvents}
  onSyncComplete={(syncedEvents, service) => {
    console.log(`Synced ${syncedEvents.length} events from ${service}`);
  }}
  onError={error => {
    console.error('Sync failed:', error);
  }}
/>;
```

---

### 2. Export/Import Panel (`ExportImportPanel.tsx`)

Professional export options for calendar sharing and backup.

#### Export Formats

##### PDF Export (NEW)

- **Use Case:** Professional itinerary sharing with managers, promoters, venues
- **Features:**
  - Beautiful, print-ready design
  - Event summary statistics
  - Color-coded event types
  - Styled tables with event details
  - Professional header with generation date
  - Optimized for both screen and print

- **Design Elements:**
  - Dark header with white text
  - Color-coded event type badges (shows, travel, meetings)
  - Summary boxes showing total events, shows, and travels
  - Striped table rows for readability
  - Print-friendly styling

##### ICS Calendar Format

- **Use Case:** Importing into Google Calendar, Outlook, Apple Calendar, or any CalDAV-compatible system
- **Features:**
  - Standard iCalendar format (RFC 5545)
  - Full event details: title, dates, status, categories
  - Description/notes preservation
  - Cancellation status support
  - Compatible with all modern calendar applications

##### CSV Spreadsheet Format

- **Use Case:** Data analysis, Excel/Google Sheets manipulation
- **Features:**
  - Comma-separated values
  - Headers: ID, Title, Type, Date, End Date, Status, Notes
  - Quoted fields for proper CSV parsing
  - All event metadata included

##### JSON Data Format

- **Use Case:** System backup and data portability
- **Features:**
  - Complete event data preservation
  - Formatted with 2-space indentation
  - Full CalEvent schema including optional fields
  - Version-proof format

#### Import Features

**Supported Import Formats:**

- `.ics` - iCalendar format (with basic parsing)
- `.csv` - Spreadsheet exports
- `.json` - Previous exports or external data

**Import Capabilities:**

- Drag-and-drop file upload
- Click-to-browse file selection
- Automatic format detection
- Event ID, title, type, dates, and notes preservation

#### Usage

```tsx
import { ExportImportPanel } from './components/calendar/ExportImportPanel';

<ExportImportPanel
  events={calendarEvents}
  onImport={importedEvents => {
    // Handle imported events
    mergeEvents(importedEvents);
  }}
/>;
```

---

## Setup Instructions

### Environment Variables Required

```bash
# For Google Calendar OAuth
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id

# For Microsoft Outlook OAuth
REACT_APP_OUTLOOK_CLIENT_ID=your-outlook-client-id
```

### OAuth Callback URLs

Configure these redirect URIs in your OAuth provider settings:

**Google:**

```
https://your-domain.com/auth/google/callback
```

**Microsoft:**

```
https://your-domain.com/auth/outlook/callback
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs
6. Copy Client ID to `.env` as `REACT_APP_GOOGLE_CLIENT_ID`

### Microsoft OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Register a new application
3. Add permissions for Calendars.ReadWrite
4. Create a client secret
5. Configure redirect URIs
6. Copy Client ID and secret to `.env`

---

## Use Cases & Workflows

### For Tour Managers

**Workflow:** Export tour itinerary and share with all team members

1. Click "Export & Import" panel
2. Select "PDF (Itinerary)"
3. Download professionally formatted itinerary
4. Share via email or internal management system
5. Team members can print, preview, or archive

**Benefits:**

- Clean, professional document for external stakeholders
- No need for separate document editing tools
- Always synchronized with latest calendar data

### For Promoters/Venues

**Workflow:** Share your shows and get them imported into promoter calendars

1. Export as "ICS (Calendar)"
2. Share the `.ics` file or URL
3. Promoters can import directly into Google Calendar, Outlook, or Apple Calendar
4. Changes sync automatically if using auto-sync feature

### For Team Collaboration

**Workflow:** Sync team calendars for real-time visibility

1. Connect Google Calendar or Outlook for each team member
2. Enable Auto-Sync (Daily or Hourly)
3. All changes propagate across team
4. Conflicts and overlaps automatically detected

### For Data Backup

**Workflow:** Regular backup of calendar data

1. Export as JSON monthly
2. Store in Google Drive, Dropbox, or local archive
3. Reimport if needed for disaster recovery
4. Maintain historical records of tour changes

---

## Technical Implementation Details

### ICS Parsing Algorithm

The component parses ICS files by:

1. Reading line-by-line
2. Looking for `BEGIN:VEVENT` and `END:VEVENT` markers
3. Extracting fields:
   - `UID:` → CalEvent.id
   - `SUMMARY:` → CalEvent.title
   - `DTSTART:` → CalEvent.date and start time
   - `DTEND:` → CalEvent.endDate and end time
   - `DESCRIPTION:` → CalEvent.notes
   - `LOCATION:` → Appended to title
4. Converting dates from `YYYYMMDD` format to `YYYY-MM-DD`

### PDF Generation

The PDF export:

1. Generates clean HTML with embedded CSS
2. Includes summary statistics (total events, shows, travels)
3. Creates sortable table of all events
4. Uses color-coding for event types
5. Provides print dialog for user
6. Supports browser print-to-PDF or direct download

### Auto-Sync Mechanism

```
Connected Services Set → useEffect on config/services change
                      ↓
              Interval Timer Started
                      ↓
    Every N seconds (realtime/hourly/daily)
                      ↓
      Promise.allSettled(all connected service syncs)
                      ↓
      Merge results, update UI, store last sync time
                      ↓
    Listen for changes in connected services or frequency
```

---

## Error Handling

**Common Issues & Solutions:**

| Issue                  | Cause                        | Solution                                                          |
| ---------------------- | ---------------------------- | ----------------------------------------------------------------- |
| "Popup blocked"        | Browser popup blocker        | Allow popups for the site                                         |
| "OAuth not configured" | Missing env variables        | Set `REACT_APP_GOOGLE_CLIENT_ID` or `REACT_APP_OUTLOOK_CLIENT_ID` |
| "ICS sync failed"      | Invalid URL or network error | Check URL is public/accessible                                    |
| "Import failed"        | Malformed file               | Verify file format matches declared type                          |
| "Sync timeout"         | Network issues               | Check connection, retry sync                                      |

---

## Future Enhancements

- Two-way event sync (local changes push to external calendars)
- Conflict resolution UI for duplicate events
- Selective field mapping for imports
- Calendar merge strategies (keep both, replace, skip)
- Scheduled exports (auto-backup to cloud storage)
- PDF customization (logo, colors, venue-specific branding)
- SMS/email reminders via calendar sync
- Team permission management for shared calendars

---

## API References

### SmartCalendarSync Props

```typescript
interface SmartCalendarSyncProps {
  events: CalEvent[];
  onSyncComplete?: (syncedEvents: CalEvent[], service: string) => void;
  onError?: (error: string) => void;
}
```

### ExportImportPanel Props

```typescript
interface ExportImportPanelProps {
  events: CalEvent[];
  onImport?: (events: CalEvent[]) => void;
}
```

### Export Formats Type

```typescript
type ExportFormat = 'ics' | 'csv' | 'json' | 'pdf';
```

---

## Support & Resources

- **Google Calendar API:** https://developers.google.com/calendar/
- **Microsoft Graph API:** https://docs.microsoft.com/en-us/graph/
- **iCalendar Format Spec:** https://tools.ietf.org/html/rfc5545
- **CalDAV Protocol:** https://tools.ietf.org/html/rfc7231
