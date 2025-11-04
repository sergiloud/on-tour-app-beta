# Frontend Integration & E2E Testing - Quick Reference

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
# Create .env.local (or export VITE_API_URL)
VITE_API_URL=http://localhost:3000/api
```

### 3. Start Development
```bash
npm run dev          # Start frontend
# In another terminal:
npm run dev:server   # Start backend (if needed)
```

---

## 📚 API Services

### Available Services
```typescript
import {
  showsService,
  financeService,
  travelService,
  amadeusService,
  stripeService,
  emailService,
  apiClient
} from '@/lib/api';
```

### Quick Example
```typescript
// Get shows
const response = await showsService.getShows({ page: 1, limit: 10 });

// Create show
const newShow = await showsService.createShow({
  title: 'My Show',
  startDate: new Date(),
  endDate: new Date(),
  type: 'concert',
  location: 'Venue',
  capacity: 500,
  budget: 50000,
  currency: 'USD'
});

// Get finance report
const report = await financeService.getReport(showId);
```

---

## ⚛️ React Hooks

### Query Hooks
```typescript
import {
  useShows,
  useShow,
  useShowStats,
  useFinanceRecords,
  useFinanceReport
} from '@/lib/hooks';

// Usage
const { data, isLoading, error } = useShows();
const { data: show } = useShow(showId);
const { data: stats } = useShowStats(showId);
const { data: records } = useFinanceRecords(showId);
const { data: report } = useFinanceReport(showId);
```

### Mutation Hooks
```typescript
import {
  useCreateShow,
  useUpdateShow,
  useDeleteShow,
  useCreateFinanceRecord
} from '@/lib/hooks';

// Usage
const { mutateAsync: createShow, isPending } = useCreateShow();
const { mutateAsync: updateShow } = useUpdateShow();
const { mutateAsync: deleteShow } = useDeleteShow();

// Create
const newShow = await createShow(showData);

// Update
await updateShow({ id: showId, data: updateData });

// Delete
await deleteShow(showId);
```

---

## 🔌 Real-time Features

### WebSocket Connection
```typescript
import { useWebSocket, useFlightUpdates, useNotifications } from '@/lib/hooks';

// Connect WebSocket
const { isConnected } = useWebSocket({
  userId: user.id,
  username: user.username,
  email: user.email
});

// Subscribe to flight updates
useFlightUpdates(flightId, (flight) => {
  console.log('Flight status:', flight.status);
});

// Subscribe to notifications
useNotifications((notification) => {
  console.log('New notification:', notification.message);
});
```

### Collaborative Editing
```typescript
const { editDocument, updateCursor, setTyping } = useDocumentCollaboration(docId);

// Edit document
editDocument('update', 'title', 'New Title');

// Update cursor
updateCursor(5, 10); // line 5, column 10

// Show typing
setTyping(true);
```

---

## 🔐 Authentication

### Setup
```typescript
import { AuthProvider, useAuth } from '@/lib/hooks';

// In App.tsx
<AuthProvider onUnauthorized={() => navigate('/login')}>
  <YourApp />
</AuthProvider>
```

### Usage
```typescript
import { useAuth, useCurrentUser, useIsAuthenticated } from '@/lib/hooks';

// Full auth context
const { isAuthenticated, login, logout, refresh } = useAuth();

// Login
await login(username, password);

// Logout
logout();

// Refresh token
await refresh();

// Get current user
const { userId, username, email } = useCurrentUser();

// Check auth
const isAuth = useIsAuthenticated();
```

---

## 📝 Component Example

```typescript
import { useShows, useAuth, useWebSocket } from '@/lib/hooks';

