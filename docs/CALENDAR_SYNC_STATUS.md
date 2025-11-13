# Calendar Sync Implementation Status

## ✅ COMPLETED

### Backend Core (874 lines)
- ✅ **CalDAV Client** (`backend/src/services/caldav/caldavClient.ts` - 349 lines)
  - Connect to CalDAV servers (iCloud, Google, Outlook)
  - CRUD operations for calendar events
  - iCalendar format conversion (ICS)
  
- ✅ **Sync Service** (`backend/src/services/caldav/calendarSyncService.ts` - 370 lines)
  - Bidirectional sync orchestration
  - Import from CalDAV → Firestore
  - Export from Firestore → CalDAV
  - Conflict resolution (last-write-wins)
  - Change tracking

- ✅ **API Routes** (`backend/src/routes/calendarSync.ts` - 155 lines)
  - `POST /api/calendar-sync/connect` - Test connection & list calendars
  - `POST /api/calendar-sync/enable` - Enable sync
  - `POST /api/calendar-sync/disable` - Disable sync
  - `POST /api/calendar-sync/sync-now` - Manual sync trigger
  - `GET /api/calendar-sync/status` - Get sync status

### Backend Integration
- ✅ **Routes Registered** (`backend/src/index.ts`)
  - Imported `calendarSyncRouter`
  - Registered at `/api/calendar-sync` with auth middleware

### Background Worker
- ✅ **Auto-Sync Worker** (`backend/src/workers/calendarSyncWorker.ts`)
  - Cron job: every 5 minutes
  - Syncs all users with sync enabled
  - Parallel processing for multiple users
  - Error handling & logging
  - Initialized in `backend/src/index.ts`

### Frontend UI
- ✅ **CalendarSyncSettings Component** (`src/components/settings/CalendarSyncSettings.tsx` - 345 lines)
  - iCloud connection form with app-specific password
  - Calendar selection UI
  - Sync direction options (import/export/bidirectional)
  - Sync now button
  - Connection status display
  - Setup instructions modal with link to appleid.apple.com
  - Toast notifications

- ✅ **API Client** (`src/services/calendarSyncApi.ts` - 146 lines)
  - TypeScript interfaces
  - All API endpoint functions
  - Error handling

### Dependencies
- ✅ **npm packages installed**:
  - `tsdav` - CalDAV protocol client
  - `uuid` - Event IDs
  - `ical.js` - iCalendar parsing
  - `node-cron` - Background jobs
  - `@types/uuid`, `@types/node-cron` - TypeScript types

### Documentation
- ✅ **Architecture Plan** (`docs/CALENDAR_SYNC_PLAN.md`)
  - Complete technical design
  - API specifications
  - Security considerations
  - 21-day implementation roadmap

---

## ⚠️ KNOWN ISSUES

### TypeScript Errors

#### CalDAV Client (`caldavClient.ts`)
```typescript
// Line 42: Client type mismatch
this.client = await createDAVClient({ ... });
// Expected: DAVClient with login(), serverUrl, credentials
// Actual: Different interface from tsdav

// Line 52: Possible null
await this.client.login();
// Need: Add null check before calling login()

// Lines 138, 158: Wrong parameter structure
createCalendarObject({
  calendar: { url: calendarUrl },  // ❌ Wrong
  calendarObject: { ... }          // ✅ Correct
});
```

**Fix needed**: 
- Review `tsdav` documentation for correct API usage
- Add null checks for `this.client`
- Fix `createCalendarObject` and `updateCalendarObject` parameters

---

## 🔧 TODO (Before Production)

### Critical
1. **Fix TypeScript errors in CalDAV client**
   - Update API calls to match `tsdav` library
   - Add proper type guards

2. **Security: Replace password encryption**
   - Current: Base64 encoding (insecure)
   - Required: AES-256-GCM encryption
   - Library: `crypto` (Node.js built-in)

3. **Get real user ID from AuthContext**
   - Replace all `'current-user-id'` hardcoded strings
   - Use `useAuth()` hook in frontend
   - Extract `userId` from Firebase Auth token in backend

### Important
4. **Error handling improvements**
   - More granular error messages
   - Retry logic for network failures
   - Sync conflict UI (if last-write-wins insufficient)

5. **Testing**
   - Unit tests for CalDAV client
   - Integration tests for sync service
   - E2E tests for full sync flow
   - Test with real iCloud calendar

6. **Performance**
   - Add pagination for large calendars (>100 events)
   - Optimize Firestore queries (add indexes)
   - Cache calendar list to reduce API calls

### Nice to Have
7. **UX Enhancements**
   - Show sync progress (e.g., "Syncing 50/100 events")
   - Visual diff for conflicts
   - Selective event sync (filter by type/date)

8. **Features**
   - Support for recurring events
   - Map On Tour custom fields to iCal X-properties
   - Multi-calendar sync (sync multiple calendars)
   - Real-time sync via webhooks (replace polling)

9. **Analytics**
   - Track sync success/failure rates
   - Monitor sync latency
   - Alert on repeated failures

---

## 📋 Integration Checklist

