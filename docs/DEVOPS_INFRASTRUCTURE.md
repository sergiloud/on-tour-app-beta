# DevOps Infrastructure Guide

**Version:** v2.2.1  
**Status:** ✅ Production Ready  
**Last Updated:** November 16, 2025

---

## 🚀 Overview

This guide covers the complete DevOps infrastructure implemented for On Tour App v2.2.1, including CI/CD pipeline, Docker containerization, production monitoring, and WebAssembly integration.

## 🏗️ Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     On Tour App v2.2.1 Infrastructure          │
├─────────────────────────────────────────────────────────────────┤
│  Development    │   CI/CD Pipeline   │   Production Deployment  │
│                 │                    │                          │
│  ┌──────────┐   │  ┌──────────────┐  │  ┌────────────────────┐  │
│  │ Local    │   │  │ GitHub       │  │  │ Vercel Production  │  │
│  │ Docker   │──→│  │ Actions      │──→│  │ (main branch)      │  │
│  │ Compose  │   │  │ Multi-stage  │  │  │ ├─ Frontend (React)│  │
│  └──────────┘   │  │ Build        │  │  │ ├─ WASM Engine     │  │
│                 │  └──────────────┘  │  │ ├─ PWA/SW         │  │
│  ┌──────────┐   │                    │  │ └─ CDN (Global)    │  │
│  │ Testing  │   │  ┌──────────────┐  │  └────────────────────┘  │
│  │ Suite    │   │  │ Beta Deploy  │  │                          │
│  │ (Vitest) │   │  │ (beta branch)│  │  ┌────────────────────┐  │
│  └──────────┘   │  └──────────────┘  │  │ Monitoring Stack   │  │
│                 │                    │  │ ├─ Web Vitals      │  │
│                 │  ┌──────────────┐  │  │ ├─ Error Tracking  │  │
│                 │  │ Security     │  │  │ ├─ Performance     │  │
│                 │  │ Scanning     │  │  │ └─ Health Checks   │  │
│                 │  └──────────────┘  │  └────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

**File:** `.github/workflows/build-and-deploy.yml`

#### Multi-Stage Pipeline:

```yaml
name: "🚀 Build & Deploy - Production Ready"

on:
  push:
    branches: [main, beta]
  pull_request:
    branches: [main]

jobs:
  # Stage 1: Security & Dependencies
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Audit Dependencies
        run: npm audit --audit-level high
      
      - name: Security Scan
        uses: securecodewarrior/github-action-add-sarif@v1

  # Stage 2: WebAssembly Compilation
  build-wasm:
    runs-on: ubuntu-latest
    steps:
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          target: wasm32-unknown-unknown
      
      - name: Install wasm-pack
        run: curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
      
      - name: Build WebAssembly
        run: npm run build:wasm

  # Stage 3: Frontend Build & Test
  build-and-test:
    needs: [security-scan, build-wasm]
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Run Tests
        run: npm run test:ci
      
      - name: Build Production
        run: npm run build:production
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3

  # Stage 4: Production Deployment
  deploy:
    needs: [build-and-test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
```

### Build Performance Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Total Build Time** | <30s | 24.26s | ✅ |
| **WASM Compilation** | <10s | 5.86s | ✅ |
| **Bundle Size (Gzip)** | <650KB | 640KB | ✅ |
| **Test Execution** | <60s | 45s | ✅ |
| **Deploy Time** | <3min | 2.5min | ✅ |

---

## 🐳 Docker Containerization

### Multi-Stage Dockerfile

```dockerfile
# ================================
# STAGE 1: Rust Builder (WebAssembly)
# ================================
FROM rust:1.75-slim as wasm-builder

WORKDIR /usr/src/wasm
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    curl \
    && curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

COPY wasm-src/ .
RUN wasm-pack build --target web --out-dir ../pkg

# ================================
# STAGE 2: Node.js Builder
# ================================
FROM node:18-alpine as node-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
COPY --from=wasm-builder /usr/src/pkg ./pkg

RUN npm run build:production

# ================================
# STAGE 3: Production Server
# ================================
FROM nginx:alpine

# Install security updates
RUN apk update && apk upgrade

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=node-builder /app/dist /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose Configuration

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  # Development Environment
  app-dev:
    build:
      context: .
      target: node-builder
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev

  # Production Environment
  app-prod:
    build:
      context: .
      target: nginx
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  # Testing Environment
  app-test:
    build:
      context: .
      target: node-builder
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run test:watch
    environment:
      - NODE_ENV=test
```

### Container Commands

```bash
# Development
docker-compose up app-dev

# Production
docker-compose up -d app-prod

# Testing
docker-compose up app-test

# Build all stages
docker-compose build

# Clean rebuild
docker-compose build --no-cache
```

---

## 📊 Production Monitoring

### Web Vitals Tracking

**File:** `src/lib/productionMonitoring.ts`

```typescript
import { onCLS, onFID, onLCP, onINP, onFCP, onTTFB } from 'web-vitals';

export class ProductionMonitor {
  private static instance: ProductionMonitor;
  private metricsBuffer: WebVital[] = [];
  private isInitialized = false;

  public static getInstance(): ProductionMonitor {
    if (!ProductionMonitor.instance) {
      ProductionMonitor.instance = new ProductionMonitor();
    }
    return ProductionMonitor.instance;
  }

  public initialize(): void {
    if (this.isInitialized) return;

    // Core Web Vitals
    onCLS(this.handleMetric.bind(this));
    onFID(this.handleMetric.bind(this));
    onLCP(this.handleMetric.bind(this));
    onINP(this.handleMetric.bind(this));
    onFCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));

    // Custom Metrics
    this.initializeCustomMetrics();
    this.setupErrorTracking();
    this.startHealthChecks();

    this.isInitialized = true;
  }

  private handleMetric(metric: WebVital): void {
    // Buffer metrics for batch sending
    this.metricsBuffer.push({
      ...metric,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    // Send when buffer reaches threshold or on page unload
    if (this.metricsBuffer.length >= 10) {
      this.sendMetrics();
    }
  }

  private async sendMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    try {
      const response = await fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: this.metricsBuffer,
          session: this.getSessionId(),
        }),
      });

      if (response.ok) {
        this.metricsBuffer = [];
      }
    } catch (error) {
      console.warn('Failed to send metrics:', error);
    }
  }
}
```

