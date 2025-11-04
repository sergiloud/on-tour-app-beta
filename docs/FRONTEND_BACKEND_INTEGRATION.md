# 🔗 Frontend-Backend Integration Guide (FASE 6)

**Purpose**: Describe how the On Tour Frontend (React) integrates with the new FASE 6 backend  
**Status**: 🟡 PLANNING (backend in development)  
**Priority**: CRITICAL - Done after backend API endpoints are stable

---

## 📱 Current Frontend State

```
Frontend App (React 18)
├── Auth Context (localStorage JWT)
├── React Query (data fetching)
├── Offline Queue (idb storage)
├── Multi-tab Sync (BroadcastChannel)
└── Mock Data (in-memory shows)

✓ 408/449 tests passing
✓ Fully functional with mock data
✓ Ready to swap mock → real API
```

---

## 🔄 Integration Strategy

### Phase 1: API Client Setup (Week 2)

**File**: `src/lib/apiClient.ts` (NEW)

```typescript
// Create HTTP client with JWT interceptor
const apiClient = createApiClient({
  baseURL: import.meta.env.VITE_API_URL,
  getToken: () => localStorage.getItem('jwt_token'),
  onUnauthorized: () => navigate('/login'), // Redirect if 401
});

// Usage
const response = await apiClient.get('/shows');
```

### Phase 2: Replace Mock Data with Real API (Week 2-3)

**File**: `src/hooks/useShowsQuery.ts` (MODIFY)

```typescript
// BEFORE (mock data)
export function useShowsQuery() {
  return useQuery({
    queryKey: ['shows'],
    queryFn: () => Promise.resolve(mockShowsData), // Mock
  });
}

// AFTER (real API)
export function useShowsQuery() {
  return useQuery({
    queryKey: ['shows'],
    queryFn: async () => {
      const response = await apiClient.get('/api/shows');
      return response.data;
    },
  });
}
```

### Phase 3: Authentication Flow (Week 2)

**File**: `src/context/AuthContext.tsx` (MODIFY)

```typescript
// NEW: OAuth2 Login Handler
const handleGoogleLogin = async () => {
  // Redirect to backend OAuth endpoint
  window.location.href = `${API_URL}/api/auth/google`;
};

// NEW: JWT Token Handling
useEffect(() => {
  // Check if backend redirected us with token
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  
  if (token) {
    localStorage.setItem('jwt_token', token);
    navigate('/dashboard');
  }
}, []);
```

---

## 🌐 API Contract

### Authentication

```http
POST /api/auth/google
Response: Redirects to frontend with ?token=<jwt>

GET /api/auth/profile
Headers: Authorization: Bearer <jwt>
Response: {
  id: "uuid",
  email: "user@example.com",
  name: "User Name",
  organization: { id: "uuid", name: "org" }
}
```

### Shows

```http
GET /api/shows
Headers: Authorization: Bearer <jwt>
Response: [{
  id: "uuid",
  name: "Show Name",
  venue: "Venue Name",
  city: "City",
  country: "US",
  show_date: "2025-11-20",
  door_time: "20:00",
  show_time: "21:00",
  end_time: "23:30",
  status: "scheduled",
  metadata: {}
}, ...]

POST /api/shows
Body: {
  name: "Show Name",
  venue: "Venue Name",
  show_date: "2025-11-20",
  door_time: "20:00",
  show_time: "21:00"
}
Response: { id: "uuid", ...show }

PUT /api/shows/:id
Body: { name: "Updated Name", ... }
Response: { id: "uuid", ...updated_show }

DELETE /api/shows/:id
Response: { success: true }
```

### Finance

```http
GET /api/finance/overview
Response: {
  total_revenue: 50000.00,
  total_expenses: 12000.00,
  net_profit: 38000.00,
  currency: "USD",
  by_show: [...]
}

POST /api/finance/records
Body: {
  show_id: "uuid",
  amount: 1000.00,
  currency: "USD",
  category: "venue_fee",
  description: "Venue commission"
}
Response: { id: "uuid", ...record }
```

---

## 🧪 Testing Integration

### New Tests to Add

**File**: `src/__tests__/integration.api.test.ts`

```typescript
describe('API Integration', () => {
  beforeEach(() => {
    // Mock apiClient
    vi.mock('lib/apiClient');
  });

  it('fetches shows from backend', async () => {
    const { result } = renderHook(() => useShowsQuery());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(5);
  });

  it('sends JWT with every request', async () => {
    localStorage.setItem('jwt_token', 'test-token');
    await apiClient.get('/shows');
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      })
    );
  });
});
```

---

## 📝 Environment Configuration

### `.env` (Frontend)

```env
# Add new variable
VITE_API_URL=http://localhost:3001

# Keep existing
VITE_AMADEUS_CLIENT_ID=your-id
# ...
```

### `.env` (Backend)