### Before Testing
- [ ] Fix TypeScript errors in `caldavClient.ts`
- [ ] Add user authentication (replace hardcoded IDs)
- [ ] Test backend routes with Postman/curl
- [ ] Verify Firestore collections created correctly

### Testing Steps
1. **Connection Test**
   ```bash
   POST /api/calendar-sync/connect
   {
     "provider": "icloud",
     "email": "test@icloud.com",
     "password": "xxxx-xxxx-xxxx-xxxx",
     "userId": "test-user"
   }
   ```
   Expected: List of calendars

2. **Enable Sync**
   ```bash
   POST /api/calendar-sync/enable
   {
     "calendarUrl": "https://...",
     "direction": "bidirectional",
     "credentials": { ... },
     "userId": "test-user"
   }
   ```
   Expected: `{ success: true }`

3. **Manual Sync**
   ```bash
   POST /api/calendar-sync/sync-now
   { "userId": "test-user" }
   ```
   Expected: `{ imported: X, exported: Y }`

4. **Check Status**
   ```bash
   GET /api/calendar-sync/status?userId=test-user
   ```
   Expected: Sync config + last sync time

### Integration with Settings Page
- [ ] Add `CalendarSyncSettings` to Profile/Settings page
- [ ] Add navigation link/tab
- [ ] Test full user flow from settings

---

## 🚀 Next Session Plan

1. **Fix CalDAV Client** (30 min)
   - Review tsdav docs
   - Fix type errors
   - Add null checks

2. **Security Upgrade** (20 min)
   - Implement AES-256 encryption
   - Store encryption key in env variable

3. **Auth Integration** (15 min)
   - Add `useAuth()` to CalendarSyncSettings
   - Extract userId from context
   - Update backend to verify Firebase tokens

4. **Testing** (30 min)
   - Generate app-specific password from iCloud
   - Test connection with real calendar
   - Verify sync works bidirectionally

5. **Polish** (15 min)
   - Add loading states
   - Improve error messages
   - Add success confirmations

---

## 📁 File Structure

```
backend/
├── src/
│   ├── services/
│   │   └── caldav/
│   │       ├── caldavClient.ts          ✅ 349 lines
│   │       └── calendarSyncService.ts   ✅ 370 lines
│   ├── routes/
│   │   └── calendarSync.ts              ✅ 155 lines
│   ├── workers/
│   │   └── calendarSyncWorker.ts        ✅ 97 lines
│   └── index.ts                         ✅ Updated

src/
├── components/
│   └── settings/
│       └── CalendarSyncSettings.tsx     ✅ 345 lines
└── services/
    └── calendarSyncApi.ts               ✅ 146 lines

docs/
└── CALENDAR_SYNC_PLAN.md                ✅ Complete

Total new code: ~1,462 lines
```

---

## 💡 Key Implementation Details

### CalDAV Protocol
- Uses standard RFC 4791 (CalDAV)
- iCalendar format (RFC 5545)
- WebDAV PROPFIND/REPORT methods

### Sync Strategy
- **Polling**: Every 5 minutes (cron)
- **Bidirectional**: Import + Export
- **Conflict Resolution**: Last-write-wins (simple MVP)
- **Change Tracking**: Store lastModified timestamps

### iCloud Specifics
- **Server URL**: `https://caldav.icloud.com`
- **Auth**: Username (Apple ID) + app-specific password
- **Principal**: `/[DSID]/principal/`
- **Calendars**: `/[DSID]/calendars/[calendarId]/`

### Event Mapping
| On Tour | iCalendar |
|---------|-----------|
| `id` | `UID` |
| `title` | `SUMMARY` |
| `startDate` | `DTSTART` |
| `endDate` | `DTEND` |
| `location` | `LOCATION` |
| `notes` | `DESCRIPTION` |
| `type` | `CATEGORIES` |

Custom On Tour fields (like `showId`, `revenue`) are not synced (potential future: use X-properties).

---

## 🔐 Security Notes

### Current Implementation (Prototype)
- ✅ HTTPS for CalDAV connections
- ✅ App-specific passwords (not main Apple ID password)
- ⚠️ Base64 encoding (NOT secure - placeholder only)
- ✅ Server-side credential storage (Firestore)

### Production Requirements
- 🔴 **CRITICAL**: Replace Base64 with AES-256-GCM encryption
- 🔴 **CRITICAL**: Store encryption key in environment variable (not in code)
- 🟡 Consider using secret management service (AWS Secrets Manager, etc.)
- 🟡 Add credential rotation mechanism
- 🟡 Implement OAuth2 for supported providers (Google Calendar)

---

## 📊 Performance Considerations

### Current Design
- **Polling Interval**: 5 minutes (configurable in cron)
- **Parallel Sync**: All users processed simultaneously
- **Event Limit**: No pagination (assumes <1000 events/calendar)

### Bottlenecks
- Firestore reads/writes (sync all events each time)
- CalDAV API rate limits (especially iCloud)
- Network latency for large calendars

### Optimizations (Future)
- Incremental sync (only changed events)
- Pagination for large calendars
- Cache calendar metadata
- Use ETags for efficient polling
- WebSocket/webhook for real-time sync