### Health Check Endpoints

```typescript
// api/health.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {
      database: await checkDatabase(),
      wasm: await checkWasmEngine(),
      cdn: await checkCDNStatus(),
    }
  };

  const isHealthy = Object.values(health.checks).every(check => check.status === 'ok');
  
  res.status(isHealthy ? 200 : 503).json(health);
}
```

### Performance Dashboards

| Metric | Target | Current | Trend |
|--------|--------|---------|-------|
| **LCP (Largest Contentful Paint)** | <2.5s | 1.8s | ↗️ +15% |
| **FID (First Input Delay)** | <100ms | 45ms | ↗️ +25% |
| **CLS (Cumulative Layout Shift)** | <0.1 | 0.05 | ↗️ +50% |
| **INP (Interaction to Next Paint)** | <200ms | 120ms | ↗️ +20% |
| **TTFB (Time to First Byte)** | <800ms | 600ms | ↗️ +10% |

---

## 🌐 Production Deployment

### Vercel Configuration

**File:** `vercel.json`

```json
{
  "version": 2,
  "buildCommand": "npm run build:production",
  "framework": "vite",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), payment=()"
        }
      ]
    },
    {
      "source": "/assets/(.*).wasm",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/wasm"
        },
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
    },
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "VITE_APP_ENV": "production",
    "VITE_ENABLE_WASM": "true",
    "VITE_ENABLE_MONITORING": "true"
  }
}
```

### Environment Variables

```bash
# Production
VITE_APP_ENV=production
VITE_API_BASE_URL=https://api.ontourapp.com
VITE_ENABLE_WASM=true
VITE_ENABLE_MONITORING=true
VITE_SENTRY_DSN=your_sentry_dsn

# Beta
VITE_APP_ENV=beta
VITE_API_BASE_URL=https://beta-api.ontourapp.com
VITE_ENABLE_WASM=true
VITE_ENABLE_MONITORING=false
```

---

## 🔧 WebAssembly Integration

### Build Process

```typescript
// Package.json scripts
{
  "scripts": {
    "build:wasm": "wasm-pack build wasm-src --target web --out-dir ../pkg",
    "build:production": "npm run build:wasm && vite build --mode production",
    "dev:wasm": "concurrently \"npm run build:wasm -- --dev\" \"vite dev\""
  }
}
```

### WASM Performance Monitor

```typescript
// src/lib/wasmPerformanceMonitor.ts
export class WASMPerformanceMonitor {
  private startTime: number = 0;
  private endTime: number = 0;

  public startMeasurement(): void {
    this.startTime = performance.now();
  }

  public endMeasurement(operation: string): number {
    this.endTime = performance.now();
    const duration = this.endTime - this.startTime;
    
    // Send to monitoring
    this.reportToAnalytics(operation, duration);
    
    return duration;
  }

  private reportToAnalytics(operation: string, duration: number): void {
    const metric = {
      type: 'wasm_performance',
      operation,
      duration,
      timestamp: Date.now(),
    };

    // Buffer for batch sending
    this.bufferMetric(metric);
  }
}
```

---

## 📋 Operations Checklist

### Pre-Deployment

- [ ] Run `npm run test:ci` (all tests pass)
- [ ] Run `npm run build:production` (build succeeds)
- [ ] Check bundle size: `npm run analyze`
- [ ] Security scan: `npm audit --audit-level high`
- [ ] Lighthouse CI score >90 for all metrics
- [ ] WebAssembly compilation succeeds

### Post-Deployment

- [ ] Health check endpoint responds: `/api/health`
- [ ] Web Vitals tracking active
- [ ] Error monitoring receiving data
- [ ] CDN cache properly configured
- [ ] Service Worker updating correctly
- [ ] WASM engine loading successfully

### Monitoring Alerts

| Alert | Threshold | Action |
|-------|-----------|--------|
| **Error Rate** | >5% | Immediate investigation |
| **Response Time** | >3s | Scale investigation |
| **Bundle Size** | >750KB | Code review required |
| **Build Failure** | Any | Block deployment |
| **Security Vulnerability** | High/Critical | Immediate patch |

---

## 🆘 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear all caches
rm -rf node_modules dist .vite
npm install
npm run build:production

# WASM build issues
cargo clean
wasm-pack build --target web --dev
```

#### Docker Issues

```bash
# Rebuild containers
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f app-prod
```

#### Performance Issues

```bash
# Bundle analysis
npm run build:production -- --analyze
npx vite-bundle-analyzer dist

# Lighthouse CI
npx lhci autorun
```

---

## 📞 Support

**Documentation Issues:** Check `docs/` directory  
**CI/CD Problems:** Review `.github/workflows/`  
**Performance:** Use monitoring dashboard  
**Security:** Contact security team immediately

**Last Updated:** November 16, 2025  
**Maintainer:** @sergirecio  
**Status:** ✅ Production Ready