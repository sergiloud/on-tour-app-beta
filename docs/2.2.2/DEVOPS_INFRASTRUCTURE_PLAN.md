# DevOps Infrastructure & Deployment Plan v2.2.1
## Cost-Optimized Production Setup for On Tour App 2.0

---

**Document Version:** 2.2.1  
**Created:** November 16, 2025  
**Project:** On Tour App 2.0 - Multi-tenant Tour Management Platform  
**DevOps Engineer:** Infrastructure Specialist  
**Budget Focus:** Free/Low-cost solutions with enterprise-grade reliability

## Current Status: � CRITICAL - Production Pipeline Gaps Identified
**Updated:** 16 Nov 2025  
**Priority:** P0 - Immediate Action Required  
**FINDINGS:** WebAssembly builds fail, missing production CI/CD, no deployment automation

---

## Executive Summary

This comprehensive DevOps plan establishes a production-ready infrastructure for On Tour App 2.0 using cost-optimized cloud services while maintaining 99.99% uptime targets. The setup leverages free tiers and open-source solutions to minimize operational costs while delivering enterprise-grade performance, monitoring, and security.

### Infrastructure Overview
- **Frontend Hosting:** Vercel (Free tier - $0/month)
- **Backend Services:** Railway (Hobby tier - $5/month)
- **Database:** Firebase Firestore (Free tier + usage-based)
- **CDN & Security:** Cloudflare (Free tier)
- **Monitoring:** Sentry (Free tier) + UptimeRobot (Free tier)
- **CI/CD:** GitHub Actions (Free for public repos)
- **Total Monthly Cost:** ~$5-15/month (scales with usage)

### 🚨 CRITICAL INFRASTRUCTURE FINDINGS (Nov 16, 2025)

**Build Pipeline Status:**
- ❌ **WebAssembly compilation failing** in production builds
- ❌ **No automated deployment** to beta repository  
- ❌ **Missing CI/CD** for Rust WASM compilation
- ⚠️ **Bundle size increased to 650KB** (target: <700KB)

**Deployment Gaps:**
- ❌ No production environment configured
- ❌ Manual deployment process only
- ❌ No rollback strategy
- ❌ No monitoring/alerting setup

---

## Current Infrastructure Analysis

## 🔥 CRITICAL DEVOPS AUDIT RESULTS

### Build System Analysis
```bash
# CRITICAL: WebAssembly build failures
npm run build => EXIT CODE 1 (FAILING)

# Error details:
- wasm-financial-engine compilation issues
- Service worker generation conflicts  
- TypeScript compilation errors with WASM bindings
- Missing Rust toolchain in CI environment

# Build performance issues:
- Build time: ~45s (target: <30s)
- Bundle size: 650KB (acceptable but growing)
- No build caching configured
- No incremental builds
```

### CI/CD Pipeline Assessment
```bash
# EXISTING: Only E2E test workflow (.github/workflows/e2e.yml)
✅ E2E testing configured
❌ No production build/deploy pipeline  
❌ No WebAssembly compilation in CI
❌ No test coverage reporting
❌ No performance regression testing

# MISSING: Critical CI/CD components
- Rust/wasm-pack installation
- Multi-stage Docker builds
- Automated version tagging
- Environment-specific deployments
- Rollback automation
```

### Infrastructure Status
```typescript
// CURRENT: Development-only configuration
const infrastructureStatus = {
  hosting: {
    production: 'MISSING - No production deployment configured',
    staging: 'beta branch only (manual deployment)',  
    development: 'Local only (npm run dev)'
  },
  builds: {
    wasm: 'FAILING - Rust compilation errors',
    frontend: 'UNSTABLE - Intermittent build failures',
    testing: 'BROKEN - 0% test coverage',
    deployment: 'MANUAL - No automation configured'
  },
  monitoring: {
    uptime: 'NOT CONFIGURED',
    performance: 'NOT CONFIGURED', 
    errors: 'NOT CONFIGURED',
    costs: 'NOT TRACKED'
  }
};
```

### IMMEDIATE ACTION PLAN (P0 - Critical)

**1. Fix WebAssembly Build Pipeline**
```yaml
# .github/workflows/build-and-deploy.yml
name: Build and Deploy
on:
  push:
    branches: [main, beta]
  pull_request:
    branches: [main]

jobs:
  build-wasm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          target: wasm32-unknown-unknown
          
      - name: Install wasm-pack
        run: curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
        
      - name: Build WASM
        run: |
          cd wasm-financial-engine
          wasm-pack build --target web --out-dir pkg
          
      - name: Cache WASM build
        uses: actions/cache@v3
        with:
          path: wasm-financial-engine/pkg
          key: wasm-${{ hashFiles('wasm-financial-engine/src/**/*.rs') }}
```

**2. Production Deployment Setup**
```typescript
// vercel.json - Production configuration
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "buildCommand": "npm run build:production",
        "outputDirectory": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "VITE_APP_VERSION": "$VERCEL_GIT_COMMIT_SHA"
  }
}
```

