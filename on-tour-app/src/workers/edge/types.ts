/**
 * Cloudflare Workers Type Definitions
 *
 * Core types for developing workers.
 */

/// <reference types="@cloudflare/workers-types" />

// Re-export Cloudflare types
export type {
    ExecutionContext,
    KVNamespace,
    ScheduledEvent,
    CacheStorage,
} from '@cloudflare/workers-types';

// Custom request interface with Cloudflare properties
export interface CloudflareRequest extends Request {
    cf?: {
        colo?: string;
        country?: string;
        continent?: string;
        city?: string;
        timezone?: string;
        latitude?: string;
        longitude?: string;
        postalCode?: string;
        metroCode?: string;
        region?: string;
        regionCode?: string;
        asn?: number;
        asOrganization?: string;
    };
}

// Environment interface
export interface WorkerEnv {
    REGION_DATA: KVNamespace;
    ENVIRONMENT: string;
    API_VERSION: string;
    ENABLE_CACHE: string;
    CACHE_TTL: string;
}

// Rate limit result
export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    limit: number;
    retryAfter: number;
}

// Cache configuration
export interface CacheConfig {
    ttl: number;
    staleWhileRevalidate: number;
}

// Performance metrics
export interface PerformanceMetrics {
    edgeLatency: number;
    originLatency?: number;
    cacheStatus: 'HIT' | 'MISS' | 'EXPIRED' | 'BYPASS';
    region: string;
    timestamp: string;
}
