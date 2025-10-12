# 🌍 Option B: Edge Computing - Complete Guide

## Overview

Deploy Cloudflare Workers to serve your app from 275+ data centers worldwide, reducing latency from 200ms to 5-50ms.

**Target Improvements:**
- API Latency: 200ms → 5-50ms (-75% to -97.5%)
- Static Assets: 200ms → 10-30ms (-85% to -95%)
- TTFB (Time to First Byte): < 50ms globally
- Cache Hit Rate: 85% → 95%+

---

## 📦 What's Included

### 1. API Gateway Worker
**File:** `src/workers/edge/api-gateway.ts`

Intelligent API routing at the edge with:
- ✅ **Smart Caching** - Different TTLs per endpoint type
- ✅ **Rate Limiting** - 3 tiers (generous, default, strict)
- ✅ **Geo-Routing** - Route to nearest origin server
- ✅ **Request Deduplication** - Prevent redundant calls
- ✅ **Compression** - Automatic Brotli/Gzip
- ✅ **Cache Warming** - Scheduled daily warming

**Cache Strategy:**
```
Shows:         5 min cache, 10 min stale
Venues:        1 hour cache
Finance:       1 min cache
Profile:       30s cache
Notifications: 10s cache
```

**Rate Limits:**
```
Generous (reads):    300 req/min
Default:             100 req/min
Strict (writes):     20 req/min
```

### 2. Static Assets Worker
**File:** `src/workers/edge/static-assets.ts`

Global CDN for static assets with:
- ✅ **Long-term Caching** - Up to 1 year for immutable assets
- ✅ **Smart TTLs** - Different durations per asset type
- ✅ **Automatic Compression** - Brotli for all compressible content
- ✅ **Edge Serving** - Assets served from nearest location

**Cache Durations:**
```
Fonts:      1 year
Images:     30 days
CSS/JS:     7 days
HTML:       1 hour
Immutable:  1 year (hashed filenames)
```

### 3. Configuration
**File:** `wrangler.toml`

Cloudflare Workers configuration with:
- Worker settings
- KV namespace binding
- Route patterns
- Cron triggers
- Observability settings

---

## 🚀 Setup Instructions

### Prerequisites

1. **Cloudflare Account**
   - Sign up at https://dash.cloudflare.com
   - Add your domain
   - Note your Account ID and Zone ID

2. **Install Wrangler CLI**
   ```bash
   npm install -g wrangler
   # or
   pnpm add -g wrangler
   ```

3. **Authenticate**
   ```bash
   wrangler login
   ```

### Step 1: Configure Workers

Edit `wrangler.toml` with your details:

```toml
# Replace with your IDs
account_id = "your-account-id-here"
zone_id = "your-zone-id-here"

# Configure your domain
[[routes]]
pattern = "api.yourdomain.com/*"
zone_name = "yourdomain.com"
```

### Step 2: Create KV Namespace

```bash
# Production
wrangler kv:namespace create "REGION_DATA"

# Preview (for development)
wrangler kv:namespace create "REGION_DATA" --preview
```

Copy the IDs to `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "REGION_DATA"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-id"
```

### Step 3: Deploy Workers

```bash
# Deploy API Gateway
wrangler deploy src/workers/edge/api-gateway.ts

# Deploy Static Assets Worker
wrangler deploy src/workers/edge/static-assets.ts
```

### Step 4: Configure DNS

In Cloudflare dashboard:

1. Add CNAME record for API:
   ```
   Type: CNAME
   Name: api
   Target: your-worker.workers.dev
   Proxy: ON (orange cloud)
   ```

2. Add CNAME record for CDN:
   ```
   Type: CNAME
   Name: cdn
   Target: your-worker.workers.dev
   Proxy: ON (orange cloud)
   ```

### Step 5: Update App Configuration

Update your app to use edge endpoints:

```typescript
// Before
const API_BASE = 'https://your-origin-server.com/api';

// After
const API_BASE = 'https://api.yourdomain.com';
const CDN_BASE = 'https://cdn.yourdomain.com';
```

