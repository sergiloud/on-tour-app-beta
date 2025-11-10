# Vercel Deployment Guide - On Tour App Beta

## 🚀 Deployment Setup

### Step 1: Configure Environment Variables in Vercel

The app requires Firebase environment variables to work properly. **Without these, you'll see authentication errors.**

#### Required Variables:

1. Go to your Vercel dashboard
2. Select your `on-tour-app-beta` project
3. Go to **Settings** > **Environment Variables**
4. Add the following variables:

```bash
# Firebase Configuration (REQUIRED)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 2: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one - see `FIREBASE_SETUP.md`)
3. Click the gear icon ⚙️ > **Project Settings**
4. Scroll to **Your apps** section
5. Select your web app or create one
6. Copy the `firebaseConfig` values

### Step 3: Set Variables in Vercel

For each variable above:
1. Click **Add New**
2. **Name**: `VITE_FIREBASE_API_KEY` (exact name)
3. **Value**: Your actual Firebase API key
4. **Environment**: Select `Production`, `Preview`, and `Development`
5. Click **Save**

Repeat for all 7 variables.

### Step 4: Redeploy

1. After adding all variables, go to **Deployments**
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Select **Use existing Build Cache** ✅
5. Click **Redeploy**

---

## ✅ Verification

After deployment with environment variables:

- ✅ App should load without Firebase errors
- ✅ Authentication should work
- ✅ No console errors about invalid API keys

## ❌ Common Issues

### Issue: `Firebase: Error (auth/invalid-api-key)`
- **Cause**: Missing or incorrect Firebase environment variables
- **Fix**: Double-check all Firebase variables are set correctly in Vercel

### Issue: `Cannot access 'Q' before initialization`
- **Cause**: Fixed in latest build with improved chunk configuration
- **Fix**: Redeploy with latest code (already fixed)

### Issue: Node.js version warning
- **Cause**: Fixed - now using Node.js 22.x
- **Fix**: Already applied in latest build

---

## 📞 Support

If you continue seeing Firebase errors after setting environment variables:
1. Verify all 7 Firebase variables are set
2. Check Firebase Console that the web app is properly configured
3. Make sure the Firebase project has Authentication enabled
4. Redeploy after making changes