```env
# Set CORS origin to frontend
CORS_ORIGIN=http://localhost:5173

# Production: use actual domain
# CORS_ORIGIN=https://on-tour-app.com
```

---

## 🔐 Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│ Frontend: Login Page                                │
└────────────────┬────────────────────────────────────┘
                 │
                 │ Click "Sign in with Google"
                 ▼
┌─────────────────────────────────────────────────────┐
│ Redirect to: /api/auth/google                       │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Backend: OAuth2 Flow                                │
│ 1. Redirect to Google                               │
│ 2. User authorizes                                  │
│ 3. Google redirects back                            │
│ 4. Create/Update user in DB                         │
└────────────────┬────────────────────────────────────┘
                 │
                 │ Generate JWT token
                 ▼
┌─────────────────────────────────────────────────────┐
│ Backend: Redirect to                                │
│ /callback?token=eyJhbGc...                          │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Frontend: Extract token from URL                    │
│ Save to localStorage                                │
│ Redirect to /dashboard                              │
└────────────────┬────────────────────────────────────┘
                 │
                 │ All subsequent requests
                 │ Authorization: Bearer <token>
                 ▼
┌─────────────────────────────────────────────────────┐
│ Frontend: Dashboard (authenticated)                 │
│ Fetching shows, finance, etc. with JWT              │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Implementation Timeline

### Week 2: Backend Complete → Frontend Integration Starts

```
Monday-Tuesday:
  ✓ Backend: Shows CRUD working
  ✓ Backend: OAuth2 login working
  
Wednesday:
  → Frontend: Create apiClient.ts
  → Frontend: Update useShowsQuery hook
  → Frontend: Test with backend
  
Thursday:
  → Frontend: Implement OAuth2 login
  → Frontend: Test full auth flow
  
Friday:
  → Frontend: Finish all integrations
  → Frontend: E2E testing
  → Demo working flow
```

---

## 🎯 Validation Checklist

Before going to production:

- [ ] Frontend loads shows from backend API
- [ ] Finance calculations work with real data
- [ ] Create/Update/Delete shows works
- [ ] OAuth2 login completes successfully
- [ ] JWT is properly sent in all requests
- [ ] Logout clears JWT and redirects
- [ ] Refresh token works (if implemented)
- [ ] Error handling works (400, 401, 500)
- [ ] Multi-user operations don't conflict
- [ ] Offline queue syncs with backend on reconnect

---

## 🔄 Backward Compatibility

### Keeping Mock Data (Fallback)

```typescript
export function useShowsQuery() {
  const { data } = useQuery({
    queryKey: ['shows'],
    queryFn: async () => {
      try {
        return await apiClient.get('/api/shows');
      } catch (error) {
        // Fallback to mock data if backend unavailable
        console.warn('Backend unavailable, using mock data');
        return mockShowsData;
      }
    },
  });
}
```

This allows development to continue even if backend isn't ready.

---

## 📊 Data Synchronization

### Multi-Tab Sync with Backend

```typescript
// When backend is available, sync between tabs
// AND with backend
export function useShowsQuery() {
  const { data } = useQuery({
    queryKey: ['shows'],
    queryFn: async () => {
      const serverData = await apiClient.get('/api/shows');
      
      // Broadcast to other tabs
      broadcastChannel.postMessage({
        type: 'shows_updated',
        data: serverData
      });
      
      return serverData;
    },
  });
}
```

---

## 🐛 Common Issues & Fixes

### Issue 1: CORS Error

```
Error: Access to XMLHttpRequest blocked by CORS policy

Fix: Verify CORS_ORIGIN in backend .env
CORS_ORIGIN=http://localhost:5173
```

### Issue 2: JWT Expired

```
Error: 401 Unauthorized

Fix: Implement token refresh
- Save refresh token
- Intercept 401 errors
- Request new token
- Retry original request
```

### Issue 3: Network Error

```
Error: Failed to fetch

Fix: Check
- Backend is running (npm run dev)
- API_URL is correct
- Network tab shows request
- CORS headers present
```

---

## 📚 Files to Modify

### New Files (Frontend)

- `src/lib/apiClient.ts` - HTTP client with JWT
- `src/hooks/useApiQuery.ts` - React Query wrapper
- `src/__tests__/integration.api.test.ts` - Integration tests

### Modified Files (Frontend)

- `src/hooks/useShowsQuery.ts` - Use real API
- `src/context/AuthContext.tsx` - OAuth2 flow
- `src/.env.example` - Add VITE_API_URL
- `src/types/api.ts` - API response types

### New Files (Backend)

- [Already created in FASE 6 setup]

---

## ✅ Success Criteria

- ✅ Frontend shows data from backend API
- ✅ CRUD operations work end-to-end
- ✅ Authentication flow complete
- ✅ Tests cover integration points
- ✅ Error handling is robust
- ✅ Performance is acceptable
- ✅ Offline mode still works

---

**Status**: Ready to implement after backend Week 1 complete  
**Next**: Backend development continues in parallel

