# Vite Optimize Dep Fix - 504 Error Solution

## Problem

When starting the dev server, you see errors like:
```
Failed to load resource: the server responded with a status of 504 (Outdated Optimize Dep)
```

This happens when Vite's dependency pre-bundling cache becomes stale or corrupted.

## Solution

### Quick Fix (What We Just Did)

```bash
# 1. Stop the dev server (Ctrl+C)

# 2. Remove Vite cache
rm -rf .vite
rm -rf node_modules/.vite

# 3. Restart dev server
npm run dev
```

### If That Doesn't Work

```bash
# Full clean rebuild:
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vite

# Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)

# Restart dev server
npm run dev
```

### Nuclear Option (Last Resort)

```bash
# Remove all dependencies and reinstall
rm -rf node_modules
rm package-lock.json

# Reinstall fresh
npm install

# Start dev server
npm run dev
```

## Prevention

This is usually a temporary issue that Vite handles automatically. To prevent:

1. **Keep Vite updated**
   ```bash
   npm update vite
   ```

2. **Clear cache periodically**
   ```bash
   rm -rf .vite node_modules/.vite
   ```

3. **Hard refresh browser** after starting dev server
   - Mac: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`

## Current Status

✅ **Dev server is running** on `http://localhost:3000`
✅ **Cache cleared**
✅ **Fresh Vite rebuild** in progress
✅ **Browser should load correctly now**

---

## What Happened

Vite pre-bundles dependencies (React, React Query, etc.) for faster development. When this cache gets out of sync (usually after updates or interrupted builds), it causes 504 errors.

The fix is to:
1. Clear the `.vite/` cache directory
2. Clear `node_modules/.vite/` directory  
3. Restart Vite so it rebuilds the cache
4. Hard refresh the browser

This is safe and doesn't affect your code - it just rebuilds development dependencies.

---

**Time to Fix**: ~30 seconds
**Risk**: None (only affects dev cache)
**Frequency**: Rarely (usually automatic)
