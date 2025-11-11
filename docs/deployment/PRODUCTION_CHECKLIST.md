# 🚀 Production Deployment Checklist - On Tour App

## ✅ Pre-Deployment Checklist

### 1. Firebase Configuration (CRITICAL)

#### Firebase Console Setup:
- [ ] **Firebase Project Created**: `on-tour-app-712e2`
- [ ] **Authentication Enabled**:
  - [ ] Email/Password provider enabled
  - [ ] Google Sign-In enabled (optional)
  - [ ] Apple Sign-In enabled (optional)
- [ ] **Firestore Database Created**:
  - [ ] Database created in Production mode
  - [ ] Region selected (europe-west1 or us-central1)
  - [ ] Security rules published (see FIRESTORE_SETUP.md)
- [ ] **Authorized Domains Added**:
  - [ ] `localhost` (for dev)
  - [ ] `on-tour-app-beta.vercel.app` (your deployment domain)
  - [ ] `*.vercel.app` (for preview deployments)
  - [ ] Custom domain if applicable

#### Firestore Security Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Shows - users can only access their own shows
    match /shows/{showId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
    
    // Users - only owner can read/write
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == userId;
    }
    
    // Organizations (future)
    match /organizations/{orgId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationId == orgId;
    }
    
    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

### 2. Vercel Environment Variables (REQUIRED)

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

#### Firebase Variables (REQUIRED for user registration & data sync):
```bash
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=on-tour-app-712e2.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=on-tour-app-712e2
VITE_FIREBASE_STORAGE_BUCKET=on-tour-app-712e2.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**How to get these values:**
1. Firebase Console → Project Settings → General
2. Scroll to "Your apps" → Web app (</> icon)
3. Copy `firebaseConfig` values

#### Optional API Keys (App works without these):
```bash
# Skyscanner API (real flight search)
VITE_RAPIDAPI_KEY=your_rapidapi_key_here