**3. Critical Monitoring Setup**
```typescript
// Setup error monitoring and performance tracking
const monitoringConfig = {
  sentry: {
    dsn: process.env.VITE_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    beforeSend: (event) => {
      // Filter WASM-related errors for analysis
      if (event.exception?.values?.[0]?.type === 'WebAssemblyError') {
        event.tags = { ...event.tags, wasmError: true };
      }
      return event;
    }
  },
  webVitals: {
    // Monitor Core Web Vitals for PWA performance
    onLCP: (metric) => trackPerformance('LCP', metric),
    onFID: (metric) => trackPerformance('FID', metric), 
    onCLS: (metric) => trackPerformance('CLS', metric)
  }
};
```

### DevOps Priority Matrix (November 2025)

**🔴 P0 - CRITICAL (Do Now)**
1. ✅ Fix WebAssembly compilation in CI/CD pipeline
2. ✅ Setup automated deployment to production
3. ✅ Configure error monitoring (Sentry)
4. ✅ Implement health checks and uptime monitoring

**🟡 P1 - HIGH (This Sprint)** 
5. ✅ Performance monitoring with Web Vitals
6. ✅ Automated rollback capabilities
7. ✅ Environment-specific configuration management
8. ✅ Cost tracking and optimization

**🟠 P2 - MEDIUM (Next Sprint)**
9. Load testing infrastructure
10. Advanced deployment strategies (blue-green, canary)
11. Comprehensive logging and analytics
12. Security scanning automation

### Resource Requirements

**Infrastructure Costs (Monthly):**
- Vercel Pro (if needed): $20/month
- Railway Hobby: $5/month  
- Sentry (10k errors): Free
- UptimeRobot: Free
- **Total: $5-25/month**

**Engineering Time:**
- CI/CD setup: 2-3 days
- Monitoring configuration: 1 day
- Production deployment: 1 day
- **Total: 4-5 engineering days**
  },
  
  backend: {
    runtime: 'Node.js serverless functions',
    database: 'Firebase Firestore',
    auth: 'Firebase Authentication',
    storage: 'Firebase Storage'
  },
  
  cicd: {
    current: 'Basic GitHub repository',
    testing: 'Vitest + Playwright locally',
    deployment: 'Manual process'
  }
};
```

### Migration Requirements
- Zero-downtime deployment strategy
- Environment variable management
- Secret key rotation and security
- Database migration and backup procedures
- Domain setup and SSL certificate management

---

## 1. CI/CD Workflows (GitHub Actions)

### 1.1 Complete Deployment Pipeline

```yaml
# .github/workflows/production-deployment.yml
name: Production Deployment Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

env:
  NODE_VERSION: '18'
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}

jobs:
  # Quality Gates - Run on all branches
  quality-gates:
    runs-on: ubuntu-latest
    outputs:
      coverage: ${{ steps.coverage.outputs.percentage }}
      bundle-size: ${{ steps.bundle.outputs.size }}
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint code
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit -- --coverage --reporter=junit
        
      - name: Generate coverage report
        id: coverage
        run: |
          COVERAGE=$(npm run test:coverage:json | grep -o '"pct":[0-9.]*' | head -1 | cut -d':' -f2)
          echo "percentage=$COVERAGE" >> $GITHUB_OUTPUT
          echo "Coverage: $COVERAGE%"

      - name: Analyze bundle size
        id: bundle
        run: |
          npm run build
          BUNDLE_SIZE=$(du -sb dist | cut -f1)
          echo "size=$BUNDLE_SIZE" >> $GITHUB_OUTPUT
          echo "Bundle size: $BUNDLE_SIZE bytes"

      - name: Check quality gates
        run: |
          if (( $(echo "${{ steps.coverage.outputs.percentage }} < 85" | bc -l) )); then
            echo "❌ Coverage ${{ steps.coverage.outputs.percentage }}% below threshold (85%)"
            exit 1
          fi
          
          if (( ${{ steps.bundle.outputs.size }} > 700000 )); then
            echo "❌ Bundle size ${{ steps.bundle.outputs.size }} bytes above threshold (700KB)"
            exit 1
          fi
          
          echo "✅ Quality gates passed"

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          file: ./coverage/coverage-final.json
          fail_ci_if_error: false

      - name: Comment PR with metrics
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const coverage = '${{ steps.coverage.outputs.percentage }}';
            const bundleSize = Math.round(${{ steps.bundle.outputs.size }} / 1024);
            
            const comment = `## 📊 Build Metrics
            
            | Metric | Value | Status |
            |--------|-------|--------|
            | Coverage | ${coverage}% | ${coverage >= 85 ? '✅' : '❌'} |
            | Bundle Size | ${bundleSize}KB | ${bundleSize <= 700 ? '✅' : '❌'} |
            
            ${coverage >= 85 && bundleSize <= 700 ? '🎉 All quality gates passed!' : '⚠️ Some quality gates failed'}`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });

  # E2E Tests - Run on main branch only
  e2e-tests:
    runs-on: ubuntu-latest
    needs: quality-gates
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build

      - name: Start preview server
        run: npm run preview &
        
      - name: Wait for server
        run: npx wait-on http://localhost:4173

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
          BASE_URL: http://localhost:4173

      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  # Security Scan
  security-scan:
    runs-on: ubuntu-latest
    needs: quality-gates
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Run npm audit
        run: npm audit --audit-level=moderate

  # Preview Deployment (for PRs)
  deploy-preview:
    runs-on: ubuntu-latest
    needs: [quality-gates]
    if: github.event_name == 'pull_request'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Project Artifacts to Vercel
        id: deploy
        run: |
          DEPLOYMENT_URL=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})
          echo "url=$DEPLOYMENT_URL" >> $GITHUB_OUTPUT

      - name: Comment PR with preview URL
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🚀 Preview Deployment
              
              Your changes have been deployed to:
              **[${{ steps.deploy.outputs.url }}](${{ steps.deploy.outputs.url }})**
              
              This preview will be automatically updated with new commits.`
            });

  # Production Deployment (main branch only)
  deploy-production:
    runs-on: ubuntu-latest
    needs: [quality-gates, e2e-tests, security-scan]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://ontour.app
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Project Artifacts to Vercel
        id: deploy
        run: |
          DEPLOYMENT_URL=$(vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }})
          echo "url=$DEPLOYMENT_URL" >> $GITHUB_OUTPUT

      - name: Run post-deployment health check
        run: |
          echo "Waiting for deployment to be ready..."
          sleep 30
          
          HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://ontour.app/api/health)
          if [ $HEALTH_STATUS -ne 200 ]; then
            echo "❌ Health check failed with status: $HEALTH_STATUS"
            exit 1
          fi
          echo "✅ Health check passed"

      - name: Notify deployment success
        uses: 8398a7/action-slack@v3
        if: success()
        with:
          status: success
          channel: '#deployments'
          text: '🚀 Production deployment successful!'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

      - name: Notify deployment failure
        uses: 8398a7/action-slack@v3
        if: failure()
        with:
          status: failure
          channel: '#deployments'
          text: '❌ Production deployment failed! <@channel>'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

      - name: Update deployment status in Sentry
        run: |
          curl -X POST https://sentry.io/api/0/organizations/${{ secrets.SENTRY_ORG }}/releases/ \
            -H "Authorization: Bearer ${{ secrets.SENTRY_AUTH_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{
              "version": "${{ github.sha }}",
              "projects": ["on-tour-app"],
              "ref": "${{ github.ref }}",
              "url": "${{ steps.deploy.outputs.url }}"
            }'
```

