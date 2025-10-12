import { useMemo } from 'react';
import Supercluster, { PointFeature, ClusterFeature, AnyProps } from 'supercluster';

interface Show {
    id: string;
    city: string;
    lng: number;
    lat: number;
    status: string;
    fee: number;
    date: string;
    venue?: string;
    country?: string;
}

export type ClusterPoint = ClusterFeature<Show> | PointFeature<Show>;

/**
 * Hook que maneja clustering de shows en el mapa usando Supercluster
 * Solo agrupa markers cuando hay muchos shows juntos en zoom bajo
 */
export const useMapClustering = (
    shows: Show[],
    zoom: number,
    bounds?: [number, number, number, number]
) => {
    const supercluster = useMemo(() => {
        const cluster = new Supercluster<Show>({
            radius: 60, // Cluster radius in pixels
            maxZoom: 16, // Max zoom to cluster points on
            minZoom: 0,
            minPoints: 2, // Minimum points to form a cluster
        });

        // Convert shows to GeoJSON features
        const points: PointFeature<Show>[] = shows
            .filter(show => show.lng && show.lat)
            .map((show) => ({
                type: 'Feature' as const,
                properties: show,
                geometry: {
                    type: 'Point' as const,
                    coordinates: [show.lng, show.lat],
                },
            }));

        cluster.load(points);
        return cluster;
    }, [shows]);

    const clusters = useMemo(() => {
        if (!bounds) return [];

        // Get clusters for current viewport
        const clusters = supercluster.getClusters(bounds, Math.floor(zoom));

        return clusters;
    }, [supercluster, bounds, zoom]);

    const getClusterLeaves = (clusterId: number, limit = 10) => {
        return supercluster.getLeaves(clusterId, limit);
    };

    const getClusterExpansionZoom = (clusterId: number) => {
        return supercluster.getClusterExpansionZoom(clusterId);
    };

    return {
        clusters,
        getClusterLeaves,
        getClusterExpansionZoom,
    };
};