---

## 📊 Expected Performance

### Latency Reduction

| Location | Before (Origin) | After (Edge) | Improvement |
|----------|----------------|--------------|-------------|
| US East | 50ms | 5-10ms | -80% to -90% |
| US West | 100ms | 10-15ms | -85% to -90% |
| Europe | 200ms | 15-25ms | -87.5% to -92.5% |
| Asia | 300ms | 20-40ms | -86.7% to -93.3% |
| Australia | 400ms | 30-50ms | -87.5% to -92.5% |

### Cache Performance

```
Before (Origin Only):
- Cache Hit Rate: 0%
- TTFB: 200ms average
- Total Requests to Origin: 100%

After (Edge + Origin):
- Cache Hit Rate: 95%+
- TTFB: 5-50ms average
- Total Requests to Origin: 5% (95% cached)
```

### Cost Reduction

```
Origin Server Load:
- Before: 100% of requests
- After: 5% of requests (95% reduction)

Bandwidth Savings:
- 95% of traffic served from edge
- Reduced origin bandwidth costs
- Faster response times = better UX
```

---

## 🔧 Configuration Guide

### Customizing Cache TTLs

Edit `api-gateway.ts`:

```typescript
const CACHE_CONFIG = {
  shows: { ttl: 300, staleWhileRevalidate: 600 },  // Adjust these
  finance: { ttl: 60, staleWhileRevalidate: 120 }, // based on your needs
  // ...
};
```

**Guidelines:**
- **Public data (shows, venues):** 5-60 minutes
- **User-specific (profile, settings):** 30-60 seconds
- **Real-time (notifications):** 5-15 seconds
- **Static assets:** 7-30 days

### Adjusting Rate Limits

Edit `api-gateway.ts`:

```typescript
const RATE_LIMITS = {
  default: { requests: 100, window: 60 },  // Adjust per your API
  strict: { requests: 20, window: 60 },
  generous: { requests: 300, window: 60 },
};
```

### Adding Geo-Regions

Edit `selectOrigin()` function:

```typescript
function selectOrigin(request: Request): string {
  const continent = request.cf?.continent as string || 'NA';
  
  // Add your regional origins
  if (continent === 'EU') return 'eu-api.yourdomain.com';
  if (continent === 'AS') return 'asia-api.yourdomain.com';
  if (continent === 'OC') return 'aus-api.yourdomain.com';
  
  return 'api.yourdomain.com'; // Default (US)
}
```

---

## 🧪 Testing

### Local Development

```bash
# Start local worker
wrangler dev src/workers/edge/api-gateway.ts

# Test in browser
http://localhost:8787/api/shows
```

### Preview Deployment

```bash
# Deploy to preview
wrangler deploy src/workers/edge/api-gateway.ts --env preview

# Test preview
https://your-worker-preview.workers.dev
```

### Production Testing

```bash
# Check latency from different regions
curl -w "\n%{time_total}s\n" https://api.yourdomain.com/api/shows

# Check cache headers
curl -I https://api.yourdomain.com/api/shows | grep X-Cache
```

---

## 📈 Monitoring

### Cloudflare Analytics

View in dashboard:
- Requests per second
- Bandwidth usage
- Cache hit rate
- Error rate
- Top endpoints
- Geographic distribution

### Custom Metrics

Add to your worker:

```typescript
// Track performance
const metrics = {
  edgeLatency: Date.now() - startTime,
  cacheStatus: 'HIT' | 'MISS',
  region: request.cf?.colo,
};

// Send to analytics (e.g., Cloudflare Analytics Engine)
env.ANALYTICS.writeDataPoint({
  blobs: [request.url, metrics.cacheStatus],
  doubles: [metrics.edgeLatency],
  indexes: [metrics.region],
});
```

### Health Checks

Set up cron job for health checks:

