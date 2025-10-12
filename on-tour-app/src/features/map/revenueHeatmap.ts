// Revenue Heatmap Utilities
import { DemoShow } from '../lib/shows';

export type RegionRevenue = {
    country: string;
    city: string;
    lat: number;
    lng: number;
    totalNet: number;
    showCount: number;
    avgNet: number;
    tier: 'high' | 'medium' | 'low' | 'none';
};

export type HeatmapDataPoint = {
    lat: number;
    lng: number;
    weight: number; // 0-1 normalized
    revenue: number; // actual revenue
};

/**
 * Calculate revenue by geographic location from shows
 * Groups by city coordinates and calculates totals
 */
export function calculateRevenueByLocation(shows: Show[], costs: Record<string, any[]> = {}): RegionRevenue[] {
    const locationMap = new Map<string, RegionRevenue>();

    shows.forEach(show => {
        // Skip shows without valid coordinates
        if (!show.lat || !show.lng || show.lat === 0 || show.lng === 0) return;

        // Calculate net revenue for this show
        const showCosts = costs[show.id] || [];
        const totalCosts = showCosts.reduce((sum, cost) => sum + (cost.amount || 0), 0);
        const wht = show.fee * ((show.whtPct || 0) / 100);
        const net = show.fee - wht - totalCosts;

        // Only count confirmed and completed shows
        if (show.status !== 'confirmed' && show.status !== 'archived') return;

        // Create unique key for location (city + country)
        const locationKey = `${show.city}-${show.country}-${show.lat.toFixed(3)}-${show.lng.toFixed(3)}`;

        if (locationMap.has(locationKey)) {
            const existing = locationMap.get(locationKey)!;
            existing.totalNet += net;
            existing.showCount += 1;
            existing.avgNet = existing.totalNet / existing.showCount;
        } else {
            locationMap.set(locationKey, {
                country: show.country,
                city: show.city,
                lat: show.lat,
                lng: show.lng,
                totalNet: net,
                showCount: 1,
                avgNet: net,
                tier: 'none', // Will be calculated below
            });
        }
    });

    const regions = Array.from(locationMap.values());

    // Calculate tiers based on percentiles
    if (regions.length > 0) {
        const sortedByRevenue = [...regions].sort((a, b) => b.totalNet - a.totalNet);
        const p75 = sortedByRevenue[Math.floor(sortedByRevenue.length * 0.25)]?.totalNet || 0;
        const p50 = sortedByRevenue[Math.floor(sortedByRevenue.length * 0.5)]?.totalNet || 0;

        regions.forEach(region => {
            if (region.totalNet >= p75) {
                region.tier = 'high';
            } else if (region.totalNet >= p50) {
                region.tier = 'medium';
            } else {
                region.tier = 'low';
            }
        });
    }

    return regions;
}

/**
 * Convert region revenues to heatmap data points with normalized weights
 */
export function convertToHeatmapData(regions: RegionRevenue[]): HeatmapDataPoint[] {
    if (regions.length === 0) return [];

    const maxRevenue = Math.max(...regions.map(r => r.totalNet), 1);

    return regions.map(region => ({
        lat: region.lat,
        lng: region.lng,
        weight: Math.min(region.totalNet / maxRevenue, 1), // Normalize 0-1
        revenue: region.totalNet,
    }));
}

/**
 * Get color based on revenue tier
 */
export function getTierColor(tier: RegionRevenue['tier']): string {
    switch (tier) {
        case 'high':
            return '#10b981'; // green-500
        case 'medium':
            return '#f59e0b'; // amber-500
        case 'low':
            return '#ef4444'; // red-500
        default:
            return '#6b7280'; // gray-500
    }
}

/**
 * Get tier label for display
 */
export function getTierLabel(tier: RegionRevenue['tier']): string {
    switch (tier) {
        case 'high':
            return 'High Revenue';
        case 'medium':
            return 'Medium Revenue';
        case 'low':
            return 'Low Revenue';
        default:
            return 'No Data';
    }
}

/**
 * Create GeoJSON FeatureCollection for MapLibre heatmap layer
 */
export function createHeatmapGeoJSON(dataPoints: HeatmapDataPoint[]): GeoJSON.FeatureCollection {
    return {
        type: 'FeatureCollection',
        features: dataPoints.map(point => ({
            type: 'Feature',
            properties: {
                weight: point.weight,
                revenue: point.revenue,
            },
            geometry: {
                type: 'Point',
                coordinates: [point.lng, point.lat],
            },
        })),
    };
}

/**
 * Generate heatmap color gradient for MapLibre
 * Returns interpolate expression for paint property
 */
export function getHeatmapColorGradient() {
    return [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(239, 68, 68, 0)',      // transparent red at 0
        0.2, 'rgba(239, 68, 68, 0.3)',  // red-500 at 20%
        0.4, 'rgba(245, 158, 11, 0.5)', // amber-500 at 40%
        0.6, 'rgba(245, 158, 11, 0.7)', // amber-500 at 60%
        0.8, 'rgba(16, 185, 129, 0.8)', // green-500 at 80%
        1, 'rgba(16, 185, 129, 1)',     // full green at 100%
    ];
}

/**
 * Calculate statistics for the revenue data
 */
export function calculateRevenueStats(regions: RegionRevenue[]) {
    if (regions.length === 0) {
        return {
            totalRevenue: 0,
            totalShows: 0,
            avgPerShow: 0,
            topCity: null,
            topCountry: null,
        };
    }

    const totalRevenue = regions.reduce((sum, r) => sum + r.totalNet, 0);
    const totalShows = regions.reduce((sum, r) => sum + r.showCount, 0);
    const avgPerShow = totalRevenue / totalShows;

    // Find top city
    const sortedCities = [...regions].sort((a, b) => b.totalNet - a.totalNet);
    const topCity = sortedCities[0];

    // Group by country and find top
    const countryMap = new Map<string, { country: string; totalNet: number; showCount: number }>();
    regions.forEach(r => {
        if (countryMap.has(r.country)) {
            const existing = countryMap.get(r.country)!;
            existing.totalNet += r.totalNet;
            existing.showCount += r.showCount;
        } else {
            countryMap.set(r.country, {
                country: r.country,
                totalNet: r.totalNet,
                showCount: r.showCount,
            });
        }
    });

    const sortedCountries = Array.from(countryMap.values()).sort((a, b) => b.totalNet - a.totalNet);
    const topCountry = sortedCountries[0];

    return {
        totalRevenue,
        totalShows,
        avgPerShow,
        topCity,
        topCountry,
    };
}