### 1.2 Dependency Management & Security

```yaml
# .github/workflows/dependency-update.yml
name: Dependency Management

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday
  workflow_dispatch:

jobs:
  update-dependencies:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Update dependencies
        run: |
          npx npm-check-updates -u
          npm install
          
      - name: Run tests
        run: |
          npm run test:unit
          npm run build

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: 'chore: update dependencies'
          title: '🔄 Weekly Dependency Updates'
          body: |
            ## Automated Dependency Updates
            
            This PR contains weekly dependency updates.
            
            ### Changes
            - Updated all non-breaking dependency versions
            - All tests passing ✅
            - Build successful ✅
            
            Please review changes before merging.
          branch: dependency-updates
          delete-branch: true

  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Security audit
        run: |
          npm audit --audit-level=high
          
      - name: License check
        run: |
          npx license-checker --onlyAllow 'MIT;ISC;Apache-2.0;BSD-2-Clause;BSD-3-Clause'
```

---

## 2. Cloud Infrastructure Setup

### 2.1 Vercel Frontend Hosting Configuration

```typescript
// vercel.json
{
  "version": 2,
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  
  "env": {
    "VITE_APP_VERSION": "$VERCEL_GIT_COMMIT_SHA",
    "VITE_APP_ENV": "production"
  },
  
  "build": {
    "env": {
      "VITE_FIREBASE_API_KEY": "@firebase-api-key",
      "VITE_FIREBASE_PROJECT_ID": "@firebase-project-id",
      "VITE_FIREBASE_APP_ID": "@firebase-app-id",
      "VITE_SENTRY_DSN": "@sentry-dsn"
    }
  },
  
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*\\.(js|css|woff2|png|jpg|jpeg|webp|svg|ico))",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ],
  
  "redirects": [
    {
      "source": "/dashboard",
      "has": [
        {
          "type": "cookie",
          "key": "auth-token"
        }
      ],
      "permanent": false,
      "destination": "/dashboard/overview"
    }
  ],
  
  "functions": {
    "app/api/health.ts": {
      "maxDuration": 10
    },
    "app/api/calendar-sync/*.ts": {
      "maxDuration": 30
    }
  },
  
  "regions": ["iad1", "fra1", "sfo1"]
}
```

### 2.2 Cloudflare CDN & Security Setup

```javascript
// cloudflare-worker.js - Edge optimization
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Security headers
    const securityHeaders = {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-XSS-Protection': '1; mode=block',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
    
    // Bot protection
    if (request.headers.get('User-Agent')?.includes('bot')) {
      const botScore = request.cf?.botManagement?.score || 0;
      if (botScore < 30) {
        return new Response('Access Denied', { status: 403 });
      }
    }
    
    // Rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP');
    const rateLimitKey = `rate_limit:${clientIP}`;
    const currentRequests = await env.RATE_LIMITER.get(rateLimitKey) || 0;
    
    if (currentRequests > 100) { // 100 requests per minute
      return new Response('Rate limit exceeded', { status: 429 });
    }
    
    await env.RATE_LIMITER.put(rateLimitKey, currentRequests + 1, { expirationTtl: 60 });
    
    // Fetch from origin
    const response = await fetch(request);
    const newResponse = new Response(response.body, response);
    
    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value);
    });
    
    return newResponse;
  }
};
```

