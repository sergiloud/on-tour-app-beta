# Vercel Deployment Configuration

## IMPORTANT: Required Vercel Settings

To deploy this monorepo correctly, you MUST configure the following in your Vercel project settings:

### Project Settings → General

1. **Root Directory**: `on-tour-app`
   - This tells Vercel where the actual application code lives
2. **Framework Preset**: `Vite`

   - Auto-detected, but verify it's set to Vite

3. **Build Command**: `npm run build` (default is fine)

4. **Output Directory**: `dist` (default is fine)

5. **Install Command**: `npm install --legacy-peer-deps`
   - Override the default to use legacy peer deps flag

### Environment Variables (if needed)

- `NODE_VERSION`: `20`

## Why this configuration?

The repository has this structure:

```
/
├── on-tour-app/          ← Main application
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
├── backend/              ← Backend API (separate)
└── vercel.json          ← Deployment config
```

Vercel needs to know to build from the `on-tour-app` directory, not the repository root.

## Manual Configuration Steps

1. Go to your Vercel project dashboard
2. Click **Settings**
3. Navigate to **General**
4. Find **Root Directory**
5. Click **Edit**
6. Enter: `on-tour-app`
7. Click **Save**

After this, deployments should work automatically!
