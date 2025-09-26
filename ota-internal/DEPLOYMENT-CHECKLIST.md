# OTA Deployment Checklist

## Prerequisites Setup

### 1. Supabase Project Setup
- [ ] Create Supabase project at https://supabase.com
- [ ] Go to Settings > API and copy:
  - Project URL
  - Anon public key
- [ ] Run database schema from `database/schema.sql`
- [ ] Configure Row Level Security policies
- [ ] Test database connection

### 2. Environment Configuration
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in Supabase credentials:
```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Vercel Setup
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Connect GitHub repository to Vercel
- [ ] Configure environment variables in Vercel dashboard
- [ ] Set up automatic deployments

## Pre-Deployment Testing

### Local Testing
- [ ] `npm install` - Install dependencies
- [ ] `npm run dev` - Start development server
- [ ] Test all major routes:
  - [ ] Landing page (`/`)
  - [ ] Login page (`/login.html`)
  - [ ] App shell (`/app.html`)
- [ ] Test offline functionality (disable network in DevTools)
- [ ] Test PWA installation

### Build Testing
- [ ] `npm run build` - Create production build
- [ ] `npm run preview` - Test production build locally
- [ ] Check Service Worker registration in DevTools
- [ ] Verify all assets load correctly

## Deployment Steps

### 1. Database Migration
```sql
-- Run in Supabase SQL Editor
-- Copy contents from database/schema.sql
```

### 2. Deploy to Vercel
```bash
# Manual deployment
npm run deploy

# Or automatic via GitHub integration
git push origin main
```

### 3. Post-Deployment Verification
- [ ] Visit production URL
- [ ] Test authentication flow
- [ ] Verify API endpoints work
- [ ] Check Service Worker installation
- [ ] Test offline functionality
- [ ] Verify PWA installability

## Environment Variables Checklist

### Required
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

### Optional
- `VITE_APP_ENV` - Environment name (production/staging)
- `VITE_APP_VERSION` - App version for cache busting
- `VITE_MIXPANEL_TOKEN` - Analytics token
- `VITE_SENTRY_DSN` - Error tracking DSN

## Performance Optimization

### Bundle Analysis
```bash
# Analyze bundle size
npm run build -- --analyze
```

### Lighthouse Audit
- [ ] Performance > 90
- [ ] Accessibility > 95
- [ ] Best Practices > 90
- [ ] SEO > 90
- [ ] PWA > 90

## Security Checklist

### Supabase Security
- [ ] Row Level Security (RLS) enabled
- [ ] Proper organization-based data isolation
- [ ] API keys rotated if needed
- [ ] No sensitive data in frontend code

### Vercel Security
- [ ] Environment variables not exposed to client
- [ ] HTTPS enforced
- [ ] Proper CORS headers configured
- [ ] Security headers in place

## Monitoring & Maintenance

### Post-Launch Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Monitor database performance
- [ ] Track user analytics

### Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Monitor security advisories
- [ ] Database backup verification
- [ ] Performance regression testing

## Troubleshooting

### Common Issues

**Build Failures:**
- Check TypeScript errors: `npm run type-check`
- Verify all dependencies installed
- Clear node_modules and reinstall

**Service Worker Issues:**
- Check browser DevTools > Application > Service Workers
- Clear browser cache completely
- Verify PWA manifest

**Database Connection:**
- Test Supabase connection in browser console
- Verify environment variables
- Check network connectivity

**API Route Failures:**
- Check Vercel function logs
- Verify CORS configuration
- Test endpoints locally first

## Success Metrics

- [ ] App loads in < 3 seconds on 3G
- [ ] Offline functionality works completely
- [ ] PWA installable on mobile devices
- [ ] 99%+ uptime in first month
- [ ] Zero critical security vulnerabilities

---

## Next Steps After Deployment

1. **User Testing**: Get feedback from real tour managers and artists
2. **Performance Monitoring**: Set up dashboards for key metrics
3. **Feature Rollout**: Gradual rollout of advanced features
4. **Documentation**: Create user guides and API documentation
5. **Scaling**: Monitor usage and scale infrastructure as needed