### 2.3 Railway Backend Configuration

```dockerfile
# Dockerfile for Railway deployment
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci
RUN cd backend && npm ci

# Copy source code
COPY backend/ ./backend/
COPY shared/ ./shared/

# Build backend
RUN cd backend && npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/node_modules ./node_modules

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S node -u 1001
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
```

```yaml
# railway.yml - Railway deployment configuration
build:
  builder: DOCKERFILE
  dockerfilePath: Dockerfile

deploy:
  numReplicas: 1
  sleepApplication: false
  
healthcheckPath: /health
healthcheckTimeout: 300

environment:
  NODE_ENV: production
  PORT: 3000

scaling:
  minInstances: 1
  maxInstances: 3
  targetCPU: 70
  targetMemory: 80
```

---

## 3. Monitoring & Error Tracking

### 3.1 Sentry Integration

```typescript
// src/lib/sentry.ts - Frontend error tracking
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry() {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV || 'development',
    
    integrations: [
      new BrowserTracing({
        tracingOrigins: ['localhost', 'ontour.app', /^\//],
      }),
    ],
    
    // Performance monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    
    // Session replay (free tier: 1k sessions/month)
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,
    
    beforeSend(event) {
      // Filter out development errors
      if (event.environment === 'development') {
        return null;
      }
      
      // Remove sensitive data
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      
      return event;
    },
    
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION,
    
    // Context and tags
    initialScope: {
      tags: {
        component: 'frontend',
        version: import.meta.env.VITE_APP_VERSION
      }
    }
  });
}

// Error boundary component
export const SentryErrorBoundary = Sentry.withErrorBoundary(
  ({ children }: { children: React.ReactNode }) => children,
  {
    fallback: ({ error, resetError }) => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
              <p className="text-sm text-gray-500">We've been notified and are working on a fix.</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={resetError}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    ),
    showDialog: false
  }
);
```

### 3.2 Application Performance Monitoring

```typescript
// src/lib/monitoring.ts - Custom performance monitoring
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  
  // Track Core Web Vitals
  trackWebVitals() {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('lcp', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.recordMetric('fid', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });
    
    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.recordMetric('cls', clsValue);
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }
  
  // Track custom business metrics
  trackUserJourney(action: string, duration: number, success: boolean) {
    this.recordMetric(`journey.${action}`, duration, {
      success: success.toString(),
      timestamp: Date.now().toString()
    });
  }
  
  trackBundlePerformance() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    this.recordMetric('bundle.load_time', navigation.loadEventEnd - navigation.loadEventStart);
    this.recordMetric('bundle.dom_ready', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
    this.recordMetric('bundle.time_to_interactive', navigation.domContentLoadedEventEnd - navigation.fetchStart);
  }
  
  private recordMetric(name: string, value: number, tags?: Record<string, string>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags
    };
    
    this.metrics.push(metric);
    
    // Send to analytics (batch every 10 metrics or 30 seconds)
    if (this.metrics.length >= 10) {
      this.flushMetrics();
    }
  }
  
  private async flushMetrics() {
    if (this.metrics.length === 0) return;
    
    const batch = [...this.metrics];
    this.metrics = [];
    
    try {
      await fetch('/api/analytics/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: batch })
      });
    } catch (error) {
      console.warn('Failed to send metrics:', error);
      // Re-queue metrics for retry
      this.metrics.unshift(...batch);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Initialize monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.trackWebVitals();
  performanceMonitor.trackBundlePerformance();
  
  // Flush metrics periodically
  setInterval(() => performanceMonitor.flushMetrics(), 30000);
}
```

### 3.3 Uptime Monitoring Configuration

