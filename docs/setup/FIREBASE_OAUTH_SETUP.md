# Firebase OAuth Configuration for Vercel Deployment

## Issue
The Firebase OAuth is not working on Vercel because the domain is not authorized.

**Error Message:**
```
The current domain is not authorized for OAuth operations. 
Add your domain (on-tour-app-beta.vercel.app) to the OAuth redirect domains list.
```

## Solution Steps

### 1. Go to Firebase Console
Visit: https://console.firebase.google.com/

### 2. Select Your Project
Click on your project (the one configured in your `.env` files)

### 3. Navigate to Authentication Settings
1. Click on **Authentication** in the left sidebar
2. Click on **Settings** tab at the top
3. Click on **Authorized domains** tab

### 4. Add Vercel Domains
Click **Add domain** and add the following domains:

**Required domains:**
- `on-tour-app-beta.vercel.app` (your current beta deployment)
- `*.vercel.app` (for preview deployments)

**Optional (if you have a custom domain):**
- Your production domain (e.g., `ontourapp.com`)
- `www.ontourapp.com`

### 5. Save Changes
Click **Add** for each domain and wait for Firebase to process the changes (usually instant).

## Verification

After adding the domains, test the authentication:

1. Visit: `https://on-tour-app-beta.vercel.app/login`
2. Try to login with Google/Apple sign-in
3. The OAuth popup should now work correctly

## Environment Variables Checklist

Verify these are set in Vercel:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Additional Notes

### For Email/Password Authentication
Email/password login (like Prophecy user `booking@prophecyofficial.com`) doesn't require OAuth and will work without authorized domains.

### For Development
`localhost` and `127.0.0.1` are automatically authorized by Firebase.

### Common Issues

**Issue**: Domain still not working after adding
**Solution**: 
- Wait 5-10 minutes for DNS propagation
- Clear browser cache
- Try incognito/private mode

**Issue**: Preview deployments not working
**Solution**: 
- Add `*.vercel.app` as an authorized domain (includes all preview URLs)

## Current Authentication Methods

Your app currently supports:
- ✅ **Email/Password** - Works everywhere (no OAuth required)
- ⚠️ **Google Sign-In** - Requires authorized domain
- ⚠️ **Apple Sign-In** - Requires authorized domain

## Testing Without OAuth

If you can't configure Firebase right now, users can still:
1. Use demo credentials (agency, artist, demo users)
2. Use Prophecy credentials: `booking@prophecyofficial.com` / `Casillas123`
3. Create accounts (when email/password is enabled)

All features except OAuth sign-in will work perfectly with localStorage/Firestore backup.