```typescript
export async function scheduled(event: ScheduledEvent, env: Env) {
  // Health check endpoints
  const endpoints = ['/api/health', '/api/shows'];
  
  for (const endpoint of endpoints) {
    const response = await fetch(`https://api.yourdomain.com${endpoint}`);
    
    if (!response.ok) {
      // Alert (e.g., send to Slack, PagerDuty)
      console.error(`Health check failed for ${endpoint}`);
    }
  }
}
```

---

## 🐛 Troubleshooting

### Cache Not Working

**Problem:** X-Cache always shows MISS

**Solutions:**
1. Check `ENABLE_CACHE` environment variable is "true"
2. Verify `Cache-Control` headers are set
3. Ensure request method is GET
4. Check KV namespace is bound correctly

### Rate Limiting Too Aggressive

**Problem:** Users hitting rate limits frequently

**Solutions:**
1. Increase rate limits in `RATE_LIMITS` config
2. Implement per-user (not per-IP) rate limiting
3. Add rate limit exemptions for authenticated users
4. Use Redis or Durable Objects for more sophisticated rate limiting

### High Latency

**Problem:** Edge latency still high (>100ms)

**Possible Causes:**
1. Origin server slow - optimize origin first
2. Not routing to nearest region - check `selectOrigin()`
3. Cache TTLs too short - increase TTLs
4. KV reads slow - minimize KV lookups in hot path

---

## 💰 Cost Estimate

### Cloudflare Workers Pricing

**Free Tier:**
- 100,000 requests/day
- 10ms CPU time per request
- Good for development/small apps

**Paid Plan ($5/month):**
- 10 million requests/month included
- $0.50 per additional million
- 50ms CPU time per request
- Good for production apps

**Example Costs:**
```
100,000 daily requests (3M/month):
- Free tier: $0
- Paid tier: $5/month

1 million daily requests (30M/month):
- Paid tier: $5 + (20M × $0.50) = $15/month

10 million daily requests (300M/month):
- Paid tier: $5 + (290M × $0.50) = $150/month
```

### Cost Savings

```
Origin server costs BEFORE Edge:
- High bandwidth usage
- Need for global load balancing
- Multiple regional servers
- Total: $200-500/month

Origin server costs AFTER Edge:
- 95% traffic offloaded to edge
- Single origin server sufficient
- Reduced bandwidth costs
- Total: $50-100/month + $5-50 Cloudflare

NET SAVINGS: $100-350/month
```

---

## 🎯 Performance Checklist

Before going live:

- [ ] Workers deployed to production
- [ ] DNS configured correctly
- [ ] Cache TTLs optimized
- [ ] Rate limits configured
- [ ] Geo-routing tested
- [ ] Health checks set up
- [ ] Monitoring dashboard configured
- [ ] Cache warming scheduled
- [ ] Error handling tested
- [ ] Rollback plan documented

---

## 🚀 Next Steps

**After Option B:**

1. **Test thoroughly** - Monitor for 1-2 weeks
2. **Optimize TTLs** - Adjust based on cache hit rates
3. **Add more regions** - If you have global users
4. **Implement Analytics Engine** - For deeper insights

**Future Options:**

- **Option C:** Image Optimization (2-3 days)
- **Option D:** Streaming SSR (3-5 days, → 97/100)
- **Option E:** WebAssembly (1-2 weeks, → 98/100)

---

## 📚 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Workers KV Docs](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [Cache API Docs](https://developers.cloudflare.com/workers/runtime-apis/cache/)

---

**Performance Impact:**
```
API Latency: 200ms → 5-50ms (-75% to -97.5%)
Static Assets: 200ms → 10-30ms (-85% to -95%)
Cache Hit Rate: 85% → 95%+
Origin Load: 100% → 5% (-95%)
```

**Effort:** 1-2 days  
**Complexity:** Medium  
**Impact:** ⭐⭐⭐⭐⭐ Very High

---

**Option B: Edge Computing** - Ready to Deploy! 🌍