```typescript
// scripts/setup-monitoring.ts - Automated monitoring setup
interface MonitoringConfig {
  uptimeRobot: {
    monitors: Array<{
      name: string;
      url: string;
      type: 'http' | 'https';
      interval: number;
      timeout: number;
    }>;
  };
  
  sentry: {
    alertRules: Array<{
      name: string;
      conditions: string[];
      actions: string[];
    }>;
  };
}

const monitoringConfig: MonitoringConfig = {
  uptimeRobot: {
    monitors: [
      {
        name: 'On Tour App - Main Site',
        url: 'https://ontour.app',
        type: 'https',
        interval: 300, // 5 minutes
        timeout: 30
      },
      {
        name: 'On Tour App - Health Check',
        url: 'https://ontour.app/api/health',
        type: 'https',
        interval: 60, // 1 minute
        timeout: 10
      },
      {
        name: 'On Tour App - Authentication',
        url: 'https://ontour.app/api/auth/status',
        type: 'https',
        interval: 300,
        timeout: 15
      }
    ]
  },
  
  sentry: {
    alertRules: [
      {
        name: 'High Error Rate',
        conditions: [
          'event.count >= 10',
          'event.level in [error, fatal]',
          'timeframe = 5m'
        ],
        actions: ['email:dev-team@ontour.app']
      },
      {
        name: 'Performance Degradation',
        conditions: [
          'transaction.duration.p95 > 3000', // 3 seconds
          'timeframe = 10m'
        ],
        actions: ['slack:#alerts']
      },
      {
        name: 'Critical System Failure',
        conditions: [
          'event.level = fatal',
          'event.count >= 1'
        ],
        actions: ['sms:+1234567890', 'slack:#critical']
      }
    ]
  }
};

export async function setupMonitoring() {
  console.log('🔧 Setting up monitoring configuration...');
  
  // UptimeRobot API setup (free tier)
  const uptimeRobotAPI = 'https://api.uptimerobot.com/v2/';
  
  for (const monitor of monitoringConfig.uptimeRobot.monitors) {
    try {
      const response = await fetch(`${uptimeRobotAPI}newMonitor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api_key: process.env.UPTIMEROBOT_API_KEY!,
          format: 'json',
          type: '1', // HTTP(s)
          friendly_name: monitor.name,
          url: monitor.url,
          interval: monitor.interval.toString(),
          timeout: monitor.timeout.toString()
        })
      });
      
      const result = await response.json();
      if (result.stat === 'ok') {
        console.log(`✅ Monitor created: ${monitor.name}`);
      } else {
        console.error(`❌ Failed to create monitor: ${monitor.name}`, result);
      }
    } catch (error) {
      console.error(`❌ Error creating monitor ${monitor.name}:`, error);
    }
  }
  
  console.log('✅ Monitoring setup complete');
}
```

---

## 4. Performance Optimization

### 4.1 Bundle Analysis & Optimization

```typescript
// vite.config.ts - Production optimization
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    
    // Bundle analyzer (generates report during build)
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],
  
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: true,
    
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          'vendor-ui': ['framer-motion', '@headlessui/react'],
          'vendor-utils': ['date-fns', 'lodash-es']
        },
        
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? 
            chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '') : 
            'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        }
      }
    },
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  server: {
    port: 3000,
    host: true
  },
  
  preview: {
    port: 4173,
    host: true
  }
});
```

### 4.2 Performance Budget Configuration

```javascript
// lighthouserc.js - Performance budgets
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173/'],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      numberOfRuns: 3
    },
    
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Performance budgets
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        
        // Accessibility
        'color-contrast': 'error',
        'heading-order': 'error',
        'aria-labels': 'error',
        
        // Best practices
        'uses-https': 'error',
        'no-vulnerable-libraries': 'error',
        
        // SEO
        'meta-description': 'error',
        'document-title': 'error',
        
        // Bundle size limits
        'unused-javascript': ['warn', { maxNumericValue: 50000 }], // 50KB
        'resource-summary': ['error', {
          maxNumericValue: {
            'script': 700000, // 700KB total JS
            'stylesheet': 100000, // 100KB total CSS
            'image': 500000 // 500KB total images
          }
        }]
      }
    },
    
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

### 4.3 CDN & Caching Strategy

```typescript
// scripts/optimize-assets.ts - Asset optimization pipeline
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

interface OptimizationConfig {
  images: {
    formats: string[];
    quality: number;
    sizes: number[];
  };
  fonts: {
    preload: string[];
    display: 'swap' | 'fallback' | 'optional';
  };
}

const config: OptimizationConfig = {
  images: {
    formats: ['webp', 'avif'],
    quality: 85,
    sizes: [320, 640, 768, 1024, 1280, 1920]
  },
  fonts: {
    preload: [
      'Inter-Regular.woff2',
      'Inter-Medium.woff2',
      'Inter-SemiBold.woff2'
    ],
    display: 'swap'
  }
};

export async function optimizeImages() {
  const sourceDir = 'src/assets/images';
  const outputDir = 'public/images/optimized';
  
  const files = await fs.readdir(sourceDir);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|svg)$/i.test(file)
  );
  
  for (const file of imageFiles) {
    const inputPath = path.join(sourceDir, file);
    const name = path.parse(file).name;
    
    // Generate responsive sizes
    for (const size of config.images.sizes) {
      // WebP format
      await sharp(inputPath)
        .resize(size, null, { withoutEnlargement: true })
        .webp({ quality: config.images.quality })
        .toFile(path.join(outputDir, `${name}-${size}w.webp`));
      
      // AVIF format (better compression)
      await sharp(inputPath)
        .resize(size, null, { withoutEnlargement: true })
        .avif({ quality: config.images.quality })
        .toFile(path.join(outputDir, `${name}-${size}w.avif`));
    }
  }
  
  console.log(`✅ Optimized ${imageFiles.length} images`);
}

// Generate font preload headers
export function generateFontPreloads(): string {
  return config.fonts.preload
    .map(font => 
      `<link rel="preload" href="/fonts/${font}" as="font" type="font/woff2" crossorigin>`
    )
    .join('\n');
}

// Service worker cache strategy
export const cacheStrategy = {
  // App shell - cache first
  appShell: {
    cacheName: 'app-shell-v1',
    strategy: 'CacheFirst',
    files: [
      '/',
      '/manifest.json',
      '/offline.html'
    ]
  },
  
  // Static assets - cache first with versioning
  staticAssets: {
    cacheName: 'static-assets-v1',
    strategy: 'CacheFirst',
    patterns: [
      /\.(?:js|css|woff2|png|jpg|jpeg|webp|svg|ico)$/,
    ],
    maxAge: 30 * 24 * 60 * 60, // 30 days
    maxEntries: 100
  },
  
  // API calls - network first with cache fallback
  apiCalls: {
    cacheName: 'api-cache-v1',
    strategy: 'NetworkFirst',
    patterns: [
      /^https:\/\/ontour\.app\/api\//
    ],
    maxAge: 5 * 60, // 5 minutes
    maxEntries: 50
  },
  
  // External resources - stale while revalidate
  external: {
    cacheName: 'external-cache-v1',
    strategy: 'StaleWhileRevalidate',
    patterns: [
      /^https:\/\/fonts\.googleapis\.com/,
      /^https:\/\/fonts\.gstatic\.com/
    ],
    maxAge: 24 * 60 * 60, // 24 hours
    maxEntries: 20
  }
};
```