# Amadeus Flight API (alternative)
VITE_AMADEUS_API_KEY=your_api_key_here
VITE_AMADEUS_API_SECRET=your_api_secret_here
```

**Important**: 
- Mark all variables for: **Production**, **Preview**, and **Development**
- After adding variables, trigger a new deployment

---

### 3. Build & Deployment Verification

#### Local Build Test:
```bash
cd "/Users/sergirecio/Documents/On Tour App 2.0"
npm run build
```

Expected output:
- ✅ No TypeScript errors
- ✅ All routes build successfully
- ✅ Bundle size reasonable (~5-6 MB total)
- ✅ Service worker generated

#### Backend Build Test:
```bash
cd backend
npm run build
```

Expected output:
- ✅ No circular dependency errors
- ✅ All entities compile

---

### 4. Data Isolation & Demo Users

#### Demo Users (Preserved):
These users work offline and don't sync to Firestore:
- **Agency Demo**: `agency@demo.com` / `demo` (or username: `agency`)
- **Artist Demo**: `artist@demo.com` / `demo` (or username: `artist`)
- **Generic Demo**: `demo@demo.com` / `demo` (or username: `demo`)
- **Prophecy**: `booking@prophecyofficial.com` / `Casillas123`
- **Danny Avila**: `danny@djdannyavila.com` / `demo`

#### Real Users (New Registrations):
- ✅ Register via `/register` page
- ✅ Firebase Auth creates user
- ✅ userId = Firebase UID
- ✅ Data saved to Firestore with `userId` field
- ✅ Each user sees only their own data
- ✅ Cross-device sync works automatically

#### Data Isolation Strategy:
1. **Demo users**: Use `localStorage` only, prefixed with `demo:` or `shows-store-v3`
2. **Real users**: Use Firestore with `userId` field for all documents
3. **Hybrid system**: `HybridShowService` handles both seamlessly
4. **No mixing**: Demo data never touches Firestore

---

### 5. Feature Testing Checklist

Test these flows with a **new user account**:

#### Registration & Onboarding:
- [ ] Register new account at `/register`
- [ ] Email validation works
- [ ] Password requirements enforced
- [ ] Firebase Auth creates user
- [ ] Redirect to `/onboarding`
- [ ] Complete onboarding flow
- [ ] Land on `/dashboard`

#### Core Features:
- [ ] **Shows**: Create, edit, delete shows
  - Data saves to Firestore
  - Shows visible after page refresh
  - Delete removes from Firestore
- [ ] **Finance**: Add transactions, view KPIs
- [ ] **Travel**: Search flights, create itineraries
- [ ] **Calendar**: View shows in month/week/day
- [ ] **Contacts**: Add venues, promoters

#### Data Persistence:
- [ ] Create 3 shows as User A
- [ ] Log out
- [ ] Log in as User A again
- [ ] All 3 shows still visible ✅
- [ ] Create new User B
- [ ] User B sees empty dashboard (no User A data) ✅

#### Cross-Device Sync:
- [ ] Log in as User A on Browser 1
- [ ] Create a show
- [ ] Log in as User A on Browser 2 (or incognito)
- [ ] Show appears automatically ✅

---

### 6. Performance & Optimization

#### Bundle Size:
Current production build:
- Main bundle: ~1.5 MB (heavy charts library)
- Total assets: ~6 MB
- Service worker: 34 KB

#### Optimization Done:
- ✅ Code splitting by route
- ✅ Lazy loading for heavy components
- ✅ Tree-shaking enabled
- ✅ Minification + compression
- ✅ Asset caching (1 year)

#### To Monitor:
- [ ] Lighthouse score > 85
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3.5s

---

### 7. Security Checklist

#### Frontend:
- ✅ No API keys in client code (all via env vars)
- ✅ Secure storage for sensitive data (`secureStorage.ts`)
- ✅ XSS protection headers in `vercel.json`
- ✅ HTTPS enforced by Vercel

#### Firestore:
- ✅ Security rules enforce user isolation
- ✅ No public read/write access
- ✅ All queries scoped to `request.auth.uid`

#### Firebase Auth:
- ✅ Password requirements: 8+ chars, upper, lower, number, special
- ✅ Email verification available (optional to enable)
- ✅ Rate limiting on login attempts

---

### 8. Known Limitations & Workarounds

#### Backend:
- ⚠️ **Not deployed**: Backend has circular dependencies, not needed for production
- ✅ **Workaround**: All data goes to Firestore directly from frontend
- ✅ **Future**: Fix backend for API endpoints if needed

#### OAuth Providers:
- ⚠️ **Google/Apple Sign-In**: Requires authorized domains (see FIREBASE_OAUTH_SETUP.md)
- ✅ **Workaround**: Email/password works perfectly
- ✅ **Fix**: Add domain to Firebase → Authentication → Authorized domains

#### Demo Data:
- ⚠️ **Demo users see fake data**: This is intentional for testing
- ✅ **Real users see clean slate**: No demo data pollution

---

### 9. Post-Deployment Testing

After deploying to Vercel:

#### Smoke Tests:
1. [ ] App loads without errors
2. [ ] Register new user works
3. [ ] Login with new user works
4. [ ] Create show → saves to Firestore
5. [ ] Logout → Login → show still there
6. [ ] No console errors (except OAuth warning if not configured)

#### User Acceptance Testing:
1. [ ] Invite 2-3 beta testers
2. [ ] Ask them to register and create shows
3. [ ] Verify they see only their own data
4. [ ] Check Firestore Console for saved documents

---

### 10. Rollback Plan

If deployment fails:

1. **Vercel**: Rollback to previous deployment
   - Dashboard → Deployments → Three dots → Promote to Production

2. **Firebase**: Restore previous rules
   - Firestore → Rules → Publish previous version

3. **Git**: Revert commits
   ```bash
   git revert HEAD
   git push origin main
   ```

---

## 🎯 Success Criteria

Production is ready when:
- ✅ 10 users can register independently
- ✅ Each user sees only their own shows/data
- ✅ Data persists across sessions
- ✅ Cross-device sync works
- ✅ No demo data appears for real users
- ✅ No critical console errors
- ✅ Lighthouse score > 85

---

## 📞 Support & Documentation

- **Firebase Setup**: See `FIREBASE_SETUP.md`
- **Firestore Setup**: See `FIRESTORE_SETUP.md`
- **OAuth Setup**: See `FIREBASE_OAUTH_SETUP.md`
- **Env Vars**: See `VERCEL_ENV_VARS.md`

---

## 🚨 Emergency Contacts

If something breaks in production:
1. Check Vercel deployment logs
2. Check Firebase Console → Authentication → Users
3. Check Firestore → Data (verify documents are being created)
4. Check browser console for errors
5. Rollback if critical

**Last Updated**: 2025-11-10
**Production URL**: https://on-tour-app-beta.vercel.app
**Firebase Project**: on-tour-app-712e2