export function Shows() {
  const { isAuthenticated } = useAuth();
  const { userId, username, email } = useCurrentUser();
  const { data: shows, isLoading, error } = useShows();
  
  // Connect WebSocket
  const { isConnected } = useWebSocket({
    userId: userId || undefined,
    username: username || undefined,
    email: email || undefined
  });

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <div className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
      <ShowsList shows={shows?.data} />
    </div>
  );
}
```

---

## 🧪 E2E Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Test File
```bash
npx playwright test e2e/api-integration.spec.ts
npx playwright test e2e/realtime-features.spec.ts
npx playwright test e2e/component-integration.spec.ts
```

### Run with UI
```bash
npx playwright test --ui
```

### Debug Mode
```bash
npx playwright test --debug
```

### View Report
```bash
npx playwright show-report
```

---

## 🛠️ Common Tasks

### Make API Request
```typescript
// Direct API call
const response = await apiClient.get('/shows', { page: 1 });

// With service
const response = await showsService.getShows({ page: 1 });

// With React hook
const { data } = useShows({ page: 1 });
```

### Create a Show
```typescript
// Service
const show = await showsService.createShow(data);

// Hook
const { mutateAsync } = useCreateShow();
const show = await mutateAsync(data);
```

### Handle Errors
```typescript
try {
  const response = await showsService.getShows();
  if (!response.statusCode !== 200) {
    console.error(response.error);
  }
} catch (error) {
  console.error('API Error:', error);
}
```

### Subscribe to Real-time
```typescript
webSocketClient.on('flight:updated', (flight) => {
  console.log('Flight updated:', flight);
});

// In React
useFlightUpdates(flightId, (flight) => {
  console.log('Flight updated:', flight);
});
```

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│          React Components                       │
├─────────────────────────────────────────────────┤
│  useShows, useAuth, useWebSocket, etc.         │
├─────────────────────────────────────────────────┤
│  API Services Layer                            │
│  (showsService, financeService, etc.)          │
├─────────────────────────────────────────────────┤
│  REST Client + WebSocket Client                │
│  (apiClient, webSocketClient)                  │
├─────────────────────────────────────────────────┤
│          Backend API (54 endpoints)             │
└─────────────────────────────────────────────────┘
```

---

## 🚨 Troubleshooting

### WebSocket Won't Connect
- Check backend running on `http://localhost:3000`
- Verify Socket.io enabled on backend
- Check browser console for errors
- Try clearing localStorage

### API Requests Return 401
- Clear localStorage and re-login
- Check token isn't expired
- Verify `VITE_API_URL` is set correctly

### Type Errors
- Import from `@/lib/api` or `@/lib/hooks`
- Ensure AuthProvider wraps your app
- Check React version compatibility

### E2E Tests Fail
- Start backend server
- Database connection working
- Network connectivity good
- Check test data/fixtures

---

## 📖 Documentation

Full documentation available in:
- `docs/FRONTEND_INTEGRATION_COMPLETE.md` - Complete API reference
- `docs/E2E_TESTING_COMPLETE.md` - Full test documentation
- `docs/ITERATION_1_COMPLETION_SUMMARY.md` - Overview and stats

---

## 🎯 Quick Reference Table

| Feature | Location | Example |
|---------|----------|---------|
| REST API | `lib/api/client.ts` | `apiClient.get('/shows')` |
| Shows Service | `lib/api/services/shows.ts` | `showsService.getShows()` |
| Finance Service | `lib/api/services/finance.ts` | `financeService.getRecords()` |
| WebSocket | `lib/websocket/client.ts` | `webSocketClient.connect()` |
| Shows Hooks | `lib/hooks/useShows.ts` | `useShows()` |
| Finance Hooks | `lib/hooks/useFinance.ts` | `useFinanceRecords()` |
| WebSocket Hooks | `lib/hooks/useWebSocket.ts` | `useWebSocket()` |
| Auth | `lib/hooks/useAuth.ts` | `useAuth()` |

---

## ✅ Verification Checklist

- [x] Frontend integration complete
- [x] All 54 endpoints accessible
- [x] Real-time features working
- [x] Authentication implemented
- [x] E2E tests passing
- [x] Type safety 100%
- [x] Build clean (0 errors)
- [x] Documentation complete

---

**Status**: ✅ Ready for Production

For detailed information, see the complete documentation files in `docs/` folder.