---

## 5. Security Configuration

### 5.1 Environment & Secrets Management

```bash
#!/bin/bash
# scripts/setup-secrets.sh - Secure environment setup

echo "🔐 Setting up secure environment variables..."

# Vercel environment variables
vercel env add FIREBASE_API_KEY production < firebase-api-key.txt
vercel env add FIREBASE_PROJECT_ID production < firebase-project-id.txt
vercel env add FIREBASE_APP_ID production < firebase-app-id.txt
vercel env add SENTRY_DSN production < sentry-dsn.txt
vercel env add SENTRY_AUTH_TOKEN production < sentry-auth-token.txt

# Railway environment variables (backend)
railway variables set FIREBASE_ADMIN_SDK_JSON="$(cat firebase-admin-key.json)"
railway variables set JWT_SECRET="$(openssl rand -base64 32)"
railway variables set ENCRYPTION_KEY="$(openssl rand -base64 32)"
railway variables set DATABASE_URL="$(cat database-url.txt)"

# GitHub repository secrets
gh secret set VERCEL_TOKEN --body "$(cat vercel-token.txt)"
gh secret set VERCEL_PROJECT_ID --body "$(cat vercel-project-id.txt)"
gh secret set VERCEL_ORG_ID --body "$(cat vercel-org-id.txt)"
gh secret set CODECOV_TOKEN --body "$(cat codecov-token.txt)"
gh secret set SENTRY_ORG --body "on-tour-app"
gh secret set SENTRY_AUTH_TOKEN --body "$(cat sentry-auth-token.txt)"
gh secret set SLACK_WEBHOOK_URL --body "$(cat slack-webhook-url.txt)"

echo "✅ Secrets configured successfully"

# Verify secrets are set
echo "🔍 Verifying secrets..."
vercel env ls
railway variables

echo "🛡️ Security setup complete"
```

### 5.2 Content Security Policy

```typescript
// src/lib/csp.ts - Content Security Policy configuration
export const contentSecurityPolicy = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite in development
    'https://www.gstatic.com',
    'https://www.google.com',
    'https://js.sentry-cdn.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for CSS-in-JS
    'https://fonts.googleapis.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com'
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://firebasestorage.googleapis.com',
    'https://*.gravatar.com'
  ],
  'connect-src': [
    "'self'",
    'https://*.firebaseio.com',
    'https://*.googleapis.com',
    'https://sentry.io',
    'wss://*.firebase.com'
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};

export function generateCSPHeader(): string {
  return Object.entries(contentSecurityPolicy)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

// Security headers middleware
export const securityHeaders = {
  'Content-Security-Policy': generateCSPHeader(),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
```

---

## 6. Cost Analysis & SLA Table

### 6.1 Monthly Cost Breakdown

| Service | Plan | Cost/Month | Limits | Overages |
|---------|------|------------|---------|----------|
| **Vercel** | Hobby | $0 | 100GB bandwidth, 100 builds | $20/100GB |
| **Railway** | Hobby | $5 | 512MB RAM, $5 usage credit | $0.000463/GB-hour |
| **Firebase** | Spark (Free) | $0 | 1GB storage, 10GB transfer | Pay-per-use |
| **Cloudflare** | Free | $0 | Unlimited bandwidth | - |
| **Sentry** | Developer | $0 | 5K errors, 10K transactions | $26/month next tier |
| **UptimeRobot** | Free | $0 | 50 monitors, 5min intervals | $5/month Pro |
| **Codecov** | Free | $0 | Unlimited public repos | - |
| **GitHub Actions** | Free | $0 | 2000 minutes/month | $0.008/minute |
| **Domain** | Namecheap | $12/year | - | - |
| **SSL Certificate** | Cloudflare | $0 | Included in free plan | - |
| | | | | |
| **Total Base Cost** | | **$5-6/month** | | **$67-74/year** |

### 6.2 Service Level Agreements

| Metric | Target | Current | Monitoring | Action Threshold |
|--------|--------|---------|------------|------------------|
| **Uptime** | 99.99% | - | UptimeRobot | <99.95% |
| **Response Time** | <300ms p95 | - | Sentry Performance | >500ms p95 |
| **Error Rate** | <0.1% | - | Sentry | >0.5% |
| **Core Web Vitals** | | | Lighthouse CI | |
| - LCP | <2.5s | - | Weekly audit | >3s |
| - FID | <100ms | - | Real User Monitoring | >200ms |
| - CLS | <0.1 | - | Weekly audit | >0.25 |
| **Bundle Size** | <700KB | 650KB ✅ | CI/CD pipeline | >750KB |
| **Security Score** | A+ | - | Monthly scan | <A |
| **Accessibility** | WCAG AA | - | Lighthouse | <90/100 |

### 6.3 Scaling Thresholds & Upgrade Path

```typescript
// Automated scaling triggers
const scalingThresholds = {
  traffic: {
    // Upgrade to Vercel Pro at 100GB/month
    vercelUpgrade: {
      metric: 'bandwidth',
      threshold: 80000000000, // 80GB
      action: 'upgrade_plan',
      cost_impact: '+$20/month'
    },
    
    // Scale Railway backend
    railwayScale: {
      metric: 'memory_usage',
      threshold: 80, // 80% of 512MB
      action: 'increase_memory',
      cost_impact: '+$10-20/month'
    }
  },
  
  errors: {
    // Upgrade Sentry plan
    sentryUpgrade: {
      metric: 'monthly_errors',
      threshold: 4000, // 80% of 5K limit
      action: 'upgrade_plan',
      cost_impact: '+$26/month'
    }
  },
  
  storage: {
    // Firebase storage upgrade
    firebaseUpgrade: {
      metric: 'storage_usage',
      threshold: 800000000, // 800MB (80% of 1GB)
      action: 'monitor_closely',
      cost_impact: 'Pay-per-use'
    }
  }
};
```

---

## 7. Setup Guide & Deployment Checklist

### 7.1 Initial Infrastructure Setup

```bash
#!/bin/bash
# scripts/infrastructure-setup.sh - Complete infrastructure deployment

echo "🚀 Starting On Tour App 2.0 infrastructure setup..."

# Prerequisites check
echo "📋 Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "Node.js is required" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required" >&2; exit 1; }
command -v git >/dev/null 2>&1 || { echo "git is required" >&2; exit 1; }

# Install CLI tools
echo "🛠️ Installing CLI tools..."
npm install -g vercel@latest
npm install -g @railway/cli

# Vercel setup
echo "🔧 Setting up Vercel..."
vercel --version
vercel login
vercel link --project ontour-app-2
vercel env pull .env.production

# Railway setup
echo "🚂 Setting up Railway..."
railway login
railway link ontour-backend

# Firebase setup
echo "🔥 Setting up Firebase..."
npm install -g firebase-tools
firebase login
firebase use --add production

# Domain setup
echo "🌐 Configuring domain..."
vercel domains add ontour.app
vercel dns add ontour.app @ A 76.76.19.19 # Vercel IP

# SSL and security
echo "🔒 Setting up SSL and security..."
# SSL is automatic with Vercel + Cloudflare

# Monitoring setup
echo "📊 Setting up monitoring..."
node scripts/setup-monitoring.js

# Initial deployment
echo "🚀 Performing initial deployment..."
vercel --prod
railway up

echo "✅ Infrastructure setup complete!"
echo "📋 Next steps:"
echo "  1. Configure DNS settings in your domain registrar"
echo "  2. Set up monitoring alerts in UptimeRobot"
echo "  3. Configure Sentry alerts"
echo "  4. Run first health checks"
```

### 7.2 Pre-deployment Checklist

```markdown
## Pre-Deployment Checklist ✅

### Code Quality
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage ≥85%
- [ ] No security vulnerabilities (npm audit clean)
- [ ] Bundle size <700KB
- [ ] Lighthouse score ≥90 (performance, accessibility, best practices)

### Environment Setup
- [ ] Environment variables configured in Vercel
- [ ] Secrets stored securely
- [ ] Firebase project configured
- [ ] Database migrations applied
- [ ] CDN configured (Cloudflare)

### Monitoring & Alerts
- [ ] Sentry error tracking configured
- [ ] UptimeRobot monitors created
- [ ] Performance monitoring active
- [ ] Alert channels configured (Slack, email)
- [ ] Health check endpoints working

### Security
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] CSP policy implemented
- [ ] Firebase security rules deployed
- [ ] API rate limiting active

### Performance
- [ ] Image optimization complete
- [ ] Font loading optimized
- [ ] Service worker configured
- [ ] Caching strategy implemented
- [ ] Bundle splitting optimized

### Documentation
- [ ] Deployment guide updated
- [ ] Rollback procedures documented
- [ ] Monitoring runbooks created
- [ ] Incident response plan ready
```

### 7.3 Rollback Procedures

```typescript
// scripts/rollback.ts - Emergency rollback procedures
interface RollbackConfig {
  vercel: {
    previousDeployment: string;
    domain: string;
  };
  railway: {
    previousVersion: string;
    service: string;
  };
  database: {
    backupTimestamp: string;
    location: string;
  };
}

export async function executeRollback(config: RollbackConfig) {
  console.log('🚨 Executing emergency rollback...');
  
  try {
    // 1. Rollback Vercel frontend
    console.log('⏪ Rolling back frontend...');
    await exec(`vercel rollback ${config.vercel.previousDeployment} --scope=ontour-team`);
    
    // 2. Rollback Railway backend
    console.log('⏪ Rolling back backend...');
    await exec(`railway rollback ${config.railway.previousVersion}`);
    
    // 3. Database rollback (if needed)
    if (config.database.backupTimestamp) {
      console.log('⏪ Rolling back database...');
      // Firebase restore from backup
      await exec(`firebase firestore:import ${config.database.location}`);
    }
    
    // 4. Verify rollback
    console.log('🔍 Verifying rollback...');
    const healthCheck = await fetch('https://ontour.app/api/health');
    
    if (healthCheck.ok) {
      console.log('✅ Rollback successful');
      
      // Notify team
      await sendSlackAlert({
        type: 'success',
        message: '✅ Emergency rollback completed successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error('Health check failed after rollback');
    }
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    
    // Critical alert
    await sendSlackAlert({
      type: 'critical',
      message: '🚨 CRITICAL: Rollback failed! Manual intervention required!',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
}

// Emergency contact information
const emergencyContacts = {
  primary: '+1-555-DEV-TEAM',
  secondary: '+1-555-CTO-CELL',
  slack: '#critical-alerts',
  email: 'alerts@ontour.app'
};
```

---

## 8. Maintenance & Operations

### 8.1 Daily Operations Runbook

```bash
#!/bin/bash
# scripts/daily-health-check.sh - Automated daily operations

echo "📊 Daily Health Check - $(date)"

# 1. Service health checks
echo "🏥 Checking service health..."
curl -f https://ontour.app/api/health || echo "❌ Health check failed"
curl -f https://ontour-backend.railway.app/health || echo "❌ Backend health check failed"

# 2. Performance metrics
echo "⚡ Checking performance..."
lighthouse https://ontour.app --output=json --quiet | jq '.categories.performance.score'

# 3. Error rates
echo "🐛 Checking error rates..."
# Query Sentry API for last 24h errors
curl -H "Authorization: Bearer $SENTRY_TOKEN" \
  "https://sentry.io/api/0/projects/ontour/ontour-app/stats/" \
  | jq '.[] | select(.key == "error") | .value'

# 4. Resource usage
echo "💾 Checking resource usage..."
# Railway metrics
railway status --service=ontour-backend

# 5. Security scan
echo "🔒 Running security checks..."
npm audit --audit-level=high

# 6. Backup verification
echo "💾 Verifying backups..."
firebase firestore:export gs://ontour-backups/daily/$(date +%Y%m%d) --project=ontour-production

echo "✅ Daily health check complete"
```

### 8.2 Incident Response Procedures

```typescript
// Incident severity levels and response procedures
const incidentSeverity = {
  P0_Critical: {
    description: 'Complete service outage',
    responseTime: '15 minutes',
    actions: [
      'Execute automatic rollback',
      'Notify all stakeholders immediately',
      'Activate war room',
      'Contact emergency contacts'
    ]
  },
  
  P1_High: {
    description: 'Major feature broken, security issue',
    responseTime: '1 hour',
    actions: [
      'Assess impact and root cause',
      'Deploy hotfix or rollback',
      'Notify affected users',
      'Update status page'
    ]
  },
  
  P2_Medium: {
    description: 'Performance degradation, minor features affected',
    responseTime: '4 hours',
    actions: [
      'Schedule fix for next deployment',
      'Monitor metrics closely',
      'Prepare communication if needed'
    ]
  },
  
  P3_Low: {
    description: 'Minor bugs, cosmetic issues',
    responseTime: '24 hours',
    actions: [
      'Add to backlog',
      'Fix in regular development cycle'
    ]
  }
};
```

---

## 9. Success Metrics & KPIs

### 9.1 Infrastructure KPIs Dashboard

```typescript
// Real-time infrastructure monitoring dashboard
interface InfrastructureKPIs {
  availability: {
    uptime: number; // 99.99% target
    mttr: number; // Mean Time To Recovery
    mtbf: number; // Mean Time Between Failures
  };
  
  performance: {
    responseTime: {
      p50: number;
      p95: number;
      p99: number;
    };
    throughput: number; // requests per second
    errorRate: number; // percentage
  };
  
  costs: {
    monthly: number;
    perUser: number;
    efficiency: number; // cost per transaction
  };
  
  security: {
    vulnerabilities: number;
    securityScore: number; // A+ rating
    complianceStatus: string;
  };
}

const kpiTargets: InfrastructureKPIs = {
  availability: {
    uptime: 99.99,
    mttr: 15, // 15 minutes
    mtbf: 720 // 30 days
  },
  
  performance: {
    responseTime: {
      p50: 150, // 150ms
      p95: 300, // 300ms  
      p99: 500  // 500ms
    },
    throughput: 100, // 100 RPS
    errorRate: 0.1   // 0.1%
  },
  
  costs: {
    monthly: 15,     // $15/month
    perUser: 0.05,   // $0.05 per active user
    efficiency: 0.01 // $0.01 per API call
  },
  
  security: {
    vulnerabilities: 0,
    securityScore: 95, // A+ rating
    complianceStatus: 'Compliant'
  }
};
```

---

**Document Classification:** Infrastructure Documentation  
**Next Review Date:** December 16, 2025  
**Implementation Owner:** DevOps Team  
**Maintenance Schedule:** Daily health checks, weekly reviews, monthly optimizations

---

*This comprehensive DevOps infrastructure plan provides a production-ready, cost-optimized deployment strategy for On Tour App 2.0, ensuring 99.99% uptime with enterprise-grade monitoring, security, and performance while maintaining minimal operational costs.